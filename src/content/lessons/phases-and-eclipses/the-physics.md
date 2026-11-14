---
sources:
  - { label: "NASA/JPL Horizons: the Sun's and Moon's distances and sizes in the sky through 2026, and their positions seen from Talatí de Dalt, Menorca, on 12 August 2026", url: "https://ssd.jpl.nasa.gov/horizons/" }
  - { label: "NASA Goddard, Eclipses and the saros (the three months)", url: "https://eclipse.gsfc.nasa.gov/SEsaros/SEsaros.html" }
  - { label: "NASA NSSDC Moon fact sheet (the Moon's radius and its orbit against the stars)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html" }
  - { label: "NASA NSSDC Sun fact sheet (the Sun's radius)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" }
  - { label: "Astronomy magazine, picture of the day: Taula eclipse, by Josh Dury (totality at Talatí de Dalt, about 73 seconds)", url: "https://www.astronomy.com/picture-of-the-day/photo/taula-eclipse/" }
lastChecked: 2026-11-14
---
This level works out why the phases take longer than an orbit, how long the Moon's shadow is, why eclipses come in seasons and why they repeat after 18 years. Then it makes a prediction for one place during the total eclipse of 12 August 2026 and checks it against what was seen there. The sums are done here.

Never look at the Sun without certified eclipse filters, and for any eclipse follow the safety guidance of a recognised astronomy body.

**Step one: the month of the phases.** Against the stars the Moon goes round in ${P = 27.3217}$ days. In that time the Earth has carried it part of the way round the Sun, which goes round the sky once in ${Y = 365.256}$ days. The Moon has to gain a whole lap on the Sun to get back to the same phase, so the rates subtract:

$$
\frac{1}{S} = \frac{1}{P} - \frac{1}{Y}
$$

That gives ${S = 29.5306}$ days, new Moon to new Moon, matching NASA's 29.530589.

**Step two: the length of the Moon's shadow.** The Moon's shadow is a cone. Its tip is where the Moon, seen from there, exactly covers the Sun. By similar triangles, with $D$ the distance to the Sun and $R_\odot$ and $R_\text{M}$ the radii of the Sun (695,700 km) and the Moon (1,737.4 km), the cone's length is

$$
L = \frac{D \, R_\text{M}}{R_\odot - R_\text{M}}
$$

On 12 August 2026 the Sun was 151.59 million km away, so ${L = 379{,}500}$ km. Anyone closer to the Moon than that, along the line, is inside the cone and sees a total eclipse. Anyone further away sees a ring of Sun round the Moon. The Moon's distance from the Earth's surface varies from about 350,000 km to 400,000 km, so the tip of the cone sometimes reaches the ground and sometimes does not, and that is why some eclipses are total and others are rings.

**Step three: eclipse seasons.** The Moon's orbit is tilted by 5.1°, so an eclipse can only happen when the Sun is near one of the two places where the Moon's path crosses its own, called the nodes. The nodes are not fixed: they slide backwards round the sky. The Moon returns to the same node every draconic month, ${N = 27.212221}$ days. The Sun returns to the same node a little sooner than a year, at a rate found the same way as in step one:

$$
\frac{1}{E} = \frac{1}{N} - \frac{1}{S}
$$

This gives ${E = 346.62}$ days, the eclipse year. The Sun passes each of the two nodes once in that time, so the chances for eclipses come round every 173.3 days, about every six months, and drift nearly three weeks earlier each calendar year.

**Step four: the saros.** An eclipse repeats almost exactly if three things come back together: the phase, the node and the Moon's distance. The three months that measure them are

| Month | Days |
| --- | --- |
| Synodic, phase to phase | 29.530589 |
| Draconic, node to node | 27.212221 |
| Anomalistic, nearest to nearest | 27.554550 |

and

$$
\begin{aligned}
223 \times 29.530589 &= 6585.32 \\
242 \times 27.212221 &= 6585.36 \\
239 \times 27.554550 &= 6585.54
\end{aligned}
$$

All three agree to within a quarter of a day. That is the saros, 6,585.32 days, or 18 years, 11 days and 8 hours, give or take a day for leap years. It is also 19 eclipse years, 6,585.8 days. The extra third of a day means the Earth has turned an extra third of a turn, so the next eclipse in the series falls about 120° of longitude further west.

<figure class="photo">
  <img src="/img/learn/charts/sun-and-moon-sizes-2026.svg" alt="A graph of size in the sky, in degrees, through the months of 2026. The Sun's line is a gentle curve, largest in January and smallest in July. The Moon's line swings up and down every month, sometimes above the Sun's line and sometimes below it. A dashed vertical line marks 12 August, when the Moon's line is above the Sun's." width="800" height="660" loading="lazy" />
  <figcaption><b>Who covers whom, through 2026.</b> The size of the Sun and the Moon in the sky, seen from the Earth's centre, from JPL's positions every six hours. When a new Moon falls in an eclipse season with the Moon above the Sun's line, the eclipse can be total. On 12 August, the dashed line, it was.</figcaption>
</figure>

**A prediction tested: 12 August 2026.** The track of totality crossed Greenland, Iceland and northern Spain, and ended at sunset over the Balearic Islands. Take one spot on Menorca, the Bronze Age site of Talatí de Dalt, at latitude 39.893° north and longitude 4.215° east.

- *The sums.* JPL's positions for that spot, second by second, put the Moon at 1,953.7 seconds of arc across and the Sun at 1,893.3, so the Moon was 3.2 per cent wider. The Moon was 366,900 km from the site, inside the 379,500 km cone. The centres came within 19.6 seconds of arc of each other, and the Moon's disc wholly covered the Sun's from 18:30:16 to 18:31:29 UT: 74 seconds, give or take one. The Sun was only 1.5° above the horizon.
- *What was seen.* Josh Dury, photographing the eclipse setting over the site, reported in Astronomy magazine that totality there lasted about 73 seconds.

The prediction and the report agree to within the second the sums can resolve. The small leftover is no surprise: the calculation treats the Moon's edge as a smooth circle, and real mountains and valleys on it let the last beads of sunlight through a moment early or late.

**Try it yourself.** Use step two to find the shadow's length when the Earth is nearest the Sun, at 147.10 million km. Is the Moon, at its furthest, 406,000 km from the Earth's centre, inside the cone?

The answer: ${L = 368{,}300}$ km. Even subtracting the Earth's radius, the Moon is about 400,000 km from the nearest point of the ground, well outside the cone, so an eclipse then can only be a ring.

**What this level leaves out.** The Moon's orbit is pulled about by the Sun, so the months above are averages, which is why each saros series slowly drifts and lasts only 12 to 15 centuries. Exact predictions also need the Earth's slightly irregular spin, measured as a correction called ΔT, which can move an eclipse track by kilometres.
