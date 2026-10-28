from pathlib import Path

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

# Add click-to-pin annotation CSS + JS
pin_system = """
<style>
/* Click-to-pin annotations */
.pin-mode .slide { cursor: crosshair !important; }
.pin-mode .slide * { cursor: crosshair !important; }
.ann-pin { position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #ef4444; color: #fff;
  font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 50; box-shadow: 0 2px 8px rgba(0,0,0,.3); border: 2px solid #fff;
  transform: translate(-50%, -50%); font-family: Inter, sans-serif; }
.ann-pin:hover { transform: translate(-50%, -50%) scale(1.2); }
.ann-popup { position: absolute; z-index: 51; width: 280px; background: #fff; border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,.2); padding: .8rem; font-family: Inter, sans-serif;
  transform: translate(-50%, 8px); }
.ann-popup textarea { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: .4rem .5rem;
  font-size: .82rem; font-family: Inter, sans-serif; resize: none; height: 50px; box-sizing: border-box; margin-bottom: .4rem; }
.ann-popup input { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: .4rem .5rem;
  font-size: .82rem; font-family: Inter, sans-serif; box-sizing: border-box; margin-bottom: .4rem; }
.ann-popup .ann-btns { display: flex; gap: .3rem; }
.ann-popup .ann-btns button { flex: 1; border: 0; border-radius: 8px; padding: .4rem; font: 700 .78rem Inter, sans-serif; cursor: pointer; }
.ann-save { background: #0644ed; color: #fff; }
.ann-delete { background: #ef4444; color: #fff; }
.ann-cancel { background: #e5e7eb; color: #333; }
.ann-note-text { font-size: .82rem; color: #333; margin-top: .3rem; line-height: 1.3; }
.ann-note-meta { font-size: .68rem; color: #999; }
.ann-toggle { background: #ef4444 !important; color: #fff !important; border-color: #ef4444 !important; }
.ann-toggle.active { background: #22c55e !important; border-color: #22c55e !important; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } }
.ann-export { background: #0644ed !important; color: #fff !important; border-color: #0644ed !important; }
</style>

<script>
(function(){
  var pinMode = false;
  var pinCount = 0;
  var allPins = JSON.parse(localStorage.getItem('deck-pins') || '[]');
  var savedName = localStorage.getItem('deck-pin-name') || '';

  // Render existing pins
  allPins.forEach(function(pin) { createPinEl(pin); });
  pinCount = allPins.length;

  // Add toggle button to toolbar
  var toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn ann-toggle';
    toggleBtn.textContent = 'Drop pins';
    toggleBtn.onclick = function() {
      pinMode = !pinMode;
      document.body.classList.toggle('pin-mode', pinMode);
      toggleBtn.classList.toggle('active', pinMode);
      toggleBtn.textContent = pinMode ? 'Pinning... (click anywhere)' : 'Drop pins';
    };
    
    var exportBtn = document.createElement('button');
    exportBtn.className = 'btn ann-export';
    exportBtn.textContent = 'Export pins';
    exportBtn.onclick = exportPins;
    
    var hint = toolbar.querySelector('.hint');
    if (hint) {
      toolbar.insertBefore(exportBtn, hint);
      toolbar.insertBefore(toggleBtn, hint);
    }
  }

  // Click handler for dropping pins
  document.addEventListener('click', function(e) {
    if (!pinMode) return;
    var slide = e.target.closest('section');
    if (!slide) return;
    if (e.target.closest('.ann-pin') || e.target.closest('.ann-popup') || e.target.closest('.toolbar')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    var rect = slide.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width * 100);
    var y = ((e.clientY - rect.top) / rect.height * 100);
    
    pinCount++;
    var pin = { id: pinCount, x: x, y: y, slideId: slide.id || '', num: pinCount, name: '', text: '', time: '' };
    
    var pinEl = createPinEl(pin, true);
    slide.appendChild(pinEl.pin);
    slide.appendChild(pinEl.popup);
  });

  function createPinEl(pin, isNew) {
    var slide = pin.slideId ? document.getElementById(pin.slideId) : null;
    if (!slide) {
      var sections = document.querySelectorAll('section');
      sections.forEach(function(s, i) { if (!pin.slideId || s.id === pin.slideId) slide = s; });
    }
    if (!slide) return {};

    slide.style.position = 'relative';
    
    var el = document.createElement('div');
    el.className = 'ann-pin';
    el.style.left = pin.x + '%';
    el.style.top = pin.y + '%';
    el.textContent = pin.num;
    
    var popup = document.createElement('div');
    popup.className = 'ann-popup';
    popup.style.left = pin.x + '%';
    popup.style.top = pin.y + '%';
    popup.style.display = isNew ? 'block' : 'none';
    
    if (pin.text) {
      popup.innerHTML = '<div class="ann-note-meta">' + pin.name + ' &middot; ' + pin.time + '</div><div class="ann-note-text">' + pin.text + '</div><div class="ann-btns" style="margin-top:.4rem"><button class="ann-delete" onclick="deletePin(' + pin.id + ',this)">Delete</button><button class="ann-cancel" onclick="this.closest(\'.ann-popup\').style.display=\'none\'">Close</button></div>';
    } else {
      popup.innerHTML = '<input type="text" placeholder="Your name" value="' + savedName + '" class="pin-name"/><textarea placeholder="What should change here?"></textarea><div class="ann-btns"><button class="ann-save">Save</button><button class="ann-cancel">Cancel</button></div>';
      
      popup.querySelector('.ann-save').onclick = function() {
        var name = popup.querySelector('.pin-name').value.trim();
        var text = popup.querySelector('textarea').value.trim();
        if (!name || !text) return;
        pin.name = name;
        pin.text = text;
        pin.time = new Date().toLocaleString();
        localStorage.setItem('deck-pin-name', name);
        savedName = name;
        allPins.push(pin);
        localStorage.setItem('deck-pins', JSON.stringify(allPins));
        popup.innerHTML = '<div class="ann-note-meta">' + pin.name + ' &middot; ' + pin.time + '</div><div class="ann-note-text">' + pin.text + '</div><div class="ann-btns" style="margin-top:.4rem"><button class="ann-delete" onclick="deletePin(' + pin.id + ',this)">Delete</button><button class="ann-cancel" onclick="this.closest(\'.ann-popup\').style.display=\'none\'">Close</button></div>';
        popup.style.display = 'none';
      };
      popup.querySelector('.ann-cancel').onclick = function() {
        if (!pin.text) { el.remove(); popup.remove(); }
        else popup.style.display = 'none';
      };
    }
    
    el.onclick = function(e) { e.stopPropagation(); popup.style.display = popup.style.display === 'none' ? 'block' : 'none'; };
    
    slide.appendChild(el);
    slide.appendChild(popup);
    return { pin: el, popup: popup };
  }

  window.deletePin = function(id, btn) {
    allPins = allPins.filter(function(p) { return p.id !== id; });
    localStorage.setItem('deck-pins', JSON.stringify(allPins));
    var popup = btn.closest('.ann-popup');
    var pin = popup.previousElementSibling;
    popup.remove();
    if (pin && pin.classList.contains('ann-pin')) pin.remove();
  };

  function exportPins() {
    if (!allPins.length) { alert('No pins to export'); return; }
    var out = allPins.map(function(p) {
      return 'Pin #' + p.num + ' (Slide: ' + p.slideId + ') - ' + p.name + ' (' + p.time + '): ' + p.text;
    });
    navigator.clipboard.writeText(out.join('\n')).then(function() {
      alert('All pins copied to clipboard!');
    });
  }
})();
</script>
"""

if 'ann-pin' not in t:
    t = t.replace('</body>', pin_system + '</body>')
    print("Pin system added")

# Remove the old Annotate button text
t = t.replace('Annotate</button>', 'Annotate (text)</button>')

p.write_text(t)
print(f"Has pin system: {'ann-pin' in t}")
print(f"Has drop pins: {'Drop pins' in t}")

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "Add click-anywhere pin annotation system like XD"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
