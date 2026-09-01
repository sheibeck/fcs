# Requirements: Fate Character Sheet — v2.0 Greenfield Rebuild on Firebase

**Defined:** 2026-08-31
**Core Value:** Paying subscribers keep full, uninterrupted access to their existing characters, campaigns, and live-play features through a from-scratch rebuild — zero data loss, no functional regressions, and character sheets that still look like the printed at-the-table Fate sheets.

**Scope note:** This is a like-for-like PARITY rebuild on a new platform (Firebase), not a feature expansion. Internal architecture is free to be redesigned for stability/maintainability (legacy internals are not binding, known bugs are fixed). Two constraints are hard: (1) user-facing functionality + print-fidelity parity, and (2) zero data loss migrating the full registered user base.

## v1 Requirements

### Foundation & Platform (PLAT)

- [ ] **PLAT-01**: App is a Vue 3.5 + Vite + TypeScript SPA deployed to Firebase Hosting (replaces S3/CloudFront)
- [ ] **PLAT-02**: Separate `beta` and `prod` Firebase projects provide hard data isolation
- [ ] **PLAT-03**: CI/CD pipeline builds and deploys hosting, Cloud Functions, and Cloud Run, with `lint` + `test` as required gates before deploy
- [ ] **PLAT-04**: Firebase emulator suite runs locally on Windows for auth/Firestore/functions development
- [ ] **PLAT-05**: Error/performance monitoring (Sentry) is wired into the new app

### Migration Readiness (MIG-PREP)

- [ ] **MIGP-01**: The true registered-user count (Cognito) and record counts per `object_type` (DynamoDB) are measured before migration tooling is sized
- [ ] **MIGP-02**: The Cognito Identity-Pool-ID → target user identity mapping mechanism is resolved (spike)
- [ ] **MIGP-03**: A field-by-field mapping from real sampled DynamoDB records to the Firestore schema is produced and validated against a large sample

### Data Model (DATA)

- [ ] **DATA-01**: Firestore collections model characters, campaigns, scenes, scene objects, adversaries, campaign logs, and users, preserving existing document IDs
- [ ] **DATA-02**: Security Rules enforce owner-scoped read/write (replacing Cognito IAM-scoped credentials) and are covered by emulator unit tests
- [ ] **DATA-03**: A migration transform pipeline exports DynamoDB, transforms to the Firestore schema, and loads with batching/ramp for the full user base
- [ ] **DATA-04**: A reconciliation pass verifies row counts and referential integrity after any load

### Authentication & Accounts (AUTH)

- [ ] **AUTH-01**: User can register with email + password (Firebase Auth)
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can log in and log out; session persists across refresh
- [ ] **AUTH-04**: User can reset/recover password via email
- [ ] **AUTH-05**: Existing users can log in without a forced reset via shadow-auth-on-first-login (verify against retained Cognito, then set Firebase password); forced reset only as a dormant-account fallback

### Character Sheets (SHEET)

- [ ] **SHEET-01**: A redesigned reactive shared-character data-access layer replaces getVal/setVal (no eval(), idiomatic Vue 3 + typed schema)
- [ ] **SHEET-02**: All 12 Fate game-system sheets render with parity and print fidelity to the printed sheets, verified on actual printed output (Chrome/Firefox on Windows)
- [ ] **SHEET-03**: Sheet widgets reach parity — skill pyramids, aspects, stress tracks, consequences, fate points, scene objects
- [ ] **SHEET-04**: A single sheet registry replaces the dual components-map + validSheets whitelist
- [ ] **SHEET-05**: User can create, edit, and delete characters, including the custom "Fate Anything" sheet and reusable sheet templates
- [ ] **SHEET-06**: Images can be attached to/displayed on sheets
- [ ] **SHEET-07**: User can export a character sheet to PDF via a one-click Download-PDF (Cloud Run + Puppeteer), in addition to browser print

### Campaigns, Scenes & Adversaries (CAMP)

