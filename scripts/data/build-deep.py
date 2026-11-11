"""Build the data for everything beyond the Solar System, for the 3D view.

Sources (download first, into one folder, then run: python3 scripts/data/build-deep.py <folder>):
  hyg_v44.csv.gz   HYG star database v4.4, D. Nash (astronexus), CC BY-SA 4.0
                   https://codeberg.org/astronexus/hyg  (Hipparcos, Yale, Gliese; distances from parallax)
  lg.tsv           McConnachie 2012, AJ 144, 4: galaxies in and around the Local Group (VizieR J/AJ/144/4/catalog)
                   asu-tsv, columns Name,MType,RAJ2000,DEJ2000,D,VMag,R1,PA,Ell
  2mrs.tsv         Huchra et al. 2012, ApJS 199, 26: the 2MASS Redshift Survey (VizieR J/ApJS/199/26/table3)
                   asu-tsv, columns RAJ2000,DEJ2000,Ktmag,cz,b/a
  ilc.fits         WMAP 9-year Internal Linear Combination map (NASA / WMAP Science Team, LAMBDA), public domain
                   https://lambda.gsfc.nasa.gov/data/map/dr5/dfp/ilc/wmap_ilc_9yr_v5.fits

Every position is written in the engine's frame (y towards the north ecliptic pole, as
scripts/build-stars.py), in parsecs from the Sun.

Outputs:
  public/data/deep/stars.bin     float32 [x, y, z, absmag, colour index B-V] per star
  public/data/deep/stars.json    names for the labels: [[index, name], ...]
  public/data/deep/local-group.json
  public/data/deep/2mrs.bin      float32 [x, y, z, absolute Ks magnitude] per galaxy
  public/textures/cmb_wmap9.webp the WMAP map baked onto the engine's sphere (three.js SphereGeometry UVs)
"""
import csv, gzip, json, math, os, struct, sys

import numpy as np

src = sys.argv[1] if len(sys.argv) > 1 else '.'
out = 'public/data/deep'
os.makedirs(out, exist_ok=True)
eps = math.radians(23.4392911)
ce, se = math.cos(eps), math.sin(eps)


def eq_to_engine(x, y, z):
    """equatorial (x to the March equinox, z to the north celestial pole) to the engine's frame"""
    xl = x
    yl = y * ce + z * se
    zl = -y * se + z * ce
    return xl, zl, -yl


def radec(ra_deg, dec_deg, d=1.0):
    a, b = math.radians(ra_deg), math.radians(dec_deg)
    return eq_to_engine(d * math.cos(b) * math.cos(a), d * math.cos(b) * math.sin(a), d * math.sin(b))


