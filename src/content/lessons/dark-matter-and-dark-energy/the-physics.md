---
sources:
  - { label: "Eilers and others, The circular velocity curve of the Milky Way from 5 to 25 kpc (Astrophysical Journal, 2019), Table 1 and abstract", url: "https://arxiv.org/abs/1810.09466" }
  - { label: "Bland-Hawthorn and Gerhard, The Galaxy in context: structural, kinematic and integrated properties (Annual Review of Astronomy and Astrophysics, 2016): mass of stars and cold gas", url: "https://arxiv.org/abs/1602.07702" }
  - { label: "Jiao and others, Detection of the Keplerian decline in the Milky Way rotation curve (Astronomy and Astrophysics, 2023)", url: "https://arxiv.org/abs/2306.06675" }
  - { label: "Planck Collaboration, Planck 2018 results VI: cosmological parameters (Astronomy and Astrophysics, 2020), Table 2", url: "https://arxiv.org/abs/1807.06209" }
  - { label: "DESI Collaboration, DESI DR2 results II: measurements of baryon acoustic oscillations and cosmological constraints (Physical Review D, 2025)", url: "https://arxiv.org/abs/2503.14738" }
  - { label: "NIST, fundamental physical constants", url: "https://physics.nist.gov/cuu/Constants/" }
lastChecked: 2026-11-13
recheck: { what: "Whether the Milky Way's rotation curve falls steeply beyond 19 kpc, and whether dark energy is changing over time", by: 2027-11-13 }
---
This level weighs the Milky Way from the speeds of its stars, using the most precise measurement of how fast it turns, and finds far more mass than can be seen. It then shows, from the equation of the level on the expanding universe, what kind of thing could make the expansion speed up, and when the speeding up began. Two questions here are still open, and both sides are given. The sums are done here unless a source is named.

**Speed tells mass.** A star going round the centre of a galaxy in a circle of radius $r$ at speed $v$ needs a pull towards the centre of $v^2/r$ for each kilogram. If the mass inside its orbit is $M$, and is spread round in a roughly round way, gravity supplies $GM/r^2$. Set them equal:

$$
M(<r) = \frac{v^2 r}{G}
$$

So measuring the speed at each distance weighs everything inside that distance, seen or not.

**What to expect.** In the Solar System nearly all the mass is in the Sun, so $M$ is the same at every distance and

$$
v = \sqrt{\frac{GM}{r}}
$$

falls as $1/\sqrt{r}$: Neptune goes round at less than an eighth of Mercury's speed. If a galaxy's mass were where its stars and gas are, mostly within the inner 10 to 15 kiloparsecs, its speeds should fall in the same way beyond that.

**Real data: how fast the Milky Way turns.** Anna-Christina Eilers and colleagues measured the positions and motions of more than 23,000 red giant stars, using the Gaia spacecraft and the APOGEE survey, and worked out the speed of a circular orbit at each distance from the centre. Some of their values:

| From the centre | Speed of a circular orbit | Mass inside |
| --- | --- | --- |
| 5.27 kpc | 226.8 ± 1.9 km/s | ${6.3 \times 10^{10}}$ Suns |
| 8.19 kpc | 228.9 ± 0.8 km/s | ${1.0 \times 10^{11}}$ Suns |
| 15.22 kpc | 217.1 ± 1.1 km/s | ${1.7 \times 10^{11}}$ Suns |
| 20.27 kpc | 199.8 ± 3.2 km/s | ${1.9 \times 10^{11}}$ Suns |
| 24.82 kpc | 198.4 ± 6.5 km/s | ${2.3 \times 10^{11}}$ Suns |

The uncertainties are the larger of the two that their table gives for each point, and the masses are worked out here with the formula above. At the Sun's distance they give 229.0 ± 0.2 km/s, with a further uncertainty of 2 to 5 per cent from the method, and the speed falls by only 1.7 km/s for each kiloparsec further out.

All the stars and cold gas in the Galaxy come to about ${6.3 \times 10^{10}}$ Suns, by Joss Bland-Hawthorn and Ortwin Gerhard's review. If that were all, a star at 24.82 kpc, with all of it inside its orbit, would go round at 104 km/s. It goes at 198. The mass inside 25 kpc is 3.6 times the mass of everything that can be seen.

<figure class="photo">
  <img src="/img/learn/charts/the-milky-way-turns-too-fast.svg" alt="A chart of orbital speed against distance from the centre of the Milky Way, from 0 to 26 kiloparsecs. Five gold dots, measured speeds, stay between about 200 and 230 kilometres a second from 5 to 25 kiloparsecs, the outermost with a longer error bar. A dashed blue curve, the speed if the stars and gas were all the mass, falls from about 180 at the Sun's distance to about 100 at 25. The Sun is marked at 8.1 kiloparsecs." width="800" height="640" loading="lazy" />
  <figcaption><b>The Milky Way turns too fast.</b> Gold: the five measured speeds in the table above, from 23,000 red giants, with the uncertainty of each. Blue dashes: the speed if the stars and cold gas, 63 billion Suns, were all the mass there is and all lay inside the orbit. Data: Eilers and others, 2019; Bland-Hawthorn and Gerhard, 2016.</figcaption>
