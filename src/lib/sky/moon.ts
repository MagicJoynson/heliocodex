/**
 * Where the Moon is, as seen from the centre of the Earth.
 *
 * The largest terms of the series in Jean Meeus, "Astronomical Algorithms", 2nd edition (1998),
 * chapter 47 (after the ELP-2000/82 lunar theory of Chapront-Touzé and Chapront). With the terms
 * kept here the place is good to about a twentieth of a degree, which is a tenth of the Moon's
 * own width. The mean elements used elsewhere on the site are only good to a degree or so.
 */
const RAD = Math.PI / 180;

// multiples of D, M, M', F, then the size of the term
const LON: number[][] = [ // millionths of a degree, sine
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
  [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888], [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
];
const DIST: number[][] = [ // thousandths of a kilometre, cosine
  [0, 0, 1, 0, -20905355], [2, 0, -1, 0, -3699111], [2, 0, 0, 0, -2955968], [0, 0, 2, 0, -569925], [0, 1, 0, 0, 48888], [0, 0, 0, 2, -3149],
  [2, 0, -2, 0, 246158], [2, -1, -1, 0, -152138], [2, 0, 1, 0, -170733], [2, -1, 0, 0, -204586], [0, 1, -1, 0, -129620], [1, 0, 0, 0, 108743],
  [0, 1, 1, 0, 104755], [2, 0, 0, -2, 10321], [0, 0, 1, -2, 79661], [4, 0, -1, 0, -34782], [0, 0, 3, 0, -23210], [4, 0, -2, 0, -21636],
];
const LAT: number[][] = [ // millionths of a degree, sine
  [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237], [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198], [2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324], [2, 0, 1, 1, 4200],
];

export interface MoonPlace {
  /** Ecliptic longitude and latitude of the date, degrees. */
  lonDeg: number;
  latDeg: number;
  /** Distance between the centres of the Earth and the Moon, km. */
  km: number;
}

/** T is in Julian centuries from J2000. */
export function moonPlace(T: number): MoonPlace {
  const L = 218.3164477 + 481267.88123421 * T;
  const D = (297.8501921 + 445267.1114034 * T) * RAD;
  const M = (357.5291092 + 35999.0502909 * T) * RAD;
  const Mp = (134.9633964 + 477198.8675055 * T) * RAD;
  const F = (93.272095 + 483202.0175233 * T) * RAD;
  // the Sun's pull changes as the Earth's orbit slowly grows rounder
  const E = 1 - 0.002516 * T;
  const sum = (rows: number[][], fn: (x: number) => number) => rows.reduce((s, [d, m, mp, f, size]) => s + size * (m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E) * fn(d * D + m * M + mp * Mp + f * F), 0);
  const lon = L + sum(LON, Math.sin) / 1e6, lat = sum(LAT, Math.sin) / 1e6;
  return { lonDeg: ((lon % 360) + 360) % 360, latDeg: lat, km: 385000.56 + sum(DIST, Math.cos) / 1000 };
}
