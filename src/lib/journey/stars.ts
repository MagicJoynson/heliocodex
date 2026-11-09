import * as THREE from 'three';

/**
 * The real night sky: 9,096 stars from the Yale Bright Star Catalogue (NASA HEASARC copy of
 * BSC5P), placed by their true positions, sized by brightness and coloured by their B-V index.
 * A heavily blurred Milky Way map sits behind them for the diffuse glow only.
 */
function bvToRgb(bv: number): [number, number, number] {
  const b = Math.max(-0.4, Math.min(2, bv));
  // Ballesteros (2012): colour index to temperature
  const T = 4600 * (1 / (0.92 * b + 1.7) + 1 / (0.92 * b + 0.62));
  // rough blackbody to sRGB (Tanner Helland's fit), normalised
  const t = T / 100;
  let r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  let g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  let bl = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); bl = Math.min(255, Math.max(0, bl));
  const m = Math.max(r, g, bl);
  // soften: real stars look much whiter than their blackbody colour
  return [0.55 + 0.45 * r / m, 0.55 + 0.45 * g / m, 0.55 + 0.45 * bl / m];
}

export function createStars(radius = 300): { group: THREE.Group; setFade(f: number): void } {
  const group = new THREE.Group();
  const uni = { fade: { value: 1 }, px: { value: Math.min(devicePixelRatio, 2) } };

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.05, 48, 24),
    new THREE.MeshBasicMaterial({
      color: 0x3a3631, side: THREE.BackSide, depthWrite: false, depthTest: false,
      blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    }),
  );
  glow.renderOrder = -12;
  new THREE.TextureLoader().load('/textures/2k_milky_way_glow.webp', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    (glow.material as THREE.MeshBasicMaterial).map = t;
    (glow.material as THREE.MeshBasicMaterial).needsUpdate = true;
  });
  group.add(glow);

  fetch('/data/stars.bin').then((r) => r.arrayBuffer()).then((buf) => {
    const f = new Float32Array(buf);
    const n = f.length / 5;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), mag = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = f[i * 5] * radius; pos[i * 3 + 1] = f[i * 5 + 1] * radius; pos[i * 3 + 2] = f[i * 5 + 2] * radius;
      mag[i] = f[i * 5 + 3];
      col.set(bvToRgb(f[i * 5 + 4]), i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('tint', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('mag', new THREE.BufferAttribute(mag, 1));
    const pts = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: uni, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 tint; attribute float mag; uniform float px; uniform float fade;
        varying vec3 vC; varying float vA;
        void main(){
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          float b = pow(10.0, -0.4 * (mag - 0.5));
          gl_PointSize = clamp(1.6 + sqrt(b) * 2.6, 1.6, 7.0) * px;
          vA = clamp(b * 1.4, 0.04, 1.0) * fade;
          vC = tint;
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vC; varying float vA;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float r2 = dot(d, d) * 4.0;
          float a = exp(-r2 * 5.0) + 0.25 * exp(-r2 * 1.2);
          gl_FragColor = vec4(vC * a * vA, 1.0);
          #include <colorspace_fragment>
        }`,
    }));
    pts.renderOrder = -10;
    pts.frustumCulled = false;
    group.add(pts);
  });

  return {
    group,
    setFade(v) {
      uni.fade.value = v;
      (glow.material as THREE.MeshBasicMaterial).opacity = v;
    },
  };
}
