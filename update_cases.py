import re, shutil
from pathlib import Path

root = Path('/Users/brandastic/.openclaw/workspace/Brandastic-Audit')
p = root / 'gameplan_marketing' / 'brandastic-2027-education.html'
t = p.read_text()

print(f'Start: {len(t)} bytes, {t.count("class=" + chr(34) + "slide" + chr(34))} slides')

# 1. Update proof slide - add Think Together and Heart School
old_proof_title = 'CalOPS &middot; $21,000/month &middot; live case'
new_proof_title = 'Three education clients &middot; CalOPS, Think Together, Heart School'
t = t.replace(old_proof_title, new_proof_title)

# Update proof slide content - change "This one case study" to reference all three
t = t.replace(
    'This one case study opens every door. Every similar school is a warm lead.',
    'Three education clients we already serve. Each one is proof that opens doors with peer schools.'
)

# Add Think Together and Heart School to the proof card
old_proof_card = '<h3>What we do for CalOPS</h3>'
new_proof_card = '<h3>Our education clients</h3>'
t = t.replace(old_proof_card, new_proof_card)

# Update the "unfair advantage" card
t = t.replace(
    'Live proof at <strong>$21K/month</strong>',
    'Three live education clients: <strong>CalOPS ($21K/mo), Think Together, Heart School ($5.3K/mo)</strong>'
)
t = t.replace(
    'Same motion works for every CalOPS peer',
    'Same approach works for every similar school'
)
t = t.replace(
    'Referral from CalOPS to sister schools',
    'Referrals from all three to peer schools'
)
t = t.replace(
    'Case study that enrollment leaders understand',
    'Three case studies enrollment leaders understand'
)

# Update the quote on the proof slide
t = t.replace(
    'We run the same enrollment marketing for California Online Public Schools. Happy to walk you through how it works in 15 minutes.',
    'We run enrollment marketing for CalOPS, Think Together, and Heart School. Happy to walk you through how it works in 15 minutes.'
)

# 2. Update email templates to reference all three
t = t.replace(
    'Same job we run for California Online Public Schools',
    'Same thing we do for CalOPS, Think Together, and Heart School'
)
t = t.replace(
    'same thing we do for CalOPS',
    'same thing we do for CalOPS, Think Together, and Heart School'
)

# 3. Update LinkedIn posts
t = t.replace(
    'We run enrollment marketing for CalOPS-scale online schools',
    'We run enrollment marketing for CalOPS, Think Together, and Heart School'
)

# 4. Update the system/channels slide
t = t.replace(
    'CalOPS proof email',
    'Case study email (CalOPS, Think Together, Heart School)'
)
t = t.replace(
    'with CalOPS proof',
    'with CalOPS / Think Together / Heart School proof'
)
t = t.replace(
    'Ask CalOPS to intro peer schools',
    'Ask CalOPS, Think Together, Heart School for peer intros'
)

# 5. Update the outreach sequence
t = t.replace(
    'We built the enrollment marketing for CalOPS',
    'We built the enrollment marketing for CalOPS, Think Together, and Heart School'
)
t = t.replace(
    'what CalOPS does differently',
    'what CalOPS, Think Together, and Heart School do differently'
)

# 6. Update ad copy
t = t.replace(
    'the same thing we do for CalOPS',
    'the same thing we do for CalOPS, Think Together, and Heart School'
)

# 7. Update the scoreboard
t = t.replace(
    'CalOPS is our largest client at <strong>$21,000/month</strong>',
    'Three education clients: CalOPS ($21K/mo), Think Together, Heart School ($5.3K/mo)'
)

# 8. Wire in ad images
imgs = {
    'ad-parent-searching.jpg': Path('/Users/brandastic/.openclaw/media/tool-image-generation/ad-parent-searching---ecc1dfc0-4246-41d3-a0f0-655dc5d5bb8d.jpg'),
    'ad-family-laptop.jpg': Path('/Users/brandastic/.openclaw/media/tool-image-generation/linkedin-ad-enrollment---74f89ae2-a5d5-4cbc-a7b0-ab4e3173888f.jpg'),
}
for name, src in imgs.items():
    if src.exists():
        shutil.copy2(src, root / 'assets' / 'ba-office-2027' / name)
        print(f'Copied {name}')

# Replace placeholder backgrounds with real images in ad slides
old_bg = 'background:linear-gradient(180deg,#1e293b,#0f172a);height:220px;display:flex;align-items:center;justify-content:center'
for sid, img in [('ad-1', 'ad-family-laptop.jpg'), ('ad-2', 'ad-parent-searching.jpg')]:
    idx = t.find(f'id="{sid}"')
    if idx < 0:
        continue
    sec_end = t.find('</section>', idx)
    sec = t[idx:sec_end]
    if old_bg in sec:
        new_bg = f'height:220px;overflow:hidden"><img src="../assets/ba-office-2027/{img}" alt="" style="width:100%;height:100%;object-fit:cover'
        sec = sec.replace(old_bg, new_bg, 1)
        t = t[:idx] + sec + t[sec_end:]
        print(f'{sid}: image wired')

p.write_text(t)
print(f'Final: {len(t)} bytes')

import subprocess
subprocess.run(['git', 'add', '.'], cwd=str(root))
r = subprocess.run(['git', 'commit', '-m', 'Education deck: 3 case studies (CalOPS, Think Together, Heart School) + ad images'], capture_output=True, text=True, cwd=str(root))
print(r.stdout[-200:] if r.stdout else r.stderr[-200:])
r2 = subprocess.run(['git', 'push', 'origin', 'HEAD'], capture_output=True, text=True, cwd=str(root))
print(r2.stdout[-200:] if r2.stdout else r2.stderr[-200:])
print('DONE')
