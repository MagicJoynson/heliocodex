# Content Security Policy: draft and how to switch it on

`public/_headers` sends the policy as **Report-Only**. Browsers apply nothing yet; they only record what would have been blocked.

## Tested on 14 November 2026 (draft branch, a local server sending the same header)
No violations on: `/`, `/sky`, `/explore` (entered, so the terrain workers ran), `/mars`, a lesson, `/atlas`, a star page, `/search?q=mars`, `/glossary`, `/discovery`, `/cookies`, and the click-to-load video on `/learn/the-active-sun` (the player from youtube-nocookie.com loads).

## Not tested yet
- The live Cloudflare Pages deployment itself (the preview deploy of this branch is the first real test; open the browser console and look for "Content Security Policy" messages).
- The 3D page after the 3D rounds land: new scripts, workers or textures may need new sources.
- The Web Analytics beacon on a visit that is not blocked by Do Not Track.

## Known weakness
`script-src` and `style-src` allow `'unsafe-inline'`, because Astro writes small inline scripts and styles into each page. The policy still stops scripts and frames from any other host, and blocks objects, other form targets and framing. Removing `'unsafe-inline'` means moving to hashes or nonces, which is a larger change.

## To enforce
After the 3D rounds are in and the preview shows no violations, rename `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `public/_headers`. Roll back by renaming it back.

## Other headers in the file
`Permissions-Policy` keeps location for the site itself (the sky map's "Use where I am") and turns off camera, microphone, payment and USB. `Cross-Origin-Opener-Policy: same-origin` isolates the page from windows it did not open; if a future feature opens a pop-up sign-in, revisit it.
