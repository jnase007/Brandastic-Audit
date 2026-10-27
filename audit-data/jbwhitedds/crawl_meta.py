#!/usr/bin/env python3
"""Full sitemap-based meta crawl for jbwhitedds.com (Screaming Frog substitute)."""
import json
import os
import re
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict
from html import unescape

BASE = "https://www.jbwhitedds.com"
UA = {"User-Agent": "BrandasticSEOCrawler/1.0 (+audit.brandastic.com)"}
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
OUT_DIR = os.path.dirname(os.path.abspath(__file__))


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:\n            body = r.read()\n            return r.status, dict(r.headers), body, r.geturl()\n    except urllib.error.HTTPError as e:\n        try:
            body = e.read()
        except Exception:
            body = b""
        return e.code, dict(e.headers or {}), body, url
    except Exception as e:\n        return None, {}, str(e).encode(), url\n\n\ndef extract_urls(xml_bytes):
    root = ET.fromstring(xml_bytes)
    urls = []
    for loc in root.findall(".//sm:loc", NS):
        if loc.text:
            urls.append(loc.text.strip())
    return urls


title_re = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
meta_desc_re = re.compile(r'<meta[^>]+name=["\']description["\'][^>]*>', re.I)
meta_content_re = re.compile(r'content=["\'](.*?)["\']', re.I | re.S)
canonical_re = re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]*>', re.I)
href_re = re.compile(r'href=["\'](.*?)["\']', re.I)
h1_re = re.compile(r"<h1[^>]*>(.*?)</h1>", re.I | re.S)
robots_meta_re = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]*>', re.I)
jsonld_re = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)
tag_re = re.compile(r"<[^>]+>")
ws_re = re.compile(r"\s+")


def clean(html_frag):
    t = tag_re.sub(" ", html_frag or "")
    t = unescape(t)
    return ws_re.sub(" ", t).strip()


def meta_content(tag):
    m = meta_content_re.search(tag or "")
    return clean(m.group(1)) if m else ""


