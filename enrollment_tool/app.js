(function () {
  var demo = window.EnrollmentDemo;
  var state = {
    filters: { campus: "all", geography: "all", date: "window", channel: "all" },
    feedback: demo.defaultFeedbackOptions(),
    drawer: null
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function money(value) {
    if (value == null || !isFinite(value)) return "—";
    return Math.round(value).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  }

  function prettyDate(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[Number(parts[1]) - 1] + " " + Number(parts[2]) + ", " + parts[0];
  }

  function model() {
    return demo.compute(state.filters, state.feedback);
  }

  function select(id, label, value, options) {
    return '<label class="filter-field"><span>' + label + '</span><select id="' + id + '" data-filter="' + id + '">' +
      options.map(function (option) {
        return '<option value="' + esc(option[0]) + '"' + (option[0] === value ? " selected" : "") + ">" + esc(option[1]) + "</option>";
      }).join("") + "</select></label>";
  }

  function renderFilters() {
    var campusOptions = [
      ["all", "All campuses"],
      ["Maple Ridge", "Maple Ridge"],
      ["Harbor View", "Harbor View"],
      ["Cedar Falls", "Cedar Falls"],
      ["Online", "Online"]
    ];
    var switcher = document.getElementById("campus-switch");
    if (switcher) {
      switcher.innerHTML = campusOptions.map(function (option) {
        return '<option value="' + esc(option[0]) + '"' + (option[0] === state.filters.campus ? " selected" : "") + ">" + esc(option[1]) + "</option>";
      }).join("");
    }
    document.getElementById("filters").innerHTML =
      '<form class="filters" id="filter-form">' +
      select("campus", "Campus", state.filters.campus, campusOptions) +
      select("geography", "Online geography", state.filters.geography, [
        ["all", "All geographies"],
        ["in-person", "In-person campuses"],
        ["online-eligible", "Online · eligible states"],
        ["online-CA", "Online · California"],
        ["online-AZ", "Online · Arizona"],
        ["online-TX", "Online · Texas"],
        ["online-NV", "Online · Nevada"],
        ["online-outside", "Online · outside sample list"]
      ]) +
      select("date", "Date", state.filters.date, Object.keys(demo.DATE_RANGES).map(function (key) {
        return [key, demo.DATE_RANGES[key].short || demo.DATE_RANGES[key].label];
      })) +
      select("channel", "Channel", state.filters.channel, [
        ["all", "All channels"],
        ["Google Ads", "Google Ads"],
        ["Meta Ads", "Meta Ads"],
        ["Organic", "Organic"],
        ["Offline / referral", "Offline / referral"],
        ["No tracked inquiry", "No tracked inquiry"]
      ]) +
      "</form>";
  }

  function metric(name, label, value) {
    return '<div class="metric"><span>' + esc(label) + '</span><strong data-metric="' + name + '">' + esc(value) + "</strong></div>";
  }

  function renderDashboard(data) {
    var rows = data.campaigns.slice().sort(function (a, b) { return b.enrolled - a.enrolled || b.leads - a.leads; });
    var costNote = data.spendUnallocated
      ? "Online spend in this sample is not split by state, so cost per enrollment is hidden for this geography."
      : "Cost per enrollment is sample ad spend divided by enrollments tied to a paid campaign. Organic and offline enrollments are in the enrolled count and left out of that cost.";
    var table = rows.length
      ? '<div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Channel</th><th>Campus</th><th class="num">Spend</th><th class="num">Leads</th><th class="num">Applications</th><th class="num">Enrolled</th><th class="num">Cost / enrolled</th></tr></thead><tbody>' +
        rows.map(function (row) {
          return '<tr tabindex="0" data-campaign="' + esc(row.campaign.id) + '"><td>' + esc(row.campaign.name) + "</td><td>" + esc(row.campaign.channel) +
            "</td><td>" + esc(row.campaign.campus) + '</td><td class="num">' + esc(money(row.spend)) + '</td><td class="num">' + row.leads +
            '</td><td class="num">' + row.applications + '</td><td class="num">' + row.enrolled + '</td><td class="num">' + esc(money(row.costPerEnrollment)) + "</td></tr>";
        }).join("") + "</tbody></table></div>"
      : '<p class="fine">No paid campaigns in this filter. Organic and offline inquiries are still in the counts above.</p>';
    var queue = queueCounts(data);
    document.getElementById("dashboard").innerHTML =
      '<div class="school-layout"><div class="metrics" id="summary" aria-live="polite">' +
      metric("leads", "Tracked leads", String(data.funnel.leads)) +
      metric("applications", "Applications", String(data.funnel.applications)) +
      metric("enrolled", "Enrolled", String(data.funnel.enrolled)) +
      metric("cpe", "Cost / enrolled", money(data.costPerEnrollment)) +
      '</div><div class="school-main"><p class="fine">' + esc(costNote) + "</p>" +
      charts(data) + '</div><aside class="queue school-only"><h3>Match review queue</h3><ul>' +
      '<li><span>High confidence</span><strong data-queue="high">' + queue.high + "</strong></li>" +
      '<li><span>Needs review</span><strong data-queue="review">' + queue.review + "</strong></li>" +
      '<li><span>Missing data</span><strong data-queue="missing">' + queue.missing + "</strong></li>" +
      '</ul><p class="fine">These counts use this filter. A match is not guessed.</p></aside></div>' +
      '<h3 class="table-title">Sample campaigns</h3>' + table +
      '<details class="records"><summary>Sample records</summary><div id="records"></div></details>';
    renderRecords(data);
  }

  function pct(value, max) {
    if (!isFinite(value) || !isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  function charts(data) {
    var leads = data.funnel.leads;
    var applications = data.funnel.applications;
    var enrolled = data.funnel.enrolled;
    var funnelMax = Math.max(leads, applications, enrolled, 0);
    var funnel = funnelMax === 0
      ? '<p class="empty">No inquiries, applications, or enrollments in this filter.</p>'
      : '<div class="bars" role="group" aria-label="Inquiry, application, and enrollment counts">' +
        bar("Inquiry", leads, funnelMax, "Tracked leads in this filter: " + leads, "data-chart-leads") +
        bar("Application", applications, funnelMax, "School-confirmed applications in this filter: " + applications, "") +
        bar("Enrolled", enrolled, funnelMax, "School-confirmed enrollments in this filter: " + enrolled, "") +
        "</div>";
    var channels = data.byChannel.filter(function (row) { return row.leads || row.applications || row.enrolled; });
    var channelMax = channels.reduce(function (max, row) { return Math.max(max, row.leads, row.enrolled); }, 0);
    var channelChart = !channels.length
      ? '<p class="empty">No channel rows in this filter.</p>'
      : '<div class="legend"><span><i class="swatch leads"></i>Leads</span><span><i class="swatch enrolled"></i>Enrolled</span></div>' +
        '<div class="bars" role="group" aria-label="Leads and enrollments by channel">' +
        channels.map(function (row) {
          return '<div class="hbar dual" tabindex="0"><span class="hbar-label">' + esc(row.channel) + '</span><span class="hbar-stack">' +
            '<span class="hbar-track"><span class="hbar-fill leads" style="width:' + pct(row.leads, channelMax) + '%"></span></span>' +
            '<span class="hbar-track"><span class="hbar-fill enrolled" style="width:' + pct(row.enrolled, channelMax) + '%"></span></span>' +
            '</span><span class="hbar-value">' + row.leads + " / " + row.enrolled + '</span><span class="tip" role="tooltip">' +
            esc(row.channel + ": " + row.leads + " leads, " + row.enrolled + " enrolled. Same filter as the numbers above.") + "</span></div>";
        }).join("") + "</div>";
    var costs = data.campaigns.filter(function (row) { return row.costPerEnrollment != null && isFinite(row.costPerEnrollment); });
    var costMax = costs.reduce(function (max, row) { return Math.max(max, row.costPerEnrollment); }, 0);
    var costChart = !costs.length
      ? '<p class="empty">No sample cost per enrollment in this filter.</p>'
      : '<div class="bars" role="group" aria-label="Sample cost per associated enrollment by campaign">' +
        costs.map(function (row) {
          return bar(row.campaign.name, row.costPerEnrollment, costMax, row.campaign.name + ": " + money(row.costPerEnrollment) + " sample cost per associated enrollment. Not sent to Google or Meta.", "", true);
        }).join("") + "</div>";
    var enrolledMax = rowsMax(data.campaigns, "enrolled");
    var enrollChart = enrolledMax === 0
      ? '<p class="empty">No enrollments in this filter.</p>'
      : '<div class="bars" role="group" aria-label="Enrollments by campaign">' +
        data.campaigns.map(function (row) {
          return bar(row.campaign.name, row.enrolled, enrolledMax, row.campaign.name + ": " + row.enrolled + " school-confirmed enrollments in this filter.", "");
        }).join("") + "</div>";
    return '<div class="charts">' +
      figure("From inquiry to enrollment", "Counts in this filter. Leads use the inquiry date. Applications and enrollments use the school status date.", funnel, "chart-funnel") +
      figure("By channel", "Leads and school-confirmed enrollments. Organic and offline stay visible.", channelChart, "chart-channel") +
      figure("Sample cost per enrollment", "Paid spend in this filter divided by enrollments tied to that campaign.", costChart, "chart-cost") +
      figure("Enrollments by campaign", "School-confirmed enrollments in this filter. Same rows as the table.", enrollChart, "chart-enroll school-only") +
      "</div>";
  }

  function rowsMax(rows, key) {
    return rows.reduce(function (max, row) { return Math.max(max, row[key] || 0); }, 0);
  }

  function queueCounts(data) {
    return {
      high: data.outcomes.filter(function (row) { return row.sharedKey && demo.attributedLead(row) && !row.sibling; }).length,
      review: data.leads.filter(function (lead) {
        var label = demo.leadMatchLabel(lead);
        return label === "No school status yet" || label === "Duplicate lead, same shared key";
      }).length,
      missing: data.leads.filter(function (lead) { return !lead.sharedKey; }).length + data.outcomes.filter(function (row) { return !row.sharedKey; }).length
    };
  }

  function figure(title, note, body, extraClass) {
    return '<figure class="chart' + (extraClass ? " " + extraClass : "") + '"><figcaption><strong>' + esc(title) + "</strong><span>" + esc(note) + "</span></figcaption>" + body + "</figure>";
  }

  function bar(label, value, max, tip, attr, asMoney) {
    var shown = asMoney ? money(value) : String(value);
    return '<div class="hbar" tabindex="0"><span class="hbar-label">' + esc(label) + '</span><span class="hbar-track"><span class="hbar-fill" style="width:' +
      pct(value, max) + '%"></span></span><span class="hbar-value"' + (attr ? " " + attr : "") + ">" + esc(shown) +
      '</span><span class="tip" role="tooltip">' + esc(tip) + "</span></div>";
  }

  function renderRecords(data) {
    var host = document.getElementById("records");
    if (!host) return;
    var inquiries = data.leads.map(function (lead) {
      var campaign = demo.campaignById(lead.campaignId);
      return "<tr><td>" + esc(lead.id) + "</td><td>" + esc(prettyDate(lead.date)) + "</td><td>" + esc(lead.channel) +
        "</td><td>" + esc(campaign ? campaign.name : "—") + "</td><td>" + esc(demo.leadMatchLabel(lead)) + "</td></tr>";
    }).join("");
    var facts = data.outcomes.map(function (row) {
      return "<tr><td>" + esc(row.id) + "</td><td>" + esc(prettyDate(row.date)) + "</td><td>" + esc(row.status) +
        "</td><td>" + esc(row.mode === "online" ? "Online · " + row.state : row.campus) + "</td><td>" + esc(row.sharedKey || "—") + "</td></tr>";
    }).join("");
    host.innerHTML =
      "<h3>WhatConverts inquiries</h3><p class=\"fine\">Person details are omitted. This list is not a live export.</p>" +
      '<div class="table-wrap"><table><thead><tr><th>Lead</th><th>Date</th><th>Channel</th><th>Campaign</th><th>Match</th></tr></thead><tbody>' +
      (inquiries || "<tr><td colspan=\"5\">None in this filter.</td></tr>") + "</tbody></table></div>" +
      "<h3>FACTS file</h3><p class=\"fine\">Read-only sample. No upload.</p><p><button class=\"primary\" id=\"download-sample\" type=\"button\">Download this fictional CSV</button></p>" +
      '<div class="table-wrap"><table><thead><tr><th>Application</th><th>Date</th><th>Status</th><th>Campus</th><th>Shared key</th></tr></thead><tbody>' +
      (facts || "<tr><td colspan=\"5\">None in this filter.</td></tr>") + "</tbody></table></div>";
  }

  function distinct(records, sync) {
    var seen = {};
    records.forEach(function (record) {
      if (record.sync === sync) seen[record.outcomeId || record.leadId || record.reason] = true;
    });
    return Object.keys(seen).length;
  }

  function renderFeedback(data) {
    var records = data.feedback.records;
    var rows = [
      ["ready", "Ready", distinct(records, "eligible"), "School confirmed the outcome, and the inquiry came from Google.", "Review. Not sent."],
      ["wait", "Waiting", distinct(records, "pending"), "The inquiry is tracked. The school has not confirmed an outcome in this sample yet.", "Wait for the school file."],
      ["stop", "Needs a match", distinct(records, "unmatched"), "The inquiry and the school result are not tied together, or the ad click is missing.", "Do not send."]
    ];
    var log = records.map(function (record) {
      return "<tr><td>" + esc(record.sync === "eligible" ? "Eligible for sync" : record.sync) + "</td><td>" + esc(record.signal) +
        "</td><td>" + esc(record.outcomeId || "—") + "</td><td>" + esc(record.shared ? record.shared.click_id : "Not included") +
        "</td><td class=\"num\">" + esc(record.shared ? String(record.shared.value) : "—") + "</td><td>" + esc(record.leadId || "—") + "</td></tr>";
    }).join("");
    document.getElementById("feedback-body").innerHTML =
      '<div class="table-wrap"><table class="status-table"><thead><tr><th>Status</th><th class="num">Count</th><th>What it means</th><th>Next</th></tr></thead><tbody>' +
      rows.map(function (row) {
        return "<tr><td><span class=\"dot " + row[0] + "\"></span>" + esc(row[1]) + "</td><td class=\"num\">" + row[2] + "</td><td>" + esc(row[3]) + "</td><td>" + esc(row[4]) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<details class="tech"><summary>Technical details</summary>' +
      '<div class="checks">' +
      check("qualified", "Qualified inquiry") +
      check("application", "Application") +
      check("enrollment", "Enrollment") +
      "</div>" +
      '<div class="radios">' +
      radio("whatconverts", "Read the ad click from WhatConverts") +
      radio("landing-form", "Read it from the landing form instead") +
      "</div>" +
      '<p class="fine">' + esc(data.feedback.clickSourceLabel) + " Would not share: " + esc(demo.WITHHELD.join(", ")) + ".</p>" +
      '<div class="table-wrap"><table><thead><tr><th>Status</th><th>Signal</th><th>School row</th><th>Click id</th><th class="num">Value</th><th>Lead</th></tr></thead><tbody>' +
      (log || "<tr><td colspan=\"6\">None in this filter.</td></tr>") +
      "</tbody></table></div></details>";
  }

  function check(key, label) {
    return '<label><input type="checkbox" data-signal="' + key + '"' + (state.feedback[key] ? " checked" : "") + "> " + esc(label) + "</label>";
  }

  function radio(value, label) {
    return '<label><input type="radio" name="click-source" data-click-source="' + value + '"' +
      (state.feedback.clickSource === value ? " checked" : "") + "> " + esc(label) + "</label>";
  }

  function renderDrawer(data) {
    var root = document.getElementById("drawer-root");
    if (!state.drawer) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    var found = null;
    data.campaigns.forEach(function (row) { if (row.campaign.id === state.drawer) found = row; });
    var lines = [];
    if (found) {
      found.leadRows.forEach(function (lead) { lines.push(lead.id + " · " + prettyDate(lead.date) + " · " + demo.leadMatchLabel(lead)); });
      found.outcomeRows.forEach(function (row) {
        var lead = demo.attributedLead(row);
        lines.push(row.id + " · " + row.status + " · " + prettyDate(row.date) + " · " + (lead ? lead.id : "no inquiry"));
      });
    }
    root.hidden = false;
    root.className = "drawer-root";
    root.innerHTML = '<div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><button class="text" id="close-drawer" type="button">Close</button><h2 id="drawer-title">' +
      esc(found ? found.campaign.name : "Campaign") + "</h2><p class=\"fine\">" + esc(found ? found.campaign.channel + " · " + money(found.spend) + " spend · " + money(found.costPerEnrollment) + " per enrolled" : "") +
      "</p><ul>" + (lines.length ? lines.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") : "<li>None in this filter.</li>") + "</ul></div>";
    var close = document.getElementById("close-drawer");
    if (close) close.focus();
  }

  function render() {
    var activeId = document.activeElement && document.activeElement.id;
    var data = model();
    renderFilters();
    renderDashboard(data);
    renderFeedback(data);
    renderDrawer(data);
    if (activeId && activeId !== "close-drawer") {
      var next = document.getElementById(activeId);
      if (next) next.focus();
    }
    document.body.dataset.ready = "true";
    syncShell();
  }

  function syncShell() {
    var on = location.hash === "#school-demo";
    document.body.classList.toggle("school-demo", on);
    var bar = document.getElementById("school-appbar");
    var note = document.getElementById("session-note");
    if (bar) bar.hidden = !on;
    if (note) note.hidden = !on;
  }

  document.body.addEventListener("change", function (event) {
    var filter = event.target.getAttribute("data-filter");
    if (filter) {
      state.filters[filter] = event.target.value;
      render();
      return;
    }
    var signal = event.target.getAttribute("data-signal");
    if (signal) {
      state.feedback[signal] = event.target.checked;
      render();
      return;
    }
    var source = event.target.getAttribute("data-click-source");
    if (source) {
      state.feedback.clickSource = source;
      render();
    }
  });

  document.body.addEventListener("click", function (event) {
    if (event.target.id === "reset-demo") {
      state.filters = { campus: "all", geography: "all", date: "window", channel: "all" };
      state.feedback = demo.defaultFeedbackOptions();
      state.drawer = null;
      render();
      return;
    }
    if (event.target.id === "close-drawer" || event.target.id === "drawer-root") {
      state.drawer = null;
      render();
      return;
    }
    var campaign = event.target.closest("[data-campaign]");
    if (campaign) {
      state.drawer = campaign.getAttribute("data-campaign");
      render();
      return;
    }
    if (event.target.id === "download-sample") downloadSample(model());
  });

  document.body.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && state.drawer) {
      state.drawer = null;
      render();
    }
    var campaign = event.target.closest && event.target.closest("[data-campaign]");
    if (campaign && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      state.drawer = campaign.getAttribute("data-campaign");
      render();
    }
  });

  function csvCell(value) {
    var text = String(value == null ? "" : value);
    if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function downloadSample(data) {
    var header = ["application_id", "family_id", "status_date", "campus", "state", "school_approved_status", "shared_key"];
    var lines = [header.join(",")];
    data.outcomes.forEach(function (row) {
      lines.push([row.id, row.familyId, row.date, row.campus, row.state, row.status, row.sharedKey || ""].map(csvCell).join(","));
    });
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample-facts-export-FICTIONAL.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  window.addEventListener("hashchange", syncShell);
  render();

  if (new URLSearchParams(location.search).get("selftest") === "1") runSelfTest();

  function fail(message) {
    document.body.dataset.selftest = "fail";
    var node = document.createElement("pre");
    node.id = "selftest-error";
    node.textContent = message;
    document.body.appendChild(node);
    throw new Error(message);
  }

  function runSelfTest() {
    var banner = document.querySelector(".demo-banner").textContent;
    if (banner.indexOf("Demo / Sample data — not actual school results") === -1) fail("banner missing");
    if (document.querySelector('input[type="file"]')) fail("file input present");
    if (document.querySelector('[data-metric="leads"]').textContent !== "43") fail("lead count");
    if (document.querySelector('[data-metric="enrolled"]').textContent !== "16") fail("enrolled count");
    document.getElementById("date").value = "oct";
    document.getElementById("date").dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("campus").value = "Maple Ridge";
    document.getElementById("campus").dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("channel").value = "Google Ads";
    document.getElementById("channel").dispatchEvent(new Event("change", { bubbles: true }));
    if (document.querySelector('[data-metric="leads"]').textContent !== "5") fail("filtered leads");
    if (document.querySelector('[data-metric="cpe"]').textContent !== "$2,550") fail("filtered cost");
    if (document.getElementById("dashboard").textContent.indexOf("NaN") !== -1) fail("nan");
    if (document.querySelectorAll(".chart").length !== 4) fail("chart count");
    if (document.querySelector("[data-chart-leads]").textContent !== "5") fail("funnel does not match leads");
    var feedback = document.getElementById("feedback");
    if (feedback.textContent.indexOf("Not sent") === -1 && feedback.textContent.indexOf("not sent") === -1) fail("sent claim");
    if (document.querySelector("details.tech").open) fail("technical details should start closed");
    if (feedback.textContent.indexOf("sample-gclid-1003") === -1) fail("missing earliest click");
    if (feedback.textContent.indexOf("Child name") === -1) fail("withheld list");
    var enrollmentBox = document.querySelector('[data-signal="enrollment"]');
    enrollmentBox.checked = false;
    enrollmentBox.dispatchEvent(new Event("change", { bubbles: true }));
    if (document.getElementById("feedback").textContent.indexOf("Eligible for sync") === -1) fail("application signals should remain");
    if (document.getElementById("records").textContent.indexOf("APP-5003") === -1) fail("facts row");
    var row = document.querySelector("[data-campaign='g-maple']");
    if (!row) fail("campaign row");
    row.click();
    if (!document.getElementById("drawer-title")) fail("drawer");
    document.getElementById("close-drawer").click();
    location.hash = "#school-demo";
    syncShell();
    if (!document.body.classList.contains("school-demo")) fail("school shell");
    if (document.getElementById("session-note").hidden) fail("session note");
    if (document.querySelector('input[type="password"]')) fail("password");
    document.getElementById("campus-switch").value = "Online";
    document.getElementById("campus-switch").dispatchEvent(new Event("change", { bubbles: true }));
    if (!document.body.classList.contains("school-demo")) fail("shell dropped");
    if (document.querySelector("[data-metric=leads]").textContent !== document.querySelector("[data-chart-leads]").textContent) fail("shell numbers diverged");
    if (document.querySelector("[data-queue=high]") == null) fail("queue");
    document.body.dataset.selftest = "pass";
  }
})();
