"""Draw public/img/learn/cosmic-web-map-sdss.jpg from the SDSS DR18 sample in public/data/deep/sdss.bin.
A slice 100 Mpc thick about the plane of the celestial equator, seen from the north, out to 600 Mpc. Run: python3 scripts/data/draw-cosmic-web-map.py"""
import json, math, struct
from PIL import Image, ImageDraw, ImageFont

EPS = math.radians(23.4392911); CE, SE = math.cos(EPS), math.sin(EPS)
SLAB, MAXR, N = 50.0, 600.0, 1400
raw = open('public/data/deep/sdss.bin', 'rb').read()
img = Image.new('RGB', (N, N), (4, 4, 6)); dr = ImageDraw.Draw(img, 'RGBA')
c = N / 2; k = (N / 2 - 70) / MAXR
fnt = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', s)
for r in (100, 200, 300, 400, 500, 600):
    dr.ellipse([c - r * k, c - r * k, c + r * k, c + r * k], outline=(60, 60, 70, 255), width=1)
    ly = r * 3.2616
    dr.text((c + 6, c + r * k + 3), f'{ly / 1000:.2f} billion light years' if ly >= 1000 else f'{round(ly)} million light years', font=fnt(15), fill=(150, 146, 138, 255))
n = 0
for i in range(len(raw) // 16):
    x, y, z, _ = struct.unpack_from('<4f', raw, i * 16)
    ex, ey, ez = (v / 1e6 for v in (x, -SE * y - CE * z, CE * y - SE * z))
    if abs(ez) > SLAB or math.hypot(ex, ey) > MAXR:
        continue
    px, py = c + ex * k, c - ey * k
    dr.ellipse([px - 1.6, py - 1.6, px + 1.6, py + 1.6], fill=(236, 214, 178, 190)); n += 1
dr.ellipse([c - 7, c - 7, c + 7, c + 7], outline=(241, 201, 138, 255), width=2)
dr.text((c + 14, c + 8), 'We are here', font=fnt(20), fill=(241, 201, 138, 255))
dr.text((24, 20), 'Galaxies measured by the Sloan Digital Sky Survey (DR18)', font=fnt(22), fill=(236, 231, 220, 255))
dr.text((24, 50), 'Only part of the sky was surveyed: the empty areas are unmapped, not empty space', font=fnt(17), fill=(185, 178, 165, 255))
for name, ra, dec, cz in (('Coma Cluster', 194.95, 27.98, 6925),):
    a, b = math.radians(ra), math.radians(dec); r = cz / 70
    ex, ey = r * math.cos(b) * math.cos(a), r * (math.cos(b) * math.sin(a) * CE + math.sin(b) * SE)
    px, py = c + ex * k, c - ey * k
    dr.ellipse([px - 16, py - 16, px + 16, py + 16], outline=(241, 201, 138, 255), width=2)
    dr.line([px - 12, py - 12, px - 60, py - 70], fill=(241, 201, 138, 255), width=1)
    dr.text((px - 180, py - 98), name, font=fnt(18), fill=(241, 201, 138, 255))
img.save('public/img/learn/cosmic-web-map-sdss.jpg', quality=88)
print(n, 'galaxies drawn')
