async function loadJSON(path) {
  const res = await fetch(path);
  if(!res.ok) throw new Error("Failed to load " + path);
  return await res.json();
}

function isoToMs(iso) { try { return new Date(iso).getTime(); } catch(e) { return NaN; } }
function min(a,b){ return a < b ? a : b; }
function max(a,b){ return a > b ? a : b; }
function fmtPct(x){ if(isNaN(x)) return "—"; return (x*100).toFixed(1)+"%"; }
function fmtMins(x){ if(x==null || isNaN(x)) return "—"; return Math.round(x) + " min"; }
function median(arr) {
  if(!arr || arr.length===0) return NaN;
  const s=[...arr].sort((a,b)=>a-b);
  const mid=Math.floor(s.length/2);
  return s.length%2? s[mid] : (s[mid-1]+s[mid])/2;
}

function buildIndex(records, key) {
  const idx = new Map();
  for(const r of records) {
    if(r[key]!==undefined) idx.set(String(r[key]), r);
  }
  return idx;
}

function pump_power_rule(leftRec, rightRec, ruleset) {
  const l = leftRec?.[ruleset.status_fields.left];
  const r = rightRec?.[ruleset.status_fields.right];
  const lts = leftRec?.[ruleset.timestamp_fields.left];
  const rts = rightRec?.[ruleset.timestamp_fields.right];
  const skew = Math.abs( (new Date(lts)- new Date(rts)) / 60000 );

  const pair = [l, r];
  const isContradict = ruleset.contradict_pairs.some(([a,b]) => a===l && b===r);
  const allowed = ruleset.allowed_pairs.some(([a,b]) => a===l && b===r);
  const consistent = allowed && !isContradict;
  const reason = isContradict ? "Pump reported OPERATIONAL while grid reports POWER_LOSS" : (allowed ? "OK" : "Unknown pairing");
  return { consistent, reason, skew_mins: skew };
}

function access_block_rule(leftRec, rightRec, ruleset) {
  const needVisit = !!leftRec?.[ruleset.visit_field];
  const roadStatus = rightRec?.[ruleset.road_status_field];
  const lts = leftRec?.[ruleset.timestamp_fields.left];
  const rts = rightRec?.[ruleset.timestamp_fields.right];
  const skew = Math.abs( (new Date(lts)- new Date(rts)) / 60000 );
  const isClosed = ruleset.closed_values.includes(roadStatus);
  const consistent = !(needVisit && isClosed);
  const reason = consistent ? "OK" : "Visit required but access road is CLOSED";
  return { consistent, reason, skew_mins: skew };
}

const RULES = {
  "pump_power_rule": pump_power_rule,
  "access_block_rule": access_block_rule
};

function classify(value, thresholds) {
  // thresholds: {ok: number, warn: number} meaning >=ok => ok, >=warn => warn else fail
  if(isNaN(value)) return "warn";
  if(value >= thresholds.ok) return "ok";
  if(value >= thresholds.warn) return "warn";
  return "fail";
}

function createNode(x,y,label,id) {
  return {x,y,label,id};
}

function edgeColorByRate(rate) {
  if(rate >= 0.95) return "#2e946e";
  if(rate >= 0.80) return "#d6a243";
  return "#cc4f4f";
}

function patchLabel(patch) {
  return ({ flood_pumps: "Flood pumps", grid: "Grid", roads: "Roads" })[patch.domain] || patch.name;
}

