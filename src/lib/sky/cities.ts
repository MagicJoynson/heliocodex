// Places to choose from when the visitor would rather not share where they are.
// Latitude north, longitude east, in degrees, to the nearest hundredth.
export const CITIES: [string, number, number][] = [
  ['London', 51.51, -0.13], ['Manchester', 53.48, -2.24], ['Edinburgh', 55.95, -3.19], ['Dublin', 53.35, -6.26],
  ['Reykjavik', 64.15, -21.94], ['Tromsø', 69.65, 18.96], ['Stockholm', 59.33, 18.07], ['Paris', 48.86, 2.35],
  ['Berlin', 52.52, 13.4], ['Madrid', 40.42, -3.7], ['Rome', 41.9, 12.5], ['Athens', 37.98, 23.73],
  ['Istanbul', 41.01, 28.98], ['Moscow', 55.76, 37.62], ['Cairo', 30.04, 31.24], ['Lagos', 6.52, 3.38],
  ['Nairobi', -1.29, 36.82], ['Johannesburg', -26.2, 28.05], ['Dubai', 25.2, 55.27], ['Delhi', 28.61, 77.21],
  ['Mumbai', 19.08, 72.88], ['Singapore', 1.35, 103.82], ['Beijing', 39.9, 116.41], ['Tokyo', 35.68, 139.69],
  ['Sydney', -33.87, 151.21], ['Auckland', -36.85, 174.76], ['Honolulu', 21.31, -157.86], ['Los Angeles', 34.05, -118.24],
  ['Denver', 39.74, -104.99], ['Chicago', 41.88, -87.63], ['New York', 40.71, -74.01], ['Toronto', 43.65, -79.38],
  ['Mexico City', 19.43, -99.13], ['Bogotá', 4.71, -74.07], ['Lima', -12.05, -77.04], ['São Paulo', -23.55, -46.63],
  ['Buenos Aires', -34.6, -58.38], ['Santiago', -33.45, -70.67],
  ['Perth', -31.95, 115.86], ['Brisbane', -27.47, 153.03], ['Adelaide', -34.93, 138.6], ['Seoul', 37.57, 126.98],
  ['Hong Kong', 22.32, 114.17], ['Manila', 14.6, 120.98], ['Bangkok', 13.76, 100.5], ['Jakarta', -6.2, 106.85],
  ['Dhaka', 23.81, 90.41], ['Karachi', 24.86, 67.01], ['Tehran', 35.69, 51.39], ['Riyadh', 24.71, 46.68],
  ['Cape Town', -33.92, 18.42], ['Kyiv', 50.45, 30.52], ['Warsaw', 52.23, 21.01], ['Lisbon', 38.72, -9.14],
  ['Vienna', 48.21, 16.37], ['Oslo', 59.91, 10.75], ['Helsinki', 60.17, 24.94],
  ['Vancouver', 49.28, -123.12], ['Anchorage', 61.22, -149.9], ['Houston', 29.76, -95.37], ['Miami', 25.76, -80.19], ['Caracas', 10.48, -66.9],
];
// the device's clock names a city for its time zone (the IANA name, such as Australia/Perth); these are the zones named for a city
// that is not in the list, so they point to the listed city in the same zone or the nearest one
const ALSO: Record<string, string> = {
  Kolkata: 'Delhi', Calcutta: 'Delhi', Shanghai: 'Beijing', Sao_Paulo: 'São Paulo', Bogota: 'Bogotá', Argentina: 'Buenos Aires', Buenos_Aires: 'Buenos Aires',
  Detroit: 'New York', Montreal: 'Toronto', Boston: 'New York', Washington: 'New York', Atlanta: 'New York', Halifax: 'New York', Indianapolis: 'New York',
  Winnipeg: 'Chicago', Dallas: 'Houston', Phoenix: 'Denver', Edmonton: 'Denver', Calgary: 'Denver', Boise: 'Denver', Seattle: 'Vancouver', Juneau: 'Anchorage',
  Havana: 'Miami', Panama: 'Bogotá', Guayaquil: 'Bogotá', Montevideo: 'Buenos Aires', Asuncion: 'Buenos Aires', La_Paz: 'Lima',
  Belfast: 'London', Jersey: 'London', Isle_of_Man: 'London', Brussels: 'Paris', Amsterdam: 'Paris', Luxembourg: 'Paris', Zurich: 'Paris', Prague: 'Berlin', Copenhagen: 'Berlin', Budapest: 'Vienna', Bucharest: 'Athens', Sofia: 'Athens', Kiev: 'Kyiv', Minsk: 'Moscow', Riga: 'Helsinki', Tallinn: 'Helsinki', Vilnius: 'Helsinki', Belgrade: 'Vienna', Zagreb: 'Vienna', Barcelona: 'Madrid',
  Melbourne: 'Sydney', Canberra: 'Sydney', Hobart: 'Sydney', Darwin: 'Adelaide', Chongqing: 'Beijing', Taipei: 'Hong Kong', Macau: 'Hong Kong', Ho_Chi_Minh: 'Bangkok', Saigon: 'Bangkok', Kuala_Lumpur: 'Singapore', Colombo: 'Mumbai', Kathmandu: 'Delhi', Kabul: 'Karachi', Tashkent: 'Karachi', Baghdad: 'Riyadh', Kuwait: 'Riyadh', Qatar: 'Dubai', Muscat: 'Dubai', Jerusalem: 'Athens', Tel_Aviv: 'Athens', Beirut: 'Athens', Amman: 'Athens', Addis_Ababa: 'Nairobi', Dar_es_Salaam: 'Nairobi', Accra: 'Lagos', Algiers: 'Paris', Casablanca: 'Madrid', Tunis: 'Rome', Harare: 'Johannesburg', Maputo: 'Johannesburg',
  Fiji: 'Auckland', Tongatapu: 'Auckland', Azores: 'Reykjavik', Canary: 'Lisbon', Madeira: 'Lisbon',
};
const CONTINENT_LAT: Record<string, (lat: number) => boolean> = { Australia: (a) => a < 0, Antarctica: (a) => a < 0, Europe: (a) => a > 34, Asia: (a) => a > -12, America: () => true, Africa: () => true, Pacific: () => true, Atlantic: () => true, Indian: () => true };

