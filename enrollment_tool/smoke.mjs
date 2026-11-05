import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const demo = require("./fixtures.js");
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "index.html"), "utf8");
const app = readFileSync(join(here, "app.js"), "utf8");
const fixtures = readFileSync(join(here, "fixtures.js"), "utf8");
const copy = html + app + fixtures;

demo.validate();

const all = demo.compute(
  { campus: "all", geography: "all", date: "window", channel: "all" },
  demo.defaultFeedbackOptions()
);

assert.equal(demo.inquiries.length, 43);
assert.equal(demo.outcomes.length, 37);
assert.equal(demo.DATE_RANGES.d30.start, "2026-10-02");
assert.equal(demo.DATE_RANGES.d30.end, "2026-10-31");
assert.equal(demo.DATE_RANGES.d60.start, "2026-09-02");
assert.equal(demo.DATE_RANGES.d90.start, "2026-08-03");
assert.equal(demo.SAMPLE_AS_OF, "2026-10-31");

for (const id of ["d30", "d60", "d90"]) {
  const slice = demo.compute(
    { campus: "Maple Ridge", geography: "all", date: id, channel: "all" },
    demo.defaultFeedbackOptions()
  );
  const range = demo.DATE_RANGES[id];
  assert.ok(slice.funnel.leads > 0, id + " leads empty");
  assert.ok(slice.leads.every((lead) => lead.date >= range.start && lead.date <= range.end));
  assert.ok(slice.outcomes.every((row) => row.date >= range.start && row.date <= range.end));
}

const last30 = demo.compute(
  { campus: "all", geography: "all", date: "d30", channel: "all" },
  demo.defaultFeedbackOptions()
);
const last60 = demo.compute(
  { campus: "all", geography: "all", date: "d60", channel: "all" },
  demo.defaultFeedbackOptions()
);
const last90 = demo.compute(
  { campus: "all", geography: "all", date: "d90", channel: "all" },
  demo.defaultFeedbackOptions()
);
assert.ok(last30.funnel.leads < last60.funnel.leads);
assert.ok(last60.funnel.leads < last90.funnel.leads);
assert.ok(last90.funnel.leads <= all.funnel.leads);
assert.equal(last30.leads.some((lead) => lead.id === "WC-1003"), false);
assert.equal(last30.outcomes.some((row) => row.id === "APP-5003"), true);

assert.equal(all.funnel.leads, 43);
assert.equal(all.funnel.enrolled, 16);
assert.equal(all.funnel.paidEnrolled, 11);
assert.equal(all.spend, 63700);
assert.equal(all.costPerEnrollment, 63700 / 11);
assert.equal(Math.round(all.costPerEnrollment), 5791);
assert.equal(all.funnel.organicOfflineEnrolled, 5);

const august = demo.compute(
  { campus: "all", geography: "all", date: "aug", channel: "all" },
  demo.defaultFeedbackOptions()
);
assert.equal(august.spend, 18900);
assert.equal(august.funnel.paidEnrolled, 1);
assert.ok(august.funnel.leads < 43);
assert.ok(august.leads.every((lead) => lead.date.startsWith("2026-08")));

const octoberMaple = demo.compute(
  { campus: "Maple Ridge", geography: "all", date: "oct", channel: "Google Ads" },
  demo.defaultFeedbackOptions()
);
assert.deepEqual(
  octoberMaple.leads.map((lead) => lead.id).sort(),
  ["WC-1006", "WC-1007", "WC-1008", "WC-1009", "WC-1042"]
);
assert.equal(octoberMaple.spend, 5100);
assert.equal(octoberMaple.funnel.paidEnrolled, 2);
assert.equal(octoberMaple.costPerEnrollment, 2550);

const enrollmentSignals = (result) =>
  result.feedback.records.filter((record) => record.sync === "eligible" && record.signal === "Enrollment");

const fullEnrollments = enrollmentSignals(all);
assert.deepEqual(
  fullEnrollments.map((record) => record.outcomeId).sort(),
  ["APP-5001", "APP-5003", "APP-5010", "APP-5013", "APP-5022", "APP-5023", "APP-5026", "APP-5028"]
);

