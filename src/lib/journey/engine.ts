import * as THREE from 'three';
import { clamp01, ease, potato } from './noise';
import { createPlanet } from './planet';
import { createStars } from './stars';
import type { World, Pointer } from './types';

/**
 * Scroll-driven descent: orbit -> low altitude -> a short haze -> the lower scene.
 * progress 0 = high orbit, 1 = bottom of the page.
 *
 * The Sun is fixed in space. The landing site is chosen near the terminator so that, as you fall,
 * you also travel from full daylight into the low light the lower scene is set in. On the way
 * down the camera turns from looking straight at the planet to looking along the horizon, in the
 * direction the lower scene faces, so the handover is a short blink rather than a cut.
 */
export interface Journey {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  readout(): string;
}

export const HANDOVER = 0.5;
/** for a world with `wide`: the share of the descent spent pulling back, and where the fall begins */
const WIDE_OUT = 0.24, WIDE_HOLD = 0.44;

export function createJourney(canvas: HTMLCanvasElement, haze: HTMLElement, world: World): Journey {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
  const small = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 2 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const o = world.orbit;
  haze.style.background = world.hazeCss;

  // ---- orbit scene --------------------------------------------------------
  const A = new THREE.Scene();
  const camA = new THREE.PerspectiveCamera(38, 1, 0.0005, 600);
  const stars = createStars();
  A.add(stars.group);
  const planet = createPlanet(o.look, renderer.capabilities.maxTextureSize, !small);
  A.add(planet.group, planet.sky);
  const sunLight = new THREE.DirectionalLight(0xfff4e8, 3.2);
  A.add(sunLight, new THREE.AmbientLight(0x22201c, 0.5));

  const up = new THREE.Vector3(0, 1, 0);
  const lat = THREE.MathUtils.degToRad(o.target.lat), lon = THREE.MathUtils.degToRad(o.target.lon);
  const target = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
  const startDir = target.clone().applyAxisAngle(up, o.startYaw).applyAxisAngle(new THREE.Vector3(1, 0, 0), o.startTilt).normalize();

  // local frame at the landing site
  const travel = startDir.clone().addScaledVector(target, -startDir.dot(target)).negate().normalize(); // direction of travel at the end
  const east = new THREE.Vector3().crossVectors(travel, target).normalize();

  // the Sun: o.landing.sunElev above the landing horizon, sitting o.landing.sunYaw to the right of where we end up facing
  const L = o.landing;
  const faceDir = L.faceSouth
    ? new THREE.Vector3(0, -1, 0).addScaledVector(target, target.y).normalize()
    : travel.clone().applyAxisAngle(target, THREE.MathUtils.degToRad(L.faceYaw)).normalize();
  const faceRight = new THREE.Vector3().crossVectors(faceDir, target).normalize();
  const el = THREE.MathUtils.degToRad(L.sunElev), az = THREE.MathUtils.degToRad(L.sunYaw);
  const sunDir = L.sun ? new THREE.Vector3(...L.sun).normalize() : new THREE.Vector3()
    .addScaledVector(faceDir, Math.cos(el) * Math.cos(az))
    .addScaledVector(faceRight, Math.cos(el) * Math.sin(az))
    .addScaledVector(target, Math.sin(el))
    .normalize();
  planet.setSun(sunDir);
  sunLight.position.copy(sunDir).multiplyScalar(20);
  void east;

  // moons, drawn on a plane that keeps them in shot from the start view
  const mRight = new THREE.Vector3().crossVectors(up, startDir).normalize();
  const mUp = new THREE.Vector3().crossVectors(startDir, mRight).normalize();
  // seen from a little above the plane; a world with `wide` is seen from higher so its orbits read as rings
  const mTilt = o.wide ? 0.26 : 0.1, mDepth = Math.sqrt(1 - mTilt * mTilt);
  const moons = o.moons.map((m) => {
    const mesh = potato(m.size, m.seed, m.color);
    A.add(mesh);
    // a faint ring along the orbit, shown only while the camera is pulled back far enough to see it whole
    let ring: THREE.LineLoop | null = null;
    if (o.wide) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 160; i++) pts.push(moonPos((i / 160) * Math.PI * 2, m.orbitR, new THREE.Vector3()));
      ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xd8d2c4, transparent: true, opacity: 0, depthWrite: false }));
      A.add(ring);
    }
    return { m, mesh, ring };
  });
  function moonPos(a: number, r: number, out: THREE.Vector3) {
    return out.copy(mRight).multiplyScalar(Math.cos(a) * r).addScaledVector(startDir, Math.sin(a) * r * mDepth).addScaledVector(mUp, Math.sin(a) * r * mTilt);
  }

  // ---- lower scene --------------------------------------------------------
  const lower = world.buildLower();
  const lowerFov = lower.camera.fov;

  // ---- driver -------------------------------------------------------------
  let progress = 0;
  const pointer: Pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let text = '';

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    for (const c of [camA, lower.camera]) { c.aspect = w / h; }
    // on a tall phone screen the lower scene would be a narrow slot; open it up so at least ~36 degrees fit across
    const minH = THREE.MathUtils.degToRad(36);
    const need = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(minH / 2) / (w / h)));
    lower.camera.fov = Math.min(Math.max(lowerFov, need), 72);
    for (const c of [camA, lower.camera]) c.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  const pos = new THREE.Vector3(), dir = new THREE.Vector3(), fwd = new THREE.Vector3(), look = new THREE.Vector3(), q = new THREE.Quaternion();
  const endAlt = o.handoverAlt;
  let clock = performance.now(), tSim = 0;
  function frame(now: number) {
    const dt = Math.min((now - clock) / 1000, 0.1);
    clock = now;
    if (!reduce) tSim += dt;
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    const p = progress;

    if (p < HANDOVER + 0.03) {
      const e0 = clamp01(p / HANDOVER);
      let e = e0, h: number;
      if (o.wide) {
        // pull back until the widest orbit fits across the screen (with a margin), hold there, then fall
        const half = Math.atan(Math.tan(THREE.MathUtils.degToRad(camA.fov / 2)) * camA.aspect);
        const wideAlt = Math.max(o.startAltRadii, (o.wide.fit * 1.15) / Math.tan(half));
        if (e0 < WIDE_HOLD) {
          e = 0;
          h = o.startAltRadii * Math.pow(wideAlt / o.startAltRadii, ease(clamp01(e0 / WIDE_OUT)));
        } else {
          e = (e0 - WIDE_HOLD) / (1 - WIDE_HOLD);
          h = endAlt * Math.pow(wideAlt / endAlt, Math.pow(1 - ease(e), 1.15));
        }
      } else {
        // altitude falls off exponentially so each stretch of scroll covers a similar change in view
        h = endAlt * Math.pow(o.startAltRadii / endAlt, Math.pow(1 - ease(e), 1.15));
      }
      text = fmtAlt(h * o.radiusKm);
      // ground track: most of the sideways travel happens high up
      const k = 1 - Math.pow(1 - ease(Math.min(1, e * 1.08)), 2.2);
      dir.copy(startDir).lerp(target, k).normalize();
      // the surface radius under us (a squashed globe is lower towards the poles)
      const fl = 1 - (o.look.flattening ?? 0);
      const rs = 1 / Math.sqrt(dir.x * dir.x + dir.z * dir.z + (dir.y / fl) * (dir.y / fl));
      pos.copy(dir).multiplyScalar(rs + h);
      camA.position.copy(pos);
      camA.near = Math.max(h * 0.25, 1e-6);
      camA.far = 600;
      camA.updateProjectionMatrix();

      // where to look: the planet's centre, turning to the horizon as we get low
      const dip = Math.acos(1 / (1 + h));
      const pitch = THREE.MathUtils.lerp(Math.PI / 2, dip + THREE.MathUtils.degToRad(L.pitch), ease(clamp01((e - 0.5) / 0.5)));
      // facing: blend travel direction into the final facing direction
      q.setFromUnitVectors(target, dir);
      fwd.copy(faceDir).applyQuaternion(q);
      fwd.addScaledVector(dir, -fwd.dot(dir)).normalize();
      look.copy(fwd).multiplyScalar(Math.cos(pitch)).addScaledVector(dir, -Math.sin(pitch));
      const toCentre = dir.clone().negate();
      const w = ease(clamp01((e - 0.45) / 0.35));
      look.lerp(toCentre, 1 - w).normalize();
      camA.up.copy(w > 0.01 ? dir : up);
      camA.lookAt(pos.clone().add(look));
      // a little parallax from the pointer
      camA.rotateY(-pointer.sx * 0.02);
      camA.rotateX(-pointer.sy * 0.015);
      // on a tall phone screen the words fill the top half, so while pulled back, tip the view up and the moons sit below them
      if (o.wide && camA.aspect < 1) camA.rotateX(clamp01((h - 6) / 10) * Math.atan(Math.tan(THREE.MathUtils.degToRad(camA.fov / 2)) * 0.6));

      stars.group.position.copy(pos);
      stars.setFade(o.look.airDensity <= 0 ? 1 : 1 - clamp01((o.look.skyTop - h) / (o.look.skyTop * 0.6)) * (o.look.airDensity > 0.6 ? 1 : 0.6));
      planet.update(camA, h, tSim);
      // far out, the moons are drawn larger than life so they stay visible (the page says their sizes are not to scale)
      const grow = o.wide ? Math.min(7, Math.max(1, h / 12)) : 1;
      const ringOn = o.wide ? 0.32 * clamp01((h - 6) / 10) : 0;
      for (const { m, mesh, ring } of moons) {
        const a = m.phase + tSim * m.speed;
        moonPos(a, m.orbitR, mesh.position);
        mesh.rotation.y = a;
        mesh.scale.setScalar(grow);
        if (ring) { (ring.material as THREE.LineBasicMaterial).opacity = ringOn; ring.visible = ringOn > 0.005; }
      }
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.shadowMap.enabled = false;
      renderer.render(A, camA);
    }
    const hz = p < HANDOVER ? ease(clamp01((p - (HANDOVER - 0.035)) / 0.035)) : 1 - ease(clamp01((p - HANDOVER) / 0.05));
    haze.style.opacity = String(hz);

    if (p >= HANDOVER) {
      const g = clamp01((p - HANDOVER) / (1 - HANDOVER));
      lower.update(g, dt, tSim, pointer, reduce);
      text = lower.readout(g);
      renderer.toneMapping = lower.toneMapping ?? THREE.NoToneMapping;
      renderer.toneMappingExposure = lower.exposure ?? 1;
      renderer.shadowMap.enabled = !!lower.shadows;
      renderer.render(lower.scene, lower.camera);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    setProgress(p) { progress = p; },
    setPointer(x, y) { pointer.x = x; pointer.y = y; },
    readout: () => text,
  };
}

function fmtAlt(km: number) {
  if (km >= 1000) return `${Math.round(km).toLocaleString('en-GB')} km`;
  if (km >= 1) return `${km.toFixed(km >= 100 ? 0 : 1)} km`;
  return `${Math.max(1, km * 1000).toFixed(0)} m`;
}
