# Architecture Research — Firebase Target Architecture for FCS v2.0 Rebuild

**Domain:** Backend-platform migration (AWS → Firebase/GCP) for a client-heavy Vue SPA with a schemaless single-table data model, Cognito auth, Stripe billing, and a PeerJS peer-to-peer VTT.
**Researched:** 2026-08-31
**Confidence:** MEDIUM-HIGH overall — official Firebase/GCP docs are HIGH confidence; migration-specifics (Cognito identity mapping, exact record counts) are MEDIUM and flagged as open questions requiring verification against the real AWS account before committing to a plan.

> **Scale correction applied:** the "~259 users" figure in PROJECT.md is Google Analytics *active* users over 7 days, not the total registered/paying user base. The true count of Cognito user-pool accounts and DynamoDB records (including long-dormant accounts) is **unknown and could be materially larger**. Every recommendation below is written to be correct at unknown scale (hundreds to tens of thousands of accounts), and the migration plan's first concrete step is to measure the real numbers before deciding on migration mechanics or maintenance-window length.

---

## 1. System Overview — Target Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                    Browser SPA (new frontend framework)                │
│                         Firebase Web SDK (client)                      │
├───────────────┬───────────────────┬───────────────────┬───────────────┤
│  Firebase Auth │  Firestore         │  Cloud Functions   │  Cloud Run    │
│  (client SDK)  │  (client SDK, RTL) │  (callable/https)  │  (WebSocket)  │
│  email/pass    │  + Security Rules  │  Stripe ops,        │  peerjs-server│
│  ID token auto │  (owner isolation) │  custom claims,      │  signaling    │
│  refresh       │                    │  webhooks            │               │
└───────┬────────┴─────────┬─────────┴──────────┬──────────┴───────┬───────┘
        │                  │                    │                  │
        │                  │                    ▼                  │
        │                  │           ┌──────────────────┐        │
        │                  │           │   Stripe API      │        │
        │                  │           │   (unchanged)      │        │
        │                  │           └──────────────────┘        │
        ▼                  ▼                                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          Firebase Hosting                              │
