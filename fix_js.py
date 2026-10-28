from pathlib import Path

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

# Check if the sidebar HTML and JS are actually in the file
has_sidebar = 'notes-sidebar' in t
has_func = 'function toggleNotes' in t
has_btn = 'toggleNotes()' in t

print(f"Sidebar HTML: {has_sidebar}")
print(f"toggleNotes function: {has_func}")
print(f"Button onclick: {has_btn}")

# The issue might be the sidebar/script is OUTSIDE the body
# Check positions
body_close = t.rfind('</body>')
sidebar_pos = t.rfind('notes-sidebar')
script_pos = t.rfind('function toggleNotes')

print(f"Body close at: {body_close}")
print(f"Sidebar at: {sidebar_pos}")
print(f"Script at: {script_pos}")

if sidebar_pos > body_close:
    print("PROBLEM: sidebar is AFTER body close!")
    # Move it inside
    sidebar_start = t.rfind('<style>', sidebar_pos - 5000, sidebar_pos)
    if sidebar_start < 0:
        sidebar_start = t.rfind('<div class="notes-sidebar"', 0, sidebar_pos + 100)
    everything_after_body = t[body_close:]
    # Extract the notes system from after </body>
    notes_content = everything_after_body.replace('</body>', '').replace('</html>', '').strip()
    # Put it before </body>
    t = t[:body_close] + notes_content + '</body></html>'
    print("Moved sidebar inside body")

if script_pos > body_close or script_pos < 0:
    print("PROBLEM: script missing or after body!")

p.write_text(t)

# Verify
t2 = p.read_text()
bc = t2.rfind('</body>')
sp = t2.rfind('notes-sidebar')
fp = t2.rfind('function toggleNotes')
print(f"After fix - sidebar at {sp}, script at {fp}, body close at {bc}")
print(f"Sidebar before body: {sp < bc}")
print(f"Script before body: {fp < bc}")

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "Fix: move notes sidebar inside body tag"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
