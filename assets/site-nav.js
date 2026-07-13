(function () {
  'use strict';

  const script = document.currentScript;
  const root = new URL('../', script.src);
  const pages = [
    ['home', 'Home', 'index.html'],
    ['scope', 'Scope coherence', 'forays/001-scope-coherence.html'],
    ['director', 'Director view', 'forays/002-project-director.html'],
    ['triangle', 'Tangled Triangle', 'forays/003-tangled-triangle.html'],
    ['primer', 'Director primer', 'forays/004-director-primer.html'],
    ['pmo', 'Infrastructure PMO', 'forays/005-infrastructure-pmo.html'],
    ['validator', 'Patch validator', 'forays/006-validator/index.html'],
    ['blueprint', 'Blueprint picture', 'forays/007-blueprint-picture.html'],
    ['navigation', 'Navigation picture', 'forays/008-navigation-picture.html']
  ];

  const reviewNotes = {
    home: 'A public workbench of separate essays. The pages are deliberately not collapsed into one final model.',
    scope: 'Reviewed prototype. Package names, values and impacts are fictional; the checker demonstrates compatibility logic, not validated savings.',
    director: 'Reviewed prototype. It checks declared local facts on selected overlaps; it does not certify a whole project or remove judgement.',
    triangle: 'New worked essay. Geometry and clearance values are illustrative; the exercise is local-to-global compatibility, not engineering design.',
    primer: 'Reviewed teaching prototype. “Local truth” means a declared package fact in the toy model, not an independently verified fact.',
    pmo: 'Reviewed early concept. Commercial values, dates, benefits and detection rates are illustrative and carry no empirical claim.',
    validator: 'Reviewed code demo. Sample data and red/amber/green thresholds are illustrative; exported reports describe only this toy dataset.',
    blueprint: 'Picture essay. The generated image is a mnemonic, not a mathematical diagram or proof.',
    navigation: 'Picture essay. The generated image is a prompt for thinking about scale, not a formal local-to-global model.'
  };

  function addNavigation() {
    const current = document.body.dataset.ltgPage || 'home';
    const nav = document.createElement('nav');
    nav.className = 'ltg-site-nav';
    nav.setAttribute('aria-label', 'Local to Global essays');

    const inner = document.createElement('div');
    inner.className = 'ltg-site-nav__inner';
    const brand = document.createElement('div');
    brand.className = 'ltg-site-nav__brand';
    const home = document.createElement('a');
    home.href = new URL('index.html', root).href;
    home.textContent = 'Local to Global';
    const descriptor = document.createElement('span');
    descriptor.textContent = 'One Portfolio Wave foray · many separate essays';
    brand.append(home, descriptor);

    const tabs = document.createElement('div');
    tabs.className = 'ltg-site-nav__tabs';
    pages.forEach(([id, label, path]) => {
      const link = document.createElement('a');
      link.href = new URL(path, root).href;
      link.textContent = label;
      if (id === current) link.setAttribute('aria-current', 'page');
      tabs.appendChild(link);
    });

    inner.append(brand, tabs);
    nav.appendChild(inner);
    document.body.prepend(nav);

    const note = document.createElement('p');
    note.className = 'ltg-review-note';
    const label = document.createElement('strong');
    label.textContent = 'Status: ';
    note.append(label, document.createTextNode(reviewNotes[current] || reviewNotes.home));
    nav.insertAdjacentElement('afterend', note);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNavigation, { once: true });
  } else {
    addNavigation();
  }
})();
