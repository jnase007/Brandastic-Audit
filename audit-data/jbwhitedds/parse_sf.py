import csv, os
from collections import Counter
OUT = "/Users/brandastic/.openclaw/workspace/Brandastic-Audit/audit-data/jbwhitedds/screaming-frog"

def read(name):
    with open(os.path.join(OUT, name), newline="", encoding="utf-8-sig", errors="replace") as f:
        return list(csv.DictReader(f))

issues = read("issues_overview_report.csv")
print("ISSUES")
for r in issues:
    print("[%s] %s: %s (%s%%)" % (r.get("Issue Priority"), r.get("Issue Name"), r.get("URLs"), r.get("% of Total")))
print()
print("TITLE OVER")
for r in read("page_titles_over_60_characters.csv"):
    print("%s|%s|%s" % (r.get("Title 1 Length"), (r.get("Title 1") or "")[:90], r.get("Address")))
print()
print("META OVER")
for r in read("meta_description_over_155_characters.csv"):
    print("%s|%s|%s" % (r.get("Meta Description 1 Length"), r.get("Address"), (r.get("Meta Description 1") or "")[:120]))
print()
print("H1 MISSING")
for r in read("h1_missing.csv"):
    print("%s|%s|%s" % (r.get("Address"), r.get("Indexability"), r.get("Status Code")))
print()
print("H1 DUP")
for r in read("h1_duplicate.csv"):
    print("%s|%s" % (r.get("Address"), r.get("H1-1")))
print()
print("H1 MULTI")
for r in read("h1_multiple.csv"):
    print("%s|%s|%s" % (r.get("Address"), r.get("H1-1"), r.get("H1-2")))
print()
print("H1 ALL")
for r in read("h1_all.csv"):
    print("%s|%s" % ((r.get("H1-1") or "")[:70], r.get("Address")))
internal = read("internal_all.csv")
html = [r for r in internal if "html" in (r.get("Content Type") or "").lower()]
print("HTML", len(html), "index", Counter(r.get("Indexability") for r in html), "status", Counter(r.get("Status Code") for r in html))
redir = [r for r in internal if str(r.get("Status Code", "")).startswith("3")]
print("REDIR", len(redir))
for r in redir[:10]:
    print("%s %s -> %s" % (r.get("Status Code"), r.get("Address"), r.get("Redirect URL")))
print("TITLES", len(read("page_titles_all.csv")), "META", len(read("meta_description_all.csv")))
