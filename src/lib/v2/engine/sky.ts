import * as THREE from 'three/webgpu';
import { instancedBufferAttribute, uv, vec4, vec3, float, exp, dot, sub, uniform, texture, max, pow, smoothstep, atan, asin, vec2, mix, fract, sin } from 'three/tsl';
import { len, norm, type V3 } from './vec';

/**
 * The space layer: everything far enough away that it can never overlap the ground in front of
 * you, drawn first with no depth test, around a camera that sits at the origin. Stars, the Milky
 * Way's glow, the Sun's disc and glare, and the planets as points of light. Directions are real;
 * distances here are only "far".
 */

export const FAR = 1e9; // where things are drawn in this layer, metres (any large number works)

function bvToRgb(bv: number): [number, number, number] {
  const b = Math.max(-0.4, Math.min(2, bv));
  const T = 4600 * (1 / (0.92 * b + 1.7) + 1 / (0.92 * b + 0.62));
  const t = T / 100;
  let r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  let g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  let bl = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); bl = Math.min(255, Math.max(0, bl));
  const m = Math.max(r, g, bl);
  return [0.36 + 0.64 * r / m, 0.36 + 0.64 * g / m, 0.36 + 0.64 * bl / m];
}

/** `catalogue: false` leaves the bright-star catalogue out, for when the deep layer draws the stars at their real distances */
export function createSky(opts: { catalogue?: boolean } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(50, 1, FAR * 0.01, FAR * 4);

  // brightness of the whole star field: dims when you are in bright daylight or near the Sun
  const starGain = uniform(1);
  // the painted Milky Way, faded out once you leave the Sun's part of the galaxy
  const glowGain = uniform(1);
  // the Sun's disc and glare, faded out once it is only a star; the planets' glints, once too far to see
  const sunFade = uniform(1);

  // ---- the Milky Way's diffuse glow, on a sphere round the camera
  const glowMat = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, depthTest: false, depthWrite: false });
  const glowTex = new THREE.TextureLoader().load('/textures/2k_milky_way_glow_x8.webp');
  glowTex.colorSpace = THREE.SRGBColorSpace;
  // the picture is stored 8 times brighter than it is shown, blurred smooth, so the dim glow has fine steps instead of flat bands and codec blocks; a trace of noise hides what is left
  const glowGrain = fract(sin(dot(uv().mul(vec2(1317.3, 641.7)), vec2(12.9898, 78.233))).mul(43758.5453)).sub(0.5).mul(0.0007);
  glowMat.colorNode = texture(glowTex).rgb.mul(vec3(0.23, 0.215, 0.195).div(8)).add(vec3(glowGrain)).max(float(0)).mul(starGain).mul(glowGain);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(FAR * 1.2, 48, 24), glowMat);
  glow.renderOrder = -20;
  scene.add(glow);

  // ---- stars: the Yale Bright Star Catalogue, as instanced sprites
  if (opts.catalogue !== false) fetch('/data/stars.bin').then((r) => r.arrayBuffer()).then((buf) => {
    const f = new Float32Array(buf);
    const n = f.length / 5;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 4);
    const px = Math.min(devicePixelRatio, 2);
    for (let i = 0; i < n; i++) {
      // the catalogue is in v1's frame (already y-up), at unit distance
      pos[i * 3] = f[i * 5] * FAR; pos[i * 3 + 1] = f[i * 5 + 1] * FAR; pos[i * 3 + 2] = f[i * 5 + 2] * FAR;
      const b = Math.pow(10, -0.4 * (f[i * 5 + 3] - 0.5));
      const [r, g, bl] = bvToRgb(f[i * 5 + 4]);
      const a = Math.min(1, Math.max(0.04, b * 1.4));
      col[i * 4] = r * a; col[i * 4 + 1] = g * a; col[i * 4 + 2] = bl * a;
      col[i * 4 + 3] = Math.min(7, Math.max(1.6, 1.6 + Math.sqrt(b) * 2.6)) * 2.2 / px; // sprite size in css px
    }
    const mat = new THREE.PointsNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false });
    mat.positionNode = instancedBufferAttribute(new THREE.InstancedBufferAttribute(pos, 3));
    const c = instancedBufferAttribute(new THREE.InstancedBufferAttribute(col, 4)) as unknown as ReturnType<typeof vec4>;
    mat.sizeNode = c.w;
    const d = sub(uv(), 0.5);
    const r2 = dot(d, d).mul(4);
    const fall = exp(r2.mul(-5)).add(exp(r2.mul(-1.2)).mul(0.25)).mul(max(float(0), float(1).sub(r2)));
    mat.colorNode = vec4(c.xyz.mul(fall).mul(starGain), 1);
    const stars = new THREE.Sprite(mat);
    stars.count = n;
    stars.frustumCulled = false;
    stars.renderOrder = -10;
    scene.add(stars);
  });

  // ---- the Sun: a disc of the right angular size, with limb darkening and surface texture, and a warm glare
  const sunMat = new THREE.SpriteNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const sunDisc = uniform(0.05); // disc radius as a fraction of the sprite's half-width
  const sunBoost = uniform(1); // lifts a Sun too small to show as a disc, so it is still the brightest thing
  const sunTex = new THREE.TextureLoader().load('/textures/4k_sun.webp');
  sunTex.colorSpace = THREE.SRGBColorSpace;
  sunTex.wrapS = sunTex.wrapT = THREE.RepeatWrapping;
  {
    const d = sub(uv(), 0.5).mul(2);
    const r = d.length();
    const p = d.div(sunDisc); // the point on the disc, its radius 1
    const q = p.length();
    // mu: how squarely this point faces us (1 at the centre, 0 at the limb)
    const mu = float(1).sub(q.mul(q)).max(0).sqrt();
    const edge = float(1).sub(smoothstep(0.97, 1.015, q));
    // the visible hemisphere of the surface picture, for its granulation and spots (its light and dark only)
    const lon = atan(p.x, mu), lat = asin(p.y.clamp(-1, 1));
    const uvs = vec2(lon.div(6.2832).add(0.5), lat.div(3.1416).add(0.5));
    const lumaAt = (c: any) => dot(texture(sunTex, c).rgb, vec3(0.3, 0.59, 0.11));
    // fine granulation: the picture's light and dark repeated small, plus a trace of its large spots
    const detail = float(1).add(lumaAt(uvs.mul(vec2(7, 7))).sub(0.615).mul(0.35)).add(lumaAt(uvs).sub(0.615).mul(0.12)).clamp(0.85, 1.15);
    // limb darkening (about 0.6), and the limb redder than the centre, as the real one is
    const dark = float(1).sub(float(0.6).mul(float(1).sub(mu)));
    const tint = mix(vec3(1.0, 0.36, 0.12), vec3(1.0, 0.9, 0.7), pow(mu, 0.45));
    const disc = tint.mul(dark).mul(detail).mul(2.3).mul(edge);
    // glare: a warm corona hugging the limb, and a faint wider one, both gone before the sprite's edge
    const out = max(float(0), q.sub(1));
    const corona = exp(out.mul(-3)).mul(1.1).add(exp(out.mul(-0.7)).mul(0.05)).mul(float(1).sub(edge)).mul(float(1).sub(smoothstep(0.55, 1, r)));
    // a trace of noise on the glow, so its slow fade does not show as bands of colour
    const grain = fract(sin(dot(uv().mul(vec2(917.3, 541.7)), vec2(12.9898, 78.233))).mul(43758.5453)).sub(0.5).mul(2.2 / 255);
    sunMat.colorNode = vec4(disc.add(vec3(1, 0.74, 0.46).mul(corona)).add(vec3(grain).mul(smoothstep(0, 0.02, corona))).mul(sunBoost).mul(sunFade), 1);
  }
  const sun = new THREE.Sprite(sunMat);
  sun.renderOrder = 5;
  scene.add(sun);

  // ---- planets as points of light
  const dotMat = (brightness: number) => {
    const m = new THREE.SpriteNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false });
    const d = sub(uv(), 0.5).mul(2);
    const r2 = dot(d, d);
    m.colorNode = vec4(vec3(1, 0.97, 0.92).mul(exp(r2.mul(-9)).mul(brightness)), 1);
    return m;
  };
  const glints = new Map<string, THREE.Sprite>();
  function glint(slug: string, brightness: number) {
    const s = new THREE.Sprite(dotMat(brightness));
    s.renderOrder = 4;
    scene.add(s);
    glints.set(slug, s);
    return s;
  }

  /**
   * Each frame: copy the main camera's view, aim the Sun, and place the planets.
   * `sunRel` is the Sun's position minus the camera's (metres). `bodies` gives each other body's
   * position minus the camera's and its radius, for glints that fade once a disc can be seen.
   */
  function update(main: THREE.PerspectiveCamera, sunRel: V3, bodies: { slug: string; rel: V3; radius: number }[], viewH = 900, sunGlareScale = 1) {
    // far out the Sun is a star (the deep layer draws it) and the planets are lost in its light
    const AU = 149_597_870_700;
    sunFade.value = 1 - smoothN(1000 * AU, 3000 * AU, len(sunRel));
    const glintFade = 1 - smoothN(300 * AU, 2000 * AU, len(sunRel));
    camera.quaternion.copy(main.quaternion);
    camera.fov = main.fov; camera.aspect = main.aspect;
    camera.updateProjectionMatrix();

    const ds = len(sunRel);
    const dir = norm(sunRel);
    const angR = Math.asin(Math.min(1, 695_700_000 / ds)); // angular radius of the disc
    // the sprite spans the glare; the disc is a fraction of it
    const halo = Math.min(0.9, Math.max(angR * 18, 0.035)) * sunGlareScale;
    sun.position.set(dir[0] * FAR, dir[1] * FAR, dir[2] * FAR);
    sun.scale.setScalar(2 * FAR * Math.tan(halo));
    sun.visible = sunFade.value > 0.001;
    // never smaller than a couple of pixels, so from the edge of the system the Sun is still the
    // brightest thing in the sky rather than a faint smudge
    const spritePx = (Math.tan(halo) / Math.tan(THREE.MathUtils.degToRad(main.fov / 2))) * viewH;
    sunDisc.value = Math.min(0.9, Math.max(Math.tan(angR) / Math.tan(halo), 1.6 / Math.max(1, spritePx)));

    sunBoost.value = Math.max(1, 14 / Math.max(1, sunDisc.value * spritePx));

    for (const b of bodies) {
      const s = glints.get(b.slug);
      if (!s) continue;
      const dl = len(b.rel);
      const d = norm(b.rel);
      s.position.set(d[0] * FAR, d[1] * FAR, d[2] * FAR);
      const ang = b.radius / dl;
      // fades once the body's own disc is a few pixels across
      const fade = Math.max(0, Math.min(1, 1 - (ang - 0.0006) / 0.002));
      s.visible = fade * glintFade > 0.01;
      s.scale.setScalar((0.014 * fade + 0.004) * glintFade);
    }
  }

  return { scene, camera, update, glint, starGain, glowGain, glints };
}

function smoothN(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export type Sky = ReturnType<typeof createSky>;

/** planets' rough brightness as points */
export const GLINT: Record<string, number> = { mercury: 0.5, venus: 1, earth: 0.8, mars: 0.6, jupiter: 0.95, saturn: 0.75, uranus: 0.45, neptune: 0.4 };