def main():
    status, headers, body, final = fetch(f"{BASE}/sitemap_index.xml")
    if status != 200:
        raise SystemExit(f"sitemap index failed: {status} {body[:200]!r}")

    sitemaps = extract_urls(body)
    all_urls = []
    for sm in sitemaps:
        st, hd, bd, fn = fetch(sm)
        if st == 200:
            all_urls.extend(extract_urls(bd))
        else:
            print("sitemap fail", sm, st)

    seen = set()
    urls = []
    for u in all_urls:
        if u not in seen:
            seen.add(u)
            urls.append(u)

    print(f"FOUND {len(urls)} URLs from sitemap")

    rows = []
    for i, url in enumerate(urls, 1):
        st, hd, body, final = fetch(url)
        html = (
            body.decode("utf-8", errors="replace")
            if isinstance(body, (bytes, bytearray))
            else str(body)
        )
        title_m = title_re.search(html)
        title = clean(title_m.group(1)) if title_m else ""
        md_tag = meta_desc_re.search(html)
        meta_desc = meta_content(md_tag.group(0)) if md_tag else ""
        can_tag = canonical_re.search(html)
        canonical = ""
        if can_tag:
            hm = href_re.search(can_tag.group(0))
            canonical = hm.group(1).strip() if hm else ""
        h1s = [clean(x) for x in h1_re.findall(html)]
        robots_tag = robots_meta_re.search(html)
        robots = meta_content(robots_tag.group(0)) if robots_tag else ""
        has_jsonld = bool(jsonld_re.search(html))
        rows.append(
            {
                "url": url,
                "final_url": final,
                "status": st,
                "title": title,
                "title_len": len(title),
                "meta_description": meta_desc,
                "meta_len": len(meta_desc),
                "h1_count": len(h1s),
                "h1s": h1s,
                "canonical": canonical,
                "robots": robots,
                "has_jsonld": has_jsonld,
                "indexable": not (robots and re.search(r"noindex", robots, re.I)),
            }
        )
        if i % 10 == 0 or i == len(urls):
            print(f"crawled {i}/{len(urls)}")
        time.sleep(0.12)

    missing_title = [r for r in rows if not r["title"]]
    missing_meta = [r for r in rows if not r["meta_description"]]
    missing_h1 = [r for r in rows if r["h1_count"] == 0]
    multi_h1 = [r for r in rows if r["h1_count"] > 1]
    title_short = [r for r in rows if r["title"] and r["title_len"] < 30]
    title_long = [r for r in rows if r["title_len"] > 60]
    meta_short = [r for r in rows if r["meta_description"] and r["meta_len"] < 70]
    meta_long = [r for r in rows if r["meta_len"] > 160]
    no_canon = [r for r in rows if not r["canonical"]]
    canon_mismatch = [
        r
        for r in rows
        if r["canonical"]
        and r["canonical"].rstrip("/") != r["url"].rstrip("/")
        and r["canonical"].rstrip("/") != r["final_url"].rstrip("/")
    ]
    no_schema = [r for r in rows if not r["has_jsonld"]]
    non_200 = [r for r in rows if r["status"] != 200]
    noindex = [r for r in rows if not r["indexable"]]

    title_map = defaultdict(list)
    meta_map = defaultdict(list)
    for r in rows:
        if r["title"]:
            title_map[r["title"]].append(r["url"])
        if r["meta_description"]:
            meta_map[r["meta_description"]].append(r["url"])
    dup_titles = {k: v for k, v in title_map.items() if len(v) > 1}
    dup_metas = {k: v for k, v in meta_map.items() if len(v) > 1}

    with open(os.path.join(OUT_DIR, "full-crawl-meta.json"), "w") as f:\n        json.dump(\n            {\n                "crawled_at": "2026-07-15",
                "source": "sitemap-based full crawl (Screaming Frog not installed)",
                "url_count": len(rows),
                "rows": rows,
            },
            f,
            indent=2,
        )

    lines = []
    lines.append("# JB White DDS — Full Meta Crawl Report")
    lines.append("**Date:** 2026-07-15")
    lines.append(
        "**Method:** Sitemap-based full crawl (Screaming Frog not installed on Mac Mini)"
    )
    lines.append(f"**URLs crawled:** {len(rows)}")
    lines.append("")
    lines.append("## Summary")
    lines.append(f"- Non-200 status: **{len(non_200)}**")
    lines.append(f"- Missing title: **{len(missing_title)}**")
    lines.append(f"- Missing meta description: **{len(missing_meta)}**")
    lines.append(f"- Missing H1: **{len(missing_h1)}**")
    lines.append(f"- Multiple H1s: **{len(multi_h1)}**")
    lines.append(f"- Title too short (<30): **{len(title_short)}**")
    lines.append(f"- Title too long (>60): **{len(title_long)}**")
    lines.append(f"- Meta too short (<70): **{len(meta_short)}**")
    lines.append(f"- Meta too long (>160): **{len(meta_long)}**")
    lines.append(f"- Missing canonical: **{len(no_canon)}**")
    lines.append(f"- Canonical mismatch: **{len(canon_mismatch)}**")
    lines.append(f"- No JSON-LD schema: **{len(no_schema)}**")
    lines.append(f"- noindex pages: **{len(noindex)}**")
    lines.append(f"- Duplicate titles: **{len(dup_titles)}** groups")
    lines.append(f"- Duplicate meta descriptions: **{len(dup_metas)}** groups")
    lines.append("")

    def section(title, items, formatter):
        lines.append(f"## {title} ({len(items)})")
        if not items:
            lines.append("- None")
        else:
            for it in items[:100]:
                lines.append(formatter(it))
            if len(items) > 100:
                lines.append(f"- ... +{len(items) - 100} more")
        lines.append("")

    section("Missing Titles", missing_title, lambda r: f"- {r['url']}")
    section("Missing Meta Descriptions", missing_meta, lambda r: f"- {r['url']}")
    section("Missing H1", missing_h1, lambda r: f"- {r['url']}")
    section(
        "Multiple H1s",
        multi_h1,
        lambda r: f"- {r['url']} → {r['h1s']}",
    )
    section(
        "Titles Too Long (>60)",
        title_long,
        lambda r: f"- ({r['title_len']}) {r['title']} — {r['url']}",
    )
    section(
        "Titles Too Short (<30)",
        title_short,
        lambda r: f"- ({r['title_len']}) {r['title']} — {r['url']}",
    )
    section(
        "Meta Too Long (>160)",
        meta_long,
        lambda r: f"- ({r['meta_len']}) {r['url']} — {r['meta_description'][:120]}...",
    )
    section(
        "Meta Too Short (<70)",
        meta_short,
        lambda r: f"- ({r['meta_len']}) {r['url']} — {r['meta_description']}",
    )
    section(
        "Canonical Mismatches",
        canon_mismatch,
        lambda r: f"- {r['url']} → canonical: {r['canonical']}",
    )
    section("Non-200 Status", non_200, lambda r: f"- {r['status']} {r['url']}")
    section(
        "noindex Pages",
        noindex,
        lambda r: f"- {r['url']} robots={r['robots']}",
    )

    lines.append(f"## Duplicate Titles ({len(dup_titles)} groups)")
    if not dup_titles:
        lines.append("- None")
    else:
        for t, us in sorted(dup_titles.items(), key=lambda x: -len(x[1])):
            lines.append(f"- **{t}** ({len(us)} pages)")
            for u in us:
                lines.append(f"  - {u}")
    lines.append("")
    lines.append(f"## Duplicate Meta Descriptions ({len(dup_metas)} groups)")
    if not dup_metas:
        lines.append("- None")
    else:
        for t, us in sorted(dup_metas.items(), key=lambda x: -len(x[1]))[:50]:
            lines.append(f"- **{t[:140]}** ({len(us)} pages)")
            for u in us:
                lines.append(f"  - {u}")
    lines.append("")
    lines.append("## Full URL Inventory")
    lines.append("| Status | Title Len | Meta Len | H1s | Schema | URL | Title |")
    lines.append("|---|---:|---:|---:|---|---|---|")
    for r in rows:
        t = (r["title"] or "").replace("|", "/")
        lines.append(
            f"| {r['status']} | {r['title_len']} | {r['meta_len']} | {r['h1_count']} | "
            f"{'Y' if r['has_jsonld'] else 'N'} | {r['url']} | {t[:80]} |"
        )

    report_path = os.path.join(OUT_DIR, "full-crawl-meta-report.md")
    with open(report_path, "w") as f:\n        f.write("\n".join(lines))

    summary = {
        "urls": len(rows),
        "missing_title": len(missing_title),
        "missing_meta": len(missing_meta),
        "missing_h1": len(missing_h1),
        "multi_h1": len(multi_h1),
        "title_long": len(title_long),
        "meta_missing_or_long": len(missing_meta) + len(meta_long),
        "meta_long": len(meta_long),
        "meta_short": len(meta_short),
        "dup_titles": len(dup_titles),
        "dup_metas": len(dup_metas),
        "no_schema": len(no_schema),
        "non_200": len(non_200),
        "noindex": len(noindex),
        "canon_mismatch": len(canon_mismatch),
    }
    print("REPORT", report_path)
    print("JSON", os.path.join(OUT_DIR, "full-crawl-meta.json"))
    print("SUMMARY", json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
