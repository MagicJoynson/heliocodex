import * as THREE from 'three';
import { SIMPLEX3 } from './shaders';

/**
 * A planet seen from orbit and all the way down to a few kilometres up.
 *
 * The colour comes from a real global map (4k first, 8k swapped in on large screens). Below the
 * map's own resolution the shader adds procedural detail, octave by octave, as each one becomes
 * bigger than a few pixels. That is what keeps the ground sharp while you fall towards it.
 * Lighting, the terminator, haze and the sky are all done here too, so the orbit view and the
 * low-altitude view are one continuous picture.
 */
export type Detail = 'rock' | 'bands' | 'veil' | 'earth';

export interface PlanetLook {
  map: string;
  mapHi?: string;
  night?: string;
  water?: string;
  clouds?: string;
  detail: Detail;
  /** strength of albedo variation added below the map's resolution */
  grain: number;
  /** strength of procedural relief (lighting only) */
  relief: number;
  /** 0..1 how cratered the close-up ground is */
  craters: number;
  /** colour of scattered light: limb glow, haze and the low-altitude sky */
  air: [number, number, number];
  /** 0 = airless, 1 = Earth-like, >1 thick */
  airDensity: number;
  /** atmosphere height used for the limb glow, in planet radii */
  airHeight: number;
  /** colour of the day side near the terminator */
  dusk: [number, number, number];
  /** sky colours once you are low enough to see sky instead of space */
  skyZenith: [number, number, number];
  skyHorizon: [number, number, number];
  /** altitude (radii) where black space starts turning into sky */
  skyTop: number;
  ambient: number;
  /** limb darkening for gas giants and cloud decks, 0 = none */
  limbDark: number;
  exposure?: number;
  saturation?: number;
}

