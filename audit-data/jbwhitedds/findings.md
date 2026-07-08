# SEO Audit Findings: JB White DDS
**URL:** https://www.jbwhitedds.com  
**Date:** July 8, 2026  
**Audited by:** Brandastic  
**Location:** Las Vegas, NV — Cosmetic Dentistry & Dental Implants

---

## Executive Summary

JB White DDS is a premium cosmetic dental practice led by Dr. JB White — a nationally recognized educator and implant specialist. The brand is strong, the services are elite, and the website content is solid. However, the site is **dramatically underperforming in organic search**, earning only 72 estimated monthly visitors and failing to rank for virtually any high-value commercial keyword besides the doctor's own name. This is a major missed revenue opportunity in a highly competitive and high-value market (dental implants CPC: $8–20+).

**The core problem: The site has built excellent content but lacks the technical SEO infrastructure, local signals, and backlink authority to compete.**

---

## Category Scores

| Category | Score | Grade |
|---|---|---|
| Technical SEO | 58/100 | C+ |
| On-Page SEO | 62/100 | C+ |
| Content Quality | 70/100 | B- |
| Local SEO | 52/100 | D+ |
| Authority & Backlinks | 20/100 | F |
| Competitive Position | 18/100 | F |
| **Overall SEO Score** | **47/100** | **D+** |

---

## 1. Technical SEO Score: 58/100

### ✅ What's Working
- **HTTPS/SSL active** — Site loads on https:// with valid certificate
- **Robots.txt** — Properly configured (blocks /wp-admin/, allows admin-ajax.php, references sitemap)
- **Sitemap** — Sitemap index at `/sitemap_index.xml` with post + page sub-sitemaps, Rank Math plugin generating properly. Last updated May 2026.
- **Canonical tags** — Present and correct on homepage
- **Open Graph & Twitter Cards** — Fully implemented
- **WP Rocket caching** — Active (v3.21.3), improving load speed
- **Lazy loading** — Content-visibility:auto + WP Rocket lazy rendering active
- **Mobile viewport meta** — Present and correct
- **Image alt tags** — All 13 homepage images have alt text (no missing alts detected)
- **WordPress + Elementor** — Modern stack (WP 7.0, Elementor 4.0.9)

### ❌ Critical Issues
1. **NO JSON-LD Structured Data** — No schema markup whatsoever found in page source. This is a massive miss for a local business. Missing:
   - `LocalBusiness` / `Dentist` schema
   - `FAQPage` schema (despite having a large FAQ section)
   - `Person` schema for Dr. White
   - `MedicalBusiness` schema
   - `AggregateRating` schema

2. **H4 tags misused as body copy** — The homepage uses `<h4>` elements to contain long multi-sentence paragraphs (e.g., "VIP dental consultation..." and "The White Institute" descriptions). H4 should be for subheadings, not body copy.

3. **3 duplicate Google Site Verification codes** — Three separate `google-site-verification` meta tags present. Indicates messy Search Console setup.

4. **OG image alt "Home"** — The social share image alt is literally "Home" — weak and unhelpful for social crawlers.

5. **No CDN detected** — Images served from origin server directly. Opportunity to improve speed.

6. **Duplicate URL issue** — `/full-mouth-dental-implants/` and `/full-mouth-dental-implants-las-vegas-nv/` appear to be duplicate or near-duplicate pages. Canonical confusion risk.

7. **Staging/test page accessible** — `/jb-new/` is in the sitemap (last modified 2024) and appears to be an old page. Should be removed or noindexed.

### Recommendations
- Implement LocalBusiness + Dentist JSON-LD schema on every page immediately
- Add FAQPage schema to all FAQ sections
- Fix H4 misuse — wrap body copy in `<p>` tags
- Clean up Google Search Console to use a single verification
- Consider Cloudflare CDN for image delivery
- Audit and 301-redirect or canonical duplicate URL pairs

---

## 2. On-Page SEO Score: 62/100

### Page-by-Page Analysis

**Homepage (jbwhitedds.com)**
- Title: "JB White, DDS - Las Vegas Cosmetic Dentistry & Dental Implants" — 62 chars (1 over ideal 60)
- Meta desc: "Las Vegas cosmetic dentist JB White DDS specializes in dental implants, veneers, teeth whitening, and cosmetic dentistry. Call: 702-823-3000" — 143 chars (slightly short of 160 ideal)
- H1: "Las Vegas Cosmetic Dentistry & Dental Implants" — ✅ Contains primary keyword
- Content: Strong FAQ section (10 questions), patient story, service overview

