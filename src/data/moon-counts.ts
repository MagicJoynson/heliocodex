/**
 * How many moons each world has, counted from one place: JPL's list of planetary satellites, as
 * read on the date below (src/data/bodies/moons.json). Every page and chart that gives a count takes
 * it from here, so they cannot disagree. When the list is read again, the counts and the date change
 * together everywhere. scripts/check-content.py checks the counts written into lessons and facts.
 */
import data from './bodies/moons.json';

const list = (data as unknown as { moons: { parent: string }[] }).moons;
export const MOONS_AS_OF = (data as unknown as { _sources: { fetched: string } })._sources.fetched;
export const MOONS_AS_OF_TEXT = new Date(MOONS_AS_OF + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const MOONS_SOURCE = { label: 'NASA/JPL Solar System Dynamics, planetary satellites', url: 'https://ssd.jpl.nasa.gov/sats/' };
export const moonCount = (parent: string) => list.filter((m) => m.parent === parent).length;
