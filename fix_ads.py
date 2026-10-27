from pathlib import Path
import re

root = Path('/Users/brandastic/.openclaw/workspace/Brandastic-Audit')
p = root / 'gameplan_marketing' / 'brandastic-2027-education.html'
t = p.read_text()

print(f'File: {len(t)} bytes, sections: {t.count("<section")}')

# 1. Replace placeholder text with actual images
# Ad 1 - empty classroom (currently "Imagen 4 generating...")
t = re.sub(
    r'<p style="color:rgba(255,255,255,.4)[^"]*">[^<]*Imagen 4[^<]*empty classroom[^<]*</p>',
    '',
    t, flags=re.I
)
t = re.sub(
    r'<p style="color:rgba(255,255,255,.5)[^"]*">[^<]*Imagen 4[^<]*empty[^<]*</p>',
    '',
    t, flags=re.I
)

# Ad 2 - parent searching
t = re.sub(
    r'<p style="color:rgba(255,255,255,.4)[^"]*">[^<]*Imagen 4[^<]*parent[^<]*</p>',
    '',
    t, flags=re.I
)

# Ad 3 - schoolyard/families  
t = re.sub(
    r'<p style="color:rgba(255,255,255,.4)[^"]*">[^<]*Imagen 4[^<]*kids[^<]*</p>',
    '',
    t, flags=re.I
)

# Remove ALL remaining Imagen 4 placeholder text
t = re.sub(r'<p[^>]*>[^<]*Imagen 4[^<]*</p>', '', t)
t = re.sub(r'[ Imagen 4[^]]*]', '', t)

# Now replace the gradient placeholder divs with real images
# Find ad sections and replace their image area
for sid, img in [('ad-1', 'ad-empty-classroom.jpg'), ('ad-2', 'ad-parent-searching.jpg'), ('ad-3', 'ad-thriving-school.jpg')]:
    idx = t.find(f'id="{sid}"')
    if idx < 0:
        print(f'{sid}: NOT FOUND')
        continue
    sec_end = t.find('</section>', idx)
    sec = t[idx:sec_end]
    
    # Replace the dark gradient placeholder with real image
    old_patterns = [
        'background:linear-gradient(180deg,#1e293b,#0f172a);height:220px;display:flex;align-items:center;justify-content:center',
        'background:linear-gradient(180deg,#1a2540,#0d1829);height:220px;display:flex;align-items:center;justify-content:center',
    ]
    for old in old_patterns:
        if old in sec:
            new = f'height:220px;overflow:hidden"><img src="../assets/ba-office-2027/{img}" alt="" style="width:100%;height:100%;object-fit:cover'
            sec = sec.replace(old, new, 1)
            t = t[:idx] + sec + t[sec_end:]
            print(f'{sid}: wired {img}')
            break
    else:
        # Check if image is already wired
        if img in sec:
            print(f'{sid}: already has {img}')
        else:
            print(f'{sid}: gradient pattern not found, searching...')
            # Find any gradient in this section
            grads = re.findall(r'linear-gradient([^)]+)', sec)
            print(f'  Gradients found: {len(grads)}')

# 2. Fix ad slide padding - add proper margins and centering
css_fix = """<style>
/* Fix ad slide layout - proper padding and centered content */
[id^="ad-"] .slide-inner { padding: 2.2rem 3rem 1.8rem !important; }
[id^="ad-"] .grid2 { max-width: 1000px; margin-left: auto; margin-right: auto; }
[id^="ad-"] .h2 { max-width: 600px !important; }
</style>"""

if 'Fix ad slide layout' not in t:
    t = t.replace('</head>', css_fix + '</head>')
    print('Added ad padding CSS')

p.write_text(t)
print(f'Final: {len(t)} bytes')

import subprocess
subprocess.run(['git', 'add', '.'], cwd=str(root))
r = subprocess.run(['git', 'commit', '-m', 'Wire ad images + fix ad slide padding/margins'], capture_output=True, text=True, cwd=str(root))
print(r.stdout[-150:] if r.stdout else r.stderr[-150:])
r2 = subprocess.run(['git', 'push', 'origin', 'HEAD'], capture_output=True, text=True, cwd=str(root))
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
