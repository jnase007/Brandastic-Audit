#!/usr/bin/env python3
import json, re
from pathlib import Path

base = Path(__file__).resolve().parent
raw_path = Path('/Users/brandastic/.openclaw/workspace/media/kajabi-notes/course-downloads/all-downloads.jsonl')
raw = raw_path.read_text(errors='replace')

by_title = {}
lesson_dls = {}

for line in raw.splitlines():
    line = line.strip().strip('"')
    if not line.startswith('{'):
        continue
    obj = None
    for candidate in (line, line.encode('utf-8').decode('unicode_escape')):
        try:
            obj = json.loads(candidate)
            break
        except Exception:
            continue
    if not obj:
        continue
    url = obj.get('url') or ''
    dls = obj.get('dls') or []
    if not dls or not url:
        continue
    for d in dls:
        title = (d.get('text') or '').replace('\xa0', ' ').strip()
        href = d.get('href') or ''
        if not title or 'courses/downloads' not in href:
            continue
        m = re.search(r'/downloads/(\d+)/', href)
        did = int(m.group(1)) if m else 0
        key = title.upper()
        prev = by_title.get(key)
        if not prev or did > prev['id']:
            by_title[key] = {'title': title, 'href': href, 'id': did, 'lesson_url': url}
        lesson_dls.setdefault(url, {})
        p2 = lesson_dls[url].get(key)
        if not p2 or did > p2['id']:
            lesson_dls[url][key] = {'title': title, 'href': href, 'id': did, 'lesson_url': url}

resources = sorted(by_title.values(), key=lambda x: x['title'].lower())
(base / 'course-downloads-catalog.json').write_text(json.dumps(resources, indent=2))
print('TOTAL UNIQUE RESOURCES', len(resources))
for r in resources:
    print('-', r['title'])

LESSON_MAP = {
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516250': 'course-sales-process.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516251': 'course-sales-team.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516252': 'course-sales-comp.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516322': 'course-sales-pitch.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516328': 'course-sales-pricing.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516329': 'course-sales-contracts.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331859/posts/2169516348': 'course-mkt-position.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331859/posts/2169516351': 'course-mkt-brand.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331859/posts/2169516355': 'course-mkt-channels.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331859/posts/2169516357': 'course-mkt-budget.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331860/posts/2169516422': 'course-fin-dept.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331860/posts/2169516427': 'course-fin-pl.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331860/posts/2169516501': 'course-fin-monthend.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331860/posts/2169516506': 'course-fin-kpis.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331860/posts/2169516508': 'course-fin-model.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331860/posts/2169516511': 'course-fin-reporting.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331861/posts/2169516373': 'course-ops-jit.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331861/posts/2169516384': 'course-ops-global.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331861/posts/2169516391': 'course-ops-talent-gate.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331861/posts/2169516397': 'course-ops-kpis.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331861/posts/2169516402': 'course-ops-reporting.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331861/posts/2169516413': 'course-ops-referrals.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516526': 'course-people-hiring.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516711': 'course-people-jd.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516712': 'course-people-onboard.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516715': 'course-people-1on1.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516734': 'course-people-benefits.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516760': 'course-people-perf.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516745': 'course-people-bonus.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516724': 'course-people-allhands.html',
    'https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331862/posts/2169516730': 'course-people-retreats.html',
}

idx = (base / 'index.html').read_text()
nav0 = re.search(r'<nav[\s\S]*?</nav>', idx).group(0)

def make_nav(active):
    n = re.sub(r'\sclass="([^\"]*)\bon\b([^\"]*)"', r' class="\1\2"', nav0)
    n = re.sub(r' class="\s*"', '', n)
    if 'course-downloads.html' not in n:
        n = n.replace(
            'href="/gameplan_marketing/agency-academy-course.html">Course hub</a>',
            'href="/gameplan_marketing/agency-academy-course.html">Course hub</a>\n<a class="item" href="/gameplan_marketing/course-downloads.html">Course downloads</a>',
            1,
        )
    if active.startswith('course') or active in ('agency-academy-course.html', 'course-downloads.html'):
        n = n.replace('<details class="nav-fold" >\n<summary>Course · next</summary>', '<details class="nav-fold" open>\n<summary>Course · next</summary>', 1)
        n = n.replace('<details class="nav-fold">\n<summary>Course · next</summary>', '<details class="nav-fold" open>\n<summary>Course · next</summary>', 1)
    t = f'href="/gameplan_marketing/{active}"'
    if t in n:
        n = n.replace(t, t + ' class="on"', 1)
        n = re.sub(r'class="(item[^\"]*)" class="on"', r'class="\1 on"', n)
    return n

