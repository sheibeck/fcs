# Feature Research — Vue 2→3 Migration Workstreams

**Domain:** Live production SPA framework migration (Vue 2.6 → Vue 3, Fate Character Sheet)
**Researched:** 2026-07-23
**Confidence:** MEDIUM overall (HIGH for core Vue 3 breaking-change facts, cross-checked against the official `v3-migration.vuejs.org` guide; LOW for individual third-party library Vue-3-readiness claims below — verify each at implementation time, since small ecosystem libraries drift fast)

> Note on framing: this project's "features" are migration workstreams, not end-user product features. The template sections below are reinterpreted accordingly: **Table Stakes = required to run on Vue 3 at all**, **Differentiators = optional modernization** (deferrable, opt-in value-adds), **Anti-Features = anti-scope** (explicitly not to be done during this migration). Feature Dependencies become workstream sequencing/blocking order — this is the most roadmap-critical section.

## Feature Landscape

### Table Stakes (Required to Run on Vue 3)

Non-negotiable. Skipping any of these means the app does not boot, does not compile, or silently breaks for users.

| Workstream | Why Required | Complexity | Notes |
|---|---|---|---|
| Compiler/loader toolchain bump (`vue-loader` v15→v17, `vue-template-compiler`→`@vue/compiler-sfc`, matching Babel/webpack peer versions) | Current `vue-loader@15` + `vue-template-compiler` only understand Vue 2 SFCs; Vue 3 SFCs need `@vue/compiler-sfc`. Nothing else in this list compiles without this. | MEDIUM | Verify exact peer-dependency requirement on Webpack major version before locking the approach (LOW confidence, unverified live) — this single decision also determines whether Webpack 4→5 is forced now or can wait. |
| Adopt `@vue/compat` (the official "migration build") as transitional runtime | Vue core team's recommended path for large, live Vue 2 apps: run Vue 3 internals in a configurable Vue-2-compatibility mode, then flip deprecations off one at a time with runtime warnings guiding you. Matches this project's "shippable in safe increments, zero downtime" constraint far better than a big-bang rewrite. | MEDIUM (setup) / ongoing (burn-down) | Source: v3-migration.vuejs.org/migration-build. This is the backbone strategy the rest of the table-stakes list burns down against. |
| Global app bootstrap rewrite (`new Vue()` → `createApp()`) | Vue 3 restructured the global API into a per-app instance API entirely; global `Vue.use/.filter/.prototype/.config` are gone. Everything registered in `src/index.js` (Vuex/Vue Router/BootstrapVue/Sentry, global filters, `window.fcs`/`window.Vue` globals) must move onto the `app` instance. | MEDIUM | Single-file blast radius (`src/index.js`) but every plugin registration point depends on this happening first. |
| Vue Router 2→4 upgrade | `vue-router@3` is Vue-2-only. Breaking API: `new VueRouter()`→`createRouter()`, `mode:'history'`→`createWebHistory()`, catch-all `*` route syntax→`:pathMatch(.*)*`, some guard/`next()` signature nuances. | MEDIUM | 19 routes to re-verify (history mode already in use, so no mode-strategy decision needed, just syntax). |
| State store upgrade — Vuex 3→4 minimum | `vuex@3` doesn't run on Vue 3; `vuex@4` is a near-drop-in Vue-3-compatible release (`createStore()` instead of `new Vuex.Store()`, otherwise same mutations/getters/actions API). This is the *minimum* to keep functioning — see Pinia under Optional Modernization for the bigger rewrite. | LOW–MEDIUM | Contained: whole store is inlined in one file (`src/index.js:102-241`) per ARCHITECTURE.md, so blast radius is small even though it's a "core" workstream. |
| Remove `Vue.set`/`Vue.delete`/`this.$set`/`this.$delete` calls | Removed entirely in Vue 3 — proxy-based reactivity makes them unnecessary, but any code calling them will throw/no-op. | HIGH | Character sheets read/write via `getVal`/`setVal` on a shared character object (ARCHITECTURE.md); this dynamic-property pattern is exactly what `Vue.set` was for in Vue 2. Audit all 12 sheets + shared input components for this pattern — likely the single riskiest reactivity change in this codebase. |
| Remove global filters (`Vue.filter`, `{{ x \| filter }}` template syntax) | Filters were removed from Vue 3 entirely. | MEDIUM | Mechanical but *widespread* — must grep all 12 sheet templates plus shared components for pipe syntax and convert to computed properties/methods, or use the documented `app.config.globalProperties.$filters` workaround for a faster mechanical port. |
| `v-model` contract changes on custom components | Vue 2 default prop/event pair (`value`/`input`) becomes `modelValue`/`update:modelValue`; multiple/named `v-model` bindings are now supported. Any custom component using `model: { prop, event }` or emitting `input` needs its prop/emit contract rewritten. | HIGH | Cascades through nearly every reusable input component (`input-aspect`, `input-stress`, `input-condition`, `input-consequence`, `input-fatepoints`, `input-skill-*`, `scene-editable-input`, etc.) — these are shared across all 12 sheets, so a mistake here fans out everywhere. |
| Root-instance event bus removal | Vue 3 removed `$on`/`$off`/`$once` from component instances, killing the common "use `this.$root` as an event bus" pattern. ARCHITECTURE.md already flags GameClient's DOM `CustomEvent` dispatching as an anti-pattern that predates this — audit for any *additional* `$root.$emit`/`$on` usage elsewhere (e.g. Noty wrapper, modal coordination) that isn't yet on that path. | MEDIUM | Replace with an explicit event-emitter library (e.g. `mitt`), direct props/emits, or store actions. |
| Custom directive hook renaming | Directive lifecycle hooks renamed: `bind`→`beforeMount`, `inserted`→`mounted`, `update`+`componentUpdated`→`updated`, `unbind`→`unmounted`. | LOW–MEDIUM | Applies to any `Vue.directive(...)` registrations wiring up interactjs/panzoom/dragscroll-style DOM behaviors — scope depends on how many custom directives exist versus direct library calls in `mounted()`. |
| Template edge-case audit: `v-if`/`v-for` priority swap, `key` on `v-if`/`v-else`, slot API unification (`$scopedSlots`→`$slots`), `.native` modifier removal, `$listeners` merged into `$attrs`, `$children` removed | Several small breaking changes that only bite where the specific pattern is used. `v-if`+`v-for` on the same element is the highest-risk one since Vue 2 gave `v-for` priority and Vue 3 gives `v-if` priority — silent behavior change, not a compile error. | MEDIUM | Needs a codebase grep pass across sheets/components/pages before flipping the relevant `@vue/compat` flags off. |
| Test tooling upgrade to stay Vue-3-aware (`@vue/test-utils` v1→v2, `vue-jest`→`@vue/vue3-jest`, `jest-serializer-vue` v2→v3) | PROJECT.md requires keeping the existing Jest suite green through the migration — the current test toolchain only understands Vue 2 component internals. | MEDIUM | Do this early (right after the compiler/loader bump), not last — you want the regression net back in place *before* touching component internals, not after. |
| Sentry SDK bump with Vue 3 integration (`@sentry/vue`) | Current `@sentry/browser@5` + manual Vue error-hook wiring predates Vue 3's `app.config.errorHandler` API; the modern Sentry SDK ships a dedicated `@sentry/vue` integration that hooks the Vue 3 app instance correctly. | LOW–MEDIUM | Bundled naturally with the app-bootstrap rewrite; low risk, contained to `src/index.js`. |
| Vue-2-only third-party library triage and replacement (see full list below) | Several installed libraries hard-depend on Vue 2 internals and will not run under Vue 3 regardless of compat-mode flags. | HIGH (aggregate) | See dedicated sub-table below — this is the largest single chunk of migration effort and should get its own roadmap phase(s). |
| jQuery reliance reduction where it blocks the upgrade | PROJECT.md explicitly scopes this in ("reduce... where it blocks the Vue 3 upgrade," not "eliminate entirely"). Direct DOM manipulation via jQuery alongside Vue's virtual DOM patching is a known source of desync bugs, and gets riskier once BootstrapVue (which drags jQuery + Bootstrap 4's JS plugins in) is replaced. | MEDIUM–HIGH | Tightly coupled to the BootstrapVue replacement workstream below — most jQuery usage should shrink organically once Bootstrap 4 JS components are swapped for Vue-native equivalents; audit for jQuery calls that are independent of BootstrapVue and decide case-by-case. |
| Final compat-flag burn-down and removal of `@vue/compat` | `@vue/compat` is explicitly a *temporary* scaffold, not a destination — Vue core docs are explicit that it needs a clear exit strategy. | MEDIUM (mostly mechanical once prior items are done) | This is the "migration is actually done" gate — every deprecation warning resolved, package swapped from `@vue/compat` to plain `vue@3`. |

