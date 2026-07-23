# Fate Character Sheet — Modernization

## What This Is

Fate Character Sheet (FCS) is a subscription web app for creating and managing characters, campaigns, scenes, and adversaries for Fate-based tabletop RPGs, plus a peer-to-peer virtual tabletop for live play. It is a mature, in-production Vue 2 single-page app with paying subscribers, currently running on aging technology (Vue 2, Webpack 4, a direct AWS client stack) that has become hard to maintain. This project modernizes the stack and, in a later milestone, migrates the backend off AWS onto Firebase.

## Core Value

Paying subscribers keep full, uninterrupted access to their existing characters, campaigns, and live-play features throughout the modernization — no data loss, no regressions, no downtime.

## Business Context

- **Customer**: Individual tabletop RPG players/GMs who subscribe to manage Fate characters and run games
- **Revenue model**: Recurring subscriptions via Stripe
- **Success metric**: Retained paying subscribers with zero migration-related churn
- **Strategy notes**: Two-milestone modernization — frontend/tooling first, backend platform migration second

## Requirements

### Validated

<!-- Existing, in-production capabilities inferred from the codebase map. These must keep working. -->

- ✓ Character sheet creation/editing across 12 Fate game systems (Fate Core, Accelerated, Condensed, Dresden, Middle-earth, Star Trek, Cthulhu, Mouse Guard, Freeport, etc.) — existing
- ✓ Campaigns, scenes, adversaries — list/detail CRUD — existing
- ✓ User accounts: registration, email verification, login, password recovery, session refresh (AWS Cognito) — existing
- ✓ Subscriptions & billing via Stripe (customer creation, checkout, management portal) through the `FCSStripe` Lambda — existing
- ✓ Peer-to-peer virtual tabletop for live play (PeerJS server/client) plus Roll20 "Fate of 20" extension integration — existing
- ✓ Fate dice roller — existing
- ✓ Data persistence in DynamoDB (single-table, `owner_id`+`id`, env-split prod/dev tables) — existing
- ✓ Error/perf monitoring (Sentry), analytics (Google Tag Manager), consent (iubenda) — existing

### Active

<!-- Milestone 1 — Tech Stack Modernization. Hypotheses until shipped and validated. -->

- [ ] Migrate the frontend framework from Vue 2.6 to Vue 3 with no loss of existing functionality
- [ ] Replace/upgrade Vue-3-incompatible dependencies (notably Bootstrap-Vue, Vuex, and other Vue 2-only plugins) with supported equivalents
- [ ] Modernize the build toolchain (Webpack 4 → a currently-supported bundler/dev server) while preserving the dev/beta/prod environment split and Sentry release tooling
- [ ] Reduce direct jQuery reliance where it blocks the Vue 3 upgrade
- [ ] Preserve all integrations end-to-end (Cognito auth, DynamoDB, Stripe/Lambda, PeerJS VTT, Sentry, GTM, iubenda) with regression coverage
- [ ] Isolate the backend behind a clean service abstraction so the Milestone 2 AWS→Firebase swap is contained
- [ ] Keep the existing Jest/Vue Test Utils suite green and expand coverage around migration-risk areas

### Out of Scope

<!-- Explicit boundaries with reasoning. -->

- AWS → Firebase backend migration (Cognito→Firebase Auth, DynamoDB→Firestore, Lambda→Cloud Functions, user & data migration) — **deferred to Milestone 2**; do not start until the Vue 3 frontend has shipped and stabilized
- Upgrading `aws-sdk` v2 → v3 as its own effort — throwaway work, since Milestone 2 removes the AWS client stack entirely; only touch it if it directly blocks the Vue 3 upgrade
- New product features / new game systems — feature-freeze during modernization to keep the migration a like-for-like port
- Visual redesign / UX overhaul — out of scope; keep the existing UI unless a dependency swap forces minimal changes

## Context

- **Codebase map available** in `.planning/codebase/` (STACK, INTEGRATIONS, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, CONCERNS) and a knowledge graph in `.planning/graphs/`.
- Client-side SPA: no app server; the browser talks directly to AWS (DynamoDB via `aws-sdk` v2 DocumentClient, auth via `amazon-cognito-identity-js`). The user refers to this as "amplify" — it is not literally AWS Amplify, but the same hard-to-maintain direct AWS client integration.
- State in a single inline Vuex store (`src/index.js`); business logic in plain ES6 service classes (`src/assets/js/*`) constructed with the root Vue instance.
- Character sheets are a parent/child Vue component system; sheets read/write via `getVal`/`setVal` on a shared character object. Vue 3 reactivity changes (no `Vue.set`, Composition API) will touch this system.
- Known migration gotchas already visible: Bootstrap-Vue is Vue 2-only, pervasive jQuery + Bootstrap 4 JS, many small Vue-2-only plugins, and global `window.fcs`/`window.Vue` usage.
- Live product with paying customers — changes must be shippable incrementally and safely.

## Constraints

- **Compatibility**: Zero data loss and no breaking changes for existing subscribers' saved data (DynamoDB single-table schema) — customers are paying and actively using it.
- **Availability**: Modernization must be shippable in safe increments; avoid a big-bang cutover that risks extended downtime.
- **Tech stack (target)**: Vue 3, a currently-supported bundler, supported UI component libraries; keep Sentry, Stripe, and the VTT working throughout.
- **Backend (this milestone)**: Keep the AWS backend (Cognito, DynamoDB, `FCSStripe` Lambda) intact during Milestone 1 — only the frontend/tooling changes now.
- **Budget/solo maintainer**: Single maintainer; prefer well-supported, low-maintenance choices over bleeding-edge.
- **Platform**: Windows dev environment.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Two milestones: (1) frontend/tooling modernization, (2) AWS→Firebase backend migration | Stabilize the frontend and abstract the backend before swapping platforms; avoids migrating a moving target | — Pending |
| Milestone 1 = Vue 2→3 + build tooling + dependency modernization; backend stays on AWS | Decouples the high-risk framework upgrade from the high-risk platform migration | — Pending |
| Defer `aws-sdk` v2→v3 upgrade | Milestone 2 removes the AWS client stack entirely; upgrading it now is throwaway work | — Pending |
| Introduce a backend service abstraction during Milestone 1 | Makes the Milestone 2 Firebase swap a contained change instead of a codebase-wide rewrite | — Pending |
| Feature-freeze during modernization | Keep the migration a like-for-like port; reduce surface area for regressions | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Business Context check — customer, revenue model, success metric still accurate?
4. Audit Out of Scope — reasons still valid? (e.g. promote Milestone 2 Firebase migration from Out of Scope to Active)
5. Update Context with current state

---
*Last updated: 2026-07-23 after initialization*
