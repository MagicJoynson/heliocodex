import * as THREE from 'three';

/**
 * A single scroll-driven descent: orbit -> atmosphere -> the ground.
 * progress 0 = high orbit above Mars, 1 = standing on the surface.
 * Two scenes share one canvas and are joined by a dust-coloured haze.
 */

// ---- tiny value-noise toolkit -------------------------------------------
function hash(x: number, y: number) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, oct = 5) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; }
  return s;
}

const HORIZON = new THREE.Color('#d99d74');

function groundTexture(): THREE.CanvasTexture {
  // Cracked, plated ground: Voronoi cell edges over mottled rust, like the bedrock in the rover photos.
  const N = 512;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  const img = g.createImageData(N, N);
  const pts: [number, number][] = [];
  for (let i = 0; i < 150; i++) pts.push([Math.random() * N, Math.random() * N]);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let d1 = 1e9, d2 = 1e9, id = 0;
      for (let k = 0; k < pts.length; k++) {
        for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
          const dx = x - pts[k][0] - ox, dy = y - pts[k][1] - oy;
          const d = dx * dx + dy * dy;
          if (d < d1) { d2 = d1; d1 = d; id = k; } else if (d < d2) d2 = d;
        }
      }
      const edge = Math.sqrt(d2) - Math.sqrt(d1);
      const crack = Math.min(1, edge / 3);
      const tone = 0.62 + 0.3 * hash(id, 7) + 0.22 * (fbm(x / 40, y / 40, 3) - 0.5);
      const i4 = (y * N + x) * 4;
      const base = [168, 98, 62];
      const speck = 0.9 + 0.2 * hash(x, y);
      const k = tone * (0.55 + 0.45 * crack) * speck;
      img.data[i4] = base[0] * k;
      img.data[i4 + 1] = base[1] * k;
      img.data[i4 + 2] = base[2] * k;
      img.data[i4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function terrainHeight(x: number, z: number) {
  // gentle basin floor, low swells, a far mesa
  const swell = (fbm(x * 0.006 + 10, z * 0.006 + 4, 4) - 0.5) * 22;
  const ripples = (fbm(x * 0.07, z * 0.07, 3) - 0.5) * 1.4;
  const mesa = 1 / (1 + Math.pow(Math.hypot((x + 90) / 150, (z + 520) / 70), 4)) * 95;
  const mesa2 = 1 / (1 + Math.pow(Math.hypot((x - 260) / 90, (z + 380) / 50), 4)) * 40;
  // keep the area right under the camera calm
  const calm = Math.min(1, Math.hypot(x, z) / 40);
  return (swell + ripples) * (0.25 + 0.75 * calm) + mesa + mesa2;
}

function rockGeometry(seed: number) {
  const g = new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const s = 0.7 + 0.5 * hash(Math.floor(p.getX(i) * 40) + seed, Math.floor(p.getZ(i) * 40) + seed * 3);
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s * 0.7, p.getZ(i) * s);
  }
  g.computeVertexNormals();
  return g;
}

function softDot() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function potato(radius: number, seed: number, color: number) {
  const g = new THREE.IcosahedronGeometry(radius, 3);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = 0.78 + 0.45 * fbm(v.x * 2.2 / radius + seed, v.z * 2.2 / radius + v.y * 1.3 / radius, 3);
    v.multiplyScalar(n);
    v.x *= 1.25; v.y *= 0.85; // Phobos-ish: longer than it is wide
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1 }));
}

export interface Journey {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  altitudeKm(): number;
}