│         static bundle, 2 projects (fcs-beta / fcs-prod)                │
│         GitHub Actions CI/CD (replaces S3/CloudFront pipeline)         │
└───────────────────────────────────────────────────────────────────────┘
```

**What disappears entirely:** Cognito Identity Pool + `AWS.CognitoIdentityCredentials` (temporary IAM-scoped AWS credentials), the manual `RefreshUserSession()` boilerplate in every DB call, `aws-sdk` in the browser bundle, S3/CloudFront, the `FCSStripe` Lambda's IAM-credentialed invocation path, Heroku.

**What replaces it, 1:1:**

| Current (AWS) | Target (Firebase/GCP) | Notes |
|---|---|---|
| Cognito User Pool | Firebase Auth (Email/Password provider) | See §3 |
| Cognito Identity Pool + IAM role | *(nothing — not needed)* | Firestore Security Rules replace credential-scoped IAM entirely |
| DynamoDB single-table (`FateCharacterSheet[_dev]`) | Firestore, flat top-level collections | See §2 |
| `FCSStripe` Lambda | Cloud Function (2nd gen, callable) | See §4 |
| PeerJS on Heroku (`fcs-peer-server.herokuapp.com`) | `peerjs-server` container on Cloud Run | See §5 |
| S3 + CloudFront | Firebase Hosting | See §6 |
| GitHub Actions (beta auto, prod manual) | GitHub Actions + `firebase deploy` | See §6 |
| Sentry, GTM, iubenda | Unchanged — client-side only, no AWS dependency | Out of scope for this research |

---

## 2. Firestore Data Model

### 2.1 Why a flat, top-level-collection design (not `users/{uid}/...` subcollections)

The current DynamoDB single-table design supports three access patterns via its three GSIs, and the Firestore model must preserve all three:

| DynamoDB GSI | Access pattern | Firestore equivalent |
|---|---|---|
| (base table: `owner_id` + `id`) | Get an object when you know the owner | `db.collection(<type>).doc(<id>)` filtered client-side by `ownerId` field, or just trust the doc ID |
| `item` (PK `id`, SK `owner_id`) | Get an object by ID **without knowing the owner** (public character/campaign links, VTT scene-object lookups) | Trivial — Firestore document IDs are globally unique per collection; `db.collection(<type>).doc(<id>).get()` needs no owner at all |
| `type` (PK `object_type`, SK `owner_id`) | List all objects of a type, optionally scoped to an owner, with public/private filtering | `db.collection(<type>).where('ownerId','==',uid)` or `.where('isPrivate','!=',true)` — needs Firestore composite indexes (see 2.4) |
| `relations` (PK `related_id`, SK `id`) | List all children of a parent regardless of owner (scene objects in a scene, logs in a campaign, characters built from a sheet template) | `db.collection(<type>).where('relatedId','==',parentId)` |

A `users/{uid}/characters/{id}` **subcollection** design (the "obvious" Firestore pattern for per-user data) breaks the `item` and `relations` patterns outright: you cannot fetch a document by ID alone without knowing which user's subcollection it lives in, and cross-owner relation queries become collection-group queries with extra complexity for no benefit here. **Recommendation: flat top-level collections with an `ownerId` field, mirroring the DynamoDB single-table shape** — this is the option that requires the least behavioral change to `dbService.js`'s existing query shapes (`GetObject`, `ListObjects`, `ListRelatedObjects` map almost 1:1 onto `.doc(id).get()`, `.where('ownerId','==',uid)`, `.where('relatedId','==',id)`).

### 2.2 Collections

| Firestore collection | Replaces `object_type` | Doc ID | Key fields |
|---|---|---|---|
| `characters` | `CHARACTER` | same as DynamoDB `id` (e.g. `CHARACTER\|0c85bbf7-...`, kept unchanged — see rationale below) | `ownerId`, `relatedId` (sheet system), `name`, `system`, `isPrivate`, plus the full sheet-specific payload (skills/aspects/stress/etc. as native nested maps) |
| `campaigns` | `CAMPAIGN` | same | `ownerId`, `name`, `isPrivate` |
| `campaignLogs` | `LOG` | same | `ownerId`, `relatedId` (campaign id), `name`, `description` |
| `scenes` | `SCENE` | same | `ownerId`, `name`, `playerIds` (array — see 2.5) |
| `sceneObjects` | `SCENEOBJECT` | same | `ownerId`, `relatedId` (scene id), `name`, sheet snapshot data |
| `adversaries` | `ADVERSARY` | same | `ownerId`, `name`, `genre`, `type`, `isPrivate` |
| `characterSheetTemplates` | `CHARACTERSHEET` | same | **Verify before migrating — see 2.6** |
| `users` (profile doc, not from DynamoDB) | *(new)* | `= Firebase Auth uid` | `email`, `stripeCustomerId`, `hadStripeTrial` — replaces Cognito custom attributes (see §3.3) |

**Keep the existing prefixed ID strings unchanged as Firestore document IDs** (e.g. `CHARACTER|0c85bbf7-88e9-4622-8ac7-32ddb35fb445`). Firestore allows arbitrary non-empty ID strings. This means every `related_id` reference in the exported data continues to resolve without any ID-rewriting logic — the only rewrite needed is `owner_id` → the new Firebase `ownerId` (uid). This meaningfully de-risks the transform step (fewer moving parts = fewer migration bugs).

### 2.3 Schemaless character shape — this is Firestore's native strength

Firestore documents are schemaless JSON by default; each `characters` doc can have wildly different fields per game system (Fate Core vs. Fate Accelerated vs. Middle-earth) with zero schema migration cost, same as DynamoDB today. The one structural change to make on the way in: **store nested character data (skills, aspects, stress, consequences) as native Firestore maps/arrays, not as stringified JSON blobs.**

The exported `db/FateCharacterSheet-DynamoDb-Model` sample data shows a field like:
```json
"skills": { "S": "{ \"label19\" : { \"S\" : \"willpower\" }, \"skill1\" : { \"S\" : \"0\" }, ... }" }
```
This is a DynamoDB-console export artifact (raw attribute-value wrapper, string-encoded) — it is **not evidence** that the live app treats `skills` as an opaque string; `dbService.js`'s `SaveObject`/`GetObject` just round-trip whatever JS object the Vue app hands it through `AWS.DynamoDB.DocumentClient`, which auto-marshals nested JS objects into DynamoDB's typed `M`/`S`/`N`/`BOOL` structure and back. **Open question, flag for the migration phase:** pull a real (non-console-export) row from the live `_dev` or prod table via the app's own `GetObject` call to confirm the actual in-app JS shape before writing the transform script — do not assume the sample file's string-encoded form is representative.

### 2.4 Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isOwner(data) {
      return request.auth != null && request.auth.uid == data.ownerId;
    }
    function isPublicRead(data) {
      return data.isPrivate != true;
    }
    function isSceneCollaborator(data) {
      return request.auth != null &&
        ('playerIds' in data) && request.auth.uid in data.playerIds;
    }

    match /characters/{id} {
      allow read: if isOwner(resource.data) || isPublicRead(resource.data);
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isOwner(resource.data);
    }

    match /campaigns/{id} { /* same pattern as characters */ }
    match /adversaries/{id} { /* same pattern as characters */ }
    match /campaignLogs/{id} {
      allow read: if isOwner(resource.data);
      allow write: if isOwner(resource.data);
    }

    match /scenes/{id} {
      allow read: if isOwner(resource.data) || isSceneCollaborator(resource.data);
      allow write: if isOwner(resource.data);
    }
    match /sceneObjects/{id} {
      allow read: if isOwner(resource.data) || isSceneCollaborator(get(/databases/$(database)/documents/scenes/$(resource.data.relatedId)).data);
      // scene objects move in real time over PeerJS, not Firestore — see gameServer.js finding below.
      // Firestore writes to sceneObjects should be periodic host-only persistence, not per-move.
      allow write: if isOwner(resource.data);
    }

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      // stripeCustomerId / subscriptionActive fields should be written ONLY by Cloud Functions
      // (Admin SDK bypasses rules) — do not allow client writes to those two fields specifically;
      // split into a sub-object or a separate `billing/{uid}` doc with rules that deny client writes entirely.
    }
  }
}
```