#### Vue-2-only dependency replacement sub-table (part of the table-stakes list above)

| Library (current) | Status | Recommended Vue 3 path | Complexity |
|---|---|---|---|
| `bootstrap-vue@2.17` | Vue-2-only, unmaintained for Vue 3 (confirmed via search — the BootstrapVue project itself never shipped a Vue 3 version) | `bootstrap-vue-next` — an independent full rewrite targeting Vue 3 + Bootstrap 5, actively maintained (recent releases). Explicitly **not a drop-in**: component/prop names differ in places, and it pulls in Bootstrap 5 (a version bump from the current Bootstrap 4). | HIGH — likely the single biggest workstream in the whole migration; touches nearly every page/sheet (modals, tabs, forms, tables, buttons) |
| `vuex@3.5` | Vue-2-only | `vuex@4` (near drop-in, table stakes) now, `pinia` later (optional, see below) | LOW–MEDIUM |
| `vue-router@3.4` | Vue-2-only | `vue-router@4` | MEDIUM |
| `vuedraggable@2.24` (SortableJS wrapper) | Vue-2-only major version | `vuedraggable@4.x` ("vuedraggable-next") — Vue-3-targeted major version from the same maintainer, near-compatible API | LOW–MEDIUM |
| `vue-color@2.7` | No confirmed Vue 3 release from original maintainer | Community Vue 3 forks exist (e.g. `@ckpack/vue-color`); verify current maintenance status before committing | MEDIUM (unverified — flag for STACK-phase deep dive) |
| `vue-datetime@1.0-beta` | Already beta/stale even for Vue 2 | Replace with `@vuepic/vue-datepicker` (actively maintained, Vue-3-native) rather than seeking a Vue-3 fork of the old library | MEDIUM (different API surface) |
| `vue-meta@2.4` | Vue-2-only | `@unhead/vue` (the officially recommended head-management library for Vue 3, successor to `vue-meta`) or `@vueuse/head` | LOW–MEDIUM |
| `vue-cookies@1.7` | Unclear Vue 3 status (later majors claim framework-agnostic wrapper) | Verify current major version's Vue 3 support before reuse; fallback is `vue-cookie-next` or a plain non-Vue cookie utility | LOW (small surface area) |
| `vue-showdown@2.4` | No confirmed Vue 3 release found | Drop the Vue wrapper, use `showdown` (or `marked`) directly with `v-html` in a small wrapper component | LOW |
| `@johmun/vue-tags-input@2.1` | Vue-2-only, low recent activity | Needs a Vue-3-compatible tag input replacement (evaluate options at implementation time — this is a narrow, replaceable UI widget, not core logic) | MEDIUM (verify at STACK phase) |
| `@trevoreyre/autocomplete-vue@2.2` | Unverified current Vue 3 support | Check current major version before reuse; this library has historically tracked Vue versions closely | LOW–MEDIUM |
| `vue-draggable-resizable@2.2` | Old version, unclear Vue 3 status | Community forks target Vue 3; verify before reuse — relevant mainly to VTT/scene UI | MEDIUM |
| `vue-dragscroll@2.1` | Unclear Vue 3 status | Verify or replace with a small custom directive (narrow feature surface) | LOW |
| `vue-debounce@2.5` | Directive-based; unclear Vue 3 status | Verify, or replace with a hand-rolled debounce directive/composable (trivial to reimplement) | LOW |
| `vue-append@2.0` | Tiny plugin, unclear Vue 3 status | Trivial to reimplement natively or drop entirely — low value, low risk either way | LOW |
| `font-picker-vue@1.0` | Unclear current Vue 3 support | Verify at implementation time | LOW |
| `interactjs`, `@panzoom/panzoom`, `bootbox`, `peerjs`, `shortid`, `luxon`, `lodash-es`, `weekstart`, `whatwg-fetch` | Framework-agnostic JS libraries, not Vue-coupled | No migration action needed — these keep working regardless of Vue version | NONE |
| `amazon-cognito-identity-js`, `aws-sdk@2` | Framework-agnostic AWS SDKs | Out of scope for this milestone per PROJECT.md — do not touch unless directly blocking | NONE (deliberately deferred) |

