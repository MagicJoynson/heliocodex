/**
 * Short written stories for famous stars, shown above the numbers on each star's page. Each is
 * what is known: where the name comes from, why the star matters, and what has been measured.
 * Figures here are only ones a named source states. The star's own numbers stay in the sheet below.
 */
export interface StarStory { paras: string[]; sources: [label: string, url: string][] }

const IAU: [string, string] = ['IAU Working Group on Star Names: official star names', 'https://www.pas.rochester.edu/~emamajek/WGSN/IAU-CSN.txt'];

export const STAR_STORIES: Record<string, StarStory> = {
  sirius: {
    paras: [
      'The name comes from a Greek word meaning scorching or glowing. It is the brightest star in the night sky, partly because it is so close: the Sirius system is only 8.6 light years away, the fifth nearest star system known.',
      'Sirius is a pair. In 1862 a faint companion, Sirius B, was first seen beside the glare of the bright star. NASA’s Hubble Space Telescope later weighed it and found a mass 98 per cent of the Sun’s, packed into a ball 12,000 kilometres across, less than the width of the Earth. It is a white dwarf, the dead core of a star.',
    ],
    sources: [['NASA: Astronomers use Hubble to weigh the Dog Star’s companion', 'https://science.nasa.gov/missions/hubble/astronomers-use-hubble-to-weigh-dog-stars-companion/'], IAU],
  },
  canopus: {
    paras: [
      'Canopus is the second brightest star in the night sky, but it lies so far south that it never rises in Britain. The name is ancient Greek, and by legend it belongs to the pilot of the ship of Menelaus. Where the name really comes from is not certain.',
      'Spacecraft have used it as a signpost. The Voyager probes steered by it, and a sensor on the craft kept it in view to help hold the craft steady and pointing the right way.',
    ],
    sources: [['NASA Technical Reports Server: Carlisle and Hill (1981), Voyager Saturn encounter attitude and articulation control experience', 'https://ntrs.nasa.gov/citations/19820032801'], IAU],
  },
  'rigil-kentaurus': {
    paras: [
      'The name comes from Arabic and means the foot of the centaur, after the figure of Centaurus in which it sits. It is also called Alpha Centauri, and it is the brightest star in its constellation.',
      'To the eye it is one point of light, but it is really two stars much like the Sun that circle each other, and a third, dim red star, Proxima Centauri, circles them far out. Proxima is the nearest star to the Sun, a little over four light years away. In 2016 astronomers using ESO’s HARPS instrument at La Silla in Chile announced a planet around Proxima, Proxima b, with at least 1.3 times the Earth’s mass, going round once every 11.2 days.',
    ],
    sources: [['ESO: A planet found in orbit around Proxima Centauri (eso1629)', 'https://www.eso.org/public/news/eso1629/'], IAU],
  },
  arcturus: {
    paras: [
      'The name is Greek and means the guardian of the bear, because Arcturus follows the Great Bear across the sky. It is the brightest star in the northern celestial hemisphere, and an orange giant.',
      'It also has a place in the history of astronomy. In 1718 Edmond Halley noticed that a few bright stars, Arcturus among them, were no longer where the ancient Greek astronomers had put them. The stars were not fixed after all: they all move, though most too slowly to notice.',
    ],
    sources: [['History of astrometry (arXiv 1209.3563)', 'https://arxiv.org/abs/1209.3563'], IAU],
  },
  vega: {
    paras: [
      'The name comes from Arabic and means the swooping eagle. Vega is the brightest star of the Summer Triangle and one of the brightest in the northern sky.',
      'NASA’s infrared satellite IRAS, launched in 1983, found that Vega gives out more infrared light than a star alone should, as reported in 1984. The extra light comes from a disc of dust around it, the first dust disc found around an ordinary star of this kind. Because Vega is bright and steady, it was long used as a reference point for the magnitude scale that astronomers use for brightness.',
    ],
    sources: [['Aumann and others (1984), Discovery of a shell around Alpha Lyrae', 'https://ui.adsabs.harvard.edu/abs/1984ApJ...278L..23A'], IAU],
  },
  capella: {
    paras: [
      'The name is Latin and means the little she-goat. Capella is the brightest star in Auriga, the charioteer, who in old star pictures carries a goat on his shoulder.',
      'It looks like one star, but is really four, in two pairs. The brighter pair is two yellow giants that circle each other in about 104 days. A pair of faint red dwarfs lies far off.',
    ],
    sources: [['Torres and others (2015), Capella revisited: new binary orbit', 'https://arxiv.org/abs/1505.07461'], IAU],
  },
  rigel: {
    paras: [
      'The name comes from Arabic and means the foot, the left foot of the figure of Orion. It is a blue supergiant, one of the most luminous stars that can be seen with the eye.',
      'Rigel is a system of several stars. A much fainter companion lies about 10 arcseconds from it, lost in its glare unless the air is steady and the telescope good.',
    ],
    sources: [IAU],
  },
  procyon: {
    paras: [
      'The name is Greek and means before the dog. Procyon rises a little before Sirius, the Dog Star, so it comes first.',
      'Like Sirius, it has a white dwarf companion, Procyon B. The companion was first inferred from the way Procyon wobbled, and was seen directly only in 1896, in a telescope at Lick Observatory in California.',
    ],
    sources: [IAU],
  },
  betelgeuse: {
    paras: [
      'The name comes from the Arabic for the hand of al-Jawza, the Arabic figure that corresponds to Orion. A mistake in copying the name into European books has left it with the odd spelling.',
      'Betelgeuse is a red supergiant, so large that its disc can be seen in the biggest telescopes. In late 2019 it began to fade, and by February 2020 it had dropped to about 36 per cent of its usual brightness, easy to notice by eye. ESO’s Very Large Telescope took pictures of it before and during the fading, and showed that its surface had changed and that dust surrounded it, though the cause of the fading was not yet settled. The star is not expected to explode now.',
    ],
    sources: [['ESO: Betelgeuse’s great dimming (eso2003)', 'https://www.eso.org/public/news/eso2003/'], IAU],
  },
  altair: {
    paras: [
      'The name comes from Arabic and means the flying eagle. It is the brightest star in Aquila, and one corner of the Summer Triangle.',
      'Altair spins very fast. It turns once in under ten hours, where the Sun takes a little over 25 days at its equator, and it is squashed into a flattened shape as a result. Its surface was imaged in 2007 by a team that joined the light of several telescopes of the CHARA array in California, observing in the summer of 2006.',
    ],
    sources: [['Monnier and others (2007), Imaging the surface of Altair, Science 317, 342', 'https://arxiv.org/abs/0706.0867'], IAU],
  },
  polaris: {
    paras: [
      'The name is Latin for the pole star. Polaris sits very close to the point in the sky that the Earth’s axis points at, so as the night turns the other stars wheel around it while it hardly moves. It is not the brightest star, but it is the one that tells you where north is.',
      'It is a Cepheid, a star that swells and shrinks and so changes a little in brightness. In 2008 astronomers using the Hubble Space Telescope saw its close companion, Polaris Ab, for the first time, and by following it they made the first direct estimate of the mass of a Cepheid, though it is still uncertain. The companion goes round the main star in about 30 years.',
    ],
    sources: [['Evans and others (2008), Direct detection of the close companion of Polaris with the Hubble Space Telescope', 'https://arxiv.org/abs/0806.4904'], ['Evans and others (2018), The orbit of the close companion of Polaris', 'https://arxiv.org/abs/1807.06115'], IAU],
  },
  antares: {
    paras: [
      'The name comes from Greek and means the rival of Ares, the Greek name for Mars, because the star shines with a red colour like the planet’s. Antares is the heart of the Scorpion, Scorpius, and a red supergiant, one of the largest stars the eye can see.',
      'It has a faint blue-white companion, Antares B, close beside it. The companion is hidden in the glare of the supergiant and is hard to see without a telescope.',
    ],
    sources: [['Sky & Telescope: Meet Antares, the star that is not Mars', 'https://skyandtelescope.org/astronomy-news/meet-antares-the-star-that-is-not-mars/'], IAU],
  },
  fomalhaut: {
    paras: [
      'The name comes from Arabic and means the mouth of the fish. Fomalhaut is the brightest star in the southern fish, Piscis Austrinus, and in Britain a lone bright star on autumn evenings, very low in the south and hard to see from the north.',
      'It is surrounded by a wide belt of dust and rubble. In 2008 Hubble pictures of the belt showed a point of light that was announced as a planet, Fomalhaut b. It was seen to fade, and in 2020 astronomers concluded that it was not a planet but an expanding cloud of fine dust, thrown out when two icy bodies collided.',
    ],
    sources: [['ESA/Hubble: Hubble observes aftermath of massive collision (heic2006)', 'https://esahubble.org/news/heic2006/'], IAU],
  },
  spica: {
    paras: [
      'The name is Latin and means the ear of grain, for the ear of wheat held by the figure of Virgo, the maiden. Spica is the brightest star in Virgo, and a blue-white star.',
      'It is really two stars, so close that they circle each other in about four days and cannot be told apart in an ordinary telescope. Their pull stretches each into an egg shape.',
    ],
    sources: [['Tkachenko and others (2016), paper on Spica (arXiv 1604.02057)', 'https://arxiv.org/abs/1604.02057'], IAU],
  },
  regulus: {
    paras: [
      'The name is Latin and means the little king. Regulus is the brightest star in Leo, the lion, and sits at the bottom of the shape called the Sickle.',
      'It spins very fast, turning once in about 16 hours, so that it is flattened and bulges at its equator. It has a hidden close companion, probably a white dwarf, and a wider faint pair.',
    ],
    sources: [['Paper on the rotation of Regulus (arXiv 0806.3473)', 'https://arxiv.org/abs/0806.3473'], ['Paper on the companion of Regulus (arXiv 0904.0395)', 'https://arxiv.org/abs/0904.0395'], IAU],
  },
  deneb: {
    paras: [
      'The name comes from Arabic and means the tail, the tail of the hen, which is how the Arabs saw the figure we call Cygnus, the swan. Deneb is the brightest star in Cygnus and the third corner of the Summer Triangle.',
      'It is by far the most distant of the bright stars of the Triangle, and one of the most luminous stars that can be seen by eye. How far away it is has been argued over, as the note about its distance on this page explains.',
    ],
    sources: [IAU],
  },
  aldebaran: {
    paras: [
      'The name comes from Arabic and means the follower, because Aldebaran rises after the Pleiades star cluster and seems to follow it across the sky. It is the brightest star in Taurus, the bull, and an orange giant that marks the bull’s eye.',
      'It seems to lie within the V-shaped Hyades star cluster, but is only a chance alignment. Aldebaran is much nearer to us than the cluster, and not part of it.',
    ],
    sources: [IAU],
  },
};
