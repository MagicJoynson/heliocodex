import * as THREE from 'three';
import { fbm, hash, potato, rockGeometry, softDot } from './noise';
import type { LowerScene } from './types';

export interface GroundParams {
  horizon: string;
  zenith: string;
  halo?: { color: [number, number, number]; power: number; amount: number };
  sunDir: [number, number, number];
  sunDisc: boolean;
  sunColor: number;
  sunIntensity: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  texRGB: [number, number, number];
  tint: [number, number, number];
  rockColor: number;
  relief: number;
  mesa: number;
  crackCells: number;
  crackSoft: number;
  texScale: number;
  dust: { color: number; opacity: number; size: number; count: number };
  moonInSky: boolean;
  eyeHeight: number;
  travel: number;
  readout: (g: number) => string;
}

function groundTexture(p: GroundParams): THREE.CanvasTexture {
  const N = 512;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  const img = g.createImageData(N, N);
  const pts: [number, number][] = [];
  for (let i = 0; i < p.crackCells; i++) pts.push([Math.random() * N, Math.random() * N]);
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
      const crack = Math.min(1, edge / p.crackSoft);
      const tone = 0.62 + 0.3 * hash(id, 7) + 0.22 * (fbm(x / 40, y / 40, 3) - 0.5);
      const i4 = (y * N + x) * 4;
      const speck = 0.9 + 0.2 * hash(x, y);
      const k = tone * (0.55 + 0.45 * crack) * speck;
      img.data[i4] = p.texRGB[0] * k;
      img.data[i4 + 1] = p.texRGB[1] * k;
      img.data[i4 + 2] = p.texRGB[2] * k;
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

export function createGround(p: GroundParams): LowerScene {
  const scene = new THREE.Scene();
  const fogCol = new THREE.Color(p.fogColor);
  scene.fog = new THREE.Fog(fogCol, p.fogNear, p.fogFar);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 2000);
  const sunDir = new THREE.Vector3(...p.sunDir).normalize();

  const height = (x: number, z: number) => {
    const swell = (fbm(x * 0.006 + 10, z * 0.006 + 4, 4) - 0.5) * 22 * p.relief;
    const ripples = (fbm(x * 0.07, z * 0.07, 3) - 0.5) * 1.4 * p.relief;
    const mesa = 1 / (1 + Math.pow(Math.hypot((x + 90) / 150, (z + 520) / 70), 4)) * 95 * p.mesa;
    const mesa2 = 1 / (1 + Math.pow(Math.hypot((x - 260) / 90, (z + 380) / 50), 4)) * 40 * p.mesa;
    const calm = Math.min(1, Math.hypot(x, z) / 40);
    return (swell + ripples) * (0.25 + 0.75 * calm) + mesa + mesa2;
  };

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1200, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        sunDir: { value: sunDir },
        horizon: { value: new THREE.Color(p.horizon) },
        zenith: { value: new THREE.Color(p.zenith) },
        halo: { value: new THREE.Vector4(...(p.halo?.color ?? [0, 0, 0]), p.halo?.amount ?? 0) },
        haloPow: { value: p.halo?.power ?? 48 },
        disc: { value: p.sunDisc ? 1 : 0 },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec3 vDir; uniform vec3 sunDir; uniform vec3 horizon; uniform vec3 zenith; uniform vec4 halo; uniform float haloPow; uniform float disc;
        void main(){
          vec3 d=normalize(vDir); float h=clamp(d.y,0.,1.);
          vec3 col=mix(horizon,zenith,pow(h,.5));
          float s=max(dot(d,sunDir),0.);
          col=mix(col,halo.rgb,pow(s,haloPow)*halo.a);
          col+=vec3(1.,.72,.5)*pow(s,6.)*.22*disc;
          col=mix(col,vec3(1.,.96,.88),smoothstep(.99992,.99997,s)*disc);
          col*=1.-.25*smoothstep(0.,-.4,d.y);
          gl_FragColor=vec4(col,1.);
        }`,
    }),
  );
  scene.add(sky);

  const SEG = innerWidth < 700 ? 150 : 230;
  const size = 1600;
  const geo = new THREE.PlaneGeometry(size, size, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  {
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = height(x, z);
      pos.setY(i, h);
      uv.setXY(i, x / p.texScale, z / p.texScale);
      const t = Math.min(1, Math.max(0, (h + 8) / 40));
      const m = 0.8 + 0.4 * fbm(x * 0.02, z * 0.02, 3);
      col[i * 3] = (p.tint[0] + 0.3 * t) * m;
      col[i * 3 + 1] = (p.tint[1] + 0.28 * t) * m;
      col[i * 3 + 2] = (p.tint[2] + 0.2 * t) * m;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
  }
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: groundTexture(p), vertexColors: true, roughness: 1 })));

  const N = 420;
  const rocks = new THREE.InstancedMesh(rockGeometry(2), new THREE.MeshStandardMaterial({ color: p.rockColor, roughness: 1 }), N);
  {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3(), e = new THREE.Euler();
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.pow(Math.random(), 1.6) * 110;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r - 25;
      const sc = (0.06 + Math.pow(Math.random(), 3) * 1.1) * (0.6 + r / 90);
      pos.set(x, height(x, z) + sc * 0.15, z);
      e.set(Math.random() * 0.4, Math.random() * 6.3, Math.random() * 0.4);
      q.setFromEuler(e);
      s.set(sc * (0.8 + Math.random() * 0.8), sc * 0.7, sc * (0.8 + Math.random() * 0.8));
      m.compose(pos, q, s);
      rocks.setMatrixAt(i, m);
    }
  }
  scene.add(rocks);

  const sunL = new THREE.DirectionalLight(p.sunColor, p.sunIntensity);
  sunL.position.copy(sunDir).multiplyScalar(100);
  scene.add(sunL, new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemiIntensity));

  const moon = p.moonInSky ? potato(2.1, 5, 0x6d625b) : null;
  if (moon) scene.add(moon);

  const dGeo = new THREE.BufferGeometry();
  const dpos = new Float32Array(p.dust.count * 3);
  for (let i = 0; i < p.dust.count; i++) { dpos[i * 3] = (Math.random() - 0.5) * 90; dpos[i * 3 + 1] = Math.random() * 16; dpos[i * 3 + 2] = (Math.random() - 0.5) * 90; }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ map: softDot(), color: p.dust.color, size: p.dust.size, transparent: true, opacity: p.dust.opacity, depthWrite: false }));
  scene.add(dust);

  return {
    scene, camera,
    update(g, dt, t, pointer, reduce) {
      const travel = g * p.travel;
      camera.position.set(0, height(0, -travel) + p.eyeHeight, -travel);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = -pointer.sx * 0.12 + 0.12 * (1 - g);
      camera.rotation.x = pointer.sy * 0.05 - 0.02 + 0.1 * (1 - g);
      if (moon) {
        const a = (reduce ? 0.35 : 0.2 + 0.6 * g) * Math.PI;
        moon.position.set(-Math.cos(a) * 420, Math.sin(a) * 300 + 40, -330).add(camera.position);
        moon.rotation.y = t * 0.2;
      }
      const dp = dGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.dust.count; i++) {
        let x = dp.getX(i), y = dp.getY(i), z = dp.getZ(i);
        if (!reduce) { x += dt * 1.6; z += dt * 0.3; y += Math.sin(t + i) * dt * 0.1; }
        if (x > 45) x -= 90;
        if (z > 45) z -= 90;
        dp.setXYZ(i, x, y, z);
      }
      dp.needsUpdate = true;
      dust.position.copy(camera.position);
      sky.position.copy(camera.position);
    },
    readout: p.readout,
  };
}
