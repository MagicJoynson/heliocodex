import * as THREE from 'three';
import { SIMPLEX3 } from './shaders';
import { CELL_GLSL, GLOW_GLSL } from './star';
import type { LowerScene } from './types';

/**
 * A few thousand kilometres above the Sun's visible surface, drifting towards a sunspot.
 * Units are hundreds of kilometres; y is up.
 *
 * The ground is granulation: domed cells of rising gas about 1,500 km across, separated by dark
 * lanes where cooler gas sinks. Ahead is a sunspot with a dark umbra sitting a few hundred km
 * lower than its surroundings (the Wilson depression) and a penumbra of long bright and dark
 * filaments running out from it. Everything glows; nothing is lit. Looking towards the horizon you
 * see the surface ever more edge-on and through higher, cooler gas, so it dims and reddens, just
 * as the edge of the Sun's disc does from Earth. Above, the sky is black with a thin red
 * chromosphere along the horizon.
 */
export interface PhotosphereParams {
  /** where the spot sits ahead, and its umbra and penumbra radii, in 100 km units */
  spot: { z: number; umbra: number; penumbra: number };
  readout: (g: number) => string;
}

const R = 6957; // the Sun's radius in 100 km

export function createPhotosphere(p: PhotosphereParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 4000);
  const small = innerWidth < 760;
  const U = { time: { value: 0 }, camPos: { value: new THREE.Vector3() }, dip: { value: 0 } };
  const S = p.spot;

  const COMMON = /* glsl */ `
  ${SIMPLEX3}
  ${CELL_GLSL}
  ${GLOW_GLSL}
  uniform float time;
  const vec2 SPOT = vec2(0.0, ${S.z.toFixed(1)});
  // spot geometry at p: x = 0 outside .. 1 deep in the umbra, y = penumbra amount, z = filament value
  vec3 spotAt(vec2 p){
    vec2 d = p - SPOT;
    float r = length(d);
    float th = atan(d.y, d.x);
    vec2 ring = vec2(cos(th), sin(th));
    float rp = ${S.penumbra.toFixed(1)} * (1.0 + 0.16 * snoise(vec3(ring * 1.5, 3.0)) + 0.06 * snoise(vec3(ring * 4.5, 1.0)));
    float ru = ${S.umbra.toFixed(1)} * (1.0 + 0.14 * snoise(vec3(ring * 1.8, 8.0)));
    float s = (r - ru) / (rp - ru);
    float fil = snoise(vec3(th * 46.0, s * 2.2 - time * 0.004, 2.0)) * 0.6 + snoise(vec3(th * 120.0, s * 5.0, 5.0)) * 0.4;
    float umb = 1.0 - smoothstep(-0.12, 0.08, s);
    float pen = (1.0 - smoothstep(0.88, 1.06, s)) * (1.0 - umb);
    return vec3(umb, pen, fil);
  }
  // height of the visible surface, 100 km units
  float heightAt(vec2 p, out float bright){
    float t = time * 0.05;
    vec2 q = p / 15.0;
    q += 0.22 * vec2(snoise(vec3(q * 0.7, 1.0)), snoise(vec3(q * 0.7, 7.0)));
    vec2 g = cells(vec3(q, 0.0), t);
    float edge = g.y - g.x;
    float lane = smoothstep(0.0, 0.1, edge);
    // granules are rounded domes, brightest and highest at their middles, falling away into the lanes
    float rise = smoothstep(0.0, 0.2, edge);
    float dome = rise * (1.0 - 0.8 * g.x * g.x);
    float h = dome * 1.7 + 0.12 * snoise(vec3(p / 2.5, t * 0.2)) * lane;
    bright = 0.7 + 0.42 * rise * (1.0 - 0.6 * g.x * g.x) + 0.05 * snoise(vec3(p / 4.0, t * 0.2 + 3.0)) * lane;
    // the supergranule network
    vec2 sg = cells(vec3(p / 300.0, 4.0), t * 0.05);
    float net = 1.0 - smoothstep(0.0, 0.08, sg.y - sg.x);
    bright += net * 0.08 + 0.07 * snoise(vec3(p / 40.0, t * 0.1));
    vec3 sp = spotAt(p);
    // penumbra: filaments, and a slope down into the Wilson depression
    float slope = smoothstep(1.0, 0.0, clamp((length(p - SPOT) - ${S.umbra.toFixed(1)}) / ${(S.penumbra - S.umbra).toFixed(1)}, 0.0, 1.0));
    h = mix(h, 0.5 + sp.z * 0.55 - slope * 2.6, sp.y);
    bright = mix(bright, 0.66 + 0.2 * sp.z, sp.y);
    // umbra: dark floor about 600 km down, with faint umbral dots
    vec2 ud = cells(vec3(p / 3.0, 9.0), t * 0.3);
    float dots = 1.0 - smoothstep(0.0, 0.25, ud.x);
    h = mix(h, -6.0 + 0.3 * dots, sp.x);
    bright = mix(bright, 0.12 + 0.07 * dots, sp.x);
    return h;
  }
  `;

  // ---- the surface: a radial grid that follows the camera -------------------
  const ANG = small ? 300 : 460;
  const rings: number[] = [0];
  for (let r = 0.04; r < 1300; r *= small ? 1.035 : 1.024) rings.push(r);
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

  const ground = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `${COMMON}
      uniform vec3 camPos;
      varying vec3 vW;
      void main(){
        vec2 p = position.xz + vec2(camPos.x, camPos.z);
        float d = length(position.xz);
        float b;
        float h = d < 260.0 ? heightAt(p, b) : 0.0;
        vec3 w = vec3(p.x, h - d * d / ${(2 * R).toFixed(1)}, p.y);
        vW = w;
        gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
      }`,
    fragmentShader: /* glsl */ `${COMMON}
      uniform vec3 camPos;
      varying vec3 vW;
      void main(){
        vec2 p = vW.xz;
        vec3 toC = vW - camPos;
        float dist = length(toC);
        vec3 V = toC / dist;
        float b;
        float h = heightAt(p, b);
        // per-pixel slope from screen-space derivatives: cheap, and sharp where it matters
        vec3 P = vec3(p.x, h, p.y);
        vec3 N = normalize(cross(dFdy(P), dFdx(P)));
        if (N.y < 0.0) N = -N;
        // far away, the cells shrink below a pixel: let them average out
        float foot = length(fwidth(p));
        float far = max(smoothstep(250.0, 700.0, dist), smoothstep(2.0, 7.0, foot));
        vec3 sp = spotAt(p);
        b = mix(b, mix(1.0, 0.7, sp.y) * mix(1.0, 0.15, sp.x), far);
        N = normalize(mix(N, vec3(0.0, 1.0, 0.0), far));
        // seen edge-on, a glowing surface looks dimmer and redder: the same limb darkening as the disc
        float mu = clamp(dot(N, -V), 0.0, 1.0);
        float m = 1.0 - mu;
        vec3 ld = vec3(1.0) - vec3(0.42, 0.6, 0.78) * m - vec3(0.12, 0.12, 0.08) * m * m;
        vec3 col = glow(b) * ld * 1.2;
        // and through more and more of the overlying gas towards the horizon
        float grazing = 1.0 - smoothstep(0.0, 0.25, -V.y);
        col *= mix(vec3(1.0), vec3(0.75, 0.38, 0.16), grazing * smoothstep(80.0, 700.0, dist));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  ground.frustumCulled = false;
  scene.add(ground);

  // ---- sky: black, with the thin red chromosphere along the horizon ----------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide, depthWrite: false, depthTest: false, uniforms: U,
      vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `${SIMPLEX3}
        uniform float time; uniform float dip; varying vec3 vD;
        void main(){
          vec3 d = normalize(vD);
          // measured from the true horizon, which sits below eye level
          float y = d.y + dip;
          float az = atan(d.x, d.z);
          // spicules: thin jets standing up along the horizon
          float sp = 0.55 + 0.45 * snoise(vec3(az * 420.0, y * 60.0, time * 0.02));
          vec3 c = vec3(0.9, 0.2, 0.05) * exp(-abs(y) * 160.0) * 0.32 * sp;
          c += vec3(1.0, 0.55, 0.3) * exp(-max(y, 0.0) * 6.0) * 0.04;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  scene.add(sky);

  return {
    scene, camera,
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: 1,
    update(g, _dt, t, pointer, reduce) {
      U.time.value = reduce ? 0 : t;
      const y = 32 - 20 * g;
      const z = -g * 75;
      camera.position.set(0, y, z);
      camera.rotation.order = 'YXZ';
      // look ahead and a little down, towards the spot
      const toSpot = Math.atan2(y + 3, z - S.z);
      camera.rotation.y = -pointer.sx * 0.1 + 0.04 * (1 - g);
      camera.rotation.x = -Math.min(toSpot * 0.85, 0.5) - pointer.sy * 0.04;
      U.camPos.value.copy(camera.position);
      U.dip.value = Math.sqrt(2 * y / R);
      sky.position.copy(camera.position);
    },
    readout: p.readout,
  };
}
