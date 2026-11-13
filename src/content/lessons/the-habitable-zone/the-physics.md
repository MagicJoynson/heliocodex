---
sources:
  - { label: "NASA NSSDC Earth fact sheet (sunlight, Bond albedo, average temperature)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" }
  - { label: "NASA NSSDC Venus fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html" }
  - { label: "NASA NSSDC Mars fact sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html" }
  - { label: "NIST, the Stefan-Boltzmann constant", url: "https://physics.nist.gov/cgi-bin/cuu/Value?sigma" }
  - { label: "NASA Exoplanet Archive, TRAPPIST-1 system (Agol and others 2021 values), queried 13 November 2026", url: "https://exoplanetarchive.ipac.caltech.edu/" }
  - { label: "Greene and others, Thermal emission from the Earth-sized exoplanet TRAPPIST-1 b using JWST (Nature, 2023)", url: "https://arxiv.org/abs/2303.14849" }
  - { label: "Zieba and others, No thick carbon dioxide atmosphere on the rocky exoplanet TRAPPIST-1 c (Nature, 2023)", url: "https://arxiv.org/abs/2306.10150" }
  - { label: "Kopparapu and others, Habitable zones around main-sequence stars (Astrophysical Journal, 2013)", url: "https://arxiv.org/abs/1301.6674" }
lastChecked: 2026-11-13
---
This level derives the temperature a planet would have with no air, from a balance of the energy coming in against the energy going out. It then tests the result on three real planets, where the difference from the measured temperature is the warming done by each planet's air, and on two planets of TRAPPIST-1 whose heat the Webb telescope has measured. The sums are done here unless a source is named.

**Energy in.** A star of power $L$ spreads its light over a sphere, so at a distance $d$ each square metre facing it receives

$$
S = \frac{L}{4 \pi d^2}
$$

At the Earth this is 1,361 watts on each square metre. A planet of radius $R$ catches the light falling on its shadow, a disc of area $\pi R^2$. It reflects a share $A$, its albedo, and absorbs the rest:

$$
P_{\text{in}} = (1 - A)\, S\, \pi R^2
$$

**Energy out.** A warm body gives out heat as infrared light. The Stefan-Boltzmann law says each square metre at temperature $T$ gives out $\sigma T^4$, where $\sigma = 5.67 \times 10^{-8}$ W m⁻² K⁻⁴. If the planet spreads its heat round evenly, as a fast-spinning planet with air or oceans does, the whole surface, $4 \pi R^2$, radiates:

$$
P_{\text{out}} = 4 \pi R^2 \sigma T^4
$$

**The balance.** A planet that is neither warming nor cooling gives out what it takes in. Set the two equal. The radius cancels, so a planet's size does not matter, and

$$
T = \left(\frac{(1 - A)\, S}{4 \sigma}\right)^{1/4}
$$

This is the equilibrium temperature. The 4 underneath comes from the ratio of the whole surface to the disc that catches the light. The fourth root means the temperature changes slowly: double the sunlight and the temperature goes up only by the fourth root of 2, about 19 per cent.

<figure class="photo">
  <img src="/img/learn/charts/sunlight-in-heat-out.svg" alt="Parallel gold arrows of sunlight come from the left and stop on a dark planet. A dashed oval through the planet marks the disc that catches them. Red arrows of heat leave the planet in every direction." width="800" height="600" loading="lazy" />
  <figcaption><b>In through a disc, out all round.</b> Sunlight arrives from one direction, so the planet catches only what falls on its shadow, a disc of area πR². It gives out heat from its whole surface, four times that area. That ratio is the 4 in the formula.</figcaption>
</figure>

**Real data: three planets.** NASA's fact sheets give the sunlight and albedo of each planet, and the average temperature measured at its surface.

Venus gets 2,601 watts on each square metre and reflects 0.77 of it. The Earth gets 1,361 and reflects 0.294. Mars gets 586 and reflects 0.25.

| | $T$ with no air | Measured at the ground |
| --- | --- | --- |
| Venus | 227 K | 737 K |
| The Earth | 255 K | 288 K |
| Mars | 210 K | about 214 K |

The difference between the last two columns is the greenhouse effect. The Earth's air warms it by 33 K, which is what keeps most of its water liquid: at 255 K, that is −18 °C, most of its water would freeze. Mars has a very thin air and is warmed by only a few degrees. Venus is the striking one. It reflects so much sunlight that with no air it would be colder than the Earth, yet its thick carbon dioxide air holds it at 737 K, hot enough to melt lead.

**From temperature to a zone.** The level before gave the edges of the Sun's zone, from a 2013 model, as 0.99 and 1.70 times the Earth's distance, where a planet gets 1.02 and 0.35 times the Earth's sunlight. Since $S$ falls as $1/d^2$, the edges round any star are at

$$
d = \sqrt{\frac{L / L_\odot}{S / S_\oplus}} \ \text{au}
$$

with the star's power in Suns and the sunlight in Earths. TRAPPIST-1 gives out 0.00055 times the Sun's power, so its zone runs from 0.023 to 0.040 au. Its planets e, at 0.029 au, and f, at 0.038 au, are inside; d, at 0.022 au, is just closer in than the inner edge. The edges move a little for a star as cool as this, because a planet's air reflects red light less well, which the 2013 model allows for and this simple scaling does not.

**A planet with no air.** The 4 in the balance assumed the heat is spread round. A planet with no air or ocean cannot do that. Each patch of ground gives out what falls on it, so the side facing the star is much hotter and the far side very cold. Averaged over the face we see when the planet is beside the star, working this through over the disc changes the 4 to $3/2$. In terms of the star's own surface temperature $T_\star$ and radius $R_\star$, and with nothing reflected:

$$
T_{\text{day}} = T_\star \sqrt{\frac{R_\star}{a}} \left(\frac{2}{3}\right)^{1/4}
$$

**Real data: TRAPPIST-1 b and c.** The archive gives the star a surface temperature of 2,566 K and a radius of 0.119 Suns. Planet b is 0.01154 au from it and c is 0.0158 au.

| | Bare rock, from the formula | Measured by Webb |
| --- | --- | --- |
| TRAPPIST-1 b | 508 K | 503 K, give or take 27 |
| TRAPPIST-1 c | 434 K | 380 K, give or take 31 |

If instead an air spread the heat evenly round each planet, the first formula would give 398 K for b and 340 K for c. Planet b matches bare rock almost exactly. Greene and colleagues, who measured it in 2023, worked out the same 508 K, and concluded that the planet has little or no air. Planet c falls between the two, so Zieba and colleagues could rule out a thick carbon dioxide air like Venus's, but not a thinner one or bare rock.

**Try it yourself.** Use the first formula for TRAPPIST-1 e, which gets 0.646 times the Earth's sunlight according to the archive, with the Earth's albedo of 0.294.

The answer: about 228 K, or −45 °C. Like the Earth, it would need the warming of an air to keep water liquid. Whether it has one is what the Webb telescope is now trying to find out.

**What this level leaves out.** Albedo is not a fixed number: ice, cloud and the colour of the star all change it, and a planet that cools grows more ice and reflects more, which cools it further. The greenhouse warming depends on what the air is made of and how thick it is, which is what the model behind the zone's edges works out. And a planet's own heat from inside, which keeps the ocean of Europa liquid far outside the Sun's zone, is left out altogether.
