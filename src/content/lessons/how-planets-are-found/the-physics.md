---
sources:
  - { label: "NASA Exoplanet Archive, Planetary Systems table (default values), queried 13 November 2026", url: "https://exoplanetarchive.ipac.caltech.edu/" }
  - { label: "Mayor and Queloz, A Jupiter-mass companion to a solar-type star (Nature, 1995)", url: "https://www.nature.com/articles/378355a0" }
  - { label: "Cont and others, 51 Peg b revisited with VLT/CRIRES+ (Astronomy and Astrophysics, 2026): i about 50 degrees, 0.61 Jupiter masses", url: "https://arxiv.org/abs/2605.23582" }
  - { label: "Brogi and others, Detection of molecular absorption in the dayside of exoplanet 51 Pegasi b? (Astrophysical Journal Letters, 2013)", url: "https://arxiv.org/abs/1302.6242" }
  - { label: "Birkby and others, Discovery of water at high spectral resolution in the atmosphere of 51 Peg b (Astronomical Journal, 2017): 70 < i < 82.2 degrees", url: "https://arxiv.org/abs/1701.07257" }
  - { label: "Stassun and others 2017 (Astronomical Journal), the archive's source for HD 209458 b", url: "https://ui.adsabs.harvard.edu/abs/2017AJ....153..136S/abstract" }
  - { label: "Wikipedia, HD 209458 b (the first planet seen to transit)", url: "https://en.wikipedia.org/wiki/HD_209458_b" }
  - { label: "NASA NSSDC Sun fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" }
  - { label: "NASA NSSDC Jupiter fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html" }
  - { label: "NIST, the Newtonian constant of gravitation", url: "https://physics.nist.gov/cgi-bin/cuu/Value?bg" }
lastChecked: 2026-11-13
recheck: { what: "Whether the tilt and true mass of 51 Pegasi b have been settled", by: 2027-11-13 }
---
This level derives the two formulas behind most planets found round other stars, and then uses them on real measurements from NASA's Exoplanet Archive. One formula turns a star's wobble into a planet's mass. The other turns a dip in starlight into a planet's size. Put the two together and you can weigh a world nobody has seen and say what it is made of. The sums are done here unless a source is named.

**Step one: the star moves too.** A planet does not go round a still star. Both go round their shared centre of mass, on opposite sides of it. Their momenta balance, so a star of mass $M$ moving at $v_\star$ and a planet of mass $m$ moving at $v_p$ obey

$$
M v_\star = m v_p
$$

<figure class="photo">
  <img src="/img/learn/charts/star-and-planet-round-their-centre.svg" alt="A large gold star and a small blue planet on opposite sides of a cross marking their shared centre. The planet moves on a big dashed circle and the star on a small one, so the planet's arrow is long and the star's is short, and they point opposite ways. An arrow at the bottom right points towards us." width="800" height="640" loading="lazy" />
  <figcaption><b>Both move.</b> The star and the planet go round the point between them, on opposite sides of it, so when the planet moves one way the star moves the other. The heavier the star, the smaller its circle and the slower it goes. The part of its motion towards and away from us is what shifts its light. Not to scale: for a real star the shared centre is usually inside the star.</figcaption>
</figure>

**Step two: how fast the planet goes.** For a circular orbit of radius $a$ and period $P$, the planet's speed is ${v_p = 2\pi a / P}$. Kepler's third law, in Newton's form, links $a$ to $P$. When the planet is far lighter than the star it is

$$
a^3 = \frac{G M P^2}{4 \pi^2}
$$

**Step three: put them together.** Take ${v_\star = (m/M)\,v_p}$, put in ${v_p = 2\pi a/P}$, and replace $a$ using step two. The radius drops out and what is left is

$$
v_\star = \left(\frac{2 \pi G}{P}\right)^{1/3} \frac{m}{M^{2/3}}
$$

We see the orbit from some angle $i$, where ${i = 90°}$ means edge on. Only the part of the star's motion along our line of sight shifts its light, so what is measured is

$$
K = \left(\frac{2 \pi G}{P}\right)^{1/3} \frac{m \sin i}{M^{2/3}}
$$

$K$ is the largest speed towards or away from us, read from the Doppler shift of the star's dark lines.

**What it means for the Sun.** Jupiter, with a 12-year orbit, makes the Sun swing at 12.5 m/s, about the speed of a fast cyclist. The Earth makes it swing at 9 cm/s, slower than a walk. That is why giant planets close to their stars were found first, and why finding a second Earth this way is so hard. The light is shifted by $v/c$ of its wavelength: for 12.5 m/s and green light at 500 nm, about two hundred-thousandths of a nanometre.