/** A first guess at where the visitor is, from the IANA name of the time zone their device is set to. Nothing is sent anywhere. */
export function guess(): number {
  let zone = '';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''; } catch { /* keep the default */ }
  const parts = zone.split('/'), last = parts[parts.length - 1] ?? '';
  const name = ALSO[last] ?? ALSO[parts[1] ?? ''] ?? last.replace(/_/g, ' ');
  const found = CITIES.findIndex((c) => c[0] === name);
  if (found >= 0) return found;
  // a zone named for a place that is not listed: of the cities on the same side of the Equator or continent, the one nearest the clock's offset from UTC
  const lon = (-new Date().getTimezoneOffset() / 60) * 15, ok = CONTINENT_LAT[parts[0]] ?? (() => true);
  let best = 0, gap = Infinity;
  CITIES.forEach((c, i) => { if (!ok(c[1])) return; const g = Math.abs(c[2] - lon); if (g < gap) { gap = g; best = i; } });
  return best;
}

/** The time zone each listed city keeps its clocks by (IANA names), so times can be given as they read there. */
export const ZONES: Record<string, string> = {
  London: 'Europe/London', Manchester: 'Europe/London', Edinburgh: 'Europe/London', Dublin: 'Europe/Dublin', Reykjavik: 'Atlantic/Reykjavik',
  'Tromsø': 'Europe/Oslo', Stockholm: 'Europe/Stockholm', Paris: 'Europe/Paris', Berlin: 'Europe/Berlin', Madrid: 'Europe/Madrid', Rome: 'Europe/Rome',
  Athens: 'Europe/Athens', Istanbul: 'Europe/Istanbul', Moscow: 'Europe/Moscow', Cairo: 'Africa/Cairo', Lagos: 'Africa/Lagos', Nairobi: 'Africa/Nairobi',
  Johannesburg: 'Africa/Johannesburg', Dubai: 'Asia/Dubai', Delhi: 'Asia/Kolkata', Mumbai: 'Asia/Kolkata', Singapore: 'Asia/Singapore', Beijing: 'Asia/Shanghai',
  Tokyo: 'Asia/Tokyo', Sydney: 'Australia/Sydney', Auckland: 'Pacific/Auckland', Honolulu: 'Pacific/Honolulu', 'Los Angeles': 'America/Los_Angeles',
  Denver: 'America/Denver', Chicago: 'America/Chicago', 'New York': 'America/New_York', Toronto: 'America/Toronto', 'Mexico City': 'America/Mexico_City',
  'Bogotá': 'America/Bogota', Lima: 'America/Lima', 'São Paulo': 'America/Sao_Paulo', 'Buenos Aires': 'America/Argentina/Buenos_Aires', Santiago: 'America/Santiago',
  Perth: 'Australia/Perth', Brisbane: 'Australia/Brisbane', Adelaide: 'Australia/Adelaide', Seoul: 'Asia/Seoul', 'Hong Kong': 'Asia/Hong_Kong', Manila: 'Asia/Manila',
  Bangkok: 'Asia/Bangkok', Jakarta: 'Asia/Jakarta', Dhaka: 'Asia/Dhaka', Karachi: 'Asia/Karachi', Tehran: 'Asia/Tehran', Riyadh: 'Asia/Riyadh',
  'Cape Town': 'Africa/Johannesburg', Kyiv: 'Europe/Kyiv', Warsaw: 'Europe/Warsaw', Lisbon: 'Europe/Lisbon', Vienna: 'Europe/Vienna', Oslo: 'Europe/Oslo',
  Helsinki: 'Europe/Helsinki', Vancouver: 'America/Vancouver', Anchorage: 'America/Anchorage', Houston: 'America/Chicago', Miami: 'America/New_York', Caracas: 'America/Caracas',
};

