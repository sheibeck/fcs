# Pitfalls Research

**Domain:** Vue 2 → Vue 3 migration of a live, revenue-generating subscription SPA (Fate Character Sheet)
**Researched:** 2026-07-23
**Confidence:** HIGH (grounded directly in this codebase's source; cross-checked against official Vue 3 migration guide and current library-ecosystem status)

This document is scoped to what THIS codebase will specifically break on, not generic "Vue 3 migration tips." Every pitfall below is backed by a concrete file/line reference found in `src/`.

## Critical Pitfalls

### Pitfall 1: `window.Vue` removal silently breaks every character sheet's `setVal`

**What goes wrong:**
`src/index.js` does `window.Vue = Vue` and `src/components/charactersheet.vue` calls `commonSvc.setVal(obj, arr, val, Vue)` — but `charactersheet.vue` never imports `Vue`. The bare `Vue` identifier resolves only because it falls through to the global `window.Vue`. `commonSvc.setVal()` (`src/assets/js/commonService.js:297-329`) then calls `Vue.set(...)` up to 5 levels deep for every field on every one of the 12 sheet types (`fate-core.vue`, `fate-condensed.vue`, `star-trek.vue`, etc. all delegate `setVal` through `$parent` to this same function). Vue 3 has no `Vue.set` static and the idiomatic migration removes the `window.Vue = Vue` global entirely. The moment that line is deleted (which it should be — it's an anti-pattern and Vue 3's `createApp()` doesn't produce a `Vue` constructor to assign anyway), every single character-sheet field edit across every game system throws `ReferenceError: Vue is not defined` with **no compile-time warning**, because it's an implicit global lookup, not an import.

**Why it happens:**
Vue 2 code passed the `Vue` constructor around manually so `commonService.js` (a plain, framework-agnostic-looking class) could call the global `Vue.set` API without importing Vue directly. This was a way to avoid a hard dependency on Vue inside a "service" class, but it created an undeclared, unenforced coupling to a global that only exists because `index.js` happens to set it.

**How to avoid:**
Rewrite `commonService.setVal()` to use plain property assignment (`obj[key] = val`) instead of `Vue.set()`. In Vue 3's Proxy-based reactivity, assigning a new property to an object that is already part of a reactive tree (e.g., a `character` prop passed into sheet components) triggers reactivity without `Vue.set` — this is one of the few areas where Vue 3 is strictly *less* fragile than Vue 2. Delete the `Vue` parameter from `setVal`'s signature entirely rather than trying to keep passing something Vue 3-shaped through it. Grep for every `Vue.set`/`Vue.delete` call before starting (currently isolated to this one function) and confirm none exist elsewhere.

**Warning signs:**
- Character edits silently stop persisting to the in-memory character object (form shows the typed value but nothing downstream reacts) — this is a runtime-only failure with no build error.
- `ReferenceError: Vue is not defined` in the browser console when editing any sheet field.

**Phase to address:** Reactivity/shared-state refactor phase (must happen alongside, not after, the framework cutover — `setVal` cannot ship in a state where it depends on a global that Vue 3 setup removes).

---

### Pitfall 2: `$children` is fully removed — breaks the Roll20/VTT click-to-roll buttons with no build error

**What goes wrong:**
Three places generate raw HTML strings with inline `onclick` handlers that reach into the global root instance via **fixed positional indices**:
- `src/assets/js/commonService.js:138` — `this.fcs.$children[0].$children[0].list(searchText)`
- `src/pages/AdversaryList.vue:306,310` — `onclick="fcs.$children[0].$children[0].sendToVTT(...)"` (rendered via `v-html` as the dice/invoke icons next to adversary skills/aspects)
- `src/components/input-stuntextra.vue:92` — `onclick='fcs.$children[0].$children[0].$children[1].$refs.charactersheet.sendToVTT(...)'` (the stunt "send to VTT" button)

`$children` was removed in Vue 3 with **no replacement API** (the official guidance is "use `$refs` or `provide`/`inject` instead," which requires a structural rewrite, not a find/replace). These handlers are strings injected via `v-html`, so nothing here is checked by the compiler, a linter, or a unit test — the break only manifests when a paying subscriber clicks a dice/invoke/stunt icon while the VTT/Roll20 integration is active, and it manifests as a dead click (or a thrown error swallowed by an inline `onclick`), not a visible crash.

**Why it happens:**
This is a Vue 2-era trick to reach a specific mounted component instance from HTML that lives outside Vue's own template/event system (because the HTML itself is dynamically built and interpolated via `v-html`, `$emit` isn't available). It also hard-codes the component tree's shape (`App` → router-view → `CharacterSheet` → active sheet), so it was already fragile before Vue 3 — any component insertion earlier in the tree silently breaks it today.

**How to avoid:**
Before migrating, replace all three call sites with an explicit, stable mechanism: either (a) a small `provide`/`inject`'d VTT-dispatch function established once at `App.vue` / `charactersheet.vue` and exposed on `window.fcs.sendToVTT` directly (one flat global function, not a tree walk), or (b) a Vuex action (`this.$store.dispatch('vtt/send', ...)`) called from the `onclick` string, e.g. `onclick="fcs.$store.dispatch('sendToVTT', {...})"`. Do this as a pre-migration cleanup on Vue 2 first (it's a safe, independently testable change), so the Vue 3 cutover doesn't have to solve "remove `$children`" and "rearchitect VTT dispatch" simultaneously.

