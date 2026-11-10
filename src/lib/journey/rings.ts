import * as THREE from 'three';
import { hash } from './noise';

/**
 * Saturn's rings as a radial profile, built from the measured edges of the main rings (NASA/JPL
 * Saturn ring fact sheet). Distances in Saturn equatorial radii (60,268 km). Opacity follows the
 * rough optical depth of each ring, and fine ringlets are added inside each one so the bands never
 * look flat. RGB is the ring colour, A is how much light the ring blocks.
 */
export const RS_KM = 60268;
export const RING_IN = 66900 / RS_KM;   // inner edge of the D ring
export const RING_OUT = 140600 / RS_KM; // just past the F ring

const km = (k: number) => k / RS_KM;
// [inner km, outer km, opacity, colour, ringlet strength]
const BANDS: [number, number, number, [number, number, number], number][] = [
  [66900, 74510, 0.03, [0.55, 0.5, 0.46], 0.5],      // D ring: barely there
  [74658, 92000, 0.16, [0.56, 0.5, 0.45], 0.9],      // C ring: dusky, with bright plateaus
  [92000, 99000, 0.75, [0.86, 0.75, 0.6], 0.35],    // inner B ring
  [99000, 117580, 0.96, [0.94, 0.83, 0.65], 0.25],   // B ring core: nearly opaque, the brightest part
  [117580, 122170, 0.1, [0.6, 0.56, 0.52], 0.8],     // Cassini Division
  [122170, 133423, 0.55, [0.84, 0.78, 0.7], 0.35],   // A ring, inside the Encke gap
  [133748, 136487, 0.48, [0.82, 0.78, 0.72], 0.3],   // A ring outside the Encke gap, to the Keeler gap
  [136529, 136775, 0.42, [0.8, 0.76, 0.7], 0.2],     // the thin outer edge of the A ring
  [140080, 140330, 0.18, [0.86, 0.82, 0.76], 0],     // F ring (drawn a little wider than it is so it does not break into dots)
];

export function createRingTexture(width = 4096): THREE.DataTexture {
  const data = new Uint8Array(width * 4);
  for (let i = 0; i < width; i++) {
    const r = RING_IN + (i + 0.5) / width * (RING_OUT - RING_IN);
    let a = 0, c: [number, number, number] = [0, 0, 0];
    for (const [k0, k1, op, col, rl] of BANDS) {
      const r0 = km(k0), r1 = km(k1);
      if (r < r0 || r > r1) continue;
      const t = (r - r0) / (r1 - r0);
      // ringlets: a mix of a few frequencies, stronger in the fainter rings
      const n = Math.sin(r * 2900) * 0.35 + Math.sin(r * 1130 + 1.7) * 0.3 + Math.sin(r * 410 + 0.4) * 0.35;
      const grain = hash(i, 7) - 0.5;
      let o = op * (1 + rl * (0.5 * n + 0.25 * grain));
      // C ring plateaus: a few bright flat-topped bands near its outer half
      if (k0 === 74658 && t > 0.55 && Math.sin(t * 38) > 0.55) o = Math.max(o, 0.42);
      // soft edges, except the sharp outer edges of the B and A rings
      const edge = Math.min(1, t * 60, (1 - t) * (k1 === 117580 || k1 === 136775 ? 400 : 60));
      a = Math.min(1, Math.max(0, o)) * edge;
      c = col;
    }
    data[i * 4] = Math.round(c[0] * 255);
    data[i * 4 + 1] = Math.round(c[1] * 255);
    data[i * 4 + 2] = Math.round(c[2] * 255);
    data[i * 4 + 3] = Math.round(a * 255);
  }
  const tex = new THREE.DataTexture(data, width, 1, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  // mipmaps, or the fine ringlets shimmer into moiré from far away
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** GLSL: look up the rings at radius r (in Saturn radii). Returns colour and opacity. */
export const RING_GLSL = /* glsl */ `
uniform sampler2D ringTex;
vec4 ringAt(float r){
  float u = (r - ${RING_IN.toFixed(6)}) / ${(RING_OUT - RING_IN).toFixed(6)};
  if (u < 0.0 || u > 1.0) return vec4(0.0);
  return texture2D(ringTex, vec2(u, 0.5));
}
// does a ray from q towards the sun hit the planet (unit sphere)?
float planetShadow(vec3 q, vec3 L){
  float b = dot(q, L);
  float c = dot(q, q) - 1.0;
  float disc = b * b - c;
  return (b < 0.0 && disc > 0.0) ? smoothstep(0.0, 0.02, disc) : 0.0;
}
`;

const RING_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vObj; varying vec3 vWorld;
void main(){
  vObj = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}`;

const RING_FRAG = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 sunDir;
varying vec3 vObj; varying vec3 vWorld;
${RING_GLSL}
void main(){
  #include <logdepthbuf_fragment>
  vec3 L = normalize(sunDir);
  float r = length(vObj.xz);
  vec4 rg = ringAt(r);
  if (rg.a < 0.004) discard;
  vec3 V = normalize(cameraPosition - vWorld);
  // which face of the rings are we looking at, and which face does the sun light?
  bool sameSide = (V.y > 0.0) == (L.y > 0.0);
  float sunUp = abs(L.y);
  // lit face: brighter where thick; unlit face: only light that leaks through thin rings
  float lit = sameSide ? (0.35 + 0.65 * smoothstep(0.0, 0.25, sunUp)) : (1.0 - rg.a) * rg.a * 2.2 * smoothstep(0.0, 0.1, sunUp);
  // forward scattering makes thin rings glow when you look towards the sun through them
  float fwd = pow(max(dot(-V, L), 0.0), 6.0) * (1.0 - rg.a) * 0.6;
  float shadow = 1.0 - planetShadow(vObj, L);
  vec3 col = rg.rgb * (lit + fwd) * shadow * 1.15;
  // a little of Saturn's own light on the unlit side
  col += rg.rgb * 0.015;
  gl_FragColor = vec4(col, rg.a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function createRingMesh(tex: THREE.Texture, sun: THREE.Vector3): THREE.Mesh {
  const geo = new THREE.RingGeometry(RING_IN, RING_OUT, 720, 4).rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    vertexShader: RING_VERT, fragmentShader: RING_FRAG,
    uniforms: { ringTex: { value: tex }, sunDir: { value: sun } },
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  }));
  mesh.renderOrder = 2;
  return mesh;
}
