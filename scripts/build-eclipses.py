#!/usr/bin/env python3
"""Reads the year pages of NASA's Goddard eclipse site (Fred Espenak and Jean Meeus, Five Millennium Canon)
and writes src/data/eclipses.json: every solar and lunar eclipse from FIRST to LAST, with the moment of greatest
eclipse in Universal Time and the magnitude. Run with `npm run eclipses`; the output is committed, so builds need no network.
Source pages: https://eclipse.gsfc.nasa.gov/OH/OH<year>.html  Credit: "Eclipse Predictions by Fred Espenak and Jean Meeus, NASA's GSFC"."""
import html, json, re, subprocess, sys
FIRST, LAST = 2026, 2030  # the Goddard year pages stop at 2030; later years are only in the decade tables, which give Dynamical Time
MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
out = []
for year in range(FIRST, LAST + 1):
    raw = subprocess.run(['curl', '-s', '-m', '60', f'https://eclipse.gsfc.nasa.gov/OH/OH{year}.html'], capture_output=True, text=True).stdout
    t = re.sub(r'<script.*?</script>|<style.*?</style>', '', raw, flags=re.S)
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t)))
    found = 0
    for m in re.finditer(r'((Annular|Total|Partial|Penumbral|Hybrid) (Solar|Lunar)) Eclipse of (\w+) (\d+).*?Greatest Eclipse \(UT\): (\d\d):(\d\d)(.*?)(?:Gamma|Saros)', t):
        kind, _, body, month, day, hh, mm, rest = m.groups()
        solar = body == 'Solar'
        if solar: mag = re.search(r'Eclipse Magnitude: ([\d.]+)', rest)
        elif kind.startswith('Penumbral'): mag = re.search(r'Penumbral Magnitude: ([\d.]+)', rest)
        else: mag = re.search(r'Umbral Magnitude: ([\d.]+)', rest)
        if not mag: sys.exit(f'no magnitude: {year} {month} {day}')
        out.append({'at': f'{year}-{MONTHS.index(month)+1:02d}-{int(day):02d}T{hh}:{mm}:00Z', 'kind': kind, 'magnitude': float(mag.group(1))})
        found += 1
    if not found: sys.exit(f'nothing found for {year}')
out.sort(key=lambda e: e['at'])
json.dump({'source': "Eclipse Predictions by Fred Espenak and Jean Meeus, NASA's GSFC", 'url': 'https://eclipse.gsfc.nasa.gov/OH/OH{year}.html', 'first': FIRST, 'last': LAST, 'eclipses': out}, open('src/data/eclipses.json', 'w'), indent=1)
print(len(out), 'eclipses', FIRST, '-', LAST)