**Warning signs:** No compiler/test signal. Must be manually verified by clicking every dice/invoke/stunt-send icon on every sheet type with VTT enabled (Roll20 and native FCS VTT) after any change here.

**Phase to address:** Do the dispatch-mechanism rewrite (still targeting Vue 2) in the pre-migration stabilization phase; verify no `$children`/`$parent`-array-index pattern remains before the Vue 3 cutover phase begins.

---

### Pitfall 3: `v-on="$listeners"` is used in every sheet and reusable input component — `$listeners` no longer exists

**What goes wrong:**
`v-on="$listeners"` appears 20+ times across every sheet (`fate-core.vue`, `fate-accelerated.vue`, `star-trek.vue`, `middle-earth.vue`, `mouse-guard.vue`, `fate-of-cthulhu.vue`, `fate-freeport.vue`, `dresden-files-accelerated.vue`, `fate-anything.vue`, `fate-core-custom.vue`, `fate-accelerated-custom.vue`) and in `charactersheet.vue` itself. In Vue 3, `$listeners` was merged into `$attrs` (event listeners now show up as `onXxx` attrs), and `inheritAttrs`/fallthrough behavior changed alongside it. This is a mechanical but **codebase-wide** change (every sheet component), and it interacts with the `.sync`-like custom-event chain used to bubble edits from leaf `input-*` components up to `charactersheet.vue`.

**Why it happens:**
The app uses a deep prop/event relay pattern — a leaf input component emits an event, and every intermediate sheet component forwards all listeners down using `v-on="$listeners"` so it doesn't have to manually re-declare every event name.

**How to avoid:**
Replace `v-on="$listeners"` with `v-bind="$attrs"` everywhere it appears (Vue 3 attrs already include listeners). Because this touches every sheet file, do it as one mechanical, scripted find-and-replace pass with a single component-level smoke test per sheet type immediately after, rather than fixing sheets ad hoc as bugs are reported — a partial pass here is exactly the kind of change that "looks done" after 2 of 12 sheets are fixed and quietly leaves the other 10 broken.

**Warning signs:** Skill/stunt/consequence/aspect edits stop propagating up from leaf inputs to the character object on some sheets but not others (works on the one sheet the developer happened to test).

**Phase to address:** Reactivity/component-API cutover phase, done as a single scripted sweep with a checklist of all 12 sheet files, not incrementally.

---

### Pitfall 4: Deeply nested `getVal`/`setVal` shared-mutation pattern hides reactivity edge cases

**What goes wrong:**
Every sheet delegates `getVal`/`setVal` through `$parent` up to `charactersheet.vue`, which delegates again to `commonService.js`, which does `eval(`obj.${graphPath}`)` for reads (`commonService.js:294`) and manual nested-object creation for writes. This works today because Vue 2's `Vue.set` explicitly notified watchers when a new nested key was added. Vue 3's Proxy-based reactivity generally handles new-property addition automatically *if the object is already inside Vue's reactive graph* — but this codebase's character objects arrive from `dbService.js` as raw DynamoDB `DocumentClient` results assigned wholesale to component data/props, then get mutated by string-built path segments (`arr[0]`, `arr[1]`, etc.) with no schema validation (already flagged in `CONCERNS.md` — "No Input Validation Framework"). Combine an untyped, dynamically-keyed nested object with an `eval()`-based getter, and any Vue 3 reactivity edge case (e.g., an object frozen or cloned via `JSON.parse(JSON.stringify(...))` — used elsewhere in `commonService.DeepCopy()` — momentarily leaving the reactive graph) will manifest as silent data loss: the UI shows a stale value, the user re-enters data thinking it didn't save, and the *next* save overwrites the field with the stale in-memory value.

**Why it happens:**
The `getVal`/`setVal` abstraction was built to avoid writing per-field computed properties for ~150+ character fields across 12 sheet types, at the cost of making the entire character object's reactivity implicit and untestable (per `CONCERNS.md`: "No Tests for commonService (getVal/setVal)" — flagged as a Medium-priority gap already, but this becomes High priority the moment reactivity semantics change under it).

