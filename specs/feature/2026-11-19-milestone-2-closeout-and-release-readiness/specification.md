# Feature Specification: Milestone 2 Closeout & Release Readiness

- **Feature ID**: `FEAT-M2-CLOSEOUT-RELEASE`
- **Milestone**: Milestone 2 (closeout) → Milestone 3 handoff
- **Date**: 2026-11-19
- **Status**: Implemented — Documentation Only
- **Classification**: Documentation / Plan Record

---

## Context & Motivation

`specs/roadmap.md` defines Milestone 2 as "Production Contact Gateway & Interactive Case Studies". The branch `Milestone2Branch` has delivered the contact gateway, project deep-dive modals, CI/CD scaffolding, and live GitHub telemetry — but it is 2 commits ahead / 13 behind `main`, production still serves the old code, and the specs contain stale statuses and values. This feature captures the single ground-truth plan that closes M2, unblocks deployment, and hands off to M3.

Grounding facts verified 2026-11-19:

- No active conflict markers; two conflicts are predicted on `git merge main`.
- `CACHE_TTL_SECONDS: "900"` on the branch vs retired `CACHE_TTL` on main.
- Branch Vercel steps use `working-directory: ./frontend`; main uses a PATH workaround.
- `frontend/vercel.json` differs only by a trailing newline (branch has it).
- Branch source/fixtures: `eMSME`, `colorgame`, 49 repos, 370 commits.
- `main` fixtures: `colorgame`, `equiptrack`, 40 repos; no local source contains "43".
- `GET /api/github/overview` has no project fields — slugs come from `/api/projects`.

## User Goal & Workflow

The developer wants one authoritative document that (1) makes the current branch deployable, (2) records the security rotation and redeploy sequence, (3) aligns the specs, and (4) defines M3 entry criteria. Workflow: open this triad → execute the blocker checklist → apply the documentation edits → flip validation statuses → start M3.

## User Stories

- **US-1 (merge)**: GIVEN the branch is 13 behind main, WHEN the developer merges main and applies the locked-in conflict decisions, THEN CI is green with no secret in client code.
- **US-2 (security/release)**: GIVEN a previously exposed GitHub PAT, WHEN the token is revoked, reissued with all-repository read access, and set only in the Render dashboard, THEN no token exists in the repo or frontend and live telemetry is fresh.
- **US-3 (scope decision)**: GIVEN the scheduler is pushed out of M2, WHEN `roadmap.md` and `constitution.md` are amended with recorded sign-off, THEN the docs no longer contradict each other and M2 can be closed.
- **US-4 (doc hygiene)**: GIVEN stale validation/context files, WHEN the corrections are applied, THEN all specs report current statuses, variables, and counts.
- **US-5 (handoff)**: GIVEN M2 is closed, WHEN M3 workstreams and exit criteria exist, THEN the next milestone can start without ambiguity.

## Functional Requirements

- **FR-1** Store the closeout plan as a three-file triad at `specs/feature/2026-11-19-milestone-2-closeout-and-release-readiness/`.
- **FR-2** Lock merge decisions: keep `CACHE_TTL_SECONDS: "900"`; adopt main's Render deploy-hook safety check; keep branch's `working-directory: ./frontend` for Vercel; keep the branch's trailing newline in `frontend/vercel.json`.
- **FR-3** Record token rotation: revoke exposed PAT, issue fine-grained token with **all-repository** read access (Metadata + Contents read), store only in Render; correct `context.md §5`'s old public-only wording.
- **FR-4** Record redeploy order: Render backend first, then Vercel; verify with the curl set in `context.md §5`, including `/api/projects` returning `eMSME`, `colorgame` and `/api/projects/equiptrack` → 404. Treat live responses — not the report's "43 repos" — as the source of truth for counts.
- **FR-5** Record 375px / 1200px layout verification and the five-tab Case Study modal checks from `context.md §5`.
- **FR-6** Amend `roadmap.md:16` and `constitution.md:41` to defer live calendar booking beyond M2, with a recorded amendment sign-off; log a minimal future CTA relabel (e.g. "Request a meeting") as a deferred code task — do not execute it now.
- **FR-7** Apply documentation edits now: add M2 exit criteria, expand M3 workstreams and exit criteria, refresh `context.md` (next item, token scope, inventory), and correct all five validation files.
- **FR-8** Introduce no new API endpoint, database table/column, auth, cookies, or runtime state. All schema/contract sections are N/A.
- **FR-9** Label FR-2…FR-5 as **release blockers** and FR-6…FR-7 as **follow-ups**.
- **FR-10** Record the unmeasured KPIs (Lighthouse ≥ 95, WCAG 2.1 AA) as M3 measurement follow-ups, not release blockers.

## Non-Functional Requirements

- **Security**: zero client secret leakage; token lives only in Render environment.
- **Consistency**: no stale `CACHE_TTL`, "Pending Implementation" labels, old slugs, or old test counts remain in `specs/`.
- **Determinism**: every conflict decision is explicitly chosen, not left implicit.
- **Traceability**: all changed files linked with `file://` paths in `context.md`.
- **Scope discipline**: no DB, no auth, no 3D, no booking API — per constitution.

## Acceptance Criteria

- [x] AC-1 Three triad files exist under the target folder.
- [x] AC-2 Roadmap no longer promises M2 scheduler; M2 exit criteria + M3 detail exist.
- [x] AC-3 Constitution amendment records date and developer sign-off.
- [x] AC-4 `context.md` next item points to M3, and §5 token scope is all-repository.
- [x] AC-5 All five validation files have current status lines and values.
- [x] AC-6 No retired project slugs, retired cache variable, or stale 19/20 counts remain in `specs/`.
- [x] AC-7 Blocker/follow-up labels present; live curl results recorded as pending.
- [x] AC-8 No runtime source file modified by this feature.
