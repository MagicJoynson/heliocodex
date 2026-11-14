---
sources:
  - { label: "Gaia Data Release 3 (ESA/Gaia/DPAC): parallaxes of Proxima Centauri, Barnard's Star, 61 Cygni A, Kapteyn's Star and Delta Cephei, from the Gaia archive. Licence: CC BY-SA 3.0 IGO", url: "https://www.cosmos.esa.int/web/gaia/dr3" }
  - { label: "Lindegren and others, Gaia Early Data Release 3: the astrometric solution (Astronomy and Astrophysics, 2021): typical parallax uncertainties", url: "https://arxiv.org/abs/2012.03380" }
  - { label: "Lindegren and others, Gaia Early Data Release 3: parallax bias versus magnitude, colour and position (Astronomy and Astrophysics, 2021): the zero-point offset", url: "https://arxiv.org/abs/2012.01742" }
  - { label: "Gaia DR3 documentation: the RUWE column of the main star catalogue", url: "https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html" }
  - { label: "Bailer-Jones, Estimating distances from parallaxes (Publications of the Astronomical Society of the Pacific, 2015)", url: "https://arxiv.org/abs/1507.02105" }
  - { label: "Benedict and others, A parallax of the fundamental distance calibrator Delta Cephei with the Hubble Space Telescope (Astronomical Journal, 2002)", url: "https://arxiv.org/abs/astro-ph/0206214" }
  - { label: "Leavitt and Pickering, Periods of 25 variable stars in the Small Magellanic Cloud (Harvard College Observatory Circular 173, 1912)", url: "https://ui.adsabs.harvard.edu/abs/1912HarCi.173....1L" }
  - { label: "Riess and others, a measurement of the local value of the Hubble constant from the SH0ES team (Astrophysical Journal Letters, 2022)", url: "https://arxiv.org/abs/2112.04510" }
  - { label: "Planck Collaboration, Planck 2018 results VI: cosmological parameters (Astronomy and Astrophysics, 2020)", url: "https://arxiv.org/abs/1807.06209" }
  - { label: "Freedman and others, status report on the Chicago-Carnegie Hubble Program (2024)", url: "https://arxiv.org/abs/2408.06153" }
lastChecked: 2026-11-14
recheck: { what: "Whether the gap between the Hubble constant from nearby distances and from the oldest light has closed", by: 2027-11-14 }
---
This level derives the parallax rule, applies it to five stars measured by the Gaia spacecraft, and works out how sure each distance is. It then follows the error up the next rung of the ladder, to the Cepheid stars, and to a disagreement that is not yet settled. The parallaxes are from Gaia's third data release, credited ESA/Gaia/DPAC, and the sums are done here.

**Step one: the rule.** Over a year the Earth moves round a circle of radius 1 au. Seen from a star at distance $d$, that circle subtends an angle, and the star's parallax $\varpi$ is the angle that 1 au subtends:

$$
\tan\varpi = \frac{1 \ \text{au}}{d}
$$

Every star's parallax is less than one second of arc, which is less than five millionths of a radian, so $\tan\varpi$ is $\varpi$ to better than one part in a hundred thousand million. With $\varpi$ in radians, ${d = 1\ \text{au} / \varpi}$. One second of arc is $1/206{,}264.8$ of a radian, so a star with a parallax of one second of arc is 206,264.8 au away. That distance is the parsec, and the rule becomes

$$
d = \frac{1}{\varpi}
$$

with $d$ in parsecs and $\varpi$ in seconds of arc. Gaia gives parallaxes in milliarcseconds, thousandths of a second of arc, and then ${d = 1000/\varpi}$.

**Step two: the shape the star traces.** The star's shift always points away from where the Earth is, so over a year the star traces a small copy of the Earth's orbit, seen from the star. A star near the pole of the Earth's orbit sees that orbit face-on and traces a circle. A star in the plane of the orbit sees it edge-on and swings back and forth along a line. In between, the circle is foreshortened into an ellipse. Its long axis has a half-width of $\varpi$, and its short axis a half-width of $\varpi \sin\beta$, where $\beta$ is the star's angle from the plane of the Earth's orbit.

**Real data: five stars from Gaia.**

| Star | Parallax, milliarcseconds | Distance, parsecs |
| --- | --- | --- |
| Proxima Centauri | 768.067 ± 0.050 | 1.3020 |
| Barnard's Star | 546.976 ± 0.040 | 1.8282 |
| 61 Cygni A | 286.005 ± 0.029 | 3.4964 |
| Kapteyn's Star | 254.199 ± 0.017 | 3.9339 |
| Delta Cephei | 3.555 ± 0.148 | 281 |

Proxima Centauri comes out at 4.2465 light years, and 61 Cygni A, Bessel's star, at 11.404.

**Step three: how sure is each distance?** A small error $\sigma_\varpi$ in the parallax makes an error in the distance found by differentiating ${d = 1/\varpi}$:

$$
\sigma_d = \frac{\sigma_\varpi}{\varpi^2} \qquad\text{so}\qquad \frac{\sigma_d}{d} = \frac{\sigma_\varpi}{\varpi}
$$

The fractional error in the distance is the fractional error in the parallax. For Proxima Centauri that is 0.050 out of 768, or 0.0065 per cent: its distance is known to within about 17 au, smaller than the gap between the Sun and Uranus. For Delta Cephei it is 0.148 out of 3.555, or 4.2 per cent: 281 parsecs give or take 12.

