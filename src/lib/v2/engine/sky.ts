import * as THREE from 'three/webgpu';
import { instancedBufferAttribute, uv, vec4, vec3, float, exp, dot, sub, uniform, texture, max, pow, smoothstep } from 'three/tsl';
import { len, norm, type V3 } from './vec';

/**
 * The space layer: everything far enough away that it can never overlap the ground in front of
 * you, drawn first with no depth test, around a camera that sits at the origin. Stars, the Milky
 * Way's glow, the Sun's disc and glare, and the planets as points of light. Directions are real;
 * distances here are only "far".
 */

const FAR = 1e9; // where things are drawn in this layer, metres (any large number works)

function bvToRgb(bv: number): [number, number, number] {
  const b = Math.max(-0.4, Math.min(2, bv));
  const T = 4600 * (1 / (0.92 * b + 1.7) + 1 / (0.92 * b + 0.62));
  const t = T / 100;
  let r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  let g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  let bl = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); bl = Math.min(255, Math.max(0, bl));
  const m = Math.max(r, g, bl);
  return [0.55 + 0.45 * r / m, 0.55 + 0.45 * g / m, 0.55 + 0.45 * bl / m];
}

export function createSky() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(50, 1, FAR * 0.01, FAR * 4);

  // brightness of the whole star field: dims when you are in bright daylight or near the Sun
  const starGain = uniform(1);

  // ---- the Milky Way's diffuse glow, on a sphere round the camera
  const glowMat = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, depthTest: false, depthWrite: false });
  const glowTex = new THREE.TextureLoader().load('/textures/2k_milky_way_glow.webp');
  glowTex.colorSpace = THREE.SRGBColorSpace;
  glowMat.colorNode = texture(glowTex).rgb.mul(vec3(0.23, 0.215, 0.195)).mul(starGain);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(FAR * 1.2, 48, 24), glowMat);
  glow.renderOrder = -20;
  scene.add(glow);

  // ---- stars: the Yale Bright Star Catalogue, as instanced sprites
  fetch('/data/stars.bin').then((r) => r.arrayBuffer()).then((buf) => {
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

  // ---- the Sun: a disc of the right angular size, plus a soft glare that does not depend on it
  const sunMat = new THREE.SpriteNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const sunDisc = uniform(0.05); // disc radius as a fraction of the sprite's half-width
  {
    const d = sub(uv(), 0.5).mul(2);
    const r = d.length();
    // limb-darkened disc, its edge softened over about a pixel
    const mu = float(1).sub(r.div(sunDisc).pow(2)).max(0).sqrt();
    const edge = float(1).sub(smoothstep(sunDisc.mul(0.92), sunDisc.mul(1.04), r));
    const disc = float(0.4).add(mu.mul(0.6)).mul(6).mul(edge).max(edge.mul(3));
    // glare: a tight core and a wide, faint halo
    const glare = exp(r.div(sunDisc).mul(-1.1)).mul(1.4).add(pow(max(float(0), float(1).sub(r)), float(3)).mul(0.18));
    sunMat.colorNode = vec4(vec3(1, 0.96, 0.9).mul(disc.add(glare)), 1);
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
    // never smaller than a couple of pixels, so from the edge of the system the Sun is still the
    // brightest thing in the sky rather than a faint smudge
    const spritePx = (Math.tan(halo) / Math.tan(THREE.MathUtils.degToRad(main.fov / 2))) * viewH;
    sunDisc.value = Math.min(0.9, Math.max(Math.tan(angR) / Math.tan(halo), 1.6 / Math.max(1, spritePx)));

    for (const b of bodies) {
      const s = glints.get(b.slug);
      if (!s) continue;
      const dl = len(b.rel);
      const d = norm(b.rel);
      s.position.set(d[0] * FAR, d[1] * FAR, d[2] * FAR);
      const ang = b.radius / dl;
      // fades once the body's own disc is a few pixels across
      const fade = Math.max(0, Math.min(1, 1 - (ang - 0.0006) / 0.002));
      s.visible = fade > 0.01;
      s.scale.setScalar(0.014 * fade + 0.004);
    }
  }

  return { scene, camera, update, glint, starGain, glints };
}

export type Sky = ReturnType<typeof createSky>;

/** planets' rough brightness as points */
export const GLINT: Record<string, number> = { mercury: 0.5, venus: 1, earth: 0.8, mars: 0.6, jupiter: 0.95, saturn: 0.75, uranus: 0.45, neptune: 0.4 };
