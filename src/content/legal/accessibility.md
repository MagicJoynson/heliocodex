---
title: "Accessibility"
description: "How accessible Heliocodex is, what we have checked, what doesn't work yet, what you can use instead and how to tell us about a problem."
lead: "We want everyone to be able to learn from Heliocodex. This page says honestly how well the site works today, where it falls short and what to do if it doesn't work for you."
updated: 2026-11-11
---

<div class="short-version">

**The short version**

- We aim for the Web Content Accessibility Guidelines (WCAG) 2.2, level AA. The site is **partly compliant**. The reading pages meet it in the checks we have run. The 3D views, which are a large part of the site, do not yet.
- Every planet, star, lesson and atlas entry has an ordinary text page with the same facts, so you don't need the 3D view to learn anything here.
- If something doesn't work for you, email hello@fallinghippo.com with "Accessibility" in the subject. We reply within 5 working days.

</div>

## 1. Our commitment

Heliocodex is an educational site, so being usable by as many people as possible matters more than it would on most sites. FALLINGHIPPO LIMITED, which runs it, has a duty under the Equality Act 2010 to make reasonable adjustments so that disabled people can use its services. The accessibility regulations for public sector websites don't apply to us, but we follow the same approach and publish this statement the way the government's guidance describes.

We aim to meet WCAG 2.2 level AA, which is the standard the UK government uses.

## 2. How accessible the site is

Heliocodex is **partially compliant** with WCAG 2.2 level AA. Section 4 lists what doesn't meet it.

What works:

- **Reading pages.** The planet, lesson, glossary, atlas, star, sources and legal pages are ordinary text pages with proper headings, links, lists and tables. They reflow when you zoom, and read in a sensible order.
- **Text size and zoom.** The layouts follow the window, from a wide screen to a phone, and in our checks at phone width the legal, lesson, star and sky pages did not scroll sideways. You can enlarge text in your browser.
- **Colour and contrast.** The pages use light text on a near-black background, and an automated check found no contrast failures.
- **Motion.** The pages that animate check whether you have asked your device for reduced motion, and respect it.
- **Pictures.** Photographs have text descriptions, and captions say what they show and where they come from.
- **Equations.** They are set with KaTeX, which includes a version in MathML that screen readers can read.
- **Tables.** Wide tables on the legal pages scroll sideways on a phone, and you can reach them with the keyboard.
- **No time limits, no flashing content, no sign-in, no pop-ups.**
- **Language.** Pages are marked as British English.

## 3. What we have checked

On 11 November 2026 we ran an automated check (axe-core) against WCAG 2.0, 2.1 and 2.2 levels A and AA on the home page, the legal pages, the sky map, the star pages, the lessons, the glossary, the atlas, the sources page and several planet pages, at desktop and at phone width. We checked the keyboard on the text pages by hand. We haven't yet had the site audited by an independent accessibility specialist, and we haven't tested the 3D views with screen readers, screen magnifiers or switch devices. Automated checks find only part of the problems, so please treat this statement as our honest best account, not a guarantee.

## 4. What doesn't work yet

- **The 3D views can't be read by a screen reader.** The 3D view on the home page, the solar system on the Bodies page and the star and galaxy flights are drawn on a canvas, which assistive technology sees as a single picture with a short label. The facts the views show are on the text pages, but the flying, choosing and looking around aren't available in text. WCAG 2.2 criteria that this affects include 1.1.1 (non-text content), 1.3.1 and 4.1.2.
- **Some 3D controls need a pointer.** In the 3D views you turn by dragging and zoom by scrolling or pinching. The home page's 3D view also works from the keyboard: the arrow keys or A and D turn you round, W and S or + and − zoom, [ and ] go to the planet before or after, and the on-screen + and − buttons, the "Go to" list and the "View" menu are ordinary buttons. It follows your device's reduced-motion setting, and the View menu has a reduced-motion switch that replaces every trip with a quick fade. We haven't yet checked that every part of the guide panel can be reached and used by keyboard alone.
- **Small targets on the Bodies page.** The name labels of the planets in the 3D solar system are about 23 pixels high, a little under the 24 pixel minimum in WCAG 2.2 criterion 2.5.8. The planets can also be chosen from the list of bodies on the page.
- **The sky map is a canvas.** The chart is a picture, and touching a star in it asks for a pointer. Underneath it is a list in text of what is up at your place and time, which is the way to read it without the picture.
- **No "skip to content" link.** The main menu is short, but pages don't yet have a link to jump past it, which doesn't meet WCAG criterion 2.4.1 in full.
- **Animation.** Pages respect your reduced-motion setting, but we haven't tested every animation and every flight in the 3D view with that setting turned on.
- **Graphics demands.** The 3D view needs a device that supports WebGPU or WebGL 2. If yours doesn't, it says so, and the rest of the site still works.

We are working on these. The aim is to fix the controls and add text equivalents for the 3D views first. We will update this page as each one is done.

## 5. What you can use instead

- **The text pages.** Each planet and the Sun has its own page, with the facts, the sources and the photographs. Every lesson has a page for each level of difficulty. The [glossary](/glossary), the [facts](/learn/facts) and the [atlas](/atlas) are all lists and text. The [sources](/sources) page names where everything comes from.
- **The star pages.** Every named star has a page that gives its distance, brightness, colour and where it is in the sky.
- **The sky list.** The sky map lists the stars, planets and Moon above you in text.
- **Another format.** If you need information from a page in a different form, such as plain text, large print or a description of a diagram, email us and say which page. We will do our best to give it to you in a reasonable time.

## 6. Tell us about a problem

If you can't use part of the site, find something confusing, or think we have got something wrong here, email **hello@fallinghippo.com** with "Accessibility" in the subject. Please tell us the page, what you were trying to do, what happened and what you use to browse (for example the browser and any assistive technology). We reply within 5 working days.

We are happy to be told, and we will take it seriously.

## 7. If you're not happy with our reply

If you contact us and aren't happy with how we respond, you can complain to the Equality Advisory and Support Service (EASS) at equalityadvisoryservice.com, which gives advice and help on discrimination and equality. If you live in Northern Ireland, you can contact the Equality Commission for Northern Ireland instead.

## 8. Technical information

Heliocodex is built with HTML, CSS and JavaScript, and its 3D views use WebGPU or WebGL 2. It works best in a current version of Chrome, Edge, Firefox or Safari. The reading pages work without JavaScript. The sky map, the birthday-star finder and the 3D views need it.

This statement was prepared on 11 November 2026. We will review it at least once a year and when we change the site in a way that affects it.

- **11 November 2026.** First version.