**About Page (/about-jb-white-dds/)**
- Title: "Best Cosmetic Dentist Las Vegas, Nevada" — Good but could be stronger
- Content: Short/thin — only ~350 words visible. Needs expansion with credentials, awards, philosophy
- Missing: Schema markup for Dr. White as a Person/Physician

**Contact Page (/contact-us/)**
- Title: "Contact Us: JB White, DDS" — Generic, no keywords
- Content: Very thin — just a contact form. No service description, no geo signals
- Opportunity: Expand with address, hours, map, NAP signals, links to service areas

**Dental Implants Page (/dental-implants-las-vegas-nv/)**
- Title: "Premier Dental Implants in Las Vegas, NV" — ✅ Excellent
- H1 equivalent: "The Best Las Vegas Dental Implants for a Healthy, Lasting Smile"
- Content: Excellent depth — thorough FAQ, candidacy info, types of implants, aftercare
- This is one of the strongest pages on the site

**Blog (/dental-advice-and-knowledge/)**
- Title: "Blog - JB White, DDS" — Too generic
- Content: Active posts since early 2026. Some duplication noted (multiple posts per topic in same month)

### Issues
1. **Contact page title has no keywords** — "Contact Us: JB White, DDS" wastes title tag real estate
2. **About page is thin** — Needs 600+ words with credentials, specializations, awards
3. **Blog title is weak** — "Blog" doesn't help SEO. Should be "Las Vegas Dental Blog | JB White DDS"
4. **Some pages have no location modifier** — e.g., `/composite-bonding/` URL has no city name
5. **Keyword cannibalization risk** — Multiple pages targeting "composite veneers las vegas" (`/composite-veneers-las-vegas-nv/` and `/veneers-las-vegas-nv/composite-porcelain-veneers/`)

### Recommendations
- Optimize contact page title: "Schedule a Consultation | Las Vegas Dentist | JB White DDS"
- Expand about page to 800+ words
- Rename blog meta title to include location keywords
- Consolidate or differentiate the composite veneers pages with canonical tags
- Add internal links from blog posts to service pages

---

## 3. Content Analysis Score: 70/100

### Services Identified
The site covers a comprehensive service menu:
1. Dental Implants (single, full arch, full mouth, All-on-4, same-day)
2. Porcelain Veneers
3. Composite Veneers / Composite Bonding
4. Smile Design
5. Teeth Whitening / Bleaching
6. Dental Crowns & Bridges
7. Orthodontic Treatments (Invisalign implied)
8. Root Canal Treatment
9. Periodontal Therapy (laser, gum regeneration)
10. Full Mouth Reconstruction

**Unique Value Propositions:** VIP consultation experience, The White Institute (CE courses for dentists), global educator status.

### Blog Status
- **Blog exists** at `/dental-advice-and-knowledge/`
- Recently active (April–May 2026 posts)
- Topics: dental implants, periodontal therapy, bleaching, root canals, cosmetic dentistry
- ⚠️ **Issue: Thin/repetitive posts** — Multiple posts on the same topic in the same week suggests AI-generated or template content. Individual post titles not confirmed but volume pattern raises quality concerns.

### Content Gaps (High-Opportunity Missing Pages)
| Missing Content | Target Keyword | Monthly Searches (Est.) | Priority |
|---|---|---|---|
| All-on-4 dental implants page | "all on 4 dental implants las vegas" | 320+ | 🔴 HIGH |
| Dental implants cost page | "dental implants cost las vegas" | 590+ | 🔴 HIGH |
| Invisalign dedicated page | "invisalign las vegas" | 1,300+ | 🔴 HIGH |
| Cosmetic dentist landing page | "cosmetic dentist las vegas" | 1,600+ | 🔴 HIGH |
| Sedation dentistry | "sedation dentist las vegas" | 320+ | 🟡 MED |
| Emergency dentist | "emergency dentist las vegas" | 1,000+ | 🟡 MED |
| Henderson area page | "dentist henderson nv" | 880+ | 🟡 MED |
| Summerlin area page | "dentist summerlin nv" | 480+ | 🟡 MED |
| Patient reviews page | — | Conversion/trust | 🟡 MED |
| Financing/payment page | "dental financing las vegas" | 210+ | 🟡 MED |

