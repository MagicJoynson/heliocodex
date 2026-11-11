/**
 * Pictures for the lesson "What a black hole is". Every moving thing here follows a real rule:
 * Newton's gravity for the thrown balls and the star's orbit, the escape-speed formula for the
 * squeezed Earth, and Einstein's light paths (Schwarzschild's solution) for the lamp.
 * Figures match the lesson's text: 11.2 km/s, 8.87 mm, 4.3 million Suns, 16 years, 7,650 km/s.
 */
import { type Scene, type Frame, INK, SOFT, FAINT, ACCENT, clamp, ease, mix, label, stars, rng, nf } from '../stage';

const TAU = Math.PI * 2;
const backdrop = stars(140, 7);

// ---- the top of the page: starlight bent round a point of mass
const field = (() => {
  const r = rng(11);
  return Array.from({ length: 1700 }, (_, i) => {
    // two in three stars lie in a loose band, like the Milky Way seen edge on
    const band = i % 3 !== 0, x = r();
    const y = band ? 0.5 + (x - 0.5) * 0.35 + (r() + r() + r() - 1.5) * 0.14 : r();
    const warm = r();
    return { x, y, size: 0.6 + r() * r() * 2.3, a: 0.4 + r() * 0.6, colour: warm > 0.82 ? '255,214,170' : warm < 0.15 ? '190,210,255' : '236,231,220' };
  });
})();
let lensAt: { x: number; y: number } | null = null;

export const lens: Scene = {
  caption: 'Starlight bent round a black hole, drawn with the real formula for light passing a point of mass. The stars are made up.',
  stillAt: 20,
  draw({ ctx, w, h, t, pointer }: Frame) {
    const s = Math.min(w, h), ring = s * 0.24, shadow = ring * 0.42;
    const home = { x: w * (w > 760 ? 0.68 : 0.5), y: h * (w > 760 ? 0.46 : 0.36) };
    const want = pointer ?? home;
    lensAt ??= { ...home };
    lensAt.x += (want.x - lensAt.x) * 0.06; lensAt.y += (want.y - lensAt.y) * 0.06;
    const drift = t * 0.004;
    for (const st of field) {
      const sx = (((st.x - drift) % 1) + 1) % 1 * (w + 80) - 40, sy = st.y * h;
      const dx = sx - lensAt.x, dy = sy - lensAt.y, dist = Math.hypot(dx, dy), u = dist / ring;
      if (u > 7) { ctx.fillStyle = `rgba(${st.colour},${st.a})`; ctx.fillRect(sx, sy, st.size, st.size); continue; }
      if (u < 0.004) continue;
      const root = Math.sqrt(u * u + 4), ux = dx / dist, uy = dy / dist, turn = Math.atan2(uy, ux);
      // a point of mass makes two pictures of every star: one outside the ring, one inside on the far side
      for (const sign of [1, -1]) {
        const th = (u + sign * root) / 2, at = Math.abs(th) * ring;
        if (at < shadow) continue;
        const along = Math.min(Math.abs(th) / u, 16), across = 0.5 * (1 + sign * u / root);
        const gain = Math.min(along * across, 5);
        ctx.fillStyle = `rgba(${st.colour},${clamp(st.a * (0.35 + 0.65 * gain))})`;
        ctx.beginPath();
        ctx.ellipse(lensAt.x + ux * th * ring, lensAt.y + uy * th * ring, Math.max(st.size * 0.6 * across, 0.35), st.size * 0.6 * along, turn, 0, TAU);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(lensAt.x, lensAt.y, shadow, 0, TAU); ctx.fill();
  },
};

// ---- 1. throw a ball
const EARTH_KM = 6371, GM_EARTH = 398600; // km, km³/s²
const throws = [5, 9, 11.2].map((speed) => {
  // straight up from the ground under Newton's gravity, in steps of 4 seconds
  const pts: number[] = [];
  let r = EARTH_KM, v = speed;
  for (let i = 0; i < 6000 && r >= EARTH_KM && r < EARTH_KM * 9; i++) {
    pts.push(r);
    v -= (GM_EARTH / (r * r)) * 4; r += v * 4;
  }
  return { speed, pts, back: r < EARTH_KM * 9 };
});
const throwScene: Scene = {
  caption: 'Three balls thrown straight up from the Earth at 5, 9 and 11.2 km/s, following Newton\'s law of gravity with the air left out. Heights are to scale. Time is speeded up about 900 times.',
  stillAt: 6.5,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.7);
    const s = Math.min(w, h), R = s * 0.15, cx = w / 2, cy = h * 0.8, loop = 10, at = (t % loop) * 900 / 4;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.12);
    glow.addColorStop(0, 'rgba(120,160,220,.28)'); glow.addColorStop(1, 'rgba(120,160,220,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, TAU); ctx.fill();
    const globe = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.5, R * 0.1, cx, cy, R);
    globe.addColorStop(0, '#5d7ea6'); globe.addColorStop(1, '#1b2a40');
    ctx.fillStyle = globe; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    const angles = [-0.62, 0.62, 0];
    throws.forEach((th, i) => {
      const a = angles[i] - Math.PI / 2, n = Math.min(Math.floor(at), th.pts.length - 1), k = R / EARTH_KM;
      ctx.strokeStyle = i === 2 ? ACCENT : 'rgba(236,231,220,.5)'; ctx.lineWidth = 1;
      ctx.beginPath();
      const top = Math.max(...th.pts.slice(0, n + 1));
      ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.lineTo(cx + Math.cos(a) * top * k, cy + Math.sin(a) * top * k);
      ctx.stroke();
      const r = th.pts[n] * k, landed = th.back && n === th.pts.length - 1;
      if (!landed) { ctx.fillStyle = i === 2 ? ACCENT : INK; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3, 0, TAU); ctx.fill(); }
      const lx = cx + Math.cos(a) * (R + 16) + (i === 0 ? -10 : i === 1 ? 10 : 12), ly = cy + Math.sin(a) * (R + 16);
      label(ctx, `${th.speed} km/s`, lx, ly, { align: i === 0 ? 'right' : 'left', colour: i === 2 ? ACCENT : SOFT });
    });
    say('Speed needed to leave the Earth', '11.2 km every second');
  },
};

