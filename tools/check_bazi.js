/* Checks the four-pillars computation against values generated from sxtwl.
 *
 * Run: node tools/check_bazi.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const JIE_BRANCH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
const JIE_NAME = ['小寒', '立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪'];

function loadSite() {
  const sandbox = { console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const file of ['bazi-data.js', 'bazi.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox, { filename: file });
  }
  return sandbox;
}

let failures = 0;
function check(name, actual, expected) {
  if (actual === expected) return;
  failures++;
  if (failures <= 12) console.log(`  FAIL ${name}\n    expected ${expected}\n    actual   ${actual}`);
}

const site = loadSite();
const compute = site.HanziBazi.compute;
const ZODIAC = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

// 1. Browser data must be identical to the JSON source of truth.
const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'bazi-data.json'), 'utf8'));
const js = site.HANZI_BAZI;
check('data version', js.version, json.version);
check('epoch day ganzhi', js.epochDayGz, json.epochDayGz);
check('year count', Object.keys(js.jie).length, 201);
check('data parity', JSON.stringify(js), JSON.stringify(json));

for (const year of Object.keys(json.jie)) {
  const row = json.jie[year];
  if (row.length !== 12) { failures++; console.log(`  FAIL ${year} has ${row.length} terms`); }
  for (const compact of row) {
    if (!/^\d{8}$/.test(compact)) { failures++; console.log(`  FAIL ${year} bad term ${compact}`); }
  }
}

// 2. Day-level vectors: compare every pillar against sxtwl's answer.
const vectors = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'bazi-vectors.json'), 'utf8'));
let compared = 0;

for (const c of vectors.cases) {
  const r = compute({ year: c.y, month: c.m, day: c.d, hour: c.h, minute: c.mi });
  const where = `${c.y}-${c.m}-${c.d} ${c.h}:${c.mi}`;
  check(`${where} year`, charOf(r.year), pairOf(c.year));
  check(`${where} month`, charOf(r.month), pairOf(c.month));
  check(`${where} day`, charOf(r.day), pairOf(c.day));
  check(`${where} hour`, charOf(r.hour), pairOf(c.hour));
  const branchIndex = BRANCHES.indexOf(r.day.branch);
  check(`${where} day branch feeds zodiac`, ZODIAC[branchIndex] !== undefined, true);
  compared++;
}

function pairOf(pair) { return STEMS[pair[0]] + BRANCHES[pair[1]]; }
function charOf(pillar) { return pillar.stem + pillar.branch; }

// 3. Boundary behaviour: the month must switch exactly at the 节 moment,
//    and the year exactly at 立春.
for (const b of vectors.boundaries) {
  const r = compute({ year: b.y, month: b.m, day: b.d, hour: b.h, minute: b.mi });
  const where = `${b.term} ${b.year} ${b.side} (${b.y}-${b.m}-${b.d} ${b.h}:${b.mi})`;
  const expectedBranch = b.side === 'after'
    ? JIE_BRANCH[b.idx]
    : (JIE_BRANCH[b.idx] + 11) % 12;
  check(`${where} month branch`, r.month.branch, BRANCHES[expectedBranch]);
  if (b.idx === 1) { // 立春
    check(`${where} year pillar`, r.pillarYear, b.side === 'after' ? b.year : b.year - 1);
  }
  compared++;
}

// 4. Unknown birth time: hour pillar is absent, not invented.
const noHour = compute({ year: 1990, month: 6, day: 15, hour: null });
check('no hour pillar', noHour.hour, null);
check('no hour still counts six characters', Object.values(noHour.elements).reduce((a, b) => a + b, 0), 6);

// 5. Out of range must fail loudly rather than silently produce a wrong chart.
let threw = false;
try { compute({ year: 1850, month: 1, day: 1, hour: 12 }); } catch (e) { threw = true; }
check('out of range throws', threw, true);

if (failures) {
  console.log(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log(`PASS four pillars: ${vectors.cases.length} dated vectors, ${vectors.boundaries.length} boundary cases, data parity`);
