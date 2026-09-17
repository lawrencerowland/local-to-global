# Sources and limits

## Shared scenario and two enquiries

The Tangled Triangle collection and Essay 003 are adapted from Lawrence Rowland's **Tangled Triangle — one-shot project and system architecture** brief and report. The original scenario describes a proposed regional signalling control centre on a triangular site constrained by a canal, road, elevated railway, high-voltage line and old mine passage.

The [six early variants](tangled-triangle/index.html) explore how AI makes sense of interfaces, topology and system architecture. They preserve distinct ways of drawing and questioning the brief; they do not supply a scored reference interpretation, controlled model comparison or repeatability study. They cannot establish measured AI performance.

[Essay 003](forays/003-tangled-triangle.html) later reuses the scenario as a toy compatibility problem. Its declared geometry, buffers and candidate locations support a deterministic finite check. That result is not an assessment of AI understanding. Both strands are illustrative, not a site survey, engineering assessment, safety case or design recommendation.

The early HTML variants moved from `lawrencerowland/Project-web-apps` after the in-place repairs at commit `a83541f0b872518601a772b3d311741a7bd7e945`. The [migration record](docs/tangled-triangle-migration.json) gives original and destination routes and source/script hashes. Corrections qualify unsupported engineering claims and preserve useful controls. The [migration note](docs/2026-09-17-tangled-triangle-move.md) records the destination changes and checks.

## Formal and applied reading

- Daniel Rosiak, *Sheaf Theory through Examples* (MIT Press, 2022), ISBN 9780262542159.
- R. Ghrist, public teaching material on sheaves, flows and lattices.
- P. Le Masson, B. Weil and A. Hatchuel, “Sheaves as a Framework for Design: an application to architectural design,” *Proceedings of the Design Society* (2023), DOI: [10.1017/pds.2023.317](https://doi.org/10.1017/pds.2023.317).
- Warren B. Powell, writing on sequential decision analytics and state-variable modelling, used as an adjacent prompt to keep state, decision, exogenous information, transition and objective distinct.

The reading corpus also contained exploratory papers applying sheaf language to resource allocation and WBS risk. Those papers are treated here as provocations, not as validation of the site's claims.

## Interpretation used in this site

The useful formal pattern is:

1. define local data on meaningful parts of a project;
2. define the overlaps and the maps that compare data there;
3. test whether local assignments agree on every declared overlap;
4. treat compatible assignments as candidates for a global section;
5. treat incompatibilities as located obstructions worth investigating.

Choosing the cover—the parts, interfaces and levels on which this test is performed—is a substantive modelling decision. A WBS hierarchy alone is not automatically a sheaf, and adding mathematical vocabulary does not make an arbitrary dashboard rigorous.

Essay 001 now makes that boundary executable: six explicit equality/capacity rules compare fictional projected fields, with missing information reported separately. Its compatible tuple is a result of those finite constraints. The stronger sheaf condition requires unique gluing of compatible local sections; see the [Mathlib formulation and proof](https://leanprover-community.github.io/mathlib_docs/topology/sheaves/sheaf_condition/unique_gluing.html). The example does not establish those axioms for project data.

## Images

The two picture essays use generated mnemonic images supplied with the foray. They are aids to thought, not mathematical diagrams, evidence or proofs.
