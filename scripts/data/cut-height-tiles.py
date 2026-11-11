#!/usr/bin/env python3
"""
Cut a planet's or moon's global height map into the tiles the v2 engine reads.

    python3 scripts/data/cut-height-tiles.py moon --source ldem_64 --out tiles-out
    python3 scripts/data/cut-height-tiles.py mars --source meg128  --out tiles-out

Needs Python 3.10+ and numpy, nothing else. The sources are NASA Planetary Data System
products stored as plain 16-bit rasters on a latitude/longitude grid, so no GDAL is needed.

What it does, in order
  1. download   the source files into the work folder (skipped when already there and complete)
  2. assemble   one global raster at the finest resolution; where the fine product has holes
                (MOLA at 128 px/deg stops at 88 degrees) they are filled from the coarse one
  3. reduce     halve it repeatedly, so coarse tiles are cut from properly averaged data
  4. cut        write {out}/{body}/height/{face}/{level}/{i}/{j}.bin for every tile
  5. describe   write {out}/{body}/height/meta.json: scale, offset, range, sources, licence

Tile format (must match src/lib/v2/engine/dem.ts)
  - the cube-sphere quadtree of src/lib/v2/engine/tilebuild.ts: same faces, same even-area map
  - 129 x 129 samples with a shared edge, plus a 2-sample border: 133 x 133 = 17,689 values
  - raw little-endian signed 16-bit, row by row; row = t (index b), column = s (index a);
    sample (a, b), each from -2 to 130, is at offset ((b + 2) * 133 + (a + 2)) * 2
  - sample (a, b) of tile (face, level, i, j) sits at
        s = -1 + (i * 128 + a) * 2 / (128 * 2**level),  likewise t from j and b
    through face_dir(); border samples continue the same formula past the face's edge
  - height in metres above the reference radius = value * scale + offset
  - with --gzip each file is gzip-compressed (same name); the engine detects that by itself

Body-fixed frame: +y is the north pole, +x is latitude 0 longitude 0, east is positive, so
    x = cos(lat) cos(lon),  y = sin(lat),  z = -cos(lat) sin(lon)
"""
from __future__ import annotations

import argparse
import datetime
import gzip
import hashlib
import json
import math
import os
import sys
import urllib.request
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass, field

import numpy as np

TILE = 128  # intervals per tile side
BORDER = 2
N = TILE + 1 + 2 * BORDER  # 133

LOLA = "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/"
MOLA = "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/"


@dataclass
class Raster:
    """One source file: a block of 16-bit samples on a latitude/longitude grid, pixel centres
    half a pixel in from the edges, rows running north to south, columns west to east."""
    url: str
    ppd: int  # pixels per degree
    top_lat: float = 90.0
    west_lon: float = 0.0
    lat_span: float = 180.0
    lon_span: float = 360.0
    dtype: str = "<i2"  # LOLA is little-endian, MOLA big-endian
    dn_scale: float = 1.0  # metres per stored unit

    @property
    def name(self) -> str:
        return self.url.rsplit("/", 1)[1]

    @property
    def shape(self) -> tuple[int, int]:
        return round(self.lat_span * self.ppd), round(self.lon_span * self.ppd)


@dataclass
class Source:
    label: str
    cite: str
    rasters: list[Raster]
    fill: Raster | None = None  # coarse global product used where the fine one has no data


@dataclass
class BodyConfig:
    body: str
    radius: float  # reference radius the heights are measured from, metres
    datum: str
    scale: float  # metres per stored step in the tiles
    offset: float
    sources: dict[str, Source] = field(default_factory=dict)
    licence: str = "Public domain (NASA Planetary Data System). Credit as cited."


def lola(ppd: int) -> Source:
    return Source(
        label=f"LOLA LDEM, {ppd} pixels per degree",
        cite="Smith, D. E. et al. LRO Lunar Orbiter Laser Altimeter gridded data records, "
             "LRO-L-LOLA-4-GDR-V1.0, NASA Planetary Data System, 2010 onwards. "
             "Neumann, G. A. (PDS Geosciences Node).",
        rasters=[Raster(LOLA + f"ldem_{ppd}.img", ppd, dtype="<i2", dn_scale=0.5)],
    )


