# Fate Character Sheet v2.0 — Research Summary

**Project:** Fate Character Sheet — v2.0 Greenfield Rebuild on Firebase
**Domain:** Greenfield rebuild + AWS→Firebase migration of a live, paying-subscriber SPA with print-fidelity character sheets
**Researched:** 2026-08-31
**Confidence:** HIGH overall (framework/tooling, architecture patterns); MEDIUM on cloud-specific behaviors (Firestore cost modeling, PeerJS/Cloud Run reliability); MEDIUM-HIGH on migration logistics (unknowns about true user/record scale, Cognito identity mapping).

## Executive Summary

Fate Character Sheet v2.0 is a greenfield rebuild of a live, in-production Vue 2 app onto a modern Firebase stack, maintaining 100% user-facing functionality and zero data loss for the full registered user base (true size unknown but likely several times the GA-visible ~259 active users). The research strongly recommends **Vue 3.5 + Vite + Pinia for a static Firebase-hosted SPA**, paired with **Firestore for data, Firebase Auth for user identity, and Cloud Run for stateful PeerJS signaling**, prioritizing print-fidelity character-sheet rendering as the non-negotiable core value and real-world data integrity over architectural perfection.

The highest-risk areas are **migration mechanics at unknown scale** (sizing timelines against the true Cognito/DynamoDB record counts, not GA figures), **auth continuity for dormant accounts** (shadow-login fallback rather than forced password reset), **Stripe billing continuity** (mapping every paying subscriber, not just active users), and **print-fidelity validation** (must test actual paper output across real print engines). The rebuild is *free* to redesign internal architecture, but is *bound* by two hard constraints: (1) preserve all user-visible functionality + print-fidelity sheet rendering, and (2) migrate every existing account and record without loss.

## Key Findings

### Recommended Stack

**Vue 3.5 + Vite 8, deployed as a static SPA on Firebase Hosting, with VueFire for Firestore/Auth bindings, Pinia for modular state management, and a small Cloud Run Puppeteer service for one-click PDF export.**

**Core technologies:**
- **Vue 3.5.x** — mature, stable, actively maintained; Composition API fits the rebuild's new patterns
- **Vite 8.x** — zero-config Vue SFC bundling, instant HMR, native Firebase Hosting compatibility
- **Pinia 4.x** — Vuex's officially-endorsed successor; modular by design (fixes the "monolithic 150-line Vuex store" tech debt)
- **Firebase JS SDK 12.x** — replaces Cognito + DynamoDB client SDKs entirely
- **VueFire 3.x** — Vue core team's Firestore/Auth bindings; Composition API composables reduce boilerplate
- **Tailwind CSS 4.3.x** (app chrome) + hand-authored sheet SCSS — separates UI chrome from character-sheet layouts (must reproduce paper fidelity exactly)
- **Zod 4.x** — runtime schema validation + static type derivation; replaces the current "No Input Validation Framework" gap and enables safe nested-path access without `eval()`
- **Cloud Run + Puppeteer** — for one-click PDF export (server-rendered, consistent across browsers)

**Supporting libraries:** Reka UI (unstyled dialog/dropdown/modal primitives), `@vueuse/core` (composable utilities), vue-draggable-plus (drag-list), vue3-colorpicker, @vuepic/vue-datepicker, vue-sonner (toast), luxon (date/time), @sentry/vue (error/perf monitoring).

**Development:** Vitest (Vite-native Jest replacement), firebase-tools (emulator suite), ESLint flat config + Vue 3 ruleset.

### Expected Features

**Table stakes (must rebuild for full parity):**
- 12 Fate game-system character sheets with exact print-fidelity rendering
- `getVal`/`setVal`-equivalent shared character data-access pattern (redesigned — no `eval()`, idiomatic Vue 3 reactivity)
- Character CRUD + custom "Fate Anything" + reusable sheet templates
- Campaigns with session log + tag parsing (`#`/`!`/`@`/`~`) + Important Things aggregation
- Adversaries CRUD + public/private visibility + search + pagination
- VTT Scene Builder (canvas/zones/objects/aspects/skills/stress/consequences/turn-order)
- VTT host/join/chat/dice-roll/save-to-campaign (PeerJS data-channel)
- Full auth (register/email-verify/login/logout/password-recovery)
- Stripe subscription checkout/portal/trial (Stripe stays; integration approach open — see Billing)
- User + character/campaign/scene/adversary data migration with zero data loss for the full user base

**Differentiators (real shipped functionality, deferrable as fast-follow):**
- VTT audio/video (WebRTC) — **scope uncertainty**: no data on actual usage; recommend post-launch validation
- Companion sheet popup ("fcsVtt" mode)
- Dice roller (standalone modal) — low effort, keep

