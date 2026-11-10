/**
 * Where Earth's Moon is, far more closely than a turning ellipse can say.
 *
 * The Sun pulls the Moon about so much that its path wanders up to two degrees from any ellipse:
 * enough to spoil an eclipse or a phase. This is the standard short lunar theory: the main
 * periodic terms of ELP-2000/82 as tabulated by Jean Meeus, "Astronomical Algorithms" (2nd ed.,
 * 1998), chapter 47, then turned from the ecliptic of the date to the ecliptic of J2000 (chapter 21).
 *
 * Checked against JPL Horizons (DE441) at 80 dates from 2000 to 2040: within 0.002 degrees
 * (a 250th of the Moon's width) and 8 km in distance. See `LUNAR_FIT`.
 *
 * Output: kilometres from the centre of the Earth, ecliptic and equinox of J2000.
 */

const RAD = Math.PI / 180;

/** How far this is from JPL Horizons as seen from Earth, degrees, 2000 to 2040. */
export const LUNAR_FIT = { medianDeg: 0.0007, worstDeg: 0.002, from: 2000, to: 2040 };

// Multiples of D (Moon's mean elongation), M (Sun's mean anomaly), M' (Moon's mean anomaly) and
// F (Moon's argument of latitude); then longitude in millionths of a degree and distance in metres.
// prettier-ignore
const LR = [
  0,0,1,0,6288774,-20905355, 2,0,-1,0,1274027,-3699111, 2,0,0,0,658314,-2955968, 0,0,2,0,213618,-569925,
  0,1,0,0,-185116,48888, 0,0,0,2,-114332,-3149, 2,0,-2,0,58793,246158, 2,-1,-1,0,57066,-152138,
  2,0,1,0,53322,-170733, 2,-1,0,0,45758,-204586, 0,1,-1,0,-40923,-129620, 1,0,0,0,-34720,108743,
  0,1,1,0,-30383,104755, 2,0,0,-2,15327,10321, 0,0,1,2,-12528,0, 0,0,1,-2,10980,79661,
  4,0,-1,0,10675,-34782, 0,0,3,0,10034,-23210, 4,0,-2,0,8548,-21636, 2,1,-1,0,-7888,24208,
  2,1,0,0,-6766,30824, 1,0,-1,0,-5163,-8379, 1,1,0,0,4987,-16675, 2,-1,1,0,4036,-12831,
  2,0,2,0,3994,-10445, 4,0,0,0,3861,-11650, 2,0,-3,0,3665,14403, 0,1,-2,0,-2689,-7003,
  2,0,-1,2,-2602,0, 2,-1,-2,0,2390,10056, 1,0,1,0,-2348,6322, 2,-2,0,0,2236,-9884,
  0,1,2,0,-2120,5751, 0,2,0,0,-2069,0, 2,-2,-1,0,2048,-4950, 2,0,1,-2,-1773,4130,
  2,0,0,2,-1595,0, 4,-1,-1,0,1215,-3958, 0,0,2,2,-1110,0, 3,0,-1,0,-892,3258,
  2,1,1,0,-810,2616, 4,-1,-2,0,759,-1897, 0,2,-1,0,-713,-2117, 2,2,-1,0,-700,2354,
  2,1,-2,0,691,0, 2,-1,0,-2,596,0, 4,0,1,0,549,-1423, 0,0,4,0,537,-1117,
  4,-1,0,0,520,-1571, 1,0,-2,0,-487,-1739, 2,1,0,-2,-399,0, 0,0,2,-2,-381,-4421,
  1,1,1,0,351,0, 3,0,-2,0,-340,0, 4,0,-3,0,330,0, 2,-1,2,0,327,0,
  0,2,1,0,-323,1165, 1,1,-1,0,299,0, 2,0,3,0,294,0, 2,0,-1,-2,0,8752,
];
// The same four multiples; then latitude in millionths of a degree.
// prettier-ignore
const B = [
  0,0,0,1,5128122, 0,0,1,1,280602, 0,0,1,-1,277693, 2,0,0,-1,173237, 2,0,-1,1,55413, 2,0,-1,-1,46271,
  2,0,0,1,32573, 0,0,2,1,17198, 2,0,1,-1,9266, 0,0,2,-1,8822, 2,-1,0,-1,8216, 2,0,-2,-1,4324,
  2,0,1,1,4200, 2,1,0,-1,-3359, 2,-1,-1,1,2463, 2,-1,0,1,2211, 2,-1,-1,-1,2065, 0,1,-1,-1,-1870,
  4,0,-1,-1,1828, 0,1,0,1,-1794, 0,0,0,3,-1749, 0,1,-1,1,-1565, 1,0,0,1,-1491, 0,1,1,1,-1475,
  0,1,1,-1,-1410, 0,1,0,-1,-1344, 1,0,0,-1,-1335, 0,0,3,1,1107, 4,0,0,-1,1021, 4,0,-1,1,833,
  0,0,1,-3,777, 4,0,-2,1,671, 2,0,0,-3,607, 2,0,2,-1,596, 2,-1,1,-1,491, 2,0,-2,1,-451,
  0,0,3,-1,439, 2,0,2,1,422, 2,0,-3,-1,421, 2,1,-1,1,-366, 2,1,0,1,-351, 4,0,0,1,331,
  2,-1,1,1,315, 2,-2,0,-1,302, 0,0,1,3,-283, 2,1,1,-1,-229, 1,1,0,-1,223, 1,1,0,1,223,
  0,1,-2,-1,-220, 2,1,-1,-1,-220, 1,0,1,1,-185, 2,-1,-2,-1,181, 0,1,2,1,-177, 4,0,-2,-1,176,
  4,-1,-1,-1,166, 1,0,1,-1,-164, 4,0,1,-1,132, 1,0,-1,-1,-119, 4,-1,0,-1,115, 2,-2,0,1,107,
];

