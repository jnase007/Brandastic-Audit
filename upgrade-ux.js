#!/usr/bin/env node
/**
 * 10x UX Upgrade Script for Brandastic Audit Pages
 * Injects: animations, progress bar, TOC, parallax, gradient lines,
 *          PDF cover page, chart printing, QR codes, and more.
 */
const fs = require('fs');
const path = require('path');

const files = [
  { file: 'onpoint.html', client: 'On Point for College', domain: 'onpointforcollege.org', url: 'https://jnase007.github.io/Brandastic-Audit/onpoint.html' },
  { file: 'integrity.html', client: 'Integrity Solutions', domain: 'integritysolutions.com', url: 'https://jnase007.github.io/Brandastic-Audit/integrity.html' },
  { file: 'fountainlife.html', client: 'Fountain Life', domain: 'fountainlife.com', url: 'https://jnase007.github.io/Brandastic-Audit/fountainlife.html' },
];

// ============ NEW CSS ============
const upgradeCss = `
/* ========== 10x UX UPGRADE CSS ========== */

/* --- Scroll Reveal Animations --- */
.reveal{opacity:0;transform:translateY(40px);transition:opacity 0.8s cubic-bezier(0.22,1,0.36,1),transform 0.8s cubic-bezier(0.22,1,0.36,1)}
.reveal.active{opacity:1;transform:translateY(0)}
.reveal .card:nth-child(1){transition-delay:0.1s}
.reveal .card:nth-child(2){transition-delay:0.2s}
.reveal .card:nth-child(3){transition-delay:0.3s}
.reveal .card:nth-child(4){transition-delay:0.4s}
.reveal .card:nth-child(5){transition-delay:0.5s}
.reveal .card:nth-child(6){transition-delay:0.6s}

/* --- Reading Progress Bar --- */
.reading-progress{position:fixed;top:64px;left:0;width:0%;height:3px;background:linear-gradient(90deg,#40B4E5,#CC22FF);z-index:1001;transition:width 0.1s linear;pointer-events:none}
@media(max-width:768px){.reading-progress{top:64px}}

/* --- Sticky Section Pill --- */
.section-pill{position:fixed;top:72px;left:50%;transform:translateX(-50%) translateY(-10px);z-index:1001;padding:6px 18px;border-radius:50px;background:var(--glass-bg);backdrop-filter:blur(16px);border:1px solid var(--glass-border);font-size:0.7rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;pointer-events:none;white-space:nowrap}
.section-pill.visible{opacity:1;transform:translateX(-50%) translateY(0)}
@media print{.section-pill{display:none!important}}

/* --- TOC Navigator --- */
.toc-toggle{position:fixed;bottom:80px;left:20px;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#40B4E5,#CC22FF);color:#fff;border:none;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;z-index:1000;box-shadow:0 4px 20px rgba(64,180,229,0.3);transition:transform 0.3s ease,box-shadow 0.3s ease}
.toc-toggle:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(64,180,229,0.5)}
.toc-panel{position:fixed;bottom:0;left:0;width:320px;max-height:70vh;background:var(--glass-bg);backdrop-filter:blur(20px);border:1px solid var(--glass-border);border-radius:0 16px 0 0;z-index:1000;transform:translateX(-100%);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);overflow-y:auto;box-shadow:var(--shadow);padding:1.5rem}
.toc-panel.open{transform:translateX(0)}
.toc-panel h3{font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:1rem}
.toc-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:500;color:var(--text-secondary);transition:all 0.2s ease;margin-bottom:2px}
.toc-item:hover{background:var(--bg-card-hover);color:var(--text-primary)}
.toc-item.passed{color:var(--green)}
.toc-item .toc-check{width:18px;height:18px;border-radius:50%;border:2px solid var(--bg-card-border);display:flex;align-items:center;justify-content:center;font-size:0.6rem;flex-shrink:0;transition:all 0.3s ease}
.toc-item.passed .toc-check{border-color:var(--green);background:rgba(34,197,94,0.15);color:var(--green)}
@media print{.toc-toggle,.toc-panel{display:none!important}}
@media(max-width:768px){.toc-toggle{display:none}}

/* --- Gradient Section Dividers --- */
.gradient-divider{height:2px;background:linear-gradient(90deg,transparent,#40B4E5,#CC22FF,transparent);margin:0;opacity:0;transform:scaleX(0);transition:opacity 0.8s ease,transform 1s cubic-bezier(0.22,1,0.36,1);transform-origin:center}
.gradient-divider.active{opacity:1;transform:scaleX(1)}

/* --- Hero Parallax --- */
.hero{background-attachment:fixed}
@media(max-width:768px){.hero{background-attachment:scroll}}

/* --- Chart Hint --- */
.chart-hint{text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:0.75rem;opacity:0.7;font-style:italic}
.chart-hint::before{content:'💡 '}

/* --- CTA Pulse --- */
@keyframes ctaPulse{0%{box-shadow:0 0 0 0 rgba(64,180,229,0.4)}70%{box-shadow:0 0 0 15px rgba(64,180,229,0)}100%{box-shadow:0 0 0 0 rgba(64,180,229,0)}}
.cta-btn.pulse{animation:ctaPulse 2s ease-in-out infinite}

/* ========== PRINT / PDF UPGRADES ========== */
.print-only{display:none!important}

/* --- Print Cover Page --- */
.print-cover{page-break-after:always;text-align:center;padding:4rem 2rem;min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
.print-cover .cover-dot{width:40px;height:40px;border-radius:50%;background:#0644ED;margin:0 auto 1.5rem}
.print-cover .cover-brand{font-size:1.8rem;font-weight:800;letter-spacing:0.08em;color:#191F24;margin-bottom:3rem}
.print-cover .cover-type{font-size:0.85rem;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;margin-bottom:1rem}
.print-cover .cover-client{font-size:3rem;font-weight:900;color:#191F24;margin-bottom:0.5rem;letter-spacing:-0.03em}
.print-cover .cover-domain{font-size:1rem;color:#64748b;margin-bottom:3rem}
.print-cover .cover-prepared{font-size:0.9rem;color:#64748b;margin-bottom:1rem}
.print-cover .cover-confidential{font-size:0.7rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#ef4444;margin-top:3rem;padding:8px 24px;border:2px solid #ef4444;border-radius:4px;display:inline-block}

/* --- Print TOC --- */
.print-toc{page-break-after:always;padding:3rem 2rem}
.print-toc h2{font-size:1.8rem;font-weight:800;color:#191F24;margin-bottom:2rem;letter-spacing:-0.03em}
.print-toc-item{display:flex;align-items:center;padding:0.6rem 0;border-bottom:1px solid #e5e7eb;font-size:0.9rem;color:#374151}
.print-toc-item .toc-num{width:30px;font-weight:700;color:#0644ED;flex-shrink:0}
.print-toc-item .toc-name{flex:1}

/* --- Print QR --- */
.print-qr{text-align:center;margin-top:3rem;padding:2rem;border:1px solid #e5e7eb;border-radius:12px;page-break-inside:avoid}
.print-qr p{font-size:0.85rem;color:#64748b;margin-bottom:1rem}
.print-qr img{width:150px;height:150px}

@media print{
  .print-only{display:block!important}
  .reading-progress,.toc-toggle,.toc-panel,.gradient-divider,.section-pill,.side-nav{display:none!important}
  
  /* Cover page */
  .print-cover .cover-dot{background:#0644ED!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  
  /* Section page breaks */
  #overview,#summary,#scorecard,#pagespeed,#traffic,#keywords,#ads,#competitors,#seo-matrix,#social,#email,#reputation,#solutions,#gaps,#findings,#strategy,#roadmap,#roi,#cta{page-break-before:always}
  
  /* Page headers/footers via @page - limited browser support, but helps */
  
  /* Ensure card backgrounds print */
  .card{background:#f8f9fa!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  
  /* Gradient text fallback */
  .section-title .gradient,.metric-card .value,.roi-card .after,.gap-card .vol,.stat-card .stat-num{
    -webkit-text-fill-color:#0644ED!important;background:none!important
  }
  
  /* Score ring colors */
  .score-ring .fg{stroke:#0644ED!important}
  
  /* Animations off */
  .reveal{opacity:1!important;transform:none!important;transition:none!important}
  .reveal .card{transition-delay:0s!important}
}
`;

