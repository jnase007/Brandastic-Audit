#!/bin/bash
# =============================================================================
# Brandastic ROI Page Generator
# Reads audit data JSON and generates a client-ready ROI calculator page
# Usage: ./generate-roi-page.sh <audit-data.json>
# =============================================================================

INPUT=$1

if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
  echo "Usage: ./generate-roi-page.sh <audit-data.json>"
  exit 1
fi

python3 << 'PYEOF'
import json, sys

with open("$INPUT") as f:
    data = json.load(f)

client = data["client"]
domain = data["domain"]
slug = data["slug"]

overview = data.get("semrush", {}).get("overview", {})
keywords = data.get("semrush", {}).get("organic_keywords", [])
competitors = data.get("semrush", {}).get("competitors", [])

organic_traffic = overview.get("Organic Traffic", "0")
organic_kw = overview.get("Organic Keywords", "0")
rank = overview.get("Rank", "N/A")

# Group keywords by theme and calculate avg CPC
total_volume = sum(k["volume"] for k in keywords)
avg_cpc = sum(k["cpc"] for k in keywords) / len(keywords) if keywords else 0.50

# Build keyword rows
kw_rows = ""
for k in keywords[:15]:
    kw_rows += f'''      <tr><td class="mono">{k["keyword"]}</td><td class="mono">{k["volume"]:,}</td><td class="mono">${k["cpc"]:.2f}</td><td>{k["competition"]:.2f}</td></tr>
'''

# Build competitor rows
comp_rows = ""
for c in competitors[:8]:
    comp_rows += f'''      <tr><td class="mono">{c["domain"]}</td><td class="mono">{c["common_keywords"]}</td><td class="mono">{c["organic_keywords"]}</td><td class="mono">{c["organic_traffic"]}</td></tr>
'''

html = f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta name="robots" content="noindex, nofollow">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{client} — ROI Calculator by Brandastic</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{{--bg:#F5F3EF;--card:#fff;--card-border:rgba(0,0,0,0.08);--text:#191F24;--text2:rgba(25,31,36,0.7);--muted:rgba(25,31,36,0.35);--accent:#40B4E5;--purple:#CC22FF;--green:#22c55e;--red:#ef4444;--yellow:#f59e0b}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}}
.container{{max-width:1100px;margin:0 auto;padding:2rem 1.5rem}}
h1{{font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin-bottom:0.25rem}}
h2{{font-size:1.3rem;font-weight:700;margin:2.5rem 0 1rem;color:var(--accent)}}
h3{{font-size:1rem;font-weight:700;margin:1rem 0 0.5rem}}
.sub{{color:var(--text2);margin-bottom:2rem;font-size:0.95rem}}
.card{{background:var(--card);border:1px solid var(--card-border);border-radius:16px;padding:1.5rem;margin:1rem 0}}
.grid-4{{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}}
.stat{{text-align:center;padding:1.25rem;background:var(--card);border:1px solid var(--card-border);border-radius:14px}}
.stat-num{{font-size:1.8rem;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
.stat-label{{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-top:0.25rem}}
table{{width:100%;border-collapse:collapse;font-size:0.85rem;margin:1rem 0}}
th{{text-align:left;padding:0.6rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted);border-bottom:2px solid var(--card-border)}}
td{{padding:0.6rem;border-bottom:1px solid var(--card-border)}}
.mono{{font-family:'SF Mono',monospace;font-weight:600}}
.nav{{position:fixed;top:0;left:0;right:0;z-index:1000;padding:0 2rem;height:56px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--card-border)}}
.nav-brand{{font-weight:700;font-size:1rem;letter-spacing:0.05em;color:var(--text);text-decoration:none}}
.hero{{padding:5rem 0 2rem;text-align:center}}
.btn{{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#40B4E5,#CC22FF);color:#fff;font-family:inherit;font-size:0.85rem;font-weight:600}}
.footer{{text-align:center;padding:3rem 0 2rem;font-size:0.75rem;color:var(--muted);border-top:1px solid var(--card-border);margin-top:3rem}}
@media print{{.stat-num{{-webkit-text-fill-color:#191F24!important;background:none!important}}.nav,.btn{{display:none!important}}body{{background:#fff!important}}}}
</style>
</head>
<body>
<nav class="nav">
  <a href="/" class="nav-brand">BRANDASTIC · {client} ROI</a>
  <button class="btn" onclick="window.print()">Download PDF</button>
</nav>
<div class="container">
<div class="hero">
  <div style="font-size:0.75rem;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:1rem">Google Ads ROI Projection</div>
  <h1>{client}</h1>
  <p class="sub">Revenue Projections — Prepared by Brandastic</p>
  <a href="https://{domain}" target="_blank" style="color:var(--muted);font-size:0.85rem;border-bottom:1px solid var(--muted)">{domain}</a>
</div>

<div style="max-width:600px;margin:0 auto 1.5rem;padding:0.6rem 1rem;border-radius:8px;background:rgba(64,180,229,0.04);border:1px solid rgba(64,180,229,0.1);text-align:center">
  <p style="color:var(--text2);font-size:0.78rem;line-height:1.5;margin:0"><strong style="color:var(--text)">Note:</strong> These projections are benchmarks for goal-setting based on current market data. Actual results will be determined once the campaign is live.</p>
</div>

<h2>Domain Overview</h2>
<div class="grid-4">
  <div class="stat"><div class="stat-num">{organic_traffic}</div><div class="stat-label">Monthly Organic Traffic</div></div>
  <div class="stat"><div class="stat-num">{organic_kw}</div><div class="stat-label">Organic Keywords</div></div>
  <div class="stat"><div class="stat-num">${avg_cpc:.2f}</div><div class="stat-label">Avg CPC</div></div>
  <div class="stat"><div class="stat-num">{rank}</div><div class="stat-label">SEMrush Rank</div></div>
</div>

<h2>Top Organic Keywords</h2>
<div class="card" style="overflow-x:auto">
<table>
  <thead><tr><th>Keyword</th><th>Volume</th><th>CPC</th><th>Competition</th></tr></thead>
  <tbody>
{kw_rows}  </tbody>
</table>
</div>

<h2>Organic Competitors</h2>
<div class="card" style="overflow-x:auto">
<table>
  <thead><tr><th>Competitor</th><th>Common Keywords</th><th>Total Keywords</th><th>Traffic</th></tr></thead>
  <tbody>
{comp_rows}  </tbody>
</table>
</div>

<div class="footer">
  Brandastic — Digital Marketing Agency<br>
  Prepared for {client} · Generated automatically from SEMrush data
</div>
</div>
</body>
</html>'''

output = f"{slug}-roi.html"
with open(output, 'w') as f:
    f.write(html)

print(f"✅ ROI page generated: {output}")
print(f"   Client: {client}")
print(f"   Domain: {domain}")
print(f"   Traffic: {organic_traffic}/mo")
print(f"   Keywords: {len(keywords)}")
print(f"   Competitors: {len(competitors)}")
PYEOF
