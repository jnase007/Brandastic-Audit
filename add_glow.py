from pathlib import Path

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

# Add blue glow CSS for ad mockup cards
glow_css = """<style>
/* Blue glow behind ad mockup cards */
[id^="ad-"] .card {
  box-shadow: 0 0 40px rgba(6,68,237,.35), 0 0 80px rgba(6,68,237,.15), 0 8px 30px rgba(0,0,0,.3) !important;
  border: 1px solid rgba(6,68,237,.25) !important;
}
</style>"""

if "Blue glow behind ad" not in t:
    t = t.replace("</head>", glow_css + "</head>")
    print("Blue glow CSS added")

p.write_text(t)

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "Add blue glow behind ad mockup cards"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
