import * as THREE from 'three';
import { SIMPLEX3 } from './shaders';
import { createRingTexture, RING_GLSL, RS_KM } from './rings';
import type { LowerScene } from './types';

/**
 * Above Saturn's cloud tops at 40° north in northern summer, facing south, with the rings arching
 * across the sky. Distances in kilometres.
 *
 * The rings are not painted on: each sky pixel follows its ray out to the ring plane, finds the
 * radius it crosses at, and looks up the real ring profile there. The planet's own shadow is
 * worked out the same way, so it falls across the rings where it should.
 */
export interface SaturnParams {
  lat: number;
  lon: number;
  /** the Sun in the planet's frame (y = north pole) */
  sun: [number, number, number];
  flattening: number;
  readout: (g: number) => string;
}

const COMMON = /* glsl */ `
${SIMPLEX3}
uniform float time; uniform vec3 sunDir;
float n2(vec2 p){ return snoise(vec3(p, 0.5)); }
float deckH(vec2 p){
  // soft heaps of cloud under a high haze, drawn out east-west by the wind
  vec2 w = vec2(p.x * 0.6, p.y) + 110.0 * vec2(n2(p * 0.001), n2(p * 0.001 + 9.0));
  float bill = 0.0, a = 1.6, f = 0.0022;
  for (int i = 0; i < 5; i++) { bill += a * (1.0 - abs(n2(w * f + float(i) * 3.1))); f *= 2.1; a *= 0.5; }
  float h = (bill - 1.0) * 2.4;
  // now and then a convective cell pushes up through the haze
  vec2 c = floor(p / 110.0);
  vec3 hh = hash33(vec3(c, 6.0));
  if (hh.z < 0.16) {
    vec2 ctr = (c + 0.25 + 0.5 * hh.xy) * 110.0;
    float d = length(p - ctr) / (16.0 + 22.0 * hh.x);
    h += (4.0 + 6.0 * hh.y) * pow(max(0.0, 1.0 - d * d), 1.2) * (1.0 + 0.2 * n2(p * 0.08));
  }
  return h;
}
`;

const SKY = /* glsl */ `
uniform vec3 bE, bU, bS; uniform vec3 camP; uniform vec3 sunP;
${RING_GLSL}
vec3 skyBase(vec3 d, vec3 L){
  float y = max(d.y, 0.0);
  vec3 hor = vec3(0.6, 0.46, 0.28);
  vec3 zen = vec3(0.02, 0.045, 0.12);
  vec3 c = mix(hor, zen, pow(y, 0.75));
  float s = max(dot(d, L), 0.0);
  c += vec3(0.95, 0.82, 0.6) * pow(s, 10.0) * 0.3 * (1.0 - y * 0.6);
  return c;
}
vec3 skyCol(vec3 d, vec3 L){
  vec3 c = skyBase(d, L);
  // the rings: follow the ray into the planet's frame and out to the ring plane
  vec3 D = normalize(bE * d.x + bU * d.y - bS * d.z);
  if (d.y > -0.02 && abs(D.y) > 1e-4) {
    float t = -camP.y / D.y;
    if (t > 0.0) {
      vec3 q = camP + D * t;
      float r = length(q.xz);
      vec4 rg = ringAt(r);
      if (rg.a > 0.0) {
        float sh = 1.0 - planetShadow(q, normalize(sunP));
        bool lit = (camP.y > 0.0) == (sunP.y > 0.0);
        float b = lit ? 1.0 : (1.0 - rg.a) * rg.a * 1.6;
        vec3 rc = rg.rgb * b * sh * 1.35 + rg.rgb * 0.02;
        // seen through the air: dimmer and hazier towards the horizon
        float air = exp(-0.05 / max(d.y + 0.015, 0.004));
        float a = rg.a * air;
        c = mix(c, rc + c * 0.15, a);
      }
    }
  }
  float s = max(dot(d, L), 0.0);
  // the Sun from 9.5 au: a ninth of its width from Earth, still far too bright to look at
  c += vec3(1.0, 0.95, 0.86) * pow(s, 4000.0) * 1.6;
  c += vec3(1.0, 0.98, 0.94) * 30.0 * smoothstep(0.99999985, 0.9999999, s);
  return c;
}
`;

