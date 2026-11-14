---
sources:
  - { label: "NASA/JPL Horizons: orbital elements of Io, Europa and Ganymede every six hours from 2016 to 2025, from which the mean motions here are fitted", url: "https://ssd.jpl.nasa.gov/horizons/" }
  - { label: "NASA NSSDC Jovian satellite fact sheet (sizes, masses and eccentricities)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html" }
  - { label: "Lainey and others, Strong tidal dissipation in Io and Jupiter from astrometric observations (Nature, 2009): Io's k2/Q and the drift out of exact resonance", url: "https://doi.org/10.1038/nature08108" }
  - { label: "Gladman and others, Synchronous locking of tidally evolving satellites (Icarus, 1996): the locking time formula", url: "https://doi.org/10.1006/icar.1996.0117" }
  - { label: "Anderson and others, Io's gravity field and interior structure (Journal of Geophysical Research, 2001): Io's moment of inertia", url: "https://doi.org/10.1029/2000JE001367" }
  - { label: "Anderson and others, Europa's differentiated internal structure (Science, 1998): Europa's moment of inertia", url: "https://doi.org/10.1126/science.281.5385.2019" }
  - { label: "Anderson and others, Gravitational constraints on the internal structure of Ganymede (Nature, 1996): Ganymede's moment of inertia", url: "https://doi.org/10.1038/384541a0" }
  - { label: "Anderson and others, Shape, mean radius, gravity field and interior structure of Callisto (Icarus, 2001): Callisto's moment of inertia", url: "https://doi.org/10.1006/icar.2001.6664" }
lastChecked: 2026-11-14
---
This level checks Laplace's rule for Jupiter's three inner moons against JPL's record of where the moons have actually been, works out what the rule allows and what it forbids, and then asks how long it took the moons to stop spinning freely and turn one face to Jupiter. The fits and sums are done here.

**Real data: how fast each moon goes round.** JPL's Horizons system gives each moon's orbit every six hours. Adding up the angle each moon has covered over the ten years from 2016 to 2025, and fitting a straight line, gives its mean motion $n$: the average number of degrees round Jupiter per day.

| Moon | Mean motion $n$, degrees a day |
| --- | --- |
| Io | 203.48896 |
| Europa | 101.37472 |
| Ganymede | 50.31760 |

Dividing 360° by each gives periods of 1.769138, 3.551181 and 7.154554 days, which agree with the periods in the main level to within a millionth of a day.

**Step one: two near-misses that are the same size.** Io is not quite twice as fast as Europa, and Europa is not quite twice as fast as Ganymede. The amounts by which they miss are

$$
n_\text{I} - 2n_\text{E} = 0.7395^\circ \text{ a day}
$$

$$
n_\text{E} - 2n_\text{G} = 0.7395^\circ \text{ a day}
$$

The two misses are equal to four figures. Subtract one from the other and the result is Laplace's rule:

$$
n_\text{I} - 3n_\text{E} + 2n_\text{G} = 0
$$

From JPL's numbers the left side comes to less than 0.00001 degrees a day, which is as close to zero as a ten-year fit can show.

**Step two: the angle that stays put.** Write $\lambda$ for each moon's position round Jupiter, measured as an angle from a fixed direction. Each $\lambda$ grows at its moon's mean motion, so the combination

$$
\varphi = \lambda_\text{I} - 3\lambda_\text{E} + 2\lambda_\text{G}
$$

grows at ${n_\text{I} - 3n_\text{E} + 2n_\text{G}}$, which is zero. So $\varphi$ does not change. Computed from JPL's positions every six hours for ten years, it stays within half a degree of 180°, and most of that small wobble is the short-term rocking of the orbits rather than any drift. Laplace's rule is really a statement that $\varphi$ is held at 180°.

**Step three: what the rule allows.** Put ${\varphi = 180^\circ}$ to work. Angles that differ by 360° are the same direction, so each result below holds "give or take whole turns".

- *Io and Europa line up* (${\lambda_\text{I} = \lambda_\text{E}}$). Then $\varphi = 2(\lambda_\text{G} - \lambda_\text{E}) = 180^\circ$, so Ganymede is 90° away from the pair, a quarter of the way round.
- *Europa and Ganymede line up* (${\lambda_\text{E} = \lambda_\text{G}}$). Then $\varphi = \lambda_\text{I} - \lambda_\text{E} = 180^\circ$, so Io is on the far side of Jupiter.
- *Io and Ganymede line up* (${\lambda_\text{I} = \lambda_\text{G}}$). Then $3(\lambda_\text{G} - \lambda_\text{E}) = 180^\circ$, so Europa is 60°, 180° or 300° away.

**What the rule forbids.** If all three were on the same line on the same side, every $\lambda$ would be equal and $\varphi$ would be ${1 - 3 + 2 = 0}$ times that angle, which is zero. It is held at 180°, so this never happens. That is the exact sense of "the three never line up on the same side together".

**What the rule does not mean.**