def mola(ppd: int) -> Source:
    letter = {4: "c", 8: "d", 16: "e", 32: "f", 64: "g", 128: "h"}[ppd]
    folder = MOLA + f"meg{ppd:03d}/"
    cite = ("Smith, D. E. et al. Mars Global Surveyor Laser Altimeter Mission Experiment Gridded "
            "Data Record, MGS-M-MOLA-5-MEGDR-L3-V1.0, NASA Planetary Data System, 2003.")
    base = Raster(MOLA + "meg016/megt90n000eb.img", 16, dtype=">i2")
    if ppd <= 32:
        return Source(f"MOLA MEGDR topography, {ppd} pixels per degree", cite,
                      [Raster(folder + f"megt90n000{letter}b.img", ppd, dtype=">i2")])
    if ppd == 64:  # four files, 90 x 180 degrees each
        rs = [Raster(folder + f"megt{lat}{lon:03d}gb.img", 64, top, lon, 90, 180, ">i2")
              for lat, top in (("90n", 90), ("00n", 0)) for lon in (0, 180)]
        return Source("MOLA MEGDR topography, 64 pixels per degree", cite, rs)
    # 128 px/deg: sixteen files, 44 x 90 degrees each, covering 88 N to 88 S only
    rs = [Raster(folder + f"megt{lat}{lon:03d}hb.img", 128, top, lon, 44, 90, ">i2")
          for lat, top in (("88n", 88), ("44n", 44), ("00n", 0), ("44s", -44)) for lon in (0, 90, 180, 270)]
    return Source("MOLA MEGDR topography, 128 pixels per degree (16 px/deg poleward of 88 degrees)", cite, rs, fill=base)


BODIES = {
    "moon": BodyConfig(
        "moon", 1_737_400.0, "height above a sphere of radius 1,737.4 km", 0.5, 0.0,
        {f"ldem_{p}": lola(p) for p in (4, 16, 64, 128)},
    ),
    # MOLA 'topography' is height above the areoid (Mars's equivalent of sea level), the figure
    # people quote: Olympus Mons 21.2 km, Hellas -8.2 km. It is drawn on a sphere of the mean radius.
    "mars": BodyConfig(
        "mars", 3_389_500.0, "height above the MOLA areoid, drawn on a sphere of the mean radius 3,389.5 km", 1.0, 0.0,
        {f"meg{p:03d}": mola(p) for p in (16, 32, 64, 128)},
    ),
}

# ---------------------------------------------------------------- the cube, as in tilebuild.ts

FACES = [
    ((1, 0, 0), (0, 0, -1), (0, 1, 0)),
    ((-1, 0, 0), (0, 0, 1), (0, 1, 0)),
    ((0, 1, 0), (1, 0, 0), (0, 0, -1)),
    ((0, -1, 0), (1, 0, 0), (0, 0, 1)),
    ((0, 0, 1), (1, 0, 0), (0, 1, 0)),
    ((0, 0, -1), (-1, 0, 0), (0, 1, 0)),
]


def face_dir(face: int, s: np.ndarray, t: np.ndarray):
    """Unit direction for face coordinates s, t: the same even-area map as faceDir() in tilebuild.ts."""
    n, u, v = FACES[face]
    x = n[0] + u[0] * s + v[0] * t
    y = n[1] + u[1] * s + v[1] * t
    z = n[2] + u[2] * s + v[2] * t
    x2, y2, z2 = x * x, y * y, z * z
    sx = x * np.sqrt(1 - y2 / 2 - z2 / 2 + (y2 * z2) / 3)
    sy = y * np.sqrt(1 - z2 / 2 - x2 / 2 + (z2 * x2) / 3)
    sz = z * np.sqrt(1 - x2 / 2 - y2 / 2 + (x2 * y2) / 3)
    l = np.sqrt(sx * sx + sy * sy + sz * sz)
    return sx / l, sy / l, sz / l


