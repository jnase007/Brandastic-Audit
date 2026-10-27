import subprocess, re, shutil
from pathlib import Path

root = Path('/Users/brandastic/.openclaw/workspace/Brandastic-Audit')
p = root / 'gameplan_marketing' / 'brandastic-2027-education.html'
t = p.read_text()

# Check if body is wiped
slides = t.count('class="slide"')
print(f'Current: {slides} slides')

if slides < 20:
    # Restore from last good version
    r = subprocess.run(['git', 'log', '--format=%H', '--', str(p)], capture_output=True, text=True, cwd=str(root))
    for c in r.stdout.strip().split(chr(10)):
        r2 = subprocess.run(['git', 'show', f'{c}:gameplan_marketing/brandastic-2027-education.html'], capture_output=True, text=True, cwd=str(root))
        sc = r2.stdout.count('class="slide"')
        if sc >= 23:
            t = r2.stdout
            print(f'Restored from {c[:8]}: {sc} slides')
            break

# 1. Replace target table: School | Type | Fit → School | Contact | Title | Email
old_table = '''<tr><th>School / network</th><th>Type</th><th>Location</th><th>Fit</th></tr>'''
new_table = '''<tr><th>School / network</th><th>Contact name</th><th>Title</th><th>Email</th></tr>'''

if old_table in t:
    t = t.replace(old_table, new_table)
    
    # Replace each row
    rows = [
        ('CalOPS peers (online public schools)', 'Online public', 'California', 'TBD from Apollo', 'Director of Enrollment', 'Pull from Apollo'),
        ('Connections Academy', 'Online K-12', 'National', 'TBD from Apollo', 'VP Marketing', 'Pull from Apollo'),
        ('K12 Inc / Stride schools', 'Online K-12', 'National', 'TBD from Apollo', 'Director of Enrollment', 'Pull from Apollo'),
        ('California Virtual Academies (CAVA)', 'Online public', 'California', 'TBD from Apollo', 'Head of School', 'Pull from Apollo'),
        ('Inspire Charter Schools', 'Charter', 'California', 'TBD from Apollo', 'Marketing Director', 'Pull from Apollo'),
        ('Sage Oak Charter Schools', 'Charter', 'California', 'TBD from Apollo', 'Director of Enrollment', 'Pull from Apollo'),
        ('Compass Charter Schools', 'Charter / online', 'California', 'TBD from Apollo', 'Growth Lead', 'Pull from Apollo'),
        ('iLEAD Schools', 'Charter network', 'California', 'TBD from Apollo', 'Enrollment Director', 'Pull from Apollo'),
        ('Opportunities for Learning', 'Charter', 'California', 'TBD from Apollo', 'Marketing Director', 'Pull from Apollo'),
        ('Granada Hills Charter', 'Charter', 'Los Angeles', 'TBD from Apollo', 'VP Marketing', 'Pull from Apollo'),
    ]
    
    for school, stype, loc, name, title, email in rows:
        old_row = f'<td><strong>{school}</strong></td><td>{stype}</td><td>{loc}</td><td><span style="background:var(--teal);color:#fff;padding:.15rem .5rem;border-radius:6px;font-size:.7rem;font-weight:800">FIT A</span></td>'
        new_row = f'<td><strong>{school}</strong></td><td>{name}</td><td>{title}</td><td>{email}</td>'
        if old_row in t:
            t = t.replace(old_row, new_row)
            print(f'  Updated row: {school[:30]}')
    
    # Update note
    t = t.replace(
        'These are starting names from public directories and CalOPS peer networks. The team should verify each one in Apollo and add enrollment director contacts. This list grows weekly.',
        'Starting list from public directories. <strong>Next step: pull these into Apollo and fill in real names and emails.</strong> This list grows weekly as we find more schools.'
    )
    print('Target table updated')
else:
    print('Old table header not found')

# 2. Fix proof one-pager -> 3 case studies
t = t.replace('Write CalOPS proof one-pager', 'Get together 3 case studies (CalOPS, Think Together, Heart School)')
t = t.replace('CalOPS proof one-pager', '3 case studies (CalOPS, Think Together, Heart School)')
t = t.replace('proof one-pager', '3 case studies')

# 3. Wire ad images (copy files + update HTML)
imgs = {
    'ad-parent-searching.jpg': '/Users/brandastic/.openclaw/media/tool-image-generation/ad-parent-searching---ecc1dfc0-4246-41d3-a0f0-655dc5d5bb8d.jpg',
    'ad-thriving-school.jpg': '/Users/brandastic/.openclaw/media/tool-image-generation/ad-thriving-school---2cbd5b16-e6d4-491c-99bb-0ae445596ac7.jpg',
    'ad-family-laptop.jpg': '/Users/brandastic/.openclaw/media/tool-image-generation/linkedin-ad-enrollment---74f89ae2-a5d5-4cbc-a7b0-ab4e3173888f.jpg',
}
for name, src in imgs.items():
    if Path(src).exists():
        shutil.copy2(src, root / 'assets' / 'ba-office-2027' / name)

# Wire images - replace gradient placeholders
old_bg = 'background:linear-gradient(180deg,#1e293b,#0f172a);height:220px;display:flex;align-items:center;justify-content:center'
for sid, img in [('ad-1', 'ad-family-laptop.jpg'), ('ad-2', 'ad-parent-searching.jpg'), ('ad-3', 'ad-thriving-school.jpg')]:
    idx = t.find(f'id="{sid}"')
    if idx < 0:
        continue
    sec_end = t.find('</section>', idx)
    sec = t[idx:sec_end]
    if old_bg in sec:
        new_bg = f'height:220px;overflow:hidden"><img src="../assets/ba-office-2027/{img}" alt="" style="width:100%;height:100%;object-fit:cover'
        sec = sec.replace(old_bg, new_bg, 1)
        t = t[:idx] + sec + t[sec_end:]
        print(f'  {sid}: image wired')

p.write_text(t)
final = t.count('class="slide"')
print(f'Final: {len(t)} bytes, {final} slides')
print(f'  Has Contact name: {"Contact name" in t}')
print(f'  Has 3 case studies: {"3 case studies" in t}')

subprocess.run(['git', 'add', '.'], cwd=str(root))
r = subprocess.run(['git', 'commit', '-m', 'Education deck: target table with contact columns + 3 case studies + ad images'], capture_output=True, text=True, cwd=str(root))
print(r.stdout[-200:] if r.stdout else r.stderr[-200:])
r2 = subprocess.run(['git', 'push', 'origin', 'HEAD'], capture_output=True, text=True, cwd=str(root))
print(r2.stdout[-200:] if r2.stdout else r2.stderr[-200:])
print('DONE')
