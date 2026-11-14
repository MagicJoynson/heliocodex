---
sources:
  - { label: "Gaia Data Release 3 (ESA/Gaia/DPAC): radial velocities of Kapteyn's Star and Barnard's Star, from the Gaia archive. Gaia data are under CC BY-NC 3.0 IGO; individual values quoted here with credit", url: "https://www.cosmos.esa.int/web/gaia/dr3" }
  - { label: "Cherepashchuk, Dodin and Postnov, Unique microquasar SS433: new results, new issues (Physics-Uspekhi, 2025): the jet speed over 45 years and the shifted centre of the moving lines", url: "https://arxiv.org/abs/2506.01106" }
  - { label: "Margon, Observations of SS 433 (Annual Review of Astronomy and Astrophysics, 1984)", url: "https://doi.org/10.1146/annurev.aa.22.090184.002451" }
  - { label: "Planck Collaboration, Planck 2018 results VI: cosmological parameters (Astronomy and Astrophysics, 2020): the expansion rate and matter density used for the distances", url: "https://arxiv.org/abs/1807.06209" }
  - { label: "NIST Atomic Spectra Database (the wavelength of the calcium line)", url: "https://physics.nist.gov/PhysRefData/ASD/lines_form.html" }
lastChecked: 2026-11-14
---
This level derives the Doppler shift for light twice, first as a sound wave would have it and then with Einstein's correction for time, and finds where the two part company. It checks both against a slow star and a fast jet. Then it explains why the redshift of distant galaxies is a different thing, and what the "speed" quoted for them actually means. The sums are done here.

**Step one: the everyday rule.** A source moving straight away from us at speed $v$ sends out a wave crest, moves a distance $vT$ during one wave period $T$, and sends out the next. So the crests arrive spread out by that extra distance, and the wavelength grows from $\lambda$ to ${\lambda + vT}$. Since ${\lambda = cT}$ for light,

$$
\frac{\lambda_\text{seen}}{\lambda_\text{sent}} = 1 + \frac{v}{c}
$$

The redshift $z$ is the fraction by which the wavelength grows, so here ${z = v/c}$. For a source coming towards us, $v$ is negative and so is $z$: a blueshift.

**Step two: Einstein's correction.** The source's clock runs slow, seen from here, by the factor ${\gamma = 1/\sqrt{1 - v^2/c^2}}$. So the period between crests, by our clocks, is $\gamma T$, not $T$. Put that into step one and the stretch becomes

$$
1 + z = \gamma \left(1 + \frac{v}{c}\right) = \sqrt{\frac{1 + v/c}{1 - v/c}}
$$

The second form follows because ${1 - v^2/c^2 = (1 + v/c)(1 - v/c)}$. For slow sources $\gamma$ is almost exactly 1 and the two rules agree. They part as the speed grows:

| Speed, as a fraction of light | Everyday rule, $z$ | Einstein's rule, $z$ |
| --- | --- | --- |
| 0.1 | 0.1 | 0.1055 |
| 0.2591 | 0.2591 | 0.3036 |
| 0.5 | 0.5 | 0.7321 |

**Real data: two stars from Gaia.** Gaia measures how fast stars move towards or away from us from the shifts of three calcium lines near 850 nm, credited ESA/Gaia/DPAC. Two of its stars:

- *Kapteyn's Star* is moving away at 245.05 ± 0.13 km a second. That is a redshift of 0.000817, which moves the calcium line at 854.21 nm by 0.70 nm, a little under a thousandth of its wavelength.
- *Barnard's Star* is coming towards us at 110.47 ± 0.13 km a second, a blueshift of 0.000368.

At these speeds the two rules differ by 0.1 km a second for Kapteyn's Star, just under Gaia's uncertainty. Ordinary stars do not tell them apart.