const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vObj; varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;
void main(){
  vUv = uv; vObj = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}`;

const FRAG = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D map; uniform sampler2D nightMap; uniform sampler2D waterMap; uniform sampler2D cloudMap;
uniform float hasNight, hasWater, hasClouds, cloudShift;
uniform vec3 sunDir; uniform vec3 air; uniform float airDensity; uniform vec3 dusk;
uniform float grain, relief, craters, ambient, limbDark, texRes, time, exposure, saturation;
uniform int kind;
varying vec3 vObj; varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;
${SIMPLEX3}

// fade an octave in as it grows past a few pixels
float octW(float f, float fp){ return smoothstep(0.55, 0.14, f * fp); }

float craterAt(vec3 q, float dens){
  vec3 c = floor(q);
  vec3 h = hash33(c);
  if (h.z > dens) return 0.0;
  vec3 h2 = hash33(c + 17.31);
  vec3 centre = c + 0.25 + 0.5 * vec3(h.xy, h2.z);
  float r = 0.06 + 0.19 * h2.x * h2.x;
  float x = length(q - centre) / r;
  if (x > 1.8) return 0.0;
  float inner = (x * x - 1.0) * 0.42 + 0.14;
  float outer = 0.14 * exp(-(x - 1.0) * (x - 1.0) * 9.0);
  float hgt = x < 1.0 ? max(inner, -0.22) : outer;
  return hgt * r;
}

void main(){
  #include <logdepthbuf_fragment>
  vec3 p = normalize(vObj);
  float fp = length(fwidth(vObj)) + 1e-7;
  vec3 Ng = normalize(vN);
  vec3 L = normalize(sunDir);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 base = texture2D(map, vUv).rgb;

  // ---- detail below the map's resolution ---------------------------------
  float h = 0.0, alb = 0.0;
  float f0 = texRes * 0.18;
  if (kind == 0 || kind == 3) {
    // rock: gentle fbm relief, a few ridges, and craters at many scales
    float f = f0, aw = 1.0, at = 0.0;
    for (int i = 0; i < 12; i++) {
      float w = octW(f, fp);
      if (w <= 0.0) break;
      vec3 q = p * f + float(i) * 7.13;
      float n = snoise(q);
      float r = 1.0 - abs(snoise(q * 0.5 + 11.0));
      h += w * (n * 0.035 + r * r * 0.02) / f;
      alb += w * aw * snoise(q * 1.7 + 3.1);
      at += w * aw;
      aw *= 0.72;
      if (craters > 0.0) {
        float c = craterAt(q * 0.5, craters * 0.55);
        h += w * c / f * 2.4;
        alb += w * clamp(c * 6.0, -0.6, 0.6);
      }
      f *= 2.0;
    }
    alb /= max(at, 1.0);
  } else {
    // cloud decks: a self-similar fluid pattern (warped fbm, stretched along latitude), drawn at the
    // two scales nearest the current pixel size and cross-faded, so it never smears and never
    // repeats while you zoom. Below the map's own resolution only.
    float lv = log2(texRes * 0.35 * fp);           // 0 when map pixels are ~3 screen pixels
    float vis = smoothstep(0.6, -1.4, lv);         // how far past the map we are
    if (vis > 0.0) {
      float l0 = floor(-log2(fp * 220.0));
      float fr = fract(-log2(fp * 220.0));
      float stretch = kind == 1 ? 2.4 : 2.0;
      float acc = 0.0;
      for (int k = 0; k < 2; k++) {
        float F = exp2(l0 + float(k));
        vec3 q = p * F + float(k) * 13.7 + floor(l0) * 3.1;
        q.xz /= stretch;
        vec3 w1 = vec3(snoise(q * 0.5), snoise(q * 0.5 + 7.3), snoise(q * 0.5 + 15.1));
        vec3 w2 = vec3(snoise(q * 0.9 + w1 * 2.2 + 3.3), snoise(q * 0.9 + w1 * 2.2 + 9.4), snoise(q * 0.9 + w1 * 2.2 + 21.0));
        vec3 r = q + w2 * 1.5;
        if (kind == 2) r.y += r.x * 0.35;
        float n = snoise(r) * 0.8 + snoise(r * 1.7 + 5.0) * 0.2;
        // small bright convective clouds, the kind Juno sees casting shadows
        vec3 cc = floor(q * 2.0); vec3 hh = hash33(cc + float(k));
        if (kind == 1 && hh.z < 0.2) { float d = length(q * 2.0 - cc - 0.3 - 0.4 * hh); n += 1.4 * smoothstep(0.22, 0.0, d) - 0.5 * smoothstep(0.3, 0.1, length(q * 2.0 - cc - 0.3 - 0.4 * hh + vec3(0.08))); }
        float wt = k == 0 ? 1.0 - fr : fr;
        acc += n * wt;
      }
      alb = acc * vis;
    }
  }
  float lum0 = dot(base, vec3(0.2126, 0.7152, 0.0722));
  base = mix(vec3(lum0), base, saturation);
  vec3 albedo = base * (1.0 + grain * clamp(alb, -1.2, 1.2));

  // bump from the detail height (same units as the sphere, so it works at any altitude)
  vec3 N = Ng;
  if (relief > 0.0) {
    vec3 dpdx = dFdx(vWorld), dpdy = dFdy(vWorld);
    float hx = dFdx(h) * relief, hy = dFdy(h) * relief;
    vec3 r1 = cross(dpdy, Ng), r2 = cross(Ng, dpdx);
    float det = dot(dpdx, r1);
    vec3 grad = sign(det) * (hx * r1 + hy * r2);
    N = normalize(abs(det) * Ng - grad);
  }

  float ndlG = dot(Ng, L);
  float ndl = dot(N, L);
  float ndv = max(dot(Ng, V), 0.0);

  // day side, with a soft edge for worlds with air
  float soft = 0.04 + 0.1 * min(airDensity, 2.0);
  float day = smoothstep(-soft, soft * 2.0, ndlG);
  float lam = max(ndl, 0.0);
  // ground relief lit on its own, then blended with the smooth terminator
  float light = mix(lam, max(ndl * 0.5 + 0.5, 0.0) * day, 0.12);
  vec3 tint = mix(dusk, vec3(1.0), smoothstep(0.0, 0.35, ndlG));
  vec3 col = albedo * light * tint * 1.35 * exposure;
  if (limbDark > 0.0) col *= mix(1.0, pow(ndv, 0.45), limbDark);

  // clouds cast shadows on the ground (Earth)
  if (hasClouds > 0.5) {
    vec2 su = vUv + vec2(cloudShift, 0.0) - vec2(L.x, L.y) * 0.0015;
    col *= 1.0 - 0.38 * texture2D(cloudMap, su).r * day;
  }

  // water glints (Earth)
  if (hasWater > 0.5) {
    float wet = texture2D(waterMap, vUv).r;
    vec3 Hh = normalize(L + V);
    float sp = pow(max(dot(N, Hh), 0.0), 140.0) * 2.4 + pow(max(dot(N, Hh), 0.0), 18.0) * 0.12;
    col += wet * sp * vec3(1.0, 0.92, 0.8) * smoothstep(0.0, 0.1, ndlG);
    col = mix(col, col * vec3(0.78, 0.9, 1.05), wet * 0.6);
  }

  // city lights on the night side (Earth)
  if (hasNight > 0.5) {
    vec3 nl = texture2D(nightMap, vUv).rgb;
    col += nl * vec3(1.0, 0.78, 0.5) * 1.25 * (1.0 - smoothstep(-0.12, 0.04, ndlG));
  }

  col += albedo * ambient;

  // looking down through the air: more of it towards the limb, lit only where the sun reaches
  if (airDensity > 0.0) {
    float path = 1.0 / max(ndv, 0.035);
    float haze = 1.0 - exp(-0.09 * airDensity * path);
    float lit = smoothstep(-0.25, 0.35, ndlG);
    vec3 scat = air * lit;
    col = mix(col, scat, clamp(haze, 0.0, 0.92));
  }

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const SHELL_FRAG = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 air; uniform vec3 sunDir; uniform float strength;
varying vec3 vObj; varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;
void main(){
  #include <logdepthbuf_fragment>
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vWorld);
  float rim = 1.0 - abs(dot(N, V));
  float glow = pow(rim, 4.5) * 1.3 + pow(rim, 12.0) * 1.6;
  float lit = smoothstep(-0.35, 0.45, dot(N, normalize(sunDir)));
  vec3 c = air * glow * lit * strength;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

const CLOUD_FRAG = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D cloudMap; uniform vec3 sunDir; uniform float shift, texRes, opacity;
varying vec3 vObj; varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;
${SIMPLEX3}
void main(){
  #include <logdepthbuf_fragment>
  vec3 p = normalize(vObj);
  float fp = length(fwidth(vObj)) + 1e-7;
  float c = texture2D(cloudMap, vUv + vec2(shift, 0.0)).r;
  // break the soft map up into clumps once you are close enough to see past its pixels
  float f = texRes * 0.2, d = 0.0, tw = 0.0;
  for (int i = 0; i < 8; i++) {
    float w = smoothstep(0.55, 0.14, f * fp);
    if (w <= 0.0) break;
    d += w * snoise(p * f + float(i) * 5.3) * 0.5;
    tw += w * 0.5;
    f *= 2.0;
  }
  float edge = clamp(c + d * 0.55 * smoothstep(0.02, 0.5, c) - 0.04 * tw, 0.0, 1.0);
  vec3 N = normalize(vN);
  float ndl = dot(N, normalize(sunDir));
  float lit = smoothstep(-0.08, 0.3, ndl);
  vec3 tint = mix(vec3(1.0, 0.62, 0.42), vec3(1.0), smoothstep(0.0, 0.3, ndl));
  vec3 col = vec3(1.0) * tint * (0.08 + 0.95 * lit) * (0.8 + 0.2 * smoothstep(0.2, 0.9, edge));
  gl_FragColor = vec4(col, smoothstep(0.08, 0.75, edge) * opacity);
  #include <colorspace_fragment>
}`;