// ---- 2. squeeze the Earth
const LIGHT = 299792.458, RS_EARTH_KM = 8.87e-6;
function width(km: number): string {
  if (km >= 100) return `${nf(km)} km`;
  if (km >= 1) return `${nf(km, 1)} km`;
  if (km >= 0.001) return `${nf(km * 1000, km >= 0.1 ? 0 : 1)} m`;
  return `${nf(km * 1e6, km * 1e6 >= 100 ? 0 : 1)} mm`;
}
const squeezeScene: Scene = {
  caption: 'The Earth squeezed smaller with its mass kept the same. The speed is worked out from the escape-speed formula; it reaches the speed of light when the Earth is 17.7 mm wide.',
  stillAt: 11,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.7);
    const s = Math.min(w, h), loop = 13, p = ease(((t % loop) - 1) / 8.5);
    const radiusKm = EARTH_KM * Math.pow(RS_EARTH_KM / EARTH_KM, p);
    const speed = Math.min(LIGHT * Math.sqrt(RS_EARTH_KM / radiusKm), LIGHT);
    const cx = w / 2, cy = h * 0.44, R = mix(s * 0.27, s * 0.02, Math.pow(p, 0.8));
    const dark = ease((p - 0.82) / 0.18);
    const globe = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.5, R * 0.1, cx, cy, R);
    globe.addColorStop(0, `rgb(${mix(93, 0, dark)},${mix(126, 0, dark)},${mix(166, 0, dark)})`);
    globe.addColorStop(1, `rgb(${mix(27, 0, dark)},${mix(42, 0, dark)},${mix(64, 0, dark)})`);
    ctx.fillStyle = globe; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    if (dark > 0) { ctx.strokeStyle = `rgba(233,196,138,${dark})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R + 3, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(236,231,220,.16)'; ctx.setLineDash([2, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.27, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    // the gauge: escape speed on a scale where each step is ten times the last
    const x0 = w * 0.12, x1 = w * 0.88, y = h * 0.86, lo = Math.log10(11.186), hi = Math.log10(LIGHT);
    const k = clamp((Math.log10(speed) - lo) / (hi - lo));
    ctx.strokeStyle = 'rgba(236,231,220,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(mix(x0, x1, k), y); ctx.stroke();
    for (const [v, name] of [[11.186, '11.2 km/s'], [LIGHT, 'Light']] as const) {
      const x = mix(x0, x1, (Math.log10(v) - lo) / (hi - lo));
      ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
      label(ctx, name, x, y + 18, { align: v === LIGHT ? 'right' : 'left', colour: v === LIGHT && k >= 1 ? ACCENT : FAINT });
    }
    say(`Width ${width(radiusKm * 2)}`, `To escape ${speed >= LIGHT ? '299,792 km/s, the speed of light' : `${nf(speed, speed < 100 ? 1 : 0)} km/s`}`);
  },
};

// ---- 3. light that cannot leave
// Paths of light round a black hole that is not spinning. With u = (edge radius) / r, a ray obeys
// u'' = -u + 1.5 u², where ' is the rate of change with the angle turned through.
const LAMPS = [4, 2, 1.5, 1.15, 1.02], RAYS = 24, FAR = 9;
function ray(r0: number, tilt: number): { pts: number[]; away: boolean } {
  // tilt: angle between the ray and "straight out", as seen by someone hovering at the lamp
  const b = (r0 * Math.sin(tilt)) / Math.sqrt(1 - 1 / r0);
  let u = 1 / r0, phi = 0;
  let du = -Math.sign(Math.cos(tilt)) * Math.sqrt(Math.max(1 / (b * b) - u * u * (1 - u), 0));
  const step = 0.004, pts = [r0, 0];
  const acc = (x: number) => -x + 1.5 * x * x;
  for (let i = 0; i < 6000; i++) {
    // one step of the classic fourth-order Runge-Kutta rule on the pair (u, du)
    const a1 = acc(u), u2 = u + 0.5 * step * du, d2 = du + 0.5 * step * a1;
    const a2 = acc(u2), u3 = u + 0.5 * step * d2, d3 = du + 0.5 * step * a2;
    const a3 = acc(u3), u4 = u + step * d3, d4 = du + step * a3, a4 = acc(u4);
    u += (step / 6) * (du + 2 * d2 + 2 * d3 + d4); du += (step / 6) * (a1 + 2 * a2 + 2 * a3 + a4); phi += step;
    if (u >= 1) { pts.push(1, phi); return { pts, away: false }; }
    if (u <= 1 / FAR) { pts.push(FAR, phi); return { pts, away: true }; }
    if (i % 4 === 0) pts.push(1 / u, phi);
  }
  return { pts, away: false };
}
const lamps = LAMPS.map((r0) => {
  const rays = Array.from({ length: RAYS }, (_, i) => {
    const tilt = ((i % (RAYS / 2)) * 15 + 7.5) * Math.PI / 180, side = i < RAYS / 2 ? 1 : -1;
    return { ...ray(r0, tilt), side };
  });
  return { r0, rays, away: rays.filter((r) => r.away).length };
});
const lightScene: Scene = {
  caption: 'A lamp lowered towards a black hole that is not spinning, sending out 24 rays in all directions. The paths are worked out from Einstein\'s equations. Amber rays fall in.',
  stillAt: 12.2,
  draw({ ctx, w, h, t, say }) {
    const s = Math.min(w, h), unit = s * 0.075, cx = w / 2, cy = h * 0.56, each = 3.4, stages = lamps.length + 1;
    const stage = Math.floor((t % (each * stages)) / each), grow = ease(((t % each) / each) * 1.5);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, unit, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(233,196,138,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, unit, 0, TAU); ctx.stroke();
    label(ctx, 'The edge', cx, cy + unit + 14, { align: 'center' });
    if (stage === lamps.length) {
      ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(cx, cy - unit, 3, 0, TAU); ctx.fill();
      say('Lamp at the edge itself', 'No light gets away');
      return;
    }
    const lamp = lamps[stage];
    for (const r of lamp.rays) {
      ctx.strokeStyle = r.away ? 'rgba(236,231,220,.75)' : 'rgba(233,196,138,.6)'; ctx.lineWidth = 1;
      ctx.beginPath();
      const n = Math.max(2, Math.floor((r.pts.length / 2) * grow));
      for (let i = 0; i < n; i++) {
        const rad = r.pts[i * 2] * unit, ang = -Math.PI / 2 + r.side * r.pts[i * 2 + 1];
        const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx, cy - lamp.r0 * unit, 3.2, 0, TAU); ctx.fill();
    say(`Lamp at ${nf(lamp.r0, lamp.r0 % 1 ? 2 : 0).replace(/0$/, '')} times the edge's distance from the centre`, `${lamp.away} of ${RAYS} rays get away`);
  },
};

