---
title: "Cookies and storage"
description: "Exactly what Heliocodex keeps in your browser, why, for how long and how to remove it. There are no cookies."
lead: "Heliocodex sets no cookies and loads nothing from advertisers. This page lists the only things it ever keeps on your device, how its visit counting works, how to switch that off, and what the site reads from your device."
updated: 2026-11-12
---

<div class="short-version">

**The short version**

- No cookies of our own. No adverts. No social media buttons.
- A few lessons have a NASA video. It loads from YouTube only if you press its Play button, and the line beside the button says what that does (see section 7).
- One thing is kept for good: the place you chose on the sky map. **Forget my place** on that page removes it.
- One thing is kept until you close the tab: a one-word note, used only if the 3D view's graphics fail and the page has to start again.
- One more is kept only if you use the switch below: a note that you don't want to be counted.
- We count visits with Cloudflare Web Analytics, which sets no cookies. You can switch it off below, and it switches itself off if your browser sends Do Not Track or Global Privacy Control.
- Nothing kept on your device is ever sent to us.
- There is no cookie banner, because nothing here needs your consent until you choose to play a video, and pressing play is that choice. You are told, and you can opt out.

</div>

## 1. Visit counting, and the switch

We count visits with Cloudflare Web Analytics, so that we can see which pages are read and which are slow. It uses a short script from Cloudflare that reads your browser's page-timing measurements and sends a report. Cloudflare says that it sets no cookies, does not store anything in your browser and does not track individual visitors across its customers' sites. The privacy policy has the full account.

<div class="count-switch" id="count-switch" hidden>
  <p id="count-state"></p>
  <button type="button" id="count-button"></button>
</div>
<noscript><p>The switch needs JavaScript. Without JavaScript, the counting script doesn't run either, so you are not being counted.</p></noscript>

If your browser sends a Do Not Track or Global Privacy Control signal, the script isn't loaded at all, whatever the switch says. Clearing this site's data in your browser, or blocking cloudflareinsights.com with a content blocker, also stops it.

## 2. What this page covers

A cookie is a small file that a website asks your browser to save. Browsers offer other places to keep things as well, such as local storage and session storage. UK law treats all of them alike: the Privacy and Electronic Communications Regulations 2003 (PECR), regulation 6, says a website may not store information on your device, or read information from it, unless you have been given clear information and have agreed, or an exception applies.

This page covers every use of your device's storage by heliocodex.com, the visit counting, and the ways the site reads from your device. How we handle personal data in general is in our [privacy policy](/privacy).

## 3. What Heliocodex keeps on your device

| Name | Where | What it holds | When it is set | How long it lasts | Why |
| --- | --- | --- | --- | --- | --- |
| heliocodex-sky-place | Local storage | The name of the place you chose on the sky map, and its latitude and longitude. If you used your device's position, it is rounded to about 11 km first. | Only when you choose a place yourself on the sky map: from the list, by typing a position, or by tapping "Use where I am". Not for the first guess the page makes. | Until you tap "Forget my place", clear this site's data, or your browser clears it | So the sky map opens on your place next time, and so the star pages and the birthday-star finder can show your sky |
| heliocodex-no-count | Local storage | The single character 1 | Only if you press the switch in section 1 to stop being counted | Until you switch counting back on, or clear this site's data | To remember that you don't want to be counted |
| heliocodex-view | Local storage | Your choices in the 3D view's View menu: whether planets are drawn at true size or easier to see, whether trips glide or use reduced motion, and whether the map is shown | Only when you change one of those choices | Until you change them again, clear this site's data, or your browser clears it | So the 3D view opens the way you set it up last time |
| hc-gl | Session storage | The single character 1 | Only if the 3D view's graphics stop working within about fifteen seconds of starting | Until you close that browser tab | So that when the page restarts it uses WebGL 2, a more widely supported way of drawing, instead of trying the same thing again |
| hc-from | Session storage | The address of the page you were reading, its heading, and how far down it you had scrolled | Only when you follow a link from a page into the 3D view | Until you close that browser tab | So the 3D view can offer a way back to that page, and put you back where you were on it |
| hc-at | Session storage | The name of the place you were last looking at in the 3D view, such as "mars" | When the 3D view moves to a new place | Until you close that browser tab | So that going back into the 3D view in the same tab carries on from where you were |

That is the full list, plus the opt-out note in the next paragraph. Nothing else is written to local storage, session storage, IndexedDB or cookies. You can check for yourself in your browser's developer tools, under the Application or Storage tab.

Your browser also keeps its ordinary cache of the pages, pictures and data files it has fetched from us, so that it needn't download them again. That is part of how browsers work and isn't something the site does.

## 4. What Heliocodex reads from your device

Some of what the site does depends on facts about your device. These are read inside your browser, used straight away and not sent to us or to anyone else.

- **Screen and input.** The size of the window, the pixel density, and whether your main pointer is a finger or a mouse. They set the layout, and how sharp the 3D scenes can afford to be.
- **Memory and processor.** How much memory the browser reports (where it reports it) and how many processor cores there are. They set how much detail the 3D view tries to draw, so that a phone doesn't run out of memory.
- **Graphics.** Whether your device can run WebGPU or WebGL. The 3D view needs one of them.
- **Reduced motion.** Whether you have asked your device to keep animation to a minimum. We respect it.
- **Time zone and clock.** The time zone your device is set to, which makes a first guess at the nearest city on the sky map, and the time, which is what the sky is worked out for.
- **Your position, only if you ask.** If you tap "Use where I am", your browser asks you whether to share your position. Only if you say yes does the page receive it. See section 6.

