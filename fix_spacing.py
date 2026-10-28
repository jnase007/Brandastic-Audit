from pathlib import Path

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

# Add more padding-top on slide-inner when it has a border-top
css_fix = """<style>
/* More space between colored top border and header text */
.slide-inner[style*="border-top"] { padding-top: 2.8rem !important; }
[id] .slide-inner { padding-top: 2.6rem !important; }
.kicker { margin-top: .4rem; }
</style>"""

if "More space between colored top border" not in t:
    t = t.replace("</head>", css_fix + "</head>")
    print("Spacing CSS added")

p.write_text(t)

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "Fix: more space between colored border and header text"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
