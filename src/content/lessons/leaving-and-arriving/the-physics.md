---
sources:
  - { label: "NASA JPL Horizons, state vectors of the Mars 2020 spacecraft, the Earth and Mars (Sun-centred, July 2020 to February 2021), queried 13 November 2026", url: "https://ssd.jpl.nasa.gov/horizons/" }
  - { label: "NASA JPL Horizons, state vectors of Voyager 2 and Jupiter (Sun-centred, June to August 1979), queried 13 November 2026", url: "https://ssd.jpl.nasa.gov/horizons/" }
  - { label: "NASA JPL, astrodynamic parameters (the gravity of the Sun, the Earth and Jupiter, and the astronomical unit)", url: "https://ssd.jpl.nasa.gov/astro_par.html" }
  - { label: "NASA NSSDC Mars fact sheet (Mars's distance from the Sun)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html" }
  - { label: "NASA, Mars 2020 Perseverance rover: launch and landing dates", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" }
  - { label: "NASA, Voyager 2", url: "https://science.nasa.gov/mission/voyager/voyager-2/" }
lastChecked: 2026-11-13
---
This level derives the one equation that every route between the planets is built from, and then checks it against the real paths of two spacecraft, worked out by NASA's Jet Propulsion Laboratory from radio tracking and published in its Horizons system. The first is the Perseverance rover on its way to Mars. The second is Voyager 2 swinging past Jupiter. The sums are done here, from those positions and speeds, unless a source is named.

**Energy per kilogram.** A craft coasting round the Sun has energy of motion and energy of height. Per kilogram, at speed $v$ and distance $r$ from a body of mass $M$, the total is

$$
\varepsilon = \frac{v^2}{2} - \frac{G M}{r}
$$

With the engine off, nothing adds or takes away energy, so $\varepsilon$ stays the same all along the path. The second term is negative because the craft is in a well: it would have to be given energy to climb out.

Two results follow at once. A circle of radius $r$ needs gravity to supply exactly the pull that keeps the craft turning, ${v^2/r = GM/r^2}$, so ${v = \sqrt{GM/r}}$. To escape, $\varepsilon$ must reach zero, so ${v = \sqrt{2GM/r}}$. That is why the level before could say escape speed is always 1.4 times the orbital speed: the factor is $\sqrt 2$.

**The vis-viva equation.** For an oval orbit, take its two ends, closest to the Sun at $r_p$ and farthest at $r_a$. At both ends the craft moves at right angles to the line to the Sun, so the turning effect of its motion, its angular momentum, is just distance times speed. That is also kept the same, so

$$
r_p v_p = r_a v_a
$$

Write the energy at both ends, set them equal, and use this to replace $v_a$. After the algebra the speed at the near end is

$$
v_p^2 = \frac{2 G M\, r_a}{r_p (r_p + r_a)}
$$

The half-width of the oval along its long axis is ${a = (r_p + r_a)/2}$. Put $v_p$ back into the energy and it simplifies to

$$
\varepsilon = -\frac{G M}{2 a}
$$

So the energy depends only on the size of the orbit, not its shape. Since the energy is the same everywhere, the speed at any distance is

$$
v^2 = G M \left(\frac{2}{r} - \frac{1}{a}\right)
$$

This is called the vis-viva equation, from the old Latin name for energy of motion. Know the size of the orbit and the distance, and the speed follows.

**Real data: Perseverance between the planets.** Perseverance left the Earth on 30 July 2020. Horizons gives its position and speed each day. Here are four readings from while it coasted, well away from both planets:

| Date | From the Sun | Speed |
| --- | --- | --- |
| 15 Aug 2020 | 1.032 au | 32.35 km/s |
| 14 Oct 2020 | 1.200 au | 28.39 km/s |
| 13 Dec 2020 | 1.406 au | 24.27 km/s |
| 12 Jan 2021 | 1.492 au | 22.74 km/s |

The craft slowed by about 10 km a second as it climbed out from the Sun. Work out $\varepsilon$ for each row and all four come to −336.3 megajoules per kilogram, the same to within 0.1 per cent. The energy is kept, as it should be. Then ${\varepsilon = -GM/2a}$ gives the size of the orbit: ${a = 1.319}$ au. Its near end is 1.013 au from the Sun, just inside the Earth's path, and its far end 1.625 au, beyond Mars's.

**The cheapest route.** The route in the level before touches the Earth's orbit at 1 au and Mars's at 1.524 au, so ${a = 1.262}$ au. Vis-viva gives the speeds at its two ends, and the circle formula gives the planets' own speeds:

| | Planet | Craft |
| --- | --- | --- |
| Leaving the Earth | 29.78 km/s | 32.73 km/s |
| Arriving at Mars | 24.13 km/s | 21.48 km/s |

So the craft must leave the Earth's neighbourhood 2.94 km a second faster than the Earth moves, and arrives 2.65 km a second slower than Mars, which must be made up to stay. These leftover speeds, once the planet's own pull is far behind, are called the excess speeds.

**Why a low start is cheap.** Starting from a low orbit, 200 km up, where the speed is 7.78 km a second, how big a burn gives an excess speed of 2.94? Not 2.94 more. Energy per kilogram, measured from the Earth, must go from the low orbit to $v_\infty^2/2$ far away, so the speed just after the burn is

$$
v = \sqrt{v_\infty^2 + v_{\text{esc}}^2}
$$

where ${v_{\text{esc}} = 11.01}$ km a second at that height. That gives 11.40, a burn of 3.61 km a second. To reach escape and then add 2.94 separately would take 3.23 plus 2.94, which is 6.17. Burning deep in the Earth's well, while moving fast, is far more effective.

**Real data: buying time with energy.** Horizons puts Perseverance 200,000 km from the Earth on 31 July 2020, moving away at 4.29 km a second. Take off the energy it still had to spend climbing out of the Earth's pull, and its excess speed was 3.80 km a second, more than the cheapest route's 2.94. That extra speed stretched its orbit beyond Mars's, as the table showed, and cut the trip short. It reached Mars on 18 February 2021, 1.570 au from the Sun, 203 days after its launch on 30 July, having gone 142 degrees round the Sun. The cheapest route between those same two distances takes 268 days and goes half way round. Kepler's laws, applied to the orbit worked out from the table, put the crossing of 1.570 au 202.5 days after the reading on 31 July. Horizons has it arriving 202 days after that same reading, so the sum lands within half a day. From a low orbit the extra speed would have cost a burn of 3.86 km a second against 3.61.

**Gravity assists.** Seen from the planet, a passing craft is on a curve that is symmetric: it falls in, swings round, and climbs out, leaving as fast as it came, only in a new direction. Seen from the Sun, the planet's own speed is added to the craft's before and after. If the turn swings the craft round to move more along the planet's path, it leaves faster, as measured from the Sun.

**Real data: Voyager 2 at Jupiter.** Voyager 2 passed closest to Jupiter on 9 July 1979. Horizons gives:

| Date | Speed from the Sun | Speed from Jupiter |
| --- | --- | --- |
| 19 June 1979 | 9.87 km/s | 8.54 km/s |
| 29 July 1979 | 20.27 km/s | 8.56 km/s |

On those two dates the craft was about the same distance from Jupiter, 17.5 and 16.1 million km. As seen from Jupiter its speed hardly changed. As seen from the Sun it doubled. At 5.2 au, the escape speed from the Sun is about 18.5 km a second. Voyager 2 arrived at Jupiter bound to the Sun, with an energy of −121 megajoules per kilogram, and left with a positive energy, enough to leave the Solar System. It still had to call at Saturn, Uranus and Neptune first.

<figure class="photo">
  <img src="/img/learn/charts/voyager-2-at-jupiter.svg" alt="A diagram of arrows. A grey arrow is Jupiter's own motion. From its tip, two blue arrows of equal length, on a dashed circle, show Voyager 2's speed seen from Jupiter before and after the pass, turned through a large angle. Gold arrows from the start of the grey arrow to the tips of the blue ones show the speed seen from the Sun: short before, much longer after." width="800" height="760" loading="lazy" />
  <figcaption><b>Adding Jupiter's motion.</b> Seen from the Sun, the craft's motion is Jupiter's motion plus its motion seen from Jupiter. The pass only turns the blue arrow round the dashed circle; it does not lengthen it. But turning it to point more along Jupiter's path makes the gold arrow, the sum, twice as long. The lengths are the speeds from Horizons; the angles between them are worked out from those speeds, and the drawing is flat, where the real pass was not.</figcaption>
</figure>

**Try it yourself.** Use vis-viva for the cheapest route from the Earth, at 1 au, to Jupiter, at 5.203 au. How long does it take, and what excess speed does it need on leaving the Earth?

The answer: ${a = 3.10}$ au, so the trip is half of $3.10^{3/2}$ years, about 2.7 years, and the excess speed is 8.8 km a second. Voyager 2 took 23 months, from August 1977 to July 1979, by leaving faster on a longer orbit, as Perseverance did for Mars.

**What this level leaves out.** These sums treat each part of the journey as if only one body pulled at a time: the Earth near the Earth, the Sun in between, the planet at the end. Real routes are worked out by computer with every pull at once, and with orbits that are ovals, slightly tilted to each other. The 1.570 au and 203 days are the real figures. The cheapest route's 259 and 268 days are from circles, which is why its distances do not quite match.
