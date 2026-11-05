/* Sample fixtures for the enrollment-outcomes demo.
   Fictional rows only. No names, emails, or phone numbers.
   Loaded in the browser and required by the node smoke test. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.EnrollmentDemo = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var ELIGIBLE_STATES = ["CA", "AZ", "TX", "NV"];

  var SAMPLE_AS_OF = "2026-10-31";

  function addDays(iso, delta) {
    var parts = iso.split("-");
    var utc = Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]) + delta);
    var next = new Date(utc);
    var month = String(next.getUTCMonth() + 1);
    var day = String(next.getUTCDate());
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return next.getUTCFullYear() + "-" + month + "-" + day;
  }

  function preset(id, short, days) {
    var start = addDays(SAMPLE_AS_OF, 1 - days);
    return { id: id, short: short, label: short + " · " + start + " to " + SAMPLE_AS_OF, start: start, end: SAMPLE_AS_OF };
  }

  var DATE_RANGES = {
    window: { id: "window", short: "Aug–Oct 2026", label: "Aug 1–Oct 31, 2026", start: "2026-08-01", end: "2026-10-31" },
    d30: preset("d30", "Last 30 days", 30),
    d60: preset("d60", "Last 60 days", 60),
    d90: preset("d90", "Last 90 days", 90),
    aug: { id: "aug", short: "August 2026", label: "August 2026", start: "2026-08-01", end: "2026-08-31" },
    sep: { id: "sep", short: "September 2026", label: "September 2026", start: "2026-09-01", end: "2026-09-30" },
    oct: { id: "oct", short: "October 2026", label: "October 2026", start: "2026-10-01", end: "2026-10-31" },
    late: { id: "late", short: "Sep–Oct 2026", label: "Sep–Oct 2026", start: "2026-09-01", end: "2026-10-31" }
  };

  var SAMPLE_VALUES = {
    "Qualified inquiry": 25,
    "Application": 150,
    "Enrollment": 1000
  };

  var WITHHELD = [
    "Child name",
    "Parent or guardian name",
    "Email",
    "Phone",
    "Address",
    "Grade or academic record",
    "Medical information",
    "Financial aid or tuition",
    "Family id",
    "Application id"
  ];

  var PAYLOAD_KEYS = ["event", "click_id", "event_time", "value", "currency"];

  var campaigns = [
    { id: "g-maple", name: "Maple Ridge · Fall open house", channel: "Google Ads", campus: "Maple Ridge", mode: "campus", spend: { "2026-08": 4800, "2026-09": 6200, "2026-10": 5100 } },
    { id: "g-harbor", name: "Harbor View · Campus tour", channel: "Google Ads", campus: "Harbor View", mode: "campus", spend: { "2026-08": 3600, "2026-09": 4100, "2026-10": 3900 } },
    { id: "g-online", name: "Online · Eligible states", channel: "Google Ads", campus: "Online", mode: "online", spend: { "2026-08": 5400, "2026-09": 7200, "2026-10": 6800 } },
    { id: "m-cedar", name: "Cedar Falls · Enrollment", channel: "Meta Ads", campus: "Cedar Falls", mode: "campus", spend: { "2026-08": 2900, "2026-09": 3400, "2026-10": 3100 } },
    { id: "m-online", name: "Online · Meta prospecting", channel: "Meta Ads", campus: "Online", mode: "online", spend: { "2026-08": 2200, "2026-09": 2600, "2026-10": 2400 } }
  ];

  function lead(id, date, type, channel, campaignId, campus, mode, state, eligible, sharedKey, clickId, metaClickId) {
    return {
      id: id,
      date: date,
      type: type,
      channel: channel,
      campaignId: campaignId,
      campus: campus,
      mode: mode,
      state: state,
      eligible: eligible,
      sharedKey: sharedKey,
      clickId: clickId,
      metaClickId: metaClickId,
      tracker: "WhatConverts",
      personFields: "fictional"
    };
  }

  function outcome(id, familyId, date, status, campus, mode, state, sharedKey, origin, qualified, application, enrolled, sibling) {
    return {
      id: id,
      familyId: familyId,
      date: date,
      status: status,
      campus: campus,
      mode: mode,
      state: state,
      sharedKey: sharedKey,
      origin: origin,
      schoolApproved: true,
      sourceSystem: "FACTS sample export",
      milestones: { qualified: qualified, application: application, enrolled: enrolled },
      sibling: Boolean(sibling)
    };
  }

  var inquiries = [
    lead("WC-1001", "2026-08-06", "Form", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1001", "sample-gclid-1001", null),
    lead("WC-1002", "2026-08-18", "Call", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1002", "sample-gclid-1002", null),
    lead("WC-1003", "2026-09-04", "Form", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1003", "sample-gclid-1003", null),
    lead("WC-1004", "2026-09-15", "Form", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1004", "sample-gclid-1004", null),
    lead("WC-1005", "2026-09-22", "Call", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1005", "sample-gclid-1005", null),
    lead("WC-1006", "2026-10-03", "Form", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1006", null, null),
    lead("WC-1007", "2026-10-11", "Form", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1007", "sample-gclid-1007", null),
    lead("WC-1008", "2026-10-19", "Form", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, null, "sample-gclid-1008", null),
    lead("WC-1009", "2026-10-27", "Form", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1009", "sample-gclid-1009", null),
    lead("WC-1042", "2026-10-04", "Call", "Google Ads", "g-maple", "Maple Ridge", "campus", "CA", null, "SK-1003", "sample-gclid-1042", null),

    lead("WC-1010", "2026-08-09", "Form", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, "SK-1010", "sample-gclid-1010", null),
    lead("WC-1011", "2026-08-21", "Form", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, "SK-1011", "sample-gclid-1011", null),
    lead("WC-1012", "2026-09-08", "Call", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, "SK-1012", "sample-gclid-1012", null),
    lead("WC-1013", "2026-09-19", "Form", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, "SK-1013", "sample-gclid-1013", null),
    lead("WC-1014", "2026-10-06", "Form", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, "SK-1014", "sample-gclid-1014", null),
    lead("WC-1015", "2026-10-16", "Form", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, null, "sample-gclid-1015", null),
    lead("WC-1016", "2026-10-24", "Form", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, "SK-1016", "sample-gclid-1016", null),
    lead("WC-1044", "2026-09-07", "Form", "Google Ads", "g-harbor", "Harbor View", "campus", "CA", null, "SK-1044", "sample-gclid-1044", null),

    lead("WC-1017", "2026-08-12", "Form", "Meta Ads", "m-cedar", "Cedar Falls", "campus", "AZ", null, "SK-1017", null, "sample-fbclid-1017"),
    lead("WC-1018", "2026-09-02", "Form", "Meta Ads", "m-cedar", "Cedar Falls", "campus", "AZ", null, "SK-1018", null, "sample-fbclid-1018"),
    lead("WC-1019", "2026-09-18", "Call", "Meta Ads", "m-cedar", "Cedar Falls", "campus", "AZ", null, "SK-1019", null, "sample-fbclid-1019"),
    lead("WC-1020", "2026-10-05", "Form", "Meta Ads", "m-cedar", "Cedar Falls", "campus", "AZ", null, "SK-1020", null, "sample-fbclid-1020"),
    lead("WC-1021", "2026-10-21", "Form", "Meta Ads", "m-cedar", "Cedar Falls", "campus", "AZ", null, "SK-1021", null, "sample-fbclid-1021"),

    lead("WC-1022", "2026-08-07", "Form", "Google Ads", "g-online", "Online", "online", "CA", true, "SK-1022", "sample-gclid-1022", null),
    lead("WC-1023", "2026-08-14", "Form", "Google Ads", "g-online", "Online", "online", "AZ", true, "SK-1023", "sample-gclid-1023", null),
    lead("WC-1024", "2026-08-28", "Call", "Google Ads", "g-online", "Online", "online", "TX", true, "SK-1024", "sample-gclid-1024", null),
    lead("WC-1025", "2026-09-06", "Form", "Google Ads", "g-online", "Online", "online", "NV", true, "SK-1025", "sample-gclid-1025", null),
    lead("WC-1026", "2026-09-11", "Form", "Google Ads", "g-online", "Online", "online", "CA", true, "SK-1026", "sample-gclid-1026", null),
    lead("WC-1027", "2026-09-25", "Form", "Google Ads", "g-online", "Online", "online", "AZ", true, "SK-1027", "sample-gclid-1027", null),
    lead("WC-1028", "2026-10-02", "Form", "Google Ads", "g-online", "Online", "online", "TX", true, "SK-1028", "sample-gclid-1028", null),
    lead("WC-1029", "2026-10-09", "Form", "Google Ads", "g-online", "Online", "online", "CA", true, null, "sample-gclid-1029", null),
    lead("WC-1030", "2026-10-15", "Form", "Google Ads", "g-online", "Online", "online", "OR", false, "SK-1030", "sample-gclid-1030", null),
    lead("WC-1031", "2026-10-22", "Form", "Google Ads", "g-online", "Online", "online", "WA", false, "SK-1031", "sample-gclid-1031", null),

    lead("WC-1032", "2026-08-16", "Form", "Meta Ads", "m-online", "Online", "online", "CA", true, "SK-1032", null, "sample-fbclid-1032"),
    lead("WC-1033", "2026-09-09", "Form", "Meta Ads", "m-online", "Online", "online", "TX", true, "SK-1033", null, "sample-fbclid-1033"),
    lead("WC-1034", "2026-09-28", "Call", "Meta Ads", "m-online", "Online", "online", "AZ", true, "SK-1034", null, "sample-fbclid-1034"),
    lead("WC-1035", "2026-10-12", "Form", "Meta Ads", "m-online", "Online", "online", "NV", true, "SK-1035", null, "sample-fbclid-1035"),
    lead("WC-1036", "2026-10-26", "Form", "Meta Ads", "m-online", "Online", "online", "CO", false, "SK-1036", null, "sample-fbclid-1036"),

    lead("WC-1037", "2026-08-20", "Form", "Organic", null, "Maple Ridge", "campus", "CA", null, "SK-1037", null, null),
    lead("WC-1038", "2026-09-14", "Form", "Organic", null, "Harbor View", "campus", "CA", null, "SK-1038", null, null),
    lead("WC-1039", "2026-10-08", "Call", "Organic", null, "Online", "online", "CA", true, "SK-1039", null, null),
    lead("WC-1040", "2026-09-30", "Chat", "Organic", null, "Cedar Falls", "campus", "AZ", null, "SK-1040", null, null),
    lead("WC-1041", "2026-09-12", "Form", "Offline / referral", null, "Maple Ridge", "campus", "CA", null, "SK-1041", null, null)
  ];

  var outcomes = [
    outcome("APP-5001", "FAM-3001", "2026-09-20", "Enrolled", "Maple Ridge", "campus", "CA", "SK-1001", "from-inquiry", true, true, true, false),
    outcome("APP-5001B", "FAM-3001", "2026-09-21", "Application started", "Maple Ridge", "campus", "CA", "SK-1001", "from-inquiry", false, true, false, true),
    outcome("APP-5002", "FAM-3002", "2026-09-01", "Application complete", "Maple Ridge", "campus", "CA", "SK-1002", "from-inquiry", true, true, false, false),
    outcome("APP-5003", "FAM-3003", "2026-10-12", "Enrolled", "Maple Ridge", "campus", "CA", "SK-1003", "from-inquiry", true, true, true, false),
    outcome("APP-5004", "FAM-3004", "2026-10-18", "Accepted", "Maple Ridge", "campus", "CA", "SK-1004", "from-inquiry", true, true, false, false),
    outcome("APP-5005", "FAM-3005", "2026-09-28", "Application started", "Maple Ridge", "campus", "CA", "SK-1005", "from-inquiry", false, true, false, false),
    outcome("APP-5006", "FAM-3006", "2026-10-25", "Enrolled", "Maple Ridge", "campus", "CA", "SK-1006", "from-inquiry", true, true, true, false),
    outcome("APP-5007", "FAM-3007", "2026-10-22", "Withdrawn", "Maple Ridge", "campus", "CA", "SK-1007", "from-inquiry", true, true, false, false),

    outcome("APP-5010", "FAM-3010", "2026-08-27", "Enrolled", "Harbor View", "campus", "CA", "SK-1010", "from-inquiry", true, true, true, false),
    outcome("APP-5011", "FAM-3011", "2026-08-26", "Application complete", "Harbor View", "campus", "CA", "SK-1011", "from-inquiry", true, true, false, false),
    outcome("APP-5012", "FAM-3012", "2026-10-02", "Accepted", "Harbor View", "campus", "CA", "SK-1012", "from-inquiry", true, true, false, false),
    outcome("APP-5013", "FAM-3013", "2026-10-20", "Enrolled", "Harbor View", "campus", "CA", "SK-1013", "from-inquiry", true, true, true, false),
    outcome("APP-5014", "FAM-3014", "2026-10-14", "Application started", "Harbor View", "campus", "CA", "SK-1014", "from-inquiry", true, true, false, false),
    outcome("APP-5044", "FAM-3044", "2026-09-18", "Admissions qualified", "Harbor View", "campus", "CA", "SK-1044", "from-inquiry", true, false, false, false),

    outcome("APP-5017", "FAM-3017", "2026-09-18", "Enrolled", "Cedar Falls", "campus", "AZ", "SK-1017", "from-inquiry", true, true, true, false),
    outcome("APP-5018", "FAM-3018", "2026-09-10", "Application started", "Cedar Falls", "campus", "AZ", "SK-1018", "from-inquiry", true, true, false, false),
    outcome("APP-5019", "FAM-3019", "2026-10-08", "Accepted", "Cedar Falls", "campus", "AZ", "SK-1019", "from-inquiry", true, true, false, false),
    outcome("APP-5020", "FAM-3020", "2026-10-19", "Withdrawn", "Cedar Falls", "campus", "AZ", "SK-1020", "from-inquiry", true, true, false, false),

    outcome("APP-5022", "FAM-3022", "2026-09-12", "Enrolled", "Online", "online", "CA", "SK-1022", "from-inquiry", true, true, true, false),
    outcome("APP-5023", "FAM-3023", "2026-09-20", "Enrolled", "Online", "online", "AZ", "SK-1023", "from-inquiry", true, true, true, false),
    outcome("APP-5024", "FAM-3024", "2026-09-16", "Application complete", "Online", "online", "TX", "SK-1024", "from-inquiry", true, true, false, false),
    outcome("APP-5025", "FAM-3025", "2026-10-04", "Accepted", "Online", "online", "NV", "SK-1025", "from-inquiry", true, true, false, false),
    outcome("APP-5026", "FAM-3026", "2026-10-16", "Enrolled", "Online", "online", "CA", "SK-1026", "from-inquiry", true, true, true, false),
    outcome("APP-5027", "FAM-3027", "2026-10-01", "Application started", "Online", "online", "AZ", "SK-1027", "from-inquiry", false, true, false, false),
    outcome("APP-5028", "FAM-3028", "2026-10-28", "Enrolled", "Online", "online", "TX", "SK-1028", "from-inquiry", true, true, true, false),

    outcome("APP-5032", "FAM-3032", "2026-09-22", "Enrolled", "Online", "online", "CA", "SK-1032", "from-inquiry", true, true, true, false),
    outcome("APP-5033", "FAM-3033", "2026-10-06", "Application complete", "Online", "online", "TX", "SK-1033", "from-inquiry", true, true, false, false),
    outcome("APP-5034", "FAM-3034", "2026-10-18", "Accepted", "Online", "online", "AZ", "SK-1034", "from-inquiry", true, true, false, false),

    outcome("APP-5037", "FAM-3037", "2026-10-02", "Enrolled", "Maple Ridge", "campus", "CA", "SK-1037", "from-inquiry", true, true, true, false),
    outcome("APP-5038", "FAM-3038", "2026-09-28", "Application started", "Harbor View", "campus", "CA", "SK-1038", "from-inquiry", true, true, false, false),
    outcome("APP-5039", "FAM-3039", "2026-10-21", "Enrolled", "Online", "online", "CA", "SK-1039", "from-inquiry", true, true, true, false),
    outcome("APP-5041", "FAM-3041", "2026-10-09", "Enrolled", "Maple Ridge", "campus", "CA", "SK-1041", "from-inquiry", true, true, true, false),

    outcome("APP-5101", "FAM-3101", "2026-09-08", "Enrolled", "Harbor View", "campus", "CA", null, "offline", true, true, true, false),
    outcome("APP-5102", "FAM-3102", "2026-10-11", "Application complete", "Cedar Falls", "campus", "AZ", null, "offline", true, true, false, false),
    outcome("APP-5103", "FAM-3103", "2026-10-15", "Enrolled", "Online", "online", "AZ", null, "unknown", true, true, true, false),
    outcome("APP-5104", "FAM-3104", "2026-08-30", "Accepted", "Maple Ridge", "campus", "CA", null, "unknown", true, true, false, false),
    outcome("APP-5105", "FAM-3105", "2026-09-19", "Application started", "Online", "online", "CA", null, "offline", true, true, false, false)
  ];

  var SIGNAL_FLAGS = [
    ["qualified", "qualified", "Qualified inquiry"],
    ["application", "application", "Application"],
    ["enrollment", "enrolled", "Enrollment"]
  ];

  function byDateThenId(a, b) {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  }

  function campaignById(id) {
    for (var i = 0; i < campaigns.length; i++) {
      if (campaigns[i].id === id) return campaigns[i];
    }
    return null;
  }

  function leadsForKey(key) {
    if (!key) return [];
    return inquiries.filter(function (leadRow) { return leadRow.sharedKey === key; }).sort(byDateThenId);
  }

  function outcomesForKey(key) {
    if (!key) return [];
    return outcomes.filter(function (row) { return row.sharedKey === key; }).sort(byDateThenId);
  }

  function attributedLead(outcomeRow) {
    var rows = leadsForKey(outcomeRow.sharedKey);
    return rows.length ? rows[0] : null;
  }

  function outcomeChannel(outcomeRow) {
    var leadRow = attributedLead(outcomeRow);
    if (leadRow) return leadRow.channel;
    if (outcomeRow.origin === "offline") return "Offline / referral";
    if (outcomeRow.origin === "organic") return "Organic";
    return "No tracked inquiry";
  }

  function campusMatch(row, campus) {
    if (campus === "all") return true;
    if (campus === "Online") return row.mode === "online";
    return row.campus === campus;
  }

  function geoMatch(row, geography) {
    if (geography === "all") return true;
    if (geography === "in-person") return row.mode === "campus";
    if (geography === "online-eligible") return row.mode === "online" && ELIGIBLE_STATES.indexOf(row.state) !== -1;
    if (geography === "online-outside") return row.mode === "online" && ELIGIBLE_STATES.indexOf(row.state) === -1;
    if (geography.indexOf("online-") === 0) return row.mode === "online" && row.state === geography.slice("online-".length);
    return true;
  }

  function geographySplitsOnlineSpend(geography) {
    return geography === "online-CA" || geography === "online-AZ" || geography === "online-TX" || geography === "online-NV" || geography === "online-outside";
  }

  function inDate(iso, range) {
    return iso >= range.start && iso <= range.end;
  }

  function monthsOverlapping(range) {
    return ["2026-08", "2026-09", "2026-10"].filter(function (month) {
      var start = month + "-01";
      var end = month === "2026-08" ? "2026-08-31" : month === "2026-09" ? "2026-09-30" : "2026-10-31";
      return start <= range.end && end >= range.start;
    });
  }

  function leadInFilter(leadRow, filters, range) {
    if (!inDate(leadRow.date, range)) return false;
    if (!campusMatch(leadRow, filters.campus)) return false;
    if (!geoMatch(leadRow, filters.geography)) return false;
    if (filters.channel === "No tracked inquiry") return false;
    if (filters.channel !== "all" && leadRow.channel !== filters.channel) return false;
    if (filters.campaign && filters.campaign !== "all" && leadRow.campaignId !== filters.campaign) return false;
    return true;
  }

  function outcomeInFilter(outcomeRow, filters, range) {
    if (!inDate(outcomeRow.date, range)) return false;
    if (!campusMatch(outcomeRow, filters.campus)) return false;
    if (!geoMatch(outcomeRow, filters.geography)) return false;
    if (filters.channel !== "all" && outcomeChannel(outcomeRow) !== filters.channel) return false;
    if (filters.campaign && filters.campaign !== "all") {
      var campaignLead = attributedLead(outcomeRow);
      if (!campaignLead || campaignLead.campaignId !== filters.campaign) return false;
    }
    return true;
  }

  function campaignVisible(campaign, filters) {
    if (filters.campaign && filters.campaign !== "all" && campaign.id !== filters.campaign) return false;
    if (filters.channel !== "all" && filters.channel !== campaign.channel) return false;
    if (filters.campus === "Online" && campaign.mode !== "online") return false;
    if (filters.campus !== "all" && filters.campus !== "Online" && campaign.campus !== filters.campus) return false;
    if (filters.geography === "in-person" && campaign.mode !== "campus") return false;
    if (filters.geography !== "all" && filters.geography !== "in-person" && campaign.mode !== "online") return false;
    return true;
  }

  function campaignSpend(campaign, range) {
    return monthsOverlapping(range).reduce(function (sum, month) {
      return sum + (campaign.spend[month] || 0);
    }, 0);
  }

  function leadMatchLabel(leadRow) {
    if (!leadRow.sharedKey) return "No shared key";
    var related = outcomesForKey(leadRow.sharedKey);
    if (!related.length) return "No school status yet";
    var siblings = leadsForKey(leadRow.sharedKey);
    if (siblings.length > 1 && siblings[0].id !== leadRow.id) return "Duplicate lead, same shared key";
    return "Matched to school status";
  }

  function countWhere(rows, predicate) {
    return rows.reduce(function (sum, row) { return sum + (predicate(row) ? 1 : 0); }, 0);
  }

  function rollup(leads, outcomeRows, spend, spendKnown) {
    var applications = countWhere(outcomeRows, function (row) { return row.milestones.application; });
    var accepted = countWhere(outcomeRows, function (row) { return row.status === "Accepted" || row.status === "Enrolled"; });
    var enrolled = countWhere(outcomeRows, function (row) { return row.milestones.enrolled; });
    var paidEnrolled = countWhere(outcomeRows, function (row) {
      if (!row.milestones.enrolled) return false;
      var leadRow = attributedLead(row);
      return !!(leadRow && (leadRow.channel === "Google Ads" || leadRow.channel === "Meta Ads"));
    });
    return {
      leads: leads.length,
      applications: applications,
      accepted: accepted,
      enrolled: enrolled,
      paidEnrolled: paidEnrolled,
      spend: spendKnown ? spend : null,
      costPerEnrollment: spendKnown && paidEnrolled > 0 ? spend / paidEnrolled : null
    };
  }

  function defaultFeedbackOptions() {
    return { qualified: true, application: true, enrollment: true, clickSource: "whatconverts" };
  }

  function clickSourceLabel(clickSource) {
    if (clickSource === "landing-form") {
      return "Click id read from the landing-form field.";
    }
    return "Click id read from the WhatConverts lead.";
  }

  function googleClickLead(outcomeRow) {
    return leadsForKey(outcomeRow.sharedKey).filter(function (leadRow) {
      return leadRow.channel === "Google Ads" && leadRow.clickId;
    }).sort(byDateThenId);
  }

  function buildFeedback(filteredLeads, filteredOutcomes, options) {
    var records = [];
    var seen = {};
    var outsideNoted = {};

    function base(sync, signal, reason, leadRow, outcomeRow, shared, extras) {
      return {
        sync: sync,
        signal: signal,
        reason: reason,
        leadId: leadRow ? leadRow.id : null,
        outcomeId: outcomeRow ? outcomeRow.id : null,
        schoolStatus: outcomeRow ? outcomeRow.status : null,
        schoolApproved: outcomeRow ? outcomeRow.schoolApproved === true : false,
        sharedKey: (outcomeRow && outcomeRow.sharedKey) || (leadRow && leadRow.sharedKey) || null,
        clickOnLead: leadRow && leadRow.clickId ? leadRow.clickId : null,
        shared: shared,
        extraClickIds: extras || [],
        withheld: WITHHELD.slice(),
        clickSourceLabel: clickSourceLabel(options.clickSource)
      };
    }

    function pushSignals(outcomeRow) {
      if (seen[outcomeRow.id]) return;
      seen[outcomeRow.id] = true;
      var googleClicks = googleClickLead(outcomeRow);
      var anyGoogle = leadsForKey(outcomeRow.sharedKey).some(function (leadRow) { return leadRow.channel === "Google Ads"; });
      var primary = googleClicks[0] || null;
      var extras = googleClicks.slice(1).map(function (leadRow) { return leadRow.clickId; });
      var attributed = attributedLead(outcomeRow);

      if (!anyGoogle) {
        var why = !attributed
          ? "No WhatConverts inquiry is attached. The school status stays in the sample report and is not prepared for Google Ads."
          : "The inquiry channel is " + attributed.channel + ". WhatConverts keeps that lead. This Google Ads log does not include it.";
        records.push(base("not-eligible", outcomeRow.milestones.enrolled ? "Enrollment" : outcomeRow.milestones.application ? "Application" : "School status", why, attributed, outcomeRow, null, []));
        return;
      }

      if (!primary) {
        var holder = leadsForKey(outcomeRow.sharedKey).filter(function (leadRow) { return leadRow.channel === "Google Ads"; }).sort(byDateThenId)[0];
        records.push(base(
          "unmatched",
          outcomeRow.status,
          "A school-approved status is on the sample export, and the WhatConverts lead has no click identifier. Nothing is prepared for Google Ads.",
          holder,
          outcomeRow,
          null,
          []
        ));
        return;
      }

      if (outcomeRow.schoolApproved !== true) return;

      var emitted = false;
      SIGNAL_FLAGS.forEach(function (pair) {
        var optionKey = pair[0];
        var milestoneKey = pair[1];
        var label = pair[2];
        if (!options[optionKey]) return;
        if (!outcomeRow.milestones[milestoneKey]) return;
        emitted = true;
        records.push(base(
          "eligible",
          label,
          "School-approved status on the sample FACTS export, joined to a click identifier held on the WhatConverts lead. Simulated. Not sent.",
          primary,
          outcomeRow,
          {
            event: label,
            click_id: primary.clickId,
            event_time: outcomeRow.date,
            value: SAMPLE_VALUES[label],
            currency: "USD"
          },
          extras
        ));
      });

      if (!emitted) {
        var disabled = SIGNAL_FLAGS.some(function (pair) { return outcomeRow.milestones[pair[1]] && !options[pair[0]]; });
        records.push(base(
          "pending",
          outcomeRow.status,
          disabled
            ? "The school-approved status is still on the export. The matching signal is switched off in this demo configuration, so nothing is prepared."
            : "This school-approved status is not mapped to a qualified inquiry, application, or enrollment signal.",
          primary,
          outcomeRow,
          null,
          extras
        ));
      }
    }

    filteredOutcomes.forEach(pushSignals);

    filteredLeads.forEach(function (leadRow) {
      if (leadRow.channel !== "Google Ads") return;
      var related = outcomesForKey(leadRow.sharedKey);
      if (!leadRow.sharedKey) {
        records.push(base(
          "unmatched",
          "No school status attached",
          "The shared key is missing, so a school-approved status cannot be tied to this click. The click identifier stays on the sample lead and is not sent.",
          leadRow,
          null,
          null,
          []
        ));
        return;
      }
      if (!related.length) {
        var outside = leadRow.mode === "online" && leadRow.eligible === false;
        records.push(base(
          "pending",
          "Waiting on school status",
          outside
            ? "No school-approved status is in the sample export for this shared key. The inquiry is also outside the fictional eligible-state list, so the demo does not invent a rejection or a qualified signal."
            : "No school-approved status is in the sample FACTS export for this shared key yet.",
          leadRow,
          null,
          null,
          []
        ));
        return;
      }
      related.forEach(function (outcomeRow) {
        if (seen[outcomeRow.id] || outsideNoted[outcomeRow.id]) return;
        outsideNoted[outcomeRow.id] = true;
        records.push(base(
          "pending",
          outcomeRow.status,
          "School-approved status " + outcomeRow.status + " is dated " + outcomeRow.date + ", outside the current filter. It is not prepared in this slice.",
          googleClickLead(outcomeRow)[0] || leadRow,
          outcomeRow,
          null,
          []
        ));
      });
    });

    var counts = { eligible: 0, pending: 0, unmatched: 0, "not-eligible": 0 };
    records.forEach(function (record) { counts[record.sync] += 1; });
    return { records: records, counts: counts, clickSourceLabel: clickSourceLabel(options.clickSource) };
  }

  function compute(filters, feedbackOptions) {
    var range = DATE_RANGES[filters.date] || DATE_RANGES.window;
    var options = feedbackOptions || defaultFeedbackOptions();
    var leads = inquiries.filter(function (leadRow) { return leadInFilter(leadRow, filters, range); });
    var outcomeRows = outcomes.filter(function (outcomeRow) { return outcomeInFilter(outcomeRow, filters, range); });
    var spendUnallocated = geographySplitsOnlineSpend(filters.geography);
    var visibleCampaigns = campaigns.filter(function (campaign) { return campaignVisible(campaign, filters); });
    var spendRows = visibleCampaigns.map(function (campaign) {
      return {
        campaign: campaign,
        spend: spendUnallocated ? null : campaignSpend(campaign, range)
      };
    });
    var paidSpend = spendUnallocated ? 0 : spendRows.reduce(function (sum, row) { return sum + row.spend; }, 0);

    var distinctKeys = {};
    leads.forEach(function (leadRow) { if (leadRow.sharedKey) distinctKeys[leadRow.sharedKey] = true; });

    var applications = outcomeRows.filter(function (row) { return row.milestones.application; });
    var accepted = outcomeRows.filter(function (row) { return row.status === "Accepted" || row.status === "Enrolled"; });
    var enrolled = outcomeRows.filter(function (row) { return row.milestones.enrolled; });
    var paidEnrolled = enrolled.filter(function (row) {
      var leadRow = attributedLead(row);
      return !!(leadRow && (leadRow.channel === "Google Ads" || leadRow.channel === "Meta Ads"));
    });
    var enrolledNoInquiry = enrolled.filter(function (row) { return !attributedLead(row); });
    var organicOfflineEnrolled = enrolled.filter(function (row) {
      var channel = outcomeChannel(row);
      return channel === "Organic" || channel === "Offline / referral" || channel === "No tracked inquiry";
    });

    var handoff = leads.filter(function (leadRow) { return !leadRow.sharedKey; });
    var noStatusYet = leads.filter(function (leadRow) { return leadRow.sharedKey && !outcomesForKey(leadRow.sharedKey).length; });
    var factsWithoutLead = outcomeRows.filter(function (row) { return !attributedLead(row); });
    var siblings = outcomeRows.filter(function (row) { return row.sibling; });

    var campusOrder = ["Maple Ridge", "Harbor View", "Cedar Falls", "Online"];
    var byCampus = campusOrder.map(function (campus) {
      var campusLeads = leads.filter(function (row) { return campus === "Online" ? row.mode === "online" : row.campus === campus; });
      var campusOutcomes = outcomeRows.filter(function (row) { return campus === "Online" ? row.mode === "online" : row.campus === campus; });
      var campusCampaigns = visibleCampaigns.filter(function (campaign) {
        return campus === "Online" ? campaign.mode === "online" : campaign.campus === campus;
      });
      var campusSpend = spendUnallocated && campus === "Online"
        ? null
        : campusCampaigns.reduce(function (sum, campaign) { return sum + campaignSpend(campaign, range); }, 0);
      var stats = rollup(campusLeads, campusOutcomes, campusSpend || 0, campusSpend != null);
      stats.campus = campus;
      return stats;
    });

    var channelOrder = ["Google Ads", "Meta Ads", "Organic", "Offline / referral", "No tracked inquiry"];
    var byChannel = channelOrder.map(function (channel) {
      var channelLeads = leads.filter(function (row) { return row.channel === channel; });
      var channelOutcomes = outcomeRows.filter(function (row) { return outcomeChannel(row) === channel; });
      var channelCampaigns = visibleCampaigns.filter(function (campaign) { return campaign.channel === channel; });
      var known = !spendUnallocated && (channel === "Google Ads" || channel === "Meta Ads");
      var channelSpend = known
        ? channelCampaigns.reduce(function (sum, campaign) { return sum + campaignSpend(campaign, range); }, 0)
        : null;
      var stats = rollup(channelLeads, channelOutcomes, channelSpend || 0, known);
      stats.channel = channel;
      return stats;
    });

    var campaignRows = visibleCampaigns.map(function (campaign) {
      var campaignLeads = leads.filter(function (row) { return row.campaignId === campaign.id; });
      var campaignOutcomes = outcomeRows.filter(function (row) {
        var leadRow = attributedLead(row);
        return !!(leadRow && leadRow.campaignId === campaign.id);
      });
      var spend = spendUnallocated ? null : campaignSpend(campaign, range);
      var stats = rollup(campaignLeads, campaignOutcomes, spend || 0, spend != null);
      stats.campaign = campaign;
      stats.leadRows = campaignLeads;
      stats.outcomeRows = campaignOutcomes;
      return stats;
    });

    var paidLeads = leads.filter(function (row) { return row.channel === "Google Ads" || row.channel === "Meta Ads"; });

    return {
      range: range,
      filters: filters,
      spendUnallocated: spendUnallocated,
      leads: leads,
      outcomes: outcomeRows,
      spend: paidSpend,
      spendKnown: !spendUnallocated && (filters.channel === "all" || filters.channel === "Google Ads" || filters.channel === "Meta Ads"),
      costPerInquiry: !spendUnallocated && paidLeads.length ? paidSpend / paidLeads.length : null,
      costPerEnrollment: !spendUnallocated && paidEnrolled.length ? paidSpend / paidEnrolled.length : null,
      funnel: {
        leads: leads.length,
        distinctKeys: Object.keys(distinctKeys).length,
        applications: applications.length,
        accepted: accepted.length,
        enrolled: enrolled.length,
        paidEnrolled: paidEnrolled.length,
        enrolledNoInquiry: enrolledNoInquiry.length,
        organicOfflineEnrolled: organicOfflineEnrolled.length
      },
      handoff: handoff,
      noStatusYet: noStatusYet,
      factsWithoutLead: factsWithoutLead,
      siblings: siblings,
      byCampus: byCampus,
      byChannel: byChannel,
      campaigns: campaignRows,
      paidEnrolled: paidEnrolled,
      feedback: buildFeedback(leads, outcomeRows, options)
    };
  }

  var GIVEN = ["Avery", "Jordan", "Riley", "Cameron", "Harper", "Quinn", "Skyler", "Rowan", "Parker", "Reese", "Elliot", "Morgan", "Sawyer", "Finley", "Dakota"];
  var FAMILY = ["Nguyen", "Patel", "Brooks", "Diaz", "Kim", "Owens", "Shah", "Bennett", "Cruz", "Walsh", "Ibrahim", "Cohen", "Park", "Reyes", "Hughes"];
  var STUDENT = ["Mina", "Leo", "Noor", "Sam", "Hana", "Jules", "Ari", "Nico", "Priya", "Owen", "Lila", "Mateo", "Sasha", "Imani", "Theo"];
  var GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  inquiries.forEach(function (row, index) {
    var given = GIVEN[index % GIVEN.length];
    var family = FAMILY[Math.floor(index / GIVEN.length)];
    var two = index < 10 ? "0" + index : String(index);
    row.guardian = given + " " + family;
    row.phone = "(555) 01" + two;
    row.email = given.toLowerCase() + "." + family.toLowerCase() + "@example.com";
    row.student = STUDENT[index % STUDENT.length];
    row.grade = GRADES[index % GRADES.length];
  });

  function validate() {
    var errors = [];
    var leadIds = {};
    var clickIds = {};
    var outcomeIds = {};
    var blob = JSON.stringify({ inquiries: inquiries, outcomes: outcomes, campaigns: campaigns });
    (blob.match(/@[A-Za-z0-9.-]+/g) || []).forEach(function (at) {
      if (at !== "@example.com") errors.push("Unexpected address " + at);
    });
    ["firstName", "lastName", "childName", "studentName"].forEach(function (key) {
      if (blob.indexOf('"' + key + '"') !== -1) errors.push("Unexpected field " + key);
    });

    inquiries.forEach(function (leadRow) {
      if (leadIds[leadRow.id]) errors.push("Duplicate lead " + leadRow.id);
      leadIds[leadRow.id] = true;
      if (leadRow.personFields !== "fictional") errors.push("Person fields not fictional on " + leadRow.id);
      if (!/^\(555\) 01\d\d$/.test(leadRow.phone)) errors.push("Phone out of reserved range " + leadRow.id);
      if (!/@example\.com$/.test(leadRow.email)) errors.push("Email domain " + leadRow.id);
      if (leadRow.tracker !== "WhatConverts") errors.push("Tracker drifted on " + leadRow.id);
      if (leadRow.campaignId && !campaignById(leadRow.campaignId)) errors.push("Missing campaign " + leadRow.campaignId);
      if (!leadRow.campaignId && (leadRow.channel === "Google Ads" || leadRow.channel === "Meta Ads")) errors.push("Paid lead missing campaign " + leadRow.id);
      if (leadRow.clickId) {
        if (leadRow.channel !== "Google Ads" || leadRow.clickId.indexOf("sample-gclid-") !== 0) errors.push("Bad click id " + leadRow.id);
        if (clickIds[leadRow.clickId]) errors.push("Duplicate click id " + leadRow.clickId);
        clickIds[leadRow.clickId] = true;
      }
      if (leadRow.metaClickId) {
        if (leadRow.channel !== "Meta Ads" || leadRow.metaClickId.indexOf("sample-fbclid-") !== 0) errors.push("Bad meta click " + leadRow.id);
      }
      if (leadRow.channel !== "Google Ads" && leadRow.clickId) errors.push("Non-google click " + leadRow.id);
      if (leadRow.channel !== "Meta Ads" && leadRow.metaClickId) errors.push("Non-meta click " + leadRow.id);
      if (leadRow.mode === "online" && leadRow.eligible === true && ELIGIBLE_STATES.indexOf(leadRow.state) === -1) errors.push("Eligible state mismatch " + leadRow.id);
      if (leadRow.mode === "online" && leadRow.eligible === false && ELIGIBLE_STATES.indexOf(leadRow.state) !== -1) errors.push("Ineligible state mismatch " + leadRow.id);
      if (leadRow.aiScore != null || leadRow.score != null) errors.push("Score field on " + leadRow.id);
    });

    outcomes.forEach(function (row) {
      if (outcomeIds[row.id]) errors.push("Duplicate outcome " + row.id);
      outcomeIds[row.id] = true;
      if (row.schoolApproved !== true) errors.push("Outcome missing school approval " + row.id);
      if (row.sourceSystem !== "FACTS sample export") errors.push("Outcome source drifted " + row.id);
      if (row.milestones.enrolled && (!row.milestones.application || !row.milestones.qualified)) errors.push("Enrolled milestones " + row.id);
      if (row.status === "Enrolled" && !row.milestones.enrolled) errors.push("Status enrolled flag " + row.id);
      if (row.status !== "Enrolled" && row.milestones.enrolled) errors.push("Flag enrolled status " + row.id);
      if (row.status === "Admissions qualified" && (row.milestones.application || row.milestones.enrolled || !row.milestones.qualified)) errors.push("Qualified-only row " + row.id);
      if (row.sibling && row.milestones.enrolled) errors.push("Sibling counted as enrolled " + row.id);
      if (row.sharedKey && row.origin !== "from-inquiry") errors.push("Origin drift " + row.id);
      if (!row.sharedKey && row.origin === "from-inquiry") errors.push("Unlinked origin " + row.id);
      if (row.origin === "from-inquiry" && !leadsForKey(row.sharedKey).length) errors.push("Dangling key " + row.sharedKey);
      if (row.aiScore != null || row.score != null) errors.push("Score field on " + row.id);
    });

    if (errors.length) throw new Error(errors.join("\n"));
  }

  validate();

  return {
    ELIGIBLE_STATES: ELIGIBLE_STATES,
    SAMPLE_AS_OF: SAMPLE_AS_OF,
    DATE_RANGES: DATE_RANGES,
    SAMPLE_VALUES: SAMPLE_VALUES,
    WITHHELD: WITHHELD,
    PAYLOAD_KEYS: PAYLOAD_KEYS,
    campaigns: campaigns,
    inquiries: inquiries,
    outcomes: outcomes,
    compute: compute,
    defaultFeedbackOptions: defaultFeedbackOptions,
    attributedLead: attributedLead,
    outcomeChannel: outcomeChannel,
    leadMatchLabel: leadMatchLabel,
    leadsForKey: leadsForKey,
    outcomesForKey: outcomesForKey,
    campaignById: campaignById,
    validate: validate
  };
});