</figure>

**A flat curve means a spread-out halo.** If the speed stays the same with distance, the formula says the mass inside grows in step with $r$. Each shell of thickness $dr$ then adds the same mass, $v^2 dr / G$, and spreading that over the shell's area $4\pi r^2$ gives the density:

$$
\rho = \frac{v^2}{4 \pi G r^2}
$$

At the Sun's distance, 8.12 kpc, with 229 km/s, that is ${1.0 \times 10^{-21}}$ kg/m³. Physicists hunting the particles often give it as energy, by ${E = mc^2}$, in GeV per cubic centimetre, where one proton is 0.94 GeV: the figure is then 0.56. That would be the density if all the pull were from a round halo. Part of it comes from the disc of stars, so the halo must be thinner than that near the Sun. Fitting a halo and the known stars and gas to their curve, Eilers and colleagues found 0.30 ± 0.03 GeV/cm³: about a third of a proton's mass in each cubic centimetre, invisible, passing through the Earth and through you.

**An open question: where does the halo end?** Eilers and colleagues, in 2019, put the dark halo's mass at ${(7.25 \pm 0.26) \times 10^{11}}$ Suns, with a halo shape fitted to speeds out to 25 kpc. In 2023 Yongjun Jiao and colleagues, using Gaia's third release, found the speed falling by about 30 km/s between 19.5 and 26.5 kpc, as if there were little mass beyond 19 kpc, and put the whole Galaxy's mass at ${(2.06^{+0.24}_{-0.13}) \times 10^{11}}$ Suns, with a firm upper limit of ${5.4 \times 10^{11}}$. Even their lower figure is more than three times the stars and gas, so both need dark matter. They differ on how far it reaches. The outer stars are few and far away, and their distances are the hardest to measure. As of November 2026 the question is open.

**Dark energy: how the expansion could speed up.** The level on the expanding universe gave the Friedmann equation for a ball of radius $R$:

$$
\dot R^2 = \frac{8 \pi G}{3} \rho R^2 - k
$$

As the ball grows, the energy inside it changes by the work done at its edge, as for a gas in a cylinder:

$$
d\left(\rho c^2 R^3\right) = -p \; d\left(R^3\right)
$$

where $p$ is the pressure. Differentiate the Friedmann equation with time and use this to remove $\dot \rho$. After the algebra,

$$
\frac{\ddot R}{R} = -\frac{4 \pi G}{3} \left(\rho + \frac{3 p}{c^2}\right)
$$

For galaxies the pressure is nothing, so the right side is negative and the expansion slows. It can speed up only if something has a pressure below ${-\rho c^2/3}$: a negative pressure, a tension, of more than a third of its energy in each cubic metre. Suppose the something keeps the same density however far space stretches. Then $\rho$ stays fixed in the energy equation, and the only way that can balance is ${p = -\rho c^2}$. In the bracket that gives ${\rho - 3\rho}$, which is $-2\rho$: it speeds the expansion up twice as hard as the same density of matter slows it.

**Real data: when the speeding up began.** Planck's values, for a flat universe, are 0.3153 of the critical density in matter and 0.6847 ± 0.0073 in dark energy. Matter thins out as $(1+z)^3$ going back, while dark energy does not, so in the bracket the two balanced when

$$
(1 + z)^3 = \frac{2 \times 0.6847}{0.3153}
$$

which is at a redshift of 0.63. Working the expansion back from today with these values, that was 6.1 billion years ago, when the universe was 7.7 billion years old. The same sum gives the age of the universe as 13.80 billion years, against Planck's own 13.797, so leaving out the light and the other radiation makes almost no difference.

**An open question: is it constant?** In 2025 the DESI survey, measuring the distances to more than 14 million galaxies and quasars with a ruler built into the pattern of their positions, at many different times in the past, found that a dark energy that changes with time fits its data with Planck's better than a constant does. The preference is 3.1 standard deviations for DESI with Planck, and from 2.8 to 4.2 with supernovae added, depending on which collection of supernovae is used. Physicists usually ask for 5 before calling a result a discovery, and the DESI team themselves write that the challenge to the constant stands unless there is an unknown error in one of the data sets. As of November 2026 the question is open.

**Try it yourself.** Dark energy is 0.6847 of the critical density, which for ${H_0 = 67.4}$ is ${8.53 \times 10^{-27}}$ kg/m³. Counted as mass by ${E = mc^2}$, how much dark energy is there inside the Earth, whose volume is ${1.083 \times 10^{21}}$ m³?

The answer: $0.6847 \times 8.53 \times 10^{-27} \times 1.083 \times 10^{21}$, about 6 milligrams. Dark energy matters only because there is so much space.

**What this level leaves out.** The formula ${M = v^2 r/G}$ is exact for mass spread in round shells. For the flat disc of stars the true sum differs by some tens of per cent, which the full fits allow for. The inner 5 kpc, where the Galaxy's bar stirs the stars, are left out of the measurements. The other evidence for dark matter, from the bending of light by clusters and from the patterns in the oldest light, is in the lessons on those subjects. What dark matter is made of is not known.
