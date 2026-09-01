# Roadmap: Fate Character Sheet — v2.0 Greenfield Rebuild on Firebase

## Overview

Fate Character Sheet v2.0 rebuilds a live, paying-subscriber Vue 2 app from scratch on Firebase (Vue 3.5 + Vite + TypeScript, Firestore, Firebase Auth, Cloud Functions, Cloud Run) while migrating the FULL registered user base with zero data loss and preserving print-fidelity character sheets. The journey starts by measuring the true migration surface and resolving the Cognito identity spike — the gate that sizes every downstream migration decision — then stands up the platform and gated CI/CD, and locks the Firestore data model + Security Rules + migration pipeline before wiring Auth. It rebuilds the highest-risk, load-bearing character sheets with print fidelity verified on real paper, then campaigns/scenes/adversaries, Stripe billing continuity, and the peer-to-peer VTT. Finally it de-risks the cutover with a real-subscriber soft launch and parity checklist before an atomic full cutover with a documented rollback — favoring incremental, independently-verifiable phases over a long dark rewrite period.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Migration Measurement & Identity Spikes** - Measure the true user/record counts and resolve the Cognito identity + field-mapping spikes that gate all downstream migration work
- [ ] **Phase 2: Platform Foundation & CI/CD** - Stand up the Vue 3.5 + Vite + TypeScript app on two isolated Firebase projects with a lint/test-gated pipeline and Windows emulator
- [ ] **Phase 3: Data Model, Security Rules & Migration Pipeline** - Lock the Firestore schema (IDs preserved), enforce owner-scoped tested rules, and build export→transform→load→reconcile
- [ ] **Phase 4: Authentication & Account Migration** - Firebase Auth register/login/logout/recovery plus shadow-auth-on-first-login so existing users migrate without a forced reset
- [ ] **Phase 5: Character Sheets & Print Fidelity** - Rebuild the reactive data layer and all 12 sheets with real-printer print fidelity, CRUD, templates, images, and one-click PDF export
- [ ] **Phase 6: Campaigns, Scenes & Adversaries** - Campaign/session-log/Important-Things, public summaries, and adversary CRUD with search + pagination; scenes/scene-objects CRUD
- [ ] **Phase 7: Billing & Subscription Continuity** - Preserve Stripe billing: integration decision, checkout/portal, idempotent access-gating webhook, and existing-subscriber linkage migration
- [ ] **Phase 8: Virtual Tabletop & Live Play** - Cloud Run PeerJS signaling, Scene Builder, host/join, chat/dice/fate/invoke messaging, audio/video, companion popup, and standalone dice roller
- [ ] **Phase 9: Soft Launch & Parity Validation** - A small cohort of real subscribers uses the new app against real migrated data, tracked by a parity checklist, to produce a cutover go/no-go
- [ ] **Phase 10: Full Cutover & Rollback** - Atomic production data + user + Stripe-webhook migration with monitoring, a documented rollback plan, and 24–48h post-cutover observation

## Phase Details

### Phase 1: Migration Measurement & Identity Spikes
**Goal**: Establish the true migration surface — real account/record counts and a validated identity + field mapping — so all downstream migration tooling is sized against reality, not the GA-visible ~259 active users.
**Depends on**: Nothing (first phase)
**Requirements**: MIGP-01, MIGP-02, MIGP-03
**Success Criteria** (what must be TRUE):
  1. The true registered-user count (Cognito) and per-`object_type` record counts (DynamoDB) are measured and recorded in the migration runbook.
  2. A working mechanism maps each Cognito Identity-Pool ID to its User-Pool `sub` (the target Firebase uid), demonstrated against a real sample.
  3. A field-by-field DynamoDB→Firestore mapping artifact exists and is validated against a large real-record sample, with every legacy/sparse field given an explicit destination or a documented drop decision.
**Gate**: Research/verification — Phase 0 measurement + Cognito identity-mapping spike + real-record field inventory. Gates all downstream migration sizing (import batching, window length, Stripe mapping); no migration tooling is built until this closes.
**Plans**: TBD

### Phase 2: Platform Foundation & CI/CD
**Goal**: Stand up the new Vue 3.5 + Vite + TypeScript app on Firebase Hosting with two hard-isolated environments and a gated CI/CD pipeline, so every later phase deploys incrementally and safely.
**Depends on**: Nothing (independent of Phase 1 — can proceed in parallel)
**Requirements**: PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05
**Success Criteria** (what must be TRUE):
  1. The app builds from a Vue 3.5 + Vite + TypeScript scaffold and deploys to a live Firebase Hosting URL.
  2. Separate `fcs-beta` and `fcs-prod` Firebase projects exist and provide hard data isolation between test and real subscriber data.
  3. The pipeline runs `lint` + `test` as required gates and, only on green, deploys hosting/functions/Cloud Run; a red gate blocks deploy.
  4. A developer can run the full Firebase emulator suite (auth/Firestore/functions) locally on Windows.
  5. Runtime errors from the new app surface in Sentry with correct release/source-map symbolication.