**How to avoid:**
Before the Vue 3 cutover, add characterization tests (still on Vue 2) for `getVal`/`setVal` covering: new-key creation at each of the 5 nesting depths, arrays within the path, `false`/`0`/empty-string values (already special-cased at `commonService.js:288`), and a round-trip through `DeepCopy()`. Port these same tests to Vue 3 unchanged and confirm identical behavior before touching any sheet component. Do not attempt to "improve" `getVal`/`setVal` (e.g., replace `eval` with a safe path-accessor) in the same change as the Vue 3 port — do it as a separate, independently-verified step so a behavior regression can't be attributed to two changes at once.

**Warning signs:** Any bug report of "I edited X and it reverted" or "my stunt disappeared" during or after migration — treat these as reactivity regressions first, not user error.

**Phase to address:** Test-safety-net phase (write characterization tests on Vue 2 first) → reactivity refactor phase (port `getVal`/`setVal`, verify against same tests) → cutover phase (only after both are green).

---

### Pitfall 5: Bootstrap-Vue has no drop-in Vue 3 replacement — `bootstrap-vue-next` is a rewrite, not a port

**What goes wrong:**
`Vue.use(BootstrapVue)` in `src/index.js` registers a full component library (`b-modal`, `b-dropdown`, `b-tooltip`, `b-form-*`, etc. — used throughout `src/pages/*` and `src/components/*`) that is Vue 2-only at its core (its internals depend on Vue 2's constructor-based component/plugin API and cannot run even under Vue 3's `@vue/compat` migration build). The community successor, `bootstrap-vue-next`, targets Vue 3 + **Bootstrap 5**, not Bootstrap 4, and per its own migration guide is explicitly **not a drop-in replacement** — component prop names, slot names, and modal/toast programmatic APIs differ, and as of this research it remains a fast-moving project with ongoing breaking changes. Because this app's `Out of Scope` explicitly forbids a visual redesign ("keep the existing UI"), jumping from Bootstrap 4 → 5 to use `bootstrap-vue-next` will itself cause visual regressions independent of the component API changes: Bootstrap 5 removed `.form-group`, renamed the `ml-*`/`mr-*` spacing utilities to `.ms-*`/`.me-*` (RTL-friendly naming), changed default form-control styling, and dropped jQuery as a runtime dependency for its own JS components (modals, dropdowns, tooltips) — all of which this codebase's heavily-customized `site.scss` and every sheet's Bootstrap-4-class-laden templates assume.

**Why it happens:**
Teams assume "the Vue 3 version of library X" is a compatible upgrade the way most npm majors are; component libraries tied to a specific CSS framework version are a compounding two-axis migration (framework major + CSS framework major) disguised as one.

**How to avoid:**
Treat this as its own decoupled workstream, not a byproduct of the Vue 3 cutover: inventory every Bootstrap-Vue component actually used (grep for `<b-`), and for each decide per-component whether to (a) replace with plain Bootstrap 5 markup + a thin custom Vue 3 wrapper (most predictable, most manual work, zero external-library risk), or (b) adopt `bootstrap-vue-next` only for the highest-value components (modals, dropdowns) and accept the Bootstrap 5 CSS migration cost. Given "solo maintainer, prefer low-maintenance choices," bias toward (a) for simple components (buttons, form groups, badges — trivial to hand-roll) and only use a library for genuinely complex stateful components (modal, tooltip positioning). Budget a full visual-regression pass (all 12 sheet types, campaign/scene/adversary pages, VTT canvas) after this swap regardless of approach — this is the single highest-effort, highest-regression-risk part of the entire migration, larger than the Vue 3 API changes themselves.

**Warning signs:** "It compiles and renders" is not sufficient — Bootstrap 4→5 spacing/utility-class renames fail silently (unknown classes are just ignored by the browser, producing subtly broken spacing, not an error).

**Phase to address:** Dependency-replacement phase, sequenced *before* the Vue 3 framework cutover where possible (Bootstrap-Vue components can often be replaced with plain markup while still on Vue 2, decoupling this large, visually-verified change from the framework swap itself).

---

### Pitfall 6: jQuery directly mutates DOM nodes Vue also owns, and this app already leans on that

**What goes wrong:**
`src/index.js` sets `content: $('#results')` directly into Vuex state (a jQuery object stored as reactive Vuex state — already unusual). `commonService.js` does `$('#alert_placeholder').append(alertMsg)` where `alertMsg` contains an inline `onclick="eval(${dismiss})"` (already flagged as a security concern in `CONCERNS.md`), and `$('ul.navbar-nav').append(...)` injects a raw `<span>` into a navbar Vue also renders into. `SceneDetail.vue` does `document.getElementById("player-container").innerHTML = ""` directly. None of these DOM nodes are tracked by Vue's virtual DOM. Vue 3's renderer is more aggressive about block-level patching and skips re-diffing static subtrees for performance (`PatchFlag`/block-tree optimizations) — nodes that Vue "owns" but that jQuery has mutated out from under it are more likely to be silently overwritten, duplicated, or leaked (event listeners jQuery attached are lost) on the next re-render than they were under Vue 2's always-full-diff algorithm, because Vue 3 can decide a subtree "hasn't changed" from its own bookkeeping and skip visiting it — except when jQuery mutated it directly, Vue's bookkeeping is now wrong.

