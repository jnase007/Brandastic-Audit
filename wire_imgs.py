from pathlib import Path
import re, shutil

root = Path('/Users/brandastic/.openclaw/workspace/Brandastic-Audit')

# Copy images
imgs = {
    'ad-parent-searching.jpg': Path('/Users/brandastic/.openclaw/media/tool-image-generation/ad-parent-searching---ecc1dfc0-4246-41d3-a0f0-655dc5d5bb8d.jpg'),
    'ad-family-laptop.jpg': Path('/Users/brandastic/.openclaw/media/tool-image-generation/linkedin-ad-enrollment---74f89ae2-a5d5-4cbc-a7b0-ab4e3173888f.jpg'),
}
for name, src in imgs.items():
    dst = root / 'assets' / 'ba-office-2027' / name
    if src.exists():
        shutil.copy2(src, dst)
        print(f'Copied {name}')

# Update HTML
p = root / 'gameplan_marketing' / 'brandastic-2027-education.html'
t = p.read_text()

# Clean up placeholder text
for txt in [
    '[ Imagen 4 generating: empty classroom, sunlight on empty desks ]',
    '[ Imagen 4 generating: parent searching schools on phone ]',
    '[ Imagen 4 generating: happy kids in sunny schoolyard ]',
]:
    t = t.replace(txt, '')

# Replace placeholder backgrounds with images
old_bg = 'background:linear-gradient(180deg,#1e293b,#0f172a);height:220px;display:flex;align-items:center;justify-content:center'

# Find ad-1 and replace its placeholder
for sid, img in [('ad-1', 'ad-family-laptop.jpg'), ('ad-2', 'ad-parent-searching.jpg')]:
    idx = t.find(f'id="{sid}"')
    if idx < 0:
        print(f'{sid} not found')
        continue
    sec_end = t.find('</section>', idx)
    sec = t[idx:sec_end]
    pos = sec.find(old_bg)
    if pos >= 0:
        new_bg = f'height:220px;overflow:hidden"><img src="../assets/ba-office-2027/{img}" alt="" style="width:100%;height:100%;object-fit:cover'
        sec = sec[:pos] + new_bg + sec[pos+len(old_bg):]
        t = t[:idx] + sec + t[sec_end:]
        print(f'{sid}: replaced with {img}')
    else:
        print(f'{sid}: old_bg not found')

p.write_text(t)
print(f'Done: {len(t)} bytes, parent img refs: {t.count("ad-parent")}, family img refs: {t.count("ad-family")}')

import subprocess
subprocess.run(['git', 'add', '.'], cwd=str(root))
r = subprocess.run(['git', 'commit', '-m', 'Wire ad images into education deck slides'], capture_output=True, text=True, cwd=str(root))
print(r.stdout[-200:] if r.stdout else r.stderr[-200:])
r2 = subprocess.run(['git', 'push', 'origin', 'HEAD'], capture_output=True, text=True, cwd=str(root))
print(r2.stdout[-200:] if r2.stdout else r2.stderr[-200:])