### Optional Modernization (Defer or Opt-In)

Real value, but none of these are required to get the app running on Vue 3. Bundling them into the same PRs as the forced changes multiplies regression risk in a live, paying-subscriber app — sequence them as clearly separate, later phases.

| Workstream | Value Proposition | Complexity | Notes |
|---|---|---|---|
| Vuex 4 → Pinia migration | Pinia is now the Vue core team's officially recommended state library — simpler API, first-class Composition API/TypeScript support, better devtools. ARCHITECTURE.md already flags the current inline, unmodular Vuex store as an anti-pattern. | MEDIUM | Do this *after* Vuex 4 already runs cleanly on Vue 3 — it's a rewrite of the store's shape, not a forced compatibility fix. Natural pairing with... |
| Splitting the monolithic store into modules (auth/characters/campaigns/etc.) | Fixes the "unbounded inline store in `index.js`" anti-pattern called out in ARCHITECTURE.md. | LOW–MEDIUM | Can be done independent of the Pinia decision, or combined with it. |
| Service-layer container / DI pattern for `DbService`/`UserService`/`GameClient`/etc. | Fixes the "new service instance per component" anti-pattern (ARCHITECTURE.md) and is a natural on-ramp toward the "backend service abstraction" active requirement PROJECT.md wants *this* milestone. | MEDIUM | Note: PROJECT.md lists a service abstraction as an *Active* requirement for this milestone, not purely optional — but it is not something Vue 3 itself forces. Keep this refactor's scope thin (an abstraction seam for Milestone 2), not a full architectural overhaul. |
| Composition API adoption (rewriting Options API `.vue` files to `setup()`) | Enables logic reuse — e.g. extracting the shared `getVal`/`setVal` character-sheet reactivity pattern into a composable usable by all 12 sheets instead of duplicated per-sheet logic. | HIGH (if done broadly) | Fully optional: Vue 3 supports Options API indefinitely. Recommend touching only components already being rewritten for other forced reasons (e.g. the `v-model` contract changes above) rather than a blanket rewrite. |
| `<script setup>` syntax | Sugar over Composition API. | Same as above | Same deferral logic — only worth it where Composition API is already being adopted. |
| TypeScript adoption | High long-term value for a solo maintainer (catches the exact class of bugs this migration risks — prop/emit contract mismatches, reactivity misuse). | HIGH | Big, separate initiative; do not layer onto a migration that's already touching every file. Best done once Vue 3 is stable in production. |
| Webpack 4 → Vite migration | Webpack 4 is old, unmaintained, and has known friction with modern Node.js; Vite is the de-facto standard Vue 3 build tool with far better DX (fast HMR, simpler config). Strongly recommended given the "solo maintainer, low-maintenance" constraint in PROJECT.md. | HIGH | Sequence *after* Vue 3 already boots on the minimum-required loader bump (Webpack 5 + `vue-loader@17`) — don't combine a bundler swap with the framework version bump in the same risk window. Requires porting the dev/beta/prod env split and the Sentry release-tracking webpack plugin to Vite equivalents (`vite-plugin-sentry` or the Sentry Vite plugin). |
| Jest → Vitest migration | Natural pairing with a Vite adoption; faster, simpler config, same assertion API mostly. | MEDIUM | Not required — Jest runs fine against Vue 3 via `@vue/vue3-jest`. Defer until/unless Vite is adopted. |
| ESLint config modernization (flat config, `eslint-plugin-vue` Vue-3 rules) | Cleaner linting, catches more Vue-3-specific mistakes. | LOW | Cheap win, low risk, can happen anytime after the Vue 3 SFCs compile. |
| Consolidating the 12 character-sheet variants toward a shared engine/schema-driven renderer | Reduces duplication across sheet files long-term. | HIGH | Valuable idea, but explicitly tempting scope creep — see Anti-Features below. |

