import subprocess, re, shutil
from pathlib import Path

root = Path('/Users/brandastic/.openclaw/workspace/Brandastic-Audit')

# 1. Restore last good version with 23 slides
r = subprocess.run(['git', 'log', '--format=%H', '--', 'gameplan_marketing/brandastic-2027-education.html'], capture_output=True, text=True, cwd=str(root))
t = None
for c in r.stdout.strip().split(chr(10)):
    r2 = subprocess.run(['git', 'show', f'{c}:gameplan_marketing/brandastic-2027-education.html'], capture_output=True, text=True, cwd=str(root))
    sc = r2.stdout.count('class="slide"')
    if sc >= 23:
        t = r2.stdout
        print(f'Restored from {c[:8]}: {sc} slides, {len(t)} bytes')
        break
    elif sc > 0:
        print(f'{c[:8]}: {sc} slides')

if not t or t.count('class="slide"') < 23:
    print('ERROR: no good version found')
    exit(1)

# 2. Change "proof one-pager" to "3 case studies"
for old, new in [
    ('Write CalOPS proof one-pager', 'Get together 3 case studies (CalOPS, Think Together, Heart School)'),
    ('CalOPS proof one-pager', '3 case studies (CalOPS, Think Together, Heart School)'),
    ('proof one-pager', '3 case studies'),
    ('Write proof one-pager', 'Get together 3 case studies'),
]:
    if old in t:
        t = t.replace(old, new)
        print(f'  Fixed: {old[:40]}')

# 3. Copy and wire ad images
imgs = {
    'ad-parent-searching.jpg': '/Users/brandastic/.openclaw/media/tool-image-generation/ad-parent-searching---ecc1dfc0-4246-41d3-a0f0-655dc5d5bb8d.jpg',
    'ad-thriving-school.jpg': '/Users/brandastic/.openclaw/media/tool-image-generation/ad-thriving-school---2cbd5b16-e6d4-491c-99bb-0ae445596ac7.jpg',
    'ad-family-laptop.jpg': '/Users/brandastic/.openclaw/media/tool-image-generation/linkedin-ad-enrollment---74f89ae2-a5d5-4cbc-a7b0-ab4e3173888f.jpg',
}
for name, src in imgs.items():
    if Path(src).exists():
        shutil.copy2(src, root / 'assets' / 'ba-office-2027' / name)
        print(f'  Copied {name}')

# Wire images into ad slides
old_bg = 'background:linear-gradient(180deg,#1e293b,#0f172a);height:220px;display:flex;align-items:center;justify-content:center'
for sid, img in [('ad-1', 'ad-family-laptop.jpg'), ('ad-2', 'ad-parent-searching.jpg'), ('ad-3', 'ad-thriving-school.jpg')]:
    idx = t.find(f'id="{sid}"')
    if idx < 0:
        print(f'  {sid}: not found')
        continue
    sec_end = t.find('</section>', idx)
    sec = t[idx:sec_end]
    if old_bg in sec:
        new_bg = f'height:220px;overflow:hidden"><img src="../assets/ba-office-2027/{img}" alt="" style="width:100%;height:100%;object-fit:cover'
        sec = sec.replace(old_bg, new_bg, 1)
        t = t[:idx] + sec + t[sec_end:]
        print(f'  {sid}: image wired')

# 4. Also fix headlines that run off
t = t.replace('How we increased enrollment in 90 days', 'Enrollment up in 90 days')

# 5. Remove placeholder text
for txt in ['[ Imagen 4 generating: empty classroom, sunlight on empty desks ]',
            '[ Imagen 4 generating: parent searching schools on phone ]',
            '[ Imagen 4 generating: happy kids in sunny schoolyard ]']:
    t = t.replace(txt, '')

# Write
(root / 'gameplan_marketing' / 'brandastic-2027-education.html').write_text(t)
print(f'Final: {len(t)} bytes, {t.count("class=" + chr(34) + "slide" + chr(34))} slides')
print(f'  Has 3 case studies: {"3 case studies" in t}')
print(f'  Has ad images: parent={t.count("ad-parent")}, school={t.count("ad-thriving")}, family={t.count("ad-family")}')

subprocess.run(['git', 'add', '.'], cwd=str(root))
r = subprocess.run(['git', 'commit', '-m', 'Education deck: restore + 3 case studies + wire all ad images'], capture_output=True, text=True, cwd=str(root))
print(r.stdout[-200:] if r.stdout else r.stderr[-200:])
r2 = subprocess.run(['git', 'push', 'origin', 'HEAD'], capture_output=True, text=True, cwd=str(root))
print(r2.stdout[-200:] if r2.stdout else r2.stderr[-200:])
print('DONE')
