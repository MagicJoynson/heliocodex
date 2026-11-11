"""Cut the data in public/data/deep/ down to what the flat atlas charts draw.

Run after scripts/data/build-deep.py:  python3 scripts/data/build-deep-charts.py
Reads   public/data/deep/stars.bin, stars.json, local-group.json, 2mrs.bin
Writes  src/data/deep/charts.json

Nothing here is new data. Each list is a selection from those files, turned from the engine's
frame into the frame its chart is drawn in, and rounded:

  near    stars within NEAR_LY light years of the Sun
          [x, y, z, absolute magnitude, colour index, name], galactic frame, light years
  sky     stars of apparent magnitude SKY_MAG or brighter as seen from the Sun (the naked-eye stars)
          [x, y, z], galactic frame, whole light years, plus the named ones in `skyNamed`
  group   the galaxies of McConnachie 2012: [x, y, z, absolute V magnitude or null, name], galactic frame, kpc
  web     2MRS galaxies within WEB_SLAB_MPC of the supergalactic plane and WEB_MPC of us
          [x, y], supergalactic frame, units of 0.1 Mpc
  clusters  the clusters the 3D view names (the same list as CLUSTERS in src/lib/v2/engine/deep.ts)
          [x, y, z, name], supergalactic frame, Mpc

Galactic frame: x towards the centre of the Milky Way, y the way the Sun is going, z north.
Supergalactic frame: de Vaucouleurs et al. 1991 (RC3): pole at l 47.37, b 6.32; x towards l 137.37, b 0.
"""
import json, math, struct

NEAR_LY, SKY_MAG, WEB_MPC, WEB_SLAB_MPC = 20.0, 6.0, 310.0, 20.0
H0 = 70.0  # km/s/Mpc, as scripts/data/build-deep.py
LY_PER_PC = 3.0856775814913673e16 / 9.4607304725808e15

# the galactic axes in the engine's frame, as in src/lib/v2/engine/deep.ts
GAL_X = (-0.0548757, -0.0964767, 0.9938214)
GAL_Y = (0.4941094, 0.8622859, 0.1109908)
GAL_Z = (-0.8676661, 0.4971472, 0.0003515)
dot = lambda a, b: a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
gal = lambda p: (dot(p, GAL_X), dot(p, GAL_Y), dot(p, GAL_Z))


def lb(l, b):
    l, b = math.radians(l), math.radians(b)
    return (math.cos(b) * math.cos(l), math.cos(b) * math.sin(l), math.sin(b))


SG_Z, SG_X = lb(47.37, 6.32), lb(137.37, 0.0)
SG_Y = (SG_Z[1] * SG_X[2] - SG_Z[2] * SG_X[1], SG_Z[2] * SG_X[0] - SG_Z[0] * SG_X[2], SG_Z[0] * SG_X[1] - SG_Z[1] * SG_X[0])

d = 'public/data/deep/'
raw = open(d + 'stars.bin', 'rb').read()
names = dict(json.load(open(d + 'stars.json')))
near, sky, sky_named = [], [], []
for i in range(len(raw) // 20):
    x, y, z, absmag, ci = struct.unpack_from('<5f', raw, i * 20)
    pc = math.sqrt(x * x + y * y + z * z)
    g = [v * LY_PER_PC for v in gal((x, y, z))]
    if pc * LY_PER_PC <= NEAR_LY:
        near.append([round(g[0], 2), round(g[1], 2), round(g[2], 2), round(absmag, 2), round(ci, 2), names.get(i, '')])
    app = absmag + 5 * math.log10(pc / 10)
    if app <= SKY_MAG:
        row = [round(g[0]), round(g[1]), round(g[2])]
        sky.append(row)
        if i in names:
            sky_named.append(row + [round(app, 2), names[i]])
near.sort(key=lambda s: s[0] ** 2 + s[1] ** 2 + s[2] ** 2)

group = []
for g in json.load(open(d + 'local-group.json'))['galaxies']:
    x, y, z = gal(g['p'])
    group.append([round(x / 1000, 1), round(y / 1000, 1), round(z / 1000, 1), g.get('mv'), g['name']])

raw = open(d + '2mrs.bin', 'rb').read()
web, total = [], len(raw) // 16
for i in range(total):
    x, y, z, _ = struct.unpack_from('<4f', raw, i * 16)
    g = gal((x, y, z))
    sx, sy, sz = dot(g, SG_X) / 1e6, dot(g, SG_Y) / 1e6, dot(g, SG_Z) / 1e6
    if abs(sz) <= WEB_SLAB_MPC and math.hypot(sx, sy) <= WEB_MPC:
        web.append([round(sx * 10), round(sy * 10)])

EPS = math.radians(23.4392911)
def radec_engine(ra, dec):
    a, b = math.radians(ra), math.radians(dec)
    x, y, z = math.cos(b) * math.cos(a), math.cos(b) * math.sin(a), math.sin(b)
    return (x, -y * math.sin(EPS) + z * math.cos(EPS), -(y * math.cos(EPS) + z * math.sin(EPS)))

CLUSTERS = [('Virgo Cluster', 187.7, 12.39, 1100), ('Fornax Cluster', 54.62, -35.45, 1379), ('Centaurus Cluster', 192.2, -41.31, 3418),
            ('Hydra Cluster', 159.17, -27.53, 3777), ('Norma Cluster', 243.59, -60.91, 4871), ('Perseus Cluster', 49.95, 41.51, 5366),
            ('Coma Cluster', 194.95, 27.98, 6925), ('Shapley Supercluster', 201.98, -31.5, 14500)]
clusters = []
for name, ra, dec, cz in CLUSTERS:
    g = gal(radec_engine(ra, dec))
    r = cz / H0
    clusters.append([round(dot(g, SG_X) * r, 1), round(dot(g, SG_Y) * r, 1), round(dot(g, SG_Z) * r, 1), name])

out = {
    'nearLy': NEAR_LY, 'skyMag': SKY_MAG, 'webMpc': WEB_MPC, 'webSlabMpc': WEB_SLAB_MPC,
    'h0': H0, 'webAll': total,
    'near': near, 'sky': sky, 'skyNamed': sky_named, 'group': group, 'web': web, 'clusters': clusters,
}
json.dump(out, open('src/data/deep/charts.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(near), 'near,', len(sky), 'sky,', len(sky_named), 'named,', len(group), 'group,', len(web), 'web of', total)
