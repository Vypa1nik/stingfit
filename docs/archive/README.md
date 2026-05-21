# Archive — historical planning docs

> [!WARNING]
> **Anything in this folder is ARCHIVED. Agents and contributors must NOT plan,
> implement, or refactor based on the content here.**

The single authoritative plan for StingFit going forward lives at the repo root:

- [`STINGFIT_V3_PLAN.md`](../../STINGFIT_V3_PLAN.md) — **current** rebuild plan (preferred)
- [`STINGFIT_V2_PLAN.md`](../../STINGFIT_V2_PLAN.md) — previous plan, kept for context (V2 shipped)
- [`PRODUCT.md`](../../PRODUCT.md) — product vision, personas, anti-goals
- [`AGENTS.md`](../../AGENTS.md) — agent workflow and pointer to the active plan
- [`RULES.md`](../../RULES.md) — engineering and product rules

## What's in here

| Path | Status | Why kept |
| --- | --- | --- |
| `DEVELOPMENT_PLAN.md` | Archived 2026-05-02 | Original LocalFlow notes-app vision. Superseded when the project pivoted to fitness. Useful only as history. |
| `AUDIT_REBUILD_PLAN.md` | Archived 2026-05-02 | First rebuild audit (LocalFlow -> StingFit fitness). Most of its Phase 0-3 work has shipped. Superseded by V2. |
| `superpowers/plans/` (35 files) | Archived 2026-05-05 | April 2026 "High-Voltage Fitness" pivot roadmap, broken into per-module checklists. Most modules shipped in StingFit V1. Any remaining ideas are superseded by `STINGFIT_V3_PLAN.md`. |
| `superpowers/specs/` (2 files) | Archived 2026-05-05 | Design specs from the same April 2026 pivot. Captured the LocalFlow -> Fitness product direction; product direction now lives in `PRODUCT.md`. |
| `reports/stingfit-v2-release-readiness.md` | Archived 2026-05-17 | V2 release-readiness checklist. V2 has shipped; the file is historical proof of the gate. Do not re-use as a V3 checklist — V3 has its own gate in `STINGFIT_V3_PLAN.md` §10. |
| `reports/stingfit-v2.0.0-release-notes.md` | Archived 2026-05-17 | V2.0.0 release notes, kept for the changelog story but no longer the latest. |

## Rules for this folder

- Do not edit archived files except to add an "Archived" notice.
- Do not link to archived files from active code or active docs.
- Do not extract TODOs, plans, or design rules from these files into the live
  plan without explicit user approval.
- If something in here looks worth reviving, raise it in chat first; only the
  user decides whether to fold it back into `STINGFIT_V3_PLAN.md`.
