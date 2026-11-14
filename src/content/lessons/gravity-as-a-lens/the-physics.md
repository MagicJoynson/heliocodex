---
sources:
  - { label: "Kennefick, Not only because of theory: Dyson, Eddington and the competing myths of the 1919 eclipse expedition (2007), quoting the 1920 report and Harvey's 1979 re-measurement", url: "https://arxiv.org/abs/0709.0685" }
  - { label: "Fomalont and others, Progress in measurements of the gravitational bending of radio waves using the VLBA (Astrophysical Journal, 2009)", url: "https://arxiv.org/abs/0904.3992" }
  - { label: "Wikipedia, Eddington experiment (Einstein's 1911 half value)", url: "https://en.wikipedia.org/wiki/Eddington_experiment" }
  - { label: "NASA JPL, astrodynamic parameters (the Sun's gravity)", url: "https://ssd.jpl.nasa.gov/astro_par.html" }
  - { label: "IAU 2015 Resolution B3, the Sun's nominal radius", url: "https://arxiv.org/abs/1510.07674" }
lastChecked: 2026-11-13
---
This level works out how far gravity bends light, first as Newton's laws would have it and then as Einstein's do, and follows the test of the difference from the eclipse of 1919 to radio telescopes today. It then turns the bending into the lens equation, which says where the copies of a lensed object appear and how much brighter they are. The sums are done here unless a source is named.

**Newton's answer.** Treat light as something moving at speed $c$ that gravity can pull on. A ray passes a mass $M$ with closest distance $b$. Over its journey the pull across its path adds up to a small sideways speed. Adding up the sideways part of the pull, ${GM b / (b^2 + x^2)^{3/2}}$, as the ray moves along $x$ from far away to far away, and dividing by $c$ for the time, gives

$$
\Delta v = \frac{2 G M}{b c}
$$

The ray turns through the angle $\Delta v / c$:

$$
\alpha_{\text{Newton}} = \frac{2 G M}{b c^2}
$$

The mass of whatever is falling cancels, as it always does, so this gives a definite answer even for light. For a ray grazing the Sun, with $b$ equal to the Sun's radius, it is 0.88 seconds of arc. Einstein himself first got this half value in 1911, as 0.83 with the figures of the day.

**Einstein's answer.** In general relativity, gravity also slows the passage of time and stretches space near the mass. The bending of space adds exactly as much again, and the angle is

$$
\alpha = \frac{4 G M}{b c^2}
$$

At the Sun's edge that is 1.75 seconds of arc, about the width of a coin seen from nearly 3 km. The factor of 2 is the test: the two theories cannot both be right.

<figure class="photo">
  <img src="/img/learn/charts/starlight-bent-by-the-sun.svg" alt="On the left the Sun. A ray of starlight from the right passes close to it and bends towards it on its way to the Earth at the left edge. A dashed straight line runs back from the Earth along the bent ray to a faint star drawn further from the Sun than the real one." width="800" height="560" loading="lazy" />
  <figcaption><b>The star moves outwards.</b> Starlight passing the Sun is bent towards it. Looking back along the ray as it arrives, the star appears a little further from the Sun than it really is. During an eclipse, with the Sun's glare blocked, this shift can be measured against a photograph of the same stars taken at night months earlier. Not to scale: the bend is less than a thousandth of a degree.</figcaption>
</figure>

**Real data: the 1919 eclipse.** Stars can be seen near the Sun only during a total eclipse. On 29 May 1919 two British teams photographed the stars round the eclipsed Sun, one at Sobral in Brazil and one, with Arthur Eddington, on the island of Príncipe. The results, scaled to the Sun's edge, were:

| Telescope | 1920 report | Re-measured in 1979 |
| --- | --- | --- |
| Sobral, 4-inch lens | 1.98 ± 0.18 | 1.90 ± 0.11 |
| Sobral, astrographic | 0.93 | 1.55 ± 0.34 |
| Príncipe, astrographic | 1.61 ± 0.30 | not re-measured |

The numbers are in seconds of arc. The 1920 report set aside the Sobral astrographic plates, which favoured Newton, on the grounds that the Sun's heat had distorted the telescope's focus. That choice has been argued over ever since: some historians have suggested the team kept the results that suited Einstein. In 1979 the Royal Greenwich Observatory measured the old plates again with a modern machine. The 4-inch result barely changed, and the disputed astrographic plates gave 1.55, far from Newton's 0.88. The two together give 1.87 ± 0.13. The modern view, set out by the historian Daniel Kennefick, is that the team's choice was defensible and their conclusion right, though the measurement was rough.

**Real data: radio waves.** The test no longer needs an eclipse. Radio telescopes can track quasars as the Sun passes in front of them, and the Sun is quiet enough in radio for the bending to be measured at any time. In 2005 the Very Long Baseline Array, ten dishes spread from Hawaii to the Virgin Islands, measured it to be 0.9999 of Einstein's value, give or take 0.0002. Newton's half is ruled out completely.

**The lens equation.** Now put a mass between us and a far source, at distances $D_l$ to the lens and $D_s$ to the source, with $D_{ls}$ between them. Angles on the sky are small, so the bending sets a simple rule between where the source really is, at angle $\beta$ from the lens, and where an image of it appears, at angle $\theta$:

$$
\beta = \theta - \frac{\theta_E^2}{\theta}
$$

where

$$
\theta_E = \sqrt{\frac{4 G M}{c^2} \, \frac{D_{ls}}{D_l D_s}}
$$

is the Einstein radius. If the source is exactly behind the lens, ${\beta = 0}$, and every direction at angle $\theta_E$ works: the image is a ring. If it is a little off the line, the equation is a quadratic in $\theta$ with two answers, one on each side of the lens. That is why a single lens gives two copies.

**Microlensing.** For a star of half the Sun's mass, halfway to a star 8 kiloparsecs away near the middle of the Galaxy, the Einstein radius is 0.71 thousandths of a second of arc. No telescope can split two images that close, so all that is seen is the two added together. Each image is stretched as well as moved, and with ${u = \beta/\theta_E}$ the total brightening comes out as

$$
A = \frac{u^2 + 2}{u \sqrt{u^2 + 4}}
$$

| How far off the line, $u$ | Brightening |
| --- | --- |
| 1 | 1.34 times |
| 0.5 | 2.18 times |
| 0.1 | 10.0 times |

As the near star drifts across, $u$ shrinks and grows again and the far star brightens and fades in a smooth, symmetric curve, the same in every colour. A planet round the near star adds a short spike to that curve, which is how microlensing finds planets.

**Try it yourself.** How far from the Sun does a ray have to pass to be bent by 0.1 seconds of arc?

The answer: the angle goes as $1/b$, so 17.5 times further out than the Sun's edge, about 12 million km. That is why radio astronomers can measure the bending of quasars several degrees from the Sun.

**What this level leaves out.** A galaxy or a cluster is not a single point of mass. Its spread-out shape gives more copies, the arcs and crosses of the level before, and fitting those shapes is how astronomers map where the unseen matter is. The distances in the lens equation are not simple lengths when light has crossed a large part of the expanding universe.
