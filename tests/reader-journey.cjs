'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('index.html');
const hub = read('tangled-triangle/index.html');
const essay = read('forays/003-tangled-triangle.html');

assert(home.includes('href="tangled-triangle/index.html"'));
assert(home.includes('href="forays/003-tangled-triangle.html#first-try"'));
assert.equal((home.match(/class="enquiry-heading"/g) || []).length, 2);
assert(hub.includes('Plan View') && hub.includes('Section View'));
assert(essay.includes('id="first-try"') && essay.includes('id="construction-notes"'));
assert(essay.includes('Non-negative means every declared local rule agrees'));
for (const html of [home, hub, essay]) {
  for (const route of ['side-projects.html', 'library.html']) {
    assert(html.includes(`href="https://lawrencerowland.github.io/${route}"`));
  }
}

// Execute the unchanged production model with a small DOM probe. The guide's
// comparison must agree with the actual preset handlers, selection and margins.
class Element {
  constructor() { this.attributes = {}; this.listeners = {}; this.children = []; this.value = ''; this.textContent = ''; this.dataset = {};
    this.classList = { toggle: (name, value) => {
      const classes = new Set((this.attributes.class || '').split(' ').filter(Boolean));
      if (value) classes.add(name); else classes.delete(name);
      this.attributes.class = [...classes].join(' ');
    } };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  appendChild(child) { this.children.push(child); }
}
const nodes = new Map();
const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
for (const name of ['road', 'canal', 'rail', 'power', 'mine']) {
  const tag = essay.match(new RegExp(`<input id="${name}-buffer"[^>]*>`))[0];
  get(`${name}-buffer`).value = tag.match(/\bvalue="(\d+)"/)[1];
}
const presets = ['balanced', 'rail', 'power', 'mine', 'blocked'].map(name => {
  const button = new Element(); button.dataset.preset = name; return button;
});
const margins = Array.from({length: 5}, () => new Element());
const document = {
  getElementById: get,
  createElementNS: () => new Element(),
  querySelectorAll(selector) {
    if (selector === '[data-preset]') return presets;
    if (selector === '#margin-list dd') return margins;
    throw new Error('Unrecognised selector: ' + selector);
  }
};
vm.runInNewContext(read('assets/tangled-triangle.js'), {document});
const press = name => presets.find(button => button.dataset.preset === name).listeners.click();
const result = () => ({count: get('viable-count').textContent, best: get('best-margin').textContent, selected: get('selection-title').textContent});
const balanced = {count: '91', best: '+44 units', selected: 'Candidate (228, 456)'};
assert.equal(get('candidate-layer').children.length, 462);
assert.deepEqual(result(), balanced);
press('balanced');
assert.deepEqual(result(), balanced);
press('blocked');
assert.deepEqual(result(), {count: '0', best: '-11 units', selected: 'Candidate (196, 456)'});
assert.deepEqual(margins.map(item => item.textContent), ['+1 units', '-11 units', '+138 units', '+134 units', '+1 units']);
assert.equal(get('selection-lede').textContent, 'This assignment is obstructed by Canal.');
assert.equal(presets.find(button => button.dataset.preset === 'blocked').attributes['aria-pressed'], 'true');
press('balanced');
assert.deepEqual(result(), balanced);
// The selection control in the guide remains keyboard-operable.
const sample = get('candidate-layer').children[0];
let prevented = false;
sample.listeners.keydown({key: 'Enter', preventDefault() { prevented = true; }});
assert(prevented);
assert.equal(get('selection-title').textContent, `Candidate (${sample.attributes.cx}, ${sample.attributes.cy})`);
console.log('PASS: two enquiry entrances, estate returns, source/limits targets; 462 production grid points; Balanced 91/+44 → No global fit 0/−11 with Canal −11 → Balanced; keyboard candidate selection.');