// ---- 4. a real one: the star S2 at the centre of our galaxy
// Period 16 years and closest approach 120 au, with 4.3 million Suns at the focus, give by
// Kepler's third law a half-length of (4.3e6 × 16²)^(1/3) = 1,032 au, so an eccentricity of 0.884.
const S2 = { a: 1032, e: 1 - 120 / 1032, years: 16, fastest: 7650 };
const s2Scene: Scene = {
  caption: 'The orbit of the star S2 round the black hole at the centre of our galaxy, seen from straight above. Its shape and speeds are worked out from its measured period, closest approach and top speed.',
  stillAt: 0.9,
  draw({ ctx, w, h, t, say }) {
    backdrop(ctx, w, h, 0.6);
    const s = Math.min(w, h), loop = 14, phase = (t % loop) / loop, M = phase * TAU;
    let E = M; for (let i = 0; i < 12; i++) E -= (E - S2.e * Math.sin(E) - M) / (1 - S2.e * Math.cos(E));
    const scale = (s * 0.86) / (2 * S2.a), b = S2.a * Math.sqrt(1 - S2.e * S2.e), tilt = -0.62;
    const turn = (x: number, y: number): [number, number] => [x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt)];
    // the black hole sits at one focus of the ellipse, well off centre
    const [ox, oy] = turn(S2.a * S2.e * scale, 0), fx = w / 2 + ox, fy = h * 0.47 + oy;
    const at = (ecc: number): [number, number] => {
      const [x, y] = turn(S2.a * (Math.cos(ecc) - S2.e) * scale, b * Math.sin(ecc) * scale);
      return [fx + x, fy + y];
    };
    ctx.strokeStyle = 'rgba(236,231,220,.2)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i <= 180; i++) { const [x, y] = at((i / 180) * TAU); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    // where it has just been
    for (let i = 1; i <= 26; i++) { const [x, y] = at(E - i * 0.012); ctx.fillStyle = `rgba(236,231,220,${0.5 * (1 - i / 26)})`; ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2); }
    const [sx, sy] = at(E);
    ctx.fillStyle = '#cfe0ff'; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, TAU); ctx.fill();
    label(ctx, 'S2', sx + 9, sy - 9, { colour: SOFT });
    ctx.strokeStyle = 'rgba(138,132,120,.8)'; ctx.beginPath(); ctx.arc(fx, fy, Math.max(30 * scale, 2.5), 0, TAU); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(fx, fy, 1.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = ACCENT; ctx.beginPath(); ctx.arc(fx, fy, 1.6, 0, TAU); ctx.stroke();
    const ly = fy - s * 0.2;
    ctx.strokeStyle = 'rgba(138,132,120,.5)'; ctx.beginPath(); ctx.moveTo(fx, fy - 8); ctx.lineTo(fx, ly + 26); ctx.stroke();
    label(ctx, 'The black hole, unseen', fx + 6, ly, { align: 'right', colour: ACCENT });
    label(ctx, 'Ring round it: Neptune\'s orbit, for size', fx + 6, ly + 16, { align: 'right' });
    const r = S2.a * (1 - S2.e * Math.cos(E)), rp = S2.a * (1 - S2.e);
    const v = S2.fastest * Math.sqrt((2 / r - 1 / S2.a) / (2 / rp - 1 / S2.a));
    say(`Speed ${nf(Math.round(v / 10) * 10)} km/s`, `Year ${Math.min(Math.floor(phase * S2.years) + 1, S2.years)} of ${S2.years}`);
  },
};

