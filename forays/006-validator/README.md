# Sheaf Validator — Pumps × Grid × Roads (Static Demo)

A tiny, dependency-free dashboard that demonstrates a **sheaf-style validator** for resilience ops: local patches (EA pumps, DNO grid, Highways roads), **glued** by overlaps with explicit consistency rules.

## What this shows
- **Patches**: each agency owns its dataset and schema.
- **Overlaps**: expected shared keys and rules (e.g., pump must not be OPERATIONAL if power at that site is reported as POWER_LOSS).
- **Validation**: agreement rates, data freshness skew (as a proxy for time-to-consistency), gap coverage, and a simple MTTR derived from example durations.

> This is a teaching/demo artifact. Swap the sample JSON with live feeds to make it operational.

## Run locally
Just open `index.html` in a browser. (For some browsers, `file://` may block `fetch()` of local JSON. If that happens, run a tiny static server, e.g. Python:)

```bash
# From this folder:
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy to GitHub Pages
1. Create a new repo and add the files in this folder.
2. Commit & push.
3. In **Settings → Pages**, pick branch `main` and root `/` folder.
4. Wait for Pages to build; then visit your Pages URL.

## Data contracts (schemas)
See `schema/` for minimal JSON Schemas:
- `sheaf_patch.schema.json`
- `sheaf_overlap.schema.json`

### Rule vocabulary
Two rule types are implemented in `script.js`:
- **pump_power_rule**: flags a contradiction when a pump is **OPERATIONAL** while grid reports **POWER_LOSS** for the same key.
- **access_block_rule**: flags when a **visit is required** but the **access road is CLOSED**.

Add more rules by extending the `RULES` object.

## Wiring your data
Replace the content of `data/patches.json` and `data/overlaps.json`:
- Add/rename **patches** with `id`, `schema`, and `records`.
- In **overlaps**, set `expected_keys` (the seam), the `left_key`/`right_key`, and choose a `rule_id` plus its `ruleset` field-name mapping.

## KPIs (computed)
- **Overlap Agreement (%)** = consistent_pairs / pairs_with_both_present
- **Time‑to‑Consistency (proxy)** = median timestamp skew (minutes) where pairs are consistent
- **Gap Coverage (any side / both)** = keys_seen / expected_keys ; pairs_with_both / expected_keys
- **Contradiction MTTR** = mean of example `resolved_conflicts_minutes` (in production, compute from your event history)

## License
MIT — see `LICENSE`.