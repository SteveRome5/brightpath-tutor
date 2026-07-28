// AP blueprint coverage report (informational + guards against empty marketed courses).
// Prints official format vs Gallop's live practice coverage and any gaps. Exits non-zero only if
// a marketed AP course has ZERO practice content (which would be a broken listing).
const content = require('../src/content');
const { AP_BLUEPRINTS } = require('../src/content/ap_blueprints');

let hardFail = [];
const tracks = content.listTracks();
console.log('AP EXAM COVERAGE (official format → Gallop practice available)\n');
for (const id of Object.keys(AP_BLUEPRINTS)) {
  const t = tracks.find(x => x.id === id);
  const mcq = t ? t.count : 0;
  const frq = content.frqCount(id);
  const bp = AP_BLUEPRINTS[id];
  const o = bp.official;
  console.log(`• ${id}  (${bp.examYear})`);
  console.log(`    Official: ${o.mcq} MCQ + ${o.frq} FRQ · ${Math.floor(o.timeMin/60)}h${o.timeMin%60}m`);
  console.log(`    Gallop:   ${mcq} practice MCQ + ${frq} free-response`);
  if (bp.gaps && bp.gaps.length) console.log(`    Gaps:     ${bp.gaps.length} (e.g. ${bp.gaps[0]})`);
  if (mcq === 0 || frq === 0) hardFail.push(`${id} has ${mcq} MCQ and ${frq} FRQ — a marketed AP course must have both.`);
  console.log('');
}
if (hardFail.length) { console.error('FAIL:\n  ' + hardFail.join('\n  ')); process.exit(1); }
console.log(`PASS: ${Object.keys(AP_BLUEPRINTS).length} AP courses each have practice MCQ + free-response. Gaps above are the authoring backlog (surfaced honestly in-app), not failures.`);
