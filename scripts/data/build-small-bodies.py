#!/usr/bin/env python3
"""Build src/data/bodies/small.json: a chosen few asteroids and comets, and how the known small
bodies are spread out from the Sun. Everything comes from NASA/JPL's Small-Body Database, fetched
live; the output is committed, so the site build needs no network.

Usage: python3 -I scripts/data/build-small-bodies.py

Two parts.
  1. The chosen bodies. Each is here because a spacecraft has been to it or because it is one of
     the largest or best known of its kind. Orbits are JPL's elements as they stand. For comets the
     orbit is pinned to the time of closest approach to the Sun that JPL gives, because a comet's
     own jets push it about and its timing drifts from one return to the next.
  2. The spread. A count of every known asteroid by the size of its orbit, in narrow bins, so the
     chart can draw where the belts are thick and thin. These are counts of what has been FOUND,
     which favours bodies that are large, bright or close.
"""
import datetime, json, pathlib, sys, urllib.parse, urllib.request

OUT = pathlib.Path(__file__).resolve().parents[2] / "src" / "data" / "bodies" / "small.json"
SBDB = "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr={}&phys-par=1&full-prec=1"
QUERY = "https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=a&sb-kind=a"
AU_KM = 149597870.7

# (what to ask JPL for, id, name, kind, group, how well it has been seen, why it is here)
# seen: mapped = a spacecraft has mapped all or nearly all of it; partly = a spacecraft flew past
# or a mission saw one side; unresolved = never seen as more than a point or a blur.
CHOSEN = [
    ("4", "vesta", "Vesta", "asteroid", "main-belt", "mapped", "The second largest body in the asteroid belt. NASA's Dawn spacecraft orbited it in 2011 and 2012."),
    ("2", "pallas", "Pallas", "asteroid", "main-belt", "unresolved", "The third largest asteroid, on a steeply tilted orbit."),
    ("10", "hygiea", "Hygiea", "asteroid", "main-belt", "unresolved", "The fourth largest asteroid."),
    ("3", "juno", "Juno", "asteroid", "main-belt", "unresolved", "The third asteroid ever found, in 1804."),
    ("16", "psyche", "Psyche", "asteroid", "main-belt", "unresolved", "A metal-rich asteroid. NASA's Psyche spacecraft, launched in 2023, is on its way there."),
    ("21", "lutetia", "Lutetia", "asteroid", "main-belt", "partly", "Photographed by the European spacecraft Rosetta as it flew past in 2010."),
    ("243", "ida", "Ida", "asteroid", "main-belt", "partly", "Photographed by NASA's Galileo spacecraft in 1993, which found it has a small moon, Dactyl."),
    ("951", "gaspra", "Gaspra", "asteroid", "main-belt", "partly", "The first asteroid a spacecraft flew past: Galileo, in 1991."),
    ("253", "mathilde", "Mathilde", "asteroid", "main-belt", "partly", "Photographed by NASA's NEAR Shoemaker spacecraft as it flew past in 1997."),
    ("433", "eros", "Eros", "asteroid", "near-earth", "mapped", "The first asteroid a spacecraft orbited and landed on: NEAR Shoemaker, in 2000 and 2001."),
    ("25143", "itokawa", "Itokawa", "asteroid", "near-earth", "mapped", "Japan's Hayabusa spacecraft brought grains of it back to Earth in 2010."),
    ("162173", "ryugu", "Ryugu", "asteroid", "near-earth", "mapped", "Japan's Hayabusa2 spacecraft brought samples of it back to Earth in 2020."),
    ("101955", "bennu", "Bennu", "asteroid", "near-earth", "mapped", "NASA's OSIRIS-REx spacecraft brought samples of it back to Earth in 2023."),
    ("65803", "didymos", "Didymos", "asteroid", "near-earth", "partly", "In 2022 NASA's DART spacecraft struck its small moon, Dimorphos, on purpose, and changed that moon's orbit."),
    ("99942", "apophis", "Apophis", "asteroid", "near-earth", "unresolved", "Will pass closer to the Earth than the weather satellites on 13 April 2029, and will not hit."),
    ("624", "hektor", "Hektor", "asteroid", "trojan", "unresolved", "The largest of the Trojans, the asteroids that share Jupiter's orbit."),
    ("2060", "chiron", "Chiron", "asteroid", "centaur", "unresolved", "The first centaur found: a body that orbits among the giant planets. It sometimes shows a faint coma, as a comet does."),
    ("486958", "arrokoth", "Arrokoth", "asteroid", "kuiper-belt", "partly", "The most distant body a spacecraft has visited: New Horizons flew past on 1 January 2019."),
    ("1P", "halley", "Halley's Comet", "comet", "comet", "partly", "The most famous comet, back about every 76 years. Five spacecraft met it in 1986."),
    ("2P", "encke", "Comet Encke", "comet", "comet", "unresolved", "The comet with the shortest orbit of any bright one: a little over three years."),
    ("9P", "tempel-1", "Comet Tempel 1", "comet", "comet", "partly", "NASA's Deep Impact spacecraft fired a block of copper into it in 2005 to see what was underneath."),
    ("19P", "borrelly", "Comet Borrelly", "comet", "comet", "partly", "Photographed by NASA's Deep Space 1 spacecraft in 2001."),
    ("81P", "wild-2", "Comet Wild 2", "comet", "comet", "partly", "NASA's Stardust spacecraft flew through its coma in 2004 and brought the dust back to Earth."),
    ("103P", "hartley-2", "Comet Hartley 2", "comet", "comet", "partly", "Photographed by NASA's Deep Impact spacecraft in 2010."),
    ("67P", "churyumov-gerasimenko", "Comet 67P", "comet", "comet", "mapped", "In full, Churyumov-Gerasimenko, after the two astronomers who found it. The European spacecraft Rosetta orbited it for two years from 2014 and set a lander, Philae, on it."),
    ("C/1995 O1", "hale-bopp", "Comet Hale-Bopp", "comet", "comet", "unresolved", "One of the brightest comets of the last century, visible to the naked eye for a year and a half around 1997."),
]