### Anti-Features (Deliberately Out of Scope for This Migration)

Things that look like reasonable "while we're in there" additions but would blow up the risk profile of a live-app migration.

| Anti-Feature | Why It's Tempting | Why It's Problematic Here | Alternative |
|---|---|---|---|
| New product features / new game systems | Momentum — "we're touching the sheets anyway" | PROJECT.md explicit feature freeze during modernization; every extra feature is untested surface area during an already-risky framework swap | Land the migration first; resume feature work once Vue 3 is stable in production |
| Visual redesign / UX overhaul | BootstrapVue→bootstrap-vue-next forces some component swaps anyway, so "might as well restyle" | PROJECT.md explicitly rules this out; conflates two kinds of risk (behavioral regression vs. intentional visual change) making regressions hard to attribute | Keep visual parity through the dependency swap; treat any *forced* visual changes as bugs to minimize, not opportunities |
| AWS → Firebase backend migration | The "isolate behind a service abstraction" work makes the seam visible | Explicitly Milestone 2; starting it now migrates a moving target (Vue 3 frontend) against another moving target (backend) simultaneously | Finish and stabilize Vue 3 first; the service abstraction seam is deliberately kept thin in this milestone |
| `aws-sdk` v2 → v3 upgrade | Also old/deprecated, feels like "same kind of work" | PROJECT.md explicitly calls this throwaway effort — Milestone 2 removes the AWS client stack entirely | Only touch it if it directly blocks the Vue 3 build/runtime; otherwise leave it alone |
| Blanket Composition API rewrite of all 12 sheets "while we're touching them" | Every sheet file gets opened anyway during the `v-model`/`Vue.set` audit | Multiplies the diff size and regression surface of an already-large migration; conflates "make it compile on Vue 3" with "make it idiomatic Vue 3" | Defer broad Composition API adoption to a later, dedicated phase (see Optional Modernization) |
| Full TypeScript conversion mid-migration | Same "touching every file anyway" logic | Adds a second large, unrelated risk dimension on top of the framework swap | Separate initiative, after Vue 3 ships |
| Rewriting working service/business logic (`DbService`, `UserService`, `GameClient` internals) beyond what compatibility requires | Code review often surfaces real quality issues while migrating | Not forced by Vue 3 at all — these are plain ES6 classes, framework-agnostic; rewriting them here mixes "must change" with "want to change" and complicates rollback | Log improvement ideas for Milestone 2 or a dedicated refactor phase; touch only what the Vue 3 API surface actually requires |
| Consolidating/merging the 12 character-sheet variants into one schema-driven engine | Legitimate long-term architectural improvement | High-effort, high-risk structural change unrelated to "does it run on Vue 3"; conflates migration with a product-architecture redesign | Revisit as its own initiative once Vue 3 is stable |
| Replacing PeerJS or the VTT protocol | Old-feeling dependency, "might need updating too" | Framework-agnostic, unaffected by the Vue version; no forcing function exists | Leave untouched; PeerJS works identically under Vue 2 or Vue 3 |
| Big-bang full rewrite instead of the incremental `@vue/compat` burn-down | Feels "cleaner" than living with a temporary compat shim | Directly conflicts with PROJECT.md's "shippable in safe increments, no big-bang cutover" constraint; unacceptably risky for a live, paying-subscriber app maintained solo | Use `@vue/compat` as the transitional scaffold; ship incrementally, flip deprecation flags module by module |

