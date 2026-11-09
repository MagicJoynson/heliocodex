import * as THREE from 'three';
import { SIMPLEX3 } from './shaders';
import type { Planet } from './planet';

/**
 * The Sun seen from space down to a few thousand kilometres up, in white light.
 *
 * Nothing here is lit; the surface glows. The look is built from what the photosphere really
 * shows: granulation (cells about 1,500 km across that rise, cool and sink in ten minutes or so),
 * the larger supergranulation network, faculae brightening it towards the limb, limb darkening
 * that is stronger in blue than in red, and sunspots with dark umbrae and streaked penumbrae.
 * Detail fades in octave by octave as it grows bigger than a pixel.
 */

export const SUN_KM = 695700;

/** a sunspot: latitude and longitude in degrees, umbra and penumbra radius in km */
export type Spot = [number, number, number, number];

export const CELL_GLSL = /* glsl */ `
// hash33 comes with SIMPLEX3
// cellular noise: distance to the nearest and second-nearest moving feature point
vec2 cells(vec3 p, float t){
  vec3 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 h = hash33(i + g);
    vec3 o = 0.5 + 0.38 * sin(t * (0.6 + 0.5 * h) + 6.2831 * h.yzx);
    vec3 r = g + o - f;
    float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  return sqrt(vec2(d1, d2));
}
`;

/** colour of the glowing gas for a brightness relative to the quiet photosphere (1) */
export const GLOW_GLSL = /* glsl */ `
vec3 glow(float I){
  // cooler gas is redder as well as fainter (linear values: a warm orange-white once on screen)
  vec3 hot = vec3(1.0, 0.6, 0.22);
  vec3 cool = vec3(0.42, 0.07, 0.01);
  return mix(cool, hot, smoothstep(0.08, 1.0, I)) * I;
}
`;