async function main() {
  const [patches, overlaps] = await Promise.all([
    loadJSON("./data/patches.json"),
    loadJSON("./data/overlaps.json")
  ]);

  // Build patch index by id
  const patchById = new Map();
  for(const p of patches.patches) patchById.set(p.id, p);

  // Compute overlap diagnostics
  const overlapResults = [];
  let globalConsistentPairs = 0;
  let globalTotalPairs = 0;
  let globalSkews = [];
  let globalExpected = 0;
  let globalPresentAny = 0;
  let globalPresentBoth = 0;
  let allResolvedDurations = [];

  for(const ov of overlaps.overlaps) {
    const left = patchById.get(ov.left_patch);
    const right = patchById.get(ov.right_patch);
    if(!left || !right) continue;

    const leftIdx = buildIndex(left.records, ov.left_key);
    const rightIdx = buildIndex(right.records, ov.right_key);
    const ruleFn = RULES[ov.rule_id];
    const details = [];

    let consistentCount=0, bothCount=0, anyCount=0;
    let skews=[];
    let missing=0;
    let contradictions=0;

    for(const key of ov.expected_keys) {
      const l = leftIdx.get(String(key));
      const r = rightIdx.get(String(key));
      const presentAny = !!(l || r);
      const presentBoth = !!(l && r);
      anyCount += presentAny?1:0;
      bothCount += presentBoth?1:0;
      let consistent=null, reason="—", skew=null;
      if(presentBoth) {
        const res = ruleFn(l, r, ov.ruleset);
        consistent = !!res.consistent;
        reason = res.reason;
        skew = res.skew_mins;
        if(consistent) consistentCount += 1; else contradictions += 1;
        if(!isNaN(skew)) skews.push(skew);
      } else {
        if(!presentAny) missing += 1;
      }
      details.push({ key, presentAny, presentBoth, consistent, reason, skew_mins: skew, left: l || null, right: r || null });
    }

    const agreementRate = bothCount? (consistentCount / bothCount) : NaN;
    const medianSkew = median(skews);
    const coverageAny = ov.expected_keys.length? (anyCount/ ov.expected_keys.length) : NaN;
    const coverageBoth = ov.expected_keys.length? (bothCount/ ov.expected_keys.length) : NaN;
    const mttr = (ov.resolved_conflicts_minutes && ov.resolved_conflicts_minutes.length>0) ?
                  (ov.resolved_conflicts_minutes.reduce((a,b)=>a+b,0)/ov.resolved_conflicts_minutes.length) : NaN;

    // Accumulate globals
    globalConsistentPairs += consistentCount;
    globalTotalPairs += bothCount;
    globalSkews.push(...skews);
    globalExpected += ov.expected_keys.length;
    globalPresentAny += anyCount;
    globalPresentBoth += bothCount;
    allResolvedDurations.push(...(ov.resolved_conflicts_minutes || []));

    overlapResults.push({
      id: ov.id,
      left_patch: ov.left_patch,
      right_patch: ov.right_patch,
      agreementRate, medianSkew, coverageAny, coverageBoth, contradictions,
      details, bothCount, anyCount, expected: ov.expected_keys.length, mttr
    });
  }

  const overallAgreement = globalTotalPairs ? (globalConsistentPairs / globalTotalPairs) : NaN;
  const overallMedianSkew = median(globalSkews);
  const overallCoverageAny = globalExpected ? (globalPresentAny / globalExpected) : NaN;
  const overallCoverageBoth = globalExpected ? (globalPresentBoth / globalExpected) : NaN;
  const overallMTTR = allResolvedDurations.length ? (allResolvedDurations.reduce((a,b)=>a+b,0)/allResolvedDurations.length) : NaN;

  const model = {
    overlapResults,
    metrics: {
      overallAgreement,
      overallMedianSkew,
      overallCoverageAny,
      overallCoverageBoth,
      overallMTTR
    },
    patches: patches.patches
  };

  render(model);
  window.__sheafModel = model; // expose for debugging
}