## Feature Dependencies (Workstream Sequencing)

```
[1. Compiler/loader toolchain bump: vue-loader→v17, @vue/compiler-sfc, webpack≥5 as forced]
    └──requires──> nothing (foundation; gates all Vue-3-aware compilation)

[2. Install Vue 3 core in @vue/compat (migration-build) mode]
    └──requires──> [1]

[3. Test tooling upgrade: @vue/test-utils v2, @vue/vue3-jest, jest-serializer-vue v3]
    └──requires──> [1], [2]   (bring the regression net back online BEFORE touching component internals)

[4. Global app bootstrap rewrite: new Vue() → createApp()]
    └──requires──> [2]

[5. Vue Router 3→4 upgrade]        [6. Vuex 3→4 upgrade]        [7. Sentry SDK → @sentry/vue]
    └──requires──> [4]                 └──requires──> [4]            └──requires──> [4]
    (5, 6, 7 can proceed in parallel once [4] lands — all are plugin registrations on the new `app` instance)

[8. Vue-2-only dependency replacement triage]
    ├── BootstrapVue → bootstrap-vue-next   (largest sub-item; own phase)
    ├── vuedraggable, vue-color, vue-datetime, vue-meta, vue-tags-input, etc.
    └──requires──> [4]  (each is a plugin/component registered at or after bootstrap)

[9. Component-by-component compat burn-down]
    ├── Remove Vue.set/$set usage (character sheet getVal/setVal reactivity)
    ├── Remove filters, convert to computed/methods
    ├── Fix v-model contracts on shared input-*.vue components
    ├── Remove root-instance event bus usage
    ├── Rename custom directive hooks
    ├── Audit v-if/v-for priority, slot API, key-on-v-else, etc.
    └──requires──> [3] (tests must exist to safely verify), [4]–[8] (infrastructure must exist first)

[10. jQuery reduction]
    └──requires──> [8] (specifically the BootstrapVue replacement — most jQuery usage is pulled in via Bootstrap 4 JS plugins)

[11. Remove @vue/compat entirely — pure Vue 3]
    └──requires──> [9] fully complete across all 12 sheets + shared components, [10]
    (this is the "migration done" gate)

--- everything below is optional modernization, explicitly sequenced AFTER [11] ---

[12. Vuex 4 → Pinia]  ──enhances──>  [13. Store modularization]
[14. Service-layer DI/container]  ──enables──>  (thin seam for Milestone 2, kept minimal per PROJECT.md)
[15. Webpack → Vite]  ──enables──>  [16. Jest → Vitest]
[17. Composition API / <script setup> adoption]  ──optional, only where already touching a file for another reason──
[18. TypeScript adoption]  ──separate initiative, after [11] is stable in production──
```

