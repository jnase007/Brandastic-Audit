#!/bin/bash
# =============================================================================
# Brandastic Client Audit Generator
# Usage: ./generate-audit.sh <domain> <client-name>
# Example: ./generate-audit.sh fountainlife.com "Fountain Life"
# =============================================================================

DOMAIN=$1
CLIENT=$2
SEMRUSH_KEY="b850898bc1c2fad0e85eb53243811bc7"
SB_CLIENT="cli_354472a48108c73272dd5139"
SB_TOKEN="5026f6f4dc6dd9e97bb80511da1c676c421d4e899eafd55d16341e549cca49d0"
OUTPUT_DIR="$(dirname "$0")"

if [ -z "$DOMAIN" ] || [ -z "$CLIENT" ]; then
  echo "Usage: ./generate-audit.sh <domain> <client-name>"
  echo "Example: ./generate-audit.sh fountainlife.com \"Fountain Life\""
  exit 1
fi

SLUG=$(echo "$CLIENT" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
OUTPUT="$OUTPUT_DIR/${SLUG}-audit-data.json"

echo "🔍 Generating audit data for $CLIENT ($DOMAIN)..."
echo ""

# Pull all data into a JSON file
python3 << PYEOF
import json, urllib.request, sys

domain = "$DOMAIN"
client = "$CLIENT"
slug = "$SLUG"
key = "$SEMRUSH_KEY"

data = {
    "client": client,
    "domain": domain,
    "slug": slug,
    "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "semrush": {},
    "socialblade": {},
}

# 1. Domain Overview
print("  [1/6] Domain overview...")
try:
    url = f"https://api.semrush.com/?type=domain_rank&key={key}&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain={domain}&database=us"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        lines = resp.read().decode().strip().split('\n')
        if len(lines) > 1:
            headers = lines[0].split(';')
            values = lines[1].split(';')
            data["semrush"]["overview"] = dict(zip(headers, values))
            print(f"    ✅ Rank: {values[1]}, Organic KW: {values[2]}, Traffic: {values[3]}")
except Exception as e:
    print(f"    ❌ {e}")

# 2. Top Organic Keywords
print("  [2/6] Organic keywords...")
try:
    url = f"https://api.semrush.com/?type=domain_organic&key={key}&display_limit=20&export_columns=Ph,Po,Nq,Cp,Co,Tr&domain={domain}&database=us"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        lines = resp.read().decode().strip().split('\n')
        keywords = []
        for line in lines[1:]:
            parts = line.split(';')
            if len(parts) >= 6:
                keywords.append({
                    "keyword": parts[0],
                    "position": int(parts[1]),
                    "volume": int(parts[2]),
                    "cpc": float(parts[3]),
                    "competition": float(parts[4]),
                    "traffic_pct": float(parts[5])
                })
        data["semrush"]["organic_keywords"] = keywords
        print(f"    ✅ {len(keywords)} keywords found")
except Exception as e:
    print(f"    ❌ {e}")

# 3. Paid Keywords
print("  [3/6] Paid keywords...")
try:
    url = f"https://api.semrush.com/?type=domain_adwords&key={key}&display_limit=20&export_columns=Ph,Po,Nq,Cp,Co,Tr&domain={domain}&database=us"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        content = resp.read().decode().strip()
        if "ERROR" not in content:
            lines = content.split('\n')
            paid = []
            for line in lines[1:]:
                parts = line.split(';')
                if len(parts) >= 6:
                    paid.append({
                        "keyword": parts[0],
                        "position": int(parts[1]),
                        "volume": int(parts[2]),
                        "cpc": float(parts[3]),
                    })
            data["semrush"]["paid_keywords"] = paid
            print(f"    ✅ {len(paid)} paid keywords found")
        else:
            data["semrush"]["paid_keywords"] = []
            print(f"    ⚠️ No paid keywords")
except Exception as e:
    print(f"    ❌ {e}")

# 4. Competitors
print("  [4/6] Organic competitors...")
try:
    url = f"https://api.semrush.com/?type=domain_organic_organic&key={key}&display_limit=10&export_columns=Dn,Cr,Np,Or,Ot,Oc&domain={domain}&database=us"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        lines = resp.read().decode().strip().split('\n')
        competitors = []
        for line in lines[1:]:
            parts = line.split(';')
            if len(parts) >= 6:
                competitors.append({
                    "domain": parts[0],
                    "common_keywords": parts[2],
                    "organic_keywords": parts[3],
                    "organic_traffic": parts[4],
                })
        data["semrush"]["competitors"] = competitors
        print(f"    ✅ {len(competitors)} competitors found")
except Exception as e:
    print(f"    ❌ {e}")

# 5. Backlinks summary
print("  [5/6] Backlinks...")
try:
    url = f"https://api.semrush.com/?type=backlinks_overview&key={key}&export_columns=total,domains_num,urls_num,ips_num&target={domain}&target_type=root_domain"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        lines = resp.read().decode().strip().split('\n')
        if len(lines) > 1:
            headers = lines[0].split(';')
            values = lines[1].split(';')
            data["semrush"]["backlinks"] = dict(zip(headers, values))
            print(f"    ✅ Total backlinks: {values[0]}")
except Exception as e:
    print(f"    ❌ {e}")

# 6. Save
print("  [6/6] Saving...")
with open("$OUTPUT", 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Audit data saved to $OUTPUT")
print(f"   Client: {client}")
print(f"   Domain: {domain}")
print(f"   Keywords: {len(data['semrush'].get('organic_keywords', []))}")
print(f"   Competitors: {len(data['semrush'].get('competitors', []))}")
PYEOF
