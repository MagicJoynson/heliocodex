---
sources:
  - { label: "Coddington and others, The TSIS-1 Hybrid Solar Reference Spectrum (Geophysical Research Letters, 2021); data from the LASP Interactive Solar Irradiance Datacenter, downloaded 13 November 2026", url: "https://lasp.colorado.edu/lisird/data/tsis1_hsrs_p1nm" }
  - { label: "NIST, fundamental physical constants (Planck's constant, Boltzmann's constant, the speed of light, the Stefan-Boltzmann constant, the Wien constant)", url: "https://physics.nist.gov/cuu/Constants/" }
  - { label: "IAU 2015 Resolution B3, nominal values for the Sun (radius, power, surface temperature)", url: "https://arxiv.org/abs/1510.07674" }
  - { label: "NASA NSSDC Earth fact sheet (sunlight at the Earth's distance)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" }
  - { label: "Bond and others, The Sirius system and its astrophysical puzzles (Astrophysical Journal, 2017): Sirius A's radius and power", url: "https://arxiv.org/abs/1703.10625" }
  - { label: "Wikipedia, Sirius (Sirius A's surface temperature)", url: "https://en.wikipedia.org/wiki/Sirius" }
lastChecked: 2026-11-13
---
The level before used two rules: the peak of a star's light moves with temperature, and each square metre of a hot surface gives out power that rises steeply with temperature. This level gets both rules, with their numbers, from one formula, and then tests the formula against the most accurate measurement of sunlight yet made. The sums are done here unless a source is named.

**Planck's formula.** In 1900 Max Planck found the formula for the light given out by a perfect glowing body, one that absorbs every colour falling on it. Per square metre of surface, per metre of wavelength $\lambda$, at temperature $T$, the power is

$$
F_\lambda = \frac{2 \pi h c^2}{\lambda^5} \, \frac{1}{e^{hc/\lambda k T} - 1}
$$

where $h$ is Planck's constant, $k$ is Boltzmann's constant and $c$ the speed of light. The first part grows fast towards short wavelengths: there is more room for short waves in any space. The second part cuts it off, because light comes in packets of energy $hc/\lambda$, and a body at temperature $T$ rarely has enough energy to spare for a packet much bigger than $kT$. The balance between the two gives the peak.

**A change of variable.** Everything is simpler written in terms of

$$
x = \frac{hc}{\lambda k T}
$$

which compares the energy of one packet of light with $kT$. Then $F_\lambda$ is proportional to $x^5/(e^x - 1)$, times a number that depends only on $T$.

**Where the peak is.** At the peak the slope is zero. Differentiate $x^5/(e^x - 1)$ and set the result to zero, and after tidying up

$$
x = 5 \left(1 - e^{-x}\right)
$$

This has no neat answer, but it can be solved by trying a number, putting it into the right side, and repeating. Start at 5 and it settles in a few steps at $x = 4.965$. Turned back into a wavelength,

$$
\lambda_{\text{peak}} = \frac{hc}{4.965\, k T} = \frac{2.898 \times 10^{-3} \ \text{m K}}{T}
$$

That is the "2.9 million divided by the temperature in nanometres" of the level before, and NIST's value of the constant is $2.897\,772 \times 10^{-3}$ m K. At 5,772 K the peak is at 502 nm.

**All colours together.** The total power from each square metre is the area under Planck's curve. Changing to $x$, the integral becomes

$$
F = \frac{2 \pi k^4 T^4}{h^3 c^2} \int_0^\infty \frac{x^3}{e^x - 1} \, dx
$$

The integral is a pure number, worked out in the 1800s: $\pi^4 / 15$, about 6.49. So

$$
F = \sigma T^4, \qquad \sigma = \frac{2 \pi^5 k^4}{15 c^2 h^3}
$$

