---
sources:
  - { label: "NASA NSSDC, Saturnian rings fact sheet (edges of the rings, surface densities)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html" }
  - { label: "NASA NSSDC, Saturn fact sheet (radius, density, GM and the flattening of its gravity, J2)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html" }
  - { label: "NASA JPL, mean orbital elements of Saturn's moons (distances, Mimas's period)", url: "https://ssd.jpl.nasa.gov/sats/elem/" }
  - { label: "NASA JPL, physical parameters of Saturn's moons (masses and densities)", url: "https://ssd.jpl.nasa.gov/sats/phys_par/" }
  - { label: "Iess and others, Measurement and implications of Saturn's gravity field and ring mass (Science, 2019), with the value as quoted by Wikipedia, Rings of Saturn", url: "https://doi.org/10.1126/science.aat2965" }
  - { label: "Buratti and others, Close Cassini flybys of Saturn's ring moons Pan, Daphnis, Atlas, Pandora, and Epimetheus (Science, 2019)", url: "https://doi.org/10.1126/science.aat2349" }
  - { label: "Spitale and Porco, Free unstable modes and massive bodies in Saturn's outer B ring (Astronomical Journal, 2010)", url: "https://arxiv.org/abs/0912.3489" }
  - { label: "Wikipedia, Roche limit (Roche's 1849 figure of 2.44 for a fluid body)", url: "https://en.wikipedia.org/wiki/Roche_limit" }
lastChecked: 2026-11-13
---
This level works out where a planet's rings must end and its moons can begin, and why the main gap in Saturn's rings is where it is. It checks both against the positions measured by spacecraft, and then weighs the rings, using the mass Cassini measured in its last months. The sums are done here unless a source is named.

**Every piece on its own orbit.** A piece of ice going round Saturn in a circle of radius $r$ moves at

$$
v = \sqrt{\frac{GM}{r}}
$$

and takes a time $2\pi r / v$ for each lap. With Saturn's $GM$ of $3.7931 \times 10^{16}$ m³/s²:

| Where | From Saturn's centre | Speed | One lap |
| --- | --- | --- | --- |
| Inner edge of the C ring | 74,658 km | 22.5 km/s | 5.8 hours |
| Outer edge of the B ring | 117,507 km | 18.0 km/s | 11.4 hours |
| Outer edge of the A ring | 136,780 km | 16.7 km/s | 14.3 hours |

The inner pieces overtake the outer ones all the time. A solid ring would have to turn as one, its outer edge faster than its inner, and the spectrum James Keeler took in 1895 showed the opposite.

**The Roche limit, worked out.** Take a small round moon of radius $s$ and density $\rho_m$, at distance $d$ from a planet of radius $R$ and density $\rho_P$. The planet pulls harder on the moon's near side than on its centre. For a moon much smaller than $d$, the difference is

$$
\Delta a = \frac{2 G M s}{d^3}
$$

because the pull goes as $1/d^2$, and its rate of change with distance is $-2GM/d^3$. Holding the surface on is the moon's own gravity, $Gm/s^2$. Put $M = \tfrac{4}{3}\pi R^3 \rho_P$ and $m = \tfrac{4}{3}\pi s^3 \rho_m$, and the two are equal when

$$
d = R \left(\frac{2 \rho_P}{\rho_m}\right)^{1/3} = 1.26 \, R \left(\frac{\rho_P}{\rho_m}\right)^{1/3}
$$

The moon's size has dropped out: only the two densities matter. A moon that keeps one face to the planet, as most close moons do, is also spinning once each lap, and the spin adds a further $GMs/d^3$ drawing the near side away from the moon's centre. The number in front becomes $3^{1/3}$, which is 1.44. And a loose pile with no strength at all does not stay round: it stretches into an egg, which makes it weaker still. Édouard Roche worked out that case in 1849 and found 2.44.

**Real data: where the rings end.** Saturn's density is 0.687 of water's, and ice is 0.92. The cube root of their ratio is 0.907, so

| Kind of moon | Roche limit for ice at Saturn |
| --- | --- |
| Solid, keeping one face to Saturn | 1.31 Saturn radii, 79,000 km |
| Loose pile | 2.21 Saturn radii, 133,400 km |

The main rings end at 136,780 km. The small moons Pan and Daphnis orbit in gaps in the outer A ring, at 133,600 and 136,500 km, and the other moons begin just beyond: Atlas at 137,700 km, Prometheus at 139,400 km, Pandora at 141,700 km. Inside the loose-pile limit there are rings. Outside it there are moons. The boundary falls within a few per cent of where the sum puts it.