### Dependency Notes

- **Everything requires [1] and [2] first:** no Vue 3 SFC compiles, and no compat-mode runtime exists, until the toolchain understands `@vue/compiler-sfc`. This is the true foundation and should be the first roadmap phase.
- **[3] (test tooling) must land before [9] (component-by-component fixes):** PROJECT.md requires the Jest suite stay green throughout; fixing components without a working Vue-3-aware test runner means flying blind on regressions in a live app.
- **[8] BootstrapVue replacement is the long pole:** it's both the single highest-complexity item and a hard dependency for [10] jQuery reduction. Give it its own dedicated phase(s) rather than folding it into general "component compatibility" work.
- **[11] (removing @vue/compat) is a hard gate, not optional:** the Vue core team is explicit that the compat build is a transitional tool with an expected exit, not a permanent runtime mode.
- **[12]–[18] deliberately depend on [11], not the other way around:** none of the optional modernization items should block or be blocked by getting a working Vue 3 app shipped; sequencing them after keeps the core migration's risk surface minimal, matching PROJECT.md's "ship in safe increments" constraint.
- **[14] service-layer DI is the one item that straddles both lists:** PROJECT.md lists "isolate the backend behind a clean service abstraction" as an Active (in-scope) requirement for *this* milestone, even though it's not something Vue 3 forces. Scope it as a thin seam only — resist expanding it into a full architecture rewrite (see Anti-Features).

