#!/usr/bin/env python3
"""Build src/data/bodies/moons.json and dwarfs.json from NASA/JPL Solar System Dynamics.

Moons: the three public tables at ssd.jpl.nasa.gov/sats (mean orbital elements,
physical parameters, discovery circumstances). Dwarf planets: the Small-Body
Database API. Everything is fetched live; the output is committed, so the site
build needs no network.

Usage: python3 -I scripts/data/build-bodies.py

After running this, run scripts/data/fit-moon-orbits.py: the JPL table gives each moon's orbit its
size and shape, and that script works out where along it the moon is, from JPL Horizons.
"""
import html, json, re, sys, urllib.request, datetime, pathlib

OUT = pathlib.Path(__file__).resolve().parents[2] / "src" / "data" / "bodies"
ELEM = "https://ssd.jpl.nasa.gov/sats/elem/"
PHYS = "https://ssd.jpl.nasa.gov/sats/phys_par/"
DISC = "https://ssd.jpl.nasa.gov/sats/discovery.html"
SBDB = "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr={}&phys-par=1&full-prec=1"

# IAU dwarf planets first, then the strongest candidates. "recognised" is the IAU's
# own list of five; the rest are widely treated as dwarf planets but not named so by the IAU.
DWARFS = [
    ("1", "ceres", "Ceres", True), ("134340", "pluto", "Pluto", True),
    ("136199", "eris", "Eris", True), ("136108", "haumea", "Haumea", True),
    ("136472", "makemake", "Makemake", True), ("225088", "gonggong", "Gonggong", False),
    ("50000", "quaoar", "Quaoar", False), ("90377", "sedna", "Sedna", False),
    ("90482", "orcus", "Orcus", False),
]

# JPL's table shortens two names; the IAU spellings are used here.
NAME_FIXES = {"Magaclite": "Megaclite", "Philophrosyn": "Philophrosyne"}

# Sizes the Small-Body Database does not carry, from the papers that measured them.
DWARF_RADII = {
    "pluto": (1188.3, "Nimmo et al. 2017, Icarus 287, 12 (New Horizons)", "https://doi.org/10.1016/j.icarus.2016.06.027"),
    "eris": (1163.0, "Sicardy et al. 2011, Nature 478, 493 (stellar occultation)", "https://doi.org/10.1038/nature10550"),
}

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "heliocodex-build"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")