/** The time zone the device's clock is set to, or London's if it will not say. */
export function deviceZone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London'; } catch { return 'Europe/London'; }
}

/**
 * The clocks a place keeps: the listed city's own zone; for the device's own position, the device's zone;
 * for a position typed or taken from a link, the zone of the nearest listed city within about 800 km, or else the device's.
 */
export function zoneOf(name: string, lat: number, lon: number): string {
  if (ZONES[name]) return ZONES[name];
  if (name === 'Where you are') return deviceZone();
  const R = Math.PI / 180;
  let best = '', gap = 800;
  for (const [n, a, b] of CITIES) {
    const km = 6371 * Math.acos(Math.min(1, Math.sin(a * R) * Math.sin(lat * R) + Math.cos(a * R) * Math.cos(lat * R) * Math.cos((b - lon) * R)));
    if (km < gap) { gap = km; best = n; }
  }
  return best ? ZONES[best] : deviceZone();
}

/** A clock time as it reads in a zone, such as "21:40". */
export function clockIn(d: Date, zone: string): string {
  try { return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: zone }); } catch { return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
}
/** A day as it reads in a zone, such as "Thursday 26 November". */
export function dayIn(d: Date, zone: string): string {
  try { return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: zone }); } catch { return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); }
}
/** true when the zone's clocks read differently from the device's at this moment, so a time needs "local time" after it. */
export function clocksDiffer(d: Date, zone: string): boolean {
  return clockIn(d, zone) !== clockIn(d, deviceZone()) || dayIn(d, zone) !== dayIn(d, deviceZone());
}
