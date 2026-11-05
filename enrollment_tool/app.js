(function () {
  var demo = window.EnrollmentDemo;
  var VIEWS = [
    ["overview", "Overview"],
    ["campaigns", "Campaigns"],
    ["inquiries", "WhatConverts"],
    ["facts", "FACTS export"],
    ["match", "Match"],
    ["feedback", "Ad learning"],
    ["how", "How it works"]
  ];

  var state = {
    view: "overview",
    filters: { campus: "all", geography: "all", date: "window", channel: "all" },
    feedback: demo.defaultFeedbackOptions(),
    logFilter: "all",
    sortKey: "spend",
    sortDir: "desc",
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

  function viewFromHash() {
    var hash = location.hash.replace("#", "");
    for (var i = 0; i < VIEWS.length; i++) if (VIEWS[i][0] === hash) return hash;
    return "overview";
  }

  function model() {
    return demo.compute(state.filters, state.feedback);
  }

  function chip(kind, text) {
    return '<span class="chip ' + kind + '">' + esc(text) + "</span>";
  }

  function syncLabel(sync) {
    if (sync === "eligible") return chip("good", "Eligible for sync");
    if (sync === "pending") return chip("wait", "Pending");
    if (sync === "unmatched") return chip("stop", "Unmatched");
    return chip("", "Not in this Google log");
  }

  function renderFilters(data) {
    var campusOptions = [
      ["all", "All campuses"],
      ["Maple Ridge", "Maple Ridge"],
      ["Harbor View", "Harbor View"],
      ["Cedar Falls", "Cedar Falls"],
      ["Online", "Online"]
    ];
    var geoOptions = [
      ["all", "All geographies"],
      ["in-person", "In-person campuses"],
      ["online-eligible", "Online · eligible states (CA, AZ, TX, NV)"],
      ["online-CA", "Online · California"],
      ["online-AZ", "Online · Arizona"],
      ["online-TX", "Online · Texas"],
      ["online-NV", "Online · Nevada"],
      ["online-outside", "Online · outside sample list"]
    ];
    var dateOptions = Object.keys(demo.DATE_RANGES).map(function (key) {
      return [key, demo.DATE_RANGES[key].short || demo.DATE_RANGES[key].label];
    });
    var channelOptions = [
      ["all", "All channels"],
      ["Google Ads", "Google Ads"],
      ["Meta Ads", "Meta Ads"],
      ["Organic", "Organic"],
      ["Offline / referral", "Offline / referral"],
      ["No tracked inquiry", "No tracked inquiry"]
    ];
    function select(id, label, value, options) {
      return '<label class="filter-field"><span>' + label + '</span><select id="' + id + '" data-filter="' + id + '">' +
        options.map(function (option) {
          return '<option value="' + esc(option[0]) + '"' + (option[0] === value ? " selected" : "") + ">" + esc(option[1]) + "</option>";
        }).join("") +
        "</select></label>";
    }
    document.getElementById("filters").innerHTML =
      '<form class="filters" id="filter-form">' +
      select("campus", "Campus", state.filters.campus, campusOptions) +
      select("geography", "Online geography", state.filters.geography, geoOptions) +
      select("date", "Date", state.filters.date, dateOptions) +
      select("channel", "Channel", state.filters.channel, channelOptions) +
      '<p class="summary" id="summary" aria-live="polite"><span><strong>' + data.funnel.leads + "</strong> tracked leads · <strong>" +
      data.funnel.applications + "</strong> applications · <strong>" + data.funnel.enrolled +
      '</strong> enrolled</span><span>' + esc(data.range.label) + "</span></p></form>";
  }

  function renderNav() {
    document.getElementById("nav").innerHTML = VIEWS.map(function (view) {
      var current = view[0] === state.view ? ' aria-current="page"' : "";
      return '<button class="ghost" type="button" data-nav="' + view[0] + '"' + current + ">" + esc(view[1]) + "</button>";
    }).join("");
  }

  function kpi(label, value, detail, drill) {
    return '<button class="kpi" type="button" data-drill="' + esc(drill) + '"><span class="label">' + esc(label) +
      '</span><span class="value">' + esc(value) + '</span><span class="meta">' + esc(detail) + "</span></button>";
  }

  function funnelButton(label, count, max, drill) {
    var width = max ? Math.max(6, Math.round((count / max) * 100)) : 0;
    return '<button type="button" data-drill="' + esc(drill) + '"><span>' + esc(label) + '</span><span class="bar"><span style="width:' +
      width + '%"></span></span><strong>' + count + "</strong></button>";
  }

  function table(headers, rows, rowAttr) {
    if (!rows.length) return '<p class="empty">Nothing in this filter.</p>';
    return '<div class="table-wrap"><table><thead><tr>' + headers.map(function (header) {
      return "<th>" + esc(header) + "</th>";
    }).join("") + "</tr></thead><tbody>" + rows.map(function (row, index) {
      var attr = rowAttr ? rowAttr(row, index) : "";
      return "<tr" + attr + ">" + row.map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>";
    }).join("") + "</tbody></table></div>";
  }

  function renderOverview(data) {
    var max = Math.max(data.funnel.leads, data.funnel.applications, data.funnel.accepted, data.funnel.enrolled, 1);
    var cpeDetail = data.spendUnallocated
      ? "Sample online spend is not split by state."
      : data.costPerEnrollment == null
        ? "No paid enrollment in this slice."
        : money(data.spend) + " sample spend / " + data.funnel.paidEnrolled + " associated";
    return '<p class="lede">Same fictional rows as the rest of this page. Campus, channel, and date change the stages and the sample cost per associated enrollment together. Association is not causal proof, and nothing here is sent.</p>' +
      '<section class="card"><h2>How an inquiry could teach the ads</h2><p class="note">WhatConverts already tracks the inquiry and can send platform feedback where that is configured. This sample adds the outcome the school confirms. It is not a second tracker, and nothing is sent.</p>' +
      '<div class="loop">' +
      loopCard("inquiries", "1 · Inquiry", "WhatConverts keeps the form or call and where it came from.") +
      '<div class="arrow">Not connected</div>' +
      loopCard("facts", "2 · School confirms", "Qualified inquiry, application, or enrollment from the school’s file.") +
      '<div class="arrow">Not connected</div>' +
      loopCard("feedback", "3 · Ads could learn", "Only that outcome. Not a child’s name. Not sent from this page.") +
      "</div>" +
      '<p class="callout">Ready, waiting, and unmatched outcomes are summarized for a school reader. <button class="text-btn" type="button" data-nav="feedback">See ad learning</button></p></section>' +
      '<div class="kpis">' +
      kpi("Tracked leads", String(data.funnel.leads), "WhatConverts sample rows", "leads") +
      kpi("Applications", String(data.funnel.applications), "School-approved application status", "applications") +
      kpi("Enrolled", String(data.funnel.enrolled), data.funnel.paidEnrolled + " associated with paid campaigns", "enrolled") +
      kpi("Cost per associated enrollment", money(data.costPerEnrollment), cpeDetail, "cpe") +
      kpi("Unmatched or waiting", String(data.handoff.length + data.noStatusYet.length), data.handoff.length + " missing shared key · " + data.noStatusYet.length + " no status yet", "waiting") +
      kpi("No WhatConverts inquiry", String(data.factsWithoutLead.length), "Organic, offline, or unknown in the export", "nofacts") +
      "</div>" +
      '<div class="grid-2"><section class="card"><h2>Counts in this filter</h2><p class="note">Bars compare counts. Leads use the WhatConverts date. Later stages use the school status date. A family can inquire in one month and enroll in another, so this is not one closed cohort.</p><div class="funnel">' +
      funnelButton("Tracked leads", data.funnel.leads, max, "leads") +
      funnelButton("Applications", data.funnel.applications, max, "applications") +
      funnelButton("Accepted or enrolled", data.funnel.accepted, max, "accepted") +
      funnelButton("Enrolled", data.funnel.enrolled, max, "enrolled") +
      '</div><p class="callout">Organic, offline, and untracked enrollments in this filter: <strong>' + data.funnel.organicOfflineEnrolled + "</strong>. They stay in the school picture and out of the paid cost figure. " + data.siblings.length + " sibling or additional application row is included in applications and not as an extra enrollment.</p></section>" +
      '<section class="card"><h2>Metric definitions</h2><ul class="plain-list">' +
      "<li><strong>Tracked lead.</strong> A sample WhatConverts form or call. WhatConverts remains the tracker.</li>" +
      "<li><strong>Application / enrolled.</strong> A school-approved status on the sample FACTS export. This demo does not score a lead or declare one qualified without that status.</li>" +
      "<li><strong>Associated.</strong> The same school-authorized shared key is on the inquiry and the outcome. That link is not causal proof.</li>" +
      "<li><strong>Cost per associated enrollment.</strong> Sample media cost in the selected months divided by enrolled outcomes tied to a paid campaign. Rounded to the nearest dollar. Organic and offline enrollments are excluded.</li>" +
      "<li><strong>Ready for ads.</strong> The school confirmed the outcome, and the inquiry came from an ad. Simulated only. Not sent.</li>" +
      "</ul></section></div>" +
      '<div class="grid-2" style="margin-top:14px"><section class="card"><h2>By campus</h2>' + rollupTable(data.byCampus, "campus") + '</section><section class="card"><h2>By channel</h2>' + rollupTable(data.byChannel, "channel") + "</section></div>";
  }

  function loopCard(view, title, copy) {
    return '<button class="loop-card" type="button" data-nav="' + view + '"><strong>' + esc(title) + "</strong><span class=\"note\">" + esc(copy) + '</span><br><span class="chip">Illustrative · not connected</span></button>';
  }

  function rollupTable(rows, key) {
    return table(["Slice", "Leads", "Applications", "Enrolled", "Sample CPE"], rows.map(function (row) {
      return [esc(row[key]), String(row.leads), String(row.applications), String(row.enrolled), esc(money(row.costPerEnrollment))];
    }));
  }

  function renderCampaigns(data) {
    var rows = data.campaigns.slice().sort(function (a, b) {
      var dir = state.sortDir === "asc" ? 1 : -1;
      var valueOf = function (row) {
        if (state.sortKey === "name") return row.campaign.name;
        if (state.sortKey === "channel") return row.campaign.channel;
        if (state.sortKey === "leads") return row.leads;
        if (state.sortKey === "enrolled") return row.enrolled;
        return row.spend || 0;
      };
      var av = valueOf(a);
      var bv = valueOf(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    if (!rows.length) {
      return '<section class="card"><h2>Ad campaigns</h2><p class="empty">No paid campaigns match this filter. Organic and offline inquiries remain on the WhatConverts screen.</p></section>';
    }
    return '<section class="card"><h2>Sample campaigns</h2><p class="note">Cost uses the sample monthly media figures that overlap the date filter. ' +
      (data.spendUnallocated ? "A single online state is selected, so spend stays unallocated and cost per enrollment is hidden." : "Click a row for the inquiries and school statuses behind it.") +
      '</p><div class="table-wrap"><table><thead><tr>' +
      sortHeader("name", "Campaign") + sortHeader("channel", "Channel") + "<th>Campus</th>" + sortHeader("spend", "Sample spend") +
      sortHeader("leads", "Leads") + "<th>Applications</th>" + sortHeader("enrolled", "Enrolled") + "<th>Cost / enrolled</th></tr></thead><tbody>" +
      rows.map(function (row) {
        return '<tr tabindex="0" data-campaign="' + esc(row.campaign.id) + '"><td>' + esc(row.campaign.name) + "</td><td>" + esc(row.campaign.channel) +
          "</td><td>" + esc(row.campaign.campus) + "</td><td>" + esc(money(row.spend)) + "</td><td>" + row.leads + "</td><td>" + row.applications +
          "</td><td>" + row.enrolled + "</td><td>" + esc(money(row.costPerEnrollment)) + "</td></tr>";
      }).join("") + "</tbody></table></div></section>";
  }

  function sortHeader(key, label) {
    var mark = state.sortKey === key ? (state.sortDir === "asc" ? " ↑" : " ↓") : "";
    return '<th><button class="text-btn" type="button" data-sort="' + key + '">' + esc(label + mark) + "</button></th>";
  }

  function renderInquiries(data) {
    var rows = data.leads.map(function (lead) {
      var campaign = demo.campaignById(lead.campaignId);
      var click = lead.clickId || lead.metaClickId || "None in this sample";
      return [
        esc(lead.id),
        esc(prettyDate(lead.date)),
        esc(lead.type),
        esc(lead.channel),
        esc(campaign ? campaign.name : "—"),
        esc(lead.mode === "online" ? "Online · " + lead.state : lead.campus),
        esc(lead.sharedKey || "Missing"),
        esc(click),
        esc(demo.leadMatchLabel(lead))
      ];
    });
    return '<section class="card"><h2>Sample WhatConverts inquiries</h2><p class="note">These rows stand in for the lead tracker Brandastic already uses. Person details are omitted. A Meta click identifier stays on that lead record and is not copied into the Google Ads payload. This screen does not call WhatConverts.</p>' +
      table(["Lead", "Date", "Type", "Channel", "Campaign", "Campus / state", "Shared key", "Click id on the lead", "Match"], rows) +
      "<p class=\"note\">Match labels use the full sample export, not only the date slice. “No school status yet” means the key is present and the export has no row. “No shared key” is the handoff gap.</p></section>";
  }

  function renderFacts(data) {
    var rows = data.outcomes.map(function (row) {
      var link = row.sharedKey ? "Joined to a sample lead" : "No WhatConverts inquiry";
      return [
        esc(row.id),
        esc(row.familyId),
        esc(prettyDate(row.date)),
        esc(row.mode === "online" ? "Online" : row.campus),
        esc(row.state),
        esc(row.status),
        esc(row.sharedKey || "—"),
        esc(link),
        row.sibling ? "Sibling / additional" : "—"
      ];
    });
    return '<section class="card"><h2>Read-only FACTS export preview</h2><p class="note">Built-in fictional rows shaped like a minimum admissions export: application id, family id, campus, state, status, date, and shared key. Grades, medical, financial, and names are not in the file. There is no upload and nothing is stored. FACTS is not connected, and this does not assume a module or API is enabled.</p>' +
      '<p><button class="primary" id="download-sample" type="button">Download this fictional CSV</button></p>' +
      table(["Application", "Family id", "Status date", "Campus", "State", "School-approved status", "Shared key", "Tracker link", "Note"], rows) +
      "<p class=\"note\">Family id and application id are internal sample keys. They appear here for the match and are on the withheld list for Google Ads.</p></section>";
  }

  function renderMatch(data) {
    function line(title, rows, mapper) {
      if (!rows.length) return "<h3>" + esc(title) + "</h3><p class=\"empty\">None in this filter.</p>";
      return "<h3>" + esc(title) + " · " + rows.length + "</h3><ul class=\"drawer-list\">" + rows.map(mapper).join("") + "</ul>";
    }
    var matched = data.outcomes.filter(function (row) { return demo.attributedLead(row); });
    return '<section class="card"><h2>Sample match</h2><p class="note">The join key is the shared school-authorized id already on both sample files. The button replays that join on the built-in fixtures. No file can be uploaded.</p>' +
      '<div class="grid-3">' +
      '<article class="step"><strong>WhatConverts input</strong><p class="note">Lead id, date, channel, campaign, shared key, click id if present.</p>' + chip("", "Illustrative · not connected") + "</article>" +
      '<article class="step"><strong>FACTS input</strong><p class="note">School-approved status, campus, date, shared key if the school included it.</p>' + chip("", "Illustrative · not connected") + "</article>" +
      '<article class="step"><strong>Result in this demo</strong><p class="note">Matched, unmatched, and outcomes with no inquiry. Aggregates only for reporting.</p>' + chip("wait", "Not a live integration") + "</article>" +
      '</div><p><button class="primary" id="replay-match" type="button">Replay sample match</button> <span id="match-note" class="note">Showing the current filter.</span></p>' +
      '<div id="match-results" class="split">' +
      "<div>" + line("Matched school rows", matched, function (row) {
        var lead = demo.attributedLead(row);
        return "<li><strong>" + esc(row.id) + "</strong> " + esc(row.status) + " · " + esc(lead.id) + " · " + esc(row.sharedKey) + (row.sibling ? " · sibling" : "") + "</li>";
      }) + "</div><div>" +
      line("Inquiries without a school row", data.handoff.concat(data.noStatusYet), function (lead) {
        return "<li><strong>" + esc(lead.id) + "</strong> " + esc(demo.leadMatchLabel(lead)) + " · " + esc(lead.channel) + "</li>";
      }) +
      line("FACTS rows with no WhatConverts inquiry", data.factsWithoutLead, function (row) {
        return "<li><strong>" + esc(row.id) + "</strong> " + esc(row.status) + " · " + esc(row.origin) + " · " + esc(row.campus) + "</li>";
      }) + "</div></div></section>";
  }

function distinctCount(records, sync) {
  var seen = {};
  records.forEach(function (record) {
    if (record.sync !== sync) return;
    seen[record.outcomeId || record.leadId || record.reason] = true;
  });
  return Object.keys(seen).length;
}

function recordPlace(record) {
  if (!record || !record.outcomeId) return "";
  var outcome = null;
  demo.outcomes.forEach(function (row) { if (row.id === record.outcomeId) outcome = row; });
  if (!outcome) return "";
  return outcome.mode === "online" ? "Online · " + outcome.state : outcome.campus;
}

function leadChannel(record) {
  if (!record || !record.leadId) return "";
  var channel = "";
  demo.inquiries.forEach(function (row) { if (row.id === record.leadId) channel = row.channel; });
  return channel;
}

function renderFeedback(data) {
  var records = data.feedback.records;
  var ready = distinctCount(records, "eligible");
  var waiting = distinctCount(records, "pending");
  var unmatched = distinctCount(records, "unmatched");
  var reportOnly = distinctCount(records, "not-eligible");
  var exemplars = pickExemplars(records);
  var readyExample = exemplars.filter(function (record) { return record.sync === "eligible"; })[0];
  var waitingExample = exemplars.filter(function (record) { return record.sync === "pending"; })[0];
  var unmatchedExample = exemplars.filter(function (record) { return record.sync === "unmatched"; })[0];
  var metaEnrolled = {};
  records.forEach(function (record) {
    if (leadChannel(record) === "Meta Ads" && record.schoolStatus === "Enrolled") metaEnrolled[record.outcomeId] = true;
  });
  var metaCount = Object.keys(metaEnrolled).length;
  var tableRows = records.map(function (record) {
    return [
      syncLabel(record.sync),
      esc(record.signal),
      esc(record.outcomeId ? record.outcomeId + " · " + record.schoolStatus : "No school row"),
      esc(record.shared ? record.shared.event_time : "—"),
      esc(record.shared ? record.shared.click_id : "Not included"),
      esc(record.shared ? String(record.shared.value) : "—"),
      esc(record.leadId || "—")
    ];
  });
  return '<section class="card"><h2>Help ads learn which inquiries become enrollments</h2>' +
    '<p class="lede">WhatConverts already tracks the inquiry and can send platform feedback where that is configured. This adds the outcome the school confirms. It is not another tracker. Not sent.</p>' +
    '<ol class="plain-steps"><li><strong>School confirms</strong> a qualified inquiry, an application, or an enrollment.</li>' +
    '<li><strong>What could be sent</strong> is that outcome only. Not a child’s name, contact, grade, or financial record.</li>' +
    '<li><strong>Google or Meta</strong> only when the inquiry came from that ad. Neither platform is connected here, and results are not guaranteed.</li></ol>' +
    '<p class="note">In this filter: <strong>' + ready + '</strong> ready for Google · <strong>' + metaCount + '</strong> Meta enrollments stay in the report · <strong>' + reportOnly + '</strong> not prepared for ads.</p></section>' +
    '<div class="grid-3">' +
    statusCard("good", ready, "Ready", "The school confirmed the outcome, and the inquiry came from Google.", readyExample ? "Example: " + readyExample.signal.toLowerCase() + (recordPlace(readyExample) ? " at " + recordPlace(readyExample) : "") + "." : "None in this filter.", "Review before any send. Not sent from this demo.") +
    statusCard("wait", waiting, "Waiting", "The inquiry is tracked. The school has not confirmed an outcome in this sample yet.", waitingExample ? "Example: still waiting on the school file." : "None in this filter.", "Wait for the school. Do not treat the inquiry as enrolled.") +
    statusCard("stop", unmatched, "Needs a match", "The inquiry and the school result could not be tied together, or the ad click was missing.", unmatchedExample ? "Example: " + (unmatchedExample.schoolStatus ? "school confirmed " + unmatchedExample.schoolStatus.toLowerCase() + (recordPlace(unmatchedExample) ? " at " + recordPlace(unmatchedExample) : "") : "the shared link is missing") + "." : "None in this filter.", "Agree on a shared id. Until then, do not send it.") +
    "</div>" +
    '<details class="tech"><summary>Technical details</summary>' +
    '<div class="config"><div><h3>Which school statuses are included</h3><div class="checks">' +
    check("qualified", "Qualified inquiry", "Admissions qualified") +
    check("application", "Application", "Application started or later") +
    check("enrollment", "Enrollment", "Enrolled only") +
    '</div></div><div><h3>Where the ad click is read</h3><div class="radios">' +
    radio("whatconverts", "WhatConverts lead, already in use") +
    radio("landing-form", "Landing form, alternate and not connected") +
    '</div><p class="note">' + esc(data.feedback.clickSourceLabel) + "</p></div></div>" +
    '<p class="note">Would not share: ' + esc(demo.WITHHELD.join(", ")) + ". Sample values are not bids and not tuition. Eligible for sync only means the row is shaped for a later upload.</p>" +
    table(["Sync", "Signal", "School source", "Event time", "Click id", "Sample value", "Lead"], tableRows) +
    "</details>";
}

function statusCard(kind, count, title, body, example, next) {
  return '<article class="card status-card"><span class="chip ' + kind + '">' + esc(title) + '</span><p class="value">' + count + "</p><p>" + esc(body) + '</p><p class="note">' + esc(example) + '</p><p class="next">Next: ' + esc(next) + "</p></article>";
}

function pickExemplars(records) {
  function find(sync, signal) {
    return records.find(function (record) {
      return record.sync === sync && (!signal || record.signal === signal);
    });
  }
  var chosen = [];
  var eligible = find("eligible", "Enrollment") || find("eligible");
  var pending = find("pending");
  var unmatched = find("unmatched");
  [eligible, pending, unmatched].forEach(function (record) {
    if (record) chosen.push(record);
  });
  if (!chosen.length && records.length) chosen.push(records[0]);
  return chosen.slice(0, 3);
}

  function check(key, label, detail) {
    return '<label><input type="checkbox" data-signal="' + key + '"' + (state.feedback[key] ? " checked" : "") + "> <span><strong>" +
      esc(label) + "</strong><br><span class=\"note\">" + esc(detail) + "</span></span></label>";
  }

  function radio(value, label) {
    return '<label><input type="radio" name="click-source" data-click-source="' + value + '"' +
      (state.feedback.clickSource === value ? " checked" : "") + "> <span>" + esc(label) + "</span></label>";
  }

  function renderHow() {
    var steps = [
      ["WhatConverts stays.", "Brandastic already records the inquiry there: form or call, campaign, and, when the ad click provides one, a click identifier. This demo does not open a second lead tracker and does not replace call tracking."],
      ["The family may continue in FACTS.", "FACTS remains the admissions record. A school-authorized shared key has to be on both sides or the inquiry and the later status cannot be joined. The sample includes rows where that key was not preserved."],
      ["Staff keep working in FACTS.", "The pilot shape is one campus and a manual export of the minimum fields the school approves. Grades, medical, financial, and child names are not part of the file. No FACTS module or API is assumed to be turned on."],
      ["This view reconciles the two samples.", "Built-in fixtures only. Organic and offline outcomes stay visible when no ad inquiry exists. Unmatched inquiries stay visible too."],
      ["The report is aggregate.", "Funnel, campus, online geography, channel, and a sample cost per associated enrollment. The association supports a conversation. It is not causal proof."],
      ["Ads could learn later.", "WhatConverts keeps tracking and can send platform feedback where that is configured. This sample adds the school’s confirmed outcome. It is not sent here and is not a performance promise."]
    ];
    return '<section class="card"><h2>How this sits with WhatConverts and FACTS</h2><p class="lede">A picture of an enrollment-outcome report and a closed feedback loop, for the Nov 10 discussion. It is an agency reporting complement, not a product to subscribe to.</p><div class="steps">' +
      steps.map(function (step, index) {
        return '<article class="step"><h3><span class="num">' + (index + 1) + "</span>" + esc(step[0]) + "</h3><p class=\"note\">" + esc(step[1]) + "</p></article>";
      }).join("") + "</div></section>" +
      '<section class="card" style="margin-top:12px"><h2>WhatConverts stays</h2><div class="table-wrap"><table class="compare"><thead><tr><th>Already in use</th><th>This sample view</th></tr></thead><tbody><tr><td>WhatConverts tracks the inquiry and can send platform feedback where that is configured.</td><td>Adds the outcome the school confirms. It does not replace the tracker.</td></tr><tr><td>Stays in place.</td><td>Shows which sample outcomes are ready, waiting, or unmatched. Nothing is sent.</td></tr></tbody></table></div>' +
      '<p class="callout">Whether another product already joins a lead tracker to admissions outcomes, or already returns those outcomes to Google Ads, is a separate research question. This demo does not claim the idea is one of a kind and does not evaluate vendors.</p></section>' +
      '<div class="grid-2" style="margin-top:12px"><section class="card"><h2>Still to confirm with the school</h2><ul class="plain-list"><li>Which FACTS products are licensed, and who can export admissions status.</li><li>Which identifier the school will allow on a minimum file.</li><li>Whether click identifiers are present on the existing WhatConverts leads.</li><li>The real online eligibility list. CA, AZ, TX, and NV are fictional for this demo.</li><li>Pilot campus, export cadence, and whether any later API is wanted. The first step in the concept remains manual CSV.</li></ul></section>' +
      '<section class="card"><h2>Public references behind the concept</h2><ul class="sources"><li><a href="https://factsmgt.com/intelligence/admissions/">FACTS Admissions Intelligence</a></li><li><a href="https://factsmgt.com/intelligence/facts-iq/">FACTS IQ</a></li><li><a href="https://www.misbo.com/file/secure/20230921-other-facts.pdf">Application &amp; Enrollment notes on CSV import/export</a></li></ul><p class="note">Listed so the sample fields have a public paper trail. They are not a connection, and they are not a statement of what this school has enabled.</p></section></div>';
  }

  function renderMain(data) {
    var views = {
      overview: renderOverview,
      campaigns: renderCampaigns,
      inquiries: renderInquiries,
      facts: renderFacts,
      match: renderMatch,
      feedback: renderFeedback,
      how: renderHow
    };
    document.getElementById("main").innerHTML = views[state.view](data);
  }

  function drawerRows(kind, data) {
    if (kind === "leads") return data.leads.map(function (lead) { return lead.id + " · " + prettyDate(lead.date) + " · " + lead.channel + " · " + demo.leadMatchLabel(lead); });
    if (kind === "applications") return data.outcomes.filter(function (row) { return row.milestones.application; }).map(outcomeLine);
    if (kind === "accepted") return data.outcomes.filter(function (row) { return row.status === "Accepted" || row.status === "Enrolled"; }).map(outcomeLine);
    if (kind === "enrolled") return data.outcomes.filter(function (row) { return row.milestones.enrolled; }).map(outcomeLine);
    if (kind === "cpe") return data.paidEnrolled.map(outcomeLine);
    if (kind === "waiting") return data.handoff.concat(data.noStatusYet).map(function (lead) { return lead.id + " · " + demo.leadMatchLabel(lead) + " · " + lead.channel; });
    if (kind === "nofacts") return data.factsWithoutLead.map(outcomeLine);
    return [];
  }

  function outcomeLine(row) {
    var lead = demo.attributedLead(row);
    return row.id + " · " + row.status + " · " + prettyDate(row.date) + " · " + (lead ? lead.id : "no inquiry") + (row.sibling ? " · sibling" : "");
  }

  var DRAWER_COPY = {
    leads: ["Tracked leads", "Sample WhatConverts rows in this filter. Person details are omitted."],
    applications: ["Applications", "School-approved rows whose status includes an application. Sibling applications are listed and are not extra enrollments."],
    accepted: ["Accepted or enrolled", "School-approved status is Accepted or Enrolled."],
    enrolled: ["Enrolled", "School-approved Enrolled rows, including organic and offline."],
    cpe: ["Paid enrollments in the cost figure", "Enrolled outcomes tied to a Google or Meta campaign. Organic, offline, and rows with no inquiry are excluded. The figure is associated sample spend, not causal proof."],
    waiting: ["Unmatched or waiting inquiries", "Missing shared key, or a key with no school-approved row in the sample export."],
    nofacts: ["No WhatConverts inquiry", "School-approved rows that never joined to a sample lead. They stay in the report and out of the Google payload."]
  };

  function renderDrawer(data) {
    var root = document.getElementById("drawer-root");
    if (!state.drawer) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    var title = "Detail";
    var copy = "";
    var lines = [];
    if (state.drawer.kind === "campaign") {
      var found = null;
      data.campaigns.forEach(function (row) { if (row.campaign.id === state.drawer.id) found = row; });
      title = found ? found.campaign.name : "Campaign";
      copy = found ? found.campaign.channel + " · sample spend " + money(found.spend) + " · cost per associated enrollment " + money(found.costPerEnrollment) + "." : "";
      lines = found ? found.leadRows.map(function (lead) { return lead.id + " · " + prettyDate(lead.date) + " · " + demo.leadMatchLabel(lead); }).concat(found.outcomeRows.map(outcomeLine)) : [];
    } else {
      title = DRAWER_COPY[state.drawer.kind][0];
      copy = DRAWER_COPY[state.drawer.kind][1];
      lines = drawerRows(state.drawer.kind, data);
    }
    root.hidden = false;
    root.className = "drawer-root";
    root.innerHTML = '<div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><button class="ghost" type="button" id="close-drawer">Close</button><h2 id="drawer-title">' +
      esc(title) + "</h2><p class=\"note\">" + esc(copy) + "</p><ul class=\"drawer-list\">" +
      (lines.length ? lines.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") : "<li>None in this filter.</li>") +
      "</ul></div>";
    var close = document.getElementById("close-drawer");
    if (close) close.focus();
  }

  function render() {
    var activeId = document.activeElement && document.activeElement.id;
    var data = model();
    renderFilters(data);
    renderNav();
    renderMain(data);
    renderDrawer(data);
    if (activeId && activeId !== "close-drawer") {
      var next = document.getElementById(activeId);
      if (next) next.focus();
    }
    document.body.dataset.view = state.view;
    document.body.dataset.ready = "true";
  }

  function showSampleHeading() {
    var heading = document.querySelector("#main h2");
    if (heading) heading.scrollIntoView({ block: "start" });
  }

  function setView(view) {
    state.view = view;
    if (location.hash.replace("#", "") !== view) history.replaceState(null, "", "#" + view);
    state.drawer = null;
    render();
    showSampleHeading();
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
    if (event.target.id === "theme-toggle") {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("brandastic-theme", next); } catch (err) { /* ignore */ }
      return;
    }
    if (event.target.id === "reset-demo") {
      state.filters = { campus: "all", geography: "all", date: "window", channel: "all" };
      state.feedback = demo.defaultFeedbackOptions();
      state.logFilter = "all";
      state.drawer = null;
      render();
      return;
    }
    if (event.target.id === "close-drawer" || (event.target.id === "drawer-root" && event.target === event.currentTarget)) {
      state.drawer = null;
      render();
      return;
    }
    if (event.target.classList && event.target.classList.contains("drawer-root")) {
      state.drawer = null;
      render();
      return;
    }
    var nav = event.target.closest("[data-nav]");
    if (nav) {
      setView(nav.getAttribute("data-nav"));
      return;
    }
    var drill = event.target.closest("[data-drill]");
    if (drill) {
      state.drawer = { kind: drill.getAttribute("data-drill") };
      render();
      return;
    }
    var sort = event.target.closest("[data-sort]");
    if (sort) {
      var key = sort.getAttribute("data-sort");
      state.sortDir = state.sortKey === key && state.sortDir === "desc" ? "asc" : "desc";
      state.sortKey = key;
      render();
      return;
    }
    var campaign = event.target.closest("[data-campaign]");
    if (campaign) {
      state.drawer = { kind: "campaign", id: campaign.getAttribute("data-campaign") };
      render();
      return;
    }
    var log = event.target.closest("[data-log]");
    if (log) {
      state.logFilter = log.getAttribute("data-log");
      render();
      return;
    }
    if (event.target.id === "download-sample") downloadSample(model());
    if (event.target.id === "replay-match") {
      var note = document.getElementById("match-note");
      if (note) note.textContent = "Sample match replayed on built-in fixtures. Nothing was uploaded.";
    }
  });

  document.body.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && state.drawer) {
      state.drawer = null;
      render();
    }
    var campaign = event.target.closest && event.target.closest("[data-campaign]");
    if (campaign && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      state.drawer = { kind: "campaign", id: campaign.getAttribute("data-campaign") };
      render();
    }
  });

  function csvCell(value) {
    var text = String(value == null ? "" : value);
    if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function downloadSample(data) {
    var header = ["application_id", "family_id", "status_date", "campus", "mode", "state", "school_approved_status", "shared_key", "origin", "qualified", "application", "enrolled", "sibling"];
    var lines = [header.join(",")];
    data.outcomes.forEach(function (row) {
      lines.push([
        row.id, row.familyId, row.date, row.campus, row.mode, row.state, row.status, row.sharedKey || "", row.origin,
        row.milestones.qualified, row.milestones.application, row.milestones.enrolled, row.sibling
      ].map(csvCell).join(","));
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

  window.addEventListener("hashchange", function () {
    var next = viewFromHash();
    if (next !== state.view) {
      state.view = next;
      state.drawer = null;
      render();
      showSampleHeading();
    }
  });

  state.view = viewFromHash();
  render();
  if (location.hash && location.hash !== "#goal" && location.hash !== "#path" && location.hash !== "#preview" && location.hash !== "#pilot") showSampleHeading();

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
    if (!document.getElementById("summary").textContent.match(/43/)) fail("lead count");
    document.getElementById("date").value = "oct";
    document.getElementById("date").dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("campus").value = "Maple Ridge";
    document.getElementById("campus").dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("channel").value = "Google Ads";
    document.getElementById("channel").dispatchEvent(new Event("change", { bubbles: true }));
    var summary = document.getElementById("summary").textContent;
    if (!summary.match(/5 tracked/)) fail("filtered leads: " + summary);
    setView("feedback");
    var feedbackText = document.getElementById("main").textContent;
    if (feedbackText.indexOf("Help ads learn which inquiries become enrollments") === -1) fail("headline");
    if (document.querySelector("details.tech").open) fail("technical details should start closed");
    if (feedbackText.indexOf("sample-gclid-1003") === -1) fail("missing earliest click");
    if (feedbackText.indexOf("Child name") === -1) fail("withheld list");
    if (feedbackText.indexOf("Not sent") === -1 && feedbackText.indexOf("not sent") === -1) fail("sent claim");
    var enrollmentBox = document.querySelector('[data-signal="enrollment"]');
    enrollmentBox.checked = false;
    enrollmentBox.dispatchEvent(new Event("change", { bubbles: true }));
    var after = document.getElementById("main").textContent;
    if (after.indexOf("Eligible for sync") === -1) fail("application signals should remain");
    setView("match");
    if (document.getElementById("main").textContent.indexOf("APP-5003") === -1) fail("match row");
    document.getElementById("replay-match").click();
    setView("campaigns");
    var row = document.querySelector("[data-campaign='g-maple']");
    if (!row) fail("campaign row");
    row.click();
    if (!document.getElementById("drawer-title")) fail("drawer");
    document.getElementById("close-drawer").click();
    document.body.dataset.selftest = "pass";
  }
})();
