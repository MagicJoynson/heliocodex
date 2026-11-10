#!/usr/bin/env python3
"""
Fit each moon's orbit to JPL Horizons, so the site can say where a moon is on any date.

    python3 scripts/data/fit-moon-orbits.py            # every moon in src/data/bodies/moons.json
    python3 scripts/data/fit-moon-orbits.py titan io   # just these

Why this exists. JPL's table of mean satellite elements (ssd.jpl.nasa.gov/sats/elem) gives each
orbit's size, shape and tilt, but its angles and periods follow different conventions from one
planet's ephemeris to the next, and run forward from 2000 they put several large moons on the
wrong side of their planet. So the table is kept for size (a), shape (e) and reference plane,
and everything that says *where along the orbit* the moon is comes from here.

What it does for each moon
  1. asks Horizons for the moon's position and velocity about its planet at about a hundred
     dates between 2000 and 2040: tight bursts (to pin the period) and an even spread
     (to pin the slow turning of the orbit)
  2. turns each into orbital elements in the moon's reference plane
  3. fits straight lines to the node, the argument of periapsis and the mean anomaly
  4. checks the fitted orbit against Horizons at other dates it has not seen, and records the error

It writes the result back into moons.json: `orbit.epochJd`, `iDeg`, `nodeDeg`, `periDeg`, `mDeg`,
`periodDays` (sidereal) and `orbit.rates` (degrees a day for node, periapsis argument and mean
anomaly), plus `orbit.fit` with the typical and worst error in degrees as seen from the planet.

Needs Python 3.10+ and numpy. Horizons answers are cached in data-work/horizons/.
"""
from __future__ import annotations

import json
import math
import os
import re
import sys
import time
import urllib.parse
import urllib.request

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MOONS = os.path.join(HERE, "..", "..", "src", "data", "bodies", "moons.json")
CACHE = os.path.join(HERE, "..", "..", "data-work", "horizons")
API = "https://ssd.jpl.nasa.gov/api/horizons.api"

EPOCH = 2458849.5  # 2020-01-01 00:00 TDB
SPAN = (2451545.0, 2466154.5)  # 2000-01-01.5 to 2040-01-01
OBLIQUITY = math.radians(23.4392911)

# planet centre codes, and GM of the planet (plus its big moons where they matter), km^3/s^2
CENTRE = {"earth": 399, "mars": 499, "jupiter": 599, "saturn": 699, "uranus": 799, "neptune": 899, "pluto": 999}
GM = {"earth": 398600.435 + 4902.800, "mars": 42828.375, "jupiter": 126686531.9, "saturn": 37931206.2,
      "uranus": 5793951.3, "neptune": 6835099.97, "pluto": 869.6 + 105.9}
# Spin poles used for 'parent-equator' orbits (ICRF, degrees). For Uranus this is the pole its moons
# go round anticlockwise about, which is the opposite end from the IAU's "north" pole.
POLES = {"saturn": (40.589, 83.537), "uranus": (77.311, 15.175), "neptune": (299.36, 43.46), "pluto": (132.993, -6.163)}


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def basis(o: dict, parent: str) -> np.ndarray:
    """Rows are the reference plane's x, y, z axes in ecliptic J2000 coordinates."""
    if o["frame"] == "ecliptic-j2000":
        return np.eye(3)
    ra, dec = (o["framePole"]["raDeg"], o["framePole"]["decDeg"]) if o["frame"] == "laplace" else POLES[parent]
    ra, dec = math.radians(ra), math.radians(dec)
    z = np.array([math.cos(dec) * math.cos(ra), math.cos(dec) * math.sin(ra), math.sin(dec)])
    x = np.array([-math.sin(ra), math.cos(ra), 0.0])
    y = np.cross(z, x)
    c, s = math.cos(OBLIQUITY), math.sin(OBLIQUITY)
    rot = np.array([[1, 0, 0], [0, c, s], [0, -s, c]])  # ICRF equator to ecliptic
    return np.array([rot @ x, rot @ y, rot @ z])


