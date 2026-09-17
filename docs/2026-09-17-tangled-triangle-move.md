# Tangled Triangle: two enquiries — 17 September 2026

The six early Triangle apps move into the `tangled-triangle/` section of Local to Global. Each keeps its original basename and its distinct controls. The old Project Apps routes are handled separately in the source repository.

The user's distinction governs the placement:

1. **AI interpretation of interfaces, topology and system architecture:** six early variants expose ways of interpreting the same fictional brief. Fixed sketches, interactive bands/cuts, topology readouts, architecture alternatives and an interface register remain separate and clearly labelled.
2. **Local-to-global compatibility and composition:** the existing later essays explore declared local accounts and compatibility rules. Essay 003 reuses the Triangle scenario as a finite compatibility toy; it does not measure AI understanding.

The landing page and shared navigation name both enquiries. The early hub links to all six variants and the later Essay 003. Every variant has a static return link to the hub and a link to Essay 003; Essay 003 links back. Original IDs and inline behavior scripts remain unchanged. Existing essay URLs and behavior remain unchanged.

The early pages were copied from repaired Project Apps commit `a83541f0b872518601a772b3d311741a7bd7e945`. The [route and source manifest](tangled-triangle-migration.json) records exact origins, new URLs, source hashes and import invariants; it stores no duplicate app implementations.

The collection presents exploratory interpretations. It contains no controlled model comparison, scored reference interpretation or repeatability study, so it does not establish an empirical AI benchmark. Its assumptions, geometry and alternatives do not establish engineering feasibility, safety or approval.

## Checks

Run from the repository root:

```
node tests/tangled-triangle-migration.cjs
node tests/architecture-repairs.cjs
```

The migration check verifies all six routes, retained controls and inline behavior against the import record, reciprocal navigation, local link/asset resolution, script parsing, and shared navigation from nested routes. The focused topology regression exercises all ten ranges through 30 events and requires state and labels to update before each drawing refresh, including the OHL 28 → 32 case. Import hashes are migration evidence; intentional future behavior changes should explicitly revise the recorded baseline.

Browser and deployed-route checks are recorded in the release handoff separately. Passing these checks is not human-user validation, empirical AI evaluation or engineering assurance.
