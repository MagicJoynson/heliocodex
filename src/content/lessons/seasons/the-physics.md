---
sources:
  - { label: "NASA/JPL Horizons: the Sun's position seen from London (sunrise, noon and sunset at both 2026 solstices), the Sun's daily declination, and the Earth's distance from the Sun through 2026", url: "https://ssd.jpl.nasa.gov/horizons/" }
  - { label: "Kopp and Lean, A new, lower value of total solar irradiance (Geophysical Research Letters, 2011): sunlight at the Earth's average distance", url: "https://doi.org/10.1029/2010GL045777" }
  - { label: "NASA NSSDC Earth fact sheet (the tilt of the axis)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" }
lastChecked: 2026-11-14
---
This level builds the seasons out of two pieces of geometry, how steeply sunlight strikes the ground and how long the Sun is up, and checks the second against JPL's sunrise and sunset times for London. Then it uses the Earth's distance from the Sun to show what distance does and does not do. The sums are done here; times are in UT, which is GMT.

**Real data.**

| | Value |
| --- | --- |
| Tilt of the Earth's axis $\varepsilon$ | 23.44° |
| Sunlight above the air, at the average distance $S_0$ | 1,361 W/m² |
| London's latitude $\phi$ | 51.51° north |
| Nearest the Sun, 2026 | 3 January, 147.10 million km |
| Furthest from the Sun, 2026 | 6 July, 152.09 million km |

The distances are from JPL's Horizons system. The sunlight figure is Kopp and Lean's, from satellites above the air.

**Step one: where the Sun is in the sky.** Because the axis is tilted, the Sun appears to move north and south of the celestial equator through the year. Its angle north of it is the declination $\delta$:

$$
\sin\delta = \sin\varepsilon \,\sin\lambda
$$

where $\lambda$ is the Sun's position along its yearly path, measured from the March equinox. At the June solstice ${\lambda = 90^\circ}$ and ${\delta = +23.44^\circ}$. At the December solstice it is $-23.44^\circ$.

**Step two: how high the Sun gets at noon.** At noon the Sun crosses the north–south line, and its height above the horizon is

$$
\text{altitude at noon} = 90^\circ - \phi + \delta
$$

For London that is 61.93° in June and 15.06° in December. JPL's figures for noon on 21 June and 21 December 2026 are 61.94° and 15.11°. The small extra in December is the air bending the light: at 15° above the horizon it lifts the Sun by about 0.06°.

**Step three: how much sunlight lands on each square metre.** A beam that arrives at a slant is spread over more ground. On flat ground, with the Sun at an angle $z$ from straight overhead, the power per square metre is

$$
I = S_0 \left(\frac{\bar d}{d}\right)^2 \cos z
$$

where $d$ is the distance from the Sun and $\bar d$ its average. At noon ${z = 90^\circ - \text{altitude}}$. Above the air over London, that gives 1,163 W/m² at noon in June and 365 W/m² in December, a ratio of 3.2.

**Step four: how long the Sun is up.** As the Earth turns, the Sun's hour angle $h$ increases by 15° an hour, starting from 0° at noon. Its altitude $a$ at any moment is given by

$$
\begin{aligned}
\sin a = {} & \sin\phi \sin\delta \\
& + \cos\phi \cos\delta \cos h
\end{aligned}
$$

Sunrise and sunset happen at the hour angle $h_0$ that makes the altitude zero:

$$
\cos h_0 = -\tan\phi \,\tan\delta
$$

The Sun is up from $-h_0$ to $+h_0$, so the day lasts $2h_0 / 15^\circ$ hours. For London in June, ${\cos h_0 = -0.545}$, ${h_0 = 123.0^\circ}$, and the day is 16 hours 24 minutes. In December it is 7 hours 36 minutes.

**Checking it against JPL.** Horizons gives these times for London, for an observer at sea level:

| 2026 | Sunrise to sunset | Day |
| --- | --- | --- |
| 21 June | 03:44 to 20:22 | 16&nbsp;h&nbsp;38&nbsp;min |
| 21 December | 08:04 to 15:54 | 7&nbsp;h&nbsp;50&nbsp;min |

