import * as THREE from 'three';
import { clamp01, ease, potato } from './noise';
import type { World, Pointer } from './types';

/**
 * Scroll-driven descent: orbit -> haze -> the lower scene.
 * progress 0 = high orbit, 1 = bottom of the page.
 */
export interface Journey {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  readout(): string;
}

export const HANDOVER = 0.58;

export function createJourney(canvas: HTMLCanvasElement, haze: HTMLElement, world: World): Journey {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = new THREE.TextureLoader();
  const tex = (f: string) => { const t = loader.load(`/textures/${f}`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const o = world.orbit;
  haze.style.background = world.hazeCss;

  // ---- orbit scene --------------------------------------------------------
  const A = new THREE.Scene();
  const camA = new THREE.PerspectiveCamera(38, 1, 0.0005, 400);
  A.add(new THREE.Mesh(
    new THREE.SphereGeometry(200, 40, 28),
    new THREE.MeshBasicMaterial({ map: tex('2k_stars_milky_way.jpg'), side: THREE.BackSide, color: 0x5a5148, depthWrite: false }),
  ));
  const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.MeshStandardMaterial({ map: tex(o.texture), roughness: 1 }));
  A.add(planet);
  if (o.cloudTexture) {
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 96, 64),
      new THREE.MeshStandardMaterial({ map: tex(o.cloudTexture), transparent: true, opacity: 0.6, depthWrite: false }),
    );
    clouds.name = 'clouds';
    A.add(clouds);
  }
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(1.028, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { c1: { value: new THREE.Vector3(...o.rim) }, c2: { value: new THREE.Vector3(...o.rimOuter) } },
      vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vP; uniform vec3 c1; uniform vec3 c2;
        void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(-vP))),3.2);
          vec3 col=mix(c1,c2,pow(f,2.)); gl_FragColor=vec4(col*f*.9,f*.8); }`,
    }),
  );
  A.add(rim);
  const sun = new THREE.DirectionalLight(0xfff0dd, 3.4);
  A.add(sun, new THREE.AmbientLight(0x1a1210, 0.7));

  const up = new THREE.Vector3(0, 1, 0);
  const lat = (o.target.lat * Math.PI) / 180, lon = (o.target.lon * Math.PI) / 180;
  const target = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
  const startDir = target.clone().applyAxisAngle(up, o.startYaw).applyAxisAngle(new THREE.Vector3(1, 0, 0), o.startTilt).normalize();
  const mRight = new THREE.Vector3().crossVectors(up, startDir).normalize();
  const mUp = new THREE.Vector3().crossVectors(startDir, mRight).normalize();
  const moons = o.moons.map((m) => {
    const mesh = potato(m.size, m.seed, m.color);
    A.add(mesh);
    return { m, mesh };
  });
  function moonPos(a: number, r: number, out: THREE.Vector3) {
    return out.copy(mRight).multiplyScalar(Math.cos(a) * r).addScaledVector(startDir, Math.sin(a) * r * 0.97).addScaledVector(mUp, Math.sin(a) * r * 0.1);
  }

  // ---- lower scene --------------------------------------------------------
  const lower = world.buildLower();

  // ---- driver -------------------------------------------------------------
  let progress = 0;
  const pointer: Pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let text = '';

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    for (const c of [camA, lower.camera]) { c.aspect = w / h; c.updateProjectionMatrix(); }
  }
  addEventListener('resize', resize);
  resize();

  const tmp = new THREE.Vector3();
  let clock = performance.now(), tSim = 0;
  function frame(now: number) {
    const dt = Math.min((now - clock) / 1000, 0.1);
    clock = now;
    if (!reduce) tSim += dt;
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    const p = progress;

    if (p < HANDOVER + 0.04) {
      const e = ease(clamp01(p / HANDOVER));
      const h = o.startAltRadii * Math.pow(1 - e, 2.6) + 0.012 * (1 - e) + 0.0004;
      text = fmtAlt(h * o.radiusKm);
      tmp.copy(startDir).lerp(target, Math.pow(e, 0.8)).normalize();
      camA.position.copy(tmp).multiplyScalar(1 + h);
      camA.up.copy(up);
      camA.lookAt(0, 0, 0);
      sun.position.copy(camA.position).normalize().applyAxisAngle(up, o.lightYaw).multiplyScalar(10);
      sun.position.y += 3;
      planet.rotation.y = tSim * o.spin;
      rim.rotation.y = planet.rotation.y;
      const cl = A.getObjectByName('clouds');
      if (cl) cl.rotation.y = tSim * o.spin * 1.6;
      for (const { m, mesh } of moons) {
        const a = m.phase + tSim * m.speed;
        moonPos(a, m.orbitR, mesh.position);
        mesh.rotation.y = a;
      }
      renderer.render(A, camA);
    }
    const hz = p < HANDOVER ? ease(clamp01((p - 0.44) / 0.14)) : 1 - ease(clamp01((p - HANDOVER) / 0.1));
    haze.style.opacity = String(hz * 0.96);

    if (p >= HANDOVER) {
      const g = clamp01((p - HANDOVER) / (1 - HANDOVER));
      lower.update(g, dt, tSim, pointer, reduce);
      text = lower.readout(g);
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
