---
sources:
  - { label: "NASA NSSDC Sun fact sheet: mass, radius, brightness, and the standard model's central pressure, density and temperature", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" }
  - { label: "Eker and others, Interrelated main-sequence mass-luminosity, mass-radius and mass-effective temperature relations (Monthly Notices of the Royal Astronomical Society, 2018): six-piece mass-brightness rule from 509 stars in eclipsing binaries", url: "https://doi.org/10.1093/mnras/sty1834" }
  - { label: "Sandquist and others, The K2 M67 study: precise mass for a turnoff star in the old open cluster M67 (2021)", url: "https://arxiv.org/abs/2011.08365" }
  - { label: "Reyes and others, Isochrone fitting to the open cluster M67 in the era of Gaia and improved model physics (2024)", url: "https://arxiv.org/abs/2407.03526" }
  - { label: "NIST, fundamental physical constants", url: "https://physics.nist.gov/cuu/Constants/" }
lastChecked: 2026-11-14
---
This level estimates the conditions at the centre of the Sun from nothing but its mass and size, and is open about how far the estimates miss and why. It then works out how long a star can shine, and how that depends on its mass, and checks the answer against a star in an old cluster that is running out of fuel now. The sums are done here.

**Step one: what holds a star up.** Every layer of a star is pressed down by the weight of the layers above it. It stays put only if the pressure below it is greater than the pressure above it by just enough to carry that weight. For a thin shell at distance $r$ from the centre, with density $\rho$ and with mass $m$ inside it,

$$
\frac{dP}{dr} = -\frac{G m \rho}{r^2}
$$

This is hydrostatic balance. The Earth's atmosphere obeys the same rule.

**Step two: the pressure at the centre, roughly.** Replace each quantity by its size for the whole star: $dP/dr$ by $P_c / R$, $m$ by $M$, $\rho$ by the mean density $M/R^3$ give or take a few, and $r$ by $R$. Then

$$
P_c \sim \frac{G M^2}{R^4}
$$

For the Sun, with ${M = 1.988 \times 10^{30}}$ kg and ${R = 695{,}700}$ km, this is ${1.1 \times 10^{15}}$ Pa, about ten thousand million times the air pressure at sea level. The standard model of the Sun gives ${2.5 \times 10^{16}}$ Pa. The estimate is 22 times too low.

**Why it misses.** The rough sum treats the Sun as if it had the same density all through. It does not. Its mean density is 1,410 kg/m³, a little more than water, but at the centre the standard model gives 162,000 kg/m³, 115 times as much. Matter packed towards the middle sits deeper in its own gravity and weighs more on the centre. The estimate gets the right ingredients and the wrong shape.

**Step three: the temperature, from the virial rule.** A star in balance has a fixed share-out of energy: the heat energy of its gas is half of the gravitational energy that holds it together. For a ball of uniform density the gravitational energy is $\tfrac{3}{5} G M^2 / R$. The gas is ${N = M / \mu m_H}$ particles, each carrying $\tfrac{3}{2} k T$, where ${\mu = 0.62}$ is the mean mass of a particle in the Sun's ionised gas in units of the hydrogen mass $m_H$. Setting ${3 N k \bar T = \tfrac{3}{5} G M^2 / R}$ gives

$$
\bar T = \frac{G M \mu m_H}{5 k R}
$$

which comes to 2.9 million K. The standard model's central temperature is 15.7 million K. The estimate is 5.5 times too low, and this time the reasons can be counted.

- *It is an average, not the centre.* The virial rule gives the temperature averaged over all the mass, and most of the Sun's mass is outside the core, where it is cooler.
- *The Sun is not uniform.* For the simplest model with the Sun's concentration of mass, Eddington's, the gravitational energy is $\tfrac{3}{2} G M^2/R$, two and a half times the uniform value. That alone raises the average to 7.2 million K.

The rest of the gap is the centre being hotter than the average. Even so, the rough rule says something true: the Sun's interior must be millions of degrees, hot enough for the nuclear fusion described in the level on how the Sun shines.

**Step four: how long a star lasts.** A star on the main sequence burns hydrogen in its core. Turning hydrogen into helium releases 0.7 per cent of its mass as energy, and in a star like the Sun only about a tenth of the hydrogen is in the core hot enough to burn before the star changes. So

$$
t \approx \frac{0.1 \times 0.007 \times M c^2}{L}
$$

For the Sun, with ${L = 3.828 \times 10^{26}}$ W, that is 10.4 billion years. The Sun is 4.6 billion years in.

**Step five: heavier stars burn out faster.** Brightness rises very steeply with mass. Eker and colleagues, in 2018, measured the masses and brightnesses of 509 stars in eclipsing pairs and fitted ${L \propto M^\alpha}$ in six mass ranges. The exponent $\alpha$ is not one number. For the five ranges above 0.45 Suns:

| Mass, in Suns | $\alpha$ | Lifetime goes as |
| --- | --- | --- |
| 0.45 to 0.72 | 4.57 | $M^{-3.57}$ |
| 0.72 to 1.05 | 5.74 | $M^{-4.74}$ |
| 1.05 to 2.4 | 4.33 | $M^{-3.33}$ |
| 2.4 to 7 | 3.97 | $M^{-2.97}$ |
| 7 to 31 | 2.87 | $M^{-1.87}$ |

So "brightness goes as mass to the 3.5" is a rough middle, and the honest statement is an exponent between about 2.9 and 5.7 over most of the main sequence. Since the fuel is proportional to $M$, the lifetime goes as the last column shows, because

$$
t \propto \frac{M}{L} \propto M^{1 - \alpha}
$$

that is, as the mass to a power between about $-1.9$ and $-4.7$. In Sun units, ${t \approx 10.4 \times M^{1-\alpha}}$ billion years. With Eker's fits a star of 2 Suns lasts about a billion years, one of 10 Suns about 11 million, and one of 30 Suns under 1.5 million.

<figure class="photo">
  <img src="/img/learn/charts/how-long-a-star-lasts-by-mass.svg" alt="A graph with logarithmic scales of how long a star lasts against its mass, from half the Sun's mass to thirty. A falling line with a shaded band round it runs from over a hundred billion years at the left to about a million years at the right. A dashed line marks the age of the universe. Points mark the Sun and the turnoff star in M67." width="800" height="700" loading="lazy" />
  <figcaption><b>Heavier stars do not last.</b> Lifetimes from the fuel sum in step four and Eker's mass-brightness fits. The band is the spread of real stars about those fits, and the small steps are where one fit hands over to the next. Stars below about 0.95 of the Sun's mass last longer than the universe has existed, so none of them has yet died of old age. Both scales are logarithmic.</figcaption>
</figure>

**Checking it against a cluster.** All the stars in a cluster were born together, so the heaviest ones still burning hydrogen are those whose lifetime equals the cluster's age. In the old cluster M67, Sandquist and colleagues weighed one of these turnoff stars, which has a partner that eclipses it, at $1.222 \pm 0.006$ Suns. Reyes and colleagues, fitting models to Gaia's measurements of the whole cluster, put its age at 3.95 billion years, give or take 0.16.

The sums here give the 1.222-Sun star a lifetime of 5.3 billion years with Eker's exponent of 4.33 for its mass range. Letting the exponent run over the range of its neighbours, 3.97 to 5.74, gives 4.0 to 5.7 billion years. The measured age is just below the short end. The main reason is step four's single tenth: stars brighten as they age, and a star of this mass has a small churning core that mixes in some extra fuel, and both change the sum by tens of per cent. The rough rule gets the age to within about a third; the full models get it to within 4 per cent.

**Try it yourself.** A cluster's turnoff is at 2 Suns. Using ${\alpha = 4.33}$ and the Sun's 10.4 billion years, about how old is the cluster?

The answer: ${10.4 \times 2^{1 - 4.33} = 10.4 \times 0.099}$, about a billion years.

**What this level leaves out.** The fuel sum ignores everything after the main sequence, which is quicker but not instant, and the light-weight stars below about 0.35 of the Sun's mass, which churn all the way through and can burn nearly all their hydrogen. The pressure in the heaviest stars comes partly from light itself, which is why their exponent falls.