The formula is short by 14 minutes in each. That gap is real, and there are two reasons for it.

- *The Sun is a disc, not a point.* Sunrise is counted from the moment the top edge appears, when the centre is still 0.27° below the horizon.
- *The air bends the light.* Near the horizon it lifts the Sun by about 0.57°, so the Sun is seen when it is really below the horizon.

Together they mean sunrise happens when the centre is about 0.83° below the horizon. Put that in place of zero:

$$
\cos h_0 = \frac{\sin(-0.83^\circ) - \sin\phi \sin\delta}{\cos\phi \cos\delta}
$$

This gives 16 hours 38 minutes in June and 7 hours 50 minutes in December, the same as JPL's to the minute.

Height matters too. Raise the observer 20 metres, to the top of a tall building, and the horizon drops by 0.14°, because the ground curves away below. Asked for that height, JPL gives 03:42 to 20:23 in June, 16 hours 41 minutes: three more minutes of sun. And the bending near the horizon changes with the temperature and pressure of the air, so real sunrises can differ from any table by a minute or two.

**Step five: the whole day's sunlight.** Adding up the sunlight from sunrise to sunset gives the average power over 24 hours:

$$
\bar I = \frac{S_0}{\pi} \left(\frac{\bar d}{d}\right)^2 F
$$

where

$$
\begin{aligned}
F = {} & h_0 \sin\phi \sin\delta \\
& + \cos\phi \cos\delta \sin h_0
\end{aligned}
$$

with $h_0$ in radians. Above the air, averaged over the day, this gives:

| Place | June solstice | December solstice |
| --- | --- | --- |
| Equator | 385 W/m² | 411 W/m² |
| London | 481 W/m² | 76 W/m² |
| North Pole | 524 W/m² | 0 |

London gets more than six times as much sunlight a day in June as in December. Both effects of the tilt work together: the Sun is higher, and it is up for longer. And on the June solstice the North Pole, with the Sun circling 23.4° above its horizon all day, gets more sunlight than the equator does.

<figure class="photo">
  <img src="/img/learn/charts/noon-sunlight-by-latitude.svg" alt="A graph of sunlight at noon, in watts per square metre, through the months of 2026. The equator's line stays high all year with two gentle peaks. London's line rises from about 400 in winter to over 1,100 in June. A line for 70 degrees north falls to zero in December and January. Sydney's line is high in December and low in June. A dashed vertical line in early January marks when the Earth is nearest the Sun." width="800" height="660" loading="lazy" />
  <figcaption><b>Noon sunlight, through 2026.</b> Above the air, on flat ground, from JPL's daily positions of the Sun. The Earth is nearest the Sun on 3 January, the dashed line, and that is when London and the far north get the least. Sydney, in the south, has its summer then.</figcaption>
</figure>

**Distance is not the cause.** The Earth's distance from the Sun does change, and step three includes it. Sunlight is ${(152.09 / 147.10)^2 = 1.069}$ times as strong in early January as in early July, a difference of 7 per cent. Two facts show that this is not what makes the seasons.

- *The timing is wrong.* The Earth is nearest the Sun on 3 January, in the middle of the northern winter. If distance were the cause, January would be summer everywhere.
- *The size is wrong.* A 7 per cent change cannot make the six-fold change in London's daily sunlight. Tilt does that.

Distance does leave a small mark. The South Pole's midsummer, in December, is 7 per cent brighter than the North Pole's, in June: the same sum gives 559 W/m² against 524.

**Try it yourself.** Show that at latitude 66.56° north, on the December solstice, ${\cos h_0 = 1}$, so the Sun does not rise.

The answer: $\tan 66.56^\circ \times \tan(-23.44^\circ) = -1.000$, so ${\cos h_0 = 1}$ and ${h_0 = 0}$. That is the Arctic Circle.

**What this level leaves out.** All of these figures are for sunlight above the air. Cloud, and the air itself, take away a share that depends on the weather and on how long the slanting path through the air is, which is longest in winter. The hottest weeks come a month or so after the solstice, because the sea is slow to warm. And the tilt and the date of nearest approach both change slowly over tens of thousands of years, as the main level explains.
