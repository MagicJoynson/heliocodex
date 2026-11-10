"""Build the line figures of the 88 constellations, as pairs of rows in public/data/deep/stars.bin.

Sources (download into one folder, then run: python3 -I scripts/data/build-constellations.py <folder>):
  hyg_v44.csv.gz             HYG star database v4.4, D. Nash (astronexus), CC BY-SA 4.0, as scripts/data/build-deep.py
  constellations.lines.json  d3-celestial, Olaf Frohn, BSD 3-Clause
  constellations.json        the same, for the names
                             https://github.com/ofrohn/d3-celestial/tree/master/data

The line file gives each figure as runs of points on the sky (right ascension as a longitude from
-180 to 180 degrees, then declination). It names no stars, so each point is matched to the nearest
star of magnitude 7 or brighter in the catalogue, within MAX_SEP degrees (the brighter part of a close double). The star's row is its place
in stars.bin: the catalogue is filtered and sorted here exactly as build-deep.py does it, and the
result is checked against stars.bin before anything is written.

Output:
  public/data/deep/constellations.json   [{ id: "Ori", name: "Orion", lines: [[i, j], ...] }, ...]

Points with no star close enough, and stars the catalogue holds but stars.bin leaves out (no usable
distance), are printed. A line with such an end is dropped.
"""
import csv, gzip, json, math, os, struct, sys

src = sys.argv[1] if len(sys.argv) > 1 else '.'
out = 'public/data/deep'
MAX_SEP = 0.05    # degrees: the line file's points are star positions, so a true match is far closer than this
SAME_STAR = 0.02  # degrees: catalogue entries this close together are taken as parts of one star
MAG_LIMIT = 7.0

# ---- the catalogue, in the order of stars.bin (see build-deep.py)
kept, left_out = [], []
with gzip.open(os.path.join(src, 'hyg_v44.csv.gz'), 'rt') as f:
    for r in csv.DictReader(f):
        if r['id'] == '0':
            continue
        try:
            dist, absmag = float(r['dist']), float(r['absmag'])
        except ValueError:
            left_out.append(r)
            continue
        if not (0 < dist < 5000):
            left_out.append(r)
            continue
        kept.append((absmag + 5 * math.log10(dist / 10), r))
kept.sort(key=lambda s: s[0])

blob = open(os.path.join(out, 'stars.bin'), 'rb').read()
assert len(blob) == 20 * len(kept), f'stars.bin holds {len(blob) // 20} stars, the catalogue gives {len(kept)}: rebuild stars.bin first'
for i in range(0, len(kept), 997):
    assert abs(struct.unpack_from('<5f', blob, i * 20)[3] - float(kept[i][1]['absmag'])) < 1e-3, f'row {i} of stars.bin is not the same star'


def unit(ra_deg, dec_deg):
    a, d = math.radians(ra_deg), math.radians(dec_deg)
    return (math.cos(d) * math.cos(a), math.cos(d) * math.sin(a), math.sin(d))


def bright(rows):
    for i, r in rows:
        try:
            if float(r['mag']) <= MAG_LIMIT:
                yield i, r, unit(float(r['ra']) * 15, float(r['dec']))
        except ValueError:
            pass


pool = list(bright((i, r) for i, (_, r) in enumerate(kept))) + list(bright((-1, r) for r in left_out))


def nearest(p):
    """The catalogue star a point of the line file stands for: (row or -1, catalogue line, separation in degrees)."""
    near = []
    for i, r, u in pool:
        dot = p[0] * u[0] + p[1] * u[1] + p[2] * u[2]
        if dot > 0.9999:
            s = math.degrees(math.acos(min(1.0, dot)))
            if s < MAX_SEP:
                near.append((s, float(r['mag']), i, r))
    if not near:
        return None
    near.sort(key=lambda n: n[0])
    best = near[0]
    # the catalogue lists the parts of a close double separately: draw through the brighter part
    for n in near[1:]:
        if n[0] - best[0] < SAME_STAR and n[1] < best[1]:
            best = n
    return best[2], best[3], best[0]


def label(r):
    return r['proper'].strip() or (' '.join(r['bf'].split()) if r['bf'].strip() else f"HIP {r['hip']}" if r['hip'] else f"HYG {r['id']}")


NAMES_FIX = {'Ser': 'Serpens'}
names = {f['id']: f['properties']['name'] for f in json.load(open(os.path.join(src, 'constellations.json'), encoding='utf-8'))['features']}
figures, problems, widest, dropped = {}, set(), 0.0, 0
for f in json.load(open(os.path.join(src, 'constellations.lines.json'), encoding='utf-8'))['features']:
    cid = f['id']
    # Serpens comes as two features, its head and its tail: one constellation, so one entry
    fig = figures.setdefault(cid, {'id': cid, 'name': NAMES_FIX.get(cid, names[cid]), 'lines': []})
    lines, seen = fig['lines'], {(min(a, b), max(a, b)) for a, b in fig['lines']}
    for run in f['geometry']['coordinates']:
        rows = []
        for lon, dec in run:
            p = unit(lon % 360, dec)
            hit = nearest(p)
            if hit is None or hit[0] < 0:
                problems.add(f"{cid}: point at RA {lon % 360:.3f} Dec {dec:.3f} " + (f"is {label(hit[1])}, which stars.bin leaves out" if hit else f'has no star within {MAX_SEP} degrees'))
                rows.append(None)
            else:
                widest = max(widest, hit[2])
                rows.append(hit[0])
        for a, b in zip(rows, rows[1:]):
            if a is None or b is None:
                dropped += 1
                continue
            if a == b:
                continue
            key = (min(a, b), max(a, b))
            if key not in seen:
                seen.add(key)
                lines.append([a, b])
figures = sorted(figures.values(), key=lambda c: c['name'])
json.dump(figures, open(os.path.join(out, 'constellations.json'), 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)
for p in sorted(problems):
    print(p)
print(f"{len(figures)} constellations, {sum(len(c['lines']) for c in figures)} lines, {len({i for c in figures for l in c['lines'] for i in l})} stars; "
      f"widest match {widest:.3f} degrees; {len(problems)} points not matched, {dropped} lines dropped")
