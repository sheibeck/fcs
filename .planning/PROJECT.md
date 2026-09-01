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

## Current Milestone: v2.0 Ground-up Rebuild on Firebase

**Goal:** Rebuild Fate Character Sheet from scratch as a modern app hosted on Firebase, preserving 100% of existing functionality and migrating all existing users and their data — with zero loss for paying subscribers.

**Non-negotiable premise:** On-screen character sheets must look like the printed, at-the-table Fate character sheets. This print fidelity is the product's reason to exist and is the primary lens for stack/framework selection.

**Target features:**
- Fresh stack — framework is open (Vue 3 or a better-fit alternative), decided by research and judged on print-fidelity sheet rendering, Firebase fit, and solo-maintainer DX
- Firebase Hosting (replaces S3/CloudFront), Firebase Auth (replaces Cognito), Firestore (replaces DynamoDB)
- Stripe subscriptions preserved as-is (billing continuity for paying users)
- All 12 Fate game-system sheets, campaigns/scenes/adversaries CRUD, Fate dice roller
- Peer-to-peer VTT (PeerJS) re-verified; signaling server moved off Heroku onto Firebase-family infra (Cloud Run / Functions / managed alternative — TBD by research)
- User + data migration from Cognito/DynamoDB into Firebase Auth/Firestore, with safe cutover for the FULL user base (not just active users)

**Key context:** Live product, paying Stripe subscribers. ~259 *active* users / ~1.3k views per 7 days per Google Analytics — but the TOTAL registered user base (Cognito user pool + DynamoDB records) is unknown and likely much larger; determining the true user/record count is an early migration task. "From scratch" means a new codebase but the same product surface and the same migrated data. This greenfield rebuild **supersedes** the earlier incremental two-milestone plan (Vue 2→3 modernization, then Firebase).

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
| **v2.0 pivot: greenfield rebuild on Firebase instead of incremental migration** | User chose to rebuild from scratch on a best-fit stack rather than migrate the aging Vue 2 app in place; supersedes the two-milestone incremental plan | — Active (v2.0) |
| Framework left open (research & recommend) | Print-fidelity sheet rendering + Firebase fit + solo-maintainer DX should drive the choice, not concept-continuity with the old app | — Pending research |
| Keep Stripe as the billing processor; integration approach open | Stripe is an accepted, working payment system and stays. HOW it's wired is open — evaluate the official Firebase "Run Subscriptions with Stripe" extension vs. porting the `FCSStripe` logic to a Cloud Function, chosen on which better preserves billing continuity for existing subscribers. Prefer the extension if it can adopt existing Stripe customers. | — Decided (integration TBD) |
| Move PeerJS signaling off Heroku onto Firebase-family infra | Consolidate hosting under Firebase/GCP; Cloud Run is the fit (persistent WebSockets), confirmed by research | — Decided (Cloud Run) |
| Stack: Vue 3.5 + Vite, static SPA on Firebase Hosting; Pinia; VueFire | Research recommendation; print-fidelity lives in CSS (framework-agnostic), so Firebase fit + solo-maintainer DX + existing Vue investment decide it | — Decided |
| Language: TypeScript | User chose full static typing end-to-end; safer for the schemaless→typed data-model redesign; retrofitting later is costly | — Decided |
| VTT audio/video (WebRTC) IN v2.0 scope | User confirmed it's used/expected — rebuild for parity at launch, not deferred | — Decided |
| One-click PDF export (Cloud Run + Puppeteer) IN v2.0 launch | User wants a Download-PDF button at launch on top of browser print | — Decided |
| Roll20 "Fate of 20" integration deferred to fast-follow | No confirmed usage; separately-maintained. NOTE: the extension was removed from Chrome Web Store on 2026-08-31 for Manifest V2 deprecation and needs an independent MV2→MV3 migration to return — decoupled from the rebuild | — Deferred (+ MV3 migration tracked) |

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
*Last updated: 2026-08-31 — started milestone v2.0 (greenfield Firebase rebuild)*
