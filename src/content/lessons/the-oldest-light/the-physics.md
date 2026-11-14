---
sources:
  - { label: "Fixsen and others, The cosmic microwave background spectrum from the full COBE/FIRAS data set (Astrophysical Journal, 1996)", url: "https://arxiv.org/abs/astro-ph/9605054" }
  - { label: "NASA LAMBDA, COBE/FIRAS monopole spectrum (Table 4 of Fixsen and others, 1996), downloaded 13 November 2026", url: "https://lambda.gsfc.nasa.gov/data/cobe/firas/monopole_spec/firas_monopole_spec_v1.txt" }
  - { label: "Fixsen, The temperature of the cosmic microwave background (Astrophysical Journal, 2009)", url: "https://arxiv.org/abs/0911.1955" }
  - { label: "Planck Collaboration, Planck 2018 results VI: cosmological parameters (Astronomy and Astrophysics, 2020), Table 2", url: "https://arxiv.org/abs/1807.06209" }
  - { label: "Noterdaeme and others, The evolution of the cosmic microwave background temperature (Astronomy and Astrophysics, 2011)", url: "https://arxiv.org/abs/1012.3164" }
  - { label: "Hu, Lecture notes on CMB theory: from nucleosynthesis to recombination (2008): the Saha equation, and Peebles's calculation of how recombination lags", url: "https://arxiv.org/abs/0802.3688" }
  - { label: "NIST, fundamental physical constants", url: "https://physics.nist.gov/cuu/Constants/" }
lastChecked: 2026-11-13
---
This level takes the most precise measurement of the oldest light, made by the COBE spacecraft, and tests it against Planck's formula for a glowing body. It then counts the particles of light in every cubic centimetre, works out why the fog of the young universe lasted until it had cooled to a few thousand degrees, and checks that the glow cools exactly as space stretches. The sums are done here unless a source is named.

**The shape of a glow.** The physics level on colour and brightness gave Planck's formula per metre of wavelength. Radio astronomers count per unit of frequency $\nu$ instead, and give the brightness of each patch of sky:

$$
I_\nu = \frac{2 h \nu^3}{c^2} \, \frac{1}{e^{h\nu / kT} - 1}
$$

There is only one thing to choose, the temperature $T$. Once it is fixed, the height and the shape of the whole curve are fixed too.

**Real data: COBE's measurement.** The FIRAS instrument on COBE compared the sky with a perfect glowing body built into the spacecraft, at 43 frequencies from 68 to 639 GHz, wavelengths from 4.4 mm down to 0.47 mm. The published spectrum gives, for each frequency, how far the sky differs from a glowing body at 2.725 K, and how uncertain that difference is.

- The brightest point, at 163 GHz, is 383 million jansky per steradian. The differences from the curve are a few tens of thousands. The largest is two and a half times its own uncertainty, about what chance alone gives somewhere among 43 points.
- Divide each difference by its own uncertainty, square it, and add up all 43. The total is 45. If the sky were exactly the curve and the only differences were the measuring errors, the total would be about 43.
- Fixsen and colleagues put the remaining differences at less than 50 parts in a million of the peak.

The temperature itself is harder to pin down than the shape, because it depends on how well the built-in glowing body's thermometers were set. FIRAS gave 2.728 ± 0.004 K in 1996. Combining it with other measurements, Fixsen gave 2.72548 ± 0.00057 K in 2009.

<figure class="photo">
  <img src="/img/learn/charts/the-oldest-light-on-the-curve.svg" alt="Two panels. The top panel shows the brightness of the oldest light against frequency, from 68 to about 600 gigahertz. Gold dots, COBE's measurements, sit exactly on a dashed blue curve, the formula for a glowing body at 2.725 K, which rises to a peak near 160 and falls away. The lower panel shows the difference between each dot and the curve, drawn a thousand times taller, scattered about a flat line at zero with error bars that cross it." width="800" height="900" loading="lazy" />
  <figcaption><b>The oldest light on Planck's curve.</b> Top: COBE's measurements and the formula for a glowing body at 2.725 K. Bottom: measured minus formula, at a thousand times the scale, with each point's uncertainty. The three highest frequencies, whose uncertainties run off the panel, are left out. Data: Fixsen and others, 1996.</figcaption>
</figure>

**Where the peak is.** Counted per unit of frequency, the same steps as before give the peak at $h\nu = 2.821\,kT$. At 2.72548 K that is 160.2 GHz, which lies between COBE's points at 149.6 and 163.4 GHz, as the data show. Counted per metre of wavelength, the peak is at $hc/\lambda = 4.965\,kT$, a wavelength of 1.063 mm.