**Explicit product decisions needed (not assumed in v2.0 scope):**
- Roll20 "Fate of 20" extension — requires explicit user decision; separately-maintained codebase, Chrome-only, high integration burden, no test coverage; defer unless confirmed active usage
- Known bugs to FIX during rebuild (user confirmed legacy behavior is not binding): character→scene condition sync, duplicate-character-in-scene prevention, host-must-be-subscriber gating

### Architecture Approach

**Firestore data model:** Flat top-level collections (`characters`, `campaigns`, `scenes`, `adversaries`, `campaignLogs`, `sceneObjects`, `users`) with `ownerId`/`relatedId` fields, replacing DynamoDB's single-table/GSI pattern. This mirrors existing access patterns 1:1 without GSI machinery, and keeps document IDs unchanged so existing `related_id` references continue to resolve. Security Rules enforce owner-scoped read/write.

**Auth migration:** Firebase Auth replaces Cognito. **Critical decision:** use shadow-auth-on-first-login (fallback to read-only Cognito for users who haven't migrated yet) rather than forced password reset — dormant accounts (likely the majority of the true user base) must not be stranded with no login path.

**Billing (Stripe stays; integration approach open — coordinator decision):** Stripe remains the billing processor. Evaluate the official Firebase **"Run Subscriptions with Stripe" extension** vs. porting the `FCSStripe` Lambda's operations to a callable Cloud Function. **Prefer the extension IF it can adopt existing Stripe customers/subscriptions** without re-plumbing paying subscribers; otherwise port to a Cloud Function. Tiebreaker in both cases: **uninterrupted billing continuity for existing subscribers**, mapped from Stripe's own customer list (not the active-user list). Resolve this as the first task of the billing phase.

**PeerJS signaling:** Cloud Run (not Cloud Functions — no WebSocket support). **Critical gotcha:** `peerjs-server` keeps peer registry in-memory; with multiple instances and no shared state, peers registered on instance A become invisible to instance B. Solution: set `min-instances: 1` (disables scale-to-zero, ~$5–10/mo always-on cost) and cap `max-instances: 1` OR enable session affinity. Load-test realistic burst/idle multi-hour sessions before relying on it.

**Hosting / CI-CD:** Two separate Firebase projects (`fcs-beta`, `fcs-prod`) for hard data isolation. GitHub Actions pipeline with `firebase deploy --only hosting`, `firebase deploy --only functions`, `gcloud run deploy`. **Add `yarn lint` + `yarn test` as required gates before deploy** (current beta auto-deploy skips these — not worth carrying forward).

### Critical Pitfalls to Avoid

1. **Planning migration against GA "259 active users" instead of the true total account/record count.** Every downstream estimate (import batch sizes, Firestore throughput, maintenance-window duration, Stripe customer mapping) gets sized wrong if based on the GA figure. **Fix:** Query real numbers first: `aws cognito-idp list-users` and DynamoDB scan per `object_type`.

2. **Assuming Cognito password hashes can be exported for Firebase import.** Cognito uses SRP (no portable hash); Firebase bulk-import only accepts recognized algorithms. Forced password-reset migration disproportionately fails dormant accounts. **Fix:** Shadow-auth-on-first-login (fallback to read-only Cognito during login, then migrate password server-side); keep Cognito live for a genuinely long tail.

3. **Designing Firestore schema without inventorying what real DynamoDB records actually contain.** Schemaless DynamoDB accumulates years of undocumented field variation; a schema redesigned purely from the new app's UI needs can silently drop legacy/sparse fields. **Fix:** Sample real records per `object_type`, build an explicit field-by-field mapping, validate against a large sample during migration dry-run.

4. **Big-bang export/import at true scale without reconciliation/throughput awareness.** Firestore bulk-write has real throughput ceilings (500/batch, ramp limits); scripts that "work" on small test data throttle at true scale. **Fix:** Batch, ramp, load-test against realistic scale before the real run; build reconciliation pass comparing item counts/hashes.

5. **Stripe billing discontinuity for dormant-but-paying subscribers.** Webhook endpoint must cut over atomically with data migration; the new handler must be idempotent on `event.id`; the `customer_id`↔UID mapping must be built from Stripe's own customer export, not from "known active users." **Fix:** Shadow-run the new webhook before cutover, make it idempotent, cut atomically in the same maintenance window, build mapping from Stripe's full customer list.

6. **PeerJS on Cloud Run breaks from scale-to-zero + session-affinity loss.** Default Cloud Run autoscaling (scale-to-zero, cold start, instance termination during idle) kills WebSocket connections mid-session. **Fix:** Set `min-instances: 1` (always-on, ~$5–10/mo), enable session affinity, load-test realistic multi-hour sessions with burst/idle patterns.

7. **Rewrite-trap scope creep.** The rebuild is bound to only two hard constraints — functional + print-fidelity parity, and zero data loss — NOT to preserving old architecture. Scope creep beyond those two is the actual risk. **Fix:** Maintain an explicit parity checklist; redesign internals freely but resist adding new features mid-rebuild (feature-freeze holds).

## Implications for Roadmap

**Phase structure: a Phase 0 gate, an infra/data/auth foundation, load-bearing feature rebuilds, parallel backend services, then migration + soft-launch + cutover.**

### Phase 0: Pre-Build Measurement & Spikes (gates all downstream work)
True registered-account count, true DynamoDB record count per `object_type`, Cognito Identity-Pool-ID → User-Pool-`sub` mapping mechanism, real sample of DynamoDB records with full field inventory, field-by-field mapping artifact.

### Phase 1: Firebase Project Setup & Hosting Infrastructure
Two Firebase projects (beta/prod), GitHub Actions CI/CD with lint/test gates, Firebase emulator suite on Windows, Sentry reconfigured, Vue 3.5 + Vite scaffold.

### Phase 2: Firestore Data Model & Security Rules (with migration validation)
Firestore schema + indexes, Security Rules tested with emulator + unit tests, migration transform script (export/transform/load), reconciliation report.

### Phase 3: Firebase Auth & User Service
Register/login/logout/password-recovery, auth/firebase service, shadow-auth-on-first-login fallback, lazy-migration Cloud Function, user import pipeline.

### Phase 4: Core App Feature Rebuild — Characters & Sheets (highest-risk)
New reactive character data-access pattern (no `eval()`), all 12 sheets in Vue 3 with print-fidelity verified on actual printed paper (Chrome/Firefox/Windows), Character CRUD, custom templates, real-data testing. **Research/verification gate.**

### Phase 5: Campaigns & Adversaries (parallelizable with Phase 4)
Campaign CRUD + session log + tag parsing + Important Things, public summary view, Adversary CRUD + public/private + search + pagination. **Possible search-architecture decision gate (Firestore vs Algolia/Typesense).**

### Phase 6: VTT Scene Builder (depends on Characters + Adversaries)
Pannable/zoomable canvas, zones + draggable objects, scene-object properties.

### Phase 7: Stripe Integration (parallel with 4–6)
Resolve extension-vs-Cloud-Function first, then implement; webhook handler with idempotency, custom claims for `subscriptionActive`, shadow-run validation.

### Phase 8: VTT PeerJS Signaling (Cloud Run)
Containerized `peerjs-server` with `min-instances: 1` + session affinity, client repoint, multi-hour realistic load-test. **Verification gate.**

### Phase 9: VTT Host/Join/Chat/Dice (depends on Phase 8)
Host/join flow, chat + dice-roll slash commands, save-to-campaign, fate-point tracking, invoke/boost/aspect-action messaging.

### Phase 10: Parallel-Run / Soft Launch
New app on staging or behind a flag, 10–20 existing power-user subscribers beta-test against real migrated data, parity checklist, go/no-go.

### Phase 11: Data Migration — Full Cutover
Final export, final transform + load into production Firestore, final user import, Stripe webhook cutover, monitoring dashboards, rollback plan, 24–48h post-cutover observation.

### Research/verification gates
Phase 0 (measurement + identity spike), Phase 2 (query enumeration + index validation), Phase 4 (print-fidelity on real printers), Phase 5 (search architecture), Phase 8 (PeerJS/Cloud Run load-test).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Vue 3.5/Vite/Firebase ecosystem verified against npm/official sources; Pinia/VueFire by Vue core team; print-fidelity is CSS, not framework-dependent. |
| **Features** | HIGH | Inventory sourced directly from current codebase read in full; dependencies mapped. |
| **Architecture** | MEDIUM-HIGH | Firestore/Auth/Functions patterns official; PeerJS/Cloud Run, Stripe continuity, auth identity mapping have real gotchas flagged as Phase-0/2 gates. |
| **Pitfalls** | HIGH | 13 pitfalls from documented patterns; rewrite-trap and solo-maintainer budget reflect stated constraints. |
| **Overall** | **HIGH** | Execution risk concentrated in migration mechanics (Phases 0, 2, 11) and real-world validation. |

### Gaps to Address During Planning & Execution
1. True registered-user and DynamoDB-record counts — Phase 0.
2. Cognito Identity-Pool-ID → User-Pool-`sub` mapping — Phase 0 spike.
3. Actual JS shape of nested character fields (stringified JSON?) — Phase 0 sampling.
4. Firestore text-search vs Algolia/Typesense — Phase 5 gate.
5. VTT audio/video actual usage — user decision before soft-launch.
6. Roll20 "Fate of 20" extension usage — user decision.
7. Print-fidelity regression detection automation — Phase 4 deliverable.

---

**Research synthesis completed: 2026-08-31 — Ready for requirements definition and roadmap creation.**