// ============ NEW JS ============
function getUpgradeJs(clientName, liveUrl) {
  return `
/* ========== 10x UX UPGRADE JS ========== */

/* --- 1. Smooth Scroll Reveal (replace old observer) --- */
(function(){
  // Remove old observers that add 'visible' class and use new 'active' class
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.classList.add('active');
        // Don't unobserve - we need to track for TOC
      }
    });
  }, {threshold:0.05, rootMargin:'50px'});
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  // Fallback
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.active)').forEach(el => el.classList.add('active'));
  }, 3000);
})();

/* --- 2. Reading Progress Bar --- */
(function(){
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrollTop / docHeight * 100) + '%';
  }, {passive:true});
})();

/* --- 3. Sticky Section Pill --- */
(function(){
  const pill = document.createElement('div');
  pill.className = 'section-pill';
  document.body.appendChild(pill);
  const sections = document.querySelectorAll('section[id]');
  const sectionNames = {};
  sections.forEach(s => {
    const badge = s.querySelector('.section-badge');
    const title = s.querySelector('.section-title');
    sectionNames[s.id] = badge ? badge.textContent.trim() : (title ? title.textContent.trim().substring(0,40) : s.id);
  });
  let currentSection = '';
  const pillObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting && e.target.id) {
        currentSection = sectionNames[e.target.id] || e.target.id;
        pill.textContent = currentSection;
        pill.classList.add('visible');
      }
    });
  }, {rootMargin:'-80px 0px -85% 0px'});
  sections.forEach(s => pillObs.observe(s));
  // Hide pill at top
  window.addEventListener('scroll', () => {
    if(window.scrollY < 200) pill.classList.remove('visible');
  }, {passive:true});
})();

/* --- 4. Table of Contents Navigator --- */
(function(){
  const toggle = document.createElement('button');
  toggle.className = 'toc-toggle';
  toggle.innerHTML = '📋';
  toggle.title = 'Table of Contents';
  toggle.setAttribute('aria-label', 'Table of Contents');
  document.body.appendChild(toggle);

  const panel = document.createElement('div');
  panel.className = 'toc-panel';
  panel.innerHTML = '<h3>Audit Sections</h3>';
  document.body.appendChild(panel);

  const sections = document.querySelectorAll('section[id]');
  const items = [];
  sections.forEach(s => {
    const badge = s.querySelector('.section-badge');
    const title = s.querySelector('.section-title');
    const name = badge ? badge.textContent.trim() : (title ? title.textContent.trim().substring(0,40) : s.id);
    const item = document.createElement('div');
    item.className = 'toc-item';
    item.innerHTML = '<div class="toc-check">✓</div><span>' + name + '</span>';
    item.addEventListener('click', () => {
      const y = s.offsetTop - 80;
      window.scrollTo({top:y, behavior:'smooth'});
      panel.classList.remove('open');
    });
    panel.appendChild(item);
    items.push({el:item, section:s});
  });

  toggle.addEventListener('click', () => panel.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if(!panel.contains(e.target) && !toggle.contains(e.target)) panel.classList.remove('open');
  });

  // Track passed sections
  const tocObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        const match = items.find(i => i.section === e.target);
        if(match) match.el.classList.add('passed');
      }
    });
  }, {rootMargin:'0px 0px -80% 0px'});
  sections.forEach(s => tocObs.observe(s));
})();

/* --- 5. Gradient Section Dividers --- */
(function(){
  const sections = document.querySelectorAll('section[id]');
  sections.forEach((s, i) => {
    if(i === 0) return; // skip hero
    const divider = document.createElement('div');
    divider.className = 'gradient-divider';
    s.parentNode.insertBefore(divider, s);
  });
  const divObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.classList.add('active');
        divObs.unobserve(e.target);
      }
    });
  }, {threshold:0.5});
  document.querySelectorAll('.gradient-divider').forEach(d => divObs.observe(d));
})();

/* --- 6. Chart Hints --- */
(function(){
  document.querySelectorAll('.chart-wrap').forEach(wrap => {
    const hint = document.createElement('div');
    hint.className = 'chart-hint';
    hint.textContent = 'Hover over chart for details';
    wrap.appendChild(hint);
  });
})();

/* --- 7. CTA Pulse --- */
(function(){
  const ctaObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.querySelectorAll('.cta-btn').forEach(btn => btn.classList.add('pulse'));
      }
    });
  }, {threshold:0.3});
  document.querySelectorAll('.cta-section, #cta').forEach(s => ctaObs.observe(s));
  // Also pulse the last section's CTA
  const lastSection = document.querySelector('section:last-of-type');
  if(lastSection) ctaObs.observe(lastSection);
})();

/* --- 8. Score Ring Animation (upgrade existing) --- */
(function(){
  const allRingObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.querySelectorAll('.fg[data-target]').forEach(fg => {
          // Animate from full dasharray to target
          fg.style.strokeDashoffset = '327';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              fg.style.strokeDashoffset = fg.dataset.target;
            });
          });
        });
        allRingObs.unobserve(e.target);
      }
    });
  }, {threshold:0.2});
  // Observe all sections with score rings, not just #scorecard
  document.querySelectorAll('section').forEach(s => {
    if(s.querySelector('.score-ring')) allRingObs.observe(s);
  });
})();

/* --- 9. Overall Bar Animation (upgrade existing) --- */
(function(){
  document.querySelectorAll('.overall-bar .fill[data-target]').forEach(fill => {
    fill.style.width = '0%';
  });
  const allBarObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        const fill = e.target.querySelector('.fill[data-target]');
        if(fill) {
          fill.style.width = fill.dataset.target + '%';
        }
        allBarObs.unobserve(e.target);
      }
    });
  }, {threshold:0.3});
  document.querySelectorAll('.overall-bar').forEach(el => allBarObs.observe(el));
})();

/* --- 10. PDF: Canvas to Image for Print --- */
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('canvas').forEach(canvas => {
    try {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.className = 'chart-print-img';
      canvas.style.display = 'none';
      canvas.parentNode.insertBefore(img, canvas);
    } catch(e) { /* cross-origin canvas, skip */ }
  });
});
window.addEventListener('afterprint', () => {
  document.querySelectorAll('.chart-print-img').forEach(img => img.remove());
  document.querySelectorAll('canvas').forEach(c => c.style.display = '');
});
`;
}