def rows(page):
    out = []
    for r in re.findall(r"<tr[^>]*>(.*?)</tr>", page, re.S):
        cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, re.S)
        out.append([re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", c))).strip() for c in cells])
    return out

def num(s):
    s = s.strip().rstrip(".") if s.strip().endswith(".") else s.strip()
    try:
        return float(s)
    except ValueError:
        return None

def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def jd(date):  # "2000-01-01.5" -> Julian date (TDB)
    y, m, d = date.split("-")
    whole = datetime.date(int(y), int(m), int(float(d)))
    return whole.toordinal() + 1721424.5 + (float(d) % 1)

def moons():
    elem = [r for r in rows(get(ELEM)) if len(r) == 20 and r[0].isdigit()]
    phys = {r[2]: r for r in rows(get(PHYS)) if len(r) >= 6 and r[2].isdigit()}
    disc, planet = {}, None
    for r in rows(get(DISC)):
        if len(r) == 1 and r[0].startswith("Satellites of"):
            planet = r[0].split(":")[0].replace("Satellites of", "").replace("Dwarf Planet", "").strip()
        elif len(r) == 6 and planet and r[3][:4].isdigit():
            for key in (r[1], r[2]):
                if key:
                    disc[(planet, re.sub(r"[^a-z0-9]", "", key.lower()))] = r
    frames = {"ecliptic": "ecliptic-j2000", "Laplace": "laplace", "equatorial": "parent-equator"}
    out, seen = [], set()
    for r in elem:
        _, parent, name, code, eph, frame, epoch, a, e, w, M, i, node, P, Pap, Pnode, ra, dec, tilt, _ref = r
        if code in seen:
            continue
        seen.add(code)
        display = NAME_FIXES.get(name, name).replace("_", " ")
        m = re.fullmatch(r"S(\d{4}) ([JSUN]) ?(\d+)", display)
        if m:
            display = f"S/{m.group(1)} {m.group(2)} {m.group(3)}"
        d = disc.get((parent, re.sub(r"[^a-z0-9]", "", display.lower())))
        orbit = {
            "type": "kepler", "frame": frames[frame], "epochJd": jd(epoch),
            "aKm": num(a), "e": num(e), "iDeg": num(i), "nodeDeg": num(node),
            "periDeg": num(w), "mDeg": num(M), "periodDays": abs(num(P)),
        }
        if num(P) < 0 or (num(i) or 0) > 90:
            orbit["retrograde"] = True
        if num(Pap):
            orbit["apsisPrecessionYears"] = num(Pap)
        if num(Pnode):
            orbit["nodePrecessionYears"] = num(Pnode)
        if frame == "Laplace" and num(ra) is not None:
            orbit["framePole"] = {"raDeg": num(ra), "decDeg": num(dec)}
        body = {
            "id": slug(display) if display != "Moon" else "moon",
            "name": "The Moon" if display == "Moon" else display,
            "kind": "moon", "parent": parent.lower(), "naifId": int(code),
            "orbit": orbit, "ephemeris": eph,
        }
        p = phys.get(code)
        if p:
            gm, rad, den = (num(c.split(" ")[0]) for c in p[3:6])
            if rad:
                body["meanRadiusKm"] = rad
            if gm:
                body["gmKm3S2"] = gm
            if den:
                body["densityGcm3"] = den
        if d:
            body["discovered"] = {"year": int(d[3][:4]), "by": d[4]}
            if d[0]:
                body["iauNumber"] = d[0]
        out.append(body)
    return out

def dwarfs():
    out = []
    for des, id_, name, recognised in DWARFS:
        j = json.loads(get(SBDB.format(des)))
        el = {x["name"]: float(x["value"]) for x in j["orbit"]["elements"] if x["value"] is not None}
        ph = {x["name"]: x for x in j.get("phys_par", [])}
        body = {
            "id": id_, "name": name, "kind": "dwarf", "parent": "sun", "recognisedByIau": recognised,
            "designation": j["object"]["fullname"].strip(),
            "orbitClass": j["object"]["orbit_class"]["name"],
            "orbit": {
                "type": "kepler", "frame": "ecliptic-j2000", "epochJd": float(j["orbit"]["epoch"]),
                "aKm": el["a"] * 149597870.7, "e": el["e"], "iDeg": el["i"], "nodeDeg": el["om"],
                "periDeg": el["w"], "mDeg": el["ma"], "periodDays": el["per"],
            },
        }
        if "diameter" in ph:
            body["meanRadiusKm"] = float(ph["diameter"]["value"]) / 2
        if id_ in DWARF_RADII:
            body["meanRadiusKm"], label, url = DWARF_RADII[id_]
            body["radiusSource"] = {"label": label, "url": url}
        if "rot_per" in ph:
            body["rotationHours"] = float(ph["rot_per"]["value"])
        if "GM" in ph:
            body["gmKm3S2"] = float(ph["GM"]["value"])
        out.append(body)
    return out

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    today = datetime.date.today().isoformat()
    m = moons()
    (OUT / "moons.json").write_text(json.dumps({
        "_sources": {"fetched": today, "elements": ELEM, "physical": PHYS, "discovery": DISC,
                     "note": "Mean orbital elements, good for drawing where a moon is, not for navigation. Radii and masses exist only for moons a spacecraft or a good telescope has measured."},
        "moons": m}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    d = dwarfs()
    (OUT / "dwarfs.json").write_text(json.dumps({
        "_sources": {"fetched": today, "api": "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
                     "note": "Osculating elements at the stated epoch from the JPL Small-Body Database."},
        "dwarfs": d}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(m)} moons, {len(d)} dwarf planets written to {OUT}")

if __name__ == "__main__":
    sys.exit(main())