BOOT = """<script>(function(){try{var t=localStorage.getItem('ba_strategies_theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();</script>"""
THEME = """\n<script>(function(){var KEY="***";function apply(t){if(t!==\"dark\")t=\"light\";document.documentElement.setAttribute(\"data-theme\",t);try{localStorage.setItem(KEY,t)}catch(e){}var L=document.getElementById(\"theme-light\"),D=document.getElementById(\"theme-dark\");if(L&&D){L.classList.toggle(\"on\",t===\"light\");D.classList.toggle(\"on\",t===\"dark\")}document.querySelectorAll(\"img.brand-logo,a.brand-lockup img\").forEach(function(img){img.style.height=\"24px\";img.style.width=\"auto\";img.style.objectFit=\"contain\";img.style.filter=\"none\";var s=img.getAttribute(\"src\")||\"\";img.setAttribute(\"src\",t===\"dark\"?s.replace(\"logo-black\",\"logo-white\"):s.replace(\"logo-white\",\"logo-black\"))})}var s=null;try{s=localStorage.getItem(KEY)}catch(e){}apply(s===\"dark\"?\"dark\":\"light\");document.addEventListener(\"click\",function(e){var b=e.target.closest(\"[data-theme-set]\");if(b)apply(b.getAttribute(\"data-theme-set\"))})})();</script>\n"""
GENTLE = """<script>(function(){var a=document.querySelector(\"#side-nav a.on, nav a.on\");if(!a)return;var d=a.closest(\"details\");if(d)d.open=true;})();</script>"""

rows = []
for r in resources:
    hub = LESSON_MAP.get(r['lesson_url'], '')
    hub_cell = f'<a href="/gameplan_marketing/{hub}">Hub page</a>' if hub else '—'
    rows.append(
        f"<tr><td><strong>{r['title']}</strong></td>"
        f"<td><a class=\"btn\" href=\"{r['href']}\" target=\"_blank\" rel=\"noopener\">Download on Kajabi</a></td>"
        f"<td><a href=\"{r['lesson_url']}\" target=\"_blank\" rel=\"noopener\">Lesson</a></td>"
        f"<td>{hub_cell}</td></tr>"
    )

dl_page = f'''<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Course downloads · all Agency Academy files</title>
<link rel="stylesheet" href="/gameplan_marketing/_shell.css"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
{BOOT}
</head><body><div class="layout">
{make_nav('course-downloads.html')}
{GENTLE}
<main>
<div class="print-bar no-print"><button class="btn" onclick="window.print()">Print</button>
<a class="btn g" href="/gameplan_marketing/agency-academy-course.html">Course map</a></div>
<div class="crumb">Agency Academy · downloads</div>
<span class="badge rev">{len(resources)} resources linked</span>
<h1>All course downloads</h1>
<p class="lead">Every downloadable file from the live Agency Academy course. Click <strong>Download on Kajabi</strong> while logged in — same files under DOWNLOADS on each lesson.</p>
<div class="callout"><strong>How to use:</strong> Stay logged into Kajabi. Each button opens the real course file. We also link the lesson and our Brandastic hub page.</div>
<div class="card rev">
<h3>Example: Sales Process Spreadsheet</h3>
<p>From <em>How To Build A Sales Process</em> — the DOWNLOADS item in your screenshot.</p>
<p>
<a class="btn" href="https://agencyacademy.mykajabi.com/courses/downloads/2164075971/sales_process_-_gm_course-xlsx" target="_blank" rel="noopener">Download Sales Process Spreadsheet</a>
<a class="btn g" href="https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516250" target="_blank" rel="noopener">Open lesson on Kajabi</a>
<a class="btn g" href="/gameplan_marketing/course-sales-process.html">Hub: Sales process</a>
</p>
</div>
<div class="card">
<h3>Full list ({len(resources)})</h3>
<table>
<thead><tr><th>Resource</th><th>File</th><th>Kajabi lesson</th><th>Our page</th></tr></thead>
<tbody>
{''.join(rows)}
</tbody>
</table>
</div>
<div class="foot">Catalog complete from live Kajabi crawl · 2026-10-12</div>
</main></div>
{THEME}
</body></html>'''
(base / 'course-downloads.html').write_text(dl_page)
print('downloads page written')