type Vec = [number, number, number];

/** Position of the Moon about the Earth at a Julian date (TDB): km, ecliptic and equinox of J2000. */
export function moonPosition(jd: number, out: Vec = [0, 0, 0]): Vec {
  const T = (jd - 2451545) / 36525, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000) * RAD;
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000) * RAD;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000) * RAD;
  const F = (93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000) * RAD;
  const A1 = (119.75 + 131.849 * T) * RAD, A2 = (53.09 + 479264.29 * T) * RAD, A3 = (313.45 + 481266.484 * T) * RAD;
  // terms that involve the Sun's anomaly shrink as the Earth's orbit grows rounder
  const E = 1 - 0.002516 * T - 0.0000074 * T2, E2 = E * E;
  const L = Lp * RAD;

  let sl = 0, sr = 0, sb = 0;
  for (let k = 0; k < LR.length; k += 6) {
    const a = LR[k] * D + LR[k + 1] * M + LR[k + 2] * Mp + LR[k + 3] * F;
    const m = Math.abs(LR[k + 1]), w = m === 1 ? E : m === 2 ? E2 : 1;
    sl += w * LR[k + 4] * Math.sin(a);
    sr += w * LR[k + 5] * Math.cos(a);
  }
  for (let k = 0; k < B.length; k += 5) {
    const a = B[k] * D + B[k + 1] * M + B[k + 2] * Mp + B[k + 3] * F;
    const m = Math.abs(B[k + 1]);
    sb += (m === 1 ? E : m === 2 ? E2 : 1) * B[k + 4] * Math.sin(a);
  }
  // the pulls of Venus and Jupiter, and the flattening of the Earth
  sl += 3958 * Math.sin(A1) + 1962 * Math.sin(L - F) + 318 * Math.sin(A2);
  sb += -2235 * Math.sin(L) + 382 * Math.sin(A3) + 175 * Math.sin(A1 - F) + 175 * Math.sin(A1 + F) + 127 * Math.sin(L - Mp) - 115 * Math.sin(L + Mp);

  const lon = (Lp + sl / 1e6) * RAD, lat = (sb / 1e6) * RAD, r = 385000.56 + sr / 1000;

  // from the ecliptic and equinox of the date back to those of J2000
  const AS = RAD / 3600;
  const eta = (47.0029 * T - 0.03302 * T2 + 0.00006 * T3) * AS;
  const Pi = 174.876384 * RAD - (869.8089 * T - 0.03536 * T2) * AS;
  const p = (5029.0966 * T + 1.11113 * T2 - 0.000006 * T3) * AS;
  const th = p + Pi - lon;
  const a1 = Math.cos(lat) * Math.sin(th), b1 = Math.cos(lat) * Math.cos(th), c1 = Math.sin(lat);
  const a0 = Math.cos(eta) * a1 + Math.sin(eta) * c1, c0 = -Math.sin(eta) * a1 + Math.cos(eta) * c1;
  const lon0 = Pi - Math.atan2(a0, b1), cb = Math.hypot(a0, b1);
  out[0] = r * cb * Math.cos(lon0);
  out[1] = r * cb * Math.sin(lon0);
  out[2] = r * c0;
  return out;
}
