---
sources:
  - { label: "NASA/JPL astrodynamic parameters", url: "https://ssd.jpl.nasa.gov/astro_par.html" }
  - { label: "Nobel Prize in Physics 2020, popular information", url: "https://www.nobelprize.org/prizes/physics/2020/popular-information/" }
  - { label: "GRAVITY Collaboration 2018, the star S2 near the black hole at the centre of the galaxy", url: "https://arxiv.org/abs/1807.09409" }
  - { label: "GRAVITY Collaboration 2022, the mass at the centre of the galaxy", url: "https://arxiv.org/abs/2112.07478" }
  - { label: "LIGO and Virgo 2016, gravitational waves from two merging black holes", url: "https://arxiv.org/abs/1602.03837" }
  - { label: "Abramowicz and Fragile 2013, the theory of accretion discs round black holes", url: "https://arxiv.org/abs/1104.5499" }
lastChecked: 2026-11-10
---
This level gives the formulas behind the sizes and energies in the level before. The constants are from JPL, and the results are worked out here unless a source is named.

**The size of the horizon.** For a mass $M$ that does not spin, the horizon is a sphere whose radius is

$$
r_s = \frac{2 G M}{c^2}
$$

This is the Schwarzschild radius, after Karl Schwarzschild, who found the solution of Einstein's equations that it belongs to. Everything in it is a constant except the mass, so the radius grows in step with the mass. For the Sun it is 2.953 km.

| Mass | $r_s$ | Width, $2 r_s$ |
| --- | --- | --- |
| The Earth | 8.87 mm | 17.7 mm |
| The Sun | 2.953 km | 5.9 km |
| 10 Suns | 29.5 km | 59 km |
| 4.3 million Suns | 12.7 million km | 25.4 million km |

The last is 18 times the width of the Sun, and its radius is 0.085 au, well inside the orbit of Mercury.

Newton's escape speed, $\sqrt{2GM/r}$, reaches the speed of light at exactly this radius. That is a neat way to remember the formula, but it is not where the formula comes from. In Newton's picture something thrown upwards more slowly than escape speed still rises for a while before it falls back. At a real horizon nothing moves outwards at all.

**Not always dense.** Divide a black hole's mass by the volume of a sphere of radius $r_s$ and you get a mean density of

$$
\bar\rho = \frac{3 c^6}{32 \pi G^3 M^2}
$$

It falls with the square of the mass. This is bookkeeping, since the mass is not spread evenly inside, but it shows that a large black hole need not be dense at all.

| Mass | Mean density inside the horizon |
| --- | --- |
| The Sun | ${1.8 \times 10^{19}}$ kg/m³ |
| 10 Suns | ${1.8 \times 10^{17}}$ kg/m³ |
| 4.3 million Suns | 1.0 million kg/m³, a thousand times water |
| 136 million Suns | 1,000 kg/m³, the same as water |
| A billion Suns | 18 kg/m³, less than a fiftieth of water |

To make a black hole from one star, matter has to be squeezed to more than a hundred thousand million million kilograms in every cubic metre. To make one from a hundred million stars' worth of gas, it needs only to reach the density of water.

**Weighing the one in our galaxy.** Kepler's third law gives the mass at the centre of an orbit. With the period $P$ in years, the semi-major axis $a$ in astronomical units and the mass in Suns it is simply

$$
M = \frac{a^3}{P^2}
$$

The star S2 goes round the centre of the galaxy every 16 years. The GRAVITY team's fit to its orbit and those of three other stars gives ${4.30 \times 10^6}$ Suns, to about a quarter of one per cent. A 16 year orbit round that mass has a semi-major axis of about 1,030 au.

The orbit is a long ellipse. At its closest S2 is 120 au from the centre, moving at 7,650 km/s, which is 2.6 per cent of the speed of light. That distance is about 1,400 times $r_s$. So 4.3 million Suns sit inside a space only four times the width of Neptune's orbit, and nothing known but a black hole can be that heavy and that small. At this distance the team measured two effects that Newton's laws do not allow: the star's light is stretched as it climbs away, and the ellipse itself turns slowly, as Mercury's does.

<figure class="photo">
  <img src="/img/learn/charts/s2-round-the-black-hole.svg" alt="A long gold ellipse, the orbit of the star S2, with the star at its far left end. Near the right end of the ellipse is a tiny dot, the black hole of 4.3 million Suns, ringed by a blue circle about the size of a full stop: Neptune's orbit, drawn to the same scale." width="800" height="700" loading="lazy" />
  <figcaption><b>S2's orbit, to scale.</b> The ellipse uses the sizes above: 1,030 au across half its long axis and 120 au at its closest. The blue ring is Neptune's orbit round the Sun, 30 au, drawn to the same scale. The mass that holds S2 in its 16-year orbit must lie within 120 au of the centre, which is four times the ring's radius. The orbit is shown face on; on the sky it is seen tilted.</figcaption>
</figure>

**Mass turned into ripples.** When two black holes merge, the final hole has less mass than the two that made it. The difference leaves as gravitational waves, with energy

$$
E = \Delta m\, c^2
$$

In the first merger detected, holes of 36 and 29 Suns made one of 62, and 3.0 Suns of mass were radiated. That is ${5.4 \times 10^{47}}$ joules, 4.6 per cent of the mass the two began with. The Sun, at its present brightness, would take 44 trillion years to give out as much.

**Why falling gas shines so brightly.** Gas in a circular orbit of radius $r$ has given up an energy of $GMm/2r$ for each mass $m$, compared with gas at rest far away. As a share of the gas's own rest energy $mc^2$ that is

$$
\frac{E}{m c^2} = \frac{G M}{2 r c^2} = \frac{r_s}{4 r}
$$

Round a black hole that does not spin, circular orbits are stable only outside $3 r_s$. Gas that has spiralled in that far has given up about $1/12$ of its rest energy by this Newtonian reckoning, or 8 per cent. Observations of quasars point to about a tenth. For comparison, fusing hydrogen into helium releases 0.7 per cent. Gas falling towards a black hole turns far more of its mass into light than a star ever does, which is why the brightest steady sources of light known are black holes being fed.