// ============ PRINT-ONLY HTML ============
function getPrintHtml(clientName, domain, liveUrl) {
  return `
<!-- ===== PRINT-ONLY: COVER PAGE ===== -->
<div class="print-only print-cover">
  <div class="cover-dot"></div>
  <div class="cover-brand">BRANDASTIC</div>
  <div class="cover-type">Digital Marketing Audit</div>
  <div class="cover-client">${clientName}</div>
  <div class="cover-domain">${domain}</div>
  <div class="cover-prepared">Prepared by Brandastic &nbsp;|&nbsp; May 2026</div>
  <div class="cover-confidential">CONFIDENTIAL</div>
</div>

<!-- ===== PRINT-ONLY: TABLE OF CONTENTS ===== -->
<div class="print-only print-toc">
  <h2>Table of Contents</h2>
  <div class="print-toc-item"><span class="toc-num">01</span><span class="toc-name">Business Overview</span></div>
  <div class="print-toc-item"><span class="toc-num">02</span><span class="toc-name">Executive Summary</span></div>
  <div class="print-toc-item"><span class="toc-num">03</span><span class="toc-name">Target Personas</span></div>
  <div class="print-toc-item"><span class="toc-num">04</span><span class="toc-name">SEO Health Scorecard</span></div>
  <div class="print-toc-item"><span class="toc-num">—</span><span class="toc-name">Google PageSpeed Insights</span></div>
  <div class="print-toc-item"><span class="toc-num">05</span><span class="toc-name">Traffic Trend</span></div>
  <div class="print-toc-item"><span class="toc-num">06</span><span class="toc-name">Keyword Analysis</span></div>
  <div class="print-toc-item"><span class="toc-num">06B</span><span class="toc-name">Google Ads Preview</span></div>
  <div class="print-toc-item"><span class="toc-num">07</span><span class="toc-name">Competitor Comparison</span></div>
  <div class="print-toc-item"><span class="toc-num">07B</span><span class="toc-name">SEO Competitor Matrix</span></div>
  <div class="print-toc-item"><span class="toc-num">—</span><span class="toc-name">Social Media Presence</span></div>
  <div class="print-toc-item"><span class="toc-num">—</span><span class="toc-name">Email & Content Marketing</span></div>
  <div class="print-toc-item"><span class="toc-num">—</span><span class="toc-name">Online Reputation</span></div>
  <div class="print-toc-item"><span class="toc-num">08</span><span class="toc-name">Problems → Solutions</span></div>
  <div class="print-toc-item"><span class="toc-num">09</span><span class="toc-name">Content Gap Analysis</span></div>
  <div class="print-toc-item"><span class="toc-num">10</span><span class="toc-name">Critical Findings</span></div>
  <div class="print-toc-item"><span class="toc-num">11</span><span class="toc-name">Strategy Preview</span></div>
  <div class="print-toc-item"><span class="toc-num">12</span><span class="toc-name">Growth Roadmap</span></div>
  <div class="print-toc-item"><span class="toc-num">13</span><span class="toc-name">Projected ROI</span></div>
  <div class="print-toc-item"><span class="toc-num">—</span><span class="toc-name">Why Brandastic & Next Steps</span></div>
</div>
`;
}