## 5. Why none of this needs a banner

PECR lets a website store or read information without consent in some situations. The ones relevant here are in Schedule A1 to the regulations, most of which came into force on 5 February 2026 under the Data (Use and Access) Act 2025.

- **Counting visits (the statistics exception).** Paragraph 5 of the same schedule allows storage or access whose sole purpose is to collect statistics to improve a website, where the figures are shared only to help make those improvements, the visitor is told clearly, and the visitor has a simple, free way to object. We use Cloudflare Web Analytics for that purpose and no other. This page tells you, and the switch in section 1 is the way to object, as is a Do Not Track or Global Privacy Control signal, which stops the script loading at all. Cloudflare states the script reads the browser's Performance API timings and does not store anything in the browser or access cookies, local storage or session storage, so it may not even need an exception, but we treat it as if it does.
- **Strictly necessary for a service you asked for.** This covers technical storage that is strictly necessary for a service you have requested, and its examples include recording selections you have made on a website and keeping a device safe or preventing technical faults. The place you choose on the sky map is a selection you have made, kept so that the page does what you asked next time. The note about graphics is there to deal with a technical fault.
- **Adapting the site to your preferences.** This covers storage or access whose only purpose is to adapt how the website looks or works to your preferences, as long as you are told clearly what it is for and have a simple, free way to object. The place you chose, and the reading of your screen, motion setting and time zone, are used for that and nothing else. You are told here and on the sky map, and you can object whenever you like with **Forget my place**, or by clearing your site data. The site works without any of it.

- **Videos (consent).** Anything Google stores or reads when you press play on a video is covered by your consent, given by pressing play after being told what it does (paragraph 2 of Schedule A1). Nothing from YouTube loads before that.

We use these things for the purpose we have given and no other. They aren't used for measurement, advertising or tracking, and they aren't combined with anything. If we ever wanted to use them for something else, we would ask for your consent first.

We think this is the right reading of the law. It is the law and the Information Commission's guidance on "storage and access technologies" that matter, not our opinion, so if you disagree or have a concern, tell us at privacy@fallinghippo.com.

## 6. Your position and the sky map

"Use where I am" uses your browser's location feature, not anything of ours. Your browser decides whether to ask you, shows you its own prompt, and remembers your answer for this site. You can change that answer at any time in your browser's site settings, which usually means the padlock or settings icon next to the address.

If you say yes, the page receives your position, works out your sky with it and draws it. It does not send your position anywhere. The star data it needs is the same for everyone and is fetched as ordinary files. If you say no, or your device can't say where it is, you can choose a city or type a latitude and longitude instead.

## 7. What other people's services might set

Apart from the visit-counting script and a video you choose to play, nothing on heliocodex.com loads from another company's servers: not fonts, not maps, not pictures. The counting script comes from Cloudflare (static.cloudflareinsights.com) and reports to Cloudflare. Cloudflare says that it sets no cookies, and it only loads if you haven't opted out.

**Videos from YouTube.** Some lessons carry a NASA video hosted on YouTube. Until you press its Play button, the page shows a still picture kept on our own server and makes no request to YouTube or Google. When you press play, your browser loads YouTube's player from youtube-nocookie.com, YouTube's privacy-enhanced mode. From then on Google receives your IP address and details of your browser and device, and may store or read information on your device to run the player and count the view, under Google's own privacy policy. Google says that in this mode, views of embedded videos are not used to personalise your YouTube experience or the adverts it shows you outside the embed. We receive nothing from Google and cannot see who has played a video.

Our web host, Cloudflare, may in some situations set a security cookie, usually to tell people from automated attacks. That would be strictly necessary for keeping the site safe, and wouldn't need consent. At the time of writing we have checked and none is set. If that changes, we will list it here.

If you follow a link from a Heliocodex page to NASA, a journal or any other site, that site's own cookies and policies apply from then on.

## 8. How to remove or block what is kept

- **The sky map place.** Tap **Forget my place** on the sky map. It removes the item at once.
- **Everything the site keeps.** In your browser's settings, clear this site's data. The wording differs between browsers, but it is usually under Privacy, then Site settings or Cookies and site data, then heliocodex.com. Closing a private or incognito window also clears it.
- **Visit counting.** Use the switch in section 1, send a Do Not Track or Global Privacy Control signal, or block cloudflareinsights.com.
- **The note about graphics.** Closing the tab clears it.
- **Your position.** Change the location permission for heliocodex.com in your browser's site settings.
- **Videos.** Anything kept after you pressed play belongs to youtube-nocookie.com and google.com. Clear their data in your browser's site settings, or simply don't press play.

## 9. Changes

If we add anything that stores or reads information on your device, we will update this page first, change the date at the top, and ask for your consent where the law requires it.

- **11 November 2026.** Added visit counting with Cloudflare Web Analytics, the opt-out switch and the notes about them.
- **11 November 2026.** First version.

## 10. Questions

Email privacy@fallinghippo.com. Our registered office is FALLINGHIPPO LIMITED, 71-75 Shelton Street, London, England, WC2H 9JQ, company number 17415391.
