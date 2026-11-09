#!/usr/bin/env python3
"""Build src/data/facts.json from the NASA NSSDC planetary fact sheets and
the JPL approximate Keplerian elements (SSD).

Usage: python3 scripts/build-facts.py
Sources are fetched live; output is committed so the site build needs no network.
"""
import html, json, re, sys, urllib.request

PLANETS = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"]
FACT = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/{}fact.html"
APPROX = "https://ssd.jpl.nasa.gov/planets/approx_pos.html"

# label (as in the fact sheet, lower-cased, prefix match) -> output key
WANT = {
    "mass": "mass_1e24kg",
    "volume": "volume_1e10km3",
    "equatorial radius": "radius_equatorial_km",
    "polar radius": "radius_polar_km",
    "volumetric mean radius": "radius_mean_km",
    "mean density": "density_kgm3",
    "surface gravity": "gravity_ms2",
    "escape velocity": "escape_kms",
    "gravity": "gravity_ms2",
    "bond albedo": "albedo_bond",
    "geometric albedo": "albedo_geometric",
    "solar irradiance": "irradiance_wm2",
    "black-body temperature": "blackbody_k",
    "number of natural satellites": "moons",
    "planetary ring system": "rings",
    "semimajor axis": "semimajor_1e6km",
    "sidereal orbit period": "orbit_period_days",
    "perihelion": "perihelion_1e6km",
    "aphelion": "aphelion_1e6km",
    "synodic period": "synodic_days",
    "mean orbital velocity": "orbit_velocity_kms",
    "orbit inclination": "inclination_deg",
    "orbit eccentricity": "eccentricity",
    "sidereal rotation period": "rotation_hours",
    "length of day": "day_hours",
    "obliquity to orbit": "obliquity_deg",
}

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "heliocodex-build/1.0"})
    return urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")

def clean(t):
    t = re.sub(r"<(br|/tr|/p)[^>]*>", "\n", t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t).replace("\xa0", " ")
    t = re.sub(r"[ \t]+", " ", t)
    return [l.strip() for l in t.split("\n") if l.strip()]

def num(s):
    s = s.replace(",", "").replace("*", "").strip()
    m = re.match(r"^-?\d+(\.\d+)?(E[+-]?\d+)?", s, re.I)
    return float(m.group(0)) if m else None

INLINE = re.compile(r"^(.*\)|[A-Za-z][A-Za-z \-]*?)\s+(-?[\d.,]+(?:E[+-]?\d+)?|Yes|No)\s*\**$", re.I)

def parse_fact(name):
    lines = clean(get(FACT.format(name)))
    out = {}
    for i, l in enumerate(lines):
        m = INLINE.match(l)
        if m:
            label, v = m.group(1), m.group(2)
        elif i + 1 < len(lines):
            label, v = l, lines[i + 1]
        else:
            continue
        base = re.sub(r"\s*\(.*$", "", label).strip().lower()
        base = re.sub(r"\s*\*+$", "", base)
        key = WANT.get(base)
        if not key or key in out:
            continue
        if key == "rings":
            out[key] = v.strip().lower().startswith("yes")
        else:
            n = num(v)
            if n is not None:
                out[key] = n
    return out

def parse_elements():
    t = "\n".join(clean(get(APPROX)))
    start = t.index("Table 1")
    end = t.index("Table 2a")
    block = t[start:end].split("\n")
    rows, cur = {}, None
    names = {"Mercury", "Venus", "EM Bary", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"}
    pending = None
    for l in block:
        parts = l.split()
        if not parts:
            continue
        head = " ".join(parts[:2]) if parts[0] == "EM" else parts[0]
        if head in names and len(parts) >= 7 and re.match(r"^-?[\d.]+$", parts[-1]):
            vals = [float(x) for x in parts[len(head.split()):]]
            pending = head
            rows[head] = {"value": vals}
        elif pending and re.match(r"^[-\d.]+$", parts[0]) and len(parts) == 6 and "rate" not in rows[pending]:
            rows[pending]["rate"] = [float(x) for x in parts]
    out = {}
    for k, v in rows.items():
        key = "earth" if k == "EM Bary" else k.lower()
        a, e, i, L, w, node = v["value"]
        ra, re_, ri, rL, rw, rn = v["rate"]
        out[key] = {
            "a_au": a, "e": e, "i_deg": i, "L_deg": L, "lonperi_deg": w, "node_deg": node,
            "rate": {"a_au": ra, "e": re_, "i_deg": ri, "L_deg": rL, "lonperi_deg": rw, "node_deg": rn},
        }
    return out

def main():
    facts = {}
    for p in PLANETS:
        facts[p] = parse_fact(p)
        print(p, len(facts[p]), "fields", file=sys.stderr)
    elements = parse_elements()
    data = {
        "_sources": {
            "physical": "NASA NSSDC Planetary Fact Sheets, https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
            "orbits": "NASA/JPL SSD, Keplerian Elements for Approximate Positions of the Major Planets (1800-2050), https://ssd.jpl.nasa.gov/planets/approx_pos.html",
        },
        "planets": {p: {"physical": facts[p], "elements": elements[p]} for p in PLANETS},
    }
    with open("src/data/facts.json", "w") as f:
        json.dump(data, f, indent=1)
    missing = {p: [k for k in WANT.values() if k not in facts[p]] for p in PLANETS}
    print(json.dumps(missing), file=sys.stderr)

if __name__ == "__main__":
    main()
