---
sources:
  - { label: "LIGO Scientific Collaboration and Virgo Collaboration, Observation of gravitational waves from a binary black hole merger (Physical Review Letters, 2016)", url: "https://arxiv.org/abs/1602.03837" }
  - { label: "LIGO Scientific Collaboration and Virgo Collaboration, The basic physics of the binary black hole merger GW150914 (Annalen der Physik, 2017)", url: "https://arxiv.org/abs/1608.01940" }
  - { label: "Weisberg and Huang, Relativistic measurements from timing the binary pulsar PSR B1913+16 (Astrophysical Journal, 2016)", url: "https://arxiv.org/abs/1606.02744" }
  - { label: "NIST, fundamental physical constants", url: "https://physics.nist.gov/cuu/Constants/" }
  - { label: "NASA JPL, astrodynamic parameters (the Sun's gravity)", url: "https://ssd.jpl.nasa.gov/astro_par.html" }
lastChecked: 2026-11-13
---
This level reads the first gravitational wave ever caught, on 14 September 2015, the way the LIGO team did in a paper written to be followed with school physics and Einstein's formula for the power of the waves. From two numbers that can be read off the signal, how fast it vibrated and how fast that was rising, it gets the masses, shows the two bodies must have been black holes, and checks the result against the full analysis. The sums are done here unless a source is named.

**The note is twice the orbit.** Two bodies in a circular orbit make the same shape every half turn, so the waves vibrate twice for each orbit. If the waves have frequency $f$, the orbit turns at angular speed

$$
\omega = \pi f
$$

**Energy in the orbit.** For masses $m_1$ and $m_2$, with total $M$ and separation $r$, Kepler's third law in Newton's form gives $r^3 = GM/\omega^2$. The energy of the orbit, motion and height together, is

$$
E = -\frac{G m_1 m_2}{2 r}
$$

It is negative because the pair is bound, and it becomes more negative as they draw closer.

**Energy carried away.** Einstein worked out in 1918 how much power a changing mass gives out as waves. For two bodies in a circle it is

$$
P = \frac{32}{5} \frac{G}{c^5} \left(\frac{m_1 m_2}{M}\right)^2 r^4 \omega^6
$$

The $c^5$ underneath is why the waves are so faint: in ordinary units it is a number with 42 noughts.

**The runaway.** The power lost comes out of the orbit's energy, so $dE/dt = -P$. Write both $E$ and $P$ in terms of $\omega$, using Kepler's law to remove $r$, and differentiate. The masses come out in one combination, the chirp mass

$$
\mathcal{M} = \frac{(m_1 m_2)^{3/5}}{M^{1/5}}
$$

and, after putting $\omega = \pi f$ back, the rate at which the frequency rises is

$$
\dot f = \frac{96}{5} \pi^{8/3} \left(\frac{G \mathcal{M}}{c^3}\right)^{5/3} f^{11/3}
$$

The power of $11/3$ is the runaway: the higher the note, the faster it climbs. Turn the formula round and the chirp mass comes straight from the signal, from $f$ and $\dot f$ alone, with no need to know the distance.

**Real data: the chirp.** In the LIGO team's words, over 0.2 seconds the signal rose in frequency and strength in about 8 cycles from 35 to 150 vibrations a second. Readings of $f$ and $\dot f$ taken along that stretch all give a chirp mass close to 30 Suns, and the team take 30 as a lower estimate.

Check it the other way. Integrate the formula from 35 to 150 a second with a chirp mass of 30 Suns. It gives 0.17 seconds and 8.7 cycles of the wave. The rule got from Newton's orbits and Einstein's power formula reproduces the shape of the recorded note.

<figure class="photo">
  <img src="/img/learn/charts/the-chirp-rising.svg" alt="A curve of frequency against the time left before the merger. It is low and nearly flat at the left, then sweeps up ever more steeply towards the right, ending at 150. A shaded band picks out the last fifth of a second, where the frequency climbs from 35 to 150." width="800" height="640" loading="lazy" />
  <figcaption><b>The note rises.</b> Frequency of the waves against time left before the two merge, from the formula above with a chirp mass of 30 Suns. The shaded part, from 35 to 150 vibrations a second, is the stretch LIGO heard on 14 September 2015. The curve stops at 150, where the two merged and the formula no longer holds.</figcaption>
</figure>

**How close they came.** Suppose the two masses were equal. A chirp mass of 30 then means two bodies of 35 Suns each, 70 in all. The signal stopped rising at about 150 a second, an orbit of 75 turns a second. Kepler's law gives the separation at that moment:

$$
r = \left(\frac{G M}{\omega^2}\right)^{1/3} = 350 \ \text{km}
$$

Seventy Suns' worth of mass was in two bodies whose centres were 350 km apart, going round each other 75 times a second, each at about a quarter of the speed of light.

**Why they must be black holes.** Ordinary stars are millions of km across. White dwarfs are thousands of km across. Neutron stars are small enough, but none is known above about two or three Suns. The only known objects of 35 Suns that fit are black holes. A black hole of 35 Suns has a horizon $2GM/c^2$ of 103 km in radius, so two of them side by side take 206 km. The separation of 350 km is only 1.7 times that, so the two were all but touching, which is why the signal stopped there: they merged.

**Checking against the full analysis.** The full analysis, matching the signal against computer solutions of Einstein's equations, found masses of 36 and 29 Suns. Their chirp mass is 28, which becomes about 30 as seen at the Earth once the stretching of the signal by the expanding universe is allowed for. The simple sum and the full one agree.

**How strong it should be.** The strength of the wave at a distance $d$ is roughly

$$
h \approx \frac{4}{d} \left(\frac{G \mathcal{M}}{c^2}\right)^{5/3} \left(\frac{\pi f}{c}\right)^{2/3}
$$

At the full analysis's distance of 410 megaparsecs and a frequency of 150 a second this gives $2.4 \times 10^{-21}$. The peak measured was $1.0 \times 10^{-21}$. The formula assumes the orbit is seen face on and the detector is ideally turned, and neither was true, so a measured value a little smaller is what is expected.

**The proof before the waves.** The pulsar PSR B1913+16, found by Russell Hulse and Joseph Taylor in 1974, is in an 8-hour orbit with another neutron star. The same power formula says the orbit should shrink at a set rate. After 35 years of timing, Joel Weisberg and Yuping Huang found the measured shrinking to be 0.9983 of the prediction, give or take 0.0016.

**Try it yourself.** The Sun and Jupiter also give out gravitational waves. Using the power formula, with Jupiter's mass $1.90 \times 10^{27}$ kg, the Sun's $1.99 \times 10^{30}$ kg, and a separation of $7.78 \times 10^{11}$ m, how much power do they send out?

The answer: about 5,200 watts, the power of a couple of electric kettles, from the largest planet in the Solar System.

**What this level leaves out.** The formulas here are the first step of an approximation that fails as the bodies near the speed of light. The last few cycles, the merger and the ringing of the new black hole as it settles need full solutions of Einstein's equations on a computer. Spin, unequal masses and the tilt of the orbit all change the signal, and the full analysis measures them.