# ---- stars
# Stars near the Sun with no proper name get their Bayer or Flamsteed name, spelt out (Tau Ceti, 61 Cygni)
GREEK = dict(Alp='Alpha', Bet='Beta', Gam='Gamma', Del='Delta', Eps='Epsilon', Zet='Zeta', Eta='Eta', The='Theta', Iot='Iota', Kap='Kappa', Lam='Lambda', Mu='Mu', Nu='Nu', Xi='Xi', Omi='Omicron', Pi='Pi', Rho='Rho', Sig='Sigma', Tau='Tau', Ups='Upsilon', Phi='Phi', Chi='Chi', Psi='Psi', Ome='Omega')
GEN = dict(And='Andromedae', Ant='Antliae', Aps='Apodis', Aqr='Aquarii', Aql='Aquilae', Ara='Arae', Ari='Arietis', Aur='Aurigae', Boo='Boötis', Cae='Caeli', Cam='Camelopardalis', Cnc='Cancri', CVn='Canum Venaticorum', CMa='Canis Majoris', CMi='Canis Minoris', Cap='Capricorni', Car='Carinae', Cas='Cassiopeiae', Cen='Centauri', Cep='Cephei', Cet='Ceti', Cha='Chamaeleontis', Cir='Circini', Col='Columbae', Com='Comae Berenices', CrA='Coronae Australis', CrB='Coronae Borealis', Crv='Corvi', Crt='Crateris', Cru='Crucis', Cyg='Cygni', Del='Delphini', Dor='Doradus', Dra='Draconis', Equ='Equulei', Eri='Eridani', For='Fornacis', Gem='Geminorum', Gru='Gruis', Her='Herculis', Hor='Horologii', Hya='Hydrae', Hyi='Hydri', Ind='Indi', Lac='Lacertae', Leo='Leonis', LMi='Leonis Minoris', Lep='Leporis', Lib='Librae', Lup='Lupi', Lyn='Lyncis', Lyr='Lyrae', Men='Mensae', Mic='Microscopii', Mon='Monocerotis', Mus='Muscae', Nor='Normae', Oct='Octantis', Oph='Ophiuchi', Ori='Orionis', Pav='Pavonis', Peg='Pegasi', Per='Persei', Phe='Phoenicis', Pic='Pictoris', Psc='Piscium', PsA='Piscis Austrini', Pup='Puppis', Pyx='Pyxidis', Ret='Reticuli', Sge='Sagittae', Sgr='Sagittarii', Sco='Scorpii', Scl='Sculptoris', Sct='Scuti', Ser='Serpentis', Sex='Sextantis', Tau='Tauri', Tel='Telescopii', Tri='Trianguli', TrA='Trianguli Australis', Tuc='Tucanae', UMa='Ursae Majoris', UMi='Ursae Minoris', Vel='Velorum', Vir='Virginis', Vol='Volantis', Vul='Vulpeculae')


def catalogue_name(r):
    con = GEN.get(r['con'].strip())
    if not con:
        return ''
    b = r['bayer'].strip()
    if b:
        g = GREEK.get(b.split('-')[0])
        if g:
            return f"{g}{'-' + b.split('-')[1] if '-' in b else ''} {con}"
    if r['flam'].strip():
        return f"{r['flam'].strip()} {con}"
    return ''


rows = []
names = []
with gzip.open(os.path.join(src, 'hyg_v44.csv.gz'), 'rt') as f:
    for r in csv.DictReader(f):
        if r['id'] == '0':
            continue  # the Sun is drawn by the engine itself
        try:
            dist = float(r['dist'])
            absmag = float(r['absmag'])
        except ValueError:
            continue
        # 100000 marks "no parallax"; beyond a few thousand parsecs Hipparcos parallaxes mean little
        if not (0 < dist < 5000):
            continue
        try:
            ci = float(r['ci'])
        except ValueError:
            ci = 0.6
        x, y, z = eq_to_engine(float(r['x']), float(r['y']), float(r['z']))
        app = absmag + 5 * math.log10(dist / 10)
        name = r['proper'].strip() or (catalogue_name(r) if dist < 7.7 else '')  # within 25 light years
        rows.append((app, x, y, z, absmag, ci, name))
rows.sort(key=lambda s: s[0])
with open(os.path.join(out, 'stars.bin'), 'wb') as f:
    for i, s in enumerate(rows):
        f.write(struct.pack('<5f', s[1], s[2], s[3], s[4], s[5]))
        if s[6]:
            names.append([i, s[6]])
