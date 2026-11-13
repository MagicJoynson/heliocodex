---
sources:
  - { label: "ATNF Pulsar Catalogue, version 2.9.0 (Manchester, Hobbs, Teoh and Hobbs, Astronomical Journal, 2005), downloaded 13 November 2026", url: "https://www.atnf.csiro.au/research/pulsar/psrcat/" }
  - { label: "Lyne and others, 45 years of rotation of the Crab pulsar (Monthly Notices of the Royal Astronomical Society, 2015)", url: "https://arxiv.org/abs/1410.0886" }
  - { label: "Tananbaum and others, Highlights and discoveries from the Chandra X-ray Observatory (2014), on the Crab's spin-down power", url: "https://arxiv.org/abs/1405.7847" }
  - { label: "Hurley and others, An exceptionally bright flare from SGR 1806-20 (Nature, 2005): spike energy at 15 kpc", url: "https://arxiv.org/abs/astro-ph/0502329" }
  - { label: "Wikipedia, Earth's magnetic field (strength at the surface)", url: "https://en.wikipedia.org/wiki/Earth%27s_magnetic_field" }
  - { label: "Wikipedia, Solar luminosity (the IAU's value)", url: "https://en.wikipedia.org/wiki/Solar_luminosity" }
  - { label: "NIST, the Newtonian constant of gravitation", url: "https://physics.nist.gov/cgi-bin/cuu/Value?bg" }
lastChecked: 2026-11-13
---
This level works from real measurements. The ATNF Pulsar Catalogue, kept by Australia's national science agency, lists 4,503 pulsars in its version 2.9.0. For most of them it gives two numbers, and almost everything below is worked out from those two. The sums are done here, from the catalogue's values, unless a source is named.

**The two numbers.** The first is the period $P$, the time the star takes to turn once. The second is $\dot P$, said "P dot", the rate at which the period grows. It has no units, since it is seconds gained per second.

| Pulsar | $P$ (seconds) | $\dot P$ |
| --- | --- | --- |
| The Crab | 0.033392 | $4.21 \times 10^{-13}$ |
| The first pulsar, PSR B1919+21 | 1.3373 | $1.35 \times 10^{-15}$ |
| The magnetar SGR 1806−20 | 7.556 | $5.49 \times 10^{-10}$ |

A $\dot P$ of $4.21 \times 10^{-13}$ looks like nothing, but a year has 31.6 million seconds, so the Crab's turn gets longer by 13 millionths of a second every year. Radio telescopes time pulses to far better than that, so the slowing is easy to measure.

<figure class="photo">
  <img src="/img/learn/charts/pulsar-spin-and-slowing.svg" alt="A chart with time to turn once along the bottom and how fast the turn slows up the side, both on scales that go up in steps of ten. A big grey cloud of dots sits in the middle, a blue cloud at the lower left, and a few red dots at the top right. Dashed lines of equal age cross from lower left to upper right." width="800" height="760" loading="lazy" />
  <figcaption><b>A chart of real measurements.</b> The 2,888 pulsars in the ATNF catalogue whose period and slowing have both been measured and fall inside the frame. Blue: pulsars in pairs, or that turn faster than 50 times a second and slow very little, which are thought to have been spun up by a partner. Red: magnetars. The dashed lines join the points of equal characteristic age, worked out below. Data: ATNF Pulsar Catalogue, version 2.9.0.</figcaption>
</figure>

**How dense it must be, from the spin alone.** A star that spins too fast flies apart, because gravity at its equator can no longer supply the pull needed to keep the surface going round. For a sphere of mass $M$ and radius $R$ turning at angular speed $\Omega = 2\pi/P$, holding together needs

$$
\Omega^2 R < \frac{G M}{R^2}
$$

Put $M = \tfrac{4}{3}\pi R^3 \rho$ for a mean density $\rho$, and the radius cancels:

$$
\rho > \frac{3\pi}{G P^2}
$$

So the period alone sets a lowest possible density, with no need to know the size or the mass. The fastest pulsar in the catalogue, PSR J1748−2446ad, has $P = 0.0013960$ seconds. That gives at least $7.2 \times 10^{16}$ kg in every cubic metre, 70 million million times the density of water. No star made of ordinary atoms could be that dense. The sum is rough, since a spinning star bulges and is denser in the middle, but it shows from one measured number that pulsars must be neutron stars.

**The store of energy.** A spinning ball holds energy $E = \tfrac{1}{2} I \Omega^2$, where $I$ is its moment of inertia. For an even ball $I = \tfrac{2}{5} M R^2$. With 1.4 Suns and a radius of 10 km that is $1.1 \times 10^{38}$ kg m², and the catalogue uses $10^{38}$ for every pulsar, which is close enough for what follows. The Crab, turning 30 times a second, holds $1.8 \times 10^{42}$ joules in its spin.

**The power it gives out.** If the spin slows, the store shrinks. Differentiate $E = \tfrac{1}{2} I \Omega^2$ with respect to time:

$$
\dot E = I \Omega \dot\Omega
$$

Since $\Omega = 2\pi / P$, its rate of change is $\dot \Omega = -2\pi \dot P / P^2$. Putting the two together gives the power lost, in terms of the two measured numbers:

