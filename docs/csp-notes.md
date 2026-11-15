# Content Security Policy: what it does, how it was tested, how to switch it off

`public/_headers` sends the policy **enforced** (`Content-Security-Policy`). A browser blocks any script, frame, image or connection from a host the policy does not name. Allowed: the site's own files, Cloudflare Web Analytics (`static.cloudflareinsights.com`, `cloudflareinsights.com`), and the click-to-load video player (`www.youtube-nocookie.com`). Also sent: `Permissions-Policy` (location for the site itself, camera, microphone, payment and USB off) and `Cross-Origin-Opener-Policy: same-origin`.

## Tested on 15 November 2026 (main through #109 plus this file)
A local server sent the exact header, once as Report-Only and once enforced, and a browser listened for `securitypolicyviolation` and console "Refused to" messages.
- The first pass covered 26 pages with no violations in either mode. The independent tester then crawled 553 routes (every page type, 1,114 loads at desktop and phone width) and found one thing the first pass missed: the maths lessons use a font that KaTeX embeds as a `data:` URL, which `font-src 'self'` blocked (the lessons still drew, from the font file). `data:` is now in `font-src`. The 26 pages were: `/`, `/sky`, `/mars`, `/atlas`, `/stars`, a star page, the catalogue, a constellation, `/worlds`, a world, the planet pages, `/learn`, two lessons, `/glossary`, `/sources`, `/discovery`, the legal pages, `/search?q=mars` and the 404 page.
- `/explore`, entered, on WebGL 2 and on WebGPU (software GPU in both cases): plain, `?go=mars&d=4000` (terrain workers) and `?go=star:betelgeuse`. Canvas drawn, "Now at Mars" announced, no violations.
- Web Analytics: the beacon loads (`beacon.min.js`) and its report (`/cdn-cgi/rum`) is sent.
- Video: click-to-load on `/learn/the-active-sun` opens the player from `youtube-nocookie.com` and it runs.
- Negative check: a script, iframe, image and fetch to a foreign host were each blocked and reported.
- The preview deploy of the pull request is the test on the real Cloudflare Pages headers.

## Why `blob:` is in the policy
`img-src` and `worker-src` allow `blob:` for textures and tile workers the 3D page builds in memory. The current code loads its workers and textures from the site's own files, so it may be unused today; it is kept in case a browser takes a different path. Remove it if a future review shows nothing needs it.

## Not tested
- Real GPUs (WebGPU on a physical card), real mobile browsers, or a visit with Do Not Track on (the site's own count opt-out is separate).
- Anything added after this date: a new third-party host, font, embed or script needs adding to the policy in the same pull request. Symptoms are a blocked item and a "Content Security Policy" message in the browser console.

## Known weakness
`script-src` and `style-src` allow `'unsafe-inline'`, because Astro writes small inline scripts and styles into each page. The policy still stops scripts and frames from any other host, and blocks objects, other form targets and framing. Removing `'unsafe-inline'` means moving to hashes or nonces, which is a larger change.

## To switch it off quickly
Rename `Content-Security-Policy` to `Content-Security-Policy-Report-Only` in `public/_headers` and deploy. The browser then only reports and blocks nothing.

## Other headers in the file
`Permissions-Policy` keeps location for the site itself (the sky map's "Use where I am"). `Cross-Origin-Opener-Policy: same-origin` isolates the page from windows it did not open; if a future feature opens a pop-up sign-in, revisit it.