def horizons(code: int, centre: int, jds: list[float]) -> np.ndarray | None:
    """Position (km) and velocity (km/s) about the planet, ecliptic J2000, one row per date."""
    os.makedirs(CACHE, exist_ok=True)
    key = f"{code}_{centre}_{len(jds)}_{abs(hash(tuple(round(j, 6) for j in jds))) % 10**10}.txt"
    path = os.path.join(CACHE, key)
    if os.path.exists(path):
        text = open(path).read()
    else:
        out = []
        size = math.ceil(len(jds) / math.ceil(len(jds) / 60))  # equal chunks: Horizons mishandles a list of one
        for k in range(0, len(jds), size):
            q = {"format": "text", "COMMAND": f"'{code}'", "OBJ_DATA": "'NO'", "EPHEM_TYPE": "'VECTORS'",
                 "CENTER": f"'500@{centre}'", "REF_PLANE": "'ECLIPTIC'", "TLIST_TYPE": "'JD'", "TIME_TYPE": "'TDB'",
                 "TLIST": "'" + " ".join(f"{j:.6f}" for j in jds[k:k + size]) + "'"}
            t = ""
            for attempt in range(4):
                try:
                    t = urllib.request.urlopen(API + "?" + urllib.parse.urlencode(q), timeout=60).read().decode()
                    break
                except Exception:
                    time.sleep(2 + 3 * attempt)
            m = re.search(r"\$\$SOE(.*?)\$\$EOE", t, re.S)
            if not m:
                return None
            out.append(m.group(1))
        text = "\n".join(out)
        with open(path, "w") as f:
            f.write(text)
    num = r"([-+]?\d\.\d+E[-+]\d+)"
    rows = re.findall(r"X =\s*" + num + r"\s*Y =\s*" + num + r"\s*Z =\s*" + num + r"\s*VX=\s*" + num + r"\s*VY=\s*" + num + r"\s*VZ=\s*" + num, text)
    if len(rows) != len(jds):
        return None
    return np.array(rows, dtype=float)


def sample_times(period: float) -> list[float]:
    """Tight bursts at growing distances from the epoch, plus an even spread."""
    ts = set()
    step = period / 7.3
    for off in (0, 11.3, -11.3, 127, -127, 1433, -1433, 16200, -16200, 183000, -183000):
        t0 = EPOCH + off * period
        if SPAN[0] + 30 <= t0 <= SPAN[1] - 30 - 7 * step or off == 0:
            for k in range(7):
                ts.add(round(t0 + k * step, 6))
    for k in range(40):
        ts.add(round(SPAN[0] + 20 + (SPAN[1] - SPAN[0] - 40) * (k + 0.37) / 40, 6))
    return sorted(ts)


def elements(state: np.ndarray, B: np.ndarray, mu: float):
    """Osculating inclination, node, argument of periapsis and mean anomaly (radians) in the plane B."""
    r = state[:, :3] @ B.T
    v = state[:, 3:] @ B.T * 86400.0  # km/day
    mu = mu * 86400.0 ** 2
    h = np.cross(r, v)
    hn = np.linalg.norm(h, axis=1)
    inc = np.arccos(np.clip(h[:, 2] / hn, -1, 1))
    node = np.arctan2(h[:, 0], -h[:, 1])
    rn = np.linalg.norm(r, axis=1)
    evec = np.cross(v, h) / mu - r / rn[:, None]
    e = np.linalg.norm(evec, axis=1)
    a = 1 / (2 / rn - (v * v).sum(1) / mu)
    return r, h / hn[:, None], inc, node, evec, e, a, rn, v, mu