function render(model) {
  // KPI cards
  const kpi = document.getElementById("kpis");
  const m = model.metrics;
  kpi.innerHTML = "";

  const cards = [
    { title: "Overlap Agreement", value: fmtPct(m.overallAgreement), cls: classify(m.overallAgreement, {ok:0.95, warn:0.80})},
    { title: "Time-to-Consistency (proxy)", value: fmtMins(m.overallMedianSkew), cls: classify( (isNaN(m.overallMedianSkew)?NaN: (1/(1+m.overallMedianSkew/10))), {ok:0.9, warn:0.6})},
    { title: "Gap Coverage (any side)", value: fmtPct(m.overallCoverageAny), cls: classify(m.overallCoverageAny, {ok:0.98, warn:0.90}) },
    { title: "Contradiction MTTR", value: fmtMins(m.overallMTTR), cls: classify( (isNaN(m.overallMTTR)?NaN: (1/(1+m.overallMTTR/30))), {ok:0.8, warn:0.5}) }
  ];
  for(const c of cards) {
    const el = document.createElement("div");
    el.className = `card ${c.cls}`;
    el.innerHTML = `<h3>${c.title}</h3><div class="value">${c.value}</div>`;
    kpi.appendChild(el);
  }

  // Graph
  const svg = document.getElementById("graph");
  while(svg.firstChild) svg.removeChild(svg.firstChild);
  const width = svg.clientWidth || 800;
  const height = svg.clientHeight || 240;
  const cx = width/2;
  const edgeX = Math.max(58, Math.min(150, width * 0.18));
  const nodes = [
    {id:model.patches[0].id, label:patchLabel(model.patches[0]), x:cx, y:48},
    {id:model.patches[1].id, label:patchLabel(model.patches[1]), x:edgeX, y:height-50},
    {id:model.patches[2].id, label:patchLabel(model.patches[2]), x:width-edgeX, y:height-50},
  ];

  function findAgreement(a,b){
    const ov = model.overlapResults.find(o=> (o.left_patch===a && o.right_patch===b) || (o.left_patch===b && o.right_patch===a));
    return ov ? ov.agreementRate : NaN;
  }

  function drawEdge(a,b){
    const ra = findAgreement(a.id, b.id);
    const color = edgeColorByRate(ra||0);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "4");
    line.setAttribute("opacity", "0.9");
    svg.appendChild(line);
    // label
    const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    lbl.setAttribute("x", (a.x+b.x)/2);
    lbl.setAttribute("y", (a.y+b.y)/2 - 6);
    lbl.setAttribute("fill", "#9fb3c8");
    lbl.setAttribute("font-size", "12");
    lbl.setAttribute("text-anchor", "middle");
    lbl.textContent = isNaN(ra) ? "—" : (Math.round(ra*1000)/10)+"%";
    svg.appendChild(lbl);
  }

  drawEdge(nodes[0], nodes[1]);
  drawEdge(nodes[0], nodes[2]);
  drawEdge(nodes[1], nodes[2]);

  for(const n of nodes) {
    const g = document.createElementNS("http://www.w3.org/2000/svg","g");
    const circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circ.setAttribute("cx", n.x);
    circ.setAttribute("cy", n.y);
    circ.setAttribute("r", "28");
    circ.setAttribute("fill", "#171f2b");
    circ.setAttribute("stroke", "#223043");
    circ.setAttribute("stroke-width", "2");
    g.appendChild(circ);
    const txt = document.createElementNS("http://www.w3.org/2000/svg","text");
    txt.setAttribute("x", n.x);
    txt.setAttribute("y", n.y+4);
    txt.setAttribute("fill", "#e6edf3");
    txt.setAttribute("font-size", "12");
    txt.setAttribute("text-anchor", "middle");
    txt.textContent = n.label;
    g.appendChild(txt);
    svg.appendChild(g);
  }

  // Table of overlaps with details
  const tableBody = document.querySelector("#ovrows");
  tableBody.innerHTML = "";
  for(const o of model.overlapResults) {
    const tr = document.createElement("tr");
    const cls = classify(o.agreementRate, {ok:0.95, warn:0.80});
    tr.innerHTML = `
      <td><strong>${o.id}</strong><br/><span class="caption">${o.left_patch} ↔ ${o.right_patch}</span></td>
      <td>${fmtPct(o.agreementRate)}</td>
      <td>${o.bothCount}/${o.expected}</td>
      <td>${fmtPct(o.coverageAny)} / ${fmtPct(o.coverageBoth)}</td>
      <td><span class="badge ${cls}">${cls.toUpperCase()}</span></td>
      <td>${o.contradictions}</td>
      <td>${fmtMins(o.medianSkew)}</td>
    `;
    tableBody.appendChild(tr);

    // Details
    const det = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Show details (per key diagnostics)";
    details.appendChild(summary);

    const inner = document.createElement("div");
    inner.innerHTML = `<div class="kv">
      <div><strong>Expected keys:</strong> ${o.expected}</div>
      <div><strong>Present any:</strong> ${o.anyCount}</div>
      <div><strong>Present both:</strong> ${o.bothCount}</div>
      <div><strong>Contradictions:</strong> ${o.contradictions}</div>
    </div>`;

    const subt = document.createElement("table");
    subt.className = "grid";
    subt.innerHTML = `<thead>
      <tr><th>Key</th><th>Present</th><th>Consistent?</th><th>Reason</th><th>Skew (min)</th><th>Left</th><th>Right</th></tr>
    </thead><tbody></tbody>`;
    const subtBody = subt.querySelector("tbody");
    for(const d of o.details) {
      const r = document.createElement("tr");
      const present = d.presentBoth ? "both" : (d.presentAny ? "one-side" : "none");
      let badgeCls = d.consistent===true? "ok": (d.consistent===false? "fail":"warn");
      r.innerHTML = `
        <td>${d.key}</td>
        <td>${present}</td>
        <td><span class="badge ${badgeCls}">${d.consistent===true?"YES":(d.consistent===false?"NO":"N/A")}</span></td>
        <td>${d.reason || "—"}</td>
        <td>${d.skew_mins!=null && !isNaN(d.skew_mins) ? Math.round(d.skew_mins) : "—"}</td>
        <td><code class="inline">${d.left?JSON.stringify(d.left):"—"}</code></td>
        <td><code class="inline">${d.right?JSON.stringify(d.right):"—"}</code></td>
      `;
      subtBody.appendChild(r);
    }
    inner.appendChild(subt);
    details.appendChild(inner);
    td.appendChild(details);
    det.appendChild(td);
    tableBody.appendChild(det);
  }
}

function download(filename, text) {
  const blob = new Blob([text], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 0);
}

function exportReport() {
  const m = window.__sheafModel;
  if(!m) return;
  const out = {
    generated_at: new Date().toISOString(),
    metrics: m.metrics,
    overlaps: m.overlapResults.map(o => ({
      id: o.id,
      left_patch: o.left_patch,
      right_patch: o.right_patch,
      agreementRate: o.agreementRate,
      coverageAny: o.coverageAny,
      coverageBoth: o.coverageBoth,
      contradictions: o.contradictions,
      medianSkew: o.medianSkew
    }))
  };
  download("sheaf-report.json", JSON.stringify(out, null, 2));
}

window.addEventListener("DOMContentLoaded", () => {
  main().catch(error => {
    console.error(error);
    const mainElement = document.querySelector('main');
    const message = document.createElement('div');
    message.className = 'load-error';
    message.setAttribute('role', 'alert');
    message.textContent = 'The sample data could not be loaded. Open this page through a local HTTP server or the published site, then reload.';
    mainElement.prepend(message);
  });
});
window.addEventListener("resize", () => {
  if(window.__sheafModel) render(window.__sheafModel);
});
window.exportReport = exportReport;
