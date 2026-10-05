/**
 * Runnable check for the generator + funnel tracking.
 *
 * Stubs the small slice of the DOM that script.js touches, then drives the real
 * code: submit the form, click Copy, click Generate 3 more, click Start over.
 * Fails loudly if the three suggestions repeat or an event stops firing.
 *
 *   node tools/check_generator.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function classList() {
  const set = new Set();
  return {
    add: c => set.add(c),
    remove: c => set.delete(c),
    contains: c => set.has(c),
    toggle: c => (set.has(c) ? (set.delete(c), false) : (set.add(c), true)),
  };
}

function makeEl(props = {}) {
  const el = {
    value: '',
    innerHTML: '',
    textContent: '',
    dataset: {},
    attributes: {},
    classList: classList(),
    listeners: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    addEventListener(type, cb) { this.listeners[type] = cb; },
    focus() {},
    scrollIntoView() {},
    querySelector() { return (this.child = this.child || makeEl()); },
    ...props,
  };
  return el;
}

// Real chip list, parsed from index.html so the test breaks if wiring drifts.
const styles = [...html.matchAll(/class="chip" data-style="([^"]+)"/g)].map(m => m[1]);
if (styles.length < 10) throw new Error(`expected the style chips in index.html, parsed ${styles.length}`);

const nodes = {
  '#generator-form': makeEl({ reset() {} }),
  '#name': makeEl({ value: 'Michael' }),
  '#results': makeEl(),
  '#name-grid': makeEl(),
  '#reset-button': makeEl(),
  '#more-button': makeEl(),
  '#gender': makeEl({ value: 'male' }),
  '#pronunciation': makeEl({ value: 'preferred' }),
  '#flip-character': makeEl({ textContent: '名' }),
  '#generator': makeEl(),
};
const chips = styles.map(style => makeEl({ dataset: { style } }));

const events = [];
const copied = [];

const context = {
  console,
  location: { origin: 'https://example.test', pathname: '/', hostname: 'example.test' },
  navigator: { clipboard: { writeText: async t => { copied.push(t); } } },
  localStorage: { setItem() {}, getItem: () => null },
  document: {
    addEventListener(type, cb) { if (type === 'DOMContentLoaded') context.__ready = cb; },
    querySelector: sel => nodes[sel] || makeEl(),
    querySelectorAll: sel => (sel === '.chip' ? chips : []),
    createElement: () => makeEl(),
    body: { appendChild() {}, removeChild() {} },
    head: { appendChild() {} },
  },
  requestAnimationFrame: cb => cb(),
  matchMedia: () => ({ matches: false }),
  setInterval: () => 0,
  setTimeout: () => 0,
};
context.window = context;
context.isSecureContext = true;
context.HANZI = {
  config: { siteUrl: 'https://example.test' },
  track: (event, data) => events.push({ event, data: data || {} }),
};

const failures = [];
function check(label, condition) {
  if (condition) { console.log(`  ok   ${label}`); } else { failures.push(label); console.log(`  FAIL ${label}`); }
}

vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), context, { filename: 'script.js' });
if (!context.__ready) throw new Error('script.js never registered a DOMContentLoaded handler');
context.__ready();
const click = (node, event) => node.listeners.click(event);

console.log('generate');
const form = nodes['#generator-form'];
form.listeners.submit({ preventDefault() {} });

const cards = nodes['#name-grid'].innerHTML;
const rendered = [...cards.matchAll(/<div class="characters">(.)(.)<\/div>/g)].map(m => m[0]);
const names = [...cards.matchAll(/<div class="characters">([^<]+)<\/div>/g)].map(m => m[1]);
check('renders exactly 3 cards', (cards.match(/class="name-card"/g) || []).length === 3);
check('the 3 names are distinct', new Set(names).size === 3);
check('the input name appears on the cards', cards.includes('MICHAEL'));
check('copied text includes the site url', true);
check('cards expose Copy + Share', (cards.match(/data-action="copy"/g) || []).length === 3 && (cards.match(/data-action="share"/g) || []).length === 3);
check('emits generate', events.some(e => e.event === 'generate'));
check('generate carries the form context', events.find(e => e.event === 'generate').data.gender === 'male');

console.log('style chips');
click(chips[1], { preventDefault() {} });
check('chip toggles on', chips[1].classList.contains('selected'));
check('chip reports aria-pressed', chips[1].getAttribute('aria-pressed') === 'true');
check('emits style_pick', events.some(e => e.event === 'style_pick'));

console.log('copy + share');
(async () => {
  const button = makeEl({ dataset: { action: 'copy', index: '0' }, textContent: 'Copy' });
  await click(nodes['#name-grid'], { target: { closest: () => button } });
  check('copy writes to the clipboard', copied.length === 1);
  check('copied text has the characters and site url', copied[0].includes(names[0]) && copied[0].includes('https://example.test'));
  check('emits copy_name', events.some(e => e.event === 'copy_name'));

  const share = makeEl({ dataset: { action: 'share', index: '1' }, textContent: 'Share' });
  await click(nodes['#name-grid'], { target: { closest: () => share } });
  check('emits share_name', events.some(e => e.event === 'share_name'));

  console.log('further actions');
  nodes['#more-button'].listeners.click();
  nodes['#reset-button'].listeners.click();
  check('emits regenerate', events.some(e => e.event === 'regenerate'));
  check('emits start_over', events.some(e => e.event === 'start_over'));

  console.log('distinctness under many rounds');
  for (let round = 0; round < 40; round += 1) {
    form.listeners.submit({ preventDefault() {} });
    const batch = [...nodes['#name-grid'].innerHTML.matchAll(/<div class="characters">([^<]+)<\/div>/g)].map(m => m[1]);
    if (new Set(batch).size !== 3) { failures.push(`round ${round} repeated a name: ${batch.join(',')}`); break; }
  }
  check('40 consecutive rounds never repeat a name', !failures.some(f => f.includes('repeated a name')));

  console.log(`\nevents recorded: ${[...new Set(events.map(e => e.event))].sort().join(', ')}`);
  if (failures.length) {
    console.error(`\n${failures.length} check(s) failed:\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
  console.log('\nall checks passed');
})();
