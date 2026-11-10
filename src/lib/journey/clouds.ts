import * as THREE from 'three';
import { SIMPLEX3 } from './shaders';
import type { LowerScene } from './types';

/**
 * Jupiter's cloud tops, on the northern edge of the Great Red Spot. Distances in kilometres.
 *
 * The storm's raised red deck runs under the camera; ahead is its pale collar and then the South
 * Equatorial Belt, where convective towers break through and lightning flickers below. The cloud
 * deck is one big radial grid lifted in the vertex shader, shaded with a sun-ward shadow march,
 * and the horizon curves away on a 69,911 km planet. Io hangs in the sky at its true size.
 */
export interface CloudParams {
  sunDir: [number, number, number];
  readout: (g: number) => string;
}

const COMMON = /* glsl */ `
${SIMPLEX3}
uniform float time; uniform vec3 sunDir;
float n2(vec2 p){ return snoise(vec3(p, 0.5)); }
// position in the storm's own frame: r = 1 on its edge
vec2 grs(vec2 p){ return (p - vec2(0.0, 2600.0)) / vec2(6400.0, 3200.0); }
float stormR(vec2 p){
  vec2 q = grs(p);
  float a = atan(q.y, q.x);
  // a slightly lumpy edge
  return length(q) * (1.0 + 0.02 * sin(a * 7.0 + 1.3) + 0.012 * sin(a * 17.0));
}
// swirl coordinate inside the storm: it turns anticlockwise, about once in six days at the edge
vec2 swirl(vec2 p){
  vec2 q = grs(p);
  float r = length(q);
  float a = atan(q.y, q.x) - time * 0.004 / max(r, 0.3) + 2.2 * log(r + 0.08);
  return vec2(a, r);
}
float deckH(vec2 p){
  float r = stormR(p);
  float h = 0.0;
  // the storm's deck sits several km higher than the clouds around it
  float inside = smoothstep(1.06, 0.92, r);
  h += inside * (5.5 + 2.5 * (1.0 - r));
  vec2 s = swirl(p);
  h += inside * 0.9 * n2(vec2(s.x * 3.0, s.y * 22.0));
  // billows on the storm's deck: soft rounded heaps, a few km high, drawn out along the flow
  vec2 b = vec2(s.x * 9.0, s.y * 60.0);
  h += inside * (2.4 * pow(max(0.0, n2(b) * 0.5 + 0.5), 2.0) + 1.0 * pow(max(0.0, n2(b * 2.3 + 4.0) * 0.5 + 0.5), 2.0) + 0.9 * pow(max(0.0, n2(p * 0.03) * 0.5 + 0.5), 3.0));
  // collar: a ring of bright, piled-up cloud on the edge
  float collar = exp(-pow((r - 1.07) / 0.035, 2.0));
  h += collar * (3.0 + 2.5 * n2(p * 0.006));
  // the belt beyond: lumpy deck with tall convective towers
  float outside = smoothstep(1.02, 1.14, r);
  vec2 w = p + 60.0 * vec2(n2(p * 0.002), n2(p * 0.002 + 9.0));
  float bill = 0.0, a = 1.6, f = 0.004;
  for (int i = 0; i < 5; i++) { bill += a * (1.0 - abs(n2(w * f + float(i) * 3.1))); f *= 2.1; a *= 0.5; }
  h += outside * (bill - 1.0) * 1.4;
  // towers: rare round domes, some of them big
  vec2 c = floor(p / 70.0);
  vec3 hh = hash33(vec3(c, 4.0));
  if (hh.z < 0.16) {
    vec2 ctr = (c + 0.25 + 0.5 * hh.xy) * 70.0;
    float d = length(p - ctr) / (10.0 + 16.0 * hh.x);
    h += outside * (9.0 + 14.0 * hh.y) * pow(max(0.0, 1.0 - d * d), 0.6) * (1.0 + 0.15 * n2(p * 0.08));
  }
  return h;
}
`;

const SKY = /* glsl */ `
vec3 skyCol(vec3 d, vec3 L){
  float y = max(d.y, 0.0);
  vec3 hor = vec3(0.62, 0.5, 0.38);
  vec3 zen = vec3(0.012, 0.02, 0.05);
  vec3 c = mix(hor, zen, pow(y, 0.32));
  float s = max(dot(d, L), 0.0);
  c += vec3(0.9, 0.75, 0.55) * pow(s, 8.0) * 0.35 * (1.0 - y);
  c += vec3(1.0, 0.95, 0.85) * pow(s, 30000.0) * 6.0;
  c += vec3(1.0, 0.98, 0.94) * 60.0 * smoothstep(0.999996, 0.999998, s);
  return c;
}
`;