**Real data: 51 Pegasi b.** The first planet found round a Sun-like star, announced by Michel Mayor and Didier Queloz in 1995. The archive gives

| | Value |
| --- | --- |
| Period $P$ | 4.2308 days |
| Swing of the star $K$ | 55.77 m/s |
| Mass of the star $M$ | 1.07 Suns |

Turn the formula round to give the planet's mass:

$$
m \sin i = K \left(\frac{P}{2 \pi G}\right)^{1/3} M^{2/3}
$$

Put the numbers in and $m \sin i$ comes out at 0.46 times the mass of Jupiter. Step two gives the size of the orbit: 0.052 au, about a seventh of Mercury's distance from the Sun. A planet half as heavy as Jupiter, going round its star in four days, was unlike anything in the Solar System.

**Why only $m \sin i$.** The wobble alone cannot say how the orbit is tilted. A heavier planet in an orbit seen nearly face on gives the same $K$ as a lighter one seen edge on. So a wobble gives the least the mass can be. Other measurements are needed for the tilt, and for 51 Pegasi b they disagree. Studies of the planet's own faint light, by Brogi and colleagues in 2013 and Birkby and colleagues in 2017, put $i$ at between about 70 and 82 degrees, close to edge on, with a true mass of about 0.46 to 0.48 Jupiters. A 2026 study by Cont and colleagues, with the CRIRES+ instrument in Chile, found $i$ of about 50 degrees and a mass of 0.61 Jupiters, and NASA's archive now uses those values. The authors trace the difference to a revised measurement of the planet's own speed. As of November 2026 the question is open.

**The dip.** If the orbit happens to be edge on, the planet crosses the face of its star once each orbit. The star's light drops by the share of its disc that the planet covers:

$$
\frac{\Delta F}{F} = \left(\frac{R_p}{R_\star}\right)^2
$$

For Jupiter crossing the Sun that is 1 per cent. For the Earth it is 84 parts in a million.

**How likely a crossing is.** Seen from a random direction, a planet crosses its star only if we lie within a thin band either side of its orbital plane. For an orbit much bigger than the star, the chance is about

$$
p \approx \frac{R_\star}{a}
$$

For the Earth seen from far away it is 0.47 per cent, about 1 in 215. For 51 Pegasi b it is about 11 per cent. Close-in planets are more likely to cross their stars, which is the second reason the first planets found were close in. Searches that stare at hundreds of thousands of stars, as Kepler and TESS have, make up for the odds by numbers.

**Real data: HD 209458 b.** In 1999 this became the first planet seen to cross its star. The archive gives

| | Value |
| --- | --- |
| Period $P$ | 3.5247 days |
| Swing of the star $K$ | 84.7 m/s |
| Mass of the star $M$ | 1.23 Suns |
| Radius of the star | 1.19 Suns |
| Radius of the planet | 1.39 Jupiters |
| Depth of the dip | 1.50 per cent |

Because it crosses its star, its orbit must be nearly edge on, so $\sin i$ is close to 1 and $m \sin i$ is very nearly the true mass. The formula gives 0.73 Jupiters. The two radii predict a dip of 1.38 per cent, close to the 1.50 measured. The difference comes partly from the star's disc being darker at the edges than in the middle, which this simple formula leaves out.

**Weighing and measuring together.** With a mass and a radius, the density follows:

$$
\rho = \frac{m}{\tfrac{4}{3}\pi R_p^3}
$$

For HD 209458 b it is about 360 kg/m³, about a third of the density of water and about a quarter of Jupiter's. It is a gas giant swollen by its star's heat, and nothing rocky. This sum, mass from the wobble and size from the dip, is how most planets beyond the Solar System with a known density have been sorted into rocky, watery and gassy.

**Try it yourself.** The archive gives Proxima Centauri b, round the nearest star to the Sun, a period of 11.185 days and ${K = 1.226}$ m/s, and the star a mass of 0.122 Suns. What is the least its mass can be, in Earth masses? (The Earth is 0.00315 Jupiters.)

The answer: about 1.06 Earth masses. Proxima b has never been seen to cross its star, so only this lower limit is known.

**What this level leaves out.** Real orbits are often ovals, which changes the shape of the wobble and adds a factor to the formula. Stars have spots and churning surfaces that shift their lines by a metre a second or more, which is the main obstacle to finding Earths by their wobble. And the shape of a real dip, its depth, length and soft edges, holds more information than its depth alone, including how far the planet passes from the centre of the star.