**Real data: a jet that does.** SS 433 is a star in our galaxy feeding a black hole that fires two jets in opposite directions. Hot gas in the jets glows with hydrogen's red line, so each jet shows a copy of the line, one shifted red and the other blue, swinging back and forth as the jets turn round once every 162 days. Cherepashchuk and colleagues, fitting 45 years of spectra, find the jets move at 0.2591 ± 0.0007 of the speed of light.

Here is the test. The two jets move at the same speed in opposite directions. By the everyday rule, one jet's redshift is the other's blueshift, and their average is zero. By Einstein's rule, both are also stretched by the slow clock, the factor $\gamma$, and the average is

$$
\begin{aligned}
z_\text{average} &= \gamma - 1 \\
&= \frac{1}{\sqrt{1 - 0.2591^2}} - 1 \\
&= 0.0354
\end{aligned}
$$

That is a shift of about 10,600 km a second, or 23 nm at the red hydrogen line. What is seen, at whatever angle the jets point, is a centre of symmetry about 20 nm, or 11,000 km a second, to the red of where the line should be. It is the slowing of moving clocks, seen in a star.

<figure class="photo">
  <img src="/img/learn/charts/two-doppler-rules.svg" alt="A graph of redshift against speed, from zero to six tenths of the speed of light. Above the axis, a straight line for the everyday rule and a curve that bends upwards above it for Einstein's rule, both for sources moving away. Below the axis, a straight line and a curve that bends back towards the axis, for sources coming towards us. A dashed vertical line marks the speed of SS 433's jets." width="800" height="760" loading="lazy" />
  <figcaption><b>Two rules for one shift.</b> The straight lines are the everyday rule; the curves are Einstein's. They agree near zero speed, where every star in the sky lies. At the speed of SS 433's jets, the dashed line, they disagree by 0.045 for a jet moving away and 0.026 for one coming towards us. The average of the two, 0.035, is the extra redshift the jets show.</figcaption>
</figure>

**Step three: why the far galaxies are different.** The redshift of a distant galaxy is not a Doppler shift, and its "speed" is not a speed through space. Light set off from the galaxy when the universe was smaller, and the waves have been stretched in step with space itself on the way. If $a$ is the scale of the universe, the rule is

$$
1 + z = \frac{a_\text{now}}{a_\text{then}}
$$

A redshift of 1 means space has doubled in scale since the light left. Nothing about the galaxy's motion enters. That is why the redshift of 1,089 for the oldest light gives no speed at all; it gives the size of the universe then, compared with now.

**What the quoted speed is.** For galaxies, catalogues often list a "recession velocity". This is one of two things, and neither is a speed through space.

- *Often it is just $cz$*, the redshift times the speed of light. This is a convention, close to the truth for nearby galaxies, and meaningless far away: a galaxy at ${z = 14}$ is not moving at 14 times the speed of light.
- *In cosmology it is the rate at which the distance is growing.* Measure the distance $D$ to a galaxy now, along a line in space at one moment. It grows at ${v = H_0 D}$, where $H_0$ is the present rate of expansion.

Using Planck's values of the expansion rate and the amount of matter, this second speed reaches the speed of light for galaxies at a redshift of about 1.5, and beyond that it is faster. A galaxy at ${z = 14.18}$ is now 34 billion light years away and the distance is growing at 2.3 times the speed of light. That breaks no rule. Relativity forbids anything from overtaking light where it is, not distances from growing.

**Try it yourself.** A galaxy has ${z = 0.01}$. Treating the shift as a Doppler shift, how fast is it receding, and why is that close to the right answer here?

The answer: 3,000 km a second. At small redshifts the stretch of space over the light's journey is the expansion rate times the distance, and $cz$ and $H_0 D$ agree to within a few per cent; Planck's values give 0.00998 of the speed of light, against 0.01.

**What this level leaves out.** A source moving at an angle to the line of sight shows only part of its speed in the shift, and the slowing of its clock in full; the SS 433 sums use the average of the two jets precisely so the angle drops out. Gravity also reddens light, as the level on white dwarfs works out. Gaia's speeds have the Earth's own motion taken out, so each is the star's speed relative to the centre of the Solar System.
