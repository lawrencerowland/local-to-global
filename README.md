# Local to Global

This is the public workbench for Portfolio Wave **Foray 140**.

Plan-layer handshake: `FORAY-LOCAL-TO-GLOBAL` · `PW-LDGW-001` · initial receipt `R-006`; scope consolidation `R-008`.

The workbench holds two related lines of enquiry:

1. **AI interpretation of interfaces, topology and system architecture.** The [Tangled Triangle collection](tangled-triangle/index.html) retains six early variants of the same fictional brief: fixed site sketch, selectable boundary geometry, interactive cuts and bands, topology and levels, three architecture options, and an architecture/interface register. They expose interpretations for inspection; they are not an empirical AI benchmark or engineering proof.
2. **Local-to-global compatibility and composition.** The later essays ask whether project scope, WBS, state, schedule or risk can be represented so that a coherent global view is patched from useful local accounts—without hiding disagreements at their interfaces.

Alongside the six early Triangle variants, the site contains seven active compatibility/composition essays. Their IDs stay stable as the collection changes:

| Essay ID | Page |
| --- | --- |
| 001 | [Scope coherence](forays/001-scope-coherence.html) |
| 002 | [Project director view](forays/002-project-director.html) |
| 003 | [The Tangled Triangle](forays/003-tangled-triangle.html) |
| 004 | [A director's primer](forays/004-director-primer.html) |
| 006 | [Patch validator](forays/006-validator/index.html) |
| 007 | [Blueprint picture](forays/007-blueprint-picture.html) |
| 008 | [Navigation picture](forays/008-navigation-picture.html) |

Essay 001 brings the Pennine Viaduct example, explicit interface rules, scenario comparison, resolution workflow and PMO operating steps together in one maintained page. Its scenarios distinguish resolving one interface from reconciling the complete declared set.

On 2026-09-06, Lawrence retired Essay 005, Infrastructure PMO, because its example and capabilities duplicated Essay 001. Its former URL redirects to 001; the earlier version remains in Git history. No active essay has been renumbered.

Essay 003 reuses the Tangled Triangle brief as a toy local-to-global compatibility problem: local constraints are declared independently, overlaps are checked explicitly, and a global candidate exists only when all selected restrictions agree. The early collection and this later essay link reciprocally so their distinct questions remain visible.

## Epistemic discipline

- “Local truth” means a declared fact inside a prototype, not an independently verified fact.
- The interactive checkers evaluate selected rules. They do not certify a whole project.
- Values, dates, packages and benefits shown in early prototypes are fictional or illustrative unless a page says otherwise.
- Sheaf theory is a formal inspiration and a source of precise questions. Several pages remain finite compatibility models rather than full sheaf constructions.
- Language models may help extract or propose mappings; deterministic rules remain the judge in the worked examples.

## Publishing

This repository is a static GitHub Pages site. Open `index.html` through a local HTTP server for development; some pages load local JSON and will not work reliably from a `file://` URL.

Public site: <https://lawrencerowland.github.io/local-to-global/>

See [SOURCES.md](SOURCES.md) for the public source trail and limits.

Migration checks: `node tests/tangled-triangle-migration.cjs` verifies the six imported variants, unchanged inline behavior scripts, controls and local navigation; `node tests/architecture-repairs.cjs` checks the topology slider event order. See [the migration note](docs/2026-09-17-tangled-triangle-move.md).