### Recommendations
- Create dedicated All-on-4 and "Teeth in a Day" landing pages
- Build a transparent "dental implants cost" page (even if price ranges are given)
- Develop Invisalign-specific page
- Add location-specific pages for Henderson and Summerlin
- Audit blog post quality — ensure posts are 800+ words with unique insights, not template content

---

## 4. Local SEO Score: 52/100

### NAP Consistency
| Platform | Name | Address | Phone |
|---|---|---|---|
| Website | JB White, DDS - Las Vegas Cosmetic Dentistry & Dental Implants | 8084 W. Sahara Ave., Suite G, Las Vegas, NV 89117 | 702-823-3000 |
| Yelp | JB White, DDS - Las Vegas Cosmetic Dentistry & Dental Implants | 8084 W Sahara Ave, Las Vegas, Nevada | Listed |
| MapQuest | JB White, DDS - Cosmetic Dentist - Dental Implants | 8084 W Sahara Ave, Las Vegas, NV 89117 | Listed |
| Yellow Pages | JB White DDS | Las Vegas, NV | Listed |

**Phone formatting inconsistency:** Website uses both "702-823-3000" (header) and "702.823.3000" (contact page). Should be standardized.

### Local Signals Assessment
- ✅ Google Maps embed on website
- ✅ Phone number in header/meta
- ✅ Listed on Yelp, MapQuest, YellowPages
- ❌ **No LocalBusiness JSON-LD schema** — Critical for local pack rankings
- ❌ **NAP not in site footer** — Address appears only on contact page, not sitewide footer
- ❌ **No service area pages** (Henderson, Summerlin, North Las Vegas, Paradise)
- ❌ **No aggregate review schema** — Despite presumably having Google/Yelp reviews
- ❌ **"By Appointment Only" hours** — Unusual and may hurt local pack appearance vs competitors with set hours

### Google Business Profile
- Evidence of GBP setup (Google verification tags present — 3 separate ones)
- No direct GBP URL captured
- No review count data visible in search snippets
- Recommendation: Audit GBP to ensure hours, services, photos, and description are fully complete

### Recommendations
- Add full NAP to sitewide footer
- Standardize phone formatting to 702-823-3000 everywhere
- Implement LocalBusiness/Dentist JSON-LD on homepage and contact page
- Create neighborhood landing pages (/dental-implants-henderson-nv/, /cosmetic-dentist-summerlin-nv/)
- Add Review schema once sufficient reviews are aggregated
- Consolidate Google Search Console to single verification
- Build citations on Healthgrades, Zocdoc, WebMD, Vitals, RateMDs

---

## 5. Competitive Analysis Score: 18/100

### SEMrush Domain Overview
| Metric | JB White DDS | Meaning |
|---|---|---|
| SEMrush Domain Rank | 4,256,283 | Very low authority (higher number = weaker) |
| Organic Keywords | 60 | Almost invisible in search |
| Organic Monthly Traffic (est.) | 72 | Extremely low |
| Organic Cost (est.) | $159/mo | Traffic value — negligible |
| Paid Keywords | 0 | No PPC running |

### Keyword Rankings Breakdown
**Branded terms only (only real traffic):**
- "jb white dds" — Position 1 (90 searches/mo)
- "dr.white dentist" — Position 31

**Low-value/off-topic rankings (not driving traffic):**
- "bright white dental of fresh meadows" — Position 81 (480 searches/mo, wrong business)
- "dr dustin white" — Position 32 (different person)
- "john white dds" — Position 36 (different person)

**Some keyword presence but no traffic (positions 27-70):**
- "composite veneers las vegas" — Position 13 (90 searches/mo) ← best non-branded ranking
- "periodontal laser therapy in las vegas" — Position 27 (70 searches/mo)
- "smile designers of las vegas" — Position 33 (210 searches/mo)
- "professional teeth whitening las vegas" — Position 36

**Not ranking at all for:**
- "dental implants las vegas" (~2,400/mo)
- "cosmetic dentist las vegas" (~1,600/mo)
- "veneers las vegas" (~590/mo)
- "porcelain veneers las vegas" (~480/mo)
- "all on 4 las vegas" (~320/mo)
- "best dentist las vegas" (~720/mo)

### Competitor Comparison

**Aspiring Smiles Las Vegas (aspiringsmileslasvegas.com)**
- Ranks #9 for "cosmetic dentist las vegas" (1,600/mo, $8.54 CPC) ← JB White not in top 20
- Ranks #9 for "best cosmetic dentist in las vegas" (320/mo)
- Has dedicated blog content targeting informational queries
- Significantly more visible online despite likely less prestigious credentials

