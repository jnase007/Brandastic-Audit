from pathlib import Path

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

# Add Notes button before the hint span in the toolbar
hint = '<span class="hint">'
btn = '<button class="btn" type="button" onclick="toggleNotes()" style="background:#f59e0b;color:#fff;border:1px solid #f59e0b;border-radius:10px;font-weight:800;cursor:pointer">Notes</button>'

if 'toggleNotes' not in t[:t.find(hint)] if hint in t else True:
    t = t.replace(hint, btn + hint, 1)
    print("Notes button added to toolbar")
else:
    print("Button already exists")

# Also verify the sidebar exists
if 'notes-sidebar' not in t:
    print("WARNING: sidebar not found - need to add it")
else:
    print("Sidebar present")

# Verify toggleNotes function exists
if 'function toggleNotes' not in t:
    print("WARNING: toggleNotes function missing")
else:
    print("toggleNotes function present")

p.write_text(t)
print(f"File size: {len(t)}")

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "Add Notes button to toolbar"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
