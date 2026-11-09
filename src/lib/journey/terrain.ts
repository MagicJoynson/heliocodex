import * as THREE from 'three';
import { hash } from './noise';
import { SIMPLEX3 } from './shaders';
import type { LowerScene } from './types';

/**
 * Standing on a rocky world. One terrain mesh on a radial grid (fine at your feet, coarse at the
 * horizon, out to ~100 km so the curve of the planet shows), distant landforms built into the same
 * height function, real shadows from a low sun, rocks and pebbles, and a sky with the right glow.
 *
 * Distances are in metres.
 */
export interface TerrainParams {
  planetRadiusM: number;
  /** sky */
  sky: { zenith: string; horizon: string; aureole: string; aureoleSize: number; aureoleAmount: number; sunDisc: number; groundGlow: string; toward?: number };
  sunDir: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  skyLight: string;
  groundLight: string;
  ambient: number;
  /** aerial perspective: colour of distant terrain and how fast it fades */
  haze: string;
  hazeDensity: number;
  /** ground colours */
  dust: string;
  gravel: string;
  bedrock: string;
  /** 0..1 how much flat, cracked bedrock shows through */
  slabs: number;
  rock: string;
  rocks: number;
  pebbles: number;
  /** squash rocks into plates (Venus) */
  rockFlat?: number;
  /** landforms, in metres, relative to the camera's start (camera faces -z) */
  height: (x: number, z: number) => number;
  eye: number;
  travel: number;
  dustMotes?: { color: string; count: number; opacity: number };
  exposure: number;
  readout: (g: number) => string;
  extra?: (scene: THREE.Scene) => ((t: number, g: number, cam: THREE.Camera) => void) | void;
}

