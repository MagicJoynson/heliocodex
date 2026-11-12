"""Writes src/data/image-tones.json: how bright the middle of each picture in public/img/learn is,
as the share of it that is not near-black, from 0 to 1. Index pages use it to avoid picking a mostly black photograph as a
lesson's small picture. Run it again after adding pictures: python3 scripts/image-tones.py"""
import json, pathlib
from PIL import Image

root = pathlib.Path(__file__).resolve().parent.parent
out = {}
for f in sorted((root / 'public/img/learn').glob('*')):
    if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
        continue
    im = Image.open(f).convert('L')
    w, h = im.size
    # the part a 16:10 card shows when the picture is cropped to fill it
    cw, ch = (w, min(h, round(w * 10 / 16))) if h * 16 >= w * 10 else (min(w, round(h * 16 / 10)), h)
    box = ((w - cw) // 2, (h - ch) // 2, (w + cw) // 2, (h + ch) // 2)
    small = im.crop(box).resize((160, 100))
    lit = sum(1 for p in small.tobytes() if p > 45) / (160 * 100)
    out['/img/learn/' + f.name] = round(lit, 3)
(root / 'src/data/image-tones.json').write_text(json.dumps(out, indent=0) + '\n')
print(len(out), 'pictures')
