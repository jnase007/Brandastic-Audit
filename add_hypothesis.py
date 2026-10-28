from pathlib import Path

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

# Remove old broken commenting system
import re
# Remove old note-btn CSS
t = re.sub(r'/\* XD-style commenting system \*/[\s\S]*?</style>', '</style>', t, count=1)
# Remove old sidebar HTML
t = re.sub(r'<div class="notes-sidebar"[\s\S]*?</div>\s*</div>\s*</div>', '', t, count=1)
# Remove old export bar
t = re.sub(r'<div class="export-bar">[\s\S]*?</div>', '', t)

# Remove broken toggleNotes button from toolbar but keep the toolbar
t = t.replace('<button class="btn" type="button" onclick="toggleNotes()" style="background:#f59e0b;color:#fff;border:1px solid #f59e0b;border-radius:10px;font-weight:800;cursor:pointer">Notes</button>', '')

# Add Hypothes.is - proven annotation tool, one script
hypothesis_script = '<script src="https://hypothes.is/embed.js" async></script>'

if 'hypothes.is' not in t:
    t = t.replace('</head>', hypothesis_script + '</head>')
    print("Hypothes.is added")

# Also add a simple "Annotate" button in the toolbar that opens Hypothesis sidebar
t = t.replace(
    '<span class="hint">Education growth strategy</span>',
    '<button class="btn btn-g" type="button" onclick="if(window.hypothesisConfig)window.hypothesisConfig();else{var s=document.querySelector(\'.annotator-frame\');if(s)s.style.display=s.style.display===\'none\'?\'\':\'none\';}" style="background:#f59e0b;color:#fff;border-color:#f59e0b">Annotate</button><span class="hint">Education growth strategy · highlight any text to add notes</span>'
)

p.write_text(t)
print(f"Has hypothesis: {'hypothes.is' in t}")
print(f"Sections: {t.count('<section')}")

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "Replace broken custom notes with Hypothes.is annotation tool"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