def tile_lat_lon(face: int, level: int, i: int, j: int):
    per = TILE * 2 ** level
    a = np.arange(-BORDER, TILE + BORDER + 1, dtype=np.float64)
    s = -1 + (i * TILE + a) * 2 / per
    t = -1 + (j * TILE + a) * 2 / per
    S, T = np.meshgrid(s, t)  # rows are t, columns are s
    x, y, z = face_dir(face, S, T)
    lat = np.degrees(np.arcsin(np.clip(y, -1, 1)))
    lon = np.degrees(np.arctan2(-z, x)) % 360.0
    return lat, lon


# ---------------------------------------------------------------- download, assemble, reduce

def log(*a):
    print(*a, file=sys.stderr, flush=True)


def download(r: Raster, work: str) -> str:
    path = os.path.join(work, r.name)
    want = r.shape[0] * r.shape[1] * 2
    if os.path.exists(path) and os.path.getsize(path) == want:
        return path
    log(f"  downloading {r.name} ({want / 1e6:.0f} MB)")
    tmp = path + ".part"
    req = urllib.request.Request(r.url, headers={"User-Agent": "height-tile-cutter"})
    with urllib.request.urlopen(req, timeout=120) as resp, open(tmp, "wb") as f:
        while chunk := resp.read(1 << 22):
            f.write(chunk)
    if os.path.getsize(tmp) != want:
        raise SystemExit(f"{r.name}: expected {want} bytes, got {os.path.getsize(tmp)}. Delete it and run again.")
    os.replace(tmp, path)
    return path


def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(1 << 22):
            h.update(chunk)
    return h.hexdigest()


def sample(grid: np.ndarray, ppd: float, lat: np.ndarray, lon: np.ndarray) -> np.ndarray:
    """Bilinear sample of a global raster (rows north to south from 90, columns east from 0)."""
    H, W = grid.shape
    x = lon * ppd - 0.5
    y = (90.0 - lat) * ppd - 0.5
    x0 = np.floor(x).astype(np.int64)
    y0 = np.floor(y).astype(np.int64)
    fx = x - x0
    fy = y - y0
    xa, xb = x0 % W, (x0 + 1) % W
    ya, yb = np.clip(y0, 0, H - 1), np.clip(y0 + 1, 0, H - 1)
    g = grid
    top = g[ya, xa] * (1 - fx) + g[ya, xb] * fx
    bot = g[yb, xa] * (1 - fx) + g[yb, xb] * fx
    return top * (1 - fy) + bot * fy


def assemble(src: Source, work: str, tag: str):
    """One global raster of metres * (1 / dn_scale) as native int16, memory-mapped. Returns (array, ppd, dn_scale)."""
    ppd = src.rasters[0].ppd
    dn = src.rasters[0].dn_scale
    H, W = 180 * ppd, 360 * ppd
    paths = [download(r, work) for r in src.rasters]
    if len(src.rasters) == 1 and src.rasters[0].shape == (H, W) and src.rasters[0].dtype == "<i2" and sys.byteorder == "little":
        return np.memmap(paths[0], dtype="<i2", mode="r", shape=(H, W)), ppd, dn, paths
    out_path = os.path.join(work, f"{tag}.global.i16")
    done = out_path + ".done"
    if not os.path.exists(done):
        log("  assembling the global raster")
        out = np.memmap(out_path, dtype=np.int16, mode="w+", shape=(H, W))
        if src.fill is not None:
            fp = download(src.fill, work)
            paths.append(fp)
            base = np.memmap(fp, dtype=src.fill.dtype, mode="r", shape=src.fill.shape)
            lon = (np.arange(W) + 0.5) / ppd
            for y0 in range(0, H, 512):
                rows = np.arange(y0, min(H, y0 + 512))
                lat = 90.0 - (rows + 0.5) / ppd
                LAT, LON = np.meshgrid(lat, lon, indexing="ij")
                out[rows[0]:rows[-1] + 1] = np.rint(sample(base, src.fill.ppd, LAT, LON) * (src.fill.dn_scale / dn))
        for r, p in zip(src.rasters, paths):
            a = np.memmap(p, dtype=r.dtype, mode="r", shape=r.shape)
            y0 = round((90.0 - r.top_lat) * ppd)
            x0 = round(r.west_lon * ppd)
            for k in range(0, r.shape[0], 1024):
                out[y0 + k:y0 + k + 1024, x0:x0 + r.shape[1]] = a[k:k + 1024]
        out.flush()
        del out
        open(done, "w").close()
    elif src.fill is not None:
        paths.append(download(src.fill, work))
    return np.memmap(out_path, dtype=np.int16, mode="r", shape=(H, W)), ppd, dn, paths


