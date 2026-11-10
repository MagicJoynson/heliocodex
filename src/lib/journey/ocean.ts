import * as THREE from 'three';
import { fbm } from './noise';
import { SIMPLEX3 } from './shaders';
import type { LowerScene } from './types';

/**
 * Open sea off O'ahu at golden hour. The swell is a sum of Gerstner waves from one wind
 * direction (big ones move the mesh, small ones only tilt the light), the sun's path on the water
 * comes from the spread of wave slopes, and the island sits in the haze 20 km away.
 */
export interface OceanParams {
  sunDir: [number, number, number];
  readout: (g: number) => string;
}

const SKY = /* glsl */ `
uniform vec3 sunDir; uniform float time;
${SIMPLEX3}
float fbm2(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * snoise(vec3(p, 1.7)); p = p * 2.03 + 3.1; a *= 0.5; } return s; }
// a low layer of fair-weather cumulus and a few high streaks, lit by the low sun
vec4 clouds(vec3 d){
  if (d.y <= 0.004) return vec4(0.0);
  vec3 L = normalize(sunDir);
  float t = 1600.0 / d.y;
  vec2 uv = d.xz * t * 0.00042 + vec2(time * 0.0016, 0.0);
  float base = fbm2(uv) + 0.35 * fbm2(uv * 2.7 + 5.0);
  float cov = smoothstep(0.18, 0.62, base);
  // light: how much cloud there is between this point and the sun
  float sh = smoothstep(0.18, 0.62, fbm2(uv + L.xz * 0.12) + 0.35 * fbm2((uv + L.xz * 0.12) * 2.7 + 5.0));
  float lit = clamp(1.0 - sh * 0.85 + 0.15, 0.0, 1.0);
  vec3 dark = vec3(0.33, 0.29, 0.36);
  vec3 gold = vec3(1.35, 0.86, 0.55);
  float toward = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(L.x, 0.0, L.z))), 0.0), 2.0);
  vec3 c = mix(dark, gold * (0.75 + 0.6 * toward), lit);
  // silver edges on the sun side
  c += vec3(1.0, 0.8, 0.55) * (1.0 - cov) * cov * 2.5 * toward;
  // high cirrus
  vec2 cu = d.xz * (9000.0 / d.y) * 0.00007 + vec2(time * 0.0006, 0.0);
  float ci = smoothstep(0.25, 0.9, fbm2(vec2(cu.x * 0.4, cu.y * 3.0))) * 0.35;
  float fade = smoothstep(0.004, 0.09, d.y);
  float a = clamp(cov * 0.92 + ci * (1.0 - cov), 0.0, 1.0) * fade;
  vec3 col = mix(vec3(1.25, 0.9, 0.7), c, cov / max(cov + ci * (1.0 - cov), 1e-3));
  return vec4(col, a);
}
vec3 skyCol(vec3 d){
  vec3 L = normalize(sunDir);
  float y = max(d.y, 0.0);
  float s = max(dot(d, L), 0.0);
  vec3 zen = vec3(0.03, 0.1, 0.3);
  float side = dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(L.x, 0.0, L.z))) * 0.5 + 0.5;
  vec3 horSun = vec3(1.0, 0.6, 0.32);
  vec3 horAway = vec3(0.5, 0.48, 0.6);
  vec3 hor = mix(horAway, horSun, pow(side, 2.2));
  vec3 col = mix(hor, zen, pow(y, 0.38));
  // pink band low on the side away from the sun
  col += vec3(0.12, 0.04, 0.08) * (1.0 - side) * exp(-y * 9.0);
  col += vec3(1.0, 0.52, 0.2) * pow(s, 6.0) * 0.9 * (1.0 - y * 0.7);
  col += vec3(1.0, 0.7, 0.4) * pow(s, 60.0) * 0.9;
  col += vec3(1.0, 0.8, 0.55) * pow(s, 1200.0) * 2.5;
  col += vec3(1.0, 0.82, 0.55) * 40.0 * smoothstep(0.999955, 0.99998, s);
  vec4 c = clouds(d);
  col = mix(col, c.rgb, c.a);
  return col;
}
`;

// Gerstner waves: direction (deg from wind), wavelength (m), amplitude (m), phase
const WIND = -0.35;
const WAVES: [number, number, number, number][] = [
  [0, 64, 0.42, 0.0], [24, 41, 0.3, 1.7], [-31, 29, 0.22, 4.1], [12, 19, 0.14, 2.2], [-17, 13, 0.09, 5.3],
  [38, 9.1, 0.06, 0.9], [-44, 6.4, 0.042, 3.3], [7, 4.4, 0.03, 1.1], [-26, 3.1, 0.02, 2.9], [51, 2.2, 0.014, 4.4],
];