const duplicate = fullEnrollments.find((record) => record.outcomeId === "APP-5003");
assert.equal(duplicate.shared.click_id, "sample-gclid-1003");
assert.deepEqual(duplicate.extraClickIds, ["sample-gclid-1042"]);
assert.equal(fullEnrollments.filter((record) => record.outcomeId === "APP-5003").length, 1);

for (const record of all.feedback.records.filter((row) => row.sync === "eligible")) {
  assert.deepEqual(Object.keys(record.shared).sort(), demo.PAYLOAD_KEYS.slice().sort());
  assert.equal(typeof record.shared.value, "number");
  assert.equal(record.schoolApproved, true);
  assert.equal(JSON.stringify(record.shared).includes("FAM-"), false);
  assert.equal(JSON.stringify(record.shared).includes("APP-"), false);
  const outcome = demo.outcomes.find((row) => row.id === record.outcomeId);
  const flag = { "Qualified inquiry": "qualified", Application: "application", Enrollment: "enrolled" }[record.signal];
  assert.equal(outcome.milestones[flag], true);
  assert.equal(record.shared.click_id.startsWith("sample-gclid-"), true);
}

assert.equal(
  all.feedback.records.some((record) => record.sync === "eligible" && record.outcomeId === "APP-5006"),
  false
);
assert.equal(
  all.feedback.records.some((record) => record.sync === "eligible" && record.outcomeId === "APP-5017"),
  false
);
assert.equal(
  all.feedback.records.some((record) => record.sync === "eligible" && record.outcomeId === "APP-5037"),
  false
);

const qualifiedOnly = all.feedback.records.filter((record) => record.outcomeId === "APP-5044" && record.sync === "eligible");
assert.deepEqual(qualifiedOnly.map((record) => record.signal), ["Qualified inquiry"]);

const unqualifiedApplication = all.feedback.records.filter((record) => record.outcomeId === "APP-5005" && record.sync === "eligible");
assert.deepEqual(unqualifiedApplication.map((record) => record.signal), ["Application"]);

const noClick = all.feedback.records.find((record) => record.outcomeId === "APP-5006");
assert.equal(noClick.sync, "unmatched");
assert.equal(noClick.shared, null);

const pending = all.feedback.records.find((record) => record.leadId === "WC-1009");
assert.equal(pending.sync, "pending");
assert.equal(pending.shared, null);

const handoff = all.feedback.records.find((record) => record.leadId === "WC-1008");
assert.equal(handoff.sync, "unmatched");
assert.equal(handoff.shared, null);

const outsideState = all.feedback.records.find((record) => record.leadId === "WC-1030");
assert.equal(outsideState.sync, "pending");
assert.equal(outsideState.shared, null);

const hidden = demo.compute(all.filters, {
  qualified: true,
  application: true,
  enrollment: false,
  clickSource: "landing-form"
});
assert.equal(enrollmentSignals(hidden).length, 0);
const stillQualified = hidden.feedback.records.find((record) => record.outcomeId === "APP-5001" && record.signal === "Qualified inquiry");
assert.equal(stillQualified.sync, "eligible");
assert.equal(stillQualified.shared.click_id, "sample-gclid-1001");
assert.match(stillQualified.clickSourceLabel, /landing-form/i);

const stateSlice = demo.compute(
  { campus: "Online", geography: "online-CA", date: "window", channel: "all" },
  demo.defaultFeedbackOptions()
);
assert.equal(stateSlice.spendUnallocated, true);
assert.equal(stateSlice.costPerEnrollment, null);
assert.ok(stateSlice.outcomes.every((row) => row.mode === "online" && row.state === "CA"));
assert.ok(stateSlice.leads.every((row) => row.mode === "online" && row.state === "CA"));

const empty = demo.compute(
  { campus: "Maple Ridge", geography: "online-CA", date: "window", channel: "all" },
  demo.defaultFeedbackOptions()
);
assert.equal(empty.funnel.leads, 0);
assert.equal(empty.funnel.enrolled, 0);

