"""Check that every link inside the written content points at something that exists.

Run:  python3 -I scripts/check-content.py     (or: npm run test:content)

Checks  each lesson's view target, needs, next and terms
        each glossary term's see and lesson
        each fact's about list
against the lessons, the glossary, the bodies in src/data, the far places in src/lib/v2/atlas/places.ts
and the ruler's landmarks in src/lib/v2/atlas/landmarks.ts.
Prints every broken link and exits 1 if there are any.
"""
import glob, json, os, re, sys
import yaml

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
def path(*p): return os.path.join(ROOT, *p)

lessons = {}
for f in sorted(glob.glob(path('src/content/lessons/*/lesson.yaml'))):
    lessons[os.path.basename(os.path.dirname(f))] = yaml.safe_load(open(f, encoding='utf-8'))

terms = {}
for f in sorted(glob.glob(path('src/content/glossary/*.yaml'))):
    for t in yaml.safe_load(open(f, encoding='utf-8'))['terms']:
        terms[t['id']] = t

facts = []
for f in sorted(glob.glob(path('src/content/facts/*.yaml'))):
    facts += yaml.safe_load(open(f, encoding='utf-8'))['facts']

# everything the 3D view can be pointed at: bodies, then the far places
places = set(re.findall(r"\{ id: '([a-z0-9-]+)'", open(path('src/lib/v2/atlas/places.ts'), encoding='utf-8').read()))
bodies = set(re.findall(r"\bslug: '([a-z0-9-]+)'", open(path('src/data/bodies.ts'), encoding='utf-8').read()))
for f in glob.glob(path('src/data/bodies/*.json')):
    def walk(v):
        if isinstance(v, dict):
            if isinstance(v.get('id'), str): bodies.add(v['id'])
            for x in v.values(): walk(x)
        elif isinstance(v, list):
            for x in v: walk(x)
    walk(json.load(open(f, encoding='utf-8')))
targets = bodies | places
# a fact may also be about a landmark on the atlas ruler, such as a spacecraft
landmarks = set(re.findall(r"\bid: '([a-z0-9-]+)'", open(path('src/lib/v2/atlas/landmarks.ts'), encoding='utf-8').read()))

bad = []
for lid, l in lessons.items():
    t = (l.get('view') or {}).get('target')
    if t and t not in targets: bad.append(f'lesson {lid}: view target "{t}" is not a body or a place')
    for key, pool, what in (('needs', lessons, 'lesson'), ('next', lessons, 'lesson'), ('terms', terms, 'glossary term')):
        for x in l.get(key) or []:
            if x not in pool: bad.append(f'lesson {lid}: {key} has "{x}", which is not a {what}')
        if key != 'terms' and lid in (l.get(key) or []): bad.append(f'lesson {lid}: {key} points at itself')
    for level in ('first-look', 'how-it-works'):
        f = path('src/content/lessons', lid, level + '.md')
        if not os.path.exists(f): bad.append(f'lesson {lid}: no {level}.md')
        # a dollar sign starts an equation, and equations belong in The physics and The frontier
        elif '$' in open(f, encoding='utf-8').read(): bad.append(f'lesson {lid}: {level}.md has a $ in it, which would be set as an equation')

for tid, t in terms.items():
    for x in t.get('see') or []:
        if x not in terms: bad.append(f'glossary {tid}: see has "{x}", which is not a glossary term')
    if t.get('lesson') and t['lesson'] not in lessons: bad.append(f'glossary {tid}: lesson "{t["lesson"]}" does not exist')
    v = (t.get('view') or {}).get('target')
    if v and v not in targets: bad.append(f'glossary {tid}: view target "{v}" is not a body or a place')

for f in facts:
    for x in f['about']:
        if x not in targets and x not in lessons and x not in landmarks: bad.append(f'fact {f["id"]}: about has "{x}", which is not a body, a place, a landmark or a lesson')

for b in bad: print(b)
print(f'{len(lessons)} lessons, {len(terms)} glossary terms, {len(facts)} facts, {len(targets)} places to point at: ' + (f'{len(bad)} broken links' if bad else 'all links hold'))
sys.exit(1 if bad else 0)
