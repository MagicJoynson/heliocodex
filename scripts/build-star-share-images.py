"""Makes the link-preview card for every named star's page.

There is no photograph of most stars, so the card is drawn: the star as a glow in its own colour (from its B-V colour index,
the same colour the page draws), larger for a star that gives out more light, with its name, its constellation and its
distance from the HYG star database. The Transit mark and wordmark come from the site's own share card.

Run from the repository root:  python3 -I scripts/build-star-share-images.py
It builds the star list with rolldown (as the tests do), writes public/img/share/stars/*.jpg, and adds the
stars to src/data/share-images.json (after scripts/build-share-images.py, which rewrites that file).
"""
import glob, json, math, os, subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG = (7, 8, 13)
INK, SOFT, FAINT = (236, 231, 220), (201, 195, 182), (154, 149, 138)
OUT = 'public/img/share/stars'
F = 'node_modules/@fontsource/'
SERIF = F + 'spectral/files/spectral-latin-300-normal.woff2'
SERIF_EXT = F + 'spectral/files/spectral-latin-ext-300-normal.woff2'
MONO = F + 'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'

subprocess.run(['npx', 'rolldown', 'scripts/star-share-list.ts', '--file', 'node_modules/.cache/star-share-list.mjs', '--platform', 'node', '--log-level', 'warn'], check=True, capture_output=True)
stars = json.loads(subprocess.run(['node', 'node_modules/.cache/star-share-list.mjs'], check=True, capture_output=True, text=True).stdout)

# the brand, cut from the site card: the Transit mark and the wordmark, scaled down for the corner
card = Image.open('public/brand/heliocodex-social-card-1200x630.png').convert('RGB')
mark = card.crop((505, 110, 695, 300)).resize((48, 48), Image.LANCZOS)
word = card.crop((285, 370, 915, 480)).resize((158, 28), Image.LANCZOS)

def font(path, size):
    return ImageFont.truetype(path, size)

def fits(text, path):
    f = font(path, 20)
    return all(f.getmask(ch).getbbox() or ch == ' ' for ch in text)

def glow(rgb, lum):
    # the same shape the page draws: a wide soft halo and a bright core, the core a little larger for a brighter star
    size = 560
    im = Image.new('RGB', (size, size), BG)
    px = im.load()
    c = size / 2
    core = size * (0.06 + 0.014 * max(-3, min(5, math.log10(max(lum, 1e-6))))) * 2.6
    for y in range(size):
        for x in range(size):
            r = math.hypot(x - c, y - c)
            halo = max(0.0, 1 - r / (size * 0.5)) ** 2 * 0.55
            k = max(0.0, 1 - r / core) if core > 0 else 0
            white = k ** 3
            a = min(1.0, halo + k ** 1.4)
            col = [BG[i] * (1 - a) + (rgb[i] * (1 - white) + 255 * white) * a for i in range(3)]
            px[x, y] = tuple(int(min(255, v)) for v in col)
    return im.filter(ImageFilter.GaussianBlur(1.2))

os.makedirs(OUT, exist_ok=True)
for f in glob.glob(OUT + '/*.jpg'):
    os.remove(f)
cache = {}
manifest = json.load(open('src/data/share-images.json', encoding='utf-8'))
for s in stars:
    key = (tuple(s['rgb']), round(max(-3, min(5, math.log10(max(s['lum'], 1e-6)))), 1))
    if key not in cache:
        cache[key] = glow(s['rgb'], 10 ** key[1])
    im = Image.new('RGB', (W, H), BG)
    im.paste(cache[key], (W - 560 - 40, (H - 560) // 2))
    d = ImageDraw.Draw(im)
    serif = SERIF if fits(s['name'], SERIF) else SERIF_EXT
    size = 104
    while font(serif, size).getlength(s['name']) > 620 and size > 56:
        size -= 4
    con = s['constellation']
    label = (f'A star in {con}' if con else 'A star').upper()
    d.text((72, 150), label, font=font(MONO if fits(label, MONO) else SERIF_EXT, 26), fill=FAINT)
    d.text((66, 196), s['name'], font=font(serif, size), fill=INK)
    d.text((72, 210 + size + 20), f"{s['ly']} light years away", font=font(SERIF, 40), fill=SOFT)
    im.paste(mark, (72, H - 48 - 56))
    im.paste(word, (72 + 48 + 16, H - 56 - 38))
    name = s['slug'] + '.jpg'
    im.save(os.path.join(OUT, name), 'JPEG', quality=82, optimize=True, progressive=True)
    manifest['/stars/' + s['slug']] = {'src': '/img/share/stars/' + name, 'alt': f"{s['name']}, drawn as a glow in its own colour, {s['ly']} light years away", 'from': 'drawn', 'mode': 'drawn'}

with open('src/data/share-images.json', 'w', encoding='utf-8') as fh:
    json.dump(manifest, fh, indent=1, ensure_ascii=False)
    fh.write('\n')
print(len(stars), 'star cards,', len(cache), 'glows drawn')
