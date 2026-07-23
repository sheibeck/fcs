# Codebase Concerns

**Analysis Date:** 2026-07-23

## Tech Debt

**Monolithic Vuex Store:**
- Issue: All global state (auth, entities, UI flags, config) lives in a single non-modular store in `src/index.js` (150+ lines). Difficult to test and reason about.
- Files: `src/index.js`
- Impact: Hard to isolate state mutations, complex testing setup, difficult to refactor
- Fix approach: Migrate to modular Vuex store with separate modules per domain (auth, campaigns, characters, etc.)

**jQuery + Vue Mixed Usage:**
- Issue: Both jQuery (`$`, `.each()`, `.append()`) and Vue are used pervasively. jQuery DOM manipulation bypasses Vue's reactivity.
- Files: `src/assets/site.scss`, `src/index.js`, `src/pages/*`, `src/components/*`, `src/assets/js/commonService.js`
- Impact: Unpredictable rendering, potential memory leaks, harder to debug
- Fix approach: Gradually replace jQuery with Vue equivalents; remove jQuery dependency after 2024

**Large Vue Components:**
- Issue: Several Vue files exceed 700 lines (SceneDetail: 1104 lines, CampaignDetail: 764 lines, scene-zone: 556 lines). Hard to maintain and test.
- Files: `src/pages/SceneDetail.vue` (1104L), `src/pages/CampaignDetail.vue` (764L), `src/components/scene-zone.vue` (556L), `src/components/scene-object.vue` (554L)`
- Impact: Components become difficult to understand, increase risk of bugs, slow editor performance
- Fix approach: Break into smaller, focused components; extract complex logic into services

**Incomplete Refactoring in dbTools.js:**
- Issue: Function `UpdateItem` has `debugger;` on line 28 followed by `return;`, making the function non-functional. Rest of function after return is dead code.
- Files: `src/assets/js/dbTools.js` (lines 28-44)
- Impact: The UpdateItem function never executes database operations; functionality is broken
- Fix approach: Remove debugger statement and return early, complete the implementation or delete if unused

**No Input Validation Framework:**
- Issue: User input (character names, skill values, campaign descriptions) is saved directly to DynamoDB without schema validation. Only empty-value stripping is performed.
- Files: `src/assets/js/dbService.js` (SaveObject method), all Vue components with form inputs
- Impact: Malformed data can corrupt database records; no protection against injection attacks via structured data
- Fix approach: Implement a schema validation library (e.g., Zod, Joi) before SaveObject

**AWS SDK v2 (Deprecated):**
- Issue: Using `aws-sdk@2.799.0`, which is out of support. AWS recommends v3 migration.
- Files: `src/index.js`, `src/assets/js/dbService.js`, `src/assets/js/userService.js`
- Impact: No security patches, larger bundle size, missing new features
- Fix approach: Migrate to `@aws-sdk/client-dynamodb` and `@aws-sdk/client-cognito-identity-provider` v3

---

## Known Bugs

**Incomplete Conditions Implementation:**
- Symptoms: Characters with conditions field see commented-out code. Conditions are not synced from character sheets to scene objects.
- Files: `src/components/scene-object.vue` (lines 493-498)
- Trigger: When adding a character to a scene and expecting conditions to transfer
- Workaround: None; conditions must be manually re-entered in scene
- Fix approach: Complete the convertThingToGameObject flow for conditions (reference: `fate-of-20.js` for complex example)

**Duplicate Characters in Scene Not Prevented:**
- Symptoms: Same character can be added to scene multiple times, causing UI confusion and sync issues
- Files: `src/components/scene-zone.vue` (line 267 TODO)
- Trigger: Click "Add Character" and select the same character twice
- Workaround: Manually remove duplicate by dragging to trash
- Fix approach: Before calling `makeGameObject()`, check if character already exists in scene

**Subscription Check Missing in Host Validation:**
- Symptoms: Non-subscribers can host scenes if they own the scene. No DM/GM access check.
- Files: `src/pages/SceneDetail.vue` (line 406 TODO)
- Trigger: Any authenticated user can create a scene and act as host
- Workaround: Manual subscription verification by checking user's subscription tier
- Fix approach: Add `hasActiveSubscription` check in `isHost()` getter

---

## Security Considerations

**Critical: Arbitrary Code Execution via eval():**
- Risk: Three instances of `eval()` in production code. Can execute arbitrary JavaScript if input contains code-like strings.
  - `src/assets/js/commonService.js:294` - `eval(\`obj.${graphPath}\`)` - accesses nested object properties
  - `src/assets/js/commonService.js:188` - `eval(${dismiss})` - evaluates callback in alert
  - `src/components/scene-zone.vue` (2x) - `eval(\`obj.label${id}\`)` - dynamic label access
  - `src/sheets/fate-core.vue` - `eval(found[0])` - evaluates regex matches for skill levels
- Files: `src/assets/js/commonService.js`, `src/components/scene-zone.vue`, `src/sheets/fate-core.vue`
- Current mitigation: Input sanitization via whitelist regex (e.g., `[#~!@]` in scene-zone)
- Recommendations: Replace eval with safe alternatives (optional chaining, property accessors, Function constructor with restricted scope, or dedicated path evaluation library)

**High: Potential XSS via v-html:**
- Risk: `v-html="niceDescription(description)"` in CampaignDetail.vue constructs HTML via regex replacements. If description field is ever user-controlled from untrusted source, XSS possible.
- Files: `src/pages/CampaignDetail.vue` (lines 162, 174, 186, 198), `src/pages/AdversaryList.vue`, `src/components/scene-aspect.vue`
- Current mitigation: Data comes from DynamoDB (trusted source). Regex escapes quotes and replaces only `[#~!@]` prefixes.
- Recommendations: Audit that all data rendered via v-html originates from current user or trusted collaborators; add DOMPurify if rendering external/imported data

**High: Hardcoded AWS Configuration:**
- Risk: AWS account ID (210120940769), Cognito pool IDs, and role ARNs are hardcoded in source code. If committed to public repo, account is exposed.
- Files: `src/index.js` (lines 120-128)
- Current mitigation: Repo is private; code is not public
- Recommendations: Move to environment variables or config service; never commit account identifiers in code

**High: 131 Unpatched npm Vulnerabilities:**
- Risk: 16 critical, 49 high, 51 moderate severity vulnerabilities in dependencies.
  - Babel arbitrary code execution (GHSA-67hx-6x53-jw92)
  - AWS SDK region validation bypass (GHSA-j965-2qgj-vjmq)
  - Sentry prototype pollution (GHSA-593m-55hh-j8gv)
  - xml2js prototype pollution (GHSA-776f-qx25-q3cc)
  - bn.js infinite loop (GHSA-378v-28hj-76wf)
- Files: `package.json` (all dependencies)
- Current mitigation: App runs in browser; many depend on bundle configuration
- Recommendations: Run `npm audit fix --force` carefully; update Babel, aws-sdk, Sentry, and Vueest immediately

**Moderate: Browser Console Logging:**
- Risk: Sensitive information (peer IDs, connection state, data structures) logged to browser console. Visible in dev tools if user opens them.
- Files: `src/assets/js/commonService.js:17`, `src/assets/js/dbTools.js:21,41`, `src/assets/js/gameClient.js` (10+ console.log calls), `src/assets/js/gameServer.js`, `src/assets/js/fateof20.js`
- Current mitigation: Production build drops console.log via webpack `drop_console` plugin
- Recommendations: Remove console.log from source; verify drop_console works in prod build

**Moderate: Direct innerHTML Assignment:**
- Risk: `document.getElementById("player-container").innerHTML = "";` in SceneDetail.vue. If this element ever contained user-controlled HTML, XSS possible.
- Files: `src/pages/SceneDetail.vue`
- Current mitigation: Currently only clearing (empty string assignment), not injecting
- Recommendations: Use `textContent` or Vue's data binding instead; never use innerHTML with user data

---

## Performance Bottlenecks

**Large Scene Canvas Rendering:**
- Problem: Scene-detail canvas is fixed at 4800x3600px with grid background. Large coordinate space; dragging and zooming can be slow on lower-end devices.
- Files: `src/pages/SceneDetail.vue` (lines 26-46)
- Cause: Fixed canvas size + all objects positioned absolutely; no viewport optimization
- Improvement path: Implement virtual scrolling or viewport culling; render only visible objects

**No Pagination in Shared Entity Lists:**
- Problem: Public campaigns/adversaries loaded all at once from `ListObjects()`. No pagination UI (though backend supports it).
- Files: `src/pages/CampaignSummary.vue`, `src/pages/AdversaryList.vue`
- Cause: Database query doesn't pass `page` parameter
- Improvement path: Add pagination UI (prev/next buttons); lazy-load entities 20 at a time

**Synchronous Event Dispatch on Document:**
- Problem: VTT messages broadcast via `document.dispatchEvent(new CustomEvent(...))`. No queueing or batching; can cause event loop blocking if many simultaneous updates.
- Files: `src/assets/js/gameClient.js`, `src/assets/js/gameServer.js`, `src/pages/SceneDetail.vue`
- Cause: Event-driven architecture without message queue
- Improvement path: Use web worker or message queue (e.g., RxJS, simple array buffer) for high-frequency updates

---

## Fragile Areas

**VTT Peer-to-Peer Communication (gameClient.js, gameServer.js):**
- Files: `src/assets/js/gameClient.js` (441 lines), `src/assets/js/gameServer.js` (176 lines), `src/pages/SceneDetail.vue` (1104 lines)
- Why fragile: Complex state management across peer connections. Multiple event listeners, media streams, and reconnection logic. Hard to test without actual PeerJS server.
- Safe modification:
  1. Add unit tests for message parsing (MsgDiceRoll, MsgInvoke) before changing flow
  2. Log all connection state changes to Sentry
  3. Test manual peer disconnect / reconnect scenarios
- Test coverage: Not tested; critical functionality

**Character Sheet Type Registration (charactersheet.vue):**
- Files: `src/components/charactersheet.vue`, `src/sheets/*.vue` (10+ sheet variants)
- Why fragile: Adding new sheet type requires changes in multiple places (components map, validSheets whitelist, static assets). Easy to miss one and break the sheet.
- Safe modification:
  1. Create helper function to register sheets centrally
  2. Add test validating all registered sheets exist and can render
  3. Document checklist for adding new sheet
- Test coverage: Basic rendering tested; no edge cases

**Scene Object Aspect/Consequence Handling (scene-object.vue):**
- Files: `src/components/scene-object.vue` (554 lines)
- Why fragile: Complex sorting logic for aspects (by label priority), conditional rendering based on object type. Aspects, consequences, and properties are all stored in same data structure.
- Safe modification:
  1. Add snapshot tests for sortedAspects computed property with various label inputs
  2. Extract sorting logic into separate utility function
  3. Add validation that `objectdata.aspects` is always an array
- Test coverage: Not tested

**Database Query Error Handling (dbService.js):**
- Files: `src/assets/js/dbService.js` (362 lines)
- Why fragile: Catch blocks silently notify user and return undefined. `RefreshUserSession()` called before every operation; if it fails, operation cascades.
- Safe modification:
  1. Add try-catch around RefreshUserSession with different error message
  2. Return Promise rejection instead of undefined on DB error
  3. Add retry logic for transient failures (throttle errors)
- Test coverage: Not tested

---

## Scaling Limits

**Single DynamoDB Table (single-table design):**
- Current capacity: Table design supports all entity types (character, campaign, scene, adversary) as rows keyed by `owner_id` + `id`. GSIs on `type`, `related_id`, `id`.
- Limit: Partition key `owner_id` is not user-specific for shared entities. Heavy concurrent reads on public campaigns could hit partition throughput limit.
- Scaling path: Implement read replicas or switch to provisioned billing; monitor GSI usage; split table if owner_id becomes hot key

**PeerJS Peer Connections:**
- Current capacity: Each scene server (game host) opens 1 PeerJS connection. Can handle ~10-50 concurrent players per scene (PeerJS server limit).
- Limit: As user count grows, hosting dedicated PeerJS server becomes necessary (current setup likely uses public iceServers).
- Scaling path: Deploy private PeerJS server; implement TURN servers for NAT traversal; limit concurrent connections per scene

**Browser Memory with Large Scenes:**
- Current capacity: Scene canvas stores all objects in memory; no pagination.
- Limit: Scenes with 500+ objects could cause memory issues on lower-end devices (mobile).
- Scaling path: Implement viewport culling; load objects on demand; archive old scenes

---

## Dependencies at Risk

**Vue 2 (End of Life):**
- Risk: Vue 2 reached end-of-life in Sept 2024. No security updates.
- Impact: Cannot use modern tooling; new hires unfamiliar with Vue 2; security vulnerabilities accumulate
- Migration plan: Plan 2-3 month Vue 3 migration (breaking change). Consider alternatives (React, Svelte) if greenfield rebuild.

**aws-sdk v2 (Deprecated):**
- Risk: AWS no longer updates v2. v3 has major breaking changes.
- Impact: Missing security patches, larger bundle size
- Migration plan: Use v3 SDK for new features; defer full migration until Vue upgrade

**Babel Packages (<7.23.2):**
- Risk: Babel traverse CVE-2023-45133 allows arbitrary code execution when compiling malicious code.
- Impact: Supply chain attack: if a malicious @babel dependency is installed, it can execute during build
- Migration plan: Update to `@babel/core@^7.23.2`, `@babel/traverse@^7.23.2`, `@babel/helpers@^7.26.10`, `@babel/runtime@^7.26.10` immediately

**Sentry Browser SDK (<7.119.1):**
- Risk: Prototype pollution gadget in error reporting.
- Impact: Attacker could modify prototypes through Sentry event data
- Migration plan: Update to `@sentry/browser@^7.119.1`; requires minor version check

---

## Missing Critical Features

**Session/Role-Based Access Control:**
- Problem: No role system (Player vs DM vs Admin). Scene host determination is only by `owner_id`. Cannot grant specific players GM privileges.
- Blocks: Cannot implement shared campaign ownership, co-DM features, or admin tools
- Workaround: Manually track co-hosts externally; recreate scene if ownership needs to change

**Character Sheet Change Log / Undo:**
- Problem: No version history or undo for character edits. Changes saved directly to DynamoDB; lost edits are unrecoverable.
- Blocks: Cannot audit changes; cannot revert accidental deletions
- Workaround: Players must manually screenshot/backup important character states

**Data Export / Backup:**
- Problem: No bulk export of characters/campaigns. Users cannot backup their data.
- Blocks: Data portability if service shuts down; cannot migrate to external tools
- Workaround: Manual JSON export from browser dev tools (not documented)

**Offline Mode / Service Worker:**
- Problem: App requires internet connection to DynamoDB. Offline editing not supported.
- Blocks: Cannot use in areas with poor connectivity; data loss risk if connection drops mid-edit
- Workaround: None

---

## Test Coverage Gaps

**No Tests for dbService:**
- What's not tested: GetObject queries, SaveObject transactions, RefreshUserSession, error recovery
- Files: `src/assets/js/dbService.js` (362 lines)
- Risk: Core data persistence logic untested; bugs here cascade to all features
- Priority: **High**

**No Tests for userService:**
- What's not tested: Login/register/confirm flow, session refresh, credential management
- Files: `src/assets/js/userService.js` (306 lines)
- Risk: Authentication bugs could lock out users or expose credentials
- Priority: **High**

**No Tests for gameClient / gameServer (VTT):**
- What's not tested: Peer connection lifecycle, message parsing, media stream handling, reconnection
- Files: `src/assets/js/gameClient.js` (441 lines), `src/assets/js/gameServer.js` (176 lines)
- Risk: VTT crashes on edge cases (bad network, peer disconnect); players lose game state
- Priority: **High**

**No Tests for commonService (getVal/setVal):**
- What's not tested: Nested property access, type coercion, edge cases (null paths, arrays in path)
- Files: `src/assets/js/commonService.js` (334 lines)
- Risk: Character data corruption if getVal/setVal fails silently
- Priority: **Medium**

**No Integration Tests:**
- What's not tested: Full auth flow (register → confirm → login), character save → load, campaign scene sync
- Risk: Changes to one service break dependent services; only discovered in manual testing
- Priority: **Medium**

**Only 6 Test Files for 73 Source Files:**
- Coverage estimate: ~8% of codebase covered
- Files tested: A few components (SheetInputs, CharacterSheet) and pages (Home, Character, Adversary, CampaignDetail)
- Files untested: All services, router, models, VTT, most pages
- Priority: **High** — establish testing culture and add coverage incrementally

---

*Concerns audit: 2026-07-23*