// ---- 5. the real thing: the photograph of M87*
const photo = typeof Image === 'undefined' ? null : new Image();
const photoReady = new Promise<void>((done) => { if (!photo) return done(); photo.onload = photo.onerror = () => done(); photo.src = '/img/learn/m87-black-hole-eht.jpg'; });
const photoScene: Scene = {
  caption: 'A real photograph, not a drawing: the black hole at the centre of the galaxy M87, in radio waves, by the Event Horizon Telescope. Published 10 April 2019. Credit: EHT Collaboration, CC BY 4.0. The marks were added here; the black hole itself is about two fifths the width of the dark patch.',
  stillAt: 9,
  ready: photoReady,
  draw({ ctx, w, h, t, say }) {
    const s = Math.min(w, h * 1.05), cx = w / 2, cy = h * 0.48;
    if (photo?.naturalWidth) {
      // drifts slowly closer, then holds
      const size = s * mix(0.98, 1.12, ease(t / 9));
      ctx.drawImage(photo, cx - size / 2, cy - size / 2, size, size);
      // the picture's own black edge is blended into the page
      const edge = ctx.createRadialGradient(cx, cy, size * 0.34, cx, cy, size * 0.5);
      edge.addColorStop(0, 'rgba(11,11,12,0)'); edge.addColorStop(1, 'rgba(11,11,12,1)');
      ctx.fillStyle = edge; ctx.fillRect(0, 0, w, h);
      const k = ease((t - 2.5) / 1.5), ring = size * 0.105;
      if (k > 0) {
        ctx.globalAlpha = k; ctx.strokeStyle = 'rgba(236,231,220,.55)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx + ring * 0.2, cy); ctx.lineTo(cx + size * 0.3, cy - size * 0.2); ctx.stroke();
        label(ctx, 'The shadow', cx + size * 0.3 + 6, cy - size * 0.2, { colour: INK });
        ctx.beginPath(); ctx.moveTo(cx - ring * 0.9, cy + ring * 1.1); ctx.lineTo(cx - size * 0.3, cy + size * 0.24); ctx.stroke();
        label(ctx, 'Hot gas', cx - size * 0.3 - 6, cy + size * 0.24, { colour: INK, align: 'right' });
        ctx.globalAlpha = 1;
      }
    } else label(ctx, 'Fetching the photograph', cx, cy, { align: 'center' });
    label(ctx, 'Photograph', 14, 18, { colour: ACCENT });
    say('M87*, 55 million light years away', 'The mass of 6.5 billion Suns');
  },
};