## MVP Definition

### Launch With (v1) — the minimum to ship Vue 3 to production with zero regressions

- [ ] Compiler/loader toolchain updated to compile Vue 3 SFCs (vue-loader/webpack bump)
- [ ] `@vue/compat` migration build installed and booting
- [ ] Test tooling upgraded (`@vue/test-utils` v2, `@vue/vue3-jest`) — regression net restored
- [ ] App bootstrap rewritten to `createApp()`
- [ ] Vue Router upgraded to v4
- [ ] Vuex upgraded to v4 (minimum viable; Pinia is a fast-follow, not launch-blocking)
- [ ] Sentry SDK upgraded with `@sentry/vue` integration
- [ ] BootstrapVue replaced with `bootstrap-vue-next` (or an equivalent decision reached after a dedicated spike) across all pages/sheets
- [ ] All Vue-2-only small libraries triaged and replaced/upgraded (see sub-table)
- [ ] `Vue.set`/`$set` usage removed from character-sheet reactivity paths
- [ ] Global filters removed/converted across all 12 sheets
- [ ] `v-model` contracts fixed on all shared `input-*.vue` components
- [ ] Root-instance event bus usage removed
- [ ] Custom directive hooks renamed
- [ ] `v-if`/`v-for`/slot/`.native`/`$listeners` edge cases audited and fixed
- [ ] jQuery reliance reduced to whatever remains non-blocking
- [ ] `@vue/compat` fully removed; pure Vue 3 in production
- [ ] Existing Jest/Vue Test Utils suite green, with expanded coverage around every item above

### Add After Validation (v1.x) — fast-follow, once Vue 3 is stable in production

