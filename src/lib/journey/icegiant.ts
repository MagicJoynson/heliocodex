import * as THREE from 'three';
import { SIMPLEX3 } from './shaders';
import type { LowerScene } from './types';

/**
 * Above the methane clouds of an ice giant (Uranus or Neptune). Distances in kilometres, y up,
 * the cloud deck at about y = 0.
 *
 * A billowing deck with broad bands, and above it long streaks of bright methane cirrus that throw
 * their shadows down onto the deck, the way Voyager 2 saw them on Neptune in 1989. The camera turns
 * to keep the Sun in shot on one side, and a moon can hang in the sky at its true size, lit from
 * the real direction of the Sun so its phase is right.
 */
export interface IceGiantParams {
  /** the Sun in the local frame: x right, y up, -z ahead when facing south */
  sunDir: [number, number, number];
  planetRadiusKm: number;
  deckDark: [number, number, number];
  deckLight: [number, number, number];
  horizon: [number, number, number];
  zenith: [number, number, number];
  /** distance over which the deck melts into the haze, km */
  haze: number;
  /** 0..1 how much high cirrus there is */
  cirrus: number;
  /** height of the cirrus above the deck, km */
  cirrusHeight: number;
  /** contrast of the belts, 0..1 */
  banding: number;
  /** where the Sun sits across the view, radians from the centre (+ right, - left) */
  sunSide?: number;
  /** or a fixed facing: 0 = due south, + turns left (east) */
  yaw?: number;
  /** camera pitch, radians (+ up) */
  pitch: number;
  /** camera height at the start and end of the descent, km */
  heights: [number, number];
  /**
   * moons, each at its true angular radius. Place one either by a direction in the local frame, or by
   * azimuth from the Sun (radians, + to the left) and elevation (radians).
   */
  moons?: { dir?: [number, number, number]; az?: number; el?: number; radius: number; dark: [number, number, number]; light: [number, number, number] }[];
  exposure: number;
  readout: (g: number) => string;
}

const v3 = (c: [number, number, number]) => `vec3(${c.map((x) => x.toFixed(3)).join(', ')})`;

