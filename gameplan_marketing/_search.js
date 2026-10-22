/* STRATEGIES hub search */
(function(){
  if (window.__baSearchInit) return; window.__baSearchInit = true;
  function el(tag, cls, html){ var n=document.createElement(tag); if(cls)n.className=cls; if(html!=null)n.innerHTML=html; return n; }
  function norm(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\s+]/g,' ').replace(/\s+/g,' ').trim(); }
  function score(item, q){
    var t = item.text || '';
    var parts = q.split(/\s+/).filter(Boolean);
    if(!parts.length) return 0;
    var s = 0;
    for (var i=0;i<parts.length;i++){
      var p = parts[i];
      if (t.indexOf(p) === -1) return 0;
      s += 2;
      if ((item.title||'').toLowerCase().indexOf(p)!==-1) s += 5;
      if ((item.h1||'').toLowerCase().indexOf(p)!==-1) s += 3;
      if ((item.file||'').toLowerCase().indexOf(p)!==-1) s += 2;
    }
    return s;
  }
  function mount(index){
    var nav = document.getElementById('side-nav');
    if(!nav || document.getElementById('ba-hub-search')) return;
    var wrap = el('div','ba-search-wrap');
    wrap.id = 'ba-hub-search';
    wrap.innerHTML = '<label class="ba-search-label" for="ba-search-input">Search</label>'+
      '<div class="ba-search-row">'+
      '<input id="ba-search-input" type="search" placeholder="e.g. best LinkedIn ad" autocomplete="off" spellcheck="false"/>'+
      '<button type="button" id="ba-search-clear" hidden>Clear</button></div>'+
      '<div id="ba-search-results" class="ba-search-results" hidden></div>';
    var after = nav.querySelector('.theme-toggle') || nav.querySelector('.sub');
    if (after && after.parentNode === nav) nav.insertBefore(wrap, after.nextSibling);
    else nav.insertBefore(wrap, nav.querySelector('a.nav-home') || nav.firstChild);

    var input = document.getElementById('ba-search-input');
    var results = document.getElementById('ba-search-results');
    var clear = document.getElementById('ba-search-clear');
    var t = null;
    function render(q){
      q = norm(q);
      clear.hidden = !q;
      if(!q){ results.hidden = true; results.innerHTML=''; return; }
      var hits = [];
      for (var i=0;i<index.length;i++){
        var sc = score(index[i], q);
        if (sc>0) hits.push({item:index[i], sc:sc});
      }
      hits.sort(function(a,b){ return b.sc - a.sc; });
      hits = hits.slice(0,12);
      if(!hits.length){
        results.hidden = false;
        results.innerHTML = '<div class="ba-search-empty">No matches. Try “linkedin”, “ads”, “seo”, “bonus”…</div>';
        return;
      }
      results.hidden = false;
      results.innerHTML = hits.map(function(h){
        var it=h.item;
        var sub = (it.section? it.section+' · ' : '') + (it.h1 && it.h1!==it.title ? it.h1 : it.file);
        return '<a class="ba-search-hit" href="'+it.href+'">'+'
          <span class="ba-search-hit-title">'+it.title.replace(/</g,'<')+'</span>'+
          '<span class="ba-search-hit-sub">'+String(sub).replace(/</g,'<')+'</span></a>';
      }).join('');
    }
    input.addEventListener('input', function(){
      clearTimeout(t);
      var v = input.value;
      t = setTimeout(function(){ render(v); }, 80);
    });
    input.addEventListener('keydown', function(e){
      if(e.key==='Escape'){ input.value=''; render(''); input.blur(); }
      if(e.key==='Enter'){
        var first = results.querySelector('a.ba-search-hit');
        if(first){ e.preventDefault(); location.href = first.getAttribute('href'); }
      }
    });
    clear.addEventListener('click', function(){ input.value=''; render(''); input.focus(); });
    // deep link ?q=
    try {
      var u = new URL(location.href);
      var q0 = u.searchParams.get('q');
      if (q0){ input.value = q0; render(q0); }
    } catch(e){}
  }
  function boot(){
    fetch('/gameplan_marketing/_search-index.json', {cache:'no-store'})
      .then(function(r){ return r.json(); })
      .then(mount)
      .catch(function(){
        // fallback: nav link titles only
        var links = [].slice.call(document.querySelectorAll('#side-nav a[href*="gameplan_marketing"]'));
        var index = links.map(function(a){
          var href = a.getAttribute('href');
          var title = (a.textContent||'').replace(/\s+/g,' ').trim();
          return { href: href, title: title, h1: title, section: '', file: href, text: title.toLowerCase() };
        }).filter(function(x){ return x.title && x.href; });
        mount(index);
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
