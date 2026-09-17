(function () {
  'use strict';

  const script = document.currentScript;
  const root = new URL('../', script.src);
  const pages = [
    ['scope', 'Scope coherence', 'forays/001-scope-coherence.html'],
    ['director', 'Director view', 'forays/002-project-director.html'],
    ['triangle', 'Triangle compatibility', 'forays/003-tangled-triangle.html'],
    ['primer', 'Director primer', 'forays/004-director-primer.html'],
    ['validator', 'Patch validator', 'forays/006-validator/index.html'],
    ['blueprint', 'Blueprint picture', 'forays/007-blueprint-picture.html'],
    ['navigation', 'Navigation picture', 'forays/008-navigation-picture.html']
  ];

  const reviewNotes = {
    home: 'Two related lines of enquiry: early AI interpretation and later local-to-global compatibility. Their separate variants and essays remain available.',
    'triangle-enquiry': 'Exploratory AI interpretation variants, not an empirical AI benchmark. Geometry, assumptions and architecture proposals are illustrative, not engineering proof.',
    scope: 'Worked prototype. Inspect declared interface rules and compare fictional scenarios; compatibility is limited to these six interfaces and does not validate project outcomes.',
    director: 'Reviewed prototype. It checks declared local facts on selected overlaps; it does not certify a whole project or remove judgement.',
    triangle: 'Later compatibility enquiry. Geometry and clearance values are illustrative; the checker tests declared rules, not AI capability or engineering design.',
    primer: 'Reviewed teaching prototype. “Local truth” means a declared package fact in the toy model, not an independently verified fact.',
    validator: 'Reviewed code demo. Sample data and red/amber/green thresholds are illustrative; exported reports describe only this toy dataset.',
    blueprint: 'Picture essay. The generated image is a mnemonic, not a mathematical diagram or proof.',
    navigation: 'Picture essay. The generated image is a prompt for thinking about scale, not a formal local-to-global model.'
  };

  function addNavigation() {
    const current = document.body.dataset.ltgPage || 'home';
    const nav = document.createElement('nav');
    nav.className = 'ltg-site-nav';
    nav.setAttribute('aria-label', 'Local to Global enquiries');

    const inner = document.createElement('div');
    inner.className = 'ltg-site-nav__inner';
    const brand = document.createElement('div');
    brand.className = 'ltg-site-nav__brand';
    const home = document.createElement('a');
    home.href = new URL('index.html', root).href;
    home.textContent = 'Local to Global';
    const descriptor = document.createElement('span');
    descriptor.textContent = 'Two lines of enquiry · separate variants and essays';
    brand.append(home, descriptor);

    const groups = document.createElement('div');
    groups.className = 'ltg-site-nav__groups';
    const ai = document.createElement('div');
    ai.className = 'ltg-site-nav__group';
    const aiLabel = document.createElement('span');
    aiLabel.className = 'ltg-site-nav__label';
    aiLabel.textContent = '1 · AI interpretation';
    const aiTabs = document.createElement('div');
    aiTabs.className = 'ltg-site-nav__tabs';
    const aiLink = document.createElement('a');
    aiLink.href = new URL('tangled-triangle/index.html', root).href;
    aiLink.textContent = 'Tangled Triangle · six variants';
    if (current === 'triangle-enquiry') aiLink.setAttribute('aria-current', 'page');
    aiTabs.appendChild(aiLink);
    ai.append(aiLabel, aiTabs);

    const composition = document.createElement('div');
    composition.className = 'ltg-site-nav__group';
    const compositionLabel = document.createElement('a');
    compositionLabel.className = 'ltg-site-nav__label';
    compositionLabel.href = new URL('index.html#compatibility', root).href;
    compositionLabel.textContent = '2 · Compatibility & composition';
    const tabs = document.createElement('div');
    tabs.className = 'ltg-site-nav__tabs';
    pages.forEach(([id, label, path]) => {
      const link = document.createElement('a');
      link.href = new URL(path, root).href;
      link.textContent = label;
      if (id === current) link.setAttribute('aria-current', 'page');
      tabs.appendChild(link);
    });

    composition.append(compositionLabel, tabs);
    groups.append(ai, composition);
    inner.append(brand, groups);
    nav.appendChild(inner);
    document.body.prepend(nav);

    const note = document.createElement('p');
    note.className = 'ltg-review-note';
    const label = document.createElement('strong');
    label.textContent = 'Status: ';
    note.append(label, document.createTextNode(reviewNotes[current] || (current.startsWith('triangle-ai-') ? reviewNotes['triangle-enquiry'] : reviewNotes.home)));
    nav.insertAdjacentElement('afterend', note);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNavigation, { once: true });
  } else {
    addNavigation();
  }
})();
