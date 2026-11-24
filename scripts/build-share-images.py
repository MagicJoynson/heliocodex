"""Makes the link-preview picture for pages that open with a photograph.

Each preview is the page's own opening picture, cut to 1200 x 630, so the credit for it is already on the page.
A picture is used only if its credit names a source whose licence allows cropping and resizing (NASA and other US
agencies, ESO, ESA/Hubble and ESA/Webb, the EHT, ALMA, NOIRLab, or a Creative Commons Attribution or
public-domain notice), and is passed over if it is on the skip list below. Pages without a suitable picture
keep the site card.

Run from the repository root:  python3 scripts/build-share-images.py
Writes public/img/share/*.jpg and src/data/share-images.json, and prints what it used and what it left out.
"""
import glob, html, json, os, re, sys
from PIL import Image

ROOT = os.getcwd()
OUT = 'public/img/share'
W, H = 1200, 630
BG = (7, 8, 13)

ALLOW = re.compile(r'NASA|ESO\b|ESA\b|ESA/|EHT|ALMA|NOIRLab|USGS|U\.?S\.? Geological|NOAA|public domain|CC BY(?!-N)', re.I)
# credits that need more than the licence check: pictures of named people, and the Japanese-agency and processed images we do not reuse
SKIP = re.compile(r'\b(?:ASTER|METI|JAXA|JAROS)\b|Eichst|Alers|Leavitt|Hawking|EUMETSAT|-ND\b|-NC\b')

tones = json.load(open('src/data/image-tones.json'))

def plain(t):
    return html.unescape(re.sub(r'<[^>]+>', '', t)).strip()

def credit_ok(caption):
    t = plain(caption)
    return bool(ALLOW.search(t)) and not SKIP.search(t)

pages = {}   # path -> (source, alt, caption)

# lessons: the first good photograph, as the page itself shows it (see cover() in src/lib/learn/map.ts)
for d in sorted(glob.glob('src/content/lessons/*')):
    lid = os.path.basename(d)
    found = False
    for f in sorted(glob.glob(d + '/*.md')):
        s = open(f, encoding='utf-8').read()
        for m in re.finditer(r'<figure[^>]*>([\s\S]*?)</figure>', s):
            body = m.group(1)
            src = re.search(r'src="(/img/learn/(?!charts/)[^"]+\.(?:jpg|png|webp))"', body)
            if not src or tones.get(src.group(1), 1) < 0.08:
                continue
            alt = re.search(r'alt="([^"]*)"', body)
            cap = re.search(r'<figcaption>([\s\S]*?)</figcaption>', body)
            pages['/learn/' + lid] = (src.group(1), html.unescape(alt.group(1)) if alt else '', cap.group(1) if cap else '')
            found = True
            break
        if found:
            break

# worlds with a written page: the lead picture (the whole world where one is given, else the picture)
wp = open('src/data/world-pages.ts', encoding='utf-8').read()
for m in re.finditer(r"^  ([a-z0-9-]+): \{\n", wp, re.M):
    start = m.end()
    nxt = re.search(r"^  [a-z0-9-]+: \{\n", wp[start:], re.M)
    block = wp[start:start + nxt.start()] if nxt else wp[start:]
    for key in ('globe', 'picture'):
        pm = re.search(key + r": \{\s*src: '([^']+)'[\s\S]*?alt:\s*'((?:[^'\\]|\\.)*)',\s*caption:\s*'((?:[^'\\]|\\.)*)'", block)
        if pm:
            pages['/worlds/' + m.group(1)] = (pm.group(1), pm.group(2).replace("\\'", "'"), pm.group(3).replace("\\'", "'"))
            break

