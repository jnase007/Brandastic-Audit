from pathlib import Path

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

sidebar_and_js = """
<style>
.notes-sidebar{position:fixed;top:0;right:-380px;width:380px;height:100vh;background:#fff;box-shadow:-8px 0 30px rgba(0,0,0,.15);z-index:99999;transition:right .3s ease;overflow-y:auto;font-family:Inter,system-ui,sans-serif}
.notes-sidebar.open{right:0}
.ns-head{padding:1rem 1.2rem;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#fff;z-index:1}
.ns-head h3{font-size:1rem;margin:0;color:#15202b}
.ns-close{border:0;background:0;font-size:1.4rem;cursor:pointer;color:#999;padding:.2rem}
.ns-name{padding:.6rem 1.2rem;border-bottom:1px solid #eee}
.ns-name input{width:100%;border:1px solid #ddd;border-radius:8px;padding:.5rem .6rem;font-size:.85rem;font-family:Inter,system-ui,sans-serif;box-sizing:border-box}
.ns-slide{padding:.8rem 1.2rem;border-bottom:1px solid #f0f0f0}
.ns-slide-title{font-size:.78rem;font-weight:800;color:#0644ed;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.05em}
.ns-note{background:#f8f9fa;border-radius:8px;padding:.5rem .6rem;margin-bottom:.4rem;font-size:.82rem}
.ns-author{font-weight:700;color:#0644ed;font-size:.72rem}
.ns-time{color:#999;font-size:.68rem;margin-left:.3rem}
.ns-text{margin-top:.2rem;color:#333;line-height:1.4}
.ns-add{display:flex;gap:.4rem;margin-top:.4rem}
.ns-add textarea{flex:1;border:1px solid #ddd;border-radius:8px;padding:.4rem .5rem;font-size:.82rem;font-family:Inter,system-ui,sans-serif;resize:none;height:36px;box-sizing:border-box}
.ns-add button{border:0;border-radius:8px;background:#0644ed;color:#fff;font-weight:700;font-size:.78rem;padding:.4rem .7rem;cursor:pointer;white-space:nowrap}
.ns-actions{padding:.8rem 1.2rem;border-top:1px solid #eee;position:sticky;bottom:0;background:#fff;display:flex;gap:.4rem}
.ns-actions button{flex:1;border:0;border-radius:8px;padding:.6rem;font:700 .82rem Inter,system-ui,sans-serif;cursor:pointer}
.ns-export{background:#0644ed;color:#fff}
.ns-clear{background:#ef4444;color:#fff}
</style>
<div class="notes-sidebar" id="notesSidebar">
<div class="ns-head"><h3>Team Notes</h3><button class="ns-close" onclick="toggleNotes()">&times;</button></div>
<div class="ns-name"><input type="text" id="notesName" placeholder="Your name (e.g. Melissa)" /></div>
<div id="notesBody"></div>
<div class="ns-actions"><button class="ns-export" onclick="exportNotes()">Copy all notes</button><button class="ns-clear" onclick="clearNotes()">Clear all</button></div>
</div>
<script>
function toggleNotes(){document.getElementById('notesSidebar').classList.toggle('open');if(document.getElementById('notesSidebar').classList.contains('open'))renderNotes();}
function renderNotes(){var secs=document.querySelectorAll('section');var h='';var nameVal=localStorage.getItem('deck-reviewer-name')||'';document.getElementById('notesName').value=nameVal;secs.forEach(function(s,i){var sid=s.id||'s'+i;var tEl=s.querySelector('.h2,.h1');var title=tEl?tEl.textContent.trim().substring(0,40):'Slide '+(i+1);var notes=JSON.parse(localStorage.getItem('dn-'+sid)||'[]');h+='<div class="ns-slide"><div class="ns-slide-title">Slide '+(i+1)+': '+title+'</div>';notes.forEach(function(n){h+='<div class="ns-note"><span class="ns-author">'+n.n+'</span><span class="ns-time">'+n.t+'</span><div class="ns-text">'+n.x+'</div></div>';});h+='<div class="ns-add"><textarea placeholder="Add a note..." data-s="'+sid+'"></textarea><button onclick="addNote(this)">Add</button></div></div>';});document.getElementById('notesBody').innerHTML=h;}
function addNote(b){var ta=b.previousElementSibling;var sid=ta.getAttribute('data-s');var name=document.getElementById('notesName').value.trim();if(!name){alert('Please type your name at the top');return;}if(!ta.value.trim())return;localStorage.setItem('deck-reviewer-name',name);var notes=JSON.parse(localStorage.getItem('dn-'+sid)||'[]');notes.push({n:name,x:ta.value.trim(),t:new Date().toLocaleString()});localStorage.setItem('dn-'+sid,JSON.stringify(notes));ta.value='';renderNotes();}
function exportNotes(){var secs=document.querySelectorAll('section');var out=[];secs.forEach(function(s,i){var sid=s.id||'s'+i;var tEl=s.querySelector('.h2,.h1');var title=tEl?tEl.textContent.trim().substring(0,40):'Slide '+(i+1);var notes=JSON.parse(localStorage.getItem('dn-'+sid)||'[]');if(notes.length){out.push('--- Slide '+(i+1)+': '+title+' ---');notes.forEach(function(n){out.push(n.n+' ('+n.t+'): '+n.x);});out.push('');}});if(!out.length){alert('No notes yet');return;}navigator.clipboard.writeText(out.join('\n')).then(function(){alert('Notes copied! Paste into email or Slack.');});}
function clearNotes(){if(!confirm('Clear ALL notes?'))return;var secs=document.querySelectorAll('section');secs.forEach(function(s,i){localStorage.removeItem('dn-'+(s.id||'s'+i));});renderNotes();}
</script>
"""

if 'notes-sidebar' not in t:
    t = t.replace('</body>', sidebar_and_js + '\n</body>')
    print("Sidebar + JS added")
else:
    print("Already has sidebar")

p.write_text(t)
print(f"toggleNotes: {'toggleNotes' in t}")
print(f"notes-sidebar: {'notes-sidebar' in t}")

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "Add notes sidebar + JavaScript"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