export function createMarsJourney(canvas: HTMLCanvasElement, haze: HTMLElement): Journey {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = new THREE.TextureLoader();
  const tex = (f: string) => { const t = loader.load(`/textures/${f}`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  // =====================================================================
  // Scene A: the planet from orbit
  // =====================================================================
  const A = new THREE.Scene();
  const camA = new THREE.PerspectiveCamera(38, 1, 0.0005, 200);
  const stars = new THREE.Mesh(
    new THREE.SphereGeometry(100, 40, 28),
    new THREE.MeshBasicMaterial({ map: tex('2k_stars_milky_way.jpg'), side: THREE.BackSide, color: 0x5a5148, depthWrite: false }),
  );
  A.add(stars);
  const marsMap = tex('2k_mars.jpg');
  const mars = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.MeshStandardMaterial({ map: marsMap, roughness: 1 }));
  A.add(mars);
  // thin atmosphere: a rim that is brightest where you look across the most air
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(1.028, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
      uniforms: { sunDir: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() } },
      vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vP; uniform vec3 sunDir;
        void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(-vP))),3.2);
          vec3 col=mix(vec3(.95,.62,.4),vec3(.55,.68,.9),pow(f,2.));
          gl_FragColor=vec4(col*f*.9,f*.8); }`,
    }),
  );
  A.add(rim);
  const sunA = new THREE.DirectionalLight(0xfff0dd, 3.4);
  sunA.position.set(6, 2, 4);
  A.add(sunA, new THREE.AmbientLight(0x1a1210, 0.7));

  const phobos = potato(0.05, 3, 0x7d7068);
  const deimos = potato(0.034, 9, 0x8a7d72);
  A.add(phobos, deimos);

  // descent target: near Gale Crater (about 5 degrees S, 138 degrees E)
  const lat = (-5.4 * Math.PI) / 180, lon = (137.8 * Math.PI) / 180;
  const target = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
  const startDir = target.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 1.2).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.26).normalize();

  // =====================================================================
  // Scene B: the ground
  // =====================================================================
  const B = new THREE.Scene();
  B.fog = new THREE.Fog(HORIZON, 6, 700);
  const camB = new THREE.PerspectiveCamera(58, 1, 0.1, 2000);

  const sunDir = new THREE.Vector3(0.5, 0.1, -0.86).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1200, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { sunDir: { value: sunDir } },
      vertexShader: `varying vec3 vDir; void main(){ vDir=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec3 vDir; uniform vec3 sunDir;
        void main(){
          vec3 d=normalize(vDir); float h=clamp(d.y,0.,1.);
          vec3 horizon=vec3(.851,.616,.455); vec3 zenith=vec3(.30,.19,.15);
          vec3 col=mix(horizon,zenith,pow(h,.5));
          float s=max(dot(d,sunDir),0.);
          col=mix(col,vec3(.42,.56,.80),pow(s,48.)*.62);          // the blue halo around the setting sun
          col+=vec3(1.,.72,.5)*pow(s,6.)*.22;
          col=mix(col,vec3(1.,.96,.88),smoothstep(.99992,.99997,s)); // sun disc
          col*=1.-.25*smoothstep(0.,-.4,d.y);
          gl_FragColor=vec4(col,1.);
        }`,
    }),
  );
  B.add(sky);

  const SEG = innerWidth < 700 ? 150 : 230;
  const size = 1600;
  const tGeo = new THREE.PlaneGeometry(size, size, SEG, SEG);
  tGeo.rotateX(-Math.PI / 2);
  {
    const p = tGeo.attributes.position;
    const uv = tGeo.attributes.uv;
    const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const h = terrainHeight(x, z);
      p.setY(i, h);
      uv.setXY(i, x / 16, z / 16);
      const t = Math.min(1, Math.max(0, (h + 8) / 40));
      const m = 0.8 + 0.4 * fbm(x * 0.02, z * 0.02, 3);
      col[i * 3] = (0.7 + 0.3 * t) * m;
      col[i * 3 + 1] = (0.62 + 0.28 * t) * m;
      col[i * 3 + 2] = (0.58 + 0.2 * t) * m;
    }
    tGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    tGeo.computeVertexNormals();
  }
  const ground = new THREE.Mesh(tGeo, new THREE.MeshStandardMaterial({ map: groundTexture(), vertexColors: true, roughness: 1 }));
  B.add(ground);

  // rocks near the camera give the eye something to measure distance against
  const rocks = new THREE.InstancedMesh(rockGeometry(2), new THREE.MeshStandardMaterial({ color: 0x6b4332, roughness: 1 }), 420);
  {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3(), e = new THREE.Euler();
    for (let i = 0; i < 420; i++) {
      const r = 3 + Math.pow(Math.random(), 1.6) * 110;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r - 25;
      const sc = (0.06 + Math.pow(Math.random(), 3) * 1.1) * (0.6 + r / 90);
      pos.set(x, terrainHeight(x, z) + sc * 0.15, z);
      e.set(Math.random() * 0.4, Math.random() * 6.3, Math.random() * 0.4);
      q.setFromEuler(e);
      s.set(sc * (0.8 + Math.random() * 0.8), sc * 0.7, sc * (0.8 + Math.random() * 0.8));
      m.compose(pos, q, s);
      rocks.setMatrixAt(i, m);
    }
  }
  B.add(rocks);

  const sunB = new THREE.DirectionalLight(0xffd4a4, 3.2);
  sunB.position.copy(sunDir).multiplyScalar(100);
  B.add(sunB, new THREE.HemisphereLight(0xc9946f, 0x2b1a14, 1.1));

  // Phobos, seen from the ground: far smaller than the Sun, crossing west to east
  const phobosSky = potato(2.1, 5, 0x6d625b);
  B.add(phobosSky);

  // drifting dust
  const DUST = 520;
  const dustGeo = new THREE.BufferGeometry();
  const dpos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { dpos[i * 3] = (Math.random() - 0.5) * 90; dpos[i * 3 + 1] = Math.random() * 16; dpos[i * 3 + 2] = (Math.random() - 0.5) * 90; }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: softDot(), color: 0xe9bf9a, size: 0.55, transparent: true, opacity: 0.28, depthWrite: false }));
  B.add(dust);

  // =====================================================================
  // driver
  // =====================================================================
  let progress = 0, shown = -1;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let altKm = 7500;

  const S_ORBIT_END = 0.58; // progress at which the globe hands over to the ground
  const ease = (t: number) => t * t * (3 - 2 * t);
  const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    for (const c of [camA, camB]) { c.aspect = w / h; c.updateProjectionMatrix(); }
  }
  addEventListener('resize', resize);
  resize();

  // orbit basis chosen so the moons sweep across the opening view
  const mRight = new THREE.Vector3().crossVectors(up0(), startDir).normalize();
  const mFwd = startDir.clone();
  const mUp = new THREE.Vector3().crossVectors(mFwd, mRight).normalize();
  function moonPos(a: number, r: number) {
    return mRight.clone().multiplyScalar(Math.cos(a) * r).add(mFwd.clone().multiplyScalar(Math.sin(a) * r * 0.97)).add(mUp.clone().multiplyScalar(Math.sin(a) * r * 0.1));
  }
  function up0() { return new THREE.Vector3(0, 1, 0); }
  const tmpDir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let clock = performance.now();
  let tSim = 0;

  function frame(now: number) {
    const dt = Math.min((now - clock) / 1000, 0.1);
    clock = now;
    if (!reduce) tSim += dt;
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;

    const p = progress;
    if (p < S_ORBIT_END + 0.04) {
      // ---- orbit and descent ------------------------------------------------
      const d = clamp01(p / S_ORBIT_END);
      const e = ease(d);
      // altitude above the surface in planet radii: falls steeply, then flattens
      const h = 2.6 * Math.pow(1 - e, 2.6) + 0.012 * (1 - e) + 0.0004;
      altKm = h * 3396.2;
      tmpDir.copy(startDir).lerp(target, Math.pow(e, 0.8)).normalize();
      camA.position.copy(tmpDir).multiplyScalar(1 + h);
      camA.up.copy(up);
      camA.lookAt(0, 0, 0);
      // keep the sunlit side facing us so the descent is always readable
      sunA.position.copy(camA.position).normalize().applyAxisAngle(up, 0.75).multiplyScalar(10);
      sunA.position.y += 3;
      // slowly turn the whole planet while we hang in orbit
      mars.rotation.y = tSim * 0.01;
      rim.rotation.y = mars.rotation.y;
      // moons: real orbital radii (in Mars radii), exaggerated size
      const ph = 0.55 + tSim * 0.22;
      phobos.position.copy(moonPos(ph, 2.76));
      phobos.rotation.y = ph;
      const dm = 2.6 + tSim * 0.06;
      deimos.position.copy(moonPos(dm, 6.9));
      renderer.render(A, camA);
    }
    // ---- haze handover ----------------------------------------------------
    const hz = p < S_ORBIT_END ? ease(clamp01((p - 0.44) / 0.14)) : 1 - ease(clamp01((p - S_ORBIT_END) / 0.1));
    haze.style.opacity = String(hz * 0.96);

    if (p >= S_ORBIT_END) {
      const g = clamp01((p - S_ORBIT_END) / (1 - S_ORBIT_END));
      altKm = 0.0017;
      const travel = g * 46;
      camB.position.set(0, terrainHeight(0, -travel) + 1.7, -travel);
      camB.rotation.order = 'YXZ';
      camB.rotation.y = -pointer.sx * 0.12 + 0.12 * (1 - g);
      camB.rotation.x = pointer.sy * 0.05 - 0.02 + 0.1 * (1 - g);
      // Phobos crosses from west (left) to east (right) as you stay on the ground
      const a = (reduce ? 0.35 : 0.2 + 0.6 * g) * Math.PI;
      phobosSky.position.set(-Math.cos(a) * 420, Math.sin(a) * 300 + 40, -330).add(camB.position);
      phobosSky.rotation.y = tSim * 0.2;
      // dust drifting on the wind, wrapping around the camera
      const dp = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DUST; i++) {
        let x = dp.getX(i) + dt * 1.6, y = dp.getY(i) + Math.sin(tSim + i) * dt * 0.1, z = dp.getZ(i) + dt * 0.3;
        if (reduce) { x = dp.getX(i); z = dp.getZ(i); }
        if (x > 45) x -= 90;
        if (z > 45) z -= 90;
        dp.setXYZ(i, x, y, z);
      }
      dp.needsUpdate = true;
      dust.position.copy(camB.position);
      sky.position.copy(camB.position);
      renderer.render(B, camB);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    setProgress(p: number) { progress = p; },
    setPointer(x: number, y: number) { pointer.x = x; pointer.y = y; },
    altitudeKm: () => altKm,
  };
}
