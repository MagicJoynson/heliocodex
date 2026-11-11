# Making the 3D view easy and comfortable

*Research note, 11 November 2026, for the change that made the home page's 3D view calmer and easier to steer.*

## What went wrong before

- **The camera swung round the planet while turning.** The way in, and every trip from the old "Fly to" list, did both at once, for up to 30 seconds.
- **The view never stayed still.** The direction you were looking in changed continuously all the way through a trip.
- **The controls were game controls.** You had to fly yourself with W A S D, which is hard to learn and easy to get lost with.

Turning the view on its own is the part that makes people feel ill. The motion-sickness research below explains why.

## What the best space explorers do

- **They circle one thing at a time.**
  - NASA's Eyes on the Solar System, Solar System Scope and similar tools keep one object in the middle of the screen.
  - You drag to circle round it, and you scroll or pinch to get closer or further.
  - Eyes uses W/S to zoom and A/D to orbit the selected object. Free flight is a separate, later mode.
  - [NASA/JPL on Eyes](https://www.jpl.nasa.gov/news/explore-the-solar-system-with-nasas-new-and-improved-3d-eyes/), [Vatican Observatory guide to Eyes controls](https://www.vaticanobservatory.org/education/solar-system-interactive)
- **They let you click to go somewhere.** Hovering highlights a planet, and clicking takes you to it.
- **They give you a choice of scale.** Explorers offer true sizes, which show the planets as specks, or enlarged sizes so you can see and click them.
- **They show a small overhead map** so you always know where you are.
- **Their trips move like a map, not a rollercoaster.**
  - Smooth zooming between two places works best as zoom out, slide across, then zoom in. The speed should feel even in powers of ten.
  - This is the van Wijk–Nuij method, later improved so it starts and stops smoothly by Reach and North (2019).
  - [Smooth, efficient and interruptible zooming and panning](https://arxiv.org/abs/1801.09358)

## What motion-sickness research and the guidelines say

- **Turning the view is the main cause of discomfort.**
  - Snap turning and viewpoint snapping remove rotational motion, and they "significantly, and substantially" reduce cybersickness.
  - [Viewpoint snapping study, Graphics Interface 2018](https://www.csit.carleton.ca/~rteather/pdfs/GI_2018_viewpoint_snapping.pdf)
- **Avoid automatic camera changes and repeated swaying.** Let people adjust camera movement.
  - [Xbox Accessibility Guideline 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117)
- **Honour the device's reduced-motion setting.**
  - WCAG 2.3.3 asks sites not to harm people with motion. Its technique C39 uses the reduced-motion setting, replacing an animation with an instant change.
  - [W3C, Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)

## What we built, and why

1. **An orbit camera by default.**
   - You always look at one thing.
   - Drag, or use the arrow keys or A and D, to circle round it. Ecliptic north stays up, so the Solar System never tips.
   - The wheel, a pinch, W and S, or the on-screen + and − buttons bring you nearer or further, settling smoothly in powers of ten.
2. **Trips that hardly turn.**
   - Going somewhere zooms out a little, slides across, and zooms back in. The view keeps its direction.
   - The view turns only when the far side of a planet would be in darkness, and then only as far as needed to see it lit.
   - Trips take 2 to 5.5 seconds, down from up to 30.
   - The way in is a 7-second straight glide down to Mars, with no turning.
3. **Reduced motion.**
   - It follows the device setting, and there is also a switch in the View menu.
   - With it on, every trip is a jump hidden by a short fade from black, and nothing drifts after a drag.
4. **Click or tap any planet, or its name, to go there.** The Sun, the planets and their larger moons can all be picked. The keys [ and ] step through the planets.
5. **A choice of planet sizes in the View menu.**
   - **True size** shows the planets as they really are: dots from far away.
   - **Easier to see** draws each planet at least 2.7° across from far off. Within about 40 of its own radii, every planet is its true size again.
6. **A small map** of the Solar System from above.
   - It shows the planets, you, and the way you are facing. Click a planet on the map to go there.
   - Next to the map is the name of what you are looking at and your distance from the Sun.
7. **A clear way to the rest of the site.**
   - The header always shows Learn, Bodies, Tonight's sky, Stars, Atlas and Glossary.
   - On phones, a Menu button lists every section with a line about each.
8. **Free flight is still there for skimming the ground.** Use F or "Fly yourself" to start it, and Esc to go back to circling.
