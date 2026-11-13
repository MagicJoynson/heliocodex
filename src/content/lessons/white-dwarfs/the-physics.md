---
sources:
  - { label: "Bond and others, The Sirius system and its astrophysical puzzles (Astrophysical Journal, 2017): orbit, parallax, masses, and Sirius B's temperature, radius and brightness", url: "https://arxiv.org/abs/1703.10625" }
  - { label: "Barstow and others, Hubble Space Telescope spectroscopy of the Balmer lines in Sirius B (Monthly Notices of the Royal Astronomical Society, 2005): the measured gravitational redshift", url: "https://arxiv.org/abs/astro-ph/0506600" }
  - { label: "Wikipedia, Chandrasekhar limit (the full formula and its number in front)", url: "https://en.wikipedia.org/wiki/Chandrasekhar_limit" }
  - { label: "NIST, fundamental physical constants", url: "https://physics.nist.gov/cuu/Constants/" }
  - { label: "The Nobel Prize in Physics 1983", url: "https://www.nobelprize.org/prizes/physics/1983/summary/" }
lastChecked: 2026-11-13
---
This level works with the measurements of one star, Sirius B, the nearest white dwarf to the Sun. From the orbit it shares with Sirius it gets the mass. From its colour and brightness it gets the size. Then it uses Einstein's gravity to predict a shift in its light, and checks the prediction against Hubble. It ends with the sum behind Chandrasekhar's limit. The measurements are from Bond and colleagues' 2017 study unless another source is named, and the sums are done here.

**Real data: the orbit.**

| | Value |
| --- | --- |
| Period $P$ | 50.128 years |
| Size of the orbit, as an angle $a''$ | 7.4957 seconds of arc |
| Size of Sirius A's own orbit | 2.4761 seconds of arc |
| Parallax $\varpi$ | 0.3789 seconds of arc |

**Step one: the size of the orbit.** A parallax of one second of arc means a distance of one parsec, and at that distance one second of arc spans one astronomical unit, the Earth's distance from the Sun. So an angle in seconds of arc, divided by the parallax, gives a length in astronomical units:

$$
a = \frac{a''}{\varpi} = \frac{7.4957}{0.3789} = 19.78 \ \text{au}
$$

That is about the distance of Uranus from the Sun.

**Step two: the total mass.** Kepler's third law, in Newton's form, with the period in years, the orbit in astronomical units and the mass in Suns, is

$$
M_A + M_B = \frac{a^3}{P^2} = 3.081 \ \text{Suns}
$$

**Step three: sharing it out.** Both stars go round their common centre of mass. The lighter one has the bigger orbit, in proportion: Sirius A's share of the total orbit, 2.4761 out of 7.4957, is Sirius B's share of the mass. That gives Sirius B 1.018 Suns and Sirius A 2.063, exactly as Bond and colleagues found.

**Step four: the size, from colour and brightness.** Hubble spectra give Sirius B a surface temperature of 25,369 K, and its brightness, all colours counted, is 0.02448 of the Sun's. The Stefan-Boltzmann law says a star's power is its surface area times $\sigma T^4$, so in Sun units

$$
\frac{R}{R_\odot} = \sqrt{\frac{L}{L_\odot}} \left(\frac{T_\odot}{T}\right)^2
$$

With the Sun at 5,772 K this gives 0.0081 of the Sun's radius, 5,630 km. Sirius B holds the mass of the Sun in a ball smaller than the Earth. Its mean density is $2.7 \times 10^9$ kg/m³, which is 2.7 tonnes in each cubic centimetre, and gravity at its surface is about 430,000 times the Earth's.

**Step five: a prediction.** Light climbing out of a deep gravity well loses energy and is stretched to longer wavelengths. General relativity says the stretch, written as the speed of a Doppler shift that would give the same effect, is

$$
v = \frac{G M}{R c}
$$

for a star whose escape speed is much less than the speed of light. Sirius B's is about 2 per cent of it, so this is a good approximation. Put in 1.018 Suns and 0.008098 of the Sun's radius and $v$ comes out at 80.0 km a second. On the Sun's surface the same formula gives only 0.64 km a second.

**Checking it.** In 2005 Barstow and colleagues used Hubble to measure the shift in Sirius B's hydrogen lines, after taking out the motion of the pair through space. They found 80.4 km a second, give or take 4.8. The mass came from an orbit traced since the 1800s, the size from a temperature and a brightness, and the prediction from Einstein's theory, and the three agree. It is one of the cleanest tests of general relativity outside the Solar System.

**Step six: why there is a limit.** What holds a white dwarf up is the pressure of its electrons, which cannot be squeezed into the same state as one another. Packed $n$ to a cubic metre, each electron is confined to a space about $n^{-1/3}$ across, and quantum physics then gives it momentum of at least about $\hbar n^{1/3}$, where $\hbar$ is Planck's constant divided by $2\pi$.

In a heavy white dwarf these electrons move at nearly the speed of light, so each one's energy is about $\hbar c\, n^{1/3}$. In a star of $N$ electrons and radius $R$, $n^{1/3}$ goes as $N^{1/3}/R$, so

$$
E_{\text{electron}} \sim \frac{\hbar c\, N^{1/3}}{R}
$$

Each electron comes with about two nucleons of mass $m_H$, so the star's mass is $M \approx 2 N m_H$. The gravitational energy per electron is about

$$
E_{\text{gravity}} \sim \frac{G M \,(2 m_H)}{R}
$$

Both energies fall as $1/R$. Shrinking the star does not change which one wins, so there is no smaller size at which it can find a new balance. Which one wins depends only on the mass. Set the two equal and solve for $M$:

$$
M \sim \left(\frac{\hbar c}{G}\right)^{3/2} \frac{1}{(2 m_H)^2}
$$

With NIST's constants that is 0.46 Suns. This is an order-of-magnitude argument, not a result: the $\sim$ signs mean every number in front has been dropped, so 0.46 says only that the limit is about the mass of the Sun, and that above it gravity beats the electrons whatever the size. Chandrasekhar's full calculation puts the numbers back. It works out the pressure and density at every depth, with the electrons' energy treated exactly and the star's mass concentrated towards its centre, and the number in front comes out as 3.10, giving 1.43 Suns. It earned him a share of the Nobel prize in 1983. Sirius B, at 1.018, is safely below. The remarkable thing is what goes into the limit: Planck's constant, the speed of light, the constant of gravity and the mass of a proton, and nothing about any particular star.

**Try it yourself.** Use the escape speed formula, $\sqrt{2GM/R}$, to show that Sirius B's escape speed is about 2.3 per cent of the speed of light.

**What this level leaves out.** The rough limit ignores that the electrons in a lighter white dwarf are not moving near the speed of light, which is why lighter white dwarfs are bigger. A real white dwarf also has a thin layer of hydrogen or helium on top, which changes the radius a little. Bond and colleagues find that Sirius B's mass and radius together fit the full theory of white dwarfs for a core of carbon and oxygen, which these rough sums cannot test.