def best_rate(t: np.ndarray, ang: np.ndarray, lo: float, hi: float, span: float):
    """The straight line angle = a0 + rate * t that best matches angles known only modulo a turn."""
    if hi <= lo:
        rates = np.array([lo])
    else:
        n = int(min(400_000, max(50, (hi - lo) * span / 0.05)))
        rates = np.linspace(lo, hi, n)
    z = np.exp(1j * ang)
    best, score = lo, -1.0
    for k in range(0, len(rates), 4000):
        rr = rates[k:k + 4000]
        c = np.abs((z[None, :] * np.exp(-1j * rr[:, None] * t[None, :])).mean(1))
        j = int(c.argmax())
        if c[j] > score:
            best, score = float(rr[j]), float(c[j])
    # refine with an unwrapped least-squares line
    for _ in range(3):
        resid = np.angle(z * np.exp(-1j * best * t))
        a0 = np.angle(np.exp(1j * resid).mean())
        d = np.angle(np.exp(1j * (resid - a0)))
        slope = (d * t).sum() / (t * t).sum() if (t * t).sum() else 0.0
        best += slope
    resid = np.angle(z * np.exp(-1j * best * t))
    a0 = float(np.angle(np.exp(1j * resid).mean()))
    score = float(np.abs(np.exp(1j * resid).mean()))
    return a0, best, score