export function createOcean(p: OceanParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 90000);
  const sunDir = new THREE.Vector3(...p.sunDir).normalize();
  const small = innerWidth < 760;
  const U = { time: { value: 0 }, sunDir: { value: sunDir }, camPos: { value: new THREE.Vector3() } };

  const dirs = WAVES.map(([deg]) => new THREE.Vector2(Math.sin(WIND + (deg * Math.PI) / 180), -Math.cos(WIND + (deg * Math.PI) / 180)));
  const waveU = WAVES.map(([, len, amp, ph]) => {
    const k = (2 * Math.PI) / len;
    return new THREE.Vector4(k, amp, Math.sqrt(9.81 * k), ph);
  });
  // xy: direction, z: steepness factor (Q) worked out from the full amplitude
  const waveD = dirs.map((d, i) => new THREE.Vector3(d.x, d.y, 0.62 / (waveU[i].x * waveU[i].y * WAVES.length)));

  // ---- sky dome -----------------------------------------------------------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(10, 64, 32),
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide, depthWrite: false, depthTest: false, uniforms: U,
      vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `${SKY} varying vec3 vD;
        void main(){ vec3 d = normalize(vD); vec3 c = d.y > 0.0 ? skyCol(d) : skyCol(vec3(d.x, 0.0, d.z)) * 0.7; gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }`,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  scene.add(sky);

  // ---- the sea: radial grid that follows the camera ----------------------
  const ANG = small ? 256 : 400;
  const rings: number[] = [0];
  for (let r = 0.4; r < 60000; r *= small ? 1.045 : 1.032) rings.push(r);
  const nV = 1 + (rings.length - 1) * ANG;
  const pos = new Float32Array(nV * 3);
  for (let i = 1; i < rings.length; i++) for (let j = 0; j < ANG; j++) {
    const a = (j / ANG) * Math.PI * 2 + (i % 2) * (Math.PI / ANG);
    const k = (1 + (i - 1) * ANG + j) * 3;
    pos[k] = Math.cos(a) * rings[i]; pos[k + 2] = Math.sin(a) * rings[i];
  }
  const idx: number[] = [];
  for (let j = 0; j < ANG; j++) idx.push(0, 1 + ((j + 1) % ANG), 1 + j);
  for (let i = 1; i < rings.length - 1; i++) {
    const a0 = 1 + (i - 1) * ANG, b0 = 1 + i * ANG;
    for (let j = 0; j < ANG; j++) { const j1 = (j + 1) % ANG; idx.push(a0 + j, a0 + j1, b0 + j, a0 + j1, b0 + j1, b0 + j); }
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  sg.setIndex(idx);

  const NW = WAVES.length;
  const seaMat = new THREE.ShaderMaterial({
    uniforms: { ...U, wk: { value: waveU }, wd: { value: waveD } },
    vertexShader: /* glsl */ `
      uniform float time; uniform vec3 camPos; uniform vec4 wk[${NW}]; uniform vec3 wd[${NW}];
      varying vec3 vW; varying vec3 vN; varying float vCrest;
      void main(){
        vec3 p = position + vec3(camPos.x, 0.0, camPos.z);
        float dist = length(position.xz);
        vec3 o = vec3(0.0); vec3 n = vec3(0.0, 1.0, 0.0); float crest = 0.0;
        for (int i = 0; i < ${NW}; i++) {
          float k = wk[i].x, A = wk[i].y, w = wk[i].z;
          // fade each wave out where the grid is too coarse to carry it
          A *= 1.0 - smoothstep(0.9, 1.8, dist * 0.034 * k);
          vec2 d = wd[i].xy;
          float th = k * dot(d, p.xz) - w * time + wk[i].w;
          float Q = wd[i].z;
          o.xz += Q * A * d * cos(th);
          o.y += A * sin(th);
          n.xz -= d * k * A * cos(th);
          n.y -= Q * k * A * sin(th);
          crest += Q * k * A * sin(th);
        }
        vec3 wp = p + o;
        vW = wp; vN = n; vCrest = crest;
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      ${SKY}
      uniform vec3 camPos;
      varying vec3 vW; varying vec3 vN; varying float vCrest;
      // short waves only tilt the light; each fades out before it would shimmer
      vec3 ripples(vec2 p, float fw){
        vec2 g = vec2(0.0);
        float len = 1.8, amp = 0.022;
        for (int i = 0; i < 14; i++) {
          float k = 6.2832 / len;
          float fade = smoothstep(0.7, 0.2, fw * k / 6.2832 * 4.0);
          float a = float(i) * 2.39996;
          vec2 d = vec2(sin(a + ${WIND.toFixed(3)} * 0.6), -cos(a * 0.37 + ${WIND.toFixed(3)}));
          d = normalize(d);
          float th = k * dot(d, p) - sqrt(9.81 * k) * time + float(i) * 1.3;
          g += d * k * amp * cos(th) * fade;
          len *= 0.74; amp *= 0.76;
        }
        return vec3(-g.x, 1.0, -g.y);
      }
      void main(){
        vec3 L = normalize(sunDir);
        vec3 V = normalize(camPos - vW);
        float dist = length(vW - camPos);
        float fw = length(fwidth(vW.xz)) + 1e-4;
        vec3 n0 = normalize(vN);
        vec3 r = ripples(vW.xz, fw);
        vec3 N = normalize(vec3(n0.x + r.x, n0.y, n0.z + r.z));
        // slopes we can no longer draw still spread the sun's reflection: widen the lobe with distance
        float m = 0.085 + clamp(fw * 0.05, 0.0, 0.2);
        float cosNV = max(dot(N, V), 0.0);
        float F = 0.02 + 0.98 * pow(1.0 - cosNV, 5.0);
        vec3 R = reflect(-V, N); R.y = abs(R.y);
        vec3 refl = skyCol(normalize(R));
        // body colour: deep blue, teal where light passes through the backs of waves
        vec3 deep = vec3(0.004, 0.022, 0.05);
        vec3 sss = vec3(0.02, 0.16, 0.16) * pow(max(dot(V, -L) * 0.5 + 0.5, 0.0), 3.0) * clamp(vCrest * 1.6 + 0.25, 0.0, 1.0);
        vec3 water = deep + sss + vec3(0.01, 0.03, 0.05) * max(dot(N, L), 0.0);
        vec3 col = mix(water, refl, F);
        // the sun on the water
        vec3 H = normalize(L + V);
        float ch = max(dot(N, H), 1e-3);
        float t2 = (1.0 - ch * ch) / (ch * ch);
        float D = exp(-t2 / (m * m)) / (3.14159 * m * m * ch * ch * ch * ch);
        float spec = D * F / max(4.0 * cosNV * max(dot(vec3(0.0, 1.0, 0.0), L), 0.05), 1e-3);
        col += vec3(1.0, 0.8, 0.55) * spec * 2.2;
        // a little foam on the steepest crests nearby
        col = mix(col, vec3(0.75, 0.72, 0.7), smoothstep(0.42, 0.62, vCrest) * 0.35 * (1.0 - smoothstep(30.0, 200.0, dist)));
        // distance: the sea melts into the sky at the horizon
        vec3 hzn = skyCol(normalize(vec3(-V.x, 0.0015, -V.z)));
        col = mix(col, hzn, 1.0 - exp(-dist / 26000.0));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sea = new THREE.Mesh(sg, seaMat);
  sea.frustumCulled = false;
  scene.add(sea);

  // ---- O'ahu's Ko'olau range, about 22 km off, in the haze ----------------
  const IW = 26000, ID = 9000;
  const ig = new THREE.PlaneGeometry(IW, ID, 260, 90).rotateX(-Math.PI / 2);
  {
    const a = ig.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i), z = a.getZ(i);
      const u = x / (IW / 2), v = z / (ID / 2);
      const body = Math.max(0, 1 - u * u * 0.9 - v * v * 1.4);
      // fluted ridges: sharp crests running down to the sea
      const ridge = 1 - Math.abs(fbm(x / 900 + 3, z / 2600, 4) - 0.5) * 2;
      const h = Math.pow(body, 0.9) * (680 + 260 * fbm(x / 3000, z / 3000, 3)) * (0.55 + 0.45 * ridge * ridge);
      a.setY(i, h - 40);
    }
    ig.computeVertexNormals();
  }
  const island = new THREE.Mesh(ig, new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `varying vec3 vW; varying vec3 vN; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `${SKY} uniform vec3 camPos; varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 L = normalize(sunDir); vec3 V = normalize(camPos - vW);
        float dif = max(dot(normalize(vN), L), 0.0);
        vec3 c = vec3(0.05, 0.07, 0.045) * (0.35 + 1.6 * dif) + vec3(0.02, 0.03, 0.05);
        float dist = length(vW - camPos);
        vec3 hz = skyCol(normalize(vec3(-V.x, max(-V.y, 0.002), -V.z)));
        c = mix(c, hz, 1.0 - exp(-dist / 15000.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  island.position.set(-11000, 0, -22000);
  island.rotation.y = 0.35;
  scene.add(island);

  // height of the swell under the camera, so we ride it
  function swellAt(x: number, z: number, t: number) {
    let y = 0;
    WAVES.forEach(([, len, amp, ph], i) => {
      const k = (2 * Math.PI) / len;
      y += amp * Math.sin(k * (dirs[i].x * x + dirs[i].y * z) - Math.sqrt(9.81 * k) * t + ph);
    });
    return y;
  }

  return {
    scene, camera,
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: 0.72,
    update(g, _dt, t, pointer, reduce) {
      U.time.value = reduce ? 0 : t;
      const z = -g * 30;
      const y = 3.2 + (reduce ? 0 : swellAt(0, z, t) * 0.55);
      camera.position.set(0, y, z);
      camera.rotation.order = 'YXZ';
      // on a narrow screen turn a little towards the Sun so its glitter path stays in view
      camera.rotation.y = -pointer.sx * 0.1 + 0.06 * (1 - g) - (camera.aspect < 0.8 ? 0.36 : 0);
      camera.rotation.x = -pointer.sy * 0.04 + 0.015 + (reduce ? 0 : Math.sin(t * 0.6) * 0.006);
      camera.rotation.z = reduce ? 0 : Math.sin(t * 0.45) * 0.008;
      U.camPos.value.copy(camera.position);
      sky.position.copy(camera.position);
    },
    readout: p.readout,
  };
}
