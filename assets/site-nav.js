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
    director: 'Prototype. It checks declared local facts on selected overlaps; it does not certify a whole project or remove judgement.',
    triangle: 'Later compatibility enquiry. Geometry and clearance values are illustrative; the checker tests declared rules, not AI capability or engineering design.',
    primer: 'Teaching prototype. “Local truth” means a declared package fact in the toy model, not an independently verified fact.',
    validator: 'Code demo. Sample data and red/amber/green thresholds are illustrative; exported reports describe only this toy dataset.',
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
    const estate = document.createElement('div');
    estate.className = 'ltg-site-nav__estate';
    [['Projects', 'side-projects.html'], ['Library', 'library.html']].forEach(([label, path]) => {
      const link = document.createElement('a');
      link.href = new URL(path, 'https://lawrencerowland.github.io/').href;
      link.textContent = label;
      estate.appendChild(link);
    });
    brand.append(home, estate);

    const routes = document.createElement('div');
    routes.className = 'ltg-site-nav__routes';
    const aiLink = document.createElement('a');
    aiLink.href = new URL('tangled-triangle/index.html', root).href;
    aiLink.textContent = '1 · AI interpretation';
    if (current === 'triangle-enquiry') aiLink.setAttribute('aria-current', 'page');
    if (current.startsWith('triangle-ai-')) aiLink.setAttribute('aria-current', 'location');
    const compositionLink = document.createElement('a');
    compositionLink.href = new URL('index.html#compatibility', root).href;
    compositionLink.textContent = '2 · Compatibility & composition';

    const contents = document.createElement('details');
    contents.className = 'ltg-site-nav__contents';
    const summary = document.createElement('summary');
    summary.textContent = 'All seven essays';
    const tabs = document.createElement('div');
    tabs.className = 'ltg-site-nav__tabs';
    pages.forEach(([id, label, path]) => {
      const link = document.createElement('a');
      link.href = new URL(path, root).href;
      link.textContent = label;
      if (id === current) link.setAttribute('aria-current', 'page');
      tabs.appendChild(link);
    });
    contents.append(summary, tabs);
    routes.append(aiLink, compositionLink, contents);
    inner.append(brand, routes);

    const currentPage = pages.find(([id]) => id === current);
    if (currentPage) {
      const location = document.createElement('p');
      location.className = 'ltg-site-nav__current';
      location.textContent = 'Reading: ' + currentPage[1];
      inner.appendChild(location);
    }
    nav.appendChild(inner);
    document.body.prepend(nav);

    const note = document.createElement('p');
    note.className = 'ltg-review-note';
    const label = document.createElement('strong');
    label.textContent = 'Scope: ';
    note.append(label, document.createTextNode(reviewNotes[current] || (current.startsWith('triangle-ai-') ? reviewNotes['triangle-enquiry'] : reviewNotes.home)));
    nav.insertAdjacentElement('afterend', note);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNavigation, { once: true });
  } else {
    addNavigation();
  }
})();