def kepler_pos(o: dict, B: np.ndarray, jd: np.ndarray) -> np.ndarray:
    """The fitted orbit's position, ecliptic J2000 km. Mirrors src/lib/v2/atlas/kepler.ts."""
    dt = jd - o["epochJd"]
    rt = o["rates"]
    node = np.radians(o["nodeDeg"] + rt["nodeDegPerDay"] * dt)
    w = np.radians(o["periDeg"] + rt["periDegPerDay"] * dt)
    Mdeg = o["mDeg"] + rt["mDegPerDay"] * dt
    wb = o.get("wobble")
    if wb:
        for k, term in enumerate(wb["terms"]):
            Mdeg = Mdeg + term["ampDeg"] * np.sin(np.radians(360.0 * (k + 1) * dt / wb["periodDays"] + term["phaseDeg"]))
    M = np.radians(Mdeg % 360.0)
    e = o["e"]
    E = M.copy() if e < 0.8 else np.full_like(M, math.pi)
    for _ in range(40):
        E = E - (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
    px = o["aKm"] * (np.cos(E) - e)
    py = o["aKm"] * math.sqrt(1 - e * e) * np.sin(E)
    i = math.radians(o["iDeg"])
    cw, sw, cn, sn, ci, si = np.cos(w), np.sin(w), np.cos(node), np.sin(node), math.cos(i), math.sin(i)
    x = (cn * cw - sn * sw * ci) * px + (-cn * sw - sn * cw * ci) * py
    y = (sn * cw + cn * sw * ci) * px + (-sn * sw + cn * cw * ci) * py
    z = sw * si * px + cw * si * py
    return np.stack([x, y, z], 1) @ B


def fit(m: dict) -> dict | None:
    o = dict(m["orbit"])
    parent = m["parent"]
    B = basis(o, parent)
    P0 = o.get("periodJpl", o["periodDays"])
    jds = sample_times(P0)
    st = horizons(m["naifId"], CENTRE[parent], jds)
    if st is None:
        return None
    t = np.array(jds) - EPOCH
    span = SPAN[1] - SPAN[0]
    r, hhat, inc, node, evec, e_osc, a_osc, rn, v, mu = elements(st, B, GM[parent])
    n0 = 2 * math.pi / P0

    inc_mean = float(np.degrees(np.arctan2(np.sin(inc).mean(), np.cos(inc).mean())))
    flat = inc_mean < 0.35 or inc_mean > 179.65
    if flat:
        # too little tilt for the node to mean anything: measure everything from the plane's own x axis
        iDeg, node0, node_rate = (0.0 if inc_mean < 90 else 180.0), 0.0, 0.0
    else:
        iDeg = inc_mean
        node0, node_rate, _ = best_rate(t, node, -0.04 * n0, 0.04 * n0, span)

    # the mean orbit plane at each date, and the moon's elements measured in it
    i_r = math.radians(iDeg)
    nd = node0 + node_rate * t
    Pax = np.stack([np.cos(nd), np.sin(nd), np.zeros_like(nd)], 1)
    Zax = np.stack([np.sin(nd) * math.sin(i_r), -np.cos(nd) * math.sin(i_r), np.full_like(nd, math.cos(i_r))], 1)
    Qax = np.cross(Zax, Pax)
    ex, ey = (evec * Pax).sum(1), (evec * Qax).sum(1)
    w_osc = np.arctan2(ey, ex)
    # mean anomaly from the eccentric anomaly
    ecosE = 1 - rn / a_osc
    esinE = (r * v).sum(1) / np.sqrt(mu * np.abs(a_osc))
    E = np.arctan2(esinE, ecosE)
    M_osc = E - esinE
    F = w_osc + M_osc  # mean argument of latitude: well defined even for a circle

    F0, F_rate, F_score = best_rate(t, F, n0 * 0.95, n0 * 1.05, span)
    e_mean = o["e"]
    # where the data's eccentricity is clearly different from the table's (old fits of faint moons), trust the data
    e_fit = float(np.median(e_osc))
    if e_mean < 0.003:
        w0, w_rate, w_score = 0.0, 0.0, 0.0
    else:
        w0, w_rate, w_score = best_rate(t, w_osc, -0.04 * n0, 0.04 * n0, span)
        if w_score < 0.5:
            w0, w_rate = float(np.angle(np.exp(1j * w_osc).mean())), 0.0
    M0 = F0 - w0
    M_rate = F_rate - w_rate

    deg = math.degrees
    new = {
        "type": "kepler", "frame": o["frame"],
        **({"framePole": o["framePole"]} if "framePole" in o else {}),
        "epochJd": EPOCH,
        "aKm": o["aKm"], "e": o["e"],
        "iDeg": round(iDeg, 4),
        "nodeDeg": round(deg(node0) % 360, 4),
        "periDeg": round(deg(w0) % 360, 4),
        "mDeg": round(deg(M0) % 360, 4),
        # sidereal: the time to come back to the same direction among the stars
        "periodDays": round(2 * math.pi / abs(F_rate + (node_rate if iDeg <= 90 else -node_rate)), 7),
        "periodJpl": P0,
        **({"retrograde": True} if iDeg > 90 else {}),
        "rates": {"nodeDegPerDay": round(deg(node_rate), 9), "periDegPerDay": round(deg(w_rate), 9), "mDegPerDay": round(deg(M_rate), 9)},
    }

    # try the table's size and shape, and the data's own averages, and keep whichever lands closer
    def errors(cand: dict, jd: np.ndarray, truth: np.ndarray):
        p = kepler_pos(cand, B, jd)
        cosang = (p * truth).sum(1) / np.linalg.norm(p, axis=1) / np.linalg.norm(truth, axis=1)
        return np.degrees(np.arccos(np.clip(cosang, -1, 1)))

    alt = dict(new, aKm=round(float(np.median(a_osc)), 1), e=round(min(e_fit, 0.95), 4))
    if np.median(errors(alt, np.array(jds), st[:, :3])) < 0.7 * np.median(errors(new, np.array(jds), st[:, :3])):
        new = alt

    # Some moons do not keep a steady pace: Mimas swings 40 degrees either side over 70 years in step
    # with Tethys, and Janus and Epimetheus trade places every four years. Where a steady pace leaves
    # more than a couple of degrees, add one slow swing (and its first two overtones) to the pace.
    resid = np.unwrap(np.angle(np.exp(1j * (F - F0 - F_rate * t))))  # the dates are in order
    resid -= resid.mean()
    swung = None
    if np.sqrt((resid ** 2).mean()) > math.radians(2.0):
        best = None
        for T in np.geomspace(300.0, 3.0 * span, 400):
            cols = [np.ones_like(t), t]
            for k in (1, 2, 3):
                cols += [np.sin(2 * math.pi * k * t / T), np.cos(2 * math.pi * k * t / T)]
            A = np.stack(cols, 1)
            coef, *_ = np.linalg.lstsq(A, resid, rcond=None)
            rms = float(np.sqrt(((A @ coef - resid) ** 2).mean()))
            if best is None or rms < best[0]:
                best = (rms, T, coef)
        rms, T, coef = best
        terms = [{"ampDeg": round(deg(math.hypot(coef[2 + 2 * k], coef[3 + 2 * k])), 4),
                  "phaseDeg": round(deg(math.atan2(coef[3 + 2 * k], coef[2 + 2 * k])) % 360, 3)} for k in range(3)]
        swung = dict(new, wobble={"periodDays": round(float(T), 2), "terms": terms})
        swung["mDeg"] = round((new["mDeg"] + deg(coef[0])) % 360, 4)
        swung["rates"] = dict(new["rates"], mDegPerDay=round(new["rates"]["mDegPerDay"] + deg(coef[1]), 9))
        if not np.median(errors(swung, np.array(jds), st[:, :3])) < 0.6 * np.median(errors(new, np.array(jds), st[:, :3])):
            swung = None

    # check against dates the fit has not seen
    rng = np.random.default_rng(m["naifId"])
    check = sorted([float(x) for x in rng.uniform(SPAN[0] + 5, SPAN[1] - 5, 24)] + [2461354.5])  # one of them is 10 Nov 2026
    truth = horizons(m["naifId"], CENTRE[parent], check)
    if truth is None:
        return None
    err = errors(new, np.array(check), truth[:, :3])
    if swung is not None:
        # the swing is kept only if it also does better on the dates the fit has not seen
        err2 = errors(swung, np.array(check), truth[:, :3])
        if np.median(err2) < np.median(err) and err2.max() < err.max():
            new, err = swung, err2
    # A fit that lands nowhere near the positions is worse than none: Horizons has no real orbit for
    # a few newly found moons (S/2025 U 1 came back as a = -10,778 km). Keep the table's orbit instead.
    if new["aKm"] <= 0 or float(np.median(err)) > 45:
        log(f"  {m['id']}: fit rejected (a {new['aKm']} km, median error {float(np.median(err)):.0f} deg)")
        return None
    new["fit"] = {"medianDeg": round(float(np.median(err)), 2), "worstDeg": round(float(err.max()), 2), "from": 2000, "to": 2040}
    return new


def main():
    data = json.load(open(MOONS))
    want = set(sys.argv[1:])
    done = failed = 0
    for m in data["moons"]:
        if want and m["id"] not in want:
            continue
        if m["parent"] not in CENTRE or "naifId" not in m:
            continue
        try:
            new = fit(m)
        except (ValueError, FloatingPointError, np.linalg.LinAlgError) as err:
            log(f"{m['id']:14s} could not be fitted ({err})")
            new = None
        if new is None:
            failed += 1
            log(f"{m['id']:14s} no answer from Horizons; left as the JPL table has it")
            continue
        if m["orbit"].get("theory"):
            # Earth's Moon: the site uses a full lunar theory (src/lib/v2/atlas/lunar.ts); keep its marker and its error
            new["theory"], new["fit"] = m["orbit"]["theory"], m["orbit"]["fit"]
        m["orbit"] = new
        done += 1
        f = new["fit"]
        log(f"{m['id']:14s} P {new['periodDays']:<12} median {f['medianDeg']:6.2f} deg  worst {f['worstDeg']:6.2f} deg")
    data["_sources"]["positions"] = "https://ssd.jpl.nasa.gov/horizons/"
    data["_sources"]["note"] = ("Size, shape and reference plane of each orbit: JPL mean elements. Where the moon is along it: "
                                "fitted to JPL Horizons over 2000 to 2040 by scripts/data/fit-moon-orbits.py; orbit.fit gives the "
                                "error in degrees as seen from the planet. Good for drawing where a moon is, not for navigation. "
                                "Radii and masses exist only for moons a spacecraft or a good telescope has measured.")
    with open(MOONS, "w") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
        f.write("\n")
    log(f"fitted {done}, failed {failed}")


if __name__ == "__main__":
    main()
