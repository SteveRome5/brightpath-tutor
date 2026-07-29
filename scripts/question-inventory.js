#!/usr/bin/env node
// Reproducible inventory of Gallop's authored, standards-aligned question banks.
// Substantiates the "5,000+ standards-aligned questions" marketing claim (LAUNCH-004).
// Counts distinct AUTHORED items in each src/content/*_banks.js file (procedurally
// generated practice built on top of these is additional and unbounded).
//   Run:  node scripts/question-inventory.js
const fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '..', 'src', 'content');
let authored = 0, skillBanks = 0; const byFile = {};
for (const f of fs.readdirSync(dir).filter(f => /_banks\.js$/.test(f))) {
  const m = require(path.join(dir, f)); let n = 0, k = 0;
  for (const v of Object.values(m)) if (Array.isArray(v)) { n += v.length; k++; }
  byFile[f] = { questions: n, skillBanks: k }; authored += n; skillBanks += k;
}
const content = require(path.join(dir));
const subj = {}; let skills = 0;
for (const s of ['math', 'english', 'science', 'spanish']) { const a = content.skillsForSubject(s).length; subj[s] = a; skills += a; }
let frqN = 0; try { for (const t of content.listTracks()) frqN += (t.frqCount || 0); } catch (e) {}
console.log('Gallop authored question inventory');
for (const [f, v] of Object.entries(byFile)) console.log(`  ${f.padEnd(22)} ${String(v.questions).padStart(5)} questions  (${v.skillBanks} skill-banks)`);
console.log('  ' + '-'.repeat(48));
console.log(`  Authored bank questions:      ${authored} across ${skillBanks} skill-banks`);
console.log(`  AP free-response prompts:     ${frqN}`);
console.log(`  Standards-aligned total:      ${authored + frqN}  ("5,000+" claim: ${authored + frqN >= 5000 ? 'SUBSTANTIATED' : 'NOT MET'})`);
console.log(`  Curriculum skills (K-12 x4):  ${skills}  ${JSON.stringify(subj)}`);