json.dump(names, open(os.path.join(out, 'stars.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(rows), 'stars,', len(names), 'named')


def tsv(path):
    lines = [l for l in open(path, encoding='utf-8') if not l.startswith('#') and l.strip()]
    head = lines[0].rstrip('\n').split('\t')
    return [dict(zip(head, [c.strip() for c in l.rstrip('\n').split('\t')])) for l in lines[3:]]


def hms(s):
    h, m, x = (float(v) for v in s.split())
    return 15 * (h + m / 60 + x / 3600)


def dms(s):
    sign = -1 if s.strip().startswith('-') else 1
    d, m, x = (abs(float(v)) for v in s.split())
    return sign * (d + m / 60 + x / 3600)


# ---- the Local Group
lg = []
for r in tsv(os.path.join(src, 'lg.tsv')):
    if not r['D'] or not r['RAJ2000']:
        continue  # the Milky Way itself: the engine draws it as a model
    d = float(r['D']) * 1000  # pc
    ra, dec = hms(r['RAJ2000']), dms(r['DEJ2000'])
    x, y, z = radec(ra, dec, d)
    e = {'name': r['Name'], 'type': r['MType'].strip('? ') or None, 'p': [round(x, 1), round(y, 1), round(z, 1)],
         'ra': round(ra, 4), 'dec': round(dec, 4), 'kpc': float(r['D'])}
    if r['VMag']:
        e['mv'] = float(r['VMag'])
    if r['R1']:
        e['rh'] = round(d * math.radians(float(r['R1']) / 60), 1)  # half-light radius, pc
    if r['PA']:
        e['pa'] = float(r['PA'])
    if r['Ell']:
        e['ell'] = float(r['Ell'])
    lg.append(e)
json.dump({'source': 'McConnachie 2012, AJ 144, 4 (VizieR J/AJ/144/4)', 'galaxies': lg},
          open(os.path.join(out, 'local-group.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(lg), 'Local Group galaxies')

# ---- 2MRS: distance from redshift, d = cz / H0
H0 = 70.0
n = 0
with open(os.path.join(out, '2mrs.bin'), 'wb') as f:
    for r in tsv(os.path.join(src, '2mrs.tsv')):
        if not r['cz']:
            continue
        cz = float(r['cz'])
        # below a few hundred km/s, motions swamp the expansion and the Local Group catalogue takes over
        if cz < 400:
            continue
        d = cz / H0 * 1e6  # pc
        x, y, z = radec(float(r['RAJ2000']), float(r['DEJ2000']), d)
        mk = float(r['Ktmag']) - 5 * math.log10(d / 10)
        f.write(struct.pack('<4f', x, y, z, mk))
        n += 1
print(n, '2MRS galaxies')

# ---- the CMB, on the engine's sphere
import healpy as hp
m = hp.read_map(os.path.join(src, 'ilc.fits'), verbose=False) if 'verbose' in hp.read_map.__code__.co_varnames else hp.read_map(os.path.join(src, 'ilc.fits'))
W, H = 2048, 1024
phi = (np.arange(W) + 0.5) / W * 2 * np.pi
th = (np.arange(H) + 0.5) / H * np.pi
PH, TH = np.meshgrid(phi, th)
# three.js SphereGeometry: x = -cos(phi) sin(theta), y = cos(theta), z = sin(phi) sin(theta)
ex, ey, ez = -np.cos(PH) * np.sin(TH), np.cos(TH), np.sin(PH) * np.sin(TH)
# engine -> ecliptic -> equatorial
xl, yl, zl = ex, -ez, ey
xq, yq, zq = xl, yl * ce - zl * se, yl * se + zl * ce
rot = hp.Rotator(coord=['C', 'G'])
vg = rot(np.array([xq.ravel(), yq.ravel(), zq.ravel()]))
pix = hp.vec2pix(hp.get_nside(m), vg[0], vg[1], vg[2])
t = m[pix].reshape(H, W) * 1000  # microkelvin
print('CMB range', t.min(), t.max(), 'sd', t.std())
u = np.clip(t / 250, -1, 1)
# a diverging scale of our own: deep blue, through a dim neutral, to warm amber
c_lo, c_mid, c_hi = np.array([0.10, 0.22, 0.55]), np.array([0.30, 0.28, 0.26]), np.array([1.0, 0.62, 0.22])
k = np.abs(u)[..., None] ** 0.8
img = np.where(u[..., None] < 0, c_mid + (c_lo - c_mid) * k, c_mid + (c_hi - c_mid) * k)
from PIL import Image
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save('public/textures/cmb_wmap9.webp', quality=88)
print('CMB texture written')
