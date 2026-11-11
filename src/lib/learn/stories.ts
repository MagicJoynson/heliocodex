/**
 * Which lessons have been rebuilt in the visual style: a moving picture that follows the first
 * look, and each deeper level on a page of its own. Lessons not listed here keep the plain page.
 */
import type { Scene } from './stage';

export const STORY_LESSONS: readonly string[] = ['what-a-black-hole-is'];

/** Extra pictures placed above the text of one level of one lesson. */
export const LEVEL_FIGURES: Record<string, string> = {
  'what-a-black-hole-is/how-it-works': 'black-hole-sizes',
};

/** The pictures for a lesson, fetched only when its page is open. */
export const loadScenes: Record<string, () => Promise<{ lens: Scene; scenes: Scene[] }>> = {
  'what-a-black-hole-is': () => import('./scenes/what-a-black-hole-is'),
};