- It does not mean the periods are exactly 1, 2 and 4 to 1. They are not: Europa's period is 2.0073 times Io's. The exactness is in the combination, not in each ratio.
- It does not mean the three line up in some other pattern on a timetable. Two of them meet often, but the third is always somewhere the rule allows and never alongside.
- It does not by itself heat Io. The heat comes from what the resonance does to the shape of Io's orbit: the repeated tugs keep its eccentricity at about 0.004 instead of letting it fall to zero, and that small stretch is enough for Jupiter's tide on Io to rise and fall every lap.
- It is not fixed for ever. Lainey and colleagues, timing the moons against observations going back more than a century, found in 2009 that the three are slowly moving away from the exact resonance, because tides inside Io and inside Jupiter push the orbits in different directions. The change is far too slow to show in ten years of positions.

**Step four: how often they meet, and where.** Io gains on Europa at ${203.489 - 101.375 = 102.114}$ degrees a day, so it laps Europa every

$$
\frac{360^\circ}{102.114^\circ \text{ a day}} = 3.525 \text{ days}
$$

In that time Europa goes 357.4° round, almost exactly one lap. So Io and Europa meet at nearly the same place every time. The same sum gives Europa meeting Ganymede every 7.051 days and Io meeting Ganymede every 2.350 days. The meeting places do creep, all together, at the 0.7395° a day found in step one, which takes them right round Jupiter once every 487 days.

<figure class="photo">
  <img src="/img/learn/charts/where-the-three-moons-meet.svg" alt="Jupiter seen from above with the orbits of Io, Europa and Ganymede drawn to scale. A blue line to the right marks where Europa meets Ganymede. Gold and red lines to the left mark where Io meets Europa and where Io meets Ganymede. Two more red lines, up and to the right and down and to the right, mark the other places where Io meets Ganymede. No line touches all three moons." width="800" height="920" loading="lazy" />
  <figcaption><b>Where the meetings happen, over one lap of Ganymede.</b> Worked out from JPL's mean motions, starting from a meeting of Europa and Ganymede. Io and Europa meet twice, both times on the opposite side of Jupiter from where Europa and Ganymede meet. One of the Io–Ganymede meetings falls in that same direction, so the gold and red lines there are drawn side by side. Io and Ganymede meet three times, a third of a turn apart. None of the places has all three. The whole pattern turns slowly round Jupiter, once in 487 days. Orbits to scale; moons not drawn.</figcaption>
</figure>

**Step five: why each moon keeps one face to Jupiter.** All four large moons turn once on their axes for every orbit, so each keeps the same face towards Jupiter. Tides did that. Jupiter stretches a spinning moon into a slight oval, and because rock does not respond instantly, the bulge is carried a little ahead of the line to Jupiter. Jupiter pulls back on it, and the spin slows until the bulge stops moving through the moon. The time this takes is roughly

$$
t \approx \frac{\omega\, a^6\, C\, m}{3\, G M^2 R^3} \cdot \frac{Q}{k_2}
$$

where $\omega$ is the starting spin, $a$ the size of the orbit, $m$ and $R$ the moon's mass and radius, $M$ Jupiter's mass, and $C$ the moon's moment of inertia as a fraction of $mR^2$ (0.377 for Io, 0.346 for Europa, 0.311 for Ganymede and 0.355 for Callisto, from the Galileo spacecraft's measurements of their gravity). The last factor, $Q/k_2$, says how stiff the moon is and how much energy it loses each time it is squeezed.

**The honest part: $Q$ is not well known.** For Io today, Lainey and colleagues measured ${k_2/Q = 0.015 \pm 0.003}$ from the moons' orbits. But today's Io is hot and partly molten, which makes it unusually lossy. A young, cold moon of rock or ice could have been ten or a hundred times stiffer, and for the other moons there is no direct measurement at all. So the honest answer is a range. Taking $k_2/Q$ from 0.015 down to 0.0001, and a starting spin of one turn in 12 hours:

| Moon | Time to lock, in years |
| --- | --- |
| Io | 13 to 2,000 |
| Europa | 170 to 25,000 |
| Ganymede | 1,600 to 240,000 |
| Callisto | 52,000 to 7.8 million |

The ranges are wide, a factor of 150 in each row, and a different starting spin would shift them again. But the conclusion does not depend on where in the range the truth lies. Even the slowest case, Callisto at the stiff end, is under 0.2 per cent of the Solar System's 4.6 billion years. Every one of these moons was locked long ago. The $a^6$ is why the order follows distance: Callisto is 4.5 times as far out as Io, and $4.5^6$ is about 8,000.

**Try it yourself.** Io and Europa have just lined up. Where is Ganymede, and how long until Io and Europa line up again?

The answer: Ganymede is 90° round from them, and Io and Europa line up again 3.525 days later.

**What this level leaves out.** Mean motions hide the way each orbit is slowly turning, which is what the 0.7395° a day really measures: the long axes of Io's and Europa's oval orbits swing round at that rate, and the meetings follow them. The locking formula is an order-of-magnitude estimate. It treats the moon as a uniform elastic ball and ignores that $Q$ itself changes as a moon heats up or cools.