function getQrHtml(liveUrl) {
  return `
<!-- ===== PRINT-ONLY: QR CODE ===== -->
<div class="print-only print-qr">
  <p><strong>Scan to view the interactive version of this audit:</strong></p>
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(liveUrl)}" alt="QR Code" />
  <p style="margin-top:0.75rem;font-size:0.8rem;color:#64748b">${liveUrl}</p>
</div>
`;
}

// ============ PROCESS EACH FILE ============
files.forEach(({file, client, domain, url}) => {
  const filePath = path.join(__dirname, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Replace old .reveal CSS with empty (we'll add new version)
  // The old CSS has: .reveal{opacity:1;transform:none;...}.reveal.visible{opacity:1;transform:translateY(0)}
  html = html.replace(
    /\.reveal\{opacity:1;transform:none;transition:opacity[^}]+\}\.reveal\.visible\{[^}]+\}/g,
    '/* reveal CSS moved to upgrade block */'
  );

  // 2. Inject upgrade CSS before closing </style>
  html = html.replace(
    '</style>\n</head>',
    upgradeCss + '\n</style>\n</head>'
  );
  // Also handle case without newline
  html = html.replace(
    '</style></head>',
    upgradeCss + '\n</style></head>'
  );

  // 3. Inject print-only HTML right after <body>
  const printHtml = getPrintHtml(client, domain, url);
  html = html.replace('<body>', '<body>\n' + printHtml);

  // 4. Inject QR code before closing </body>
  const qrHtml = getQrHtml(url);
  // Also add the print footer info
  const printFooter = `
<!-- ===== PRINT-ONLY: FOOTER INFO ===== -->
<div class="print-only" style="text-align:center;padding:1rem;font-size:0.75rem;color:#64748b;border-top:1px solid #e5e7eb;margin-top:2rem">
  Brandastic Digital Audit | ${client} | brandastic.com | (949) 617-2731 | CONFIDENTIAL
</div>
`;

  html = html.replace('</body>', qrHtml + printFooter + '\n</body>');

  // 5. Remove old IntersectionObserver for .reveal (the one that adds 'visible')
  // Replace old obs code - match the pattern
  html = html.replace(
    /const obs=new IntersectionObserver\(\(entries\)=>\{entries\.forEach\(e=>\{if\(e\.isIntersecting\)\{e\.target\.classList\.add\(["']visible["']\);obs\.unobserve\(e\.target\)\}\}\)\},\{threshold:0\.\d+,?r?o?o?t?M?a?r?g?i?n?:?["']?\d*p?x?["']?\}\);document\.querySelectorAll\('\.reveal'\)\.forEach\(el=>obs\.observe\(el\)\);setTimeout\(\(\)=>\{document\.querySelectorAll\('\.reveal:not\(\.visible\)'\)\.forEach\(el=>el\.classList\.add\('visible'\)\)\},\d+\);/g,
    '/* old reveal observer removed - upgraded version in UX upgrade block */'
  );

  // Also handle variant without rootMargin
  html = html.replace(
    /const obs=new IntersectionObserver\(\(entries\)=>\{entries\.forEach\(e=>\{if\(e\.isIntersecting\)\{e\.target\.classList\.add\('visible'\);obs\.unobserve\(e\.target\)\}\}\)\},\{threshold:0\.1\}\);document\.querySelectorAll\('\.reveal'\)\.forEach\(el=>obs\.observe\(el\)\);setTimeout\(\(\)=>\{document\.querySelectorAll\('\.reveal:not\(\.visible\)'\)\.forEach\(el=>el\.classList\.add\('visible'\)\)\},\d+\);/g,
    '/* old reveal observer removed - upgraded version in UX upgrade block */'
  );

  // 6. Remove old ringObs, barObs, counterObs that duplicate our new ones
  // We'll keep the existing ones but they won't conflict since we're adding better versions

  // 7. Inject upgrade JS before closing </script>
  const lastScriptClose = html.lastIndexOf('</script>');
  if (lastScriptClose !== -1) {
    html = html.substring(0, lastScriptClose) + '\n' + getUpgradeJs(client, url) + '\n</script>' + html.substring(lastScriptClose + '</script>'.length);
  }

  // 8. Write back
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Upgraded: ${file} (${client})`);
});

console.log('\n🚀 All 3 audit pages upgraded!');