# The spread of known asteroids: (key, from au, to au, width of a bin in au)
SPREADS = [("inner", 1.5, 5.5, 0.01), ("outer", 28.0, 60.0, 0.25)]


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "heliocodex-build"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read().decode("utf-8", "replace")


def chosen():
    out = []
    for des, id_, name, kind, group, seen, why in CHOSEN:
        j = json.loads(get(SBDB.format(urllib.parse.quote(des))))
        el = {x["name"]: float(x["value"]) for x in j["orbit"]["elements"] if x["value"] is not None}
        ph = {x["name"]: x for x in j.get("phys_par", [])}
        comet = kind == "comet"
        body = {
            "id": id_, "name": name, "kind": kind, "parent": "sun", "group": group, "seen": seen, "why": why,
            "designation": j["object"]["fullname"].strip(), "orbitClass": j["object"]["orbit_class"]["name"].rstrip("*"),
            "orbit": {
                "type": "kepler", "frame": "ecliptic-j2000",
                # a comet is pinned to its closest approach to the Sun, where its mean anomaly is zero
                "epochJd": el["tp"] if comet else float(j["orbit"]["epoch"]),
                "aKm": el["a"] * AU_KM, "e": el["e"], "iDeg": el["i"], "nodeDeg": el["om"],
                "periDeg": el["w"], "mDeg": 0.0 if comet else el["ma"], "periodDays": el["per"],
                **({"retrograde": True} if el["i"] > 90 else {}),
            },
            "elementsEpochJd": float(j["orbit"]["epoch"]),
        }
        if "diameter" in ph and ph["diameter"]["value"]:
            body["meanRadiusKm"] = float(ph["diameter"]["value"]) / 2
        elif "extent" in ph and ph["extent"]["value"]:
            # no single width given: the mean of the measured lengths of its axes
            axes = [float(v) for v in ph["extent"]["value"].lower().replace(" ", "").split("x")]
            body["meanRadiusKm"] = round(sum(axes) / len(axes) / 2, 3)
        out.append(body)
        print(f"{name:32s} a {el['a']:8.3f} au  e {el['e']:.3f}  width {2 * body.get('meanRadiusKm', 0):.3g} km", file=sys.stderr)
    return out


def spreads():
    j = json.loads(get(QUERY))
    a = [float(r[0]) for r in j["data"] if r[0] is not None]
    out = {"counted": len(a)}
    for key, lo, hi, step in SPREADS:
        n = round((hi - lo) / step)
        bins = [0] * n
        for v in a:
            k = int((v - lo) / step)
            if 0 <= k < n and v >= lo:
                bins[k] += 1
        out[key] = {"fromAu": lo, "toAu": hi, "stepAu": step, "counts": bins}
    return out


def main():
    today = datetime.date.today().isoformat()
    data = {
        "_sources": {
            "fetched": today, "api": "https://ssd-api.jpl.nasa.gov/doc/sbdb.html", "query": "https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html",
            "note": "Orbits and sizes from the JPL Small-Body Database. Comet positions are approximate: they are run from the last "
                    "closest approach to the Sun that JPL gives. The spread counts every asteroid in the database on the day it was "
                    "fetched, by the size of its orbit; it shows what has been found, not everything that is there.",
        },
        "bodies": chosen(),
        "spread": spreads(),
    }
    OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(data['bodies'])} bodies and the spread of {data['spread']['counted']:,} asteroids written to {OUT}", file=sys.stderr)


if __name__ == "__main__":
    sys.exit(main())