**Plans**: TBD

### Phase 3: Data Model, Security Rules & Migration Pipeline
**Goal**: Lock the Firestore schema (preserving existing document IDs), enforce owner-scoped access via tested Security Rules, and build the export→transform→load→reconcile migration pipeline sized for the full user base.
**Depends on**: Phase 1 (identity + field-mapping artifact), Phase 2 (Firebase projects + emulator)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. Characters, campaigns, scenes, scene objects, adversaries, campaign logs, and users exist as Firestore collections with existing document IDs preserved.
  2. Security Rules deny cross-owner reads/writes and allow owner-scoped and public access, proven by emulator unit tests (including "user A cannot read/write user B's data").
  3. The migration pipeline exports DynamoDB, transforms to the Firestore schema, and loads with batching/ramp into a staging project without dropping or mis-owning records.
  4. A reconciliation pass reports matching row counts and referential integrity after a load, quarantining any unresolved records into a review file rather than silently dropping them.
**Gate**: Research/verification — enumerate every real app query and validate composite indexes (`firestore.indexes.json`) before the schema/rules are locked; indexes committed to source control, not created ad hoc.
**Plans**: TBD

### Phase 4: Authentication & Account Migration
**Goal**: Users can manage their accounts on Firebase Auth, and existing users log in without a forced reset via shadow-auth-on-first-login.
**Depends on**: Phase 3 (users collection + Security Rules)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. A new user can register with email + password and receives an email verification.
  2. A user can log in, log out, and stay logged in across a page refresh.
  3. A user can reset a forgotten password via an email link.
  4. An existing (migrated) user logs in with their old credentials without a forced reset — their Firebase password is set transparently on first login by verifying against retained read-only Cognito — with a forced-reset fallback only for genuinely dormant accounts.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Character Sheets & Print Fidelity
**Goal**: Rebuild the shared-character data layer and all 12 Fate game-system sheets with print fidelity, plus full character CRUD, templates, images, and one-click PDF export. This is the highest-risk, most load-bearing work — the data layer is redesigned BEFORE the 12 sheets are ported.
**Depends on**: Phase 3 (data model), Phase 4 (auth / ownership)
**Requirements**: SHEET-01, SHEET-02, SHEET-03, SHEET-04, SHEET-05, SHEET-06, SHEET-07
**Success Criteria** (what must be TRUE):
  1. Sheets read/write character data through a redesigned reactive, typed data-access layer with no `eval()`, and a single sheet registry replaces the dual components-map + validSheets whitelist.
  2. All 12 Fate game-system sheets render and print with fidelity to the printed sheets, verified on actual printed output in Chrome and Firefox on Windows.
  3. Sheet widgets — skill pyramids, aspects, stress tracks, consequences, fate points, scene objects — reach parity.
  4. A user can create, edit, and delete characters — including the custom "Fate Anything" sheet and reusable sheet templates — and attach/display images on a sheet.
  5. A user can export a sheet to PDF with one click (Cloud Run + Puppeteer) in addition to browser print.
**Gate**: Research/verification — print fidelity confirmed on real printer output (Chrome/Firefox/Windows) before any sheet is "done"; a print-regression detection mechanism is a deliverable, repeated across all 12 sheets.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Campaigns, Scenes & Adversaries
**Goal**: Rebuild campaign/scene/adversary management with session logs, tag-driven Important Things, public views, and adversary search/pagination at parity.
**Depends on**: Phase 4 (auth), Phase 5 (character / scene-object data layer)
**Requirements**: CAMP-01, CAMP-02, CAMP-03, CAMP-04, CAMP-05
**Success Criteria** (what must be TRUE):
  1. A user can create, edit, and delete campaigns with a session log.
  2. Campaign tag parsing (`#`/`!`/`@`/`~`) builds the cross-referenced, alphabetized "Important Things" sidebar.
  3. A public campaign summary view renders for shared links at parity.
  4. A user can create, edit, and delete adversaries with public/private visibility, and browse them with working search and pagination.
  5. Scenes and scene objects can be created, edited, and deleted at parity.
**Gate**: Research/verification — search-architecture decision gate: confirm Firestore prefix search is sufficient for adversary/character search at scale, or adopt a dedicated search service (Algolia/Typesense).
**Plans**: TBD
**UI hint**: yes