- [ ] Vuex 4 → Pinia migration — trigger: once store logic is confirmed stable post-cutover
- [ ] Store modularization (split `index.js`'s inline store into modules) — trigger: pairs naturally with the Pinia move
- [ ] Thin service-abstraction seam for `DbService`/`UserService`/etc. — trigger: needed before Milestone 2 (Firebase) can start; keep it minimal
- [ ] Webpack → Vite migration — trigger: once Vue 3 is stable and the team wants the DX/maintenance win
- [ ] ESLint config modernization — trigger: cheap, anytime after SFCs compile on Vue 3

### Future Consideration (v2+) — defer until well past this milestone

- [ ] Broad Composition API / `<script setup>` adoption across all sheets — defer until a dedicated refactor initiative, not bundled with routine touches
- [ ] TypeScript conversion — defer; separate large initiative
- [ ] Jest → Vitest — defer; only worth it if/when Vite lands
- [ ] Consolidating the 12 sheet variants into a shared schema-driven engine — defer; product-architecture change, not a migration task

## Feature Prioritization Matrix

| Workstream | User/Business Value | Implementation Cost | Priority |
|---|---|---|---|
| Toolchain + `@vue/compat` foundation | HIGH (nothing else possible without it) | MEDIUM | P1 |
| Test tooling upgrade | HIGH (protects against regressions in a live paying-subscriber app) | MEDIUM | P1 |
| App bootstrap + Router + Vuex 4 upgrade | HIGH | LOW–MEDIUM | P1 |
| BootstrapVue → bootstrap-vue-next | HIGH (blocks nearly every page) | HIGH | P1 |
| Small Vue-2-only library triage | MEDIUM (each is narrow, but they add up) | MEDIUM (aggregate) | P1 |
| `Vue.set`/filters/`v-model`/event-bus/directive fixes | HIGH (silent runtime breakage if skipped) | HIGH | P1 |
| jQuery reduction | MEDIUM | MEDIUM–HIGH | P1 (coupled to BootstrapVue swap) |
| `@vue/compat` removal (final gate) | HIGH (defines "done") | MEDIUM | P1 |
| Vuex → Pinia | MEDIUM (maintainability, future TS support) | MEDIUM | P2 |
| Service-layer DI / thin abstraction seam | MEDIUM (unblocks Milestone 2) | MEDIUM | P2 |
| Webpack → Vite | MEDIUM (solo-maintainer DX/maintenance win) | HIGH | P2 |
| Store modularization | LOW–MEDIUM | LOW–MEDIUM | P2 |
| ESLint modernization | LOW | LOW | P3 |
| Composition API broad adoption | MEDIUM (long-term code reuse) | HIGH | P3 |
| TypeScript adoption | MEDIUM–HIGH (long-term, solo-maintainer safety net) | HIGH | P3 |
| Jest → Vitest | LOW–MEDIUM | MEDIUM | P3 |
| Sheet-engine consolidation | LOW (nice-to-have architecture cleanup) | HIGH | P3 |

**Priority key:**
- P1: Required for this milestone to ship (table stakes for running on Vue 3)
- P2: Should have, natural fast-follow once Vue 3 is stable
- P3: Nice to have, defer to a future, separate initiative

## Reference Migration Case Studies / Prior Art

No direct "competitors" apply to internal tooling, so this section substitutes prior-art from comparable real-world Vue 2→3 migrations of live apps, used to validate the workstream breakdown above:

| Source | Relevant Takeaway | Confidence |
|---|---|---|
| Vue core team, `v3-migration.vuejs.org` (official migration guide + migration-build docs) | Canonical source for every breaking change listed above; explicitly recommends the incremental `@vue/compat` burn-down approach for large/live apps over a rewrite | HIGH (official first-party docs) |
| Vue core team, Vue 2 EOL announcement (`blog.vuejs.org/posts/vue-2-eol`, `v2.vuejs.org/eol`) | Vue 2 reached End of Life December 31, 2023 — no further security fixes outside paid extended support (HeroDevs NES); confirms this migration is materially overdue from a support-risk standpoint, strengthening the case for prioritizing it | HIGH (official) |
| Community write-ups on large-app Vue 2→3 migrations (Crisp, Storyblok's Vue 2/Nuxt 2 SDK deprecation notice, various engineering blogs) | Consistent theme: dependency replacement (especially UI component libraries) dwarfs the pure-framework-API changes in effort for apps with heavy third-party UI-library usage — directly applicable given this app's BootstrapVue-heavy templates | MEDIUM (secondary sources, directionally consistent with official guidance but not independently verified line-by-line) |

## Sources

- [Breaking Changes | Vue 3 Migration Guide](https://v3-migration.vuejs.org/breaking-changes/) — HIGH confidence, official
- [Migration Build | Vue 3 Migration Guide](https://v3-migration.vuejs.org/migration-build) — HIGH confidence, official
- [New Framework-level Recommendations | Vue 3 Migration Guide](https://v3-migration.vuejs.org/recommendations) — HIGH confidence, official
- [Vue 2 Has Reached End of Life](https://v2.vuejs.org/eol/) — HIGH confidence, official
- [Vue 2 is Approaching End Of Life | The Vue Point](https://blog.vuejs.org/posts/vue-2-eol) — HIGH confidence, official
- [Vue 2 - Never-Ending Support (NES) | HeroDevs](https://www.herodevs.com/support/nes-vue) — MEDIUM confidence (vendor, but consistent with official EOL statement)
- [Migrating from Vuex ≤4 - Pinia](https://pinia.vuejs.org/cookbook/migration-vuex.html) — HIGH confidence, official Vue-ecosystem docs
- [bootstrap-vue-next (npm/GitHub)](https://www.npmjs.com/package/bootstrap-vue-next) and [Migration Guide | BootstrapVueNext](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-guide) — MEDIUM confidence (actively maintained project docs; not independently cross-checked against a second source)
- General web search results on `vue-meta`/`vue-datetime`/`vue-showdown`/`vue-cookies` Vue-3 alternatives — LOW confidence per uncorroborated web search; **flag every small dependency in the sub-table above for a fresh compatibility check at implementation time**, since library maintenance status changes quickly and this research reflects a point-in-time snapshot
- `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `package.json` — internal codebase facts (current dependency versions, architecture anti-patterns, explicit scope boundaries)

---
*Feature research for: Vue 2→3 migration workstreams (Fate Character Sheet Milestone 1)*
*Researched: 2026-07-23*
