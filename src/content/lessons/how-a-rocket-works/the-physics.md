---
sources:
  - { label: "NASA Glenn Research Center, Ideal rocket equation", url: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/" }
  - { label: "NASA Glenn Research Center, Specific impulse", url: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/specific-impulse/" }
  - { label: "Wikipedia, Rocketdyne F-1 (thrust, flow and specific impulse)", url: "https://en.wikipedia.org/wiki/Rocketdyne_F-1" }
  - { label: "Wikipedia, Rocketdyne J-2 (specific impulse)", url: "https://en.wikipedia.org/wiki/Rocketdyne_J-2" }
  - { label: "Wikipedia, Tsiolkovsky rocket equation", url: "https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation" }
  - { label: "Wikipedia, Dawn (spacecraft): mass, xenon, ion engine and speed gained", url: "https://en.wikipedia.org/wiki/Dawn_(spacecraft)" }
  - { label: "NASA NSSDC Earth fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" }
  - { label: "NIST, the Newtonian constant of gravitation", url: "https://physics.nist.gov/cgi-bin/cuu/Value?bg" }
lastChecked: 2026-11-13
---
This level derives the rocket equation from the fact that momentum is never lost, and shows where the logarithm in it comes from. That logarithm is the reason most of a rocket is fuel, the reason rockets come in stages, and the reason a spacecraft with a feeble engine can outrun one with a mighty one. The sums are done here unless a source is named.

**Thrust.** Momentum is mass times velocity, and the total momentum of a rocket and its exhaust cannot change unless something outside pushes on them. If an engine throws out a mass $\dot m$ of gas every second at a speed $v_e$ relative to the rocket, it gives that gas $\dot m\, v_e$ of momentum every second. Force is the rate of change of momentum, so the rocket is pushed the other way with a thrust

$$
F = \dot m\, v_e
$$

Engines also gain a little from the pressure of the gas at the nozzle's mouth, which this level leaves out.

Here is a check with real numbers. Each F-1 engine on the Saturn V's first stage burned 1,789 kg of liquid oxygen and 788 kg of kerosene every second, 2,577 kg in all, and gave 6,770 kN of thrust at sea level. Divide one by the other and $v_e$ comes out at 2.63 km a second. The level before found about 2.5 km a second from the whole stage's numbers.

**Specific impulse.** Engineers quote an engine's exhaust speed in an odd unit, seconds. The specific impulse $I_{sp}$ is the exhaust speed divided by $g_0 = 9.80665$ m/s², the standard pull of gravity at the Earth's surface:

$$
v_e = I_{sp}\, g_0
$$

The F-1's specific impulse at sea level is 263 seconds, which gives 2.58 km a second. In the near-vacuum high up, where the exhaust spreads more freely, it rose to 304 seconds.

**The rocket equation.** Take a rocket of mass $m$ moving at speed $v$. In a short time it throws out a small mass $dm$ of exhaust backwards at $v_e$ relative to itself, and its own speed goes up by $dv$. With no outside force, momentum before and after must match. To first order in the small quantities that gives

$$
m\, dv = -v_e\, dm
$$

The minus sign is there because the rocket's mass goes down as its speed goes up. Divide by $m$:

$$
dv = -v_e \frac{dm}{m}
$$

Each small loss of mass adds speed in proportion to the share of the rocket it was, not to its size in kilograms. A kilogram of fuel burned near the end, when the rocket is light, adds far more speed than a kilogram burned at the start. Add up all the steps from the full mass $m_0$ to the empty mass $m_1$, which is to integrate:

$$
\Delta v = v_e \int_{m_1}^{m_0} \frac{dm}{m} = v_e \ln\frac{m_0}{m_1}
$$

This is the rocket equation, published by Konstantin Tsiolkovsky in 1903. $\ln$ is the natural logarithm, the power to which the number $e = 2.718$ must be raised to give $m_0/m_1$.

**What the logarithm costs.**

| Full ÷ empty | Speed gained, in exhaust speeds | Share that is fuel |
| --- | --- | --- |
| 2 | 0.69 | 50 per cent |
| 2.72 | 1 | 63 per cent |
| 10 | 2.30 | 90 per cent |
| 20 | 3.00 | 95 per cent |
| 100 | 4.61 | 99 per cent |

Turn the equation round and the mass ratio grows exponentially with the speed wanted:

$$
\frac{m_0}{m_1} = e^{\Delta v / v_e}
$$

Since $e^{2x} = (e^{x})^2$, doubling the speed squares the mass ratio. This is the rule the level before put into words: twice the speed needs not twice the ratio but the ratio multiplied by itself.

**How fast is orbit.** In a circular orbit gravity supplies exactly the pull needed to bend the path round, so $v^2/r = GM/r^2$ and

$$
v = \sqrt{\frac{G M}{r}}
$$

200 km above the Earth, $r$ is 6,571 km and $v$ is 7.79 km a second. NASA's worked example is for an orbit 200 miles up, about 322 km, where this formula gives 7.72 km a second, and it uses a round 17,000 miles an hour, about 7.6. Its engine burns hydrogen and oxygen at a specific impulse of 350 seconds, so $v_e$ is 3.43 km a second, so the mass ratio is $e^{7.6/3.43} = 9.2$. NASA rounds this to 10: nine tenths of the rocket is fuel and oxygen, and tanks, engines and cargo must all fit in the last tenth. The real figure is worse, because a rocket also spends fuel holding itself up against gravity and pushing through the air on the way.

**Why stages.** Here is an example with round numbers, not any real rocket. A rocket of 100 tonnes carries 90 tonnes of fuel and oxygen, 9 tonnes of tanks and engines and 1 tonne of cargo, with $v_e = 3.5$ km a second.

In one piece, it burns all 90 tonnes and ends at 10:

$$
\Delta v = 3.5 \ln \frac{100}{10} = 8.06 \text{ km/s}
$$

Now split the same fuel and the same weight of tanks into two stages, four fifths in the first and one fifth in the second. The first stage burns 72 tonnes, taking the rocket from 100 to 28 tonnes, and gains $3.5 \ln(100/28) = 4.46$ km/s. Then it drops its 7.2 tonnes of empty tanks. What is left weighs 20.8 tonnes and burns 18 more, ending at 2.8, and gains $3.5 \ln(20.8/2.8) = 7.02$ km/s.

The total is 11.47 km/s, with the same fuel, the same engines and the same cargo. Throwing away empty tanks part way means the second stage does not have to drag them along, and that is worth 3.4 km a second here.

**Try it yourself.** Dawn, the spacecraft that went round the asteroid Vesta and the dwarf planet Ceres, weighed 1,217.7 kg at launch and carried 425 kg of xenon for its ion engines. The ion engines threw out xenon at a specific impulse of 3,100 seconds, with a thrust of 90 thousandths of a newton, about the weight of two sheets of paper. How much speed could the xenon give it?

The answer: $v_e = 30.4$ km a second and the mass ratio is $1217.7 / 792.7$, so the ion engines could give it up to 13 km a second. NASA gives the speed Dawn actually gained from them as 11.5 km a second. A rocket with the J-2 engines of the Saturn V's upper stages, at 421 seconds, would need a mass ratio of 16 to do the same: 94 per cent fuel, against Dawn's 35 per cent. The price is time. A thrust that small speeds Dawn up by about 6 metres a second each day, so adding 1 km a second takes about five months (a sum). A chemical rocket does that in a minute or two, so ion engines are no use for leaving the ground, and very good for long journeys once in space.

**What this level leaves out.** The rocket equation gives the speed a rocket would gain with nothing in its way. A real launch loses some to gravity, while the engines hold the rocket up instead of speeding it along, and some to the air. Planners add those losses to the orbital speed when they size a rocket. Speeds also add differently close to the speed of light, but no rocket has come anywhere near that.
