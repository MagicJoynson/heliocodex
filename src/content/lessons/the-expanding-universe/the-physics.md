---
sources:
  - { label: "Planck Collaboration, Planck 2018 results VI: cosmological parameters (Astronomy and Astrophysics, 2020)", url: "https://arxiv.org/abs/1807.06209" }
  - { label: "Riess and others (SH0ES), A comprehensive measurement of the local value of the Hubble constant with 1 km/s/Mpc uncertainty (Astrophysical Journal Letters, 2022)", url: "https://arxiv.org/abs/2112.04510" }
  - { label: "Freedman and others (CCHP), Status report on the Chicago-Carnegie Hubble Program: measurement of the Hubble constant using the Hubble and James Webb space telescopes (Astrophysical Journal, 2025)", url: "https://arxiv.org/abs/2408.06153" }
  - { label: "H0 Distance Network, The Local Distance Network: a community consensus report on the measurement of the Hubble constant at 1% precision (Astronomy and Astrophysics, 2026)", url: "https://doi.org/10.1051/0004-6361/202557993" }
  - { label: "NIST, fundamental physical constants (G, the proton's mass)", url: "https://physics.nist.gov/cuu/Constants/" }
lastChecked: 2026-11-13
recheck: { what: "Whether the gap between the Hubble constant from the oldest light and from the distance ladder has closed or been explained", by: 2027-11-13 }
---
This level derives the equation that governs the expansion of the whole universe, using nothing more than Newton's gravity and a ball of galaxies. It then puts in the measurements of the Planck spacecraft, and ends with the question cosmology has not yet settled: how fast the universe is expanding now. The sums are done here unless a source is named.

**Hubble's law.** A galaxy at distance $d$ moves away at speed

$$
v = H_0 \, d
$$

$H_0$ is the Hubble constant, usually given in km a second for every megaparsec. If every distance grows in proportion, this is the only rule possible: double the distance and the stretch between us and the galaxy doubles too, so the speed doubles.

**The Hubble time.** If the galaxies had always moved at their present speeds, they would all have been together a time $d/v$ ago, which is the same for every galaxy:

$$
t_H = \frac{1}{H_0}
$$

For $H_0 = 67.4$ km/s per megaparsec this is 14.5 billion years. The real age is a little different, because the expansion has not run at a steady rate, but it shows why the Hubble constant and the age of the universe go together.

**A ball of galaxies.** Pick any galaxy and draw a sphere round us that just reaches it, of radius $R$. Newton showed that matter spread evenly outside a sphere pulls on nothing inside it, so only the mass inside counts:

$$
M = \tfrac{4}{3} \pi R^3 \rho
$$

where $\rho$ is the mean density. The galaxy on the surface is like a ball thrown upwards from a planet of that mass, and its energy per kilogram stays the same as the sphere grows:

$$
\frac{1}{2} \dot R^2 - \frac{G M}{R} = \text{constant}
$$

<figure class="photo">
  <img src="/img/learn/charts/a-ball-of-galaxies.svg" alt="A dashed circle filled with small galaxies, with us at the centre. One galaxy sits on the edge, a distance R from us, with an arrow pointing outwards labelled moving away, H times R. A note says only the mass inside the sphere pulls it back. The galaxies outside the circle are greyed out, with a note that matter outside has no overall pull." width="800" height="680" loading="lazy" />
  <figcaption><b>Only the inside counts.</b> A galaxy on the edge of any sphere round us is pulled back by the matter inside the sphere, and the matter outside has no overall effect. Whether the galaxy escapes or falls back is the same question as for a ball thrown from a planet. Not to scale.</figcaption>
</figure>

**The Friedmann equation.** Divide by $R^2/2$ and use $\dot R / R = H$, the Hubble rate at that time:

$$
H^2 = \frac{8 \pi G}{3} \rho - \frac{k}{R^2}
$$

where $k$ stands for twice the constant, with the sign changed. Einstein's theory gives the same equation, found by Alexander Friedmann in 1922, with $k$ now describing the shape of space. Newton's version cannot tell what $k$ means for space, but it gets the equation right.

**The critical density.** If the constant is exactly zero, the expansion is balanced between escaping and falling back, and space is flat. That needs a density of

$$
\rho_c = \frac{3 H^2}{8 \pi G}
$$

With $H_0 = 67.4$ this is $8.5 \times 10^{-27}$ kg/m³, the mass of about five protons in every cubic metre. It is a tiny density, far emptier than any vacuum made on Earth.

**Real data: what Planck found.** The pattern of warm and cool patches in the oldest light, measured by the Planck spacecraft, fits a flat universe and gives, among other things:

| Quantity | Planck 2018 value |
| --- | --- |
| Hubble constant | 67.4 ± 0.5 km/s per megaparsec |
| Matter, as a share of the critical density | 0.315 ± 0.007 |
| Ordinary matter, $\Omega_b h^2$ | 0.0224 ± 0.0001 |

Here $h$ is $H_0$ divided by 100, so ordinary matter, the stuff of stars and people, is 4.9 per cent of the critical density, a quarter of a proton in each cubic metre. All matter together is 31.5 per cent. In a flat universe the remaining 68.5 per cent must be something that is not matter at all, which is called dark energy.

**An open question: how fast now?** The figure from Planck is not measured directly. It is worked out from the oldest light, assuming the standard model of what the universe contains. The other route measures distances to nearby galaxies step by step, and speeds from their redshifts, and divides one by the other. The two routes disagree.

| Who | Method | $H_0$, km/s per megaparsec |
| --- | --- | --- |
| Planck, 2018 | Oldest light, standard model | 67.4 ± 0.5 |
| SH0ES, 2022 | Cepheid stars, then supernovae | 73.04 ± 1.04 |
| CCHP, 2025 | Red giant stars, then supernovae | 70.4 ± 2.0 |
| Distance Network, 2026 | Many ladders combined | 73.50 ± 0.81 |

The CCHP uncertainty here is its three stated parts added together in the usual way. The SH0ES team and the Distance Network, a combination agreed by many groups and published in 2026, find the ladder well above Planck, by five times the uncertainty or more, and argue that something is missing from the standard model. The CCHP team, using the Webb telescope, find a value between the two and consistent with the standard model, and argue that the gap comes from how the nearby stars are measured. As of November 2026 the question is open.

**Try it yourself.** In a flat universe holding only matter, the age works out at exactly two thirds of the Hubble time. Taking $H_0 = 67.4$, how old would that universe be?

The answer: two thirds of 14.5 billion years, about 9.7 billion years. That is far less than the 13.8 billion years Planck gives for the real universe, in which dark energy has made the expansion speed up for the last several billion years.

**What this level leaves out.** Light and other radiation add to the density too, and thin out faster than matter as space stretches, so they ruled the first 50,000 years or so. Dark energy, if it is a constant, does not thin out at all, and adds a term to the Friedmann equation that makes the expansion speed up. The full equation with all three is what Planck's values are fitted to.
