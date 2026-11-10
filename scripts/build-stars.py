"""Build public/data/stars.bin from the Yale Bright Star Catalogue (5th ed., BSC5P via NASA HEASARC).

Download first:
  curl -LO https://heasarc.gsfc.nasa.gov/FTP/heasarc/dbase/tdat_files/heasarc_bsc5p.tdat.gz && gunzip heasarc_bsc5p.tdat.gz
  python3 scripts/build-stars.py heasarc_bsc5p.tdat

Output: little-endian float32 records [x, y, z, vmag, b_minus_v], unit vectors in ecliptic J2000
coordinates with y towards the north ecliptic pole (the same frame as the solar-system scene).
"""
import math, struct, sys

src = sys.argv[1] if len(sys.argv) > 1 else 'heasarc_bsc5p.tdat'
lines = open(src, encoding='latin-1').read().splitlines()
fields = None
for l in lines:
    if l.startswith('line[1]'):
        fields = l.split('=', 1)[1].split()
start = lines.index('<DATA>') + 1
eps = math.radians(23.4392911)
out = []
for l in lines[start:]:
    if l.startswith('<END>') or not l.strip():
        continue
    v = dict(zip(fields, l.split('|')))
    try:
        ra, dec, mag = float(v['ra']), float(v['dec']), float(v['vmag'])
    except ValueError:
        continue
    try:
        bv = float(v['bv_color'])
    except ValueError:
        bv = 0.6
    a, d = math.radians(ra), math.radians(dec)
    xe, ye, ze = math.cos(d) * math.cos(a), math.cos(d) * math.sin(a), math.sin(d)
    # equatorial -> ecliptic
    xl = xe
    yl = ye * math.cos(eps) + ze * math.sin(eps)
    zl = -ye * math.sin(eps) + ze * math.cos(eps)
    # scene frame: x = xl, y = zl (north ecliptic pole up), z = -yl
    out.append((xl, zl, -yl, mag, bv))
out.sort(key=lambda s: s[3])
with open('public/data/stars.bin', 'wb') as f:
    for s in out:
        f.write(struct.pack('<5f', *s))
print(len(out), 'stars, brightest', out[0][3], 'faintest', out[-1][3])
