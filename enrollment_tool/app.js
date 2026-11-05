(function () {
  var demo = window.EnrollmentDemo;
  var state = {
    filters: { campus: "all", geography: "all", date: "window", channel: "all", campaign: "all" },
    feedback: demo.defaultFeedbackOptions(),
    drawer: null,
    view: "overview",
    lens: null,
    timelineDay: null,
    queue: null
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
        ["online-outside", "Online · other states"]
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

  function metric(name, label, value, lens) {
    var pressed = lens && state.lens === lens ? ' aria-pressed="true"' : "";
    if (!lens) {
      return '<div class="metric"><span>' + esc(label) + '</span><strong data-metric="' + name + '">' + esc(value) + "</strong></div>";
    }
    return '<button type="button" class="metric" data-lens="' + lens + '"' + pressed + '><span>' + esc(label) + '</span><strong data-metric="' + name + '">' + esc(value) + "</strong></button>";
  }

  function renderDashboard(data) {
    var rows = data.campaigns.slice().sort(function (a, b) { return b.enrolled - a.enrolled || b.leads - a.leads; });
    var costNote = data.spendUnallocated
      ? "Online spend is not split by state, so cost per enrollment is hidden for this geography."
      : "Cost per enrollment is ad spend divided by enrollments tied to a paid campaign. Organic and offline enrollments stay in the enrolled count and out of that cost. Spend is monthly and is included when that month overlaps these dates.";
    var table = rows.length
      ? '<div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Source</th><th>Campus</th><th class="num">Spend</th><th class="num">Leads</th><th class="num">Applications</th><th class="num">Enrolled</th><th class="num">Cost / enrolled</th></tr></thead><tbody>' +
        rows.map(function (row) {
          return '<tr tabindex="0" data-campaign="' + esc(row.campaign.id) + '"><td>' + esc(row.campaign.name) + "</td><td>" + sourceMark(row.campaign.channel) +
            "</td><td>" + esc(row.campaign.campus) + '</td><td class="num">' + esc(money(row.spend)) + '</td><td class="num">' + row.leads +
            '</td><td class="num">' + row.applications + '</td><td class="num">' + row.enrolled + '</td><td class="num">' + esc(money(row.costPerEnrollment)) + "</td></tr>";
        }).join("") + "</tbody></table></div>"
      : '<p class="fine">No paid campaigns in this filter. Organic and offline inquiries are still in the counts above.</p>';
    document.getElementById("dashboard").innerHTML =
      '<div class="metrics" id="summary" aria-live="polite">' +
      metric("leads", "Tracked leads", String(data.funnel.leads), "leads") +
      metric("applications", "Applications", String(data.funnel.applications), "applications") +
      metric("enrolled", "Enrolled", String(data.funnel.enrolled), "enrolled") +
      metric("cpe", "Cost / enrolled", money(data.costPerEnrollment)) +
      '</div><p class="fine" id="date-basis">As of Oct 31, 2026. ' + esc(data.range.label) + ". Leads count on the inquiry date. Applications and enrollments count on the school status date, so an earlier inquiry is not a new enrollment in this window. This is not a conversion rate.</p><p class=\"fine\">" + esc(costNote) + "</p>" +
      channelStrip(data) + charts(data) +
      '<h3 class="table-title">Campaigns</h3>' + table;
    renderData(data);
    renderLeads(data);
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
        bar("Inquiry", leads, funnelMax, "Tracked leads in this filter: " + leads + ". Click to see those leads.", "data-chart-leads", false, 'data-lens="leads"') +
        bar("Application", applications, funnelMax, "School-confirmed applications in this filter: " + applications + ". Click to see those leads.", "", false, 'data-lens="applications"') +
        bar("Enrolled", enrolled, funnelMax, "School-confirmed enrollments in this filter: " + enrolled + ". Click to see those leads.", "", false, 'data-lens="enrolled"') +
        "</div>";
    var enrolledMax = rowsMax(data.campaigns, "enrolled");
    var enrollChart = enrolledMax === 0
      ? '<p class="empty">No enrollments in this filter.</p>'
      : '<div class="bars" role="group" aria-label="Enrollments by campaign">' +
        data.campaigns.map(function (row) {
          return bar(row.campaign.name, row.enrolled, enrolledMax, row.campaign.name + ": " + row.enrolled + " school-confirmed enrollments in this filter. Click to see those leads.", "", false, 'data-campaign="' + esc(row.campaign.id) + '"');
        }).join("") + "</div>";
    return '<div class="charts">' +
      figure("From inquiry to enrollment", "Leads use the inquiry date. Applications and enrollments use the school status date. Accepted is on the lead, not its own bar.", funnel, "chart-funnel") +
      figure("Enrollments by campaign", "School-confirmed enrollments in this filter. Same rows as the table.", enrollChart, "chart-enroll") +
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

  function bar(label, value, max, tip, valueAttr, asMoney, rowAttr) {
    var shown = asMoney ? money(value) : String(value);
    return '<div class="hbar" tabindex="0"' + (rowAttr ? " " + rowAttr : "") + '><span class="hbar-label">' + esc(label) + '</span><span class="hbar-track"><span class="hbar-fill" style="width:' +
      pct(value, max) + '%"></span></span><span class="hbar-value"' + (valueAttr ? " " + valueAttr : "") + ">" + esc(shown) +
      '</span><span class="tip" role="tooltip">' + esc(tip) + "</span></div>";
  }

  function sourceMark(channel) {
    var name = channel || "Unknown";
    var kind = "unknown";
    if (name === "Google Ads") kind = "google";
    else if (name === "Meta Ads") kind = "meta";
    else if (name === "Organic") kind = "organic";
    else if (name === "Offline / referral") kind = "offline";
    else if (name !== "Unknown") kind = "neutral";
    return '<span class="source source-' + kind + '">' + sourceIcon(kind) + '<span>' + esc(name) + "</span></span>";
  }

  function sourceIcon(kind) {
    if (kind === "google") {
      return '<svg class="logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z"/><path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.1-1.7.4-2.4V6.5H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.5l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z"/></svg>';
    }
    if (kind === "meta") {
      return '<svg class="logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#0064E0" d="M7.2 5.4c1.5 0 2.9 1.1 4.2 2.9.8 1.2 1.5 2.6 1.9 3.8.4-1.2.9-2.6 1.6-3.8 1.2-1.8 2.6-2.9 4-2.9 2.2 0 3.9 2 3.9 5.8 0 3.9-2 6.9-4.3 6.9-1.5 0-2.8-1-4.1-2.8-.7-1.1-1.3-2.4-1.8-3.6-.4 1.2-1 2.5-1.8 3.6-1.3 1.8-2.6 2.8-4.1 2.8C3.2 18.1 1 15.1 1 11.2 1 7.4 3.1 5.4 5.3 5.4h1.9z"/></svg>';
    }
    if (kind === "organic") {
      return '<svg class="logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" fill="none" stroke="#142033" stroke-width="1.8"/><path d="M4 12h16M12 4c2.4 2.2 3.6 5 3.6 8s-1.2 5.8-3.6 8c-2.4-2.2-3.6-5-3.6-8s1.2-5.8 3.6-8z" fill="none" stroke="#142033" stroke-width="1.4"/></svg>';
    }
    if (kind === "offline") {
      return '<svg class="logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="8" cy="9" r="2.2" fill="#142033"/><circle cx="16" cy="9" r="2.2" fill="#5c6b7a"/><path d="M3.5 18c.6-2.4 2.4-3.6 4.5-3.6s3.9 1.2 4.5 3.6M12 18c.5-2 2-3.2 4-3.2 1.8 0 3.2 1 3.8 2.8" fill="none" stroke="#142033" stroke-width="1.6" stroke-linecap="round"/></svg>';
    }
    return '<svg class="logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" fill="none" stroke="#5c6b7a" stroke-width="1.8"/><path d="M9.5 9.2a2.5 2.5 0 1 1 3.2 2.4c-.8.3-1.2.8-1.2 1.6V14" fill="none" stroke="#5c6b7a" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.6" r="0.8" fill="#5c6b7a"/></svg>';
  }

  function leadOutcomes(lead) {
    return demo.outcomesForKey(lead.sharedKey).slice().sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
  }

  function leadQuality(lead) {
    var rows = leadOutcomes(lead);
    if (!rows.length) return "Unknown";
    if (rows.some(function (row) { return row.milestones.qualified === true; })) return "Qualified";
    return "Unqualified";
  }

  function leadLifecycle(lead) {
    var rows = leadOutcomes(lead);
    if (!rows.length) return "Inquiry";
    var last = rows[rows.length - 1];
    if (last.status === "Enrolled" || last.milestones.enrolled) return "Enrolled";
    if (last.status === "Accepted") return "Accepted";
    if (last.milestones.application) return "Application";
    return "Inquiry";
  }

  function contactMethod(lead) {
    if (lead.type === "Call") return "Call";
    if (lead.type === "Form") return "Form";
    return lead.type || "Unknown";
  }

  function channelStrip(data) {
    var rows = data.byChannel.filter(function (row) { return row.leads || row.applications || row.enrolled; });
    if (!rows.length) return '<p class="empty">No sources in this filter.</p>';
    return '<div class="channel-strip" role="group" aria-label="Leads by marketing source">' + rows.map(function (row) {
      var pressed = state.filters.channel === row.channel ? ' aria-pressed="true"' : ' aria-pressed="false"';
      return '<button type="button" class="source-btn" data-set-channel="' + esc(row.channel) + '"' + pressed + '>' +
        sourceMark(row.channel) + '<span class="source-count">' + row.leads + " leads</span></button>";
    }).join("") + "</div>";
  }

  function sortLeads(rows) {
    return rows.slice().sort(function (a, b) {
      if (a.date === b.date) return a.id < b.id ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });
  }

  function queueMatch(lead, queue) {
    var label = demo.leadMatchLabel(lead);
    if (queue === "high") return label === "Matched to school status";
    if (queue === "review") return label === "No school status yet" || label === "Duplicate lead, same shared key";
    if (queue === "missing") return !lead.sharedKey;
    return true;
  }

  function leadPool(data) {
    if (state.lens !== "applications" && state.lens !== "enrolled") {
      return { leads: data.leads.slice(), orphans: [], outcomeCount: data.leads.length, basis: "inquiry" };
    }
    var milestone = state.lens === "enrolled" ? "enrolled" : "application";
    var seen = {};
    var leads = [];
    var orphans = [];
    var outcomeCount = 0;
    data.outcomes.forEach(function (row) {
      if (!row.milestones[milestone]) return;
      outcomeCount += 1;
      var lead = demo.attributedLead(row);
      if (!lead) {
        orphans.push(row);
        return;
      }
      if (!seen[lead.id]) {
        seen[lead.id] = true;
        leads.push(lead);
      }
    });
    return { leads: leads, orphans: orphans, outcomeCount: outcomeCount, basis: "outcome" };
  }

  function listedLeads(data) {
    return leadPool(data).leads.filter(function (lead) {
      return !state.queue || queueMatch(lead, state.queue);
    });
  }

  function visibleLeads(data) {
    return sortLeads(listedLeads(data).filter(function (lead) {
      return !state.timelineDay || lead.date === state.timelineDay;
    }));
  }

  function renderLeads(data) {
    var host = document.getElementById("timeline-body");
    if (!host) return;
    var pool = leadPool(data);
    var listed = listedLeads(data);
    var days = {};
    listed.forEach(function (lead) {
      if (!days[lead.date]) days[lead.date] = { total: 0, qualified: 0 };
      days[lead.date].total += 1;
      if (leadQuality(lead) === "Qualified") days[lead.date].qualified += 1;
    });
    var dayKeys = Object.keys(days).sort();
    var max = dayKeys.reduce(function (m, key) { return Math.max(m, days[key].total); }, 0);
    var qualified = listed.filter(function (lead) { return leadQuality(lead) === "Qualified"; }).length;
    var unqualified = listed.filter(function (lead) { return leadQuality(lead) === "Unqualified"; }).length;
    var unknown = listed.filter(function (lead) { return leadQuality(lead) === "Unknown"; }).length;
    var shown = visibleLeads(data);
    var grouped = {};
    shown.forEach(function (lead) {
      if (!grouped[lead.date]) grouped[lead.date] = [];
      grouped[lead.date].push(lead);
    });
    var orphans = state.timelineDay || (state.queue && state.queue !== "missing") ? [] : pool.orphans;
    var lensNote = pool.basis === "outcome"
      ? pool.outcomeCount + " school rows use the status date in this filter. " + pool.leads.length + " tracked inquiries sit behind them. " + pool.orphans.length + " have no tracked inquiry. Arrival day can be earlier than the status date. This is not a conversion rate."
      : "Inquiries that arrived in this filter. Quality is separate from inquiry, application, accepted, and enrolled. Applications and enrollments on Overview use the school status date.";
    var dateOrder = Object.keys(grouped).sort(function (a, b) { return a < b ? 1 : -1; });
    host.innerHTML =
      '<p class="fine">' + listed.length + " leads · " + qualified + " qualified · " + unqualified + " unqualified · " + unknown + " unknown. " + esc(lensNote) + "</p>" +
      '<div class="table-wrap"><table class="lead-table"><thead><tr><th>Source</th><th>Name</th><th>Phone</th><th>Method</th><th>Campus</th><th>Campaign</th><th>Quality</th><th>Status</th></tr></thead><tbody>' +
      (dateOrder.length ? dateOrder.map(function (day) {
        return '<tr class="date-head"><th colspan="8">' + esc(prettyDate(day)) + " · " + grouped[day].length + " " + (grouped[day].length === 1 ? "lead" : "leads") + "</th></tr>" +
          grouped[day].map(function (lead) {
            var campaign = demo.campaignById(lead.campaignId);
            var campus = lead.mode === "online" ? "Online" + (lead.state ? " · " + lead.state : "") : lead.campus;
            return '<tr data-lead="' + esc(lead.id) + '"><td>' + sourceMark(lead.channel) + '</td><td>' + esc(lead.guardian) + '<span class="lead-id">' + esc(lead.id) + "</span></td><td>" +
              esc(lead.phone) + "</td><td>" + esc(contactMethod(lead)) + "</td><td>" + esc(campus) + "</td><td>" +
              esc(campaign ? campaign.name : "—") + '</td><td><span class="quality ' + leadQuality(lead).toLowerCase() + '">' + esc(leadQuality(lead)) + "</span></td><td>" +
              esc(leadLifecycle(lead)) + "</td></tr>";
          }).join("");
      }).join("") : '<tr><td colspan="8">No leads in this filter.</td></tr>') +
      "</tbody></table></div>" +
      (orphans.length ? '<section class="day-block"><h3>No tracked inquiry</h3>' + orphans.map(function (row) {
        var quality = row.milestones.qualified ? "Qualified" : "Unqualified";
        var life = row.milestones.enrolled ? "Enrolled" : row.status === "Accepted" ? "Accepted" : row.milestones.application ? "Application" : row.status;
        return '<button type="button" class="lead-row" data-outcome="' + esc(row.id) + '">' +
          sourceMark("No tracked inquiry") +
          '<span class="lead-meta">' + esc(row.id) + " · status date " + esc(prettyDate(row.date)) + "</span>" +
          '<span class="quality ' + quality.toLowerCase() + '">' + esc(quality) + "</span>" +
          '<span class="lifecycle">' + esc(life) + "</span></button>";
      }).join("") + "</section>" : "");
  }

  function renderData(data) {
    var host = document.getElementById("data-body");
    if (!host) return;
    var base = leadPool(data).leads;
    var high = base.filter(function (lead) { return queueMatch(lead, "high"); }).length;
    var review = base.filter(function (lead) { return queueMatch(lead, "review"); }).length;
    var missing = base.filter(function (lead) { return queueMatch(lead, "missing"); }).length;
    function queueButton(key, label, count) {
      var pressed = state.queue === key ? ' aria-pressed="true"' : ' aria-pressed="false"';
      return '<li><button type="button" data-queue-filter="' + key + '"' + pressed + '><span>' + label + '</span><strong data-queue="' + key + '">' + count + "</strong></button></li>";
    }
    host.innerHTML =
      '<section><h2>Match review</h2><p class="fine">High confidence means a shared key joins the inquiry to a school row. Needs review means the key is waiting on a school status, or the lead is a duplicate. Missing data means the shared key is absent. Counts are lead rows in the current filters.</p><ul class="queue-list">' +
      queueButton("high", "High confidence", high) +
      queueButton("review", "Needs review", review) +
      queueButton("missing", "Missing data", missing) +
      "</ul></section>" +
      '<section class="sync-health"><h2>Sync health</h2><p class="fine">Not connected. No sync has run. CSV and manual entry stay available. An automatic school-platform link is planned and waits on verified API access. <a href="#future-sync">Scope</a>.</p></section>' +
      '<section id="records"><h2>Files</h2><p class="fine">' + data.factsWithoutLead.length + " school rows in this filter have no tracked inquiry. Source stays separate from call, form, or chat.</p>" +
      '<p><button class="primary" id="download-sample" type="button">Download CSV</button></p>' +
      leadTable(data) +
      '<h3>School rows in this filter</h3><div class="table-wrap"><table><thead><tr><th>Application</th><th>Status date</th><th>Status</th><th>Campus</th></tr></thead><tbody>' +
      (data.outcomes.map(function (row) {
        return "<tr><td>" + esc(row.id) + "</td><td>" + esc(prettyDate(row.date)) + "</td><td>" + esc(row.status) + "</td><td>" + esc(row.mode === "online" ? "Online · " + row.state : row.campus) + "</td></tr>";
      }).join("") || '<tr><td colspan="4">None in this filter.</td></tr>') +
      "</tbody></table></div></section>";
  }

  function leadTable(data) {
    var inquiries = visibleLeads(data).map(function (lead) {
      var campaign = demo.campaignById(lead.campaignId);
      return '<tr><td><button type="button" class="text" data-lead="' + esc(lead.id) + '">' + esc(lead.guardian) + "</button><div class=\"fine\">" + esc(lead.id) + "</div></td><td>" +
        esc(lead.phone) + "</td><td>" + esc(lead.email) + "</td><td>" + esc(prettyDate(lead.date)) + "</td><td>" + esc(contactMethod(lead)) +
        "</td><td>" + sourceMark(lead.channel) + "</td><td>" + esc(campaign ? campaign.name : "—") + "</td><td>" + esc(leadQuality(lead)) +
        "</td><td>" + esc(leadLifecycle(lead)) + "</td></tr>";
    }).join("");
    return '<div class="table-wrap"><table><thead><tr><th>Guardian</th><th>Phone</th><th>Email</th><th>Arrived</th><th>Method</th><th>Source</th><th>Campaign</th><th>Quality</th><th>Lifecycle</th></tr></thead><tbody>' +
      (inquiries || '<tr><td colspan="9">None in this filter.</td></tr>') + "</tbody></table></div>";
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
      ["ready", "Ready", distinct(records, "eligible"), "School confirmed the outcome, and the inquiry came from Google.", "Review"],
      ["wait", "Waiting", distinct(records, "pending"), "The inquiry is tracked. The school has not confirmed an outcome yet.", "Wait for the school file."],
      ["stop", "Needs a match", distinct(records, "unmatched"), "The inquiry and the school result are not tied together, or the ad click is missing.", "Leave unmatched."]
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
    var title = "Detail";
    var note = "";
    var lines = [];
    if (state.drawer.kind === "lead") {
      var lead = null;
      demo.inquiries.forEach(function (row) { if (row.id === state.drawer.id) lead = row; });
      if (lead) {
        var campaign = demo.campaignById(lead.campaignId);
        var match = demo.leadMatchLabel(lead);
        title = lead.guardian;
        note = "Inquiry date only. This record has no clock time. The student name and grade stay in this detail.";
        lines.push("Record " + lead.id);
        lines.push("Phone " + lead.phone);
        lines.push("Email " + lead.email);
        lines.push("Arrived " + prettyDate(lead.date));
        lines.push("Contact method " + contactMethod(lead));
        lines.push("Student " + lead.student + ", grade " + lead.grade);
        lines.push("Marketing source " + (lead.channel || "Unknown"));
        lines.push("Campaign " + (campaign ? campaign.name : "None"));
        lines.push("Campus " + (lead.mode === "online" ? "Online · " + (lead.state || "—") : lead.campus));
        lines.push("Quality " + leadQuality(lead) + ". Separate from inquiry, application, accepted, and enrolled.");
        lines.push("Lifecycle " + leadLifecycle(lead));
        lines.push("Match " + match + ". No numeric score is stored.");
        lines.push("Provenance " + lead.tracker + " lead.");
        if (lead.clickId) lines.push("Click id " + lead.clickId);
        else if (lead.metaClickId) lines.push("Click id " + lead.metaClickId);
        else if (lead.channel === "Google Ads" || lead.channel === "Meta Ads") lines.push("No click id on this lead");
        leadOutcomes(lead).forEach(function (row) {
          lines.push(row.status + " on " + prettyDate(row.date) + ". FACTS export.");
        });
        if (!leadOutcomes(lead).length) lines.push("No school status on file");
      }
    }
    if (state.drawer.kind === "outcome") {
      var outcome = null;
      demo.outcomes.forEach(function (row) { if (row.id === state.drawer.id) outcome = row; });
      if (outcome) {
        title = outcome.id;
        note = "School row with no tracked inquiry. Status date only. No clock time.";
        lines.push("Status " + outcome.status);
        lines.push("Status date " + prettyDate(outcome.date));
        lines.push("Campus " + (outcome.mode === "online" ? "Online · " + outcome.state : outcome.campus));
        lines.push("Quality " + (outcome.milestones.qualified ? "Qualified" : "Unqualified"));
        lines.push("Provenance " + outcome.sourceSystem + ".");
        lines.push("Match missing. Nothing was guessed.");
      }
    }
    root.hidden = false;
    root.className = "drawer-root";
    root.innerHTML = '<div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><button class="text" id="close-drawer" type="button">Close</button><h2 id="drawer-title">' +
      esc(title) + '</h2><p class="fine">' + esc(note) + "</p><ul>" +
      (lines.length ? lines.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") : "<li>None in this filter.</li>") + "</ul></div>";
    var close = document.getElementById("close-drawer");
    if (close) close.focus();
  }

  function renderHero() {
    if (window.__heroVideoBoot) return;
    window.__heroVideoBoot = true;
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = function () {
      if (!window.YT || !document.getElementById("hero-video")) return;
      new window.YT.Player("hero-video", {
        events: {
          onReady: function (event) {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: function (event) {
            if (event.data === 1) {
              var media = document.querySelector(".hero-media");
              if (media) media.classList.add("is-playing");
            }
          }
        }
      });
    };
  }

  function render() {
    var activeId = document.activeElement && document.activeElement.id;
    var data = model();
    renderHero();
    renderFilters();
    renderActiveFilters();
    renderDashboard(data);
    renderFeedback(data);
    renderDrawer(data);
    if (activeId && activeId !== "close-drawer") {
      var next = document.getElementById(activeId);
      if (next) next.focus();
    }
    document.body.dataset.ready = "true";
    applyHash();
  }

  function renderActiveFilters() {
    var host = document.getElementById("active-filters");
    if (!host) return;
    var geoLabels = {
      "in-person": "In-person campuses",
      "online-eligible": "Online · eligible states",
      "online-CA": "Online · California",
      "online-AZ": "Online · Arizona",
      "online-TX": "Online · Texas",
      "online-NV": "Online · Nevada",
      "online-outside": "Online · other states"
    };
    var chips = [];
    function add(key, label) {
      chips.push('<button type="button" class="chip" data-clear="' + key + '">' + esc(label) + "</button>");
    }
    if (state.filters.campus !== "all") add("campus", "Campus · " + state.filters.campus);
    if (state.filters.geography !== "all") add("geography", "Geography · " + (geoLabels[state.filters.geography] || state.filters.geography));
    if (state.filters.date !== "window") add("date", demo.DATE_RANGES[state.filters.date].short);
    if (state.filters.channel !== "all") add("channel", "Source · " + state.filters.channel);
    if (state.filters.campaign !== "all") {
      var campaign = demo.campaignById(state.filters.campaign);
      add("campaign", "Campaign · " + (campaign ? campaign.name : state.filters.campaign));
    }
    if (state.lens === "applications") add("lens", "Lead list · applications in this window");
    if (state.lens === "enrolled") add("lens", "Lead list · enrollments in this window");
    if (state.timelineDay) add("day", "Arrival · " + prettyDate(state.timelineDay));
    if (state.queue === "high") add("queue", "Match · high confidence");
    if (state.queue === "review") add("queue", "Match · needs review");
    if (state.queue === "missing") add("queue", "Match · missing key");
    var local = state.lens || state.timelineDay || state.queue;
    host.innerHTML = (chips.length ? '<div class="chips">' + chips.join("") + "</div>" : "") +
      (local ? '<p class="fine">Overview totals follow campus, geography, date, source, and campaign. Leads and Data also follow the other chips.</p>' : "");
  }

  function applyHash() {
    var views = {
      "#school-demo": "overview",
      "#preview": "overview",
      "#demo": "overview",
      "#leads": "leads",
      "#timeline": "leads",
      "#data": "data",
      "#match-review": "data",
      "#feedback": "data",
      "#pilot": "overview"
    };
    if (views[location.hash]) state.view = views[location.hash];
    ["overview", "leads", "data"].forEach(function (name) {
      var panel = document.querySelector('[data-view-panel="' + name + '"]');
      if (panel) panel.hidden = state.view !== name;
    });
    var nav = document.querySelectorAll(".product-nav a");
    for (var i = 0; i < nav.length; i++) {
      var href = nav[i].getAttribute("href");
      var current = (state.view === "overview" && href === "#school-demo") || (state.view === "leads" && href === "#leads") || (state.view === "data" && href === "#data");
      if (current) nav[i].setAttribute("aria-current", "page");
      else nav[i].removeAttribute("aria-current");
    }
  }

  document.body.addEventListener("change", function (event) {
    var filter = event.target.getAttribute("data-filter");
    if (filter) {
      state.filters[filter] = event.target.value;
      state.lens = null;
      state.timelineDay = null;
      state.queue = null;
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
    if (event.target.id === "reset-demo" || event.target.id === "reset-demo-school") {
      state.filters = { campus: "all", geography: "all", date: "window", channel: "all", campaign: "all" };
      state.feedback = demo.defaultFeedbackOptions();
      state.drawer = null;
      state.lens = null;
      state.timelineDay = null;
      state.queue = null;
      render();
      return;
    }
    var clear = event.target.closest("[data-clear]");
    if (clear) {
      var key = clear.getAttribute("data-clear");
      if (key === "lens") state.lens = null;
      else if (key === "day") state.timelineDay = null;
      else if (key === "queue") state.queue = null;
      else state.filters[key] = key === "date" ? "window" : "all";
      render();
      return;
    }
    var queueButton = event.target.closest("[data-queue-filter]");
    if (queueButton) {
      var nextQueue = queueButton.getAttribute("data-queue-filter");
      state.queue = state.queue === nextQueue ? null : nextQueue;
      state.view = "data";
      if (location.hash !== "#data") location.hash = "#data";
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
      state.filters.campaign = campaign.getAttribute("data-campaign");
      state.lens = null;
      state.timelineDay = null;
      state.queue = null;
      state.view = "leads";
      state.drawer = null;
      if (location.hash !== "#leads") location.hash = "#leads";
      render();
      return;
    }
    var leadButton = event.target.closest("[data-lead]");
    if (leadButton) {
      state.drawer = { kind: "lead", id: leadButton.getAttribute("data-lead") };
      render();
      return;
    }
    var outcomeButton = event.target.closest("[data-outcome]");
    if (outcomeButton) {
      state.drawer = { kind: "outcome", id: outcomeButton.getAttribute("data-outcome") };
      render();
      return;
    }
    var lens = event.target.closest("[data-lens]");
    if (lens) {
      var nextLens = lens.getAttribute("data-lens");
      state.lens = nextLens === "leads" ? null : nextLens;
      state.timelineDay = null;
      state.view = "leads";
      if (location.hash !== "#leads") location.hash = "#leads";
      render();
      return;
    }
    var sourceButton = event.target.closest("[data-set-channel]");
    if (sourceButton) {
      var nextChannel = sourceButton.getAttribute("data-set-channel");
      state.filters.channel = state.filters.channel === nextChannel ? "all" : nextChannel;
      state.lens = null;
      state.timelineDay = null;
      state.queue = null;
      state.view = "leads";
      if (location.hash !== "#leads") location.hash = "#leads";
      render();
      return;
    }
    var dayButton = event.target.closest("[data-day]");
    if (dayButton) {
      var day = dayButton.getAttribute("data-day");
      state.timelineDay = state.timelineDay === day ? null : day;
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
      state.filters.campaign = campaign.getAttribute("data-campaign");
      state.lens = null;
      state.timelineDay = null;
      state.queue = null;
      state.view = "leads";
      state.drawer = null;
      if (location.hash !== "#leads") location.hash = "#leads";
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
    link.download = "school-outcomes.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  window.addEventListener("hashchange", applyHash);
  render();
  setupNav();
  setupDialogs();
  setupStack();
  setupTilt();

  function setupNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.getElementById("site-nav");
    if (!header || !toggle || !panel) return;
    var mq = window.matchMedia("(max-width: 860px)");
    function setOpen(open) {
      var mobile = mq.matches;
      var shown = mobile ? open : true;
      header.classList.toggle("is-open", mobile && open);
      toggle.setAttribute("aria-expanded", mobile && open ? "true" : "false");
      toggle.setAttribute("aria-label", mobile && open ? "Close menu" : "Open menu");
      panel.setAttribute("aria-hidden", shown ? "false" : "true");
      panel.inert = !shown;
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
    if (mq.addEventListener) mq.addEventListener("change", function () { setOpen(false); });
    setOpen(false);
  }

  function setupDialogs() {
    function closeMobileNav() {
      var header = document.querySelector(".site-header");
      var toggle = document.querySelector(".nav-toggle");
      var panel = document.getElementById("site-nav");
      if (header) header.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
      if (panel && window.matchMedia("(max-width: 860px)").matches) {
        panel.setAttribute("aria-hidden", "true");
        panel.inert = true;
      }
    }
    function openDialog(dialog) {
      if (!dialog || typeof dialog.showModal !== "function" || dialog.open) return;
      closeMobileNav();
      dialog.showModal();
    }
    document.addEventListener("click", function (event) {
      var opener = event.target.closest("[data-open-dialog]");
      if (!opener) return;
      event.preventDefault();
      openDialog(document.getElementById(opener.getAttribute("data-open-dialog")));
    });
    document.querySelectorAll("dialog.sheet").forEach(function (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) dialog.close();
      });
      var closer = dialog.querySelector("[data-close-dialog]");
      if (closer) closer.addEventListener("click", function () { dialog.close(); });
    });
    var scopeHashes = { "#scope": "", "#future-sync": "#future-sync", "#manual": "#manual" };
    function openScope(hash) {
      var dialog = document.getElementById("scope-dialog");
      openDialog(dialog);
      if (!dialog) return;
      var sel = scopeHashes[hash];
      var target = sel ? dialog.querySelector(sel) : null;
      var scroller = dialog.querySelector(".sheet-body");
      if (target && scroller) scroller.scrollTop = target.offsetTop - 8;
      else if (scroller) scroller.scrollTop = 0;
    }
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href='#scope'], a[href='#future-sync'], a[href='#manual']");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!scopeHashes.hasOwnProperty(href)) return;
      event.preventDefault();
      if (location.hash !== href) location.hash = href;
      openScope(href);
    });
    window.addEventListener("hashchange", function () {
      if (scopeHashes.hasOwnProperty(location.hash)) openScope(location.hash);
    });
    if (scopeHashes.hasOwnProperty(location.hash)) openScope(location.hash);
    var form = document.querySelector('form[name="fullstory-demo"]');
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var thanks = document.getElementById("demo-thanks");
      var error = document.getElementById("demo-error");
      if (error) error.hidden = true;
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error("status");
        form.hidden = true;
        if (thanks) thanks.hidden = false;
      }).catch(function () {
        if (error) error.hidden = false;
      });
    });
  }

  function setupStack() {
    var root = document.getElementById("stack");
    if (!root) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var narrow = window.matchMedia("(max-width: 800px)");
    var plates = root.querySelectorAll(".plate");
    var callouts = root.querySelectorAll(".callout");
    var ticking = false;
    function paint(spread, active) {
      root.style.setProperty("--spread", String(spread));
      plates.forEach(function (plate, index) {
        var on = index === active && spread > 0.45;
        plate.classList.toggle("is-on", on);
        plate.classList.toggle("is-dim", !on && spread > 0.45);
      });
      callouts.forEach(function (card, index) {
        card.classList.toggle("is-on", index === active && spread > 0.55);
      });
      connectLeader();
    }
    function connectLeader() {
      var svg = root.querySelector(".leader-svg");
      if (!svg) return;
      var line = svg.querySelector("line");
      var plate = root.querySelector(".plate.is-on");
      var card = root.querySelector(".callout.is-on .callout-card");
      if (!plate || !card || root.classList.contains("is-static")) {
        svg.style.opacity = "0";
        return;
      }
      var box = svg.getBoundingClientRect();
      var plateBox = plate.getBoundingClientRect();
      var cardBox = card.getBoundingClientRect();
      var onRight = card.closest(".callout").classList.contains("right");
      var x1 = (onRight ? plateBox.right : plateBox.left) - box.left;
      var y1 = plateBox.top + plateBox.height / 2 - box.top;
      var x2 = (onRight ? cardBox.left : cardBox.right) - box.left;
      var y2 = cardBox.top + Math.min(28, cardBox.height / 2) - box.top;
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      svg.style.opacity = "1";
    }
    function frame() {
      if (reduce.matches || narrow.matches) {
        root.classList.add("is-static");
        root.style.setProperty("--spread", "0.85");
        plates.forEach(function (plate) { plate.classList.remove("is-on", "is-dim"); });
        callouts.forEach(function (card) { card.classList.add("is-on"); });
        connectLeader();
        return;
      }
      root.classList.remove("is-static");
      var rect = root.getBoundingClientRect();
      var total = root.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      var progress = total > 0 ? scrolled / total : 0;
      var spread = progress < 0.1 ? progress / 0.1 : progress > 0.9 ? (1 - progress) / 0.1 : 1;
      var span = Math.min(Math.max((progress - 0.1) / 0.8, 0), 0.999);
      paint(spread, Math.floor(span * 5));
      var started = performance.now();
      function follow(now) {
        connectLeader();
        if (now - started < 460) requestAnimationFrame(follow);
      }
      requestAnimationFrame(follow);
    }
    function requestFrame() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        frame();
      });
    }
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame);
    if (reduce.addEventListener) reduce.addEventListener("change", frame);
    if (narrow.addEventListener) narrow.addEventListener("change", frame);
    frame();
  }

  function setupTilt() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    var cards = document.querySelectorAll(".benefit-grid article, .steps li");
    if (!fine.matches || reduce.matches) return;
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;
        var box = card.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width - 0.5;
        var y = (event.clientY - box.top) / box.height - 0.5;
        var tiltY = Math.max(-4, Math.min(4, x * 8));
        var tiltX = Math.max(-4, Math.min(4, -y * 8));
        card.style.transform = "perspective(800px) rotateX(" + tiltX.toFixed(2) + "deg) rotateY(" + tiltY.toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

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
    if (document.querySelector(".demo-banner")) fail("banner element");
    if (document.body.textContent.indexOf("Demo / Sample data — not actual school results") !== -1) fail("banner copy");
    if (document.body.textContent.indexOf("Demo session — no account required") !== -1) fail("session heading");
    if (document.body.textContent.indexOf("sample for discussion") !== -1) fail("footer line");
    if (!document.querySelector(".hero-copy h1") || document.querySelector(".hero-copy h1").textContent !== "From Ads to Enrollments.") fail("headline");
    if (document.querySelector(".lede").textContent.indexOf("ad to the inquiry") === -1) fail("support line");
    if (document.querySelector("[data-hero-cpe]")) fail("hero cost");
    if (document.querySelector(".hero-copy").textContent.indexOf("$") !== -1) fail("hero dollar");
    if (document.querySelector(".hero-media .seat-board")) fail("seats on video");
    if (document.querySelector(".site-header .wordmark .line") || document.querySelector(".site-foot .wordmark .line")) fail("lockup line");
    if (document.querySelector(".eyebrow").textContent.indexOf("Enrollment intelligence") === -1) fail("eyebrow");
    if (!document.querySelector(".hero-media iframe")) fail("hero video");
    if (!document.querySelector(".seat-row")) fail("empty seats");
    if (!document.querySelector('[data-open-dialog="demo-dialog"]')) fail("cta");
    if (!document.querySelector('form[name="fullstory-demo"][data-netlify="true"]')) fail("demo form");
    if (document.getElementById("sample-info")) fail("sample badge");
    if (document.querySelector("main").textContent.indexOf("Sample data") !== -1) fail("sample label");
    if (document.querySelector("main").textContent.indexOf("Fictional") !== -1) fail("fictional copy");
    if (document.querySelector('input[type="file"]')) fail("file input present");
    if (document.querySelector('[data-metric="leads"]').textContent !== "43") fail("lead count");
    if (document.querySelector('[data-metric="enrolled"]').textContent !== "16") fail("enrolled count");
    if (document.querySelector('[data-metric="cpe"]').textContent !== "$130") fail("workspace cost");
    document.getElementById("date").value = "oct";
    document.getElementById("date").dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("campus").value = "Maple Ridge";
    document.getElementById("campus").dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("channel").value = "Google Ads";
    document.getElementById("channel").dispatchEvent(new Event("change", { bubbles: true }));
    if (document.querySelector('[data-metric="leads"]').textContent !== "5") fail("filtered leads");
    if (document.querySelector('[data-metric="cpe"]').textContent !== "$55") fail("filtered cost");
    if (document.getElementById("dashboard").textContent.indexOf("NaN") !== -1) fail("nan");
    if (document.querySelector(".day-chart")) fail("capsule strip");
    if (document.querySelectorAll(".chart").length !== 2) fail("chart count");
    if (document.querySelector("[data-chart-leads]").textContent !== "5") fail("funnel does not match leads");
    var feedback = document.getElementById("feedback-body");
    if (document.querySelector("details.tech").open) fail("technical details should start closed");
    if (feedback.textContent.indexOf("sample-gclid-1003") === -1) fail("missing earliest click");
    if (feedback.textContent.indexOf("Child name") === -1) fail("withheld list");
    var enrollmentBox = document.querySelector('[data-signal="enrollment"]');
    enrollmentBox.checked = false;
    enrollmentBox.dispatchEvent(new Event("change", { bubbles: true }));
    if (document.getElementById("feedback-body").textContent.indexOf("Eligible for sync") === -1) fail("application signals should remain");
    if (document.getElementById("records").textContent.indexOf("APP-5003") === -1) fail("facts row");
    var row = document.querySelector("[data-campaign='g-maple']");
    if (!row) fail("campaign row");
    row.click();
    if (location.hash !== "#leads") fail("campaign drill");
    if (state.filters.campaign !== "g-maple") fail("campaign filter");
    if (document.getElementById("active-filters").textContent.indexOf("Fall open house") === -1) fail("campaign chip");
    if (document.getElementById("goal") == null) fail("hero removed");
    var lead = document.querySelector("[data-lead]");
    if (!lead) fail("lead row");
    if (lead.querySelector(".source") == null) fail("source logo");
    lead.click();
    if (!document.getElementById("drawer-title")) fail("drawer");
    if (document.querySelector(".drawer").textContent.indexOf("Arrived") === -1) fail("history");
    if (document.querySelector(".drawer").textContent.indexOf("Quality") === -1) fail("quality");
    if (document.querySelector(".drawer").textContent.indexOf("Contact method") === -1) fail("contact method");
    document.getElementById("close-drawer").click();
    location.hash = "#data";
    applyHash();
    if (document.getElementById("data-body").textContent.indexOf("Not connected") === -1) fail("sync health");
    if (document.querySelector('input[type="password"]')) fail("password");
    document.getElementById("reset-demo").click();
    location.hash = "#school-demo";
    applyHash();
    if (document.querySelector("[data-view-panel='overview']").hidden) fail("overview hidden");
    document.getElementById("date").value = "d30";
    document.getElementById("date").dispatchEvent(new Event("change", { bubbles: true }));
    document.querySelector('[data-lens="enrolled"]').click();
    if (location.hash !== "#leads") fail("enrolled drill");
    var feed = document.getElementById("timeline-body").textContent;
    if (feed.indexOf("WC-1003") === -1) fail("earlier inquiry behind enrollment");
    if (feed.indexOf("status date") === -1) fail("status date basis");
    document.getElementById("reset-demo").click();
    location.hash = "#data";
    applyHash();
    document.querySelector("[data-queue-filter='review']").click();
    var records = document.getElementById("records").textContent;
    if (records.indexOf("WC-1042") === -1) fail("review row");
    if (records.indexOf("WC-1001") !== -1) fail("matched row still in review");
    document.getElementById("reset-demo").click();
    location.hash = "#school-demo";
    applyHash();
    document.getElementById("campus").value = "Online";
    document.getElementById("campus").dispatchEvent(new Event("change", { bubbles: true }));
    if (document.getElementById("goal") == null) fail("hero dropped");
    if (document.querySelector("[data-metric=leads]").textContent !== document.querySelector("[data-chart-leads]").textContent) fail("numbers diverged");
    if (document.querySelector("[data-queue=high]") == null) fail("queue");
    document.body.dataset.selftest = "pass";
  }
})();