const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vObj; varying vec3 vWorld; varying vec3 vN;
void main(){
  vObj = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}`;

function spotGlsl(spots: Spot[]) {
  return spots.map(([lat, lon, u, pn], i) => {
    const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
    const c = [Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)].map((v) => v.toFixed(6)).join(', ');
    return `I *= spot(n, vec3(${c}), ${(u / SUN_KM).toFixed(6)}, ${(pn / SUN_KM).toFixed(6)}, ${i}.0, fade);`;
  }).join('\n  ');
}

export function createStar(spots: Spot[]): Planet {
  const uni = { time: { value: 0 } };
  const FRAG = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform float time;
varying vec3 vObj; varying vec3 vWorld; varying vec3 vN;
${SIMPLEX3}
${CELL_GLSL}
${GLOW_GLSL}
// how much a sunspot dims this point: 1 outside, about 0.65 in the penumbra, about 0.15 in the umbra
float spot(vec3 n, vec3 c, float ru, float rp, float k, float fade){
  float a = acos(clamp(dot(n, c), -1.0, 1.0));
  if (a > rp * 1.5) return 1.0;
  vec3 t1 = normalize(cross(c, vec3(0.0, 1.0, 0.0)));
  vec3 t2 = cross(c, t1);
  float th = atan(dot(n, t2), dot(n, t1));
  vec2 ring = vec2(cos(th), sin(th));
  // ragged outlines
  float rpe = rp * (1.0 + 0.18 * snoise(vec3(ring * 1.6, k * 7.1)) + 0.08 * snoise(vec3(ring * 5.0, k)));
  float rue = ru * (1.0 + 0.15 * snoise(vec3(ring * 1.9, k * 3.3 + 2.0)));
  float s = a / rpe;
  // penumbral filaments run outwards from the umbra
  float fil = snoise(vec3(th * 38.0, s * 2.5, k + time * 0.002)) * 0.6 + snoise(vec3(th * 90.0, s * 6.0, k)) * 0.4;
  float pen = 0.66 + 0.14 * fil * fade;
  float umb = 0.13 + 0.05 * snoise(vec3(ring * a / ru * 9.0, k));
  float I = mix(pen, 1.0, smoothstep(0.92, 1.04, s));
  I = mix(umb, I, smoothstep(0.88, 1.12, a / rue));
  return I;
}
void main(){
  #include <logdepthbuf_fragment>
  vec3 n = normalize(vObj);
  vec3 V = normalize(cameraPosition - vWorld);
  float mu = clamp(dot(normalize(vN), V), 0.0, 1.0);
  float px = length(fwidth(vObj));
  float t = time * 0.05;

  // granulation: bright rising cells, dark sinking lanes
  float gf = 470.0;
  float fade = 1.0 - smoothstep(0.18, 0.5, px * gf);
  // wobble the cell edges so granules come out rounded, not polygons
  vec3 q = n * gf;
  q += 0.22 * vec3(snoise(q * 0.7 + 1.0), snoise(q * 0.7 + 7.0), snoise(q * 0.7 + 13.0));
  vec2 g = cells(q, t);
  float edge = g.y - g.x;
  float lane = smoothstep(0.0, 0.1, edge);
  float gran = 0.72 + 0.44 * smoothstep(0.0, 0.5, edge) * (0.85 + 0.15 * lane) + 0.05 * snoise(n * 1500.0 + t * 0.2) * lane + 0.07 * snoise(n * 160.0 + t * 0.1);
  // the smallest structure: bright points in the lanes and texture on the cells
  float ff = 1.0 - smoothstep(0.18, 0.5, px * 4000.0);
  gran += ff * 0.05 * snoise(n * 4000.0 + t * 0.3);
  float I = mix(1.0, gran, fade);

  // supergranulation: a network of cells about 30,000 km across, bright at the edges near the limb
  vec2 sg = cells(n * 23.0, t * 0.05);
  float net = 1.0 - smoothstep(0.0, 0.09, sg.y - sg.x);
  I += net * (0.04 + 0.22 * (1.0 - mu)) * (1.0 - smoothstep(0.3, 0.9, px * 23.0));
  // big faculae around active regions, visible near the limb
  I += (1.0 - mu) * 0.12 * smoothstep(0.35, 0.8, snoise(n * 6.0 + 4.0));

  ${spotGlsl(spots)}

  // limb darkening: you see higher, cooler gas towards the edge, and blue fades faster than red
  float m = 1.0 - mu;
  vec3 ld = vec3(1.0) - vec3(0.42, 0.6, 0.78) * m - vec3(0.12, 0.12, 0.08) * m * m;
  vec3 col = glow(I) * ld * 1.04;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

  const group = new THREE.Group();
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(1, 512, 256),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uni }),
  );
  group.add(surface);

  // a soft glare round the disc, the way a camera or an eye sees it; drawn on a card facing the camera
  const glare = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { scale: { value: 8 } },
      vertexShader: /* glsl */ `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        uniform float scale; varying vec2 vP;
        void main(){
          vP = position.xy * scale;
          vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          mv.xy += position.xy * scale;
          gl_Position = projectionMatrix * mv;
          #include <logdepthbuf_vertex>
        }`,
      fragmentShader: /* glsl */ `
        #include <common>
        #include <logdepthbuf_pars_fragment>
        varying vec2 vP;
        void main(){
          #include <logdepthbuf_fragment>
          float r = length(vP);
          if (r < 1.0) discard;
          float x = r - 1.0;
          vec3 c = vec3(1.0, 0.5, 0.16) * (0.22 * exp(-x * 9.0) + 0.07 * exp(-x * 1.6));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  glare.frustumCulled = false;
  glare.renderOrder = 3;
  group.add(glare);

  // the engine expects a sky dome; space here stays black
  const sky = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }));

  return {
    group, sky,
    setSun() { /* the Sun is its own light */ },
    update(_cam, alt, t) {
      uni.time.value = t;
      // the glare is a far-away effect; close in it would only wash out the view
      glare.visible = alt > 0.05;
    },
  };
}