export function createIceGiant(p: IceGiantParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, 1, 0.05, 9000);
  const small = innerWidth < 760;
  const sunDir = new THREE.Vector3(...p.sunDir).normalize();
  // yaw that faces the Sun (camera looks down -z; +yaw turns left)
  const sunYaw = Math.atan2(-sunDir.x, -sunDir.z);
  const baseYaw = p.yaw ?? sunYaw + (p.sunSide ?? 0);
  const moons = (p.moons ?? []).map((m) => {
    if (m.dir) return { ...m, d: new THREE.Vector3(...m.dir).normalize() };
    const az = sunYaw + (m.az ?? 0), el = m.el ?? 0;
    return { ...m, d: new THREE.Vector3(-Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)) };
  });
  const U = {
    time: { value: 0 }, sunDir: { value: sunDir }, camPos: { value: new THREE.Vector3() },
  };
  const OCT = small ? 5 : 6;
  const CH = p.cirrusHeight.toFixed(2);

  const COMMON = /* glsl */ `
  ${SIMPLEX3}
  uniform float time; uniform vec3 sunDir;
  float n2(vec2 p){ return snoise(vec3(p, 0.5)); }
  vec2 warp(vec2 p){ return p + vec2(60.0 * n2(p / 700.0 + 3.0), 25.0 * n2(p / 500.0 + 11.0)); }
  // billowing cloud tops, a few km of relief, stretched east-west by the wind
  float deckH(vec2 p){
    vec2 w = warp(p);
    w.x *= 0.55;
    float h = 0.0, a = 2.2, f = 1.0 / 160.0;
    for (int i = 0; i < ${OCT}; i++) { h += a * (1.0 - abs(n2(w * f + float(i) * 3.7))); f *= 2.07; a *= 0.47; }
    return h - 2.6;
  }
  // methane cirrus: long thin bright streaks along lines of latitude (x), bent a little by the flow
  float cirrusAt(vec2 p){
    vec2 b = vec2(p.x, p.y + 55.0 * n2(vec2(p.x / 700.0, p.y / 260.0) + 5.0) + 12.0 * n2(vec2(p.x / 160.0, p.y / 90.0) + 1.0));
    float s = n2(vec2(b.x / 700.0, b.y / 16.0)) * 0.65 + n2(vec2(b.x / 260.0, b.y / 7.0) + 2.0) * 0.35;
    float streak = smoothstep(0.3, 0.72, s) * smoothstep(-0.25, 0.45, n2(vec2(b.x / 380.0, b.y / 60.0) + 13.0));
    float fibre = 0.6 + 0.4 * n2(vec2(b.x / 45.0, b.y / 1.6) + 9.0);
    float cov = smoothstep(0.05, 0.55, n2(p / 1600.0 + 7.0) * 0.5 + 0.5);
    return clamp(streak * fibre * cov * ${(p.cirrus * 1.25).toFixed(3)}, 0.0, 1.0);
  }
  vec3 skyBase(vec3 d, vec3 L){
    float y = max(d.y, 0.0);
    vec3 c = mix(${v3(p.horizon)}, ${v3(p.zenith)}, pow(y, 0.45));
    float s = max(dot(d, L), 0.0);
    // light scattered forward by the haze: a broad glow round the Sun, brightest near the horizon
    c += ${v3(p.horizon)} * (pow(s, 5.0) * 0.45 + pow(s, 40.0) * 0.5) * (1.0 - y * 0.6);
    return c;
  }
  `;

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 32),
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide, depthWrite: false, depthTest: false, uniforms: U,
      vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `${COMMON}
        varying vec3 vD;
        void main(){
          vec3 d = normalize(vD); vec3 L = normalize(sunDir);
          vec3 c = skyBase(d, L);
          float s = dot(d, L);
          // the Sun at 19 or 30 au is too small to show a disc: a hard white point with a tight glare round it
          float a = acos(clamp(s, -1.0, 1.0));
          c += vec3(1.0, 0.98, 0.94) * (smoothstep(0.0022, 0.0008, a) * 14.0 + exp(-a * 160.0) * 0.9 + exp(-a * 30.0) * 0.18);
          ${moons.map((m) => `
          {
            vec3 mo = normalize(vec3(${m.d.x.toFixed(5)}, ${m.d.y.toFixed(5)}, ${m.d.z.toFixed(5)}));
            float rad = ${m.radius.toFixed(6)};
            if (dot(d, mo) > cos(rad * 1.6)) {
              vec3 right = normalize(cross(mo, vec3(0.0, 1.0, 0.0)));
              vec3 up = cross(right, mo);
              vec2 q = vec2(dot(d - mo, right), dot(d - mo, up)) / rad;
              float r2 = dot(q, q);
              float z = sqrt(max(0.0, 1.0 - r2));
              vec3 nrm = normalize(right * q.x + up * q.y - mo * z);
              float lit = smoothstep(-0.04, 0.12, dot(nrm, L));
              float spots = n2(q * 2.2 + ${(m.radius * 3e3).toFixed(2)}) * 0.5 + n2(q * 6.0) * 0.25;
              vec3 surf = mix(${v3(m.dark)}, ${v3(m.light)}, smoothstep(-0.4, 0.5, spots));
              // seen through the haze: added to the sky, and the dark side stays sky-coloured
              c = mix(c, c + surf * lit * 1.6, smoothstep(1.06, 0.94, sqrt(r2)));
            }
          }`).join('')}
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  scene.add(sky);

  // ---- deck ------------------------------------------------------------------
  const ANG = small ? 256 : 400;
  const rings: number[] = [0];
  for (let r = 0.1; r < 4200; r *= small ? 1.04 : 1.028) rings.push(r);
  const pos = new Float32Array((1 + (rings.length - 1) * ANG) * 3);
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
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);

  const deck = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `${COMMON}
      uniform vec3 camPos;
      varying vec3 vW; varying float vDrop;
      void main(){
        vec2 p = position.xz + camPos.xz;
        float dist = length(position.xz);
        float drop = dist * dist / (2.0 * ${p.planetRadiusKm.toFixed(1)});
        float h = dist < 600.0 ? deckH(p) : 0.0;
        vec3 wp = vec3(p.x, h - drop, p.y);
        vW = wp; vDrop = drop;
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */ `${COMMON}
      uniform vec3 camPos;
      varying vec3 vW; varying float vDrop;
      void main(){
        vec3 L = normalize(sunDir);
        vec2 p = vW.xz;
        vec3 toC = vW - camPos;
        float dist = length(toC);
        vec3 V = toC / dist;
        // per-pixel relief, with the sample step growing with distance so it never shimmers
        float e = clamp(dist * 0.0025, 0.12, 25.0);
        float h = deckH(p);
        vec3 N = normalize(vec3(deckH(p - vec2(e, 0.0)) - deckH(p + vec2(e, 0.0)), 2.0 * e, deckH(p - vec2(0.0, e)) - deckH(p + vec2(0.0, e))));
        N = normalize(mix(N, vec3(0.0, 1.0, 0.0), smoothstep(300.0, 1400.0, dist)));
        // belts and zones run east-west, a few hundred km wide
        vec2 w = warp(p);
        float band = n2(vec2(w.x / 9000.0, w.y / 260.0)) * 0.6 + n2(vec2(w.x / 2200.0, w.y / 70.0) + 3.0) * 0.28 + n2(vec2(w.x / 400.0, w.y / 14.0) + 6.0) * 0.12;
        vec3 col = mix(${v3(p.deckDark)}, ${v3(p.deckLight)}, clamp(0.5 + (band * 0.9) * ${p.banding.toFixed(3)} + (h - 0.5) * 0.06, 0.0, 1.0));
        float diff = max(dot(N, L), 0.0);
        // shadows of the cirrus, cast down along the sunlight
        vec2 sp = p - L.xz / max(L.y, 0.08) * (${CH} - h);
        float shade = 1.0 - 0.7 * cirrusAt(sp) * smoothstep(1800.0, 400.0, dist);
        vec3 amb = mix(${v3(p.horizon)}, ${v3(p.zenith)}, 0.5) * 0.55;
        vec3 lit = col * (diff * shade * 1.35 + amb * (0.55 + 0.45 * N.y));
        // thin edges of the billows catch light when you look towards the Sun
        lit += col * pow(max(dot(-V, L), 0.0), 6.0) * (1.0 - N.y) * 1.2 * shade;
        vec3 hz = skyBase(normalize(vec3(V.x, 0.02, V.z)), L);
        lit = mix(lit, hz, 1.0 - exp(-dist / ${p.haze.toFixed(1)}));
        gl_FragColor = vec4(lit, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  deck.frustumCulled = false;
  scene.add(deck);

  // ---- cirrus sheet --------------------------------------------------------
  const cirrus = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, small ? 96 : 160, small ? 96 : 160).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform vec3 camPos; varying vec3 vW;
        void main(){
          vec3 q = position * 7000.0;
          float d = length(q.xz);
          vec3 w = vec3(q.x + camPos.x, ${CH} - d * d / (2.0 * ${(p.planetRadiusKm + p.cirrusHeight).toFixed(1)}), q.z + camPos.z);
          vW = w; gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
        }`,
      fragmentShader: /* glsl */ `${COMMON}
        uniform vec3 camPos; varying vec3 vW;
        void main(){
          float a = cirrusAt(vW.xz);
          vec3 toC = vW - camPos;
          float dist = length(toC);
          vec3 V = toC / dist;
          vec3 L = normalize(sunDir);
          // bright on top, and glowing when the Sun is behind it
          float fwd = pow(max(dot(V, L), 0.0), 8.0);
          vec3 c = vec3(1.0, 0.99, 0.97) * (0.75 + 0.5 * smoothstep(0.0, 0.4, L.y) + fwd * 1.4);
          vec3 hz = skyBase(normalize(vec3(V.x, 0.02, V.z)), L);
          c = mix(c, hz, 1.0 - exp(-dist / ${(p.haze * 1.25).toFixed(1)}));
          a *= 1.0 - smoothstep(2600.0, 3400.0, dist);
          gl_FragColor = vec4(c, a * 0.92);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  cirrus.frustumCulled = false;
  cirrus.renderOrder = 1;
  scene.add(cirrus);

  const [h0, h1] = p.heights;
  return {
    scene, camera,
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: p.exposure,
    update(g, _dt, t, pointer, reduce) {
      U.time.value = reduce ? 0 : t;
      // drift forward along the view while sinking towards the cirrus
      const along = g * 260;
      camera.position.set(-Math.sin(baseYaw) * along, h0 + (h1 - h0) * g, -Math.cos(baseYaw) * along);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = baseYaw - pointer.sx * 0.1 + 0.05 * (1 - g);
      camera.rotation.x = p.pitch - pointer.sy * 0.04;
      U.camPos.value.copy(camera.position);
      sky.position.copy(camera.position);
    },
    readout: p.readout,
  };
}