**Why it happens:**
jQuery and Bootstrap 4's own jQuery-dependent JS (modals, dropdowns, tooltips) were retained as a shortcut to avoid rewriting DOM-manipulation code as Vue directives/components, and the coupling was never load-bearing enough to break under Vue 2's simpler, always-diff renderer.

**How to avoid:**
Reduce jQuery reliance in the exact order the `PROJECT.md` Active requirements already specify ("Reduce direct jQuery reliance where it blocks the Vue 3 upgrade"). Concretely: replace `$('#alert_placeholder').append(...)` with a real Vue alert/toast component (also removes the paired `eval()` security issue for free); replace the navbar environment-label `$('ul.navbar-nav').append(...)` with a `v-if`-gated Vue element; replace `content: $('#results')` in Vuex state with a plain string/ref if it's just being used for text search, or a `ref()` if it must reference a DOM node. Anywhere jQuery is retained (e.g., because Bootbox modals still depend on it), keep it scoped to elements Vue's template does **not** render (e.g., dynamically created, fully jQuery-owned elements) rather than elements inside a Vue component's template.

**Warning signs:** Elements that "sometimes" don't update, navbar/alert content that appears then vanishes on the next route change, or duplicate alert banners stacking up.

**Phase to address:** Dependency-replacement phase (can and should start before the Vue 3 cutover, since it's independently valuable and lower-risk on Vue 2).

---

### Pitfall 7: `Vue.filter()` is used as a disguised global-callable-function mechanism, not for template interpolation

**What goes wrong:**
`src/index.js:244-260` registers `Vue.filter('filterSessions', ...)` and `Vue.filter('filterCampaigns', ...)`, but these are never used in a template as `{{ value | filterSessions }}` (confirmed — no pipe-filter syntax exists anywhere in `src/`). Instead, they're called imperatively as plain functions via `this.fcs.$options.filters.filterCampaigns()` (see `commonService.js:130-132`) — abusing the fact that Vue 2 exposes registered filters on `vm.$options.filters`. Vue 3 removes the entire filters feature (`Vue.filter` doesn't exist; `$options.filters` doesn't exist), so this isn't just an API-name change — the calling pattern itself has no equivalent and must be redesigned.

**Why it happens:**
`Vue.filter` was a convenient way to register a function reachable from the global root instance without importing it everywhere, exploiting an implementation detail (`$options.filters`) rather than the feature's intended use.

**How to avoid:**
Rewrite `filterSessions`/`filterCampaigns` as plain Vuex actions (`this.$store.dispatch('filterSessions')`) or as exported functions from `commonService.js` callable directly — either removes the dependency on Vue's filter registry entirely and is unaffected by the Vue 3 cutover once done.

**Warning signs:** Search-as-you-type on the campaign/session list pages stops filtering results after migration, with no console error (the call site `this.fcs.$options.filters.filterCampaigns()` would throw `Cannot read properties of undefined`, but only when a user types in that specific search box).

**Phase to address:** Pre-migration cleanup, alongside Pitfall 2/7's dispatch-mechanism rework (both are "replace ad hoc global-reachability tricks with a real Vuex action" fixes and should be done together).

---

### Pitfall 8: `createApp()` doesn't produce a `Vue` constructor or a component-instance-shaped root the same way `new Vue()` does

**What goes wrong:**
`src/index.js:263-269` does `window.fcs = new Vue({ el: '#app', store, router, components: { App }, template: '<App/>' })`. In Vue 2, this makes `window.fcs` a component instance with `$store`, `$children`, `$refs`, `$options.filters`, etc. — and the codebase relies on `window.fcs` being reachable and shaped exactly this way from unrelated files (`commonService.js`, `AdversaryList.vue`, `input-stuntextra.vue`, and any inline `onclick=` string anywhere in rendered HTML). Vue 3's `createApp(App)` returns an **App instance**, which is a different, much smaller object (`.use()`, `.mount()`, `.component()`, `.config`, etc.) — it is *not* a component instance and has no `$store`/`$children`/`$refs`. `app.mount('#app')` *does* return the root component's public instance (closer to the old shape), so `window.fcs = app.mount('#app')` is the correct replacement — but every plugin registration must also move from `Vue.use(X)` (global, pre-instance) to `app.use(X)` (per-app-instance, post-`createApp`), and plugins themselves must be Vue-3-compatible builds (Vuex 3 → Vuex 4 `createStore`, Vue Router 3 → Vue Router 4 `createRouter`) since Vue 3's plugin/`app.use()` contract is different from Vue 2's.

**Why it happens:**
"Just call `createApp` instead of `new Vue`" is the surface-level migration advice, but it hides that (a) the return value's shape changed, (b) every `Vue.use()` call site needs to migrate to `app.use()` in the new bootstrap file, and (c) any plugin that hasn't shipped a Vue-3-compatible major version (Bootstrap-Vue, `vue-datetime`, `@johmun/vue-tags-input`, `vue-append`, `vuedraggable` v2) will fail at `app.use()` even if the syntax is updated correctly, because the plugin's *internals* still target Vue 2.

**How to avoid:**
Do the bootstrap-file rewrite (`createApp`/`app.use`/`app.mount`) as its own isolated, first step of the Vue 3 cutover phase, with every plugin temporarily removed and re-added one at a time, confirming the app still boots after each addition. Explicitly decide, before starting, which of the current `Vue.use()` plugins have a real Vue 3-compatible replacement (Vuex→Vuex 4, Vue Router→Vue Router 4, `vue-cookies`, `vue-showdown` — verify current major supports Vue 3) versus which need replacement entirely (`vue-datetime` → e.g. `@vuepic/vue-datepicker`; `vue-append` → remove, trivially replaceable with native DOM/Vue templating; `vuedraggable` → `vuedraggable@next`/`vue-draggable-next`; `@johmun/vue-tags-input` → unmaintained, Vue 2-only, needs a replacement tags-input component or a small hand-rolled one; `vue-meta` → `@unhead/vue`).

**Warning signs:** App fails to boot at all after the bootstrap rewrite (best case — loud failure), or boots but `window.fcs.$store`/`window.fcs.$children` are `undefined` in places still relying on the old shape (worse case — silent, scattered failures across unrelated features).

**Phase to address:** Build-tooling/cutover phase, done first and in isolation before touching individual components.

---

### Pitfall 9: The existing test suite cannot run against Vue 3 components at all until Vue Test Utils and Jest transforms are upgraded — and every single test file uses the pattern that's removed

**What goes wrong:**
Per `TESTING.md`, **every** existing spec file uses `const localVue = createLocalVue(); localVue.use(Vuex); ... mount(Component, { store, localVue, ... })`. `@vue/test-utils` 2.x (the Vue 3-compatible major) **removes `createLocalVue()` entirely** — plugins/mixins/mocks move to a `global` mount option (`mount(Component, { global: { plugins: [store], mocks: {...} } })`). `propsData` is renamed to `props`. `vue-jest` 3.x (current) only transforms Vue 2 SFCs; Vue 3 requires `vue-jest` 5.x or a switch to Vitest entirely (which pairs naturally with a Vite-based bundler swap, if that's the chosen Webpack 4 replacement). Because 100% of the current 6 spec files use the now-removed `createLocalVue` pattern, there is no way to run *any* existing test against a Vue-3-ported component without first rewriting the test itself — meaning if test-tooling migration happens after component migration, you have zero automated regression coverage during the single riskiest part of the project.

**Why it happens:**
Teams often treat test-tooling upgrades as an afterthought ("get the app working first, fix tests after") — which is backwards for a live app with paying customers, since tests are the primary regression detector during exactly this period.

**How to avoid:**
Sequence test-tooling migration *before or in lockstep with* the first component migrated, not after. Given coverage is already thin (~8% per `CONCERNS.md`, 6 of 73 source files), treat "expand coverage on fragile areas" and "upgrade test tooling" as one combined pre-migration phase: (1) upgrade Jest/VTU/vue-jest (or switch to Vitest) against the **current Vue 2** code first, fixing the `createLocalVue`→`global` mechanical rewrite across all 6 files while behavior is still Vue 2 (a lower-risk dry run of the exact same tooling change needed later), (2) add characterization tests for the untested fragile areas already flagged in `CONCERNS.md` (`dbService.js`, `userService.js`, `gameClient.js`/`gameServer.js`, `commonService.getVal/setVal`) while still on Vue 2, so there's a real regression net, (3) only then begin porting components to Vue 3, running the now-modernized test suite continuously. If `jest-serializer-vue` snapshot testing is introduced at any point, confirm the serializer version matches the VTU2 wrapper shape (no existing `.snap` files were found in this repo, so there is no legacy-snapshot-format risk today — but don't introduce snapshot tests using the old serializer against Vue 3 output).

**Warning signs:** "We'll fix the tests after" as a stated plan; a green CI that's actually testing 0 components because every spec file errors out on `createLocalVue is not a function` and the suite is reported as "skipped" rather than "failed" somewhere in the pipeline.

**Phase to address:** Test-safety-net phase, first, before any component-level Vue 3 port begins.

---

### Pitfall 10: Sentry's Vue integration API changed alongside the framework, and release/sourcemap continuity can break exactly when you need it most

**What goes wrong:**
`src/index.js:76-81` wires Sentry via `@sentry/integrations`' `VueIntegration({ Vue, attachProps: true, logErrors: true })`, passing the Vue 2 **constructor**. Current Sentry SDKs (`@sentry/vue` in the 7.x/8.x line) use a different integration shape tied to the Vue 3 **app instance** (`Sentry.init({ app, integrations: [...] })` or `app.use(Sentry.vueIntegration(...))` depending on version), not the constructor. `CONCERNS.md` already flags the current Sentry Browser SDK (5.27.6/`@sentry/browser` per `STACK.md`) as carrying a known prototype-pollution CVE, so a Sentry SDK bump is needed regardless — meaning this integration rewrite and a security-driven major-version bump collide in the same change. Separately, `@sentry/webpack-plugin` (used for release/sourcemap upload, tied to `package.json`'s `version`) has a different config shape than `@sentry/vite-plugin` — if the bundler is swapped as part of this milestone, the release-naming and sourcemap-upload mechanism changes too. If release identifiers or upload behavior drift during the transition builds, **errors thrown by subscribers during the migration rollout itself become unsymbolicated** (raw minified stack traces), which is the worst possible time to lose error visibility.

