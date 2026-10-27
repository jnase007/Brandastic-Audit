from pathlib import Path
import re, subprocess

root = Path('/Users/brandastic/.openclaw/workspace/Brandastic-Audit')

# Get the version that had the content (before my last strip)
r = subprocess.run(['git', 'show', 'HEAD~1:gameplan_marketing/brandastic-tam-icp.html'], 
    capture_output=True, text=True, cwd=str(root))
old = r.stdout
print(f'Restored version: {len(old)} bytes')

# Find what section IDs actually exist
ids = re.findall(r'id="([^"]+)"', old)
print(f'IDs in old version: {ids}')

# Find sections that are my TAM content (not education ICP junk)
# My sections used class="section" not class="slide"
my_sections = []
for m in re.finditer(r'<div class="section">([sS]*?)</div>s*(?=<div class="section">|</main>|$)', old):
    preview = m.group(1)[:100].strip()
    if any(x in preview for x in ['Pick one', 'Education', 'Dental', 'Aero', 'decision', 'Score']):
        my_sections.append(m.group(0))
        print(f'Found my section: {preview[:60]}')

if not my_sections:
    # Try finding by content markers
    print('Trying content markers...')
    for marker in ['Pick one', 'the full picture', 'The decision']:
        idx = old.find(marker)
        if idx > 0:
            # Find the enclosing section/div
            start = old.rfind('<div class="section">', 0, idx)
            if start < 0:
                start = old.rfind('<section', 0, idx)
            end = old.find('</div>\n\n', idx)
            if end < 0:
                end = old.find('</section>', idx)
            if start > 0 and end > 0:
                chunk = old[start:end+10]
                my_sections.append(chunk)
                print(f'Found by marker "{marker}": {len(chunk)} chars')

# If still empty, just get everything between <main> and </main> minus the education stuff
if not my_sections:
    print('Extracting between main tags...')
    main_start = old.find('<main')
    main_end = old.find('</main>')
    if main_start > 0 and main_end > 0:
        main_content = old[main_start:main_end + len('</main>')]
        # Remove education-specific content
        main_content = re.sub(r'<div class="icp-kicker">[sS]*?(?=<div class="section">|<section class="slide")', '', main_content)
        main_content = re.sub(r'<h1>Online public schools[sS]*?(?=<div class="section">|<section class="slide")', '', main_content)
        main_content = re.sub(r'<div class="story">[sS]*?</div>s*<div class="icp-chips">[sS]*?</div>', '', main_content)
        print(f'Main content: {len(main_content)} chars')
        my_sections = [main_content]

# Get nav from current version
current = (root / 'gameplan_marketing' / 'brandastic-tam-icp.html').read_text()
head = re.search(r'(<!DOCTYPE[sS]*?</head>)', current).group(1)
nav_match = re.search(r'(<body>[sS]*?</script>)', current)
nav_block = nav_match.group(1) if nav_match else '<body>'

# Now rebuild - use the section content wrapped properly
content_html = '\n'.join(my_sections) if my_sections else '<p>Content missing - needs rebuild</p>'

# Remove education ICP-specific content from the joined sections
content_html = re.sub(r'<div class="icp-kicker">[^<]*</div>', '', content_html)
content_html = re.sub(r'<h1>Online public schools[^<]*</h1>', '', content_html)
content_html = re.sub(r'<div class="story">[sS]*?</div>\s*\n\s*<div class="icp-chips">', '<div class="icp-chips">', content_html)

# Build final page
final = head + '\n' + nav_block + '\n<main>\n' + content_html + '\n</main>\n</div>\n</body>\n</html>'

(root / 'gameplan_marketing' / 'brandastic-tam-icp.html').write_text(final)
print(f'Final: {len(final)} bytes, sections: {final.count("<div class=" + chr(34) + "section" + chr(34))}')

subprocess.run(['git', 'add', 'gameplan_marketing/brandastic-tam-icp.html'], cwd=str(root))
r = subprocess.run(['git', 'commit', '-m', 'TAM-ICP: restore content, remove education ICP junk, keep nav'], capture_output=True, text=True, cwd=str(root))
print(r.stdout[-200:] if r.stdout else r.stderr[-200:])
r2 = subprocess.run(['git', 'push', 'origin', 'HEAD'], capture_output=True, text=True, cwd=str(root))
print(r2.stdout[-200:] if r2.stdout else r2.stderr[-200:])
print('DONE')