const SKY_FRAG = /* glsl */ `
uniform vec3 zenith, horizon, aureole, groundGlow, sunDir; uniform float aureoleSize, aureoleAmount, sunDisc, toward;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  vec3 s = normalize(sunDir);
  float up = d.y;
  float t = clamp(up, 0.0, 1.0);
  vec3 c = mix(horizon, zenith, pow(t, 0.42));
  // the sky is brighter in the half towards the sun
  float tw = dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(s.x, 0.0, s.z))) * 0.5 + 0.5;
  c *= mix(1.0, 0.82 + 0.3 * tw * (1.0 - t * 0.6), toward);
  float cosA = max(dot(d, s), 0.0);
  float a = acos(min(cosA, 1.0));
  c = mix(c, aureole, aureoleAmount * exp(-a * a / (aureoleSize * aureoleSize)));
  c += aureole * 0.15 * exp(-a * 3.0) * aureoleAmount;
  float disc = smoothstep(0.0034, 0.0026, a) * sunDisc;
  c = mix(c, vec3(1.0, 0.97, 0.92) * 4.0, disc);
  c = mix(c, groundGlow, smoothstep(0.0, -0.08, up));
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const GROUND_PARS_V = /* glsl */ `varying vec3 vW;`;
const GROUND_PARS_F = /* glsl */ `
varying vec3 vW;
uniform vec3 cDust, cGravel, cBed, cHaze; uniform float slabs, hazeDensity;
${SIMPLEX3}
float sn2(vec2 p){ return snoise(vec3(p, 0.37)); }
// cracked slabs: distance to the nearest edge of a jittered cell pattern
vec2 cells(vec2 p){
  vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = hash33(vec3(i + g, 2.7)).xy;
    vec2 r = g + o - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
  }
  return vec2(sqrt(d2) - sqrt(d1), d1);
}
float groundH(vec2 p, float fw){
  // centimetre-to-metre roughness, faded out where it would shimmer
  float h = 0.0, a = 0.006, f = 9.0;
  for (int i = 0; i < 6; i++) {
    float w = smoothstep(0.5, 0.15, f * fw);
    h += w * a * sn2(p * f + float(i) * 1.7);
    f *= 2.2; a *= 0.48;
  }
  return h;
}
`;

export function createTerrain(p: TerrainParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 160000);
  const sunDir = new THREE.Vector3(...p.sunDir).normalize();
  const R = p.planetRadiusM;
  const small = innerWidth < 760;

  // ---- sky ----------------------------------------------------------------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(10, 64, 32),
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide, depthWrite: false, depthTest: false,
      uniforms: {
        zenith: { value: new THREE.Color(p.sky.zenith) }, horizon: { value: new THREE.Color(p.sky.horizon) },
        aureole: { value: new THREE.Color(p.sky.aureole) }, groundGlow: { value: new THREE.Color(p.sky.groundGlow) },
        sunDir: { value: sunDir }, toward: { value: p.sky.toward ?? 1 }, aureoleSize: { value: p.sky.aureoleSize }, aureoleAmount: { value: p.sky.aureoleAmount }, sunDisc: { value: p.sky.sunDisc },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: SKY_FRAG,
    }),
  );
  sky.frustumCulled = false; // a small dome drawn first with no depth test: it always sits behind everything and never clips
  sky.renderOrder = -1000;
  scene.add(sky);

  // ---- terrain: radial grid ---------------------------------------------
  const ANG = small ? 320 : 520;
  const rings: number[] = [0];
  for (let r = 0.35; r < 120000; r *= small ? 1.042 : 1.028) rings.push(r);
  const nV = 1 + (rings.length - 1) * ANG;
  const pos = new Float32Array(nV * 3);
  const centre = new THREE.Vector2(0, -p.travel * 0.5);
  const hAt = (x: number, z: number) => {
    const d2 = x * x + z * z;
    return p.height(x, z) - d2 / (2 * R); // the planet curves away
  };
  pos[0] = centre.x; pos[1] = hAt(centre.x, centre.y); pos[2] = centre.y;
  for (let i = 1; i < rings.length; i++) {
    for (let j = 0; j < ANG; j++) {
      const a = (j / ANG) * Math.PI * 2 + (i % 2) * (Math.PI / ANG);
      const x = centre.x + Math.cos(a) * rings[i], z = centre.y + Math.sin(a) * rings[i];
      const k = (1 + (i - 1) * ANG + j) * 3;
      pos[k] = x; pos[k + 1] = hAt(x, z); pos[k + 2] = z;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < ANG; j++) idx.push(0, 1 + ((j + 1) % ANG), 1 + j);
  for (let i = 1; i < rings.length - 1; i++) {
    const a0 = 1 + (i - 1) * ANG, b0 = 1 + i * ANG;
    for (let j = 0; j < ANG; j++) {
      const j1 = (j + 1) % ANG;
      idx.push(a0 + j, a0 + j1, b0 + j, a0 + j1, b0 + j1, b0 + j);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const groundUni = {
    cDust: { value: new THREE.Color(p.dust) }, cGravel: { value: new THREE.Color(p.gravel) }, cBed: { value: new THREE.Color(p.bedrock) },
    cHaze: { value: new THREE.Color(p.haze) }, slabs: { value: p.slabs }, hazeDensity: { value: p.hazeDensity },
  };
  const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  groundMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, groundUni);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\n${GROUND_PARS_V}`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>\n  vW = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${GROUND_PARS_F}`)
      .replace('#include <map_fragment>', /* glsl */ `
        vec2 gp = vW.xz;
        float fw = length(fwidth(gp)) + 1e-4;
        float big = sn2(gp * 0.004) * 0.6 + sn2(gp * 0.02) * 0.4;
        float mid = sn2(gp * 0.12 + 4.0) * 0.6 + sn2(gp * 0.5) * 0.4;
        // where the dust has blown off, darker gravel; in places, flat bedrock with cracks
        float grav = smoothstep(-0.1, 0.5, mid + big * 0.5);
        vec3 col = mix(cDust, cGravel, grav * 0.75);
        float bedMask = smoothstep(0.15, 0.45, sn2(gp * 0.05 + 9.0) * 0.7 + sn2(gp * 0.3) * 0.3 + (slabs - 0.5));
        vec2 cw = gp * 0.55 + vec2(sn2(gp * 0.21), sn2(gp * 0.21 + 7.0)) * 0.55;
        vec2 c1 = cells(cw);
        float crack = smoothstep(0.0, 0.08 + fw * 0.6, c1.x);
        vec3 bed = cBed * (0.85 + 0.25 * (sn2(gp * 0.9) * 0.5 + 0.5));
        col = mix(col, bed * mix(0.45, 1.0, crack), bedMask * slabs);
        // speckle at gravel scale, faded with distance
        float sp = sn2(gp * 7.0) * 0.5 + 0.5;
        col *= mix(1.0, 0.78 + 0.4 * sp, smoothstep(0.6, 0.1, fw * 7.0));
        col *= 0.9 + 0.2 * big;
        diffuseColor.rgb *= col;
      `)
      .replace('#include <normal_fragment_maps>', /* glsl */ `
        {
          float hh = groundH(vW.xz, fw) * (1.0 - bedMask * slabs * 0.7) - (1.0 - crack) * 0.02 * bedMask * slabs;
          vec3 pv = -vViewPosition;
          vec3 dpdx = dFdx(pv), dpdy = dFdy(pv);
          float hx = dFdx(hh), hy = dFdy(hh);
          vec3 r1 = cross(dpdy, normal), r2 = cross(normal, dpdx);
          float det = dot(dpdx, r1);
          vec3 grad = sign(det) * (hx * r1 + hy * r2);
          normal = normalize(abs(det) * normal - grad);
        }
      `)
      .replace('#include <fog_fragment>', /* glsl */ `
        {
          float dist = length(vW - cameraPosition);
          float hz = 1.0 - exp(-dist * hazeDensity);
          // the haze colour has to go through the same tone mapping and encoding as everything else
          vec3 hc = cHaze;
          #ifdef TONE_MAPPING
            hc = toneMapping(hc);
          #endif
          hc = sRGBTransferOETF(vec4(hc, 1.0)).rgb;
          gl_FragColor.rgb = mix(gl_FragColor.rgb, hc, hz);
        }
      `);
  };
  const ground = new THREE.Mesh(geo, groundMat);
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- rocks ----------------------------------------------------------------
  const rockMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(p.rock) });
  rockMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vW;`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>\n  vW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vW;\n${SIMPLEX3}`)
      .replace('#include <map_fragment>', /* glsl */ `
        float rn = snoise(vW * 3.1) * 0.5 + snoise(vW * 11.0) * 0.3;
        diffuseColor.rgb *= 0.82 + 0.3 * rn;
      `);
  };
  const rockGeos = [0, 1, 2, 3].map((s) => rockGeo(s, small ? 2 : 3));
  const pebbleGeos = [4, 5, 6].map((s) => rockGeo(s, 1));
  const tmpM = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), at = new THREE.Vector3(), e = new THREE.Euler();
  const col = new THREE.Color();
  const scatter = (geos: THREE.BufferGeometry[], count: number, rMin: number, rMax: number, sMin: number, sMax: number, skew: number, cast: boolean) => {
    const per = Math.ceil(count / geos.length);
    geos.forEach((g, gi) => {
      const m = new THREE.InstancedMesh(g, rockMat, per);
      for (let i = 0; i < per; i++) {
        const u = hash(i * 7 + gi, 11 + count), v = hash(i * 13 + gi, 29 + count), w = hash(i * 3 + gi, 47 + count);
        const r = rMin + Math.pow(u, 1.7) * (rMax - rMin);
        const a = v * Math.PI * 2;
        const x = centre.x + Math.cos(a) * r, z = centre.y + Math.sin(a) * r;
        // clear a little path for the camera
        if (Math.abs(x) < 0.9 && z < 2 && z > -p.travel - 2) { m.setMatrixAt(i, tmpM.makeScale(0, 0, 0)); continue; }
        const s = sMin + Math.pow(w, skew) * (sMax - sMin);
        at.set(x, hAt(x, z) - s * 0.25, z);
        e.set((hash(i, 3) - 0.5) * 0.5, hash(i, 5) * 6.28, (hash(i, 9) - 0.5) * 0.5);
        q.setFromEuler(e);
        sc.set(s * (0.8 + hash(i, 17) * 0.6), s * (0.45 + hash(i, 19) * 0.4) * (p.rockFlat ?? 1), s * (0.8 + hash(i, 23) * 0.6));
        m.setMatrixAt(i, tmpM.compose(at, q, sc));
        col.setScalar(0.7 + hash(i, 31) * 0.6);
        m.setColorAt(i, col);
      }
      m.castShadow = cast;
      m.receiveShadow = true;
      scene.add(m);
    });
  };
  scatter(rockGeos, Math.round(p.rocks * (small ? 0.5 : 1)), 1.5, 120, 0.08, 1.1, 3.4, true);
  scatter(pebbleGeos, Math.round(p.pebbles * (small ? 0.5 : 1)), 0.6, 22, 0.02, 0.1, 1.8, false);

  // ---- light --------------------------------------------------------------
  const sun = new THREE.DirectionalLight(new THREE.Color(p.sunColor), p.sunIntensity);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  const sc2 = sun.shadow.camera as THREE.OrthographicCamera;
  sc2.left = -22; sc2.right = 22; sc2.top = 22; sc2.bottom = -22; sc2.near = 1; sc2.far = 400;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(p.skyLight), new THREE.Color(p.groundLight), p.ambient));

  // ---- dust in the air ---------------------------------------------------
  let motes: THREE.Points | null = null;
  if (p.dustMotes) {
    const n = p.dustMotes.count;
    const dp = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { dp[i * 3] = (hash(i, 1) - 0.5) * 30; dp[i * 3 + 1] = hash(i, 2) * 6 - 1; dp[i * 3 + 2] = (hash(i, 3) - 0.5) * 30; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    motes = new THREE.Points(g, new THREE.PointsMaterial({ color: new THREE.Color(p.dustMotes.color), size: 0.018, transparent: true, opacity: p.dustMotes.opacity, depthWrite: false }));
    scene.add(motes);
  }

  const extraUpdate = p.extra?.(scene) || null;

  return {
    scene, camera,
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: p.exposure,
    shadows: true,
    update(g, dt, t, pointer, reduce) {
      const z = -g * p.travel;
      const y = hAt(0, z) + p.eye + (reduce ? 0 : Math.sin(t * 0.7) * 0.01);
      camera.position.set(0, y, z);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = -pointer.sx * 0.1 + 0.05 * (1 - g);
      camera.rotation.x = -pointer.sy * 0.04 - 0.035 + 0.05 * (1 - g);
      sky.position.copy(camera.position);
      sun.position.copy(camera.position).addScaledVector(sunDir, 200);
      sun.target.position.copy(camera.position).add(new THREE.Vector3(0, 0, -14));
      if (motes) {
        const a = motes.geometry.attributes.position as THREE.BufferAttribute;
        if (!reduce) for (let i = 0; i < a.count; i++) {
          let x = a.getX(i) + dt * 0.9, zz = a.getZ(i) + dt * 0.15;
          if (x > 15) x -= 30; if (zz > 15) zz -= 30;
          a.setX(i, x); a.setZ(i, zz); a.setY(i, a.getY(i) + Math.sin(t * 0.8 + i) * dt * 0.03);
        }
        a.needsUpdate = true;
        motes.position.set(camera.position.x, y - p.eye, camera.position.z);
      }
      extraUpdate?.(t, g, camera);
    },
    readout: p.readout,
  };
}

/** A rock: a lumpy, faceted stone. Flattened, with a couple of sheared faces like wind-cut rock. */
function rockGeo(seed: number, detail = 2) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const a = g.attributes.position;
  const v = new THREE.Vector3();
  const planes = [0, 1, 2].map((k) => new THREE.Vector3(hash(seed, k) - 0.5, hash(seed, k + 5) * 0.6, hash(seed, k + 9) - 0.5).normalize());
  for (let i = 0; i < a.count; i++) {
    v.fromBufferAttribute(a, i);
    const n = 1 + 0.22 * Math.sin(v.x * 3.1 + seed) * Math.cos(v.z * 2.7 + seed * 2) + 0.12 * Math.sin(v.y * 5 + v.x * 4 + seed);
    v.multiplyScalar(n);
    for (const pl of planes) {
      const d = v.dot(pl) - 0.62;
      if (d > 0) v.addScaledVector(pl, -d);
    }
    if (v.y < -0.35) v.y = -0.35;
    a.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
