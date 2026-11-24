import manifest from '../data/share-images.json';

interface Share { src: string; alt: string }

/** The link-preview picture for a page, where it opens with a photograph that may be reused; otherwise the site card.
 *  The pictures are made by scripts/build-share-images.py from each page's own opening picture, so its credit is on the page. */
export function shareFor(path: string, site: URL | string | undefined): { src: string; alt: string; own: boolean } {
  const hit = (manifest as Record<string, Share>)[path.replace(/\/$/, '') || '/'];
  const base = site ?? 'https://heliocodex.com';
  return hit
    ? { src: new URL(hit.src, base).toString(), alt: hit.alt, own: true }
    : { src: new URL('/brand/heliocodex-social-card-1200x630.png', base).toString(), alt: 'Heliocodex: an amber Sun with a small dark world crossing it', own: false };
}
