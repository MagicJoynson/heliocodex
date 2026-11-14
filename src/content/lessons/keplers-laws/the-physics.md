---
sources:
  - { label: "NASA/JPL astrodynamic parameters", url: "https://ssd.jpl.nasa.gov/astro_par.html" }
  - { label: "NASA NSSDC Earth fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" }
  - { label: "NASA NSSDC Mars fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html" }
  - { label: "NASA NSSDC Jupiter fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html" }
  - { label: "NASA NSSDC Jovian satellite fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html" }
  - { label: "NASA NSSDC comet fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/cometfact.html" }
lastChecked: 2026-11-10
---
Kepler found his laws by fitting curves to observations. Newton later showed that all three follow from one force that weakens with the square of the distance. This level writes each law as an equation and checks it against real numbers. The orbital figures are from NASA's fact sheets, the constants are from JPL, and every result is worked out here.

**The ellipse.** Measure the planet's distance $r$ from the Sun and its angle $\theta$ round the orbit, counted from the point of closest approach. With semi-major axis $a$ and eccentricity $e$, the first law is

$$
r = \frac{a\,(1 - e^2)}{1 + e\cos\theta}
$$

At ${\theta = 0}$ this gives the nearest point, and at ${\theta = 180^\circ}$ the furthest:

$$
r_{\text{near}} = a\,(1 - e)
$$

$$
r_{\text{far}} = a\,(1 + e)
$$

For Mars, ${a = 227.956}$ million km and ${e = 0.0935}$. That gives 206.6 and 249.3 million km. The fact sheet lists 206.650 and 249.261.

<figure class="photo">
  <img src="/img/learn/charts/an-ellipse-and-its-focus.svg" alt="An oval orbit with the Sun at a point right of centre and a cross marking an empty point the same distance left of centre. The orbit's nearest and farthest points lie at either end of the long axis. Bars below measure a times one plus e from the far end to the Sun, a times one minus e from the Sun to the near end, and 2a across the whole." width="800" height="700" loading="lazy" />
  <figcaption><b>Where the Sun sits.</b> The Sun is not at the centre of the ellipse but at one of two points called foci, a distance <i>ae</i> from the centre. The other focus is empty. The two distances to the ends of the long axis then add up to 2<i>a</i>. Drawn here with <i>e</i> = 0.6, far more stretched than any planet's orbit: Mars's, at 0.0935, would look like a circle.</figcaption>
</figure>

**Equal areas.** In a short time the line from the Sun to the planet sweeps a thin triangle. Its area depends only on the distance $r$ and on the part of the velocity that is at right angles to the line, $v_\perp$:

$$
\frac{dA}{dt} = \tfrac{1}{2}\, r\, v_\perp
$$

The Sun's pull acts along the line, so it cannot twist the planet round the Sun, and the planet's angular momentum ${L = m\,r\,v_\perp}$ never changes. So $r\,v_\perp$ is constant, and the second law is the conservation of angular momentum in another form.

At the nearest and furthest points the whole velocity is at right angles to the line, so

$$
r_{\text{near}}\, v_{\text{near}} = r_{\text{far}}\, v_{\text{far}}
$$

For the Earth the distances are 147.095 and 152.100 million km, a ratio of 1.0340. The listed speeds are 30.29 and 29.29 km/s, a ratio of 1.0341.

**The harmonic law.** Take a small body in a circular orbit of radius $a$ round a mass $M$. Gravity supplies exactly the inward force needed to keep it on the circle:

$$
\frac{G M m}{a^2} = \frac{m\, v^2}{a}
$$

Its speed is one circumference in each period, ${v = 2\pi a / P}$. Put that in and the small mass $m$ cancels:

$$
P^2 = \frac{4\pi^2}{G M}\, a^3
$$

The same result holds for an ellipse, with $a$ the semi-major axis. For the Sun, ${GM = 1.32712 \times 10^{20}}$ m³/s². One astronomical unit is ${1.495979 \times 10^{11}}$ m. The formula then gives ${P = 365.257}$ days. The measured sidereal year is 365.256 days.

Measured in years and astronomical units, the constant $4\pi^2/GM$ is 1 for anything going round the Sun, which is why the law looked so simple to Kepler.

**The planet's own mass.** Strictly, the two bodies go round their common centre of mass, and $M$ should be the sum of both masses:

$$
P^2 = \frac{4\pi^2}{G\,(M + m)}\, a^3
$$

The Sun has 1,047 times the mass of Jupiter and its moons, so for Jupiter $a^3/P^2$ comes out about one part in a thousand larger than for a body of no mass. That is the small mismatch in Jupiter's row of the table in the level before this one.

**Weighing Jupiter.** Turn the law round and it gives the mass in the middle:

$$
M = \frac{4\pi^2 a^3}{G\, P^2}
$$

Io goes round Jupiter at 421,800 km in 1.769138 days. With ${G = 6.67430 \times 10^{-11}}$ m³ kg<sup>−1</sup> s<sup>−2</sup>, this gives ${1.90 \times 10^{27}}$ kg. The listed mass of Jupiter is ${1.898 \times 10^{27}}$ kg.

Timing an orbit gives the product $GM$ far more exactly than either $G$ or $M$ is known alone. That is why JPL lists $GM$ for the Sun to 18 figures, while $G$ itself is uncertain by about 2 parts in 100,000.

**Speed at any point.** Energy is conserved as well as angular momentum. Together they give the speed at any distance $r$ on an orbit of semi-major axis $a$:

$$
v^2 = G M \left( \frac{2}{r} - \frac{1}{a} \right)
$$

For a circle ${r = a}$ and this is ${v^2 = GM/a}$, which for the Earth's orbit is 29.78 km/s. At the Earth's nearest and furthest points it gives 30.29 and 29.29 km/s, the listed values.

Halley's Comet has ${a = 17.94}$ au and comes within 0.587 au of the Sun, so its furthest point is ${2a - 0.587 = 35.3}$ au. The formula gives 54.5 km/s at the near end and 0.91 km/s at the far end, a ratio of 60.

**Leaving altogether.** As $a$ grows without limit the orbit opens out and the body never returns. Setting ${1/a = 0}$ gives the speed needed to escape from distance $r$:

$$
v_{\text{esc}} = \sqrt{\frac{2 G M}{r}}
$$

It is $\sqrt{2}$ times the speed of a circular orbit at the same distance. At the Earth's distance from the Sun that is 42.1 km/s.