// ---- 6. swap the Sun for a black hole
const swapScene: Scene = {
  caption: 'The Earth\'s orbit with the Sun, then with a black hole of the same mass in its place. The orbit does not change. Sizes are not to scale.',
  stillAt: 9,
  draw({ ctx, w, h, t, say }) {
    const s = Math.min(w, h), cx = w / 2, cy = h / 2, loop = 14, x = t % loop;
    const gone = x < 5 ? 0 : x < 6.5 ? ease((x - 5) / 1.5) : x < 12.5 ? 1 : 1 - ease((x - 12.5) / 1.5);
    backdrop(ctx, w, h, 0.5 + 0.5 * gone);
    const R = s * 0.34, ang = -t * 0.55;
    ctx.strokeStyle = 'rgba(236,231,220,.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    if (gone < 1) {
      const sun = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.2);
      sun.addColorStop(0, `rgba(255,236,190,${1 - gone})`); sun.addColorStop(0.16, `rgba(255,205,120,${0.9 * (1 - gone)})`);
      sun.addColorStop(0.3, `rgba(255,170,80,${0.22 * (1 - gone)})`); sun.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(cx, cy, s * 0.2, 0, TAU); ctx.fill();
    }
    if (gone > 0) {
      ctx.fillStyle = `rgba(0,0,0,${gone})`; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(233,196,138,${gone})`; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, TAU); ctx.stroke();
    }
    const ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R;
    ctx.fillStyle = `rgb(${mix(110, 52, gone)},${mix(160, 60, gone)},${mix(225, 78, gone)})`;
    ctx.beginPath(); ctx.arc(ex, ey, 4.5, 0, TAU); ctx.fill();
    label(ctx, 'Earth', ex + 10, ey - 10, { colour: gone > 0.5 ? FAINT : SOFT });
    say(gone > 0.5 ? 'At the centre: a black hole with the Sun\'s mass' : 'At the centre: the Sun', 'One lap of the Earth: 365 days, as before');
  },
};

export const scenes: Scene[] = [throwScene, squeezeScene, lightScene, s2Scene, photoScene, swapScene];
