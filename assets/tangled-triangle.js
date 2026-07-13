(function () {
  'use strict';

  const inputs = {
    road: document.getElementById('road-buffer'),
    canal: document.getElementById('canal-buffer'),
    rail: document.getElementById('rail-buffer'),
    power: document.getElementById('power-buffer'),
    mine: document.getElementById('mine-buffer')
  };
  const outputs = Object.fromEntries(Object.keys(inputs).map(key => [key, document.getElementById(`${key}-value`)]));
  const candidateLayer = document.getElementById('candidate-layer');
  const candidates = [];
  let selected = null;

  const presets = {
    balanced: { road: 70, canal: 50, rail: 40, power: 70, mine: 50 },
    rail: { road: 70, canal: 50, rail: 110, power: 70, mine: 50 },
    power: { road: 70, canal: 50, rail: 40, power: 145, mine: 50 },
    mine: { road: 70, canal: 50, rail: 40, power: 70, mine: 115 },
    blocked: { road: 95, canal: 105, rail: 70, power: 120, mine: 105 }
  };

  function settings() {
    return Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, Number(input.value)]));
  }

  function insideSite(x, y) {
    return x >= 100 && x <= 800 && y <= 550 && y >= (0.5 * x + 150);
  }

  function evaluate(x, y, s) {
    const margins = {
      Road: x - (100 + s.road),
      Canal: (550 - s.canal) - y,
      Rail: y - (0.5 * x + 150 + s.rail),
      Power: Math.abs(x - 450) - s.power,
      Mine: Math.abs(y - 350) - s.mine
    };
    const metric = Math.min(...Object.values(margins));
    return { margins, metric, viable: metric >= 0 };
  }

  function makeCandidates() {
    for (let x = 116; x <= 788; x += 16) {
      for (let y = 216; y <= 538; y += 16) {
        if (!insideSite(x, y)) continue;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 5);
        circle.setAttribute('class', 'candidate blocked');
        circle.setAttribute('tabindex', '0');
        circle.setAttribute('role', 'button');
        circle.addEventListener('click', () => selectCandidate(candidate));
        circle.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectCandidate(candidate);
          }
        });
        const candidate = { x, y, circle, result: null };
        candidates.push(candidate);
        candidateLayer.appendChild(circle);
      }
    }
  }

  function selectCandidate(candidate) {
    selected = candidate;
    candidates.forEach(item => item.circle.classList.toggle('selected', item === candidate));
    renderSelection();
  }

  function signed(value) {
    const rounded = Math.round(value);
    return `${rounded >= 0 ? '+' : ''}${rounded}`;
  }

  function renderSelection() {
    const title = document.getElementById('selection-title');
    const lede = document.getElementById('selection-lede');
    const list = document.querySelectorAll('#margin-list dd');
    if (!selected || !selected.result) return;
    const { result } = selected;
    title.textContent = `Candidate (${selected.x}, ${selected.y})`;
    const failures = Object.entries(result.margins).filter(([, margin]) => margin < 0).map(([name]) => name);
    lede.textContent = result.viable
      ? 'This sampled assignment agrees with every declared local restriction.'
      : `This assignment is obstructed by ${failures.join(', ')}.`;
    Object.values(result.margins).forEach((margin, index) => {
      list[index].textContent = `${signed(margin)} units`;
      list[index].className = margin >= 0 ? 'pass' : 'fail';
    });
    document.getElementById('selected-margin').textContent = `${signed(result.metric)} units`;
    document.getElementById('selected-summary').textContent = result.viable ? 'compatible on all five rules' : `${failures.length} local obstruction${failures.length === 1 ? '' : 's'}`;
  }

  function updateZones(s) {
    document.getElementById('road-zone').setAttribute('width', s.road);
    document.getElementById('canal-zone').setAttribute('y', 550 - s.canal);
    document.getElementById('canal-zone').setAttribute('height', s.canal);
    document.getElementById('power-zone').setAttribute('x', 450 - s.power);
    document.getElementById('power-zone').setAttribute('width', s.power * 2);
    document.getElementById('mine-zone').setAttribute('y', 350 - s.mine);
    document.getElementById('mine-zone').setAttribute('height', s.mine * 2);
    document.getElementById('rail-zone').setAttribute('points', `100,200 800,550 800,${550 + s.rail} 100,${200 + s.rail}`);
  }

  function updateOverlapStatus(viable) {
    const west = viable.filter(item => item.x < 450).length;
    const east = viable.length - west;
    const northOfMine = viable.filter(item => item.y < 350).length;
    const southOfMine = viable.length - northOfMine;
    const transport = document.getElementById('transport-status');
    const power = document.getElementById('power-status');
    const mine = document.getElementById('mine-status');
    const global = document.getElementById('global-status');
    transport.textContent = viable.length ? 'Transport envelope leaves candidates' : 'Transport envelope participates in obstruction';
    power.textContent = viable.length ? `${west} west · ${east} east of corridor` : 'No all-rule candidates around corridor';
    mine.textContent = viable.length ? `${northOfMine} north · ${southOfMine} south of mine band` : 'No all-rule candidates outside mine band';
    global.textContent = viable.length ? `${viable.length} sampled global sections` : 'No sampled global section';
    [transport, power, mine, global].forEach(element => element.classList.toggle('obstructed', !viable.length));
  }

  function update() {
    const s = settings();
    Object.keys(s).forEach(key => { outputs[key].value = s[key]; });
    updateZones(s);

    const viable = [];
    candidates.forEach(candidate => {
      candidate.result = evaluate(candidate.x, candidate.y, s);
      const className = candidate.result.viable ? 'viable' : candidate.result.metric >= -28 ? 'near' : 'blocked';
      candidate.circle.setAttribute('class', `candidate ${className}${candidate === selected ? ' selected' : ''}`);
      candidate.circle.setAttribute('aria-label', `Candidate ${candidate.x}, ${candidate.y}: minimum margin ${signed(candidate.result.metric)} units, ${candidate.result.viable ? 'compatible' : 'obstructed'}`);
      if (candidate.result.viable) viable.push(candidate);
    });

    const best = candidates.reduce((current, candidate) => !current || candidate.result.metric > current.result.metric ? candidate : current, null);
    document.getElementById('viable-count').textContent = viable.length.toLocaleString();
    document.getElementById('best-margin').textContent = best ? `${signed(best.result.metric)} units` : '—';
    updateOverlapStatus(viable);
    if (!selected || !selected.result || (!selected.result.viable && viable.length)) selectCandidate(best);
    else renderSelection();
  }

  Object.values(inputs).forEach(input => input.addEventListener('input', () => {
    document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    update();
  }));

  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = presets[button.dataset.preset];
    Object.entries(preset).forEach(([key, value]) => { inputs[key].value = value; });
    document.querySelectorAll('[data-preset]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    selected = null;
    update();
  }));

  makeCandidates();
  update();
})();