const SKY_FRAG = /* glsl */ `
uniform vec3 zenith; uniform vec3 horizon; uniform vec3 up; uniform vec3 sunDir; uniform float mixAmt; uniform float dip;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  float e = dot(d, normalize(up)) + dip;
  float t = clamp(e * 2.4, 0.0, 1.0);
  vec3 c = mix(horizon, zenith, pow(t, 0.55));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  c += horizon * pow(s, 6.0) * 0.35 + vec3(1.0, 0.95, 0.85) * pow(s, 400.0) * 1.2;
  gl_FragColor = vec4(c, mixAmt * smoothstep(-0.05, 0.02, e));
  #include <colorspace_fragment>
}`;

export interface Planet {
  group: THREE.Group;
  sky: THREE.Mesh;
  setSun(dir: THREE.Vector3): void;
  /** call every frame with the camera's altitude in radii */
  update(cam: THREE.Camera, altitude: number, t: number): void;
}

export function createPlanet(look: PlanetLook, maxTex: number, wantHi: boolean): Planet {
  const loader = new THREE.TextureLoader();
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const load = (f: string, srgb = true, cb?: (t: THREE.Texture) => void) => {
    const t = loader.load(`/textures/${f}`, cb);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  };
  const sun = new THREE.Vector3(1, 0, 0);
  const kind = { rock: 0, bands: 1, veil: 2, earth: 3 }[look.detail];

  const uni = {
    map: { value: load(look.map) as THREE.Texture },
    nightMap: { value: look.night ? load(look.night) : blank },
    waterMap: { value: look.water ? load(look.water, false) : blank },
    cloudMap: { value: look.clouds ? load(look.clouds, false) : blank },
    hasNight: { value: look.night ? 1 : 0 },
    hasWater: { value: look.water ? 1 : 0 },
    hasClouds: { value: look.clouds ? 1 : 0 },
    cloudShift: { value: 0 },
    sunDir: { value: sun },
    air: { value: new THREE.Vector3(...look.air) },
    airDensity: { value: look.airDensity },
    dusk: { value: new THREE.Vector3(...look.dusk) },
    grain: { value: look.grain },
    relief: { value: look.relief },
    craters: { value: look.craters },
    ambient: { value: look.ambient },
    limbDark: { value: look.limbDark },
    exposure: { value: look.exposure ?? 1 },
    saturation: { value: look.saturation ?? 1 },
    texRes: { value: 4096 },
    time: { value: 0 },
    kind: { value: kind },
  };
  if (look.mapHi && wantHi && maxTex >= 8192) {
    load(look.mapHi, true, (t) => { uni.map.value = t; uni.texRes.value = 8192; });
  }

  const group = new THREE.Group();
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(1, 512, 256),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uni }),
  );
  group.add(surface);

  let cloudMesh: THREE.Mesh | null = null;
  const cloudUni = {
    cloudMap: uni.cloudMap, sunDir: { value: sun }, shift: uni.cloudShift, texRes: { value: 4096 }, opacity: { value: 1 },
  };
  if (look.clouds) {
    cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0016, 384, 192),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: CLOUD_FRAG, uniforms: cloudUni, transparent: true, depthWrite: false }),
    );
    group.add(cloudMesh);
  }

  const shellUni = { air: uni.air, sunDir: { value: sun }, strength: { value: 1 } };
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1 + look.airHeight, 192, 96),
    new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: SHELL_FRAG, uniforms: shellUni,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  if (look.airDensity > 0) group.add(shell);

  // the sky you see once you are inside the air; a dome that follows the camera
  const skyUni = {
    zenith: { value: new THREE.Vector3(...look.skyZenith) },
    horizon: { value: new THREE.Vector3(...look.skyHorizon) },
    up: { value: new THREE.Vector3(0, 1, 0) },
    sunDir: { value: sun },
    mixAmt: { value: 0 },
    dip: { value: 0 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(50, 48, 24),
    new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
      fragmentShader: SKY_FRAG, uniforms: skyUni, side: THREE.BackSide, depthWrite: false, depthTest: false,
      blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    }),
  );
  sky.renderOrder = -5;
  sky.frustumCulled = false;

  return {
    group,
    sky,
    setSun(d) { sun.copy(d).normalize(); },
    update(cam, alt, t) {
      uni.time.value = t;
      uni.cloudShift.value = t * 0.0004;
      sky.position.copy(cam.position);
      skyUni.up.value.copy(cam.position).normalize();
      // the horizon sits below eye level by roughly sqrt(2h)
      skyUni.dip.value = Math.sqrt(2 * Math.max(alt, 0));
      const m = look.airDensity > 0 ? THREE.MathUtils.smoothstep(look.skyTop - alt, 0, look.skyTop * 0.85) : 0;
      skyUni.mixAmt.value = m;
      shellUni.strength.value = 1 - THREE.MathUtils.smoothstep(look.airHeight * 1.2 - alt, 0, look.airHeight);
      if (cloudMesh) cloudUni.opacity.value = 1 - THREE.MathUtils.smoothstep(0.0024 - alt, 0, 0.0012) * 0.6;
    },
  };
}