**Why it happens:**
Error monitoring tooling is treated as "just works, don't touch it" infrastructure, so its own breaking changes get discovered only after a rollout, when it's too late to see what actually broke for users.

**How to avoid:**
Treat the Sentry SDK upgrade (5.x → current major, with the Vue integration API rewrite) as its own verified step, done and confirmed (test that a deliberately-thrown error appears in the Sentry dashboard, correctly symbolicated, with the right release tag) on a beta/staging deploy *before* the bundler swap and *before* the Vue 3 cutover — not bundled into either. When the bundler changes, do one release cycle where you manually diff the produced release name/sourcemap artifacts against the previous convention before relying on it during the actual risky rollout weeks.

**Warning signs:** Sentry dashboard shows minified/unsymbolicated stack traces, or errors stop appearing at all, immediately after a build-tooling or Sentry SDK change — verify this in a non-prod environment, never discover it via a raw stack trace during the real migration.

**Phase to address:** Build-tooling phase (Sentry SDK/integration rewrite) verified independently before the framework cutover phase; re-verified again after the bundler swap.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Keep `@vue/compat` (migration build) running longer than one release cycle | Lets old and new component patterns coexist, unblocks incremental shipping | Runtime overhead, deprecation-warning noise masks real regressions, delays realizing Vue 3 performance/bundle wins | Acceptable as a *deliberate, time-boxed bridge* during the cutover phase only — never as the final production target |
| Leave Bootstrap-Vue components in place and wrap them individually in `@vue/compat` shims | Avoids the big Bootstrap 4→5 visual-regression pass up front | Bootstrap-Vue's own internals are Vue-2-native; the compat build cannot make a Vue-2-only *library* run under Vue 3 — this "shortcut" doesn't actually work and wastes time discovering that | Never — Bootstrap-Vue must be replaced component-by-component, not shimmed |
| Fix `v-on="$listeners"` → `v-bind="$attrs"` sheet-by-sheet as bugs surface | Looks like fast incremental progress | Silent, inconsistent breakage across 12 sheet types with no way to know which are fixed without manually testing each | Never — do it as one scripted, checklist-verified sweep |
| Defer `eval()`/`v-html` cleanup in `commonService.js`/`scene-zone.vue`/`fate-core.vue` since migration already touches those files | Avoids scope creep in the migration | Security-flagged code (`CONCERNS.md`) gets touched anyway during the `$children`/reactivity rewrites — doing the security fix separately means touching the same lines twice | Acceptable to defer only if each `eval()`/`v-html` site is explicitly re-flagged as a follow-up ticket, not silently left as-is |
| Skip characterization tests for `getVal`/`setVal` because "it's simple" | Saves a few days upfront | The single most-relied-upon shared-mutation function in the app (every field on every sheet), untested, changing reactivity semantics under it | Never — this is the highest-leverage test to write before touching anything else |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Bootstrap-Vue → `bootstrap-vue-next` | Treating it as a version bump; ignoring the paired Bootstrap 4→5 CSS migration it requires | Inventory `<b-*>` usage, decide per-component (hand-rolled markup vs. library), budget a full visual-regression pass separately from the framework logic changes |
| Sentry Vue integration | Upgrading the Vue framework without upgrading the Sentry SDK/integration API in the same verified step, or vice versa | Upgrade and verify Sentry's Vue integration (constructor-based → app-instance-based) as an isolated, tested step; confirm sourcemap/release continuity on a non-prod deploy first |
| Vuex 3 → Vuex 4 | Assuming `new Vuex.Store()` + `Vue.use(Vuex)` still works under `createApp()` | Use `createStore()` and `app.use(store)`; audit `src/index.js`'s single monolithic store for any Vue-2-only getter/mutation idioms while touching it |
| Vue Router 3 → Vue Router 4 | Assuming route guard/`this.$route` shapes are unchanged | `createRouter()`/`createWebHistory()` replace the old constructor API; confirm route mocks in every spec file (`TESTING.md` shows `$route` mocked directly — verify mock shape still matches actual Router 4 `$route`) |
| PeerJS VTT (`gameClient.js`/`gameServer.js`) | Assuming this is unaffected because it's "just JavaScript, not Vue" | It dispatches `document.dispatchEvent(new CustomEvent(...))` consumed by Vue components (`SceneDetail.vue`) — verify event-listener lifecycle (`created()`/`beforeUnmount()` — renamed from `beforeDestroy` in Vue 3) still cleans up correctly, since a missed rename here leaks listeners silently |
| Roll20 "Fate of 20" extension | Assuming the `fcs.$children[...]` dispatch pattern is "external" to the Vue migration since it targets another window/tab | It's rendered from *this* app's own `v-html` output and depends entirely on `window.fcs`'s internal shape — must be fixed as part of this migration, not treated as a Roll20-side concern |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Leaving `eval()` in `getVal` (`commonService.js:294`), `ShowAlert`'s `eval(${dismiss})` (`commonService.js:188`), `scene-zone.vue`'s dynamic label access, and `fate-core.vue`'s skill-level regex eval untouched while rewriting the surrounding reactivity code | Migration work touches these exact lines anyway (for `$children`/Vue.set fixes); leaving `eval()` in place means the security fix (already flagged as Critical in `CONCERNS.md`) gets a second future PR that touches the same lines again, doubling regression risk | Replace `eval()` with safe alternatives (optional chaining / a small path-accessor utility) in the *same* changeset as the reactivity rewrite these functions already require |
| Widening `v-html` usage while replacing Bootstrap-Vue markup or jQuery DOM injection | Existing `v-html` usage (`CampaignDetail.vue`, `AdversaryList.vue`, `scene-aspect.vue`) is already flagged as a latent XSS risk if the data source is ever untrusted; a migration that copies these patterns into new components multiplies the surface area | Audit every `v-html` site touched during migration; do not introduce new `v-html` usage for content that could ever originate from another user (shared/public campaigns, adversaries) without adding DOMPurify |
| Treating the `window.fcs`/`window.Vue` globals as "just for convenience" and recreating an equivalent global surface post-migration | A global root-instance reference is exactly what made the `$children`-index and `$options.filters` hacks possible in the first place; recreating a similarly-shaped global invites the same category of fragile, untestable coupling in new code | If a global handle is genuinely needed (e.g., for the `onclick=` string dispatch pattern until it's fully removed), keep its surface area minimal and flat (one dispatch function) rather than exposing the whole app/store/component tree |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|--------------|-------------------|
| Bootstrap 4 → 5 utility-class renames (`.ml-*`/`.mr-*` → `.ms-*`/`.me-*`, `.form-group` removal) shipped without a full visual pass | Spacing/alignment silently degrades across all 12 character sheets and every page — nothing crashes, it just looks subtly wrong, which is worse for a "keep the existing UI" requirement than an obvious break | Do a side-by-side visual diff (old Bootstrap 4 build vs. new build) for every sheet type and every major page before considering the dependency swap done |
| Partial `$listeners`→`$attrs` migration leaving some sheets non-functional for edits | A paying subscriber on one specific game system (e.g., Mouse Guard) finds their sheet stops saving stunt/extra edits while other sheets work fine — support-ticket-shaped, hard to reproduce if the reporter doesn't mention which sheet type | Verify all 12 sheet types explicitly after this change, not just the 1-2 sheets a developer happens to test with |
| VTT dice/invoke/stunt buttons going dead (Pitfall 2) without any visible error | A GM mid-session clicks "send to VTT" and nothing happens, with no error shown, during a live game | Add a visible failure mode (toast/notification) if the VTT dispatch function is unreachable, rather than a silently swallowed inline `onclick` error |

## "Looks Done But Isn't" Checklist

- [ ] **`window.fcs`/global bootstrap rewrite:** Compiling and mounting successfully does not confirm `$store`, `$refs`, or any downstream code path that reads `window.fcs.*` still works — verify every known consumer (`commonService.js`, `AdversaryList.vue`, `input-stuntextra.vue`) explicitly.
- [ ] **`v-on="$listeners"` → `v-bind="$attrs"` sweep:** "It builds" does not mean all 12 sheets still propagate edits — manually edit at least one field of each type (text, checkbox, skill, stunt, consequence, aspect) on every sheet.
- [ ] **Bootstrap-Vue replacement:** Rendering without console errors does not mean the visual result matches the pre-migration UI — do an explicit before/after screenshot comparison per page/sheet.
- [ ] **Test suite "passing":** A green `yarn test` does not mean components are actually covered if spec files are erroring on `createLocalVue` and being silently excluded — confirm the actual number of tests executed didn't drop after the tooling upgrade.
- [ ] **Sentry integration:** The app loading without errors does not mean Sentry is still capturing and correctly symbolicating errors — deliberately throw a test error and confirm it appears correctly in the dashboard with the right release tag.
- [ ] **VTT/Roll20 dispatch:** The sheet rendering correctly does not mean the dice/invoke/stunt-to-VTT buttons work — these are `v-html`-injected `onclick` strings invisible to any component-level test; must be manually clicked.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|-----------------|
| `window.Vue`/`setVal` breaks after removing the global | LOW | Single-function fix in `commonService.js` (replace `Vue.set` calls with plain assignment); no data loss since it's a runtime-only failure caught immediately on the next edit attempt |
| `$children`-index VTT dispatch breaks post-cutover | MEDIUM | Requires a small architectural fix (Vuex action or flat global dispatch function) plus regenerating the three `v-html` string-builder call sites; no stored data affected, only in-session VTT messaging |
| Bootstrap-Vue swap causes widespread visual regressions discovered post-ship | HIGH | Requires a dedicated visual-regression pass across all pages/sheets after the fact — far more expensive than doing it proactively before shipping; consider feature-flagging the new UI library behind a beta cohort first |
| Test tooling upgraded after component migration, leaving a gap with no regression coverage | HIGH | Requires reconstructing characterization tests retroactively against already-migrated (and possibly already-buggy) components, losing the "known-good baseline" value tests are supposed to provide |
| Sentry sourcemap continuity breaks during rollout | MEDIUM | Recoverable by re-uploading correct sourcemaps for the affected release once identified, but any errors reported during the gap window are unsymbolicated and harder to triage retroactively |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| `window.Vue`/`Vue.set` global dependency (Pitfall 1) | Reactivity refactor phase | `setVal` characterization tests pass under Vue 3 with no `Vue` parameter; no bare `Vue` identifier remains outside the framework's own imports |
| `$children` VTT dispatch (Pitfall 2) | Pre-migration cleanup phase (Vue 2), verified again in cutover phase | Manually click every dice/invoke/stunt VTT button on at least 3 sheet types with VTT active |
| `$listeners`→`$attrs` sweep (Pitfall 3) | Component-API cutover phase | Edit one field of each input type on all 12 sheet files; confirm the character object updates |
| `getVal`/`setVal` shared-mutation reactivity (Pitfall 4) | Test-safety-net phase (write tests) → reactivity refactor phase (port) | Characterization tests written on Vue 2 pass unchanged on the Vue 3 port |
| Bootstrap-Vue replacement (Pitfall 5) | Dependency-replacement phase, before framework cutover | Visual diff per page/sheet against pre-migration screenshots |
| jQuery/Vue DOM coexistence (Pitfall 6) | Dependency-replacement phase, before framework cutover | No remaining jQuery DOM mutation inside any element a Vue template also renders into |
| `Vue.filter`/`$options.filters` hack (Pitfall 7) | Pre-migration cleanup phase (Vue 2) | Session/campaign search-as-you-type still filters correctly after `Vue.filter` calls are replaced with a Vuex action |
| `createApp`/global bootstrap rewrite (Pitfall 8) | Build-tooling/cutover phase, first step | App boots with each plugin re-added one at a time; `window.fcs.$store`/equivalent confirmed reachable where still needed |
| Test tooling migration sequencing (Pitfall 9) | Test-safety-net phase, before any component port | Test count/coverage does not regress after the VTU1→2 + Jest transform upgrade, done first against Vue 2 code |
| Sentry integration/release continuity (Pitfall 10) | Build-tooling phase, verified independently | Deliberately-thrown test error appears correctly symbolicated in Sentry on a non-prod deploy, both before and after the bundler swap |

## Sources

- Direct codebase inspection: `src/index.js`, `src/assets/js/commonService.js`, `src/components/charactersheet.vue`, `src/sheets/*.vue` (all 12 sheet types), `src/pages/AdversaryList.vue`, `src/components/input-stuntextra.vue`, `build/webpack.config.base.js` — HIGH confidence (primary source, this codebase)
- `.planning/codebase/CONCERNS.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/TESTING.md`, `.planning/codebase/STACK.md`, `.planning/PROJECT.md` — HIGH confidence (existing codebase map)
- Official Vue 3 Migration Guide (`v3-migration.vuejs.org`), including the Migration Build (`@vue/compat`) documentation — HIGH confidence (official framework documentation)
- `bootstrap-vue-next` project documentation and migration guide, GitHub discussion #874 on BootstrapVue's Vue 3 path — MEDIUM confidence (community project, actively changing; verify current alpha/beta status before committing to it in planning)
- `vue-draggable-next`/`vuedraggable@next` package documentation — MEDIUM confidence (community-maintained Vue 3 port)

---
*Pitfalls research for: Vue 2 → Vue 3 migration, Fate Character Sheet (live subscription SPA)*
*Researched: 2026-07-23*
