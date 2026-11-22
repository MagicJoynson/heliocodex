/**
 * Site-wide switches. SHOW_OUTLINES puts the pages still being written into the main views, quietly
 * (dimmer, dashed). Off, the main views show written work only. Turning it off at launch is Alex's call.
 */
export const SHOW_OUTLINES = true;

/** The publisher and site, as structured data for search engines. Kept in one place so every page names the same company. */
export const PUBLISHER = { '@type': 'Organization', name: 'FALLINGHIPPO LIMITED', alternateName: 'FallingHippo', url: 'https://fallinghippo.com' } as const;
export const siteLd = { '@type': 'WebSite', name: 'Heliocodex', url: 'https://heliocodex.com/', inLanguage: 'en-GB', publisher: PUBLISHER } as const;
export const lessonLd = (id: string, title: string, summary: string) => ({
  '@context': 'https://schema.org', '@type': 'Article', headline: title, description: summary, inLanguage: 'en-GB',
  mainEntityOfPage: `https://heliocodex.com/learn/${id}`, isPartOf: { '@type': 'WebSite', name: 'Heliocodex', url: 'https://heliocodex.com/' }, publisher: PUBLISHER,
});
