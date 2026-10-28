from pathlib import Path
import re

p = Path("gameplan_marketing/brandastic-2027-education.html")
t = p.read_text()

# Find and replace the LinkedIn posts slide
idx = t.find('id="posts"')
if idx < 0:
    print("Posts slide not found")
    exit()

sec_start = t.rfind("<section", 0, idx)
sec_end = t.find("</section>", idx) + len("</section>")

new_posts = """<section class="slide" id="posts">
    <div class="slide-inner" style="border-top:4px solid #22c55e">
      <div class="kicker" style="color:#22c55e">Social media posts your team can use this week</div>
      <div class="h2">LinkedIn posts with images</div>
      <p class="lede">Post 3 to 5 times per week. Each post pairs a message with an image. Here are four ready-to-use posts your team can copy and schedule.</p>
      <div class="grid2" style="margin-top:.6rem">
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:.7rem .8rem;display:flex;align-items:center;gap:.4rem;border-bottom:1px solid rgba(0,0,0,.06)">
            <div style="width:28px;height:28px;border-radius:50%;background:#0644ed;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.6rem">B</div>
            <div><div style="font-weight:700;font-size:.78rem">Brandastic</div><div style="font-size:.65rem;color:#999">Marketing for schools</div></div>
          </div>
          <div style="padding:.6rem .8rem;font-size:.85rem;line-height:1.45">Online schools don't need "brand awareness." They need families to find them and sign up. We help schools show up in Google, run the right ads, and build a website families trust. All of it focused on getting families to actually start the enrollment process.</div>
          <img src="../assets/ba-office-2027/ad-empty-classroom.jpg" alt="" style="width:100%;display:block"/>
          <div style="padding:.4rem .8rem;font-size:.72rem;color:#999">Post 1 &middot; The enrollment pain</div>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:.7rem .8rem;display:flex;align-items:center;gap:.4rem;border-bottom:1px solid rgba(0,0,0,.06)">
            <div style="width:28px;height:28px;border-radius:50%;background:#0644ed;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.6rem">B</div>
            <div><div style="font-weight:700;font-size:.78rem">Brandastic</div><div style="font-size:.65rem;color:#999">Marketing for schools</div></div>
          </div>
          <div style="padding:.6rem .8rem;font-size:.85rem;line-height:1.45">Enrollment marketing fails in the first 10 seconds. Can a parent tell who the school is for, what happens next, and why they should trust it? If a parent can't answer those in 10 seconds, no amount of ad spend will save it.</div>
          <img src="../assets/ba-office-2027/ad-parent-searching.jpg" alt="" style="width:100%;display:block"/>
          <div style="padding:.4rem .8rem;font-size:.72rem;color:#999">Post 2 &middot; The 10-second test</div>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:.7rem .8rem;display:flex;align-items:center;gap:.4rem;border-bottom:1px solid rgba(0,0,0,.06)">
            <div style="width:28px;height:28px;border-radius:50%;background:#0644ed;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.6rem">B</div>
            <div><div style="font-weight:700;font-size:.78rem">Brandastic</div><div style="font-size:.65rem;color:#999">Marketing for schools</div></div>
          </div>
          <div style="padding:.6rem .8rem;font-size:.85rem;line-height:1.45">Fix the enrollment path on your website before buying more ads. Most schools pour money into getting attention while their website loses families at the front door. Get found. Make it clear. Then spend more.</div>
          <img src="../assets/ba-office-2027/ad-thriving-school.jpg" alt="" style="width:100%;display:block"/>
          <div style="padding:.4rem .8rem;font-size:.72rem;color:#999">Post 3 &middot; Fix first, then spend</div>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:.7rem .8rem;display:flex;align-items:center;gap:.4rem;border-bottom:1px solid rgba(0,0,0,.06)">
            <div style="width:28px;height:28px;border-radius:50%;background:#0644ed;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.6rem">B</div>
            <div><div style="font-weight:700;font-size:.78rem">Brandastic</div><div style="font-size:.65rem;color:#999">Marketing for schools</div></div>
          </div>
          <div style="padding:.6rem .8rem;font-size:.85rem;line-height:1.45">We run enrollment marketing for CalOPS, Think Together, and Heart School. We helped CalOPS increase enrollment by 75% and generate over 90,000 leads in one year. Same approach, different school. If families have to find you online, that is the job and we already know how.</div>
          <img src="../assets/ba-office-2027/edu-cover-school.jpg" alt="" style="width:100%;display:block"/>
          <div style="padding:.4rem .8rem;font-size:.72rem;color:#999">Post 4 &middot; The case study</div>
        </div>
      </div>
      <div class="footer-bar"><span>BRANDASTIC 2027</span><span>SOCIAL</span></div>
    </div>
  </section>"""

t = t[:sec_start] + new_posts + t[sec_end:]

p.write_text(t)
print(f"Posts slide rebuilt. Sections: {t.count('<section')}")

import subprocess
subprocess.run(["git", "add", "."], cwd=".")
r = subprocess.run(["git", "commit", "-m", "LinkedIn posts slide: clearer header, images, looks like real LinkedIn posts"], capture_output=True, text=True, cwd=".")
print(r.stdout[-100:] if r.stdout else r.stderr[-100:])
r2 = subprocess.run(["git", "push", "origin", "HEAD"], capture_output=True, text=True, cwd=".")
print(r2.stdout[-100:] if r2.stdout else r2.stderr[-100:])
