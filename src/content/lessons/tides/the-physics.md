---
sources:
  - { label: "NASA NSSDC Moon fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html" }
  - { label: "NASA NSSDC Earth fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" }
  - { label: "NASA NSSDC Sun fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" }
  - { label: "NASA NSSDC Saturn fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html" }
  - { label: "NASA NSSDC Saturnian rings fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html" }
  - { label: "NASA NSSDC Jupiter fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html" }
  - { label: "Wikipedia, Roche limit", url: "https://en.wikipedia.org/wiki/Roche_limit" }
  - { label: "Wikipedia, Comet Shoemaker-Levy 9", url: "https://en.wikipedia.org/wiki/Comet_Shoemaker%E2%80%93Levy_9" }
  - { label: "NASA, Moon facts (moving away 3.8 cm a year)", url: "https://science.nasa.gov/moon/facts/" }
  - { label: "NIST, the Newtonian constant of gravitation", url: "https://physics.nist.gov/cgi-bin/cuu/Value?bg" }
lastChecked: 2026-11-13
---
This level derives the tide from Newton's law of gravity, step by step, and then uses the result three ways: for the height of the ocean tide, for the distance at which a moon is torn apart, and for how fast the day is getting longer. Masses, sizes and distances are from NASA's fact sheets. The sums are done here unless a source is named.

**Step one: the difference in pull.** The Moon, of mass $M$, is a distance $d$ from the Earth's centre. The Earth's radius is $R$. Newton's law gives the Moon's pull on each kilogram as $GM/r^2$ at a distance $r$. So on the side facing the Moon, and at the centre, it is

$$
a_{\text{near}} = \frac{GM}{(d - R)^2}, \qquad a_{\text{centre}} = \frac{GM}{d^2}
$$

The whole Earth falls towards the Moon with the pull at the centre, so what is left over, the tide, is the difference. Take out $GM/d^2$ and write $x = R/d$:

$$
a_{\text{near}} - a_{\text{centre}} = \frac{GM}{d^2}\left[\frac{1}{(1-x)^2} - 1\right]
$$

**Step two: a small number.** The Earth's radius is only 1.66 per cent of the Moon's distance, so $x$ is small, and for small $x$

$$
\frac{1}{(1-x)^2} \approx 1 + 2x
$$

This is the first step of the binomial expansion. It can be checked with a calculator: for $x = 0.01$ the left side is 1.0203 and the right is 1.02. So the tidal pull on the near side is

$$
a_{\text{tide}} \approx \frac{2 G M R}{d^3}
$$

On the far side the same working gives the same size, pointing away from the Moon. That is why there are two bulges. The approximation is good to about 2.5 per cent for the Moon: the true near-side pull is a little stronger, and the far-side pull a little weaker.

**Why the cube.** The pull itself falls with the square of the distance. The tide is the change in the pull across the Earth, and a change across a fixed width falls one power faster. This is the formula behind the sums in the level before.

The Moon has a mass of $7.35 \times 10^{22}$ kg and is 384,400 km away. The Sun has $1.99 \times 10^{30}$ kg and is 149.6 million km away. The Earth's radius is 6,371 km.

| | Ordinary pull on the Earth | Tidal pull at the surface |
| --- | --- | --- |
| The Moon | 1 | $1.10 \times 10^{-6}$ m/s² |
| The Sun | 179 times the Moon's | $5.05 \times 10^{-7}$ m/s² |

The Moon's tide is 2.18 times the Sun's. Both are tiny. The Moon's is about one nine-millionth of the pull of the Earth's own gravity, $g = 9.81$ m/s².

**Step three: the squeeze at the sides.** At a point a quarter of the way round, the Moon is the same distance away as from the centre, but in a slightly different direction. That small change of direction gives a pull towards the Earth's centre of

$$
a_{\text{side}} \approx \frac{G M R}{d^3}
$$

half the stretch along the line, pointing inwards. So the tide stretches the Earth along the line to the Moon and squeezes it round the waist.

<figure class="photo">
  <img src="/img/learn/charts/tide-stretch-and-squeeze.svg" alt="A drawing of the Earth with arrows round its edge. Arrows on the sides facing towards and away from the Moon point outwards and are long; arrows at the top and bottom point inwards and are half as long. A dashed oval round the Earth is stretched along the line to the Moon." width="800" height="560" loading="lazy" />
  <figcaption><b>A drawing.</b> The tidal pull at sixteen points round the Earth, worked out from the formulas on this page. The arrows show its direction and relative size; the Moon is far off to the right. The dashed oval is the shape the water would take, drawn millions of times taller than it is.</figcaption>
</figure>

**Step four: one formula for everywhere.** Both results come from one expression, the tidal potential, which gives the energy per kilogram at a point on the surface at angle $\theta$ from the line to the Moon:

$$
\Phi = -\frac{G M R^2}{2 d^3}\left(3\cos^2\theta - 1\right)
$$

The pull is how fast this changes with height. Differentiate with respect to $R$ and change the sign: at $\theta = 0$ this gives $2GMR/d^3$ outwards, and at $\theta = 90°$ it gives $GMR/d^3$ inwards, the two results above. A formula that reproduces what was derived by hand is a good sign it is right.