assert.equal(demo.outcomes.filter((row) => row.sibling && row.milestones.enrolled).length, 0);
assert.equal(all.siblings.length, 1);

assert.doesNotMatch(html, /Demo \/ Sample data — not actual school results/);
assert.doesNotMatch(html, /class="demo-banner"/);
assert.doesNotMatch(html, /sample for discussion/);
assert.doesNotMatch(html, /Demo session — no account required/);
assert.match(html, /id="goal"/);
assert.match(html, /id="path"/);
assert.match(html, /id="preview"/);
assert.match(html, /id="pilot"/);
assert.match(html, /id="feedback"/);
assert.equal(/pricing|per month|\$\d+\s*\/\s*mo/i.test(html + app), false);
assert.doesNotMatch(html, /<input[^>]*type=["']file["']/i);
assert.doesNotMatch(app, /<input[^>]*type=["']file["']/i);
assert.equal(copy.includes("WhatConverts cannot"), false);
assert.equal(copy.includes("WhatConverts can't"), false);
assert.equal(copy.includes("WhatConverts does not support"), false);
assert.match(html, /From ad clicks to filled seats\./);
assert.match(html, /Know which campaigns bring students through your doors\./);
assert.match(html, /Open workspace/);
assert.match(html, /byrd-middle-chromebooks\.jpg/);
assert.match(html, /pvusd-english-chromebooks\.jpg/);
assert.doesNotMatch(html, /adtoseat-hero\.jpg/);
assert.doesNotMatch(html, /adtoseat-journey\.jpg/);
assert.doesNotMatch(html, /Sample data/);
assert.doesNotMatch(html, /Fictional demo data/);
assert.doesNotMatch(html, /id="sample-info"/);
assert.match(html, /AdToSeat by Brandastic/);
assert.match(html, /aria-label="AdToSeat by Brandastic"/);
assert.match(html, /#school-demo/);
assert.doesNotMatch(html, /type="password"/);
assert.doesNotMatch(html, /View school demo/);
assert.doesNotMatch(html, /Open demo dashboard/);
const scope = readFileSync(join(here, "scope/index.html"), "utf8");
assert.match(scope, /AdToSeat shows which marketing campaigns actually fill school seats\./);
assert.match(scope, /Not built/);
assert.match(scope, /does not guess a confirmation/);
assert.match(scope, /inquiry, application, accepted, and enrolled/);
assert.match(scope, /No ROI calculator/);
assert.match(scope, /A live API is not part of this version/);
assert.match(scope, /does not say that integration is ready/);
assert.match(scope, /Manual entry, beside the CSV/);
assert.match(scope, /store Unknown/);
assert.match(scope, /Later: automatic updates from the school platform/);
assert.match(scope, /Subject to verified API access, permissions, and platform capabilities/);
assert.match(scope, /FACTS for Heart and Avela for CalOPS/);
assert.match(scope, /not a supported integration and it is not live/);
assert.match(scope, /is not decided until access is verified/);
assert.match(scope, /Overview, Leads, and Data/);
assert.match(scope, /does not turn that pair into a conversion rate/);
assert.match(scope, /sample timeline/);
assert.match(scope, /not a CRM/);
assert.doesNotMatch(scope, /class="demo-banner"/);
assert.match(app, /not a conversion rate/);
assert.match(scope, /not a WhatConverts timeline/);
assert.match(scope, /qualified, unqualified, or unknown/);
assert.equal(/roi calculator/i.test(html + app), false);
assert.equal(JSON.stringify({ inquiries: demo.inquiries, outcomes: demo.outcomes }).includes("aiScore"), false);

const sibling = demo.outcomes.find((row) => row.id === "APP-5001B");
assert.equal(all.paidEnrolled.some((row) => row.id === sibling.id), false);

console.log("smoke ok", {
  leads: all.funnel.leads,
  enrolled: all.funnel.enrolled,
  paidCpe: Math.round(all.costPerEnrollment),
  eligible: all.feedback.counts.eligible,
  pending: all.feedback.counts.pending,
  unmatched: all.feedback.counts.unmatched,
  notEligible: all.feedback.counts["not-eligible"]
});
