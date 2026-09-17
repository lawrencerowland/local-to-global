'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/tangled-triangle-migration.json'), 'utf8'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const inlineScripts = html => [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
const markup = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
const ids = html => [...markup(html).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const controls = html => markup(html).match(/<(?:button|input|select)\b[^>]*>/gi) || [];
const variants = manifest.variants;
assert.equal(variants.length, 6);
assert.equal(new Set(variants.map(item => item.file)).size, 6);
let scriptCount = 0;
for (const variant of variants) {
  const file = `tangled-triangle/${variant.file}`;
  const html = read(file);
  const scripts = inlineScripts(html);
  assert.deepEqual(scripts.map(sha), variant.inline_script_sha256, `${file}: imported behavior changed`);
  assert.deepEqual(controls(html), variant.control_tags, `${file}: lost or altered an original control`);
  for (const id of variant.original_ids) assert.ok(html.includes(`id="${id}"`), `${file}: missing original target ${id}`);
  assert.equal(ids(html).length, new Set(ids(html)).size, `${file}: duplicate static IDs`);
  for (const script of scripts) { new vm.Script(script, {filename: file}); scriptCount++; }
  assert.match(html, /data-ltg-enquiry="ai"/);
  assert.ok(html.includes('href="index.html"'), `${file}: no return to the six variants`);
  assert.ok(html.includes('href="../forays/003-tangled-triangle.html"'), `${file}: no link to later enquiry`);
  assert.ok(read('tangled-triangle/index.html').includes(`href="${variant.file}"`), `${file}: absent from hub`);
}

assert.ok(read('index.html').includes('href="tangled-triangle/index.html"'));
assert.ok(read('index.html').includes('id="compatibility"'));
assert.ok(read('forays/003-tangled-triangle.html').includes('href="../tangled-triangle/index.html"'));

// Follow actual local links and asset references, including fragments, from the
// landing, hub, imported pages and all existing essays. This catches route-depth
// mistakes that a copy or a source-only hash comparison would miss.
const htmlFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(path.join(root, directory), {withFileTypes: true})) {
    if (entry.name.startsWith('.')) continue;
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(relative);
    else if (relative.endsWith('.html')) htmlFiles.push(relative);
  }
}
walk('');
let links = 0;
for (const file of htmlFiles) {
  const html = read(file);
  for (const [, tag, attrs] of markup(html).matchAll(/<(a|link|script|img)\b([^>]+)>/gi)) {
    const target = attrs.match(/\b(?:href|src)=["']([^"']+)["']/i)?.[1];
    if (!target || /^(?:[a-z]+:|\/\/)/i.test(target)) continue;
    const url = new URL(target.replace(/&amp;/g, '&'), `https://example.test/${file}`);
    let destination = path.join(root, decodeURIComponent(url.pathname));
    if (destination.endsWith(path.sep)) destination += 'index.html';
    assert.ok(fs.existsSync(destination), `${file}: broken ${tag} target ${target}`);
    if (url.hash && destination.endsWith('.html')) {
      assert.ok(ids(fs.readFileSync(destination, 'utf8')).includes(decodeURIComponent(url.hash.slice(1))),
        `${file}: missing fragment ${target}`);
    }
    links++;
  }
  for (const [, src] of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)) {
    if (/^[a-z]+:/i.test(src)) continue;
    const resolved = path.resolve(root, path.dirname(file), src.split('?')[0]);
    assert.ok(fs.existsSync(resolved), `${file}: missing script ${src}`);
    new vm.Script(fs.readFileSync(resolved, 'utf8'), {filename: resolved});
  }
}

// Execute the shared navigation against a small DOM probe. Its root must come
// from the script URL, so nested variant/validator pages link to the same site.
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.append(child); }
  prepend(child) { this.children.unshift(child); }
  insertAdjacentElement(position, element) { this.after = element; }
}
function descendants(element) { return [element, ...element.children.flatMap(descendants)]; }
for (const current of ['home', 'triangle-enquiry', 'triangle-ai-1', 'triangle-ai-6', 'triangle', 'validator']) {
  const body = new Element('body'); body.dataset = {ltgPage: current};
  const document = {body, readyState: 'complete', currentScript: {src: 'https://example.test/local-to-global/assets/site-nav.js?v=20260917'},
    createElement: tag => new Element(tag), createTextNode: text => ({textContent: text, children: []})};
  vm.runInNewContext(read('assets/site-nav.js'), {document, URL});
  const nav = body.children[0];
  const nodes = descendants(nav);
  assert.equal(nav.attributes['aria-label'], 'Local to Global enquiries');
  assert.ok(nodes.some(node => node.textContent === '1 · AI interpretation'));
  assert.ok(nodes.some(node => node.textContent === '2 · Compatibility & composition'));
  const links = nodes.filter(node => node.tagName === 'a');
  assert.ok(links.some(link => link.href === 'https://example.test/local-to-global/tangled-triangle/index.html'));
  assert.ok(links.some(link => link.href === 'https://example.test/local-to-global/forays/003-tangled-triangle.html'));
  const active = links.filter(link => link.attributes['aria-current'] === 'page');
  assert.equal(active.length, ['triangle-enquiry', 'triangle', 'validator'].includes(current) ? 1 : 0);
  if (current.startsWith('triangle-ai-')) assert.match(nav.after.children[1].textContent, /not an empirical AI benchmark/);
}
console.log(`PASS: six variants, ${scriptCount} preserved behavior scripts, controls, reciprocal routes, ${links} local links/assets across ${htmlFiles.length} pages, and six navigation contexts.`);
