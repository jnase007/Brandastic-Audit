(function () {
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var incoming = new URLSearchParams(window.location.search);
  var stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('brd_audit_utms') || '{}') || {}; } catch (e) { stored = {}; }
  KEYS.forEach(function (k) {
    var v = incoming.get(k);
    if (v) stored[k] = v;
  });
  try {
    if (KEYS.some(function (k) { return stored[k]; })) {
      sessionStorage.setItem('brd_audit_utms', JSON.stringify(stored));
    }
  } catch (e) {}

  var hasIncoming = KEYS.some(function (k) { return stored[k]; });
  var path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
  var pageContent = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
  var defaults = {
    utm_source: 'audit.brandastic.com',
    utm_medium: 'referral',
    utm_campaign: 'audit-site',
    utm_content: pageContent
  };

  function isMainBrandastic(host) {
    host = String(host || '').toLowerCase().replace(/\.$/, '');
    return host === 'brandastic.com' || host === 'www.brandastic.com';
  }

  function decorate(href) {
    var url;
    try { url = new URL(href, window.location.href); } catch (e) { return href; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return href;
    if (!isMainBrandastic(url.hostname)) return href;
    if (hasIncoming) {
      KEYS.forEach(function (k) {
        if (stored[k]) url.searchParams.set(k, stored[k]);
      });
    } else {
      KEYS.forEach(function (k) {
        if (!url.searchParams.get(k) && defaults[k]) url.searchParams.set(k, defaults[k]);
      });
    }
    return url.toString();
  }

  function applyAll() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href');
      if (!href || href.indexOf('brandastic.com') === -1) continue;
      var next = decorate(href);
      if (next !== href) a.setAttribute('href', next);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.indexOf('brandastic.com') === -1) return;
    var next = decorate(href);
    if (next !== href) a.setAttribute('href', next);
  }, true);
})();
