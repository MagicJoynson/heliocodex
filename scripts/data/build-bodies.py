#!/usr/bin/env python3
"""Build src/data/bodies/moons.json and dwarfs.json from NASA/JPL Solar System Dynamics.

Moons: the three public tables at ssd.jpl.nasa.gov/sats (mean orbital elements,
physical parameters, discovery circumstances). Dwarf planets: the Small-Body
Database API. Everything is fetched live; the output is committed, so the site
build needs no network.

Usage: python3 -I scripts/data/build-bodies.py
       python3 -I scripts/data/build-bodies.py --dwarf-moons   (only the moons of the far dwarf planets)

After running this, run scripts/data/fit-moon-orbits.py: the JPL table gives each moon's orbit its
size and shape, and that script works out where along it the moon is, from JPL Horizons.
"""
import html, json, math, re, sys, urllib.parse, urllib.request, datetime, pathlib

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
    "haumea": (798.0, "Ortiz et al. 2017, Nature 550, 219 (stellar occultation; the mean of three unequal axes)", "https://doi.org/10.1038/nature24051"),
    "makemake": (715.0, "Ortiz et al. 2012, Nature 491, 566 (stellar occultation)", "https://doi.org/10.1038/nature11597"),
    "gonggong": (615.0, "Kiss et al. 2019, Icarus 334, 3 (heat measured by the Herschel telescope)", "https://doi.org/10.1016/j.icarus.2019.03.013"),
    "quaoar": (555.0, "Braga-Ribas et al. 2013, Astrophysical Journal 773, 26 (stellar occultation)", "https://doi.org/10.1088/0004-637X/773/1/26"),
    "sedna": (497.5, "Pál et al. 2012, Astronomy & Astrophysics 541, L6 (heat measured by the Herschel telescope)", "https://doi.org/10.1051/0004-6361/201218874"),
    "orcus": (458.5, "Fornasier et al. 2013, Astronomy & Astrophysics 555, A15 (heat measured by the Herschel telescope)", "https://doi.org/10.1051/0004-6361/201321329"),
}

# Moon sizes that JPL's table leaves out, from the papers that measured them.
MOON_RADII = {
    "daphnis": (3.8, "Thomas 2010, Icarus 208, 395 (Cassini images)", "https://doi.org/10.1016/j.icarus.2010.01.025"),
}

# Moons of the far dwarf planets. JPL's satellite tables stop at Pluto, so these come from two places.
# Where JPL Horizons carries a solution for the moon (its "TNO satellite" solutions), the orbit and
# the size are read from Horizons: (Horizons code of the moon, code of the primary, id, name, parent,
# year found, found by, take the size from Horizons?). Horizons marks most of these sizes with "~":
# they are estimates from brightness, not measurements, and are left out. The two kept are measured.
HORIZONS = "https://ssd.jpl.nasa.gov/api/horizons.api"
HORIZONS_MOONS = [
    (120136199, 920136199, "dysnomia", "Dysnomia", "eris", 2005, "M. E. Brown and others, Keck Observatory", True),
    (120136108, 920136108, "hiiaka", "Hiʻiaka", "haumea", 2005, "M. E. Brown and others, Keck Observatory", False),
    (220136108, 920136108, "namaka", "Namaka", "haumea", 2005, "M. E. Brown and others, Keck Observatory", False),
    (120090482, 920090482, "vanth", "Vanth", "orcus", 2005, "M. E. Brown and T.-A. Suer, Hubble Space Telescope", True),
    (120050000, 920050000, "weywot", "Weywot", "quaoar", 2006, "M. E. Brown and T.-A. Suer, Hubble Space Telescope", False),
]
# Moons Horizons does not carry: the size and shape of the orbit from the paper that worked it out.
# Which way these orbits face in space is not settled, so no angles are given and the moon is not placed.
PAPER_MOONS = [
    {"id": "xiangliu", "name": "Xiangliu", "parent": "gonggong", "aKm": 24021.0, "e": 0.2908, "periodDays": 25.22073,
     "discovered": {"year": 2016, "by": "C. Kiss, G. Marton and others, from Hubble Space Telescope images of 2009 and 2010"},
     "source": ("Kiss et al. 2019, Icarus 334, 3", "https://doi.org/10.1016/j.icarus.2019.03.013"),
     "note": "Size and shape of the orbit from Kiss et al. 2019. The Hubble pictures fit two mirror-image orbits equally well, tilted opposite ways, so which way this one faces is not known and the moon cannot be placed along it. The figures are for the solution that goes round the usual way."},
    {"id": "s-2015-136472-1", "name": "S/2015 (136472) 1", "parent": "makemake", "aKm": 22250.0, "e": 0.0, "periodDays": 18.023,
     "discovered": {"year": 2016, "by": "A. H. Parker and others, from Hubble Space Telescope images of 2015"},
     "source": ("Bamberger 2025, arXiv:2509.05880 (a first orbit; not yet in a journal)", "https://arxiv.org/abs/2509.05880"),
     "note": "A first orbit from twelve Hubble sightings (Bamberger 2025), taken as a circle 22,250 km in radius, give or take 780 km. It is seen almost edge-on from Earth. Which way it faces in space has not been published, so the moon cannot be placed along it."},
]


def horizons(params):
    q = {"format": "text", **params}
    return get(HORIZONS + "?" + urllib.parse.urlencode(q))