export function createClouds(p: CloudParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, 1, 0.05, 9000);
  const sunDir = new THREE.Vector3(...p.sunDir).normalize();
  const small = innerWidth < 760;
  const U = {
    time: { value: 0 }, sunDir: { value: sunDir }, camPos: { value: new THREE.Vector3() },
    flash: { value: 0 }, flashPos: { value: new THREE.Vector2(0, -400) },
    ioDir: { value: new THREE.Vector3(0.42, 0.21, -0.88).normalize() },
  };

  // ---- sky with Io ---------------------------------------------------------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 32),
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide, depthWrite: false, depthTest: false, uniforms: U,
      vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `${COMMON} ${SKY}
        uniform vec3 ioDir; uniform float flash; varying vec3 vD;
        void main(){
          vec3 d = normalize(vD); vec3 L = normalize(sunDir);
          vec3 c = skyCol(d, L);
          c += vec3(0.8, 0.85, 1.0) * flash * 0.25 * exp(-max(d.y, 0.0) * 20.0);
          // Io: 3,643 km wide, 421,700 km away, so about half a degree, the same as our Moon from Earth
          vec3 io = normalize(ioDir);
          float rad = 0.00432;
          float ang = acos(clamp(dot(d, io), -1.0, 1.0));
          if (ang < rad * 1.02) {
            vec3 right = normalize(cross(io, vec3(0.0, 1.0, 0.0)));
            vec3 up = cross(right, io);
            vec2 q = vec2(dot(d - io, right), dot(d - io, up)) / rad;
            float z = sqrt(max(0.0, 1.0 - dot(q, q)));
            vec3 nrm = normalize(right * q.x + up * q.y - io * z);
            float lit = max(dot(nrm, L), 0.0);
            float spots = n2(q * 3.0 + 2.0) * 0.5 + n2(q * 9.0) * 0.25;
            vec3 surf = mix(vec3(0.85, 0.72, 0.32), vec3(0.62, 0.38, 0.16), smoothstep(0.1, 0.6, spots));
            surf = mix(surf, vec3(0.92, 0.9, 0.78), smoothstep(0.55, 0.8, -spots));
            vec3 ioc = surf * lit * 1.6 + surf * 0.015;
            c = mix(c, ioc, smoothstep(1.02, 0.98, length(q)));
          }
          gl_FragColor = vec4(c, 1.0);
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
        // march towards the sun to see if a tower is in the way
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
        // the planet curves away
        float drop = dist * dist / (2.0 * 69911.0);
        vec3 wp = vec3(p.x, h - drop, p.y);
        vW = wp; vN = n; vShadow = sh; vH = h;
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */ `${COMMON} ${SKY}
      uniform vec3 camPos; uniform float flash; uniform vec2 flashPos;
      varying vec3 vW; varying vec3 vN; varying float vShadow; varying float vH;
      void main(){
        vec3 L = normalize(sunDir);
        vec2 p = vW.xz;
        float dist = length(vW - camPos);
        float fw = length(fwidth(p)) + 1e-3;
        float r = stormR(p);
        vec2 s = swirl(p);
        // colour: brick-red storm, pale collar, brown and cream belt
        float near = smoothstep(0.6, 0.05, fw * 0.02);
        float streak = n2(vec2(s.x * 4.0, s.y * 40.0)) * 0.6 + n2(vec2(s.x * 13.0, s.y * 160.0)) * 0.25 + n2(vec2(s.x * 40.0, s.y * 700.0)) * 0.08 * near;
        float knots = n2(p * 0.004 + vec2(s.x, 0.0)) * 0.5 + 0.5;
        vec3 red = mix(vec3(0.34, 0.09, 0.04), vec3(0.86, 0.46, 0.26), smoothstep(-0.55, 0.65, streak + (knots - 0.5) * 0.5));
        red = mix(red, vec3(0.9, 0.62, 0.4), smoothstep(0.45, 0.0, r) * 0.6);
        vec3 col = red;
        vec3 cream = vec3(0.93, 0.86, 0.74);
        float collar = exp(-pow((r - 1.07) / 0.05, 2.0));
        vec2 w = p + 80.0 * vec2(n2(p * 0.0015), n2(p * 0.0015 + 9.0));
        float belt = n2(w * 0.003) * 0.6 + n2(w * 0.011) * 0.3 + n2(w * 0.04) * 0.15;
        vec3 brown = mix(vec3(0.42, 0.25, 0.14), vec3(0.74, 0.52, 0.32), smoothstep(-0.5, 0.6, belt));
        brown = mix(brown, cream, smoothstep(6.0, 16.0, vH));
        col = mix(col, brown, smoothstep(1.02, 1.16, r));
        col = mix(col, cream, collar * 0.85);
        // lighting
        vec3 N = normalize(vN);
        // small cloud relief near the camera, only as lighting
        {
          float hd = (n2(vec2(s.x * 40.0, s.y * 700.0)) * 0.08 + n2(p * 0.12) * 0.3 + n2(p * 0.4) * 0.1) * near;
          vec3 dpdx = dFdx(vW), dpdy = dFdy(vW);
          vec3 r1 = cross(dpdy, N), r2 = cross(N, dpdx);
          float det = dot(dpdx, r1);
          vec3 grad = sign(det) * (dFdx(hd) * r1 + dFdy(hd) * r2);
          N = normalize(abs(det) * N - grad);
        }
        float wrap = max((dot(N, L) + 0.25) / 1.25, 0.0);
        float ao = smoothstep(-2.0, 6.0, vH) * 0.5 + 0.5;
        vec3 lit = col * (wrap * mix(0.35, 1.0, vShadow) * 1.35 + 0.1) * ao;
        // low-lying haze fills the hollows between heaps
        float hollow = smoothstep(7.0, 0.0, vH);
        lit = mix(lit, col * 0.5 + vec3(0.18, 0.1, 0.07), hollow * 0.35);
        // lightning, lighting the cloud from inside and below
        float fl = flash * exp(-length(p - flashPos) / 45.0) * (r > 1.1 ? 1.0 : 0.0);
        lit += vec3(0.75, 0.82, 1.0) * fl * 2.5;
        // haze: the deck melts into the sky towards the horizon
        vec3 V = normalize(vW - camPos);
        vec3 hz = skyCol(normalize(vec3(V.x, 0.01, V.z)), L);
        lit = mix(lit, hz, 1.0 - exp(-dist / 900.0));
        gl_FragColor = vec4(lit, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  deck.frustumCulled = false;
  scene.add(deck);

  // thin wisps of haze a few kilometres above the deck, so you fall past something
  const wisps = new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 1400, 1, 1).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `${COMMON}
        uniform vec3 camPos; varying vec3 vW;
        void main(){
          vec2 p = vW.xz + vec2(time * 0.08, 0.0);
          float d = n2(vec2(p.x * 0.004, p.y * 0.012)) * 0.6 + n2(vec2(p.x * 0.012, p.y * 0.04)) * 0.3 + n2(p * 0.05) * 0.1;
          float a = smoothstep(0.15, 0.7, d) * 0.55;
          float dist = length(vW - camPos);
          a *= smoothstep(1.5, 12.0, abs(vW.y - camPos.y)) * (1.0 - smoothstep(250.0, 650.0, dist));
          vec3 L = normalize(sunDir);
          vec3 c = vec3(0.95, 0.86, 0.74) * (0.55 + 0.6 * max(L.y, 0.0));
          gl_FragColor = vec4(c, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  wisps.position.y = 26;
  scene.add(wisps);

  let nextFlash = 2, flashT = -1;
  return {
    scene, camera,
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: 0.85,
    update(g, dt, t, pointer, reduce) {
      U.time.value = reduce ? 0 : t;
      const z = -g * 420;
      const y = 34 - g * 20;
      camera.position.set(0, y, z);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = -pointer.sx * 0.12 - 0.08 * (1 - g);
      camera.rotation.x = -pointer.sy * 0.04 - 0.07;
      U.camPos.value.copy(camera.position);
      sky.position.copy(camera.position);
      wisps.position.set(camera.position.x, 26, camera.position.z - 200);
      if (!reduce) {
        nextFlash -= dt;
        if (nextFlash <= 0 && flashT < 0) {
          flashT = 0;
          nextFlash = 1.8 + Math.random() * 4.5;
          U.flashPos.value.set((Math.random() - 0.5) * 500, z - 700 - Math.random() * 900);
        }
        if (flashT >= 0) {
          flashT += dt;
          const t1 = flashT;
          U.flash.value = Math.max(0, Math.exp(-t1 * 10) * (0.6 + 0.4 * Math.sin(t1 * 50))) + (t1 > 0.16 && t1 < 0.42 ? Math.exp(-(t1 - 0.16) * 9) * 0.6 : 0);
          if (t1 > 0.8) { flashT = -1; U.flash.value = 0; }
        }
      }
    },
    readout: p.readout,
  };
}