$$
-\dot E = \frac{4 \pi^2 I \dot P}{P^3}
$$

For the Crab this is $4.5 \times 10^{31}$ watts, about 117,000 times the power of the Sun. Chandra's team give the same figure, $5 \times 10^{38}$ erg a second in the units astronomers often use, and point out that it is about ten times the X-rays the whole nebula sends out. The spin of one star 20 km across is enough to keep a cloud 11 light years wide glowing.

**How old.** To turn a slowing into an age, a rule for the slowing is needed. Suppose it goes as a power of the spin, $\dot\Omega = -k\,\Omega^n$, where $n$ is called the braking index. Writing that in terms of $P$ and integrating from a birth period $P_0$ gives the age

$$
t = \frac{P}{(n-1)\dot P}\left[1 - \left(\frac{P_0}{P}\right)^{n-1}\right]
$$

A spinning magnet in empty space would have $n = 3$. If the star was also born spinning much faster than now, the bracket is close to 1, and the age is simply

$$
\tau_c = \frac{P}{2 \dot P}
$$

This is called the characteristic age. It is what the dashed lines on the chart mark. For the Crab it is 1,257 years.

**Checking it against history.** The Crab is one of the very few pulsars whose real age is known, because the supernova was seen in 1054. The catalogue's period and slowing were measured in 1991, 937 years later. So the characteristic age is too large by about a third.

Both assumptions are at fault. Timing of the Crab from 1968 to 2013, mostly at Jodrell Bank, measured the Crab's braking index directly, by how $\dot P$ itself changes, and found 2.34, not 3. Put $n = 2.34$ and $t = 937$ years into the full formula and solve for the birth period: about 20 thousandths of a second, so the Crab was born turning about 50 times a second, less than twice as fast as now. The Jodrell Bank team, fitting all 45 years of data, give 17 thousandths. The characteristic age is a useful label, and for most pulsars the only one there is, but it is not a clock.

**How strong the magnet.** A tilted magnet that spins radiates energy. The power of a spinning magnet of field $B$ at its equator, radius $R$ and angular speed $\Omega$, with its magnetic axis at right angles to its spin, is

$$
\dot E = \frac{8 \pi B^2 R^6 \Omega^4}{3 \mu_0 c^3}
$$

where $\mu_0$ is the magnetic constant and $c$ the speed of light. Set this equal to the spin-down power above, with $R = 10$ km and $I = 10^{38}$ kg m², and solve for the field:

$$
B \approx 3.2 \times 10^{15} \sqrt{P \dot P} \ \text{tesla}
$$

| Pulsar | $B$ (tesla) | Times the Earth's field |
| --- | --- | --- |
| The Crab | $3.8 \times 10^{8}$ | about 8 million million |
| The first pulsar | $1.4 \times 10^{8}$ | about 3 million million |
| SGR 1806−20 | $2.1 \times 10^{11}$ | about 4,000 million million |

The Earth's field at the surface is between about 25 and 65 millionths of a tesla. These figures are estimates, because the tilt, the radius and the moment of inertia are assumed. But they are the best way there is of weighing a pulsar's magnet, and most field strengths quoted for pulsars are worked out in roughly this way.

**Reading the chart again.** Lines of equal field, if they were drawn, would run across the chart the other way, falling from left to right, since $B$ depends on $P \dot P$ and age on $P / \dot P$. So the chart can be read as a map of age and magnet together. Ordinary pulsars are born at the upper left, around the Crab, and drift down and to the right over millions of years, slowing as they go, until their beams fade. The blue cloud at the lower left are old stars, most of them with magnets thousands of times weaker, that a partner has spun up again by feeding them gas. The red dots at the top right are young stars with the strongest magnets known.

**Why a magnetar cannot run on its spin.** SGR 1806−20 turns once in 7.6 seconds, so $\tfrac{1}{2} I \Omega^2$ is only $3.5 \times 10^{37}$ joules. Its spin-down power is $5 \times 10^{27}$ watts, about 13 times the Sun's, which is feeble for a neutron star. Yet in the flare of 27 December 2004 it gave out $3.7 \times 10^{39}$ joules in the opening spike, which lasted about a fifth of a second. That is the figure Hurley and colleagues measured, assuming the star is 15 kiloparsecs (49,000 light years) away and shone equally in every direction; it is as much as the Sun gives out in a quarter of a million years. It is about 100 times all the energy in its spin. Other estimates of the distance change the energy, but not by nearly enough to save the spin. The flare cannot have been paid for by the spin. It must have come from the magnetic field itself, which is why these stars are called magnetars.

**Try it yourself.** The Vela pulsar has $P = 0.089328$ seconds and $\dot P = 1.250 \times 10^{-13}$. Work out its characteristic age, its spin-down power and its field, using the formulas above.

The answers, from the catalogue's values: about 11,300 years, $6.9 \times 10^{29}$ watts (about 1,800 Suns), and $3.4 \times 10^{8}$ tesla.

**What this level leaves out.** The real spin-down comes from a wind of particles as well as from magnetic radiation, which is part of why $n$ is less than 3. The radius and moment of inertia of a neutron star depend on what matter does at densities no laboratory can reach. That is still being worked out, by timing pulsars in pairs to weigh them and by X-ray telescopes that measure their size.