def dwarf_moons():
    out = []
    epoch = 2458849.5  # 2020-01-01 TDB
    dates = [epoch + 73.0 * k for k in range(-12, 13)]  # 25 dates over five years, the epoch among them
    for code, primary, id_, name, parent, year, by, keep_size in HORIZONS_MOONS:
        text = horizons({"COMMAND": f"'{code}'", "OBJ_DATA": "'YES'", "EPHEM_TYPE": "'ELEMENTS'", "CENTER": f"'500@{primary}'",
                         "REF_PLANE": "'ECLIPTIC'", "TLIST_TYPE": "'JD'", "TIME_TYPE": "'TDB'",
                         "TLIST": "'" + " ".join(f"{d:.1f}" for d in dates) + "'"})
        block = re.search(r"\$\$SOE(.*?)\$\$EOE", text, re.S).group(1)
        rows = []
        for chunk in re.split(r"\n(?=\d{7}\.\d+ = )", block.strip()):
            vals = {k.strip(): float(v) for k, v in re.findall(r"([A-Za-z]{1,2})\s*=\s*([-+]?\d\.\d+E[-+]\d+)", chunk)}
            rows.append((float(chunk.split("=")[0]), vals))
        assert len(rows) == len(dates), f"{id_}: {len(rows)} rows from Horizons"
        at = min(rows, key=lambda r: abs(r[0] - epoch))[1]
        med = lambda k: sorted(r[1][k] for r in rows)[len(rows) // 2]
        solution = re.search(r"source=\s*(\S+)", text)
        body = {
            "id": id_, "name": name, "kind": "moon", "parent": parent, "naifId": code, "primaryNaifId": primary,
            "orbit": {"type": "kepler", "frame": "ecliptic-j2000", "epochJd": epoch,
                      "aKm": round(med("A"), 1), "e": round(med("EC"), 4), "iDeg": round(at["IN"], 4), "nodeDeg": round(at["OM"], 4),
                      "periDeg": round(at["W"], 4), "mDeg": round(at["MA"], 4), "periodDays": round(med("PR") / 86400, 6)},
            "ephemeris": solution.group(1) if solution else "JPL Horizons",
            "discovered": {"year": year, "by": by},
            "orbitSource": {"label": "NASA/JPL Horizons, solution for this moon's orbit", "url": "https://ssd.jpl.nasa.gov/horizons/"},
        }
        if at["IN"] > 90:
            body["orbit"]["retrograde"] = True
        # JPL's own estimate of how far out its solution may be
        unc = re.search(r"Position uncertainty[^:]*on (\d{4})[^:]*:\s*([\d.]+)\s*km", text)
        note = "The orbit is JPL Horizons' solution, which runs from 2000 to 2030. Later dates run it forward."
        if unc:
            km = float(unc.group(2))
            body["positionUncertainty"] = {"year": int(unc.group(1)), "km": km}
            deg = math.degrees(km / med("A"))
            note += (f" JPL puts its solution within about {km:,.0f} km of the truth in {unc.group(1)}, "
                     + (f"which is about {deg:.0f}° round the orbit." if deg >= 1 else "a small fraction of a degree round the orbit."))
        if "may be poor" in text:
            note += " It rests on only a few sightings from 2006 to 2011, and JPL warns that it may be poor outside those years."
        body["orbitNote"] = note
        rad = re.search(r"RAD\s*([=~])\s*([\d.]+)", text)
        if keep_size and rad:
            body["meanRadiusKm"] = float(rad.group(2))
            body["radiusSource"] = {"label": "NASA/JPL Horizons, physical data for this moon", "url": "https://ssd.jpl.nasa.gov/horizons/"}
        out.append(body)
    for m in PAPER_MOONS:
        label, url = m["source"]
        out.append({
            "id": m["id"], "name": m["name"], "kind": "moon", "parent": m["parent"],
            "orbit": {"type": "kepler", "frame": "ecliptic-j2000", "epochJd": epoch, "aKm": m["aKm"], "e": m["e"],
                      "iDeg": 0.0, "nodeDeg": 0.0, "periDeg": 0.0, "mDeg": 0.0, "periodDays": m["periodDays"]},
            "orientationUnknown": True, "orbitNote": m["note"],
            "discovered": m["discovered"], "orbitSource": {"label": label, "url": url},
        })
    return out


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
        if body["id"] in MOON_RADII and "meanRadiusKm" not in body:
            body["meanRadiusKm"], label, url = MOON_RADII[body["id"]]
            body["radiusSource"] = {"label": label, "url": url}
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
    if "--dwarf-moons" in sys.argv:
        # add or refresh only the moons of the far dwarf planets, leaving every fitted orbit as it is
        path = OUT / "moons.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        new = dwarf_moons()
        ids = {b["id"] for b in new}
        data["moons"] = [b for b in data["moons"] if b["id"] not in ids] + new
        data["_sources"]["dwarfPlanetMoons"] = {"fetched": today, "positions": "https://ssd.jpl.nasa.gov/horizons/",
                                                "note": "Moons of the dwarf planets beyond Pluto are not in JPL's satellite tables. Five have orbit solutions in JPL Horizons; two are known only from the papers named on each."}
        path.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"{len(new)} dwarf-planet moons written; now run fit-moon-orbits.py {' '.join(b['id'] for b in new if 'naifId' in b)}")
        return
    m = moons() + dwarf_moons()
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