def reduce_all(base: np.ndarray, ppd: int, work: str, tag: str):
    """Halve the raster until it is 1 pixel per degree or coarser. Returns [(array, ppd), ...] finest first."""
    mips = [(base, float(ppd))]
    cur, p, k = base, ppd, 0
    while p > 1 and cur.shape[0] % 2 == 0:
        k += 1
        H, W = cur.shape[0] // 2, cur.shape[1] // 2
        path = os.path.join(work, f"{tag}.mip{k}.i16")
        done = path + ".done"
        if not os.path.exists(done):
            out = np.memmap(path, dtype=np.int16, mode="w+", shape=(H, W))
            for y0 in range(0, H, 1024):
                blk = np.asarray(cur[2 * y0:2 * min(H, y0 + 1024)], dtype=np.float32)
                out[y0:y0 + blk.shape[0] // 2] = np.rint((blk[0::2, 0::2] + blk[0::2, 1::2] + blk[1::2, 0::2] + blk[1::2, 1::2]) * 0.25)
            out.flush()
            del out
            open(done, "w").close()
        cur = np.memmap(path, dtype=np.int16, mode="r", shape=(H, W))
        p = p / 2
        mips.append((cur, float(p)))
    return mips


# ---------------------------------------------------------------- cutting

_G: dict = {}


def _init(mip_specs, dn, scale, offset, out_dir, use_gzip):
    _G["mips"] = [(np.memmap(p, dtype=dt, mode="r", shape=shape), ppd) for p, dt, shape, ppd in mip_specs]
    _G.update(dn=dn, scale=scale, offset=offset, out=out_dir, gzip=use_gzip)


def heights_for(face: int, level: int, i: int, j: int) -> np.ndarray:
    """Metres above the reference radius at every sample of one tile, averaged to suit its level."""
    mips = _G["mips"]
    lat, lon = tile_lat_lon(face, level, i, j)
    need = TILE * 2 ** level / 90.0  # samples per degree in this tile
    lod = min(max(math.log2(mips[0][1] / need), 0.0), len(mips) - 1.0)
    k = int(math.floor(lod))
    f = lod - k
    h = sample(mips[k][0], mips[k][1], lat, lon)
    if f > 1e-6 and k + 1 < len(mips):
        h = h * (1 - f) + sample(mips[k + 1][0], mips[k + 1][1], lat, lon) * f
    return h * _G["dn"]


def cut_row(job):
    face, level, i = job
    lo, hi, nbytes = math.inf, -math.inf, 0
    folder = os.path.join(_G["out"], str(face), str(level), str(i))
    os.makedirs(folder, exist_ok=True)
    for j in range(2 ** level):
        h = heights_for(face, level, i, j)
        v = np.rint((h - _G["offset"]) / _G["scale"])
        if v.min() < -32768 or v.max() > 32767:
            raise SystemExit("heights do not fit 16 bits with this scale and offset")
        inner = h[BORDER:-BORDER, BORDER:-BORDER]
        lo, hi = min(lo, float(inner.min())), max(hi, float(inner.max()))
        raw = v.astype("<i2").tobytes()
        if _G["gzip"]:
            raw = gzip.compress(raw, compresslevel=9, mtime=0)
        with open(os.path.join(folder, f"{j}.bin"), "wb") as fh:
            fh.write(raw)
        nbytes += len(raw)
    return lo, hi, nbytes


def main():
    ap = argparse.ArgumentParser(description="Cut NASA height maps into cube-face tiles for the Heliocodex engine.")
    ap.add_argument("body", choices=sorted(BODIES))
    ap.add_argument("--source", help="which product to cut from (default: the finest listed with --list)")
    ap.add_argument("--list", action="store_true", help="list the sources for this body and stop")
    ap.add_argument("--out", default="tiles-out", help="folder to write into (default tiles-out)")
    ap.add_argument("--work", default="tiles-work", help="folder for downloads and working files")
    ap.add_argument("--max-level", type=int, help="finest tile level (default: the finest the source supports without inventing detail)")
    ap.add_argument("--gzip", action="store_true", help="gzip each tile; about half the size, and the engine reads either")
    ap.add_argument("--jobs", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    a = ap.parse_args()

    cfg = BODIES[a.body]
    if a.list:
        for k, s in cfg.sources.items():
            print(f"{k:10s} {s.label}")
        return
    key = a.source or list(cfg.sources)[-1]
    src = cfg.sources[key]
    os.makedirs(a.work, exist_ok=True)
    tag = f"{a.body}.{key}"

    log(f"{a.body}: {src.label}")
    base, ppd, dn, paths = assemble(src, a.work, tag)
    mips = reduce_all(base, ppd, a.work, tag)
    # finest level whose sample spacing is no finer than the source's (levels beyond would only interpolate)
    natural = max(0, math.floor(math.log2(ppd * 90.0 / TILE) + 0.25))
    max_level = natural if a.max_level is None else a.max_level
    out_dir = os.path.join(a.out, a.body, "height")
    os.makedirs(out_dir, exist_ok=True)

    specs = [(m.filename, m.dtype.str, m.shape, p) for m, p in mips]
    jobs = [(f, L, i) for L in range(max_level + 1) for f in range(6) for i in range(2 ** L)]
    total = sum(6 * 4 ** L for L in range(max_level + 1))
    log(f"  cutting levels 0 to {max_level}: {total:,} tiles")
    lo, hi, nbytes, done = math.inf, -math.inf, 0, 0
    init = (specs, dn, cfg.scale, cfg.offset, out_dir, a.gzip)
    if a.jobs > 1:
        with ProcessPoolExecutor(a.jobs, initializer=_init, initargs=init) as pool:
            for (l, h, n), job in zip(pool.map(cut_row, jobs, chunksize=4), jobs):
                lo, hi, nbytes, done = min(lo, l), max(hi, h), nbytes + n, done + 2 ** job[1]
                if done % 2048 < 2 ** job[1]:
                    log(f"  {done:,} of {total:,}")
    else:
        _init(*init)
        for job in jobs:
            l, h, n = cut_row(job)
            lo, hi, nbytes = min(lo, l), max(hi, h), nbytes + n

    spacing = cfg.radius * math.pi / 2 / (TILE * 2 ** max_level)
    meta = {
        "body": cfg.body,
        "format": 1,
        "radius": cfg.radius,
        "datum": cfg.datum,
        "scale": cfg.scale,
        "offset": cfg.offset,
        "minHeight": math.floor(lo),
        "maxHeight": math.ceil(hi),
        "maxLevel": max_level,
        "samples": TILE + 1,
        "border": BORDER,
        "spacingMetres": round(spacing, 1),
        # what the site may generate between the measurements (and must label as generated)
        "detail": "craters" if cfg.body == "moon" else "bumps",
        "encoding": "int16 little-endian, rows of t then columns of s" + (", gzip" if a.gzip else ""),
        "frame": "+y north pole, +x latitude 0 longitude 0, east positive: x = cos(lat)cos(lon), y = sin(lat), z = -cos(lat)sin(lon)",
        "tiles": total,
        "bytes": nbytes,
        "source": {
            "label": src.label,
            "citation": src.cite,
            "licence": cfg.licence,
            "files": [{"url": r.url, "sha256": sha256(p)} for r, p in zip(src.rasters + ([src.fill] if src.fill else []), paths)],
        },
        "cut": {"script": "scripts/data/cut-height-tiles.py", "date": datetime.date.today().isoformat(), "numpy": np.__version__},
    }
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")
    log(f"  done: {total:,} tiles, {nbytes / 1e6:.1f} MB, heights {lo:.0f} to {hi:.0f} m, {spacing:.0f} m between samples at level {max_level}")
    log(f"  written to {out_dir}")


if __name__ == "__main__":
    main()
