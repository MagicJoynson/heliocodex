/**
 * "Finding it" for a constellation page: whether it rises, sets or circles the pole from a place,
 * how high its middle gets, and the month it is highest at about 9 pm. Worked out from the declinations
 * of its naked-eye stars and the latitude of the place. The page writes it for London when it is built,
 * then again in the browser for the place the visitor has chosen (or the guess from their clock).
 */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface Shape {
  /** The constellation's name. */
  name: string;
  /** Declinations of its naked-eye stars, degrees, smallest first. */
  decs: number[];
  /** The declination and right ascension (hours) of its middle. */
  dec: number;
  ra: number;
}

/** The month the middle is highest at about 9 pm by the Sun: then the sky's meridian is at the Sun's right ascension plus 9 hours. */
export function bestMonth(ra: number): string {
  const day = new Date(Date.UTC(2001, 2, 21) + ((((ra - 9) % 24) + 24) % 24) / 24 * 365.25 * 864e5);
  return MONTHS[day.getUTCMonth()];
}

/** The sentences, for a place at latDeg (north is plus) named `from` ("London", "where you are"). */
export function findingIt(c: Shape, latDeg: number, from: string): string {
  const { name, decs } = c, lat = latDeg, north = lat >= 0, colat = 90 - Math.abs(lat);
  // a star circles the pole without setting when it is closer to the raised pole than the place's colatitude; it never rises when as close to the other pole
  const circles = (d: number) => (north ? d > colat : d < -colat), hidden = (d: number) => (north ? d < -colat : d > colat);
  const median = decs[Math.floor(decs.length / 2)];
  const neverSets = decs.every(circles), neverRises = decs.every(hidden), mostlyUp = circles(median);
  const high = Math.round(90 - Math.abs(lat - c.dec)), top = Math.round(Math.max(...decs.map((d) => 90 - Math.abs(lat - d))));
  const month = bestMonth(c.ra), side = c.dec < lat ? 'south' : 'north';
  const pole = north ? 'the Pole Star' : 'the south pole of the sky', edge = north ? 'northern' : 'southern', low = north ? 'south' : 'north';
  const wheres = neverRises ? `${name} never rises above the horizon from ${from}, so it cannot be seen from there.`
    : neverSets ? `${name} never sets from ${from}. It goes round ${pole} all night, all year, so it can be seen on any clear night.`
    : mostlyUp ? `Most of ${name} never sets from ${from}. It goes round ${pole}, so it can be seen on any clear night, though its lowest stars dip below the horizon. It is highest in the evening, about 9 pm, in ${month}.`
    : high <= 0 ? (top < 3 ? `Only a sliver of the ${edge} edge of ${name} climbs above the horizon from ${from}, and only a few degrees, so in practice it cannot be seen from there.` : `Only the ${edge} part of ${name} climbs above the horizon from ${from}, no more than about ${top}° up in the ${low}. It is highest in the evening, about 9 pm, in ${month}.`)
    : `${name} rises and sets, so it is in the evening sky only part of the year. It is highest in the evening, about 9 pm, in ${month}.`;
  const heights = neverRises || high <= 0 ? '' : high < 20 ? ` Even at its highest its middle is only about ${high}° above the horizon, to the ${side}, so it needs a clear low horizon.` : high > 80 ? ' At its highest its middle is almost overhead.' : ` At its highest its middle is about ${high}° up (a fist held out at arm's length is about 10°), to the ${side}.`;
  return wheres + heights;
}