The $T^4$ is the Stefan-Boltzmann law: double the temperature and the power goes up 16 times. Put in NIST's values of $k$, $c$ and $h$ and $\sigma$ comes out at $5.670\,374 \times 10^{-8}$ W m⁻² K⁻⁴, NIST's own value to every figure given. Josef Stefan found the $T^4$ by experiment in 1879. Planck's formula explains it, and gives the constant from three of the basic numbers of physics.

**The Sun's temperature from its sunlight.** Above the air, the Earth gets 1,361 watts on each square metre facing the Sun. That light left the Sun's surface, of radius 695,700 km, and has spread out over a sphere the size of the Earth's orbit. So each square metre of the Sun's surface gives out 1,361 times $(1 \ \text{au}/R_\odot)^2$, which is 46,000 times as much, $6.29 \times 10^7$ watts. Set that equal to $\sigma T^4$ and $T = 5{,}772$ K. That is the Sun's surface temperature, as the International Astronomical Union defines it.

<figure class="photo">
  <img src="/img/learn/charts/sunlight-measured-and-formula.svg" alt="A chart of sunlight, with wavelength along the bottom from 250 to 2,500 nanometres and power up the side. A solid gold line, measured, rises steeply to a jagged peak near 470 nanometres and falls away slowly towards the infrared. A dashed blue line, the 5,772 K formula, follows it closely, with a smooth peak near 500. A pale band marks the colours the eye sees, from 400 to 700." width="800" height="600" loading="lazy" />
  <figcaption><b>Measured sunlight and Planck's formula.</b> Gold: sunlight above the Earth's air, from the TSIS-1 reference spectrum, averaged over each 5 nm. Blue dashes: a perfect glowing body at 5,772 K the size of the Sun, at the Earth's distance, from Planck's formula. The pale band is the light the eye sees. Data: Coddington and others, 2021.</figcaption>
</figure>

**Real data: the measured spectrum.** The TSIS-1 reference spectrum, released in 2021, is built from measurements by the TSIS-1 instrument on the International Space Station, with fine detail added from other high-resolution records. It gives sunlight above the air, colour by colour. It runs from 202 to 2,730 nm, and the chart shows most of it.

- Added up over that range, the measured sunlight comes to 1,326 watts on a square metre. Planck's formula at 5,772 K, over the same range, gives 1,322. They agree to 0.3 per cent, with no adjustment.
- Of the total, 39 per cent falls between 400 and 700 nm, the light the eye sees. Most of the rest is infrared.
- Below about 400 nm the measured light falls short of the formula. Atoms in the Sun's outer layers absorb ultraviolet in thousands of dark lines, which is also why the measured peak is ragged.

**Where the peak really is.** Averaged over each 20 nm, the measured peak is at about 470 nm, in the blue, not at the formula's 502. The difference is the Sun's dark lines and its layers of different temperature: the Sun is close to a perfect glowing body, but not exactly one.

There is a deeper catch. The peak depends on how the curve is drawn. Count power per unit of frequency instead of per unit of wavelength, which is equally fair, and the same steps give

$$
x = 3 \left(1 - e^{-x}\right), \qquad x = 2.821
$$

At 5,772 K that is a peak at 883 nm, in the infrared. Redrawn this way, the measured sunlight has a broad flat top from about 800 to 1,050 nm. Neither peak is wrong. A curve that is spread over a wide range has no single natural top, which is another reason the Sun looks white, not green.

**Try it yourself.** Sirius A has a surface temperature of 9,845 K and a radius of 1.714 times the Sun's. Using $\sigma T^4$ times the area of its surface, how many times the Sun's power does it give out?

The answer: $1.714^2 \times (9{,}845/5{,}772)^4$, about 24.9. Bond and colleagues, adding up its measured light at every colour, give 24.7.

**What this level leaves out.** No star is a perfect glowing body. Light reaching us comes from layers at different depths and temperatures, and each element in the star takes its own bites out of the spectrum. The temperature given for a star is the one that would give out the same total power from the same surface, which is why it is called the effective temperature. And the 1,361 watts changes by about 0.1 per cent over the Sun's 11-year cycle of spots.
