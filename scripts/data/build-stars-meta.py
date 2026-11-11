"""Build public/data/deep/stars-meta.json: details of the brighter stars, for the sky map and the star pages.

Run after build-deep.py, from the same folder of sources:
  python3 scripts/data/build-stars-meta.py <folder holding hyg_v44.csv.gz>

It repeats build-deep.py's filter and sort exactly, so each record's index is the star's index in
stars.bin (and in the 3D view's 'star:<n>' targets). It checks that against stars.bin and stops if
they differ.

Kept: every star brighter than magnitude 6.5 as seen from the Earth, and every named star.
Each record: [index, proper name, catalogue name, HIP, HD, constellation (IAU abbreviation),
spectral type, distance in parsecs, apparent magnitude, absolute magnitude, colour index B-V,
luminosity in Suns]. Missing values are null.
Source: HYG v4.4, D. Nash (astronexus), CC BY-SA 4.0.
"""
import csv, gzip, importlib.util, json, math, os, struct, sys

src = sys.argv[1] if len(sys.argv) > 1 else '.'
here = os.path.dirname(os.path.abspath(__file__))
# borrow build-deep.py's names and frame without running it
code = open(os.path.join(here, 'build-deep.py'), encoding='utf-8').read().split('# ---- stars')[1].split('rows = []')[0]
ns = {'math': math}
exec(code, ns)
catalogue_name = ns['catalogue_name']

def num(s):
    try:
        return float(s)
    except ValueError:
        return None

rows = []
with gzip.open(os.path.join(src, 'hyg_v44.csv.gz'), 'rt') as f:
    for r in csv.DictReader(f):
        if r['id'] == '0':
            continue
        dist, absmag = num(r['dist']), num(r['absmag'])
        if dist is None or absmag is None or not (0 < dist < 5000):
            continue
        app = absmag + 5 * math.log10(dist / 10)
        rows.append((app, r, dist, absmag))
rows.sort(key=lambda s: s[0])

# the same order as stars.bin, or nothing
binf = open('public/data/deep/stars.bin', 'rb').read()
assert len(binf) // 20 == len(rows), (len(binf) // 20, len(rows))
for i in (0, 1, 100, len(rows) // 2, len(rows) - 1):
    assert abs(struct.unpack_from('<5f', binf, i * 20)[3] - rows[i][3]) < 1e-3, i

out = []
for i, (app, r, dist, absmag) in enumerate(rows):
    proper = r['proper'].strip() or None
    if app >= 6.5 and not proper:
        continue
    hip, hd = r['hip'].strip(), r['hd'].strip()
    lum = num(r['lum'])
    ci = num(r['ci'])
    out.append([i, proper, catalogue_name(r) or None, int(hip) if hip else None, int(hd) if hd else None,
                r['con'].strip() or None, r['spect'].strip() or None, round(dist, 3), round(app, 2), round(absmag, 2),
                round(ci, 3) if ci is not None else None, float(f'{lum:.4g}') if lum else None])
json.dump({'source': 'HYG v4.4, D. Nash (astronexus), CC BY-SA 4.0, https://codeberg.org/astronexus/hyg',
           'fields': ['index', 'proper', 'catalogue', 'hip', 'hd', 'con', 'spect', 'distPc', 'appMag', 'absMag', 'bv', 'lumSun'],
           'stars': out}, open('public/data/deep/stars-meta.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(out), 'stars written')
