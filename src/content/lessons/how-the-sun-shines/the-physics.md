---
sources:
  - { label: "NASA NSSDC Sun fact sheet (mass, radius, power, central temperature)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" }
  - { label: "NIST, fundamental physical constants (G, c, the electron charge, Boltzmann's constant, the proton's radius)", url: "https://physics.nist.gov/cuu/Constants/" }
  - { label: "NIST, atomic weights and isotopic compositions (masses of hydrogen-1 and helium-4)", url: "https://www.nist.gov/pml/atomic-weights-and-isotopic-compositions-relative-atomic-masses" }
  - { label: "Borexino Collaboration, Neutrinos from the primary proton-proton fusion process in the Sun (Nature, 2014)", url: "https://www.nature.com/articles/nature13702" }
lastChecked: 2026-11-13
---
This level works through four sums. Two show that nothing but fusion could have kept the Sun shining this long. One shows why fusion should be impossible at the Sun's temperature, and how it happens anyway. The last predicts how many neutrinos from the core should reach the Earth, and checks the answer against a detector. The Sun's numbers are from NASA, the constants from NIST, and the sums are done here unless a source is named.

| | Value |
| --- | --- |
| Mass $M$ | $1.989 \times 10^{30}$ kg |
| Radius $R$ | 695,700 km |
| Power $L$ | $3.828 \times 10^{26}$ W |
| Temperature at the centre | 15.7 million K |

**Sum one: could gravity do it?** A ball of gas that shrinks lets out energy, as a falling weight does. To pull the Sun together from scattered gas releases energy of roughly

$$
E \sim \frac{G M^2}{R}
$$

The exact number in front depends on how the mass is spread inside, and is close to 1 for a star like the Sun. That is $3.8 \times 10^{41}$ joules. Divide by the Sun's power to see how long it could last:

$$
t \sim \frac{G M^2}{R L} \approx 31 \text{ million years}
$$

In the middle of the 1800s this was the best explanation anyone had, worked out by Hermann von Helmholtz and Lord Kelvin. It gives a Sun tens of millions of years old. Geologists already suspected the Earth was far older, and the dating of rocks in the 1900s proved it. Gravity can heat a young star, but it cannot have kept the Sun shining for 4.6 billion years.

**Sum two: what fusion gives.** Four hydrogen atoms become one helium atom. NIST gives their masses in atomic mass units:

$$
4 \times 1.007825 - 4.002603 = 0.028697
$$

That is 0.71 per cent of the mass that went in. Using $E = mc^2$, one atomic mass unit is 931.5 MeV of energy, so each helium made releases 26.7 MeV. The Sun's power, divided by $c^2$, says it turns

$$
\frac{L}{c^2} = 4.26 \times 10^{9} \ \text{kg}
$$

of mass into energy every second, 4.3 million tonnes. That is 0.71 per cent of about 600 million tonnes of hydrogen fused every second, the figures in the level before.

**Sum three: why fusion should not happen.** Two protons both carry a positive charge and push each other apart. To touch, their centres must come within about twice the proton's radius, which NIST gives as 0.841 femtometres. A femtometre is a million-billionth of a metre. The energy needed to push them that close is

$$
E = \frac{e^2}{4 \pi \varepsilon_0 r} \approx 0.86 \ \text{MeV}
$$

The typical energy of a particle in a gas at temperature $T$ is about $kT$, where $k$ is Boltzmann's constant. At the Sun's centre that is 1.35 keV, more than 600 times too little. To give a typical proton 0.86 MeV the centre would need to be about 10,000 million K, more than 600 times hotter than it is.

The way round is quantum tunnelling. A proton is not a hard ball with a sharp position but is spread out like a wave, and a wave has a small chance of turning up on the far side of a barrier it does not have the energy to climb. At the Sun's centre the chance for any one pair at any one meeting is tiny, which is why the first step of fusion is so slow, and why the Sun lasts billions of years and does not explode. Without tunnelling there would be no sunlight at all.

**Sum four: how hot the centre must be.** Here is a rough check on the 15.7 million K. The gas at the centre must be hot enough for its pressure to hold up the weight of everything above. That means the energy of motion of each particle, about $kT$, must be roughly comparable to the energy gravity gives a proton falling in from the surface, $G M m_p / R$:

$$
T \sim \frac{G M m_p}{k R} \approx 23 \text{ million K}
$$

This is only an estimate, good to within a factor of about two. But it lands close to the 15.7 million K worked out from full models of the Sun's inside, and it shows why every star like the Sun has a centre of millions of degrees: gravity sets the temperature.

**Real data: counting neutrinos.** Every helium made in the Sun also makes two neutrinos. Neutrinos pass straight through the Sun, so the number reaching the Earth each second should follow from the sunlight. At the Earth's distance each square metre receives 1,361 watts. Divide by 26.7 MeV for each helium, and multiply by two:

$$
\Phi = \frac{2 \times 1361 \ \text{W/m}^2}{26.7 \ \text{MeV}} = 6.4 \times 10^{14} \ \text{per m}^2 \text{ per second}
$$

That is 64 thousand million through every square centimetre each second, including the tip of your finger, by day and by night. Nearly all of them come from the first, slow step. In 2014 the Borexino detector, deep under a mountain in Italy, measured those first-step neutrinos directly: $(6.6 \pm 0.7) \times 10^{10}$ per square centimetre per second. The sum from sunlight and the count in the detector agree. The light we see left the Sun's surface 8 minutes ago, after a very long journey out from the core. The neutrinos left the core itself 8 minutes ago. Both say the Sun is burning at the same rate.

**Try it yourself.** How much hydrogen, as a share of its mass, would the Sun need to fuse to shine at today's power for 10 billion years?

The answer: in 10 billion years it turns $4.26 \times 10^{9}$ kg a second, times $3.16 \times 10^{17}$ seconds, into energy, which is $1.3 \times 10^{27}$ kg. That is 0.71 per cent of $1.9 \times 10^{29}$ kg of hydrogen, about a tenth of the Sun's mass. As the level before says, only about the innermost tenth ever gets hot enough.

**What this level leaves out.** A small share of each helium's 26.7 MeV is carried off by the neutrinos and never heats the Sun, so the true count is a little higher than the simple sum. The Sun also makes helium by a second route, using carbon as a go-between, which matters more in heavier stars. And the full models of the Sun's inside, which give the 15.7 million K, solve the balance of pressure, gravity and energy flow at every depth, not just at the centre.
