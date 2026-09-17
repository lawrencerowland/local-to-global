'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual binding and refresh functions with DOM/event stubs.
// The renderer probes observe state at draw time, so a later state update
// cannot hide a one-input-event lag in the SVGs or the readout.
const source = process.argv[2] || path.join(__dirname, '../tangled-triangle/interface_topology_sketch_v0.html');
const html = fs.readFileSync(source, 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].at(-1)[1];
new vm.Script(script, {filename: source});
const stateSource = script.slice(script.indexOf('const state ='), script.indexOf('const planSvg ='));
const bindingSource = script.slice(script.indexOf('// Wire controls'), script.indexOf('// init'));
assert.ok(stateSource.includes('section:') && bindingSource.includes('function refresh()'));

const ranges = [
  ['bufCanal', 'canal', 'buffers', 0], ['bufRoad', 'road', 'buffers', 0],
  ['bufRail', 'rail', 'buffers', 0], ['ohlHalf', 'ohlHalf', 'buffers', 0],
  ['mineInf', 'mineInf', 'buffers', 0], ['hRoad', 'hRoad', 'section', 1],
  ['hRail', 'hRail', 'section', 1], ['hOhl', 'hOhl', 'section', 1],
  ['dMine', 'dMine', 'section', 1], ['dCanal', 'dCanal', 'section', 1]
];
const nodes = new Map();
let active = null, events = [], context;
function node(id) {
  if (!nodes.has(id)) {
    const listeners = new Map();
    let text = '';
    nodes.set(id, {
      value: '', step: '1', checked: true, listeners,
      addEventListener(type, handler) {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(handler);
      },
      setAttribute() {},
      get textContent() { return text; },
      set textContent(value) {
        text = value;
        if (active && id === active.id + 'Val') {
          assert.equal(context.readState()[active.group][active.key], active.value,
            `${active.id}: label updated before the model state`);
          events.push('label');
        }
      }
    });
  }
  return nodes.get(id);
}
const rangeAttrs = new Map();
for (const [tag] of html.matchAll(/<input\b[^>]*>/gi)) {
  const attrs = Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
  if (attrs.type !== 'range') continue;
  rangeAttrs.set(attrs.id, attrs);
  Object.assign(node(attrs.id), {value: attrs.value, step: attrs.step});
}
assert.deepEqual([...rangeAttrs.keys()].sort(), ranges.map(([id]) => id).sort(), 'Every range must be exercised');
function drawn(name) {
  if (active) {
    assert.equal(context.readState()[active.group][active.key], active.value,
      `${active.id}: ${name} saw stale state`);
    assert.equal(node(active.id + 'Val').textContent, active.value.toFixed(active.decimals) + 'm',
      `${active.id}: ${name} saw a stale label`);
  }
  events.push(name);
}
context = {document: {getElementById: node}, drawPlan: () => drawn('plan'),
  drawSection: () => drawn('section'), updateDominance: () => drawn('readout'),
  setCut() {}, downloadSvg() {}, planSvg: {}, sectionSvg: {}};
vm.createContext(context);
vm.runInContext(stateSource + '\n' + bindingSource + '\nglobalThis.readState = () => state; bind();', context);
assert.deepEqual(events, [], 'Binding must not trigger a partial redraw');
context.refresh();
assert.deepEqual(events, ['plan', 'section', 'readout']);

let inputs = 0;
for (const [id, key, group, decimals] of ranges) {
  const attrs = rangeAttrs.get(id), input = node(id);
  const values = [id === 'hOhl' ? 32 : Number(attrs.value) + Number(attrs.step), Number(attrs.min), Number(attrs.max)];
  for (const value of values) {
    active = {id, key, group, decimals, value};
    events = [];
    input.value = String(value);
    for (const listener of input.listeners.get('input') || []) listener({target: input});
    assert.deepEqual(events, ['label', 'plan', 'section', 'readout'],
      `${id}: each event must update its label, then draw each view once`);
    inputs++;
  }
  assert.equal(input.listeners.get('input').length, 1, `${id}: a single ordered input handler is required`);
}
console.log(`PASS: ${ranges.length} sliders, ${inputs} input events; state then label then one plan/section/readout refresh, including OHL 28 → 32.`);