**Top Yelp Competitors (Bionic Smile, Wagner Dental, Summerlin Dental Solutions)**
- These practices appear in Yelp "Best of" lists where JB White DDS does not
- Indicates review volume/recency gap

### The Core Problem: Backlink Authority
The domain rank of 4.2M indicates extremely few/weak backlinks. For a dentist who lectures internationally and is a key opinion leader for dental manufacturers, there should be significant backlink opportunities:
- Dental manufacturer websites (key opinion leader feature)
- Dental conference websites (speaker pages)
- Dental education platforms
- Local Las Vegas press/media
- Patient story features (Dorothy case could be PR-worthy)

None of these appear to have translated into backlinks. This is the single biggest lever available.

### Recommendations
1. **Build backlinks from dental manufacturer sites** (Dr. White is a KOL — these links should be easy to get)
2. **Pitch local Las Vegas media** about the VIP dental experience angle
3. **DABA / AACD membership links** — Ensure American Academy of Cosmetic Dentistry profile is complete and linking back
4. **White Institute sponsorships** — Course attendees/partners should link to jbwhitedds.com
5. **Yelp review generation campaign** — Get back into the Top 10 Yelp cosmetic dentists
6. **Consider Google Ads** — With $0 current PPC and $159 organic traffic value, paid search is immediate ROI (dental implants CPC $10-25, but average case value $3,000-30,000)

---

## Priority Action Plan

### 🔴 Immediate (Month 1)
1. **Add Dentist/LocalBusiness JSON-LD schema** to homepage, contact, and all service pages
2. **Add FAQPage schema** to all pages with FAQ sections (huge SERP feature opportunity)
3. **Add full NAP to sitewide footer** (name, address, phone, hours)
4. **Audit + optimize Google Business Profile** — complete all fields, add photos, set proper hours
5. **Fix contact page title tag** to include keywords and location

### 🟡 Month 2-3
6. **Create All-on-4 dedicated page** targeting "all on 4 dental implants las vegas"
7. **Create Invisalign page** targeting "invisalign las vegas" (1,300/mo)
8. **Create dental implants cost page** — even with price ranges, this ranks well for high-intent searches
9. **Expand About page** to 800+ words with credentials, awards, philosophy
10. **Build citations** on Healthgrades, Zocdoc, Vitals, RateMDs, WebMD

### 🟢 Month 3-6
11. **Backlink outreach to dental manufacturers** (Dr. White is KOL — leverage this)
12. **Create neighborhood landing pages** (Henderson, Summerlin)
13. **Blog content strategy** — Focus on long-form guides (1,500+ words) not thin multi-posts
14. **Review generation campaign** — email post-appointment sequence requesting Google/Yelp reviews
15. **Consider Google Ads** for dental implants and cosmetic dentistry keywords while organic SEO develops

---

## Quick Win Opportunities

| Quick Win | Effort | Expected Impact |
|---|---|---|
| LocalBusiness JSON-LD schema | Low (1 hour) | High — local pack visibility |
| FAQPage schema | Low (2 hours) | High — SERP rich results |
| NAP in footer | Very Low (30 min) | Medium — local signals |
| Contact page title fix | Very Low (5 min) | Low-Medium |
| GBP audit & photo upload | Low (2 hours) | High — maps pack |
| Healthgrades/Zocdoc citation | Low (2 hours) | Medium — trust + backlinks |

---

## Appendix: Key Data Points

| Data Point | Value |
|---|---|
| Domain | jbwhitedds.com |
| CMS | WordPress 7.0 + Elementor 4.0.9 |
| SEO Plugin | Rank Math SEO |
| Caching | WP Rocket 3.21.3 |
| SSL | Active |
| Sitemap | /sitemap_index.xml (Rank Math) |
| Robots.txt | Properly configured |
| Schema Markup | NONE (critical gap) |
| SEMrush Domain Rank | 4,256,283 |
| Organic Keywords | 60 |
| Organic Traffic (est.) | 72/mo |
| Paid Ads | None |
| Phone | 702-823-3000 |
| Address | 8084 W. Sahara Ave, Suite G, Las Vegas, NV 89117 |
| Primary Competitor Gap | Not ranking for "dental implants las vegas" (2,400/mo) |