**How high the water stands.** Water settles where the total energy per kilogram is the same everywhere on its surface. Raising water by a height $h$ costs $g h$ per kilogram, so the water rises where $\Phi$ is lowest:

$$
h(\theta) = \frac{G M R^2}{2 g d^3}\left(3\cos^2\theta - 1\right)
$$

For the Moon the factor in front is 0.179 m. Under the Moon and opposite it, $\cos\theta = \pm 1$ and the water stands 0.357 m higher than average. A quarter of the way round it stands 0.179 m lower. From high to low is 0.54 m, the half a metre in the level before.

This is the equilibrium tide, the height the sea would reach if it could keep up. As the level before explains, it cannot, so real tides are shaped by the oceans and coasts. But it sets the scale, and it is what drives everything else.

**Try it yourself.** Use the same formula for the Sun, then work out the range at spring tides, when the two add, and at neap tides, when the Sun's low water falls under the Moon's high water.

The answers: 0.25 m for the Sun alone, 0.78 m at springs and 0.29 m at neaps. Spring tides have more than two and a half times the range of neap tides.

**Torn apart: the Roche limit.** Turn the tide on a small moon of radius $r$ and density $\rho_m$, a distance $d$ from a planet of mass $M$. The tidal pull across it is $2GMr/d^3$. What holds it together is its own gravity at its surface:

$$
\frac{G m}{r^2} = \frac{4}{3}\pi G \rho_m r
$$

The moon comes apart where the tide wins. Set the two equal and the moon's size cancels: for a body held together only by its own gravity, the limit is the same whatever its size. It is at

$$
d = \left(\frac{3 M}{2 \pi \rho_m}\right)^{1/3}
$$

Write the planet's mass as $\tfrac{4}{3}\pi R^3 \rho_P$ and this becomes

$$
d = R \left(\frac{2 \rho_P}{\rho_m}\right)^{1/3} \approx 1.26\, R \left(\frac{\rho_P}{\rho_m}\right)^{1/3}
$$

This is for a rigid ball held only by its gravity. A moon that can flow, or a loose pile of rubble, is stretched out of shape by the tide, which makes it easier to pull apart. Édouard Roche worked out in 1848 that for a fluid the number in front is about 2.44 instead of 1.26.

The numbers going in: Saturn's radius at its equator is 60,268 km and its mean density 687 kg/m³, and ice is 917 kg/m³. The Earth's is 5,513 kg/m³ and the Moon's 3,344. Jupiter's radius is 71,492 km and its density 1,326 kg/m³, and Shoemaker-Levy 9's density has been estimated at about 500 kg/m³.

| | Limit, rigid | Limit, fluid |
| --- | --- | --- |
| Ice round Saturn | 69,000 km | 134,000 km |
| The Moon round the Earth | 9,500 km | 18,400 km |
| Shoemaker-Levy 9 round Jupiter | 125,000 km | 241,000 km |

Saturn's main rings reach from 74,658 km to 136,780 km from its centre, and the fluid limit for ice falls close to their outer edge. Inside it, loose ice cannot gather into a moon. Shoemaker-Levy 9 passed just over 40,000 km above Jupiter's cloud tops in July 1992, about 111,000 km from the centre. That was inside even the limit for a rigid ball, and the comet broke into more than 20 pieces. The Moon is 384,400 km away, twenty times further than its limit.

**Why the day grows longer.** The level before says that the Moon moves away by 3.8 cm a year, and that the day grows longer by about 2 thousandths of a second a century. The two are the same fact, because angular momentum, the quantity of spin, is never lost, only passed on. Energy is different: much of it is turned into heat as the tides rub.

A body of mass $m$ in a circular orbit of radius $a$ round a mass $M_E$ has orbital angular momentum

$$
L = m \sqrt{G M_E a}
$$

Differentiate with respect to time:

$$
\dot L = \frac{m}{2} \sqrt{\frac{G M_E}{a}}\ \dot a
$$

With $\dot a = 3.8$ cm a year, the Moon gains $1.42 \times 10^{24}$ kg m²/s of angular momentum every year. The Earth's spin must lose the same. Its spin angular momentum is $I\omega$, where $I = 0.331\, M_E R^2 = 8.0 \times 10^{37}$ kg m². So the Earth's rate of spin falls by $\dot L / I$ each year, and the length of the day, $2\pi/\omega$, grows in proportion.

The answer is 2.1 thousandths of a second a century. A laser aimed at mirrors on the Moon and the ancient records of when the day was shorter are two views of one exchange.

**What this level leaves out.** The Earth is not rigid. The rock beneath the sea rises and falls with the tide too, so the ocean tide measured against the sea floor is smaller than the equilibrium figure above. The Sun's tide also slows the Earth's spin, without moving the Moon, so the day grows a little faster than the Moon's share alone. And the real tide is a set of waves sloshing in each ocean basin. Predicting it at a given port needs years of measurements there, broken into dozens of separate rhythms, not a single formula.
