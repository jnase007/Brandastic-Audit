#!/usr/bin/env python3
from pathlib import Path
import re

p = Path(__file__).with_name("planning-2027.html")
t = p.read_text()

style = """
<style id="p2027-theme">
main.sec-plan { max-width: 1000px; }
#one-pager {
  border: 2px solid #0284c7 !important;
  background: linear-gradient(180deg,#F0F9FF,#fff);
}
#one-pager h2 { color: #0369a1; }
#one-pager h3 { color: #0284c7; margin-top: 1.1rem; }
#one-pager table th { background: #e0f2fe !important; color: #0c4a6e !important; }
#client-list { border-left: 4px solid #059669; }
#client-list h2 { color: #047857; }
#client-list h3 {
  color: #0f766e;
  border-bottom: 2px solid #a7f3d0;
  padding-bottom: .35rem;
}
#client-list h4 { color: #065f46; margin-top: 1.1rem; }
section.card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15,23,42,.05);
  margin-bottom: 1.25rem;
}
section.card > h2 { font-size: 1.2rem; letter-spacing: -.02em; }
.money-table th { background: rgba(2,132,199,.12) !important; color: #0369a1 !important; }
.mkt-table thead th { background: #ecfdf5 !important; color: #047857 !important; }
.mkt-table tbody tr:nth-child(even) { background: #f0fdf4; }
.host-table thead th { background: #f1f5f9 !important; color: #334155 !important; }
.host-table tbody tr { background: #f8fafc; }
.forgive-table thead th { background: #fffbeb !important; color: #b45309 !important; }
.forgive-table tbody tr { background: #fffbeb; }
.score-table thead th { background: #f5f3ff !important; color: #5b21b6 !important; }
.score-table tbody tr:nth-child(even) { background: #faf5ff; }
.resource-bar {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin: 1rem 0 1.25rem;
}
.resource-bar a {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .55rem .9rem;
  border-radius: 999px;
  font-size: .82rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid var(--line, #e2e8f0);
}
.resource-bar a.score {
  background: #0284c7;
  color: #fff;
  border-color: #0284c7;
}
.resource-bar a.soft {
  background: #fff;
  color: #0369a1;
}
html[data-theme="dark"] #one-pager { background: rgba(2,132,199,.12); }
html[data-theme="dark"] .mkt-table tbody tr:nth-child(even),
html[data-theme="dark"] .host-table tbody tr,
html[data-theme="dark"] .forgive-table tbody tr,
html[data-theme="dark"] .score-table tbody tr:nth-child(even) {
  background: rgba(255,255,255,.03);
}
html[data-theme="dark"] .resource-bar a.soft {
  background: var(--panel2, #1e293b);
  color: #7dd3fc;
}
@media print {
  #one-pager { break-inside: avoid; }
  .resource-bar a.score {
    color: #000 !important;
    border: 1px solid #000;
    background: #fff !important;
  }
}
</style>
"""

if 'id="p2027-theme"' in t:
    t = re.sub(r'<style id="p2027-theme">[\s\S]*?</style>\n?', style.strip() + "\n", t, count=1)
else:
    t = t.replace("</head>", style + "\n</head>", 1)

SCORE = "https://docs.google.com/spreadsheets/d/1h-O3MynKwL9MhxO2Ytly5gtHd_udyqNJ6n4_OfXLCgY/edit?gid=0#gid=0"

bar = f"""
<div class="resource-bar no-print">
  <a class="score" href="{SCORE}" target="_blank" rel="noopener">Scorecard — leads & sales by channel</a>
  <a class="soft" href="#one-pager">30-min one-pager</a>
  <a class="soft" href="#client-list">Client book</a>
  <a class="soft" href="/gameplan_marketing/goals-vision.html">Goals & vision</a>
</div>
"""

if "Scorecard — leads" not in t and "Scorecard - leads" not in t:
    m = re.search(r'(<p class="lede"[^>]*>[\s\S]*?</p>)', t)
    if m:
        t = t[: m.end()] + "\n" + bar + t[m.end() :]
    else:
        t = t.replace("<h1>2027 planning</h1>", "<h1>2027 planning</h1>\n" + bar, 1)

call = f"""
<div class="resource-bar" style="margin-top:.5rem">
  <a class="score" href="{SCORE}" target="_blank" rel="noopener">Open Scorecard V2 2026 (leads & sales by channel)</a>
</div>
<p class="muted">Use the scorecard in the room when you talk channels — SEO, referrals, and everything else.</p>
"""

if "Open Scorecard V2 2026" not in t:
    anchor = "<p><b>How most new clients came in:</b> SEO + referrals.</p>"
    if anchor in t:
        t = t.replace(anchor, anchor + "\n" + call, 1)
    else:
        t = t.replace(
            "<h2>5) Marketing 2027",
            call + "\n<h2>5) Marketing 2027",
            1,
        )


def add_class_after(marker: str, n: int, cls: str, html: str):
    idx = html.find(marker)
    if idx < 0:
        return html, False
    pos = idx
    for _ in range(n):
        pos = html.find("<table>", pos + 1)
        if pos < 0:
            return html, False
    return html[:pos] + f'<table class="{cls}">' + html[pos + 7 :], True


for marker, n, cls in [
    ('id="client-list"', 1, "money-table"),
    ("Marketing retainers", 1, "mkt-table"),
    ("Hosting / site care", 1, "host-table"),
    ("Forgiven", 1, "forgive-table"),
    ("2027 scoreboard", 1, "score-table"),
]:
    t, ok = add_class_after(marker, n, cls, t)
    print(cls, ok)

p.write_text(t)
print("size", p.stat().st_size)
print("scorecard", t.count("1h-O3MynKwL9MhxO2Ytly5gtHd_udyqNJ6n4_OfXLCgY"))
print("theme", "p2027-theme" in t)