# the planet pages have their own layout: pick the picture each one leads with by hand
PLANETS = {
    '/sun': ('/img/sun/giant-sunspot-2014.jpg', 'The Sun as an orange disc with a large cluster of dark sunspots below the middle.', 'Image: NASA/SDO/HMI.'),
    '/mercury': ('/img/mercury/polar-shadows.jpg', "Mercury's north polar region seen from above, grey and cratered, with shadowed crater floors shaded red.", 'Image: NASA/JHU APL/Carnegie Institution of Washington.'),
    '/venus': ('/img/venus-maat-mons.jpg', 'A computer-generated view across orange lava plains toward the volcano Maat Mons.', 'Image: NASA/JPL.'),
    '/earth': ('/img/earth-blue-marble.jpg', 'The whole Earth against black space, with Africa, white Antarctic ice and swirls of cloud.', 'Image: NASA.'),
    '/saturn': ('/img/saturn/earth-smiled.jpg', 'Saturn seen from its night side as a dark disc, ringed by glowing bands.', 'Image: NASA/JPL-Caltech/Space Science Institute.'),
    '/uranus': ('/img/uranus/voyager-1986.jpg', 'Uranus as a plain, pale blue-green sphere against black space.', 'Image: NASA/JPL-Caltech.'),
    '/neptune': ('/img/neptune/great-dark-spot.jpg', 'Neptune as a deep blue globe with a large dark oval storm left of centre.', 'Image: NASA/JPL.'),
}
pages.update(PLANETS)   # Mars (strips too narrow) and Jupiter (the Great Red Spot picture is not reused) keep the site card

def make(src_path, dest):
    im = Image.open('public' + src_path).convert('RGB')
    w, h = im.size
    # fill the frame if that needs little enlarging and loses less than a third of the picture; otherwise show it whole on the page's dark colour
    cover = max(W / w, H / h)
    kept = min(1.0, (W / cover) * (H / cover) / (w * h))
    # the bars either side take the colour of the picture's own edge when that is dark, so the picture does not sit in a box
    edge = [im.getpixel((x, y)) for x in (0, w - 1) for y in range(0, h, max(1, h // 24))] + [im.getpixel((x, y)) for y in (0, h - 1) for x in range(0, w, max(1, w // 24))]
    mid = tuple(sorted(c[i] for c in edge)[len(edge) // 2] for i in range(3))
    canvas = Image.new('RGB', (W, H), mid if sum(mid) / 3 < 40 else BG)
    if cover <= 1.35 and kept >= 0.62:
        nw, nh = round(w * cover), round(h * cover)
        im = im.resize((nw, nh), Image.LANCZOS)
        x, y = (nw - W) // 2, (nh - H) // 2
        canvas = im.crop((x, y, x + W, y + H))
        mode = 'fill'
    else:
        fit = min(W / w, H / h, 1.35)
        nw, nh = round(w * fit), round(h * fit)
        im = im.resize((nw, nh), Image.LANCZOS)
        canvas.paste(im, ((W - nw) // 2, (H - nh) // 2))
        mode = 'whole'
    canvas.save(dest, 'JPEG', quality=80, optimize=True, progressive=True)
    return mode

os.makedirs(OUT, exist_ok=True)
for f in glob.glob(OUT + '/*.jpg'):
    os.remove(f)
manifest, left = {}, []
for path in sorted(pages):
    src, alt, cap = pages[path]
    if not os.path.exists('public' + src):
        left.append((path, 'missing file ' + src)); continue
    if not credit_ok(cap):
        left.append((path, 'credit not cleared: ' + plain(cap)[-90:])); continue
    if Image.open('public' + src).size[0] < 500:
        left.append((path, 'picture too small')); continue
    name = path.strip('/').replace('/', '-') + '.jpg'
    mode = make(src, os.path.join(OUT, name))
    manifest[path] = {'src': '/img/share/' + name, 'alt': (alt or 'A picture from this page').strip(), 'from': src, 'mode': mode}

with open('src/data/share-images.json', 'w', encoding='utf-8') as fh:
    json.dump(manifest, fh, indent=1, ensure_ascii=False)
    fh.write('\n')
print(len(manifest), 'previews;', sum(1 for v in manifest.values() if v['mode'] == 'fill'), 'filled,', sum(1 for v in manifest.values() if v['mode'] == 'whole'), 'shown whole')
print('left out:')
for p, why in left:
    print(' ', p, '-', why)
