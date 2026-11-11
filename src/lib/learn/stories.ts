/**
 * Which lessons have been rebuilt in the visual style: a moving picture that follows the first
 * look, and each deeper level on a page of its own. Lessons not listed here keep the plain page.
 */
import type { Scene } from './stage';

export const STORY_LESSONS: readonly string[] = Object.keys(import.meta.glob('./scenes/*.ts')).map((f) => f.slice(9, -3));

/** Extra pictures placed above the text of one level of one lesson. */
export const LEVEL_FIGURES: Record<string, string> = {
  'what-a-black-hole-is/how-it-works': 'black-hole-sizes',
};

/** The pictures for a lesson, fetched only when its page is open. One file in ./scenes for each lesson, named after it. */
const files = import.meta.glob<{ lens: Scene; scenes: Scene[] }>('./scenes/*.ts');
export const loadScenes: Record<string, () => Promise<{ lens: Scene; scenes: Scene[] }>> = Object.fromEntries(Object.entries(files).map(([f, load]) => [f.slice(9, -3), load]));