The small moons right at the boundary are a test of a different kind. JPL gives Pan's density as 0.37 and Atlas's as 0.39, so light that they must be porous. For that density the loose-pile limit is about 3 Saturn radii, some 180,000 km, far outside their orbits, while the limit for a solid body is about 1.8 radii. They live between the two. They cannot be loose piles that flow freely, so they must have some strength, or denser cores. Cassini's close passes showed them with strange shapes, which Bonnie Buratti and colleagues explain by ring material that has piled onto them.

**Real data: the Cassini Division.** Mimas goes round Saturn every 0.942422 days. A ring piece going round in half that time passes Mimas at the same places on every second lap, so Mimas's small pulls add up instead of cancelling, and the pieces are thrown onto oval paths and cleared away. Kepler's third law, $r^3 = GM P^2 / 4\pi^2$, puts that orbit at 116,780 km. The outer edge of the B ring, where the Cassini Division begins, is at 117,507 km. The sum is 730 km short, 0.6 per cent.

The difference is Saturn's shape. It spins in under eleven hours and bulges at its equator, and the bulge pulls on close orbits a little more than a round planet would. The measure of this is called $J_2$, and for Saturn it is $16{,}298 \times 10^{-6}$. With it, the speed round the orbit, $n$, and the rate at which an oval orbit swings in and out, $\kappa$, are no longer equal:

$$
n^2 = \frac{GM}{r^3}\left(1 + \tfrac{3}{2} J_2 \tfrac{R^2}{r^2}\right), \qquad
\kappa^2 = \frac{GM}{r^3}\left(1 - \tfrac{3}{2} J_2 \tfrac{R^2}{r^2}\right)
$$

and the pull from Mimas builds up where $n - \kappa/2$ equals Mimas's own rate of turning. Solved here, that is at 117,530 km, 21 km beyond the measured edge. Joseph Spitale and Carolyn Porco, from Cassini's images, find that the resonance with Mimas holds the edge only in part, and that the edge also ripples in shapes of its own.

**Real data: weighing the rings.** In 2017 Cassini flew between Saturn and its rings, so that the rings pulled on it from outside while the planet pulled from inside, and the tracking separated the two. Luciano Iess and colleagues found the rings' mass to be $1.54 \pm 0.49 \times 10^{19}$ kg. Mimas, from JPL's figures, has a mass of $3.75 \times 10^{19}$ kg, so the rings are 0.41 of Mimas.

The A, B and C rings, from 74,658 to 136,780 km, cover an area of $\pi (r_2^2 - r_1^2)$, which is $4.13 \times 10^{16}$ m². Spread over that, the mass is 373 kg on each square metre: if it were packed into solid ice, a layer about 40 cm thick. NSSDC's table gives 14 to 50 kg/m² for the C ring and 200 to 1,000 kg/m² for the B ring, so the average lies between them, as it should, with most of the mass in the B ring.

<figure class="photo">
  <img src="/img/learn/charts/where-the-rings-end.svg" alt="A strip to scale outwards from Saturn's centre. Half of Saturn's disc is at the left. The C ring is a faint band, the B ring a bright band, then a dark gap, the Cassini Division, then the A ring. A dashed line just inside the outer edge of the A ring marks the Roche limit for a loose pile of ice. Small moons cluster just beyond it, and Mimas is further out. A curved arrow links Mimas to the outer edge of the B ring, labelled 2 laps to 1." width="800" height="620" loading="lazy" />
  <figcaption><b>Where the rings end.</b> Distances outwards from Saturn's centre, to scale. The rings stop, and the moons begin, close to the Roche limit for a loose pile of ice. The outer edge of the B ring is where a piece would go round twice for each orbit of Mimas. Data: NSSDC; NASA JPL.</figcaption>
</figure>

**Try it yourself.** A piece at the inner edge of the C ring takes 5.78 hours for each lap, and a piece at the outer edge of the A ring takes 14.34. How often does the inner one overtake the outer?

The answer: it gains $1/5.78 - 1/14.34$ of a lap every hour, so it overtakes once every 9.7 hours.

**What this level leaves out.** Ring pieces are not alone: they collide, clump and spread, and their own gravity raises waves and wakes that Cassini photographed. The rings are not perfectly flat or circular, and Saturn's other moons raise ripples at their own resonances. How old the rings are is still argued over, as the lesson's main page sets out.
