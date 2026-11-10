---
sources:
  - { label: "NASA/JPL astrodynamic parameters", url: "https://ssd.jpl.nasa.gov/astro_par.html" }
  - { label: "NASA NSSDC Earth fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" }
  - { label: "NASA NSSDC Moon fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html" }
  - { label: "NASA NSSDC Mars fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html" }
  - { label: "NASA NSSDC Sun fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" }
  - { label: "NASA NSSDC Jupiter fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html" }
  - { label: "NASA NSSDC Mercury fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html" }
  - { label: "Will 2014, the confrontation between general relativity and experiment", url: "https://arxiv.org/abs/1403.7377" }
lastChecked: 2026-11-10
---
This level puts numbers to the rules in the level before. Masses and sizes are from NASA's fact sheets and JPL's table of constants, and every result is worked out here and set beside a listed value where there is one.

**Newton's law.** Two masses $m_1$ and $m_2$ whose centres are a distance $r$ apart pull on each other with a force

$$
F = \frac{G\, m_1 m_2}{r^2}
$$

where $G = 6.67430 \times 10^{-11}$ m³ kg⁻¹ s⁻². A sphere pulls on things outside it exactly as if all its mass were at its centre, which is why $r$ is measured between centres.

**Why everything falls together.** Newton's second law says a force $F$ gives a mass $m$ an acceleration $a = F/m$. For a mass $m$ falling towards a much larger mass $M$,

$$
a = \frac{F}{m} = \frac{G M}{r^2}
$$

The falling mass has cancelled. A hammer and a feather get the same acceleration.

**Surface gravity.** At the surface of a body of radius $R$ the acceleration is

$$
g = \frac{G M}{R^2}
$$

| Body | $GM$ (km³/s²) | $R$ (km) | Surface gravity (m/s²) | Compared with Earth |
| --- | --- | --- | --- | --- |
| Earth | 398,600 | 6,371.0 | 9.82 | 1 |
| Moon | 4,902.8 | 1,737.4 | 1.62 | 0.165 |
| Mars | 42,828 | 3,389.5 | 3.73 | 0.380 |
| Sun | 132,712,000,000 | 695,700 | 274 | 27.9 |

The fact sheets list 9.820, 1.62, 3.73 and 274.0. The Earth's spin and its slightly flattened shape bring what you feel at the equator down to 9.780.

At the height of the space station, 400 km up, $r$ is 6,771 km in place of 6,371, and the pull is weaker by $(6371/6771)^2 = 0.885$.

**The balance point.** Two bodies a distance $d$ apart go round their common centre of mass. Its distance from the centre of the first is

$$
r_1 = d\, \frac{m_2}{m_1 + m_2}
$$

The Earth has 81.30 times the mass of the Moon, and the two are 384,400 km apart on average. That puts the balance point $384{,}400 / 82.30 = 4{,}671$ km from the Earth's centre, about 1,700 km below the surface.

The Sun has 1,047 times the mass of Jupiter, which orbits at 778.479 million km. Their balance point is 742,600 km from the Sun's centre. The Sun's radius is 695,700 km, so the point lies 47,000 km above the visible surface.

**Energy and escape.** Lifting a mass $m$ against gravity stores energy. Counted from zero at a very great distance, the energy at distance $r$ is

$$
U = -\frac{G M m}{r}
$$

To get away for good, a body needs enough energy of motion to bring the total up to zero: $\tfrac{1}{2} m v^2 = GMm/R$. The mass cancels again, and

$$
v_{\text{esc}} = \sqrt{\frac{2 G M}{R}}
$$

This gives 11.19 km/s for the Earth and 617.7 km/s for the Sun. The fact sheets list 11.186 and 617.6.

**Where Newton runs out.** General relativity agrees with Newton's law whenever gravity is weak and speeds are small. A useful measure of how weak is the number $GM/(rc^2)$, with $c$ the speed of light. At the surface of the Earth it is $7 \times 10^{-10}$. At the surface of the Sun it is $2 \times 10^{-6}$. Einstein's corrections are of this size, which is why they went unnoticed for so long. Three of them have simple formulas.

*Light passing a mass.* A ray that passes a mass $M$ at closest distance $b$ is bent through an angle

$$
\alpha = \frac{4 G M}{c^2\, b}
$$

For light grazing the edge of the Sun this is $8.49 \times 10^{-6}$ radians, or 1.75 seconds of arc. The measurements of 1919 were good to only about 30 per cent. Radio telescopes have since confirmed the figure to 0.02 per cent.

*Mercury's orbit.* On each orbit the nearest point to the Sun moves forward by

$$
\Delta\phi = \frac{6\pi G M}{c^2\, a\,(1 - e^2)}
$$

For Mercury, $a = 57.909$ million km and $e = 0.2056$, which gives 0.1035 seconds of arc for each orbit. Mercury goes round 415 times in a century, so the total is 43.0 seconds of arc a century. The amount left unexplained by Newton's law was 43.

*Clocks.* A clock at distance $r$ from a mass runs slow, compared with one far away, by the fraction $GM/(rc^2)$. A clock moving at speed $v$ runs slow by $v^2/(2c^2)$. For the clocks on navigation satellites the first effect is a gain of 46 microseconds a day over clocks on the ground, because they are higher up, and the second is a loss of 7, because they are moving fast. The net gain is 39 microseconds a day. Light travels 11.7 km in that time, so a system that ignored the difference would drift by that much each day.