The first form shows why distance is hard. For a fixed error in the angle, the error in the distance grows as $d^2$. Gaia's typical parallax error for a star of middling brightness is 0.02 to 0.03 milliarcseconds. Take 0.02: a 10 per cent distance needs a parallax of 0.2 milliarcseconds, which is 5,000 parsecs. That is still well short of the centre of the galaxy.

**When the rule stops working.** The step above assumes the error is small. Once it is more than about a fifth of the parallax, $1/\varpi$ is a poor guess at the distance: a star measured a little too close and one measured a little too far no longer balance out, and a faint star can even come out with a parallax below zero, which no distance can give. Bailer-Jones set out in 2015 how to turn such a parallax into a range of distances instead, and the distance catalogue most used with Gaia, by Bailer-Jones and colleagues, is built that way.

**A warning flag.** Delta Cephei has a second problem. Gaia reports a number called RUWE for each star, which measures how well its motion across the sky fits a simple model. A value near 1 means a good fit, and a value well above 1 means the star is not moving the way the model expects. Delta Cephei's is 2.71. It is very bright for Gaia, and it is thought to have a close companion that tugs it. Hubble's Fine Guidance Sensors measured it in 2002 at 3.66 ± 0.15 milliarcseconds, which agrees with Gaia's figure within their uncertainties.

**Step four: the zero point.** There is one more error, and it does not shrink with more measurements. Gaia's parallaxes are all offset from the truth by a small amount. Distant quasars should show a parallax of zero, and they do not: on average Gaia gives them a slightly negative one. Lindegren and colleagues found the offset to be a few tens of microarcseconds, and that it depends on the star's brightness, colour and position on the sky, so it cannot be taken out with a single number. Take 0.02 milliarcseconds as an example of its size:

- for Proxima Centauri it is 0.003 per cent of the parallax, and does not matter;
- for Delta Cephei it is 0.6 per cent;
- for a star at 5,000 parsecs it is 10 per cent, as big as the random error.

The random error falls as more measurements are averaged. The offset does not, because every measurement shares it. That is why it matters so much for the next step.

<figure class="photo">
  <img src="/img/learn/charts/parallax-ellipse-of-delta-cephei.svg" alt="A small ellipse, wider than it is tall, drawn on a grid marked in milliarcseconds, with a shaded band along it. Points round the ellipse are labelled January, April, July and October. In the middle are the star's name and its parallax, 3.555 plus or minus 0.148 milliarcseconds; the shaded band shows that uncertainty." width="800" height="720" loading="lazy" />
  <figcaption><b>Delta Cephei over one year.</b> The path the star traces on the sky because the Earth goes round the Sun, from Gaia's parallax of 3.555 milliarcseconds. The ellipse is flattened because the star is 59.5° from the plane of the Earth's orbit. The shaded band runs from 3.407 to 3.703: the star is somewhere inside it, with about two chances in three. The star's own steady drift across the sky has been taken out. Mas stands for milliarcseconds.</figcaption>
</figure>

**Step five: up the ladder.** Henrietta Leavitt, in 1912, published the periods of 25 Cepheid variable stars in the Small Magellanic Cloud and showed that the brighter ones take longer to pulse. All the stars in the Cloud are at much the same distance, so this gives their brightnesses compared with each other. To turn that into true brightness, someone has to find the distance to a few Cepheids by another route. Delta Cephei, the star the whole class is named after, is one of them.

The light reaching us from a star falls off as $1/d^2$. So a star's true brightness worked out from its distance carries twice the fractional error:

$$
\frac{\sigma_L}{L} = 2 \, \frac{\sigma_d}{d}
$$

A 4.2 per cent parallax gives an 8.3 per cent brightness. Averaging many Cepheids brings the random part down. The zero point does not average away: an offset that makes every nearby Cepheid 0.6 per cent too far makes every one 1.1 per cent too bright, and that error is carried into every galaxy whose distance is measured with Cepheids.

**An open question: the Hubble tension.** The expansion rate of the universe, $H_0$, can be found from this ladder, or worked out from the oldest light assuming the standard model of the universe. In 2022 the SH0ES team, using Cepheids anchored partly on Gaia, found $73.04 \pm 1.04$ km/s per megaparsec. Planck's 2018 result from the oldest light is $67.4 \pm 0.5$. That is a gap of 8 per cent, nearly five times the combined uncertainty. One side, including SH0ES, argues that the ladder is sound and that the standard model is missing something. The other, including Wendy Freedman's CCHP team, who in 2024 found 70.4 using red giant stars in place of Cepheids, argues that the gap may come from how the nearby stars are measured, which is exactly where zero points and crowded, bright stars matter. The level on the expanding universe sets out the measurements in full. As of November 2026 the question is open, and this page will be checked again by November 2027.

**Try it yourself.** A star has a Gaia parallax of 0.500 ± 0.025 milliarcseconds. How far away is it, and how sure is that?

The answer: 2,000 parsecs, give or take 100, which is 5 per cent. Here the rule still works, because the error is well under a fifth of the parallax.

**What this level leaves out.** A real star also drifts across the sky in a straight line, its proper motion, and Gaia fits that and the parallax together. Gaia measures the shifts against an all-sky frame tied to distant quasars rather than against nearby background stars, which is why its parallaxes are absolute. And the Cepheid rung has its own corrections, for dust and for the amount of metal in each star, that this level does not go into.