export function createSaturnSky(p: SaturnParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, 1, 0.05, 9000);
  const small = innerWidth < 760;

  // the same local frame the descent uses: facing due south
  const lat = THREE.MathUtils.degToRad(p.lat), lon = THREE.MathUtils.degToRad(p.lon);
  const up = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
  const south = new THREE.Vector3(0, -1, 0).addScaledVector(up, up.y).normalize();
  const east = new THREE.Vector3().crossVectors(south, up).normalize();
  const sunP = new THREE.Vector3(...p.sun).normalize();
  const sunDir = new THREE.Vector3(sunP.dot(east), sunP.dot(up), -sunP.dot(south)).normalize();
  const fl = 1 - p.flattening;
  const rs = 1 / Math.sqrt(up.x * up.x + up.z * up.z + (up.y / fl) * (up.y / fl));
  const camP = up.clone().multiplyScalar(rs + 30 / RS_KM);

  const U = {
    time: { value: 0 }, sunDir: { value: sunDir }, camPos: { value: new THREE.Vector3() },
    bE: { value: east }, bU: { value: up }, bS: { value: south }, camP: { value: camP }, sunP: { value: sunP },
    ringTex: { value: createRingTexture() as THREE.Texture },
  };

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 48),
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide, depthWrite: false, depthTest: false, uniforms: U,
      vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `${COMMON} ${SKY}
        varying vec3 vD;
        void main(){
          vec3 d = normalize(vD);
          gl_FragColor = vec4(skyCol(d, normalize(sunDir)), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  scene.add(sky);

  // ---- cloud deck ----------------------------------------------------------
  const ANG = small ? 256 : 400;
  const rings: number[] = [0];
  for (let r = 0.05; r < 4200; r *= small ? 1.04 : 1.028) rings.push(r);
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

  const R = RS_KM * rs;
  const deck = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `${COMMON}
      uniform vec3 camPos;
      varying vec3 vW; varying vec3 vN; varying float vShadow; varying float vH;
      void main(){
        vec2 p = position.xz + camPos.xz;
        float dist = length(position.xz);
        float h = deckH(p);
        float e = max(0.6, dist * 0.02);
        vec3 n = normalize(vec3(deckH(p - vec2(e, 0.0)) - deckH(p + vec2(e, 0.0)), 2.0 * e, deckH(p - vec2(0.0, e)) - deckH(p + vec2(0.0, e))));
        vec3 L = normalize(sunDir);
        float sh = 1.0;
        if (dist < 900.0) {
          for (int i = 1; i <= 6; i++) {
            float t = float(i * i) * 2.5;
            vec2 q = p + L.xz / max(length(L.xz), 1e-3) * t;
            float rayH = h + t * L.y / max(length(L.xz), 1e-3);
            sh = min(sh, clamp((rayH - deckH(q)) * 0.35 + 1.0, 0.0, 1.0));
          }
        }
        float drop = dist * dist / (2.0 * ${R.toFixed(1)});
        vec3 wp = vec3(p.x, h - drop, p.y);
        vW = wp; vN = n; vShadow = sh; vH = h;
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */ `${COMMON} ${SKY}
      uniform vec3 camPos;
      varying vec3 vW; varying vec3 vN; varying float vShadow; varying float vH;
      void main(){
        vec3 L = normalize(sunDir);
        vec2 p = vW.xz;
        float dist = length(vW - camPos);
        float fw = length(fwidth(p)) + 1e-3;
        float near = smoothstep(0.6, 0.05, fw * 0.02);
        // belts and zones run east-west, so they cross the view as you face the equator
        vec2 w = p + 90.0 * vec2(n2(p * 0.0012), n2(p * 0.0012 + 4.0));
        // belts and zones: long east-west stripes, with finer streaks inside them
        float band = n2(vec2(w.x * 0.00012, w.y * 0.0042)) * 0.55 + n2(vec2(w.x * 0.0005, w.y * 0.016)) * 0.3 + n2(vec2(w.x * 0.004, w.y * 0.06)) * 0.15;
        vec3 belt = vec3(0.46, 0.3, 0.15), zone = vec3(0.92, 0.79, 0.52);
        vec3 col = mix(belt, zone, smoothstep(-0.45, 0.45, band));
        col = mix(col, vec3(0.97, 0.93, 0.84), smoothstep(5.0, 9.0, vH) * 0.8);
        vec3 N = normalize(vN);
        {
          // soft relief only: cloud has no grit
          float hd = (n2(p * 0.02) * 1.2 + n2(p * 0.06) * 0.4) * near;
          vec3 dpdx = dFdx(vW), dpdy = dFdy(vW);
          vec3 r1 = cross(dpdy, N), r2 = cross(N, dpdx);
          float det = dot(dpdx, r1);
          vec3 grad = sign(det) * (dFdx(hd) * r1 + dFdy(hd) * r2);
          N = normalize(abs(det) * N - grad);
        }
        float wrap = max((dot(N, L) + 0.3) / 1.3, 0.0);
        float ao = smoothstep(-3.0, 4.0, vH) * 0.6 + 0.4;
        vec3 lit = col * (wrap * mix(0.4, 1.0, vShadow) * 1.3 + 0.12) * ao;
        // Saturn is hazier than Jupiter: the deck goes soft quickly with distance
        vec3 V = normalize(vW - camPos);
        vec3 hz = skyBase(normalize(vec3(V.x, 0.01, V.z)), L);
        lit = mix(lit, hz, 1.0 - exp(-dist / 900.0));
        gl_FragColor = vec4(lit, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  deck.frustumCulled = false;
  scene.add(deck);

  // thin haze sheets above the deck, so you fall past something
  const wisps = new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 1400, 1, 1).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `${COMMON}
        uniform vec3 camPos; varying vec3 vW;
        void main(){
          vec2 p = vW.xz + vec2(time * 0.06, 0.0);
          float d = n2(vec2(p.x * 0.003, p.y * 0.014)) * 0.6 + n2(vec2(p.x * 0.01, p.y * 0.045)) * 0.3 + n2(p * 0.05) * 0.1;
          float a = smoothstep(0.15, 0.75, d) * 0.3;
          float dist = length(vW - camPos);
          a *= smoothstep(1.5, 12.0, abs(vW.y - camPos.y)) * (1.0 - smoothstep(250.0, 650.0, dist));
          vec3 c = vec3(0.96, 0.9, 0.78) * (0.6 + 0.5 * max(normalize(sunDir).y, 0.0));
          gl_FragColor = vec4(c, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  wisps.position.y = 22;
  scene.add(wisps);

  return {
    scene, camera,
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: 0.74,
    update(g, _dt, t, pointer, reduce) {
      U.time.value = reduce ? 0 : t;
      const z = -g * 380;
      const y = 30 - g * 18;
      camera.position.set(0, y, z);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = -pointer.sx * 0.12 - 0.06 * (1 - g);
      // tipped up a little: the rings are the reason to look
      camera.rotation.x = -pointer.sy * 0.04 + 0.1;
      U.camPos.value.copy(camera.position);
      camP.copy(up).multiplyScalar(rs + y / RS_KM);
      sky.position.copy(camera.position);
      wisps.position.set(camera.position.x, 22, camera.position.z - 200);
    },
    readout: p.readout,
  };
}