**Composite indexes to predeclare** (`firestore.indexes.json`) rather than discover at query time:
- `characters`: `(relatedId ASC, ownerId ASC)` — characters built from a given sheet template, scoped to owner
- `campaigns`/`adversaries`: `(isPrivate ASC, name ASC)` — public listing pages
- `sceneObjects`: `(relatedId ASC)` — single-field, auto-indexed, no composite needed

**Finding from reading `gameServer.js`:** live scene state (token positions, dice rolls, chat) is broadcast entirely over PeerJS `CustomEvent`s and never touches the database mid-session — `dataHandler`/`broadcastMessage`/`updateScene` only relay in-memory messages between connected peers. This means Firestore writes for `sceneObjects` are almost certainly periodic/host-initiated saves (same pattern as `CharacterDetail.vue`'s save flow), not high-frequency writes. **Verify this assumption against `SceneDetail.vue`'s save logic during the phase that ports the VTT**, but it materially simplifies the security-rule design (non-owner players don't need Firestore write access to scene state at all — only the owning GM's client persists).

### 2.5 Scene collaboration (non-owner players)

Today, any authenticated user can join a scene as a player without necessarily being its `owner_id`. Add a `playerIds` array field to `scenes` docs (populated as players join, via a Cloud Function or an owner-only client write appending the joining uid) so the `isSceneCollaborator` rule above can grant read access. **Note the existing known bug** (documented in `.planning/codebase/CONCERNS.md`): there is currently no GM/host subscription check — `SceneDetail.vue` has a TODO for this. Worth fixing as part of the rules design since Firestore rules are a natural place to enforce "only subscribers can host" (`request.auth.token.subscriptionActive == true`) rather than leaving it as a client-side TODO.

### 2.6 Legacy `CHARACTERSHEET` object_type — verify before migrating

The sample export shows an `owner_id: "JARVIS"` row of `object_type: CHARACTERSHEET` containing a full inline HTML/CSS/JS template (a legacy "admin-authored custom sheet template" feature, ~15KB of embedded markup). This appears to predate the current `src/sheets/*.vue` component-registration pattern (`charactersheet.vue`'s hardcoded `validSheets` whitelist per `CLAUDE.md`). **Confirm during the migration phase whether this object_type is still read anywhere in production** (grep the live app / check DynamoDB `type` GSI item count for `CHARACTERSHEET`) before deciding to migrate it — it's likely dead data superseded by the new sheet components being built from scratch. If any surviving rows exceed Firestore's 1 MiB per-document limit (plausible for embedded HTML+CSS+JS blobs), store the content in Cloud Storage and reference it by URL instead of inlining it in Firestore.

---

## 3. Auth — Firebase Auth Replacing Cognito

### 3.1 What gets simpler

Firebase Auth's client SDK auto-refreshes ID tokens; there is no equivalent of the current `RefreshUserSession()` call sprinkled before every DB operation in `dbService.js`, and no Identity Pool credential-exchange dance (`AWS.CognitoIdentityCredentials`, `credentials.refresh()`). The service layer's DB-access boilerplate shrinks substantially — this is a direct simplification of the current "Direct AWS SDK Usage in Components" anti-pattern flagged in `.planning/codebase/ARCHITECTURE.md`.

### 3.2 What gets harder / different (explicit behavior change to design for)

Cognito lets an authenticated user update their **own** custom attributes directly from the client (`userService.js`'s `SetUserAttribute`, used to cache `custom:stripe_customer` / `custom:stripe_had_trial`). **Firebase custom claims can only be set server-side via the Admin SDK** — there is no client-writable equivalent. Design decision: don't try to force this into custom claims for values the client currently self-writes; instead:
- `stripeCustomerId`, `hadStripeTrial` → fields on the `users/{uid}` Firestore profile doc, written via a Cloud Function (callable), not custom claims.
- `subscriptionActive` (used for gating, e.g. the scene-host TODO above) → **do** make this a custom claim, set by a Cloud Function that runs on the Stripe webhook (subscription created/updated/canceled), because custom claims are readable inside Firestore Security Rules (`request.auth.token.subscriptionActive`) for cheap, read-free gating — a Firestore-doc-based check would need an extra `get()` in rules, which is slower and counts against read quota on every rule evaluation.

### 3.3 Preserving existing identities — the actual hard part

The sample DynamoDB data shows `owner_id` values like `us-east-1:21598ef1-7df9-4c74-b3be-95b9645adbeb` — this is a **Cognito Identity Pool identity ID**, not a Cognito User Pool `sub` (user pool GUIDs don't carry a region prefix like this). This matters directly for migration: to rewrite every DynamoDB row's `owner_id` into the new Firebase `uid`, you need a lookup table mapping **Identity Pool identity ID → User Pool `sub` → new Firebase uid**, not just a list of Cognito users.

- Firebase Admin SDK's `importUsers()` lets you set `uid` explicitly per record — **use each user's existing Cognito User Pool `sub` as the new Firebase uid.** This keeps identities stable/traceable and means you never have to touch `related_id`/`playerIds` values that might reference a user pool sub elsewhere.
- To build the Identity-Pool-ID → User-Pool-sub map: query the Cognito Identity Pool's linked-logins for each identity (`CognitoIdentity.DescribeIdentity` / `ListIdentities` + the identity's linked `cognito-idp` login entry), or recover it from the User Pool side if the app cached it in a custom attribute anywhere (unconfirmed — check for this before building the mapping the hard way). **This is a real open unknown; treat it as a research spike at the start of the migration phase**, since it could reshape whether the `ownerId` rewrite is a simple lookup or needs a more involved per-account reconciliation.

### 3.4 Passwords — lazy migration, not a mass reset

Cognito does not export password hashes in a form `Auth.importUsers()` understands (Cognito uses SRP, not a portable hash format Firebase recognizes: bcrypt, scrypt, PBKDF2, etc. per Firebase's supported hash list). Two viable strategies, **use both**:
1. **Primary — lazy migration on first login:** import all users into Firebase Auth *without* a password hash. On first login attempt against the new app, run a Cloud Function that verifies the submitted credentials against the old Cognito User Pool (`AdminInitiateAuth` with `ADMIN_NO_SRP_AUTH` or a scoped app client, using the `aws-sdk` **server-side only**, in the function, not the browser) — if valid, call `Auth.updateUser(uid, { password })` to set the Firebase password and the user is fully migrated transparently, with zero disruption. This is the standard pattern for exactly this kind of migration and avoids a mass password-reset email blast to paying subscribers.
2. **Fallback — forced reset for dormant accounts:** for accounts that don't log in within a grace window after cutover (e.g. 60–90 days), or once the old Cognito pool is decommissioned and step 1 is no longer possible, trigger Firebase's native "send password reset" email.

### 3.5 Bulk import at unknown/large scale

`Auth.importUsers()` accepts up to **1000 records per call** with automatic hashing-algorithm metadata (not needed here since no password hashes are imported) — for any total user count from hundreds to tens of thousands, this just means N sequential/parallel batch calls with pagination through Cognito's `ListUsers` (which itself paginates, typically 60 req/60s rate-limited — plan for backoff/retry, not a single synchronous loop, if the true count turns out to be large). This scales fine regardless of the real total; the only planning implication of an unknown total is **measure it first** (§7 step 0) so the import script's expected runtime and any AWS API rate-limit backoff logic is sized correctly before running it for real.

---

## 4. Stripe — Keep `FCSStripe` Logic, Port the Transport, Not the Extension

**Recommendation: port `FCSStripe`'s existing logic to a single Cloud Function (2nd gen, Node), not the "Run Payments with Stripe" Firebase Extension.**

The Firebase/Stripe extension (`invertase/stripe-firebase-extensions`, formerly maintained by Stripe directly — ownership transferred to Invertase as of mid-2026) imposes its **own** Firestore data model (`customers/{uid}/subscriptions/{id}`, `products`/`prices` synced from the Stripe Dashboard) and webhook wiring. Adopting it would mean re-plumbing the entire customer/subscription relationship for existing paying subscribers mid-migration — directly conflicting with the milestone's explicit "Stripe billing kept as-is, billing continuity for paying users" constraint. That re-plumbing risk is not worth taking during the highest-risk phase of the project.

Instead:
- Port the four operations `FCSStripe` already supports (`createcustomer`, `getcustomer`, `manage`, `checkout`) into one Cloud Function exposed as Firebase **callable functions** (`onCall`), one per operation, or a single router function mirroring the existing `item`-dispatch shape almost line-for-line.
- Callable functions receive `context.auth.uid` automatically once the client is signed in with Firebase Auth — this **replaces** the current client-side `lambda.config.credentials = this.fcs.$store.state.credentials` dance entirely; the function verifies the caller's identity server-side, no manual credential wiring needed in `subService.js`'s equivalent.
- Port the Stripe webhook handler (subscription status updates — currently presumably inside or adjacent to the Lambda) to an `onRequest` Cloud Function that verifies the Stripe signature, updates the `users/{uid}` Firestore doc's `stripeCustomerId`/subscription fields, and sets the `subscriptionActive` custom claim via the Admin SDK.
- Stripe itself needs **no changes** — customers and subscriptions live in Stripe's systems, not in Cognito/DynamoDB (Cognito only cached the `stripe_customer` ID as a custom attribute). As long as the migrated `users/{uid}` profile carries the correct `stripeCustomerId` (captured during the user-import step, §3.3/§7), billing continuity is essentially automatic — this is the lowest-risk piece of the whole migration.
- Evaluate the Invertase Stripe extension later, post-cutover, as a v2.1+ improvement once the new platform is stable — not during initial migration.

---

## 5. PeerJS Signaling — Cloud Run (Decisive Recommendation)

**Recommendation: Cloud Run. Not Cloud Functions. Not "stay managed on Heroku-equivalent."**

- **Cloud Functions are ruled out categorically**: both 1st-gen and 2nd-gen Cloud Functions are invoked per-HTTP-request/event and are not designed to hold a long-lived, stateful WebSocket connection registry the way `peerjs-server` needs (an in-memory map of connected peer IDs to sockets that must persist across many concurrent connections). This is a hard architectural mismatch, not a configuration tweak.
- **Cloud Run natively supports WebSockets** (has since 2021) and can run the existing, unmodified `peerjs-server` npm package in a container — the client-side change is minimal: `peerService.js`'s `GetPeerConnection` just needs `host`/`port` repointed at the new Cloud Run service URL instead of `fcs-peer-server.herokuapp.com`.
- **Concrete deployment reference** (a working, documented GCP Cloud Run + PeerJS deployment, cross-checked against Google's own Cloud Run WebSocket tutorial):
  - Containerize `peerjs-server`, expose it on the port PeerJS expects.
  - Set `min-instances: 0` initially (scale-to-zero) to stay near-free at low/uncertain traffic; the cost of scale-to-zero is a ~1–2s cold start on the first connection after idle — acceptable for a hobby-scale VTT feature. Revisit `min-instances: 1` (~$5–10/mo) only if cold starts prove disruptive in practice.
  - **Cap `max-instances: 1`** (or configure Cloud Run session affinity) — this is the important gotcha: `peerjs-server` keeps its peer registry in-memory per instance. With more than one instance and no shared state, peers registered on instance A become invisible to instance B, silently breaking connections. At FCS's scale (an unknown but likely modest number of *concurrent* VTT sessions even if the total user base is large), capping to a single instance is the pragmatic, low-complexity choice. Only add a Redis/Memorystore-backed shared registry if concurrent-session load actually becomes a real bottleneck — don't build that complexity up front.
  - Set container concurrency to comfortably cover multiple simultaneous scenes each with a handful of players (e.g. concurrency 50 as a starting point).
  - No TURN server is currently configured (PeerJS's default public STUN/ICE config) — out of scope for this migration; revisit only if NAT-traversal failures surface as a real problem post-launch.
- Add the Cloud Run deploy (`gcloud run deploy`) as a second target in the same CI/CD pipeline that deploys Firebase Hosting/Functions.

---

## 6. Hosting / CI-CD

### 6.1 Firebase Hosting replaces S3/CloudFront

**Recommendation: two separate Firebase projects (`fcs-beta`, `fcs-prod`)**, not one project with two hosting targets. This mirrors the existing dev/prod split (`FateCharacterSheet` vs `_dev` DynamoDB table) but goes further — because Firestore Security Rules and Auth are project-scoped, two projects give hard isolation between beta test data and real subscriber data by construction, rather than relying on naming conventions or rule logic to keep them apart. Each project gets its own Hosting site, Firestore database, Auth user pool, and Cloud Functions/Cloud Run deployment.

### 6.2 CI/CD

Replace `.github/workflows/beta.yml` (auto-deploy on push to `develop`) and `production.yml` (manual `workflow_dispatch`) with the equivalent Firebase-flavored pipeline, keeping the same trigger shape:
- Use `firebase-tools` CLI + a service-account JSON secret (or the official `FirebaseExtended/action-hosting-deploy` GitHub Action) for `firebase deploy --only hosting --project fcs-beta` / `fcs-prod`.
- Add `firebase deploy --only functions` and `gcloud run deploy` steps for the Cloud Function (Stripe) and Cloud Run (PeerJS) targets, each needing their own scoped service-account permissions in GitHub Actions secrets.
- **Add `yarn lint` and `yarn test` as required gates before deploy** — the current pipeline explicitly does *not* run these before the beta auto-deploy (flagged in `CLAUDE.md` as a known gap: "a green push does not mean tests passed"). Since this is a from-scratch rebuild, there's no reason to carry that gap forward.
- Keep the Sentry release/source-map upload step (whatever the new bundler's equivalent of `@sentry/webpack-plugin` is), carrying over the `SENTRY_AUTH_TOKEN` secret unchanged.

---

## 7. Data + User Migration — Concrete Plan (Robust to Unknown Scale)

**Design principle: every step below is written to work correctly whether the real total is 300 accounts or 30,000 — the *mechanics* (batched import, indexed lookups, scan-and-transform) don't change with scale, only the runtime and the backoff/retry budget do. Measuring the real number is Step 0, not an assumption baked into the plan.**

### Step 0 — Measure the real scale (do this first, before any other migration work)

- Cognito: `aws cognito-idp list-users --user-pool-id us-east-1_x9gvO6Gy3` (paginated) to get the true registered-account count — this is the number that matters for user-import planning, not the ~259 *active* users from Google Analytics.
- DynamoDB: get the table's item count (`aws dynamodb describe-table` gives an eventually-consistent estimate; a full `Scan` with `Select: COUNT` gives an exact count) **broken down by `object_type`** — this tells you how many `CHARACTER`, `CAMPAIGN`, `SCENE`, `SCENEOBJECT`, `ADVERSARY`, `LOG`, and `CHARACTERSHEET` rows actually exist, which directly informs the transform/verification script's expected output counts and whether the legacy `CHARACTERSHEET` rows (§2.6) are worth carrying forward at all.
- Record both numbers in the migration runbook before writing any transform code — they determine realistic time estimates for the maintenance-window cutover (§7, step 6) and the batch sizing for import.

### Step 1 — Identity mapping spike

Resolve the Identity-Pool-ID → User-Pool-`sub` mapping question from §3.3 early — this could reshape the transform script, so don't leave it until the end. Produce a lookup table: `identityPoolId → { uid: userPoolSub, email, stripeCustomerId, hadStripeTrial }`.

### Step 2 — Export

Full scan of the DynamoDB table (paginated `Scan`, no filter) → dump to newline-delimited JSON, timestamped, retained as the immutable source-of-truth extract for rollback purposes. At any scale this is a bounded, repeatable, read-only operation against the live table — safe to run multiple times without side effects.

### Step 3 — Transform

For each exported item:
- Map `object_type` → target Firestore collection (per the table in §2.2).
- Rewrite `owner_id` → `ownerId` using the Step-1 identity map. **Any row whose `owner_id` can't be resolved must be quarantined into a separate "needs manual review" file, never silently dropped or silently assigned a placeholder owner.**
- Rewrite `related_id` → `relatedId` (value unchanged — document IDs are preserved as-is, per §2.2, so no re-linking is needed).
- Convert any stringified-JSON sub-fields into native Firestore maps (pending the §2.3 verification of the real in-app shape).
- Handle sentinel/system rows like the `JARVIS`-owned `CHARACTERSHEET` template rows explicitly (decide: fixed system uid, or drop in favor of the new hardcoded sheet components — see §2.6).

### Step 4 — Validate the transform (before touching production Firestore)

- Row counts per collection match the Step-0 baseline exactly (accounting for any intentionally-dropped legacy rows, which must be logged, not silently absent).
- Referential integrity check: every `relatedId` in the transformed data resolves to an existing document ID in the transformed set.
- Spot-check a sample of characters per sheet type by loading them into the **Firestore emulator** and rendering them in the new app locally.

### Step 5 — Load

- **Firestore Admin SDK `BulkWriter`** (not manual 500-op batches) for the import — it auto-batches, retries on contention/backpressure, and sustains high write throughput without manual tuning; suitable regardless of whether the real dataset is thousands or tens of thousands of documents. Firestore write costs are trivial even at large one-time-import volume (order of $0.18 per 100k document writes) — cost is not a real constraint here even if the true scale is much larger than 259.
- Run against a **staging Firebase project first**, validate, then run against `fcs-prod`.
- **User import:** batch `Auth.importUsers()` calls (1000 records/call max) built from the Step-1 map, paginating through the full Cognito user list from Step 0 with retry/backoff on Cognito's `ListUsers` rate limit if the real count is large enough to need many pages.
- **Custom claims / profile pass:** a follow-up Cloud Function pass sets `subscriptionActive` custom claims and writes `stripeCustomerId`/`hadStripeTrial` to each `users/{uid}` profile doc from the Step-1 map, **then re-verifies against live Stripe** for the subset with a `stripeCustomerId` (the cached Cognito attribute could be stale) rather than trusting the cached value blindly.

### Step 6 — Cutover

- Given the data only needs to move once (not continuously), and dual-write between two structurally different databases is disproportionately risky for the payoff (see Anti-Patterns below), **use a single scheduled maintenance window**, not a live dual-run: put the old app in read-only/banner mode, re-run Steps 2–5 one final time to capture any writes since the last full dry-run, verify record counts match Step 0's baseline, flip Hosting/DNS to the new Firebase app, and monitor Sentry + Firebase console closely for 24–48h.
- The actual window length scales with the real record count from Step 0 (BulkWriter throughput and DynamoDB scan speed both scale roughly linearly with item count) — **do not commit to a specific window length (e.g. "30 minutes") until Step 0's real numbers are known.**
- **Rollback:** the old DynamoDB table and Cognito pool are never mutated by this migration (only read from) — rollback at any point before decommissioning the old stack is simply repointing Hosting/DNS back to the old S3/CloudFront bundle. Keep the old AWS stack live, read-only, for a rollback window (e.g. 2+ weeks) after cutover before decommissioning.

---

## 8. Build Order (for the Roadmapper)

1. **Firebase project setup** (two projects: `fcs-beta`/`fcs-prod`) + Hosting skeleton + CI/CD pipeline stood up early, even before the app is functional, so every later phase deploys incrementally.
2. **Firestore data model + security rules**, validated conceptually against the migration transform design (§2/§7) *before* the app's service layer is built against it — the shape needs to be locked before dozens of components read/write against it.
3. **Firebase Auth wiring** (register/login/session) + the new `authService`/`firestoreService` swap-ins, built against a freshly-seeded (synthetic) Firestore/Auth project, not real user data yet.
4. **Core app feature rebuild** (sheets, campaigns, scenes, adversaries CRUD) against the new Firestore/Auth backend — sequenced by whatever the separate frontend-framework research recommends.
5. **Stripe Cloud Function port**, in parallel with (4) once Auth is stable — only needs a Firebase uid + custom claims to function.
6. **PeerJS/Cloud Run signaling server**, in parallel with (4)/(5) — a largely independent subsystem (`gameClient`/`gameServer`/`fcsVTT`), needing the new auth context only for scene ownership.
7. **Migration tooling** (export/transform/import scripts, §7 Steps 0–5) — **start this early, in parallel with (2)/(3)**, because Step 0 (real scale) and Step 1 (identity mapping) are open unknowns that could reshape the Firestore `ownerId` design; don't leave migration tooling until the end.
8. **Staging dry-run migration + verification** against a full real-data copy, once (2)–(7) are functionally complete.
9. **Cutover** (§7 Step 6) — last.

---

## Anti-Patterns to Avoid

**Don't attempt live dual-write** (writing to both DynamoDB and Firestore simultaneously during a transition period). Given the schema transform complexity (stringified-JSON conversion, identity remapping, object_type→collection mapping), dual-write correctness is hard to guarantee and provides little benefit versus a clean scheduled cutover, regardless of whether the real user count is small or large.

**Don't adopt the "Run Payments with Stripe" Firebase Extension for this migration.** It imposes its own customer/subscription data model, conflicting with the "keep Stripe billing as-is" constraint for existing paying subscribers. A direct Cloud Function port of `FCSStripe`'s existing logic is far lower risk. Reconsider the extension later, post-stabilization.

**Don't put PeerJS signaling on Cloud Functions.** No persistent WebSocket support — it will not work, not a configuration issue.

**Don't nest entities as `users/{uid}/entityType/{id}` Firestore subcollections.** Breaks "get object by ID without knowing the owner" and "list by relatedId across owners," both of which the current app depends on (scene objects, public campaign/adversary browsing, sheet-template-derived character lookups). Use flat top-level collections with an `ownerId` field instead.

**Don't force a mass password-reset email blast as the default migration strategy.** A lazy-migration-on-first-login Cloud Function flow (§3.4) preserves password continuity and avoids unnecessary churn risk for paying subscribers; reserve forced reset for genuinely dormant accounts after a grace period.

**Don't assume the ~259 "active users" figure represents the migration's true scale.** Size the import/transform tooling (batching, pagination, retry/backoff) to work correctly at an order of magnitude larger than that, and measure the real number (§7 Step 0) before committing to a maintenance-window length.

---

## Integration Points

| Service | Integration Pattern | Notes |
|---|---|---|
| Firebase Auth | Client SDK (email/password), Admin SDK (import, custom claims) | Replaces Cognito User Pool + Identity Pool entirely |
| Firestore | Client SDK direct read/write + Security Rules | Replaces DynamoDB + IAM-scoped credentials |
| Cloud Functions (2nd gen) | Callable (`onCall`) for Stripe ops + custom-claim writes; `onRequest` for Stripe webhook | Replaces `FCSStripe` Lambda |
| Cloud Run | Containerized `peerjs-server`, WebSocket | Replaces Heroku-hosted PeerJS server; client only needs a `host`/`port` change in `peerService.js` |
| Firebase Hosting | Static bundle, 2 projects (beta/prod) | Replaces S3/CloudFront |
| Stripe | Unchanged — API calls now originate from a Cloud Function instead of a Lambda | No changes to Stripe account/products/customers needed |
| Sentry / GTM / iubenda | Unchanged | No AWS dependency in the first place |

---

## Open Questions / Gaps to Resolve During Migration Phase

1. **Real registered-user and DynamoDB-item counts** (§7 Step 0) — unknown at research time; must be measured before finalizing migration tooling sizing and cutover-window estimates.
2. **Cognito Identity-Pool-ID → User-Pool-`sub` mapping mechanism** (§3.3) — needs a research spike; could reshape the `ownerId` rewrite approach.
3. **Actual in-app JS shape of nested sheet fields** (skills/aspects/stress) — the sample export's stringified-JSON form may be a console-export artifact, not the live shape (§2.3); confirm against a real `GetObject` call before writing the transform script.
4. **Whether the legacy `CHARACTERSHEET` object_type (custom sheet templates) is still read in production** (§2.6) — likely dead, superseded by the new hardcoded sheet components, but confirm before deciding to migrate or drop it.
5. **Exact scene-object write pattern** (§2.4) — confirmed via `gameServer.js` that live movement is PeerJS-broadcast-only, but the periodic host-persistence save path should be verified against `SceneDetail.vue` during the VTT-porting phase to finalize the security-rule design.
6. **Whether the Stripe webhook is currently inside the `FCSStripe` Lambda itself or a separate function** — `INTEGRATIONS.md` notes it's "handled server-side (backend Lambda function `FCSStripe`)" but the exact routing wasn't independently confirmed in this research pass; check before porting.

---

## Sources

- [Firebase — Import Users (Admin SDK)](https://firebase.google.com/docs/auth/admin/import-users) — HIGH confidence, official docs
- [Firebase: Importing users with the Admin SDK — Hiranya Jayathilaka](https://hiranya911.medium.com/firebase-importing-users-with-the-admin-sdk-dd06d41d7eb2) — MEDIUM confidence, practitioner write-up, cross-checked against official docs
- [Migrating to Firebase Auth from AWS Cognito — Medium](https://medium.com/@emanuelburgess_77400/migrating-to-firebase-auth-from-aws-cognito-2fb64b888630) — MEDIUM confidence
- [How to Migrate AWS Cognito User Pools to Google Cloud Identity Platform](https://oneuptime.com/blog/post/2026-02-17-how-to-migrate-aws-cognito-user-pools-to-google-cloud-identity-platform/view) — MEDIUM confidence
- [Google Cloud — Building a WebSocket Chat service for Cloud Run (official tutorial)](https://docs.cloud.google.com/run/docs/tutorials/websockets) — HIGH confidence, official docs
- [Google Cloud — WebSocket Connections in Node.js on Cloud Run](https://oneuptime.com/blog/post/2026-02-17-websocket-connections-node-js-cloud-run-session-affinity/view) — MEDIUM confidence
- [Virtually Free Peer JS Server on GCP — Gonzalo Hirsch](https://gonzalohirsch.com/blog/virtually-free-peer-js-server-on-gcp/) — MEDIUM confidence, concrete working reference deployment (Cloud Run config values used in §5 are sourced from this)
- [GitHub — peers/peerjs-server](https://github.com/peers/peerjs-server) — HIGH confidence, official project
- [Run Payments with Stripe — Firebase Extensions Hub](https://extensions.dev/extensions/stripe/firestore-stripe-payments) — HIGH confidence, official listing
- [GitHub — invertase/stripe-firebase-extensions](https://github.com/invertase/stripe-firebase-extensions) — HIGH confidence, official repo (confirms 2026 maintenance transfer from Stripe to Invertase)
- [New Stripe Billing customer portal Firebase extensions and guides — dev.to/stripe](https://dev.to/stripe/new-stripe-billing-customer-portal-firebase-extensions-and-guides-28lk) — MEDIUM confidence

Repository files read for this research (authoritative for current-state facts):
- `C:\projects\fcs\.planning\PROJECT.md`
- `C:\projects\fcs\.planning\codebase\INTEGRATIONS.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONCERNS.md`
- `C:\projects\fcs\db\FateCharacterSheet-DynamoDb-Model`
- `C:\projects\fcs\src\assets\js\dbService.js`, `userService.js`, `subService.js`, `peerService.js`, `gameServer.js`
- `C:\projects\fcs\CLAUDE.md`

---
*Architecture research for: FCS v2.0 Firebase rebuild — data model, auth, migration, billing, VTT hosting, CI/CD*
*Researched: 2026-08-31*
