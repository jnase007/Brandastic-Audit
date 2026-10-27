from pathlib import Path
import re

files = ["brandastic.html", "fountainlife.html", "abloomery.html", "topgreener.html"]
for f in files:
    html = Path(f).read_text(errors="ignore")
    m = re.search(r'<section id="sov">[\s\S]*?</section>', html)
    print("===", f, "===")
    if not m:\n        print("MISSING")
        continue
    s = m.group(0)
    print("FOUND len", len(s))
    red = re.findall(
        r'color:#ef4444;min-width:3\.5rem;text-align:right">([^<]+)', s
    )
    names = re.findall(
        r'font-weight:600;color:var\(--text-primary\)">([^<]+)', s
    )
    print("client_pct", red)
    print("competitors", names)
    print("callout", ("You lead" in s) or ("Less than" in s) or ("invisible" in s))