### Phase 7: Billing & Subscription Continuity
**Goal**: Preserve Stripe billing continuity across the rebuild — resolve the integration approach, wire checkout/portal, an idempotent access-gating webhook, and migrate existing subscribers' linkage.
**Depends on**: Phase 4 (Firebase Auth uid + custom claims). Independent of Phases 5–6/8 — parallelizable.
**Requirements**: BILL-01, BILL-02, BILL-03, BILL-04
**Success Criteria** (what must be TRUE):
  1. The Stripe integration approach (official extension vs. Cloud Function port) is chosen on which preserves existing subscribers, decided before implementation begins.
  2. A user can start a subscription via checkout and manage it via the customer portal, including trial handling.
  3. The Stripe webhook handler is idempotent on event id and gates app access via a `subscriptionActive` signal.
  4. Every existing paying subscriber — mapped from Stripe's own customer list, not an active-user list — has their customer/subscription linkage migrated with uninterrupted billing.
**Plans**: TBD

### Phase 8: Virtual Tabletop & Live Play
**Goal**: Rebuild the peer-to-peer VTT end to end — Cloud Run signaling, Scene Builder, host/join, in-play chat/dice/fate/invoke messaging, audio/video, companion popup — plus the standalone Fate dice roller.
**Depends on**: Phase 5 (characters), Phase 6 (adversaries / scenes). PeerJS signaling (VTT-01) is an independent subsystem and may be built in parallel earlier.
**Requirements**: VTT-01, VTT-02, VTT-03, VTT-04, VTT-05, VTT-06, VTT-07, DICE-01
**Success Criteria** (what must be TRUE):
  1. PeerJS signaling runs on Cloud Run (off Heroku) with min-instances 1 + session affinity, and survives a realistic multi-hour session load test with idle-then-burst patterns.
  2. A GM can host a scene and players can join over PeerJS data channels, using a pannable/zoomable Scene Builder with zones and draggable objects carrying aspects/skills/stress/consequences/turn-order.
  3. In-play chat, dice-roll slash commands, fate-point tracking, and invoke/boost/aspect-action messaging work, and scene state can be saved to a campaign.
  4. VTT audio/video (WebRTC voice/video) and the lightweight "fcsVtt" companion sheet popup reach parity.
  5. The standalone Fate dice roller reaches parity.
**Gate**: Research/verification — PeerJS/Cloud Run reliability: a multi-hour realistic burst/idle load test must pass before the signaling server is relied upon for live games.
**Plans**: TBD
**UI hint**: yes

### Phase 9: Soft Launch & Parity Validation
**Goal**: Let a small cohort of real existing subscribers use the new app against real migrated data, tracked by an explicit parity checklist, to surface gaps solo testing misses before any big-bang cutover.
**Depends on**: Phase 3 (migration pipeline), Phases 5, 6, 7, 8 (functional parity)
**Requirements**: CUT-01
**Success Criteria** (what must be TRUE):
  1. A small cohort of existing subscribers can use the new app (behind a feature flag / separate subdomain) against real migrated data while the old AWS app keeps serving everyone else.
  2. An explicit parity checklist tracks verified-working vs. not-yet-verified user-facing behaviors across sheets, campaigns, billing, and VTT.
  3. A documented go/no-go decision for full cutover is produced from the cohort's real-world results.
**Gate**: Research/verification — soft-launch go/no-go: full cutover does not proceed until the parity checklist and cohort results support it (the anti-"rewrite-trap" safeguard).
**Plans**: TBD

### Phase 10: Full Cutover & Rollback
**Goal**: Execute the full production migration atomically with the Stripe webhook cutover, under monitoring, with a documented rollback plan and post-cutover observation confirming zero regressions.
**Depends on**: Phase 9 (go/no-go)
**Requirements**: CUT-02, CUT-03, CUT-04
**Success Criteria** (what must be TRUE):
  1. Full production data + user migration executes within a scheduled maintenance window with monitoring, and record counts verify against Phase 1's true baseline.
  2. The Stripe webhook endpoint cuts over atomically with the data migration, with no dropped or double-processed billing events.
  3. A documented, tested rollback plan exists and the old AWS stack is retained read-only as a rollback path for a defined window before decommissioning.
  4. Post-cutover observation (24–48h) confirms no data loss and no auth, billing, or live-play regressions.
**Gate**: Research/verification — rollback plan reviewed and signed off before the maintenance window opens; 24–48h post-cutover observation window with monitoring dashboards.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Migration Measurement & Identity Spikes | 0/TBD | Not started | - |
| 2. Platform Foundation & CI/CD | 0/TBD | Not started | - |
| 3. Data Model, Security Rules & Migration Pipeline | 0/TBD | Not started | - |
| 4. Authentication & Account Migration | 0/TBD | Not started | - |
| 5. Character Sheets & Print Fidelity | 0/TBD | Not started | - |
| 6. Campaigns, Scenes & Adversaries | 0/TBD | Not started | - |
| 7. Billing & Subscription Continuity | 0/TBD | Not started | - |
| 8. Virtual Tabletop & Live Play | 0/TBD | Not started | - |
| 9. Soft Launch & Parity Validation | 0/TBD | Not started | - |
| 10. Full Cutover & Rollback | 0/TBD | Not started | - |