- [ ] **CAMP-01**: User can create/edit/delete campaigns with a session log
- [ ] **CAMP-02**: Campaign tag parsing (`#`/`!`/`@`/`~`) builds the cross-referenced, alphabetized "Important Things" sidebar
- [ ] **CAMP-03**: Public campaign summary view reaches parity
- [ ] **CAMP-04**: User can create/edit/delete adversaries with public/private visibility, search, and pagination
- [ ] **CAMP-05**: Scenes (and scene objects) CRUD reaches parity

### Billing (BILL)

- [ ] **BILL-01**: Stripe remains the billing processor; the extension-vs-Cloud-Function integration is chosen on which preserves existing subscribers (evaluated first)
- [ ] **BILL-02**: User can start a subscription (checkout) and manage it (customer portal), including trial handling
- [ ] **BILL-03**: The Stripe webhook handler is idempotent on event id and gates access via a `subscriptionActive` signal
- [ ] **BILL-04**: Existing paying subscribers' customer/subscription linkage is migrated (from Stripe's own customer list) with uninterrupted billing across cutover

### Virtual Tabletop / Live Play (VTT)

- [ ] **VTT-01**: PeerJS signaling runs on Cloud Run (off Heroku) with min-instances 1 + session affinity, load-tested for realistic multi-hour sessions
- [ ] **VTT-02**: GM can host a scene and players can join (PeerJS data channels)
- [ ] **VTT-03**: Scene Builder reaches parity — pannable/zoomable canvas, zones, draggable objects with aspects/skills/stress/consequences/turn-order
- [ ] **VTT-04**: In-play chat, dice-roll slash commands, fate-point tracking, and invoke/boost/aspect-action messaging reach parity
- [ ] **VTT-05**: Scene state can be saved to a campaign
- [ ] **VTT-06**: VTT audio/video (WebRTC voice/video) reaches parity in live play
- [ ] **VTT-07**: The lightweight companion sheet popup ("fcsVtt" mode) reaches parity

### Dice (DICE)

- [ ] **DICE-01**: Standalone Fate dice roller reaches parity

### Launch, Migration & Cutover (CUT)

- [ ] **CUT-01**: A parallel-run / soft launch lets a small cohort of existing subscribers use the new app against real migrated data, tracked by an explicit parity checklist, before full cutover
- [ ] **CUT-02**: Full production data + user migration executes with monitoring and a documented rollback plan
- [ ] **CUT-03**: The Stripe webhook endpoint cuts over atomically with the data migration
- [ ] **CUT-04**: Post-cutover observation (24–48h) confirms no data loss, auth, billing, or live-play regressions

## v2 Requirements

Deferred to a future release. Tracked but not in the v2.0 roadmap.

### Roll20 Integration (R20)

- **R20-01**: Rebuild the web app's "Fate of 20" integration hook (fast-follow after v2.0 core parity)
- **R20-02**: Migrate the `fateof20-extension/` browser extension from Manifest V2 to Manifest V3 and resubmit to the Chrome Web Store — the listing was removed on 2026-08-31 for MV2 deprecation. Decoupled from the Firebase rebuild; can be done independently at any time.

### Search (SRCH)

- **SRCH-01**: If Firestore substring search proves insufficient for adversary/character search at scale, integrate a dedicated search service (Algolia/Typesense) — decision gate during the Campaigns/Adversaries phase.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New product features / new game systems | Feature-freeze — the rebuild is a like-for-like parity port to reduce regression surface |
| Visual redesign / UX overhaul | Preserve the existing UI and print-fidelity look; only change what the stack swap forces |
| Keeping any AWS component (Cognito, DynamoDB, S3/CloudFront, FCSStripe Lambda) long-term | Fully replaced by Firebase; Cognito retained only transiently for shadow-auth migration |
| Preserving legacy internal architecture (getVal/setVal, single-table quirks, dual registry) | Explicitly non-binding — redesigned for stability/maintainability |
| Roll20 "Fate of 20" integration at v2.0 launch | Deferred to fast-follow; see R20-01/R20-02 |

## Traceability

Coverage is filled in by the roadmapper during ROADMAP.md creation.

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: TBD (roadmap)
- Unmapped: TBD

---
*Requirements defined: 2026-08-31*
*Last updated: 2026-08-31 after v2.0 requirements scoping*
