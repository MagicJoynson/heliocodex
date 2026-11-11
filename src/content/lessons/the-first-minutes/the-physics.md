---
sources:
  - { label: "Particle Data Group, review of Big Bang nucleosynthesis (2024)", url: "https://pdg.lbl.gov/2024/reviews/rpp2024-rev-bbang-nucleosynthesis.pdf" }
  - { label: "NIST, electron volt and kelvin", url: "https://physics.nist.gov/cgi-bin/cuu/Value?evk" }
  - { label: "NIST, Wien displacement constant", url: "https://physics.nist.gov/cgi-bin/cuu/Value?bwien" }
  - { label: "ESA, Planck and the cosmic microwave background", url: "https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background" }
lastChecked: 2026-11-10
---
**Temperature as energy.** Particle physicists give the temperature of the early universe as an energy, the typical energy of one particle. One electron volt corresponds to 11,605 K, so a temperature of 1 MeV, a million electron volts, is 11.6 billion kelvin. The universe was at about 1 MeV when it was about one second old.

**Neutrons and protons in balance.** A neutron is slightly heavier than a proton. The difference, written as an energy, is

$$
Q = 1.293\ \text{MeV}
$$

In the first second, while the temperature was above about 1 MeV, neutrons and protons were turned into each other all the time by the weak force, and the two kinds were kept in balance. Because the neutron is the heavier of the two, it is the rarer, by a factor that depends on the temperature $T$:

$$
\frac{n}{p} = e^{-Q/T}
$$

At very high temperature the ratio is close to 1. As $T$ falls towards $Q$, neutrons become scarce.

**Freeze-out.** The reactions that keep the balance slow down steeply as the universe cools, much faster than the expansion does. At about 1 MeV they can no longer keep up, and the ratio is left where it was, at about

$$
\frac{n}{p} \simeq \frac{1}{6}
$$

This is called freeze-out. From then on the only thing that changes the ratio is that free neutrons decay, with a mean life of 879.4 seconds.

**The deuterium bottleneck.** The first step in building helium is a proton and a neutron joining to make deuterium, which is held together by 2.23 MeV. You might expect that to begin as soon as the temperature fell below 2.23 MeV. It does not, because there are well over a billion particles of light for every proton or neutron. Even when the typical one is too feeble to break deuterium apart, enough of the rare energetic ones remain to do it. Deuterium only survives once the temperature is down to about 0.1 MeV, a little over a billion kelvin. By then enough neutrons have decayed that

$$
\frac{n}{p} \simeq \frac{1}{7}
$$

**Counting the helium.** Once deuterium survives, the rest goes quickly, and nearly every neutron ends up in helium-4. Each helium nucleus takes two neutrons and two protons, so the fraction of all the mass that ends up as helium is

$$
Y_p = \frac{2\,(n/p)}{1 + n/p}
$$

With $n/p = 1/7$ this is $\tfrac{2}{7} \div \tfrac{8}{7} = 0.25$. The measured value is $Y_p = 0.245 \pm 0.003$.

The answer hardly depends on how fast the nuclear reactions go. It depends on the mass difference $Q$, the neutron's lifetime and the rate of expansion, which is why the helium fraction is such a clean test.

**Why it stopped at helium.** There is no stable nucleus with five particles and none with eight. Adding a proton or a neutron to helium-4, or joining two helium-4 nuclei, makes nothing that lasts. By the time this mattered, ordinary matter was no denser than air, and the building stopped. Stars do get past the gap, much later, by fusing helium into carbon in their dense cores.

**The traces.** The small amounts left over do depend on the reaction rates, and on how much ordinary matter there was. Deuterium is the most useful. The measured amount is

$$
\mathrm{D/H} = (25.47 \pm 0.29) \times 10^{-6}
$$

by number. Matching it fixes the number of protons and neutrons for every particle of light at about $6 \times 10^{-10}$. The oldest light gives the same number by a completely separate route. Lithium does not fit: the prediction for $^7\mathrm{Li/H}$ is 3.1 times the $(1.6 \pm 0.3) \times 10^{-10}$ found in old stars.

**The colour of the oldest light.** A blackbody at temperature $T$ is brightest at a wavelength

$$
\lambda_{\text{peak}} = \frac{b}{T}, \qquad b = 2.898\ \text{mm K}
$$

At 2.725 K this gives 1.06 mm, in the microwaves. At 3,000 K it gives 0.97 micrometres, just beyond the red end of what the eye can see. The two temperatures differ by a factor of about 1,100, and so do the wavelengths: the light has been stretched by exactly as much as it has cooled. These last figures are worked out here from the two temperatures.