updated = 0
for lesson_url, hub_file in LESSON_MAP.items():
    p = base / hub_file
    if not p.exists():
        continue
    dmap = lesson_dls.get(lesson_url) or {}
    if not dmap:
        for r in resources:
            if r['lesson_url'] == lesson_url:
                dmap[r['title'].upper()] = r
    t = p.read_text()
    hm = re.search(r'<h1>([^<]+)</h1>', t)
    title = hm.group(1) if hm else hub_file.replace('.html', '').replace('-', ' ').title()
    dl_items = sorted(dmap.values(), key=lambda x: x['title'].lower()) if dmap else []
    if dl_items:
        lis = ''.join(
            f'<li><a class="btn" href="{d["href"]}" target="_blank" rel="noopener">{d["title"]}</a></li>'
            for d in dl_items
        )
        block = f'''
<div class="card rev" id="downloads">
<h3>Downloads from this lesson</h3>
<p>Same files as the DOWNLOADS section on Kajabi. Open while logged in.</p>
<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.5rem">{lis}</ul>
<p style="margin-top:.75rem"><a href="{lesson_url}" target="_blank" rel="noopener">Open full lesson on Kajabi</a> · <a href="/gameplan_marketing/course-downloads.html">All course downloads</a></p>
</div>
'''
        badge = 'Has downloads'
    else:
        block = f'''
<div class="card" id="downloads">
<h3>Downloads</h3>
<p>No separate download files found for this lesson in the course crawl. <a href="{lesson_url}" target="_blank" rel="noopener">Open lesson on Kajabi</a> · <a href="/gameplan_marketing/course-downloads.html">All course downloads</a></p>
</div>
'''
        badge = 'Queued for detail pass'

    page = f'''<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>{title} · Agency Academy</title>
<link rel="stylesheet" href="/gameplan_marketing/_shell.css"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
{BOOT}
</head><body><div class="layout">
{make_nav(hub_file)}
{GENTLE}
<main>
<div class="print-bar no-print"><button class="btn" onclick="window.print()">Print</button>
<a class="btn g" href="/gameplan_marketing/agency-academy-course.html">Course map</a>
<a class="btn g" href="/gameplan_marketing/course-downloads.html">All downloads</a></div>
<div class="crumb">Agency Academy course</div>
<span class="badge">{badge}</span>
<h1>{title}</h1>
<p class="lead">Brandastic playbook page for this Agency Academy lesson. Downloads are linked now; full notes fill in as we process each video.</p>
{block}
<div class="card">
<h3>What will go here (detail pass)</h3>
<ul>
<li>What Garrett said (their system)</li>
<li>Numbers / benchmarks / tools named</li>
<li>Exact SOPs and process steps</li>
<li>Brandastic translation + team tickets</li>
</ul>
<p><a href="{lesson_url}" target="_blank" rel="noopener">Watch / read on Kajabi</a></p>
</div>
<div class="foot">Downloads linked from live course · detail content next</div>
</main></div>
{THEME}
</body></html>'''
    p.write_text(page)
    updated += 1

print('lesson pages updated', updated)

hub_path = base / 'agency-academy-course.html'
hub = hub_path.read_text()
inject = f'''
<div class="card rev">
<h3>Downloads</h3>
<p><strong>{len(resources)} course files</strong> linked (spreadsheets, decks, templates, SOWs).</p>
<p><a class="btn" href="/gameplan_marketing/course-downloads.html">Open full downloads list</a>
<a class="btn g" href="https://agencyacademy.mykajabi.com/courses/downloads/2164075971/sales_process_-_gm_course-xlsx" target="_blank" rel="noopener">Example: Sales Process Spreadsheet</a>
<a class="btn g" href="https://agencyacademy.mykajabi.com/products/agency-academy/categories/2153331858/posts/2169516250" target="_blank" rel="noopener">That lesson on Kajabi</a></p>
</div>
'''
if re.search(r'<h3>Downloads</h3>', hub):
    hub = re.sub(r'<div class="card rev">\s*<h3>Downloads</h3>[\s\S]*?</div>', inject.strip(), hub, count=1)
else:
    hub = hub.replace('<div class="card rev">\n<h3>Documentation status</h3>', inject + '\n<div class="card rev">\n<h3>Documentation status</h3>', 1)
hub_path.write_text(hub)
print('hub updated')
print('DONE')
