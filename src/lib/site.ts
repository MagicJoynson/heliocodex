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

/**
 * Structured data for a record page (a planet, moon, small world, star or constellation): the page, what it is about,
 * its picture, and the trail of pages above it, which search engines show in place of the address.
 */
export const recordLd = (o: { path: string; name: string; description: string; kind: string; image?: string; trail: [string, string][] }) => {
  const url = new URL(o.path, 'https://heliocodex.com/').toString();
  const crumbs: [string, string][] = [['Heliocodex', '/'], ...o.trail, [o.name, o.path]];
  return [
    {
      '@context': 'https://schema.org', '@type': 'WebPage', url, name: o.name, description: o.description, inLanguage: 'en-GB',
      ...(o.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: o.image } } : {}),
      about: { '@type': 'Thing', name: o.name, description: o.kind },
      isPartOf: { '@type': 'WebSite', name: 'Heliocodex', url: 'https://heliocodex.com/' }, publisher: PUBLISHER,
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: new URL(path, 'https://heliocodex.com/').toString() })),
    },
  ];
};