**Counting the particles of light.** Each particle of light at frequency $\nu$ carries energy $h\nu$. Divide the energy in each range of frequency by $h\nu$ and add up, and the number in each cubic metre comes out as

$$
n = 8 \pi \left(\frac{kT}{hc}\right)^3 \int_0^\infty \frac{x^2}{e^x - 1} \, dx
$$

The integral is a pure number, 2.404. At 2.72548 K this gives 411 particles of light in every cubic centimetre.

Planck's measurement of ordinary matter, $\Omega_b h^2 = 0.0224$, from the level on the expanding universe, is a quarter of a proton in each cubic metre, a quarter of a millionth in each cubic centimetre. So for every particle of ordinary matter there are 1.6 billion particles of light. Both numbers have fallen together as space has stretched, so the ratio has stayed the same since the first minutes.

**Why the fog cleared so late.** Pulling the electron off a hydrogen atom takes 13.6 electronvolts. That much energy is $kT$ at a temperature of 158,000 K. Yet the universe stayed foggy, full of loose electrons, until it was more than fifty times cooler.

The reason is the 1.6 billion. Even when the typical particle of light is far too weak to split an atom, the rare ones in the high-energy tail of Planck's curve are not. Roughly, a fraction $e^{-13.6\ \text{eV}/kT}$ of them can split an atom, and while that fraction times 1.6 billion is more than one, there is a splitter for every atom. That stays true until $13.6\ \text{eV}/kT$ reaches $\ln(1.6 \times 10^9)$, which is 21, at about 7,400 K.

The careful version of this count is the Saha equation, which also allows for the room the loose electrons have to move. For the fraction $X$ of hydrogen still split,

$$
\begin{aligned}
\frac{X^2}{1 - X} &= \frac{1}{n_\text{H}} \left(\frac{m_e k T}{2 \pi \hbar^2}\right)^{3/2} \\
&\quad \times e^{-13.6\ \text{eV} / kT}
\end{aligned}
$$

where $n_\text{H}$ is the number of hydrogen nuclei in each cubic metre, since about three quarters of ordinary matter, by mass, is hydrogen. Solved here, it gives half the hydrogen joined into atoms at about 3,700 K, a redshift of about 1,370. Wayne Hu's lecture notes on the oldest light, from the same equation, say the gas becomes mostly neutral at about 0.3 electronvolts, some 3,500 K. Both are for the gas in balance with the light, and both are the start of the clearing, not the moment the light went free.

The real joining lagged behind the balance. Each atom that forms gives out light that can split a neighbour, and in 1968 Jim Peebles worked out how slowly that light escapes, so the gas finished joining later and cooler than the Saha equation says. Planck's fit puts the moment the light last bounced off the electrons at a redshift of 1,089.92 ± 0.25. The temperature then was 1,090.92 times today's, about 2,970 K. That, not 3,700 K, is when the oldest light set out.

**The glow cools as space stretches.** As space grows by a factor $1 + z$, every wavelength grows by the same factor, and the number of particles in each cubic metre falls by $(1 + z)^3$. Put both into Planck's formula and it keeps exactly the same shape, with the temperature divided by $1 + z$. A glowing body stays a glowing body, only cooler:

$$
T(z) = T_0 \, (1 + z)
$$

**Real data: thermometers in far-off clouds.** The oldest light warms the gas clouds it passes through, and the molecules in them can be read like thermometers. Noterdaeme and colleagues measured carbon monoxide in clouds seen against far quasars, out to a redshift of about 3. Writing the rule as $T_0 (1 + z)^{1 - \beta}$, they found $\beta = -0.007 \pm 0.027$. Zero is what pure stretching predicts, and zero is well inside the uncertainty.

**Try it yourself.** Today the glow peaks at a wavelength of 1.063 mm. Where did it peak when the light was set free, at a redshift of 1,089.92?

The answer: 1.063 mm divided by 1,090.92, which is 974 nm, just beyond red light, in the near infrared. To an eye, the sky then would have glowed orange, like a cool star.

**What this level leaves out.** Helium, a quarter of the matter by mass, joins its electrons earlier, in two steps. The tiny warmer and cooler patches, a few parts in 100,000, and the Doppler shift from the Sun's motion are separated out before the spectrum here is measured. COBE also set tight limits on the small changes of shape that energy added later would have caused, and found none.
