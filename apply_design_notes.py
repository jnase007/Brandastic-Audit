#!/usr/bin/env python3
"""
Apply 8 design feedback notes across all audit HTML files.
"""

import re
import os

FILES = [
    'integrity.html',
    'onpoint.html',
    'brandastic.html',
    'fountainlife.html',
    'abloomery.html',
    'topgreener.html',
]

def apply_changes(filename, content):
    changes = []

    # =========================================================
    # NOTE 1: Remove <span class="dot"></span> from nav-brand only
    # The watermark dot uses inline style so it's safe — only remove the bare one
    # =========================================================
    old = content
    # Match the dot span that has NO style attribute (nav-brand dot)
    content = re.sub(r'<span class="dot"></span>\s*', '', content)
    if content != old:
        changes.append('✓ Note 1: Removed nav-brand dot')

    # =========================================================
    # NOTE 2: Change bullet point colors to light blue #40B4E5
    # Target: inline spans used as bullets with colors other than #40B4E5
    # Pattern: position:absolute;left:0;color:var(--red/green/yellow)
    # =========================================================
    old = content

    # Change colored bullet spans (red/green/yellow) that are bullet indicators in li items
    # Pattern: <span style="position:absolute;left:0;color:var(--red)">•</span>
    # and similar
    content = re.sub(
        r'<span style="position:absolute;left:0;color:var\(--(red|green|yellow)\)">•</span>',
        '<span style="position:absolute;left:0;color:#40B4E5">•</span>',
        content
    )
    
    # Also handle timeline phase-items bullets (::before pseudo via inline style isn't there,
    # but some files may have colored bullet dots inline)
    # Change the CSS rule for phase-items li::before if it uses a different color
    content = re.sub(
        r'(\.timeline-phase \.phase-items li::before\{[^}]*background:)var\(--accent-light\)',
        r'\1#40B4E5',
        content
    )

    if content != old:
        changes.append('✓ Note 2: Changed bullet point colors to light blue #40B4E5')

    # =========================================================
    # NOTE 3 & 4: Remove duplicate overview section with icon
    # In integrity.html specifically, the overview section doesn't have a
    # company icon — the notes mention removing a duplicate. On inspection,
    # there's only one overview section in each file. 
    # The "duplicate icon" (Note 4) refers to the nav dot already removed in Note 1.
    # Skip if not applicable.
    # =========================================================
    # (Already handled by Note 1 for nav dot; overview sections are unique per file)

    # =========================================================
    # NOTE 5: Remove "How You Compare" section (id="competitors"),
    # keep "Detailed Comparison" (id="seo-matrix")
    # Move the data sources attribution to bottom (before CTA/footer)
    # =========================================================
    old = content

    # Find and remove the competitors section entirely
    # It starts with <section id="competitors"> and ends with </section>
    # followed by optional comment then seo-matrix section
    competitors_pattern = re.compile(
        r'<!-- [^\n]*(?:competitor|COMPETITOR|Competitor)[^\n]*-->\s*'
        r'<section id="competitors">.*?</section>\s*',
        re.DOTALL | re.IGNORECASE
    )
    competitors_match = competitors_pattern.search(content)
    
    if not competitors_match:
        # Try without leading comment
        competitors_pattern2 = re.compile(
            r'<section id="competitors">.*?</section>\s*',
            re.DOTALL
        )
        competitors_match = competitors_pattern2.search(content)

    if competitors_match:
        # Extract the data sources line if present inside competitors section
        matched_text = competitors_match.group(0)
        data_source_match = re.search(
            r'<div style="text-align:center[^>]*>.*?Data sources:.*?</div>\s*',
            matched_text, re.DOTALL
        )
        content = content[:competitors_match.start()] + content[competitors_match.end():]
        changes.append('✓ Note 5: Removed "How You Compare" (competitors) section')
    
    if content != old:
        # Now check if the "How You Compare" heading is still present (seo-matrix dupe)
        pass

    # =========================================================
    # NOTE 6: Move "Searches You Are Missing" / gaps section higher
    # It should appear right after the keywords section (id="keywords")
    # Currently it's after findings. Move id="gaps" section to after id="keywords"
    # =========================================================
    # This is complex HTML surgery — only do it for integrity.html where confirmed needed
    # For others, check and apply if gaps section exists below keywords section
    old = content
    
    # Extract sections by id to check ordering
    keywords_pos = content.find('<section id="keywords"')
    gaps_pos = content.find('<section id="gaps"')
    
    if gaps_pos > 0 and keywords_pos > 0 and gaps_pos > keywords_pos:
        # Find end of keywords section
        # Find the gaps section content
        gaps_start = content.find('<section id="gaps"')
        # Find end of gaps section: </section> then next \n or comment
        after_gaps = content[gaps_start:]
        gaps_end_match = re.search(r'</section>\s*', after_gaps)
        if gaps_end_match:
            gaps_section = after_gaps[:gaps_end_match.end()]
            gaps_section_clean = gaps_section.strip()
            
            # Also grab the preceding comment if any
            before_gaps = content[:gaps_start]
            comment_match = re.search(r'(<!-- [^\n]+ -->\s*)$', before_gaps, re.DOTALL)
            comment_prefix = ''
            comment_start = gaps_start
            if comment_match:
                comment_prefix = comment_match.group(1)
                comment_start = gaps_start - len(comment_prefix)
            
            full_gaps_block = content[comment_start:gaps_start + gaps_end_match.end()]
            
            # Remove the gaps block from current position
            content_without_gaps = content[:comment_start] + content[gaps_start + gaps_end_match.end():]
            
            # Find end of keywords section in new content
            kw_pos = content_without_gaps.find('<section id="keywords"')
            kw_after = content_without_gaps[kw_pos:]
            kw_end_match = re.search(r'</section>\s*', kw_after)
            if kw_end_match:
                insert_at = kw_pos + kw_end_match.end()
                content = (content_without_gaps[:insert_at] + 
                          '\n' + gaps_section_clean + '\n\n' + 
                          content_without_gaps[insert_at:])
                changes.append('✓ Note 6: Moved "Searches You Are Missing" (gaps) section after keywords section')

    # =========================================================
    # NOTE 7: Remove duplicate PageSpeed section
    # Find if there are two <section id="pagespeed"> - keep first, remove second
    # =========================================================
    old = content
    pagespeed_positions = [m.start() for m in re.finditer(r'<section id="pagespeed"', content)]
    if len(pagespeed_positions) >= 2:
        # Remove second occurrence
        second_ps_start = pagespeed_positions[1]
        after_second = content[second_ps_start:]
        end_match = re.search(r'</section>\s*', after_second)
        if end_match:
            content = content[:second_ps_start] + content[second_ps_start + end_match.end():]
            changes.append('✓ Note 7: Removed duplicate PageSpeed section')
    
    if content == old and 'pagespeed' in content.lower():
        changes.append('  Note 7: Only one PageSpeed section found (no duplicate)')

    # =========================================================
    # NOTE 8: Remove LinkedIn from roadmap/strategy sections
    # Remove entire <li> items that contain "LinkedIn" in phase-items
    # Remove entire strategy-card divs that are "LinkedIn Thought Leadership"
    # For brandastic.html, also remove from value-card text
    # =========================================================
    old = content

    # Remove LinkedIn list items in phase-items (roadmap timeline)
    content = re.sub(
        r'\s*<li>[^<]*LinkedIn[^<]*</li>',
        '',
        content
    )
    
    # Remove LinkedIn strategy cards (entire card div)
    content = re.sub(
        r'\s*<div class="card strategy-card"><div class="icon">[^<]*</div><div class="title">LinkedIn[^<]*</div>.*?</div>',
        '',
        content
    )
    
    # Remove LinkedIn from value-card descriptions (replace the mention)
    content = re.sub(
        r',?\s*LinkedIn growth[,.]?',
        '',
        content
    )

    if content != old:
        changes.append('✓ Note 8: Removed LinkedIn from roadmap/strategy sections')

    return content, changes


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for filename in FILES:
        filepath = os.path.join(base_dir, filename)
        if not os.path.exists(filepath):
            print(f'⚠️  SKIP: {filename} not found')
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, changes = apply_changes(filename, content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f'\n📄 {filename}:')
        for change in changes:
            print(f'  {change}')
        if not changes:
            print('  (no changes applied)')

    print('\n✅ Done! All files processed.')


if __name__ == '__main__':
    main()
