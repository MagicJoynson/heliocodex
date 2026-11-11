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
];
// the device's clock names a city for its time zone; these are the ones spelt differently from the list
const ALSO: Record<string, string> = { Kolkata: 'Delhi', Calcutta: 'Delhi', Shanghai: 'Beijing', Sao_Paulo: 'São Paulo', Bogota: 'Bogotá', Argentina: 'Buenos Aires' };

/** A first guess at where the visitor is, from the time zone their device is set to. Nothing is sent anywhere. */
export function guess(): number {
  let zone = '';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''; } catch { /* keep the default */ }
  const parts = zone.split('/'), last = parts[parts.length - 1] ?? '';
  const name = ALSO[last] ?? ALSO[parts[1] ?? ''] ?? last.replace(/_/g, ' ');
  const found = CITIES.findIndex((c) => c[0] === name);
  return found < 0 ? 0 : found;
}
