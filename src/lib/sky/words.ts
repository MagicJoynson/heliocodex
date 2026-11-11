// Where something is in the sky, in plain words.
const WAYS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
export const wayOf = (azDeg: number) => WAYS[Math.round(azDeg / 45) % 8];
export function heightOf(altDeg: number): string {
  if (altDeg < 10) return 'very low';
  if (altDeg < 25) return 'low';
  if (altDeg < 50) return 'about half way up';
  if (altDeg < 75) return 'high';
  return 'almost overhead';
}
