# Architecture Research: Vue 2→3 Migration Structure

**Domain:** Vue 2→3 framework migration of a live, single-maintainer subscription SPA (no app server; browser talks directly to AWS)
**Researched:** 2026-07-23
**Confidence:** HIGH (migration-build mechanics, sequencing, official Vue guidance) / MEDIUM (third-party plugin replacement specifics, exact `@vue/compat` flag behavior on this codebase's edge cases — verify empirically during Phase 0)

## Migration Strategy: Incremental (`@vue/compat`) vs Clean-Room Rewrite

**Recommendation: incremental migration via the official `@vue/compat` migration build. Do not do a clean-room rewrite.**

| Factor | Big-bang rewrite | `@vue/compat` incremental |
|---|---|---|
| Paying customers / zero-downtime constraint | High risk — one giant PR, one giant regression surface, all-or-nothing cutover | Low risk — ships behind the same build pipeline the whole time; every commit is independently testable |
| Solo maintainer capacity | Requires holding the entire app's behavior in your head at once | Lets you migrate one file/component at a time while everything else keeps working |
| ~70+ Vue SFCs, 12 sheet variants, heavy jQuery/Bootstrap-4 coupling | Rewrite would touch all of it simultaneously | Migration build lets legacy patterns (`Vue.set`, `$children`, filters, `$listeners`) keep working with runtime deprecation warnings while you fix them incrementally |
| Existing Jest/Vue Test Utils suite (thin, ~8% coverage per CONCERNS.md) | Rewrite invalidates most assumptions tests made; hard to know what regressed | Existing tests keep running against the compat build at every step, catching regressions as you go; you add tests around the specific area you're touching |
| Feature freeze requirement (PROJECT.md) | Long single branch increases merge/drift risk during freeze | Each phase ships as a small, revertible slice; freeze duration per change is minimal |

**Why not a rewrite:** the codebase's risk isn't algorithmic complexity, it's *breadth* — 12 sheet templates, dozens of input components, a VTT peer-to-peer subsystem, and three service integrations (Cognito, DynamoDB, Stripe/Lambda) that all currently work. A rewrite re-derives all of that from scratch with no compiler/runtime safety net telling you what you broke. The migration build's entire purpose is to let Vue 3's stricter reactivity/compiler run your *existing* Options-API code, surfacing every incompatibility as a console warning you can grep for and fix one at a time — this is exactly the profile of a live app with paying users and a single maintainer. [Vue 3 Migration Build docs](https://v3-migration.vuejs.org/migration-build), [Vue Mastery: Vue 3 Migration Build](https://www.vuemastery.com/blog/vue-3-migration-build/)

**How it works mechanically:** `@vue/compat` is a build of Vue 3 that runs in "Vue 2 mode" by default — most Options API, global `Vue.use`/`Vue.filter`/`Vue.set` idioms, and template syntax behave like Vue 2, while the *compiler and reactivity core* are Vue 3's. Deprecated/changed behaviors (filters, `$on`/`$off`/`$children`, `Vue.set`, functional-component `template`, `v-model` on custom components, global mixins/prototype extension, `data()` merging in mixins, etc.) emit a runtime warning per usage and can be toggled feature-by-feature between "Vue 2 compat" and "Vue 3 strict" via `compatConfig`. You install it as a webpack alias for `vue` (`vue: '@vue/compat'`) and add `@vue/compat`'s compiler-sfc as your `vue-loader`'s compiler — the SFC-heavy structure here maps cleanly onto that.

**Practical sequence per warning class:** run the app under compat mode, open the console, triage warnings into "silence via `compatConfig` for now" (things not worth fixing this phase) vs. "fix immediately" (things blocking correctness, e.g. reactivity gaps). Flip individual compat flags to `false` (strict Vue 3 behavior) once each class of usage is fixed, until the whole app runs with `MODE: 3` and `@vue/compat` can be swapped for plain `vue`.

## Current Architecture Recap (baseline)

```
┌───────────────────────────────────────────────────────────────────┐
│  window.fcs = new Vue({ el:'#app', store, router, ... })  (index.js)│
├──────────────┬───────────────┬───────────────┬─────────────────────┤
│ Vue Router   │ App.vue       │ Vuex Store    │ Global plugins       │
│ (history)    │ (nav/shell)   │ (inline,      │ BootstrapVue, Vue-   │
│              │               │  non-modular) │ Cookies, VueAppend,  │
│              │               │               │ VueShowdown, Datetime│
├──────────────┴───────────────┴───────────────┴─────────────────────┤
│ Pages (19 routes) → charactersheet.vue → sheet-*.vue (12 systems)  │
│    → input-*.vue leaf components (via $parent chain, see below)   │
├──────────────────────────────────────────────────────────────────── │
│ Service layer (src/assets/js/*): new XService(this.$root/this.fcs) │
│  DbService · UserService · SubService · CommonService · GameClient │
│  · PeerService · fcsVTT(Client) · fateof20 · models                │
├──────────────────────────────────────────────────────────────────── │
│ Direct AWS/3P clients: aws-sdk v2 (DynamoDB, Lambda, Cognito IdP),  │
│ amazon-cognito-identity-js, Stripe.js, PeerJS                       │
└───────────────────────────────────────────────────────────────────┘
```

Key structural facts that drive migration ordering (verified in source, not inferred):

- **`window.fcs`/`window.Vue`** are set once in `src/index.js` and are the *only* globals; everything else reaches the root instance via `this.$root` (confirmed in 24 files) or `this.fcs` passed into service constructors. There is no plugin/DI container.
- **Services are always constructed per-use** (`new DbService(this.$root)`), never singletons, never injected. They read Cognito/Vuex state off the instance passed in.
- **BootstrapVue *component* usage (`b-modal`, etc.) is narrow** — grep shows only 4 files (`SceneDetail.vue`, `scene-zone.vue`, `scene-object.vue`, `index.js`) actually instantiate BootstrapVue components. The other ~40 templates use plain Bootstrap 4 CSS classes (`col-sm-6`, `form-group`, `d-flex`) with vanilla `data-toggle` jQuery/Bootstrap-JS widgets (see `App.vue`'s navbar dropdown) — those have **no Vue-version dependency at all**. This shrinks the real BootstrapVue replacement surface to 4 files, not the whole app.
- **The character-sheet `$parent` chain is exactly 3 levels deep and Options-API-idiomatic**, confirmed by reading the code: `input-aspect.vue` (leaf) → `this.$parent.getVal/setVal(...)` → resolves to the sheet component (e.g. `fate-accelerated.vue`) → which defines its own `getVal(graphPath)/setVal(arr,val)` that call `this.$parent.getVal(this.character, graphPath, ...)` → resolves to `charactersheet.vue`, which defines `getVal(obj, graphPath, default)`/`setVal(obj, arr, val)` delegating to `CommonService.getVal/setVal`. `CommonService.setVal` calls `Vue.set` explicitly, gated on path depth (hand-unrolled for 1–5 path segments); `CommonService.getVal` walks the path manually then **also calls `eval(\`obj.${graphPath}\`)`** at the end (redundant with the manual walk, and a live `eval()` security finding already flagged in CONCERNS.md).

## Recommended Build/Sequencing Order

Sequence components strictly in dependency order — nothing downstream can be safely migrated before what it depends on is stable. Each stage should be its own phase/branch, shippable and revertible independently.

```
Stage 0  Bootstrap the compat build (tooling only, no behavior change)
           │  webpack alias vue → @vue/compat, vue-loader compat compilerOptions,
           │  babel/webpack version bump only as far as Vue 3 requires
           ▼
Stage 1  Global APIs & entry point (src/index.js)
           │  Vue.use(...) plugin registrations one at a time; window.fcs/window.Vue
           │  preserved as compatibility shims until nothing reads them anymore
           ▼
Stage 2  Store (Vuex→Vuex4/Pinia) — extract from inline index.js into src/store/*
           │  Small, mutation-only store (no modules) — low migration risk;
           │  do this early because *every* page/component reads it via mapGetters
           ▼
Stage 3  Router (vue-router 3→4)
           │  History-mode API is stable across versions; route table is declarative
           │  and easy to verify with existing route tests
           ▼
Stage 4  Service layer (src/assets/js/*) — introduce the IServices abstraction here
           │  (see "Backend Service Abstraction" below). Services don't touch the
           │  DOM or Vue reactivity directly, so this is framework-agnostic work
           │  that can happen in parallel with Stages 1-3.
           ▼
Stage 5  Leaf/reusable components (input-*.vue, loading.vue, pager.vue, etc.)
           │  No children, few dependents — safe proving ground for Vue 3 patterns
           │  (reactivity, event syntax, slots) before touching the sheet system
           ▼
Stage 6  Character-sheet system (charactersheet.vue → sheet-*.vue → input-*.vue)
           │  HIGHEST RISK — the $parent chain, getVal/setVal, and 12 sheet variants
           │  live here. Migrate with the compat build's $parent/$children/$listeners
           │  flags left ON until this stage is dedicated, then convert deliberately
           │  (see "Component Boundaries" below). Do this only after Stages 1-5 are
           │  stable so you aren't debugging store/router issues at the same time.
           ▼
Stage 7  Page components (src/pages/*.vue) — CharacterDetail, CampaignDetail,
           │  SceneDetail (1104 lines — largest, most fragile, do last within this
           │  stage), etc. These orchestrate everything above, so migrate last.
           ▼
Stage 8  Plugin swaps requiring real replacements
           │  BootstrapVue → bootstrap-vue-next (only 4 files truly need this;
           │  everything else is plain Bootstrap 4 CSS, untouched) OR drop the
           │  4 usages to native Bootstrap 5 markup/vanilla-JS if bootstrap-vue-next
           │  is still pre-1.0 at execution time — verify current status before
           │  committing (MEDIUM confidence, changes over time)
           │  Other Vue-2-only plugins (vue-append, vue-datetime, vue-showdown,
           │  vue-color, vuedraggable, vue-dragscroll, vue-draggable-resizable,
           │  font-picker-vue) — audit each individually; most have Vue-3-compatible
           │  forks or drop-in successors; a few (vue-append, vue-cookies) are thin
           │  enough to replace with a 10-line native utility instead of a dependency
           ▼
Stage 9  jQuery reduction where it blocks Vue 3 (not full removal — out of scope
           to eliminate entirely this milestone; only remove where it fights Vue's
           reactivity or blocks a plugin swap, e.g. App.vue's direct $('.requires-auth')
           class toggling should become Vue-driven v-if/v-show once auth state
           already flows through the store)
           ▼
Stage 10 Turn off compat mode entirely (swap @vue/compat → vue, delete compatConfig)
```

**Why this order and not another:** the store and router are read by nearly every component (`mapGetters` appears throughout), so migrating them first means every later stage is working against a stable, final-shape dependency instead of a moving target. Leaf components are migrated before the sheet system specifically to build confidence with Vue 3's reactivity/event patterns on low-blast-radius code before touching the one subsystem (character sheets) that is both the product's core value and its most fragile, `$parent`-coupled area. The service layer is decoupled from all of this — it has zero Vue-3-specific concerns (no templates, no reactivity, just classes) — so it can be abstracted in parallel with any other stage; putting it early lets Milestone 2 start immediately after this milestone ships instead of waiting.

## Component Boundaries & Data Flow Affected by Vue 3 Reactivity

### The `getVal`/`setVal` shared-object sheet system

**What breaks and what doesn't:**

- Vue 3's reactivity is Proxy-based (`reactive()`), which — unlike Vue 2's `Object.defineProperty` — *does* track new property addition/deletion on plain objects made reactive from creation. This means the entire reason `Vue.set`/`Vue.delete` existed (Vue 2 couldn't detect new keys added after the fact) is largely gone in native Vue 3. However: **`Vue.set` still exists in the `@vue/compat` build** as a deprecated global (gated behind a compat flag) so `CommonService.setVal`'s calls keep working unmodified during the incremental migration — you do not need to touch `getVal`/`setVal` in Stage 0-5. Verify this specific flag's exact deprecation ID against the current Vue migration guide before Stage 6 planning (MEDIUM confidence — flag names can shift between Vue 3 minor versions).
- The real risk is **not** reactivity semantics — it's the **`$parent` traversal chain** itself. `this.$parent` continues to work identically in Vue 3's Options API. The break only happens if/when any layer in the chain (leaf input → sheet → charactersheet) is rewritten using `<script setup>` or the Composition API, where there is no implicit `this` and therefore no implicit `$parent`. **Do not convert any single layer of this chain to Composition API/`<script setup>` without converting the whole chain together and replacing `$parent` calls with an explicit mechanism** (props/emit up the chain, or `provide`/`inject` for `getVal`/`setVal` down the chain — `provide`/`inject` is the natural Vue-3-idiomatic replacement here since `charactersheet.vue` already owns the single `character` object all descendants share).
- Recommendation for this milestone: **leave the `$parent` chain and Options API as-is for the sheet system**. Converting 12 sheet variants + all input components to Composition API is a large, high-risk, low-value change for a like-for-like migration (feature freeze constraint) — defer it to a future incremental-improvement milestone once Vue 3 is stable in production. Only fix what the compat-mode warnings flag as *actually broken*, not everything that could theoretically be modernized.
- The one thing worth fixing now regardless of Vue version: `CommonService.getVal`'s `eval(\`obj.${graphPath}\`)` call is dead-weight (the preceding manual walk already computes the same result) and is a standing security finding. Replace it with a return of the already-computed `root` value. This is a pure bug fix, zero Vue-version risk, and removes one of the four `eval()` call sites flagged in CONCERNS.md while you're already touching this file for the compat-flag audit.

### Character-sheet type registration

`charactersheet.vue`'s `currentCharacterSheet` computed property whitelists 12 sheet IDs and dynamically resolves `<component :is="...">`. This pattern is unaffected by Vue 3 (dynamic components work identically), but CONCERNS.md already flags it as fragile (adding a sheet requires touching multiple places). Not a migration blocker; leave alone, note as a "phase-specific warning" only if a plan touches this file for other reasons.

## Backend Service Abstraction (contained AWS→Firebase swap for Milestone 2)

**Current state:** `DbService`, `UserService`, `SubService` are concrete classes constructed as `new XService(this.$root)` directly in components/pages, calling `aws-sdk` v2 (`AWS.DynamoDB.DocumentClient`, `AWS.CognitoIdentityCredentials`, `AWS.CognitoIdentityServiceProvider`, `AWS.Lambda`) and `amazon-cognito-identity-js` directly. There is no interface boundary — the AWS SDK types leak into every call site (e.g. `dbSvc.GetObject(id, ownerId)` returns a raw DynamoDB `Item`; `userSvc.GetUserAttribute` reads Cognito JWT payload shape directly).

**Recommended abstraction (do in Stage 4, alongside the rest of the service-layer migration — this is framework-agnostic and independent of the Vue 2→3 work):**

1. **Define thin interfaces, not a generic ORM.** Since this is JS (not TS — confirm no TS adoption planned this milestone), use a convention-based abstract base class or JSDoc-typed interface per concern:
   - `IDataService` — `getObject(id, ownerId)`, `saveObject(data)`, `listObjects(type, ownerId, filter, page)`, `listRelatedObjects(relatedTo, publicOnly)`, `deleteObject(ownerId, id)` — mirrors `DbService`'s existing public method shapes almost exactly (rename only for consistency), since the goal is a *contained* future swap, not a redesign now.
   - `IAuthService` — `register`, `login`, `logout`, `refreshSession`, `getUserAttribute`, `setUserAttribute`, `resendConfirmationCode`, `isAuthenticated`.
   - `ISubscriptionService` — `getCustomer`, `createCustomer`, `manageAccount`, `checkout`.
2. **Rename current classes to `AwsDataService`/`CognitoAuthService`/`StripeSubscriptionService` implementing those interfaces**, keep their internals identical (this milestone does not touch AWS SDK version — `aws-sdk` v2→v3 is explicitly deferred per PROJECT.md, since Milestone 2 removes AWS entirely). The point of this milestone is the *seam*, not new backend behavior.
3. **Introduce a single factory/registry** (e.g. `src/assets/js/serviceFactory.js`) that returns the configured implementation, replacing the current `new DbService(this.$root)` call sites throughout components/pages with `serviceFactory.getDataService(this.$root)` (or, better, a small Vue plugin that provides these via `this.$services` — natural since you're already touching plugin registration in Stage 1). This directly resolves the two anti-patterns CONCERNS.md/ARCHITECTURE.md (codebase map) already flagged ("Direct AWS SDK Usage in Components", "Multiple Service Instances") as a side effect of doing the abstraction correctly.
4. **Keep the shape identity-preserving, not aspirational.** Don't invent a richer domain model or repository pattern beyond what's needed to hide "which cloud vendor" — Milestone 2's job is to swap `AwsDataService` for `FirestoreDataService` behind the same `IDataService` contract, and every call site (`this.$services.data.getObject(...)`) stays untouched. Over-engineering the interface now (e.g. adding transaction semantics DynamoDB doesn't have) creates speculative work with no present payoff.
5. **Do not touch Cognito/DynamoDB/Lambda internals themselves.** Per PROJECT.md, this milestone keeps the AWS backend fully intact — the abstraction is purely a call-site indirection, not a functional change. Verify this by running the full existing (thin) test suite plus manual smoke test of login/save/checkout after the refactor — behavior must be byte-for-byte identical.

**Where this abstraction sits relative to the Vue migration:** entirely orthogonal. The service classes have no Vue-3-specific code in them at all (no templates, no reactivity, just plain ES6 classes reading `this.fcs.$store.state...`). This means Stage 4 (service abstraction) can be planned, executed, and shipped in parallel with Stages 1-3 or 5-7 without either blocking the other — it only needs the store (Stage 2) to be in its final shape first, since services read Cognito credentials off `$store.state.credentials`.

## Safe-Shipping Approach

**Existing infrastructure to lean on (already in place, confirmed in `build/`):**

- `webpack.config.dev.js` / `webpack.config.beta.js` / `webpack.config.prod.js` share a common base (`webpack.config.base.js`) and differ only in HMR/Sentry-release/minification settings. **Keep this three-tier split unchanged through the migration** — it's your safety net. Land Vue-3-compat-mode changes behind the same `beta` build first; beta already behaves as a pre-prod staging environment (separate DynamoDB table suffix `_dev`, separate Stripe test key, `BETA`/`LOCAL` environment banner in `CommonService.SetupForEnvironment`).
- **Feature-branch per stage**, each merged to whatever branch feeds `beta` once its own compat-mode warnings are resolved and its own tests are green; run the app in `beta` for a real-world soak (the environment banner already visibly marks it as non-prod, so accidental production use by real subscribers doesn't happen) before promoting to `prod`.
- **Rollback plan per stage:** because each stage is an independently-mergeable, independently-revertible commit range (per the git-safety norms already in place for this project), a bad stage can be reverted via a single revert commit without unwinding unrelated later work — this is only true if stages are kept small and sequential per the dependency order above, which is why that ordering matters operationally and not just conceptually.
- **Regression coverage priority:** CONCERNS.md already flags `dbService`, `userService`, and the VTT (`gameClient`/`gameServer`) as having zero test coverage. Per PROJECT.md's requirement to "expand coverage around migration-risk areas," prioritize adding characterization tests (snapshot the *current* Vue-2 behavior before touching each stage) for: (a) `getVal`/`setVal` behavior across path depths 1-5 before Stage 6, (b) `DbService`/`UserService` happy-path + Cognito-refresh-failure paths before Stage 4's factory refactor, (c) the `$parent` chain's actual reactivity (edit an aspect input, confirm it lands in the saved character object) before and after Stage 6, since that's the one place a silent behavior change would corrupt customer data without any error being thrown.
- **Sentry stays wired throughout.** `@sentry/browser` + `@sentry/webpack-plugin` release tooling in `webpack.config.prod.js` is how you'll detect migration regressions in the wild fastest; don't disable/replace it as part of this milestone even though its own version is flagged as vulnerable in CONCERNS.md — upgrading Sentry's SDK major version is a separate, lower-risk task that can happen anytime and shouldn't be bundled with framework-migration risk.

## Anti-Patterns to Avoid During This Migration

### Migrating the sheet system to Composition API "while you're in there"

**What people do:** since Stage 6 already requires touching every sheet file for compat-mode fixes, it's tempting to also modernize to `<script setup>`/Composition API in the same pass.
**Why it's wrong:** breaks the `$parent` chain (see above), multiplies the diff size and risk in the single highest-blast-radius subsystem, and directly conflicts with the feature-freeze/like-for-like-port constraint in PROJECT.md.
**Do this instead:** fix only what compat-mode warnings flag as broken; leave Options API + `$parent` intact; track Composition-API adoption as a candidate for a future milestone once Vue 3 has been stable in production for a while.

### Upgrading `aws-sdk` v2→v3 opportunistically during the service abstraction

**What people do:** since you're already touching `DbService`/`UserService` call sites to introduce the interface layer, it's tempting to also modernize the AWS client.
**Why it's wrong:** PROJECT.md explicitly defers this as throwaway work — Milestone 2 removes the AWS client stack entirely. Any v2→v3 work done now is deleted in Milestone 2.
**Do this instead:** wrap the existing v2-based classes behind the interface unchanged; only touch `aws-sdk` internals if a specific v2 API is provably incompatible with the new bundler/Vue 3 (unlikely — it's plain JS, not templated).

### Treating BootstrapVue removal as an all-templates rewrite

**What people do:** assume every Bootstrap-4-styled template needs rework because "BootstrapVue is Vue-2-only."
**Why it's wrong:** conflates BootstrapVue's *JS component wrappers* (`b-modal`, `b-dropdown`, etc. — genuinely Vue-2-locked) with plain Bootstrap 4 *CSS utility classes* (`col-sm-6`, `form-group`, `d-flex` — framework-agnostic, used in ~40 files with zero Vue coupling).
**Do this instead:** grep for actual `b-*` component tags first (confirmed here: 4 files) and scope the real replacement work to those; leave the CSS-class-only templates untouched.

## Integration Points

### External Services (unchanged this milestone, verify end-to-end after each stage)

| Service | Integration Pattern | Migration Note |
|---|---|---|
| AWS Cognito | `amazon-cognito-identity-js` + `aws-sdk` v2 `CognitoIdentityCredentials`/`CognitoIdentityServiceProvider`, called from `UserService`, reachable via `this.$root.$store` | No Vue-3-specific risk; risk is only in the service-factory refactor (Stage 4), test login/refresh/logout explicitly |
| DynamoDB | `aws-sdk` v2 `DocumentClient`, called from `DbService` | Same as above; `PagedResults`'s in-memory `PageList`/`CurrentPage` state is a service-instance-level singleton assumption worth re-verifying once services move behind the factory (don't let the factory silently start sharing/reusing instances in a way that breaks per-page-view pagination state) |
| Stripe / `FCSStripe` Lambda | `aws-sdk` v2 `Lambda.invoke`, `Stripe.js` client-side, from `SubService` | No Vue-3-specific risk |
| PeerJS (VTT) | Direct `peerjs` client/server classes, DOM `CustomEvent` dispatch for internal comms | Zero test coverage today (CONCERNS.md) — treat as the highest-uncertainty integration to smoke-test manually after Stages 5-7 touch `SceneDetail.vue`/`scene-zone.vue`/`scene-object.vue` |
| Sentry | `@sentry/browser` + `@sentry/integrations` Vue integration, `@sentry/webpack-plugin` release upload | The `@sentry/integrations` `Vue` integration option is Vue-2-shaped (`attachProps`) — verify its Vue-3-compat replacement (`@sentry/vue` package, which replaced `@sentry/integrations`' Vue plugin) before Stage 1, since this is one of the few *required* third-party API surface changes, not optional |
| Google Tag Manager / iubenda | Static script tags in `index.html`/`App.vue` footer, no Vue coupling | No migration action needed |

### Internal Boundaries

| Boundary | Communication | Notes |
|---|---|---|
| Page ↔ Service layer | Direct instantiation `new XService(this.$root)` today → factory/plugin call post-Stage-4 | See Backend Service Abstraction section |
| `charactersheet.vue` ↔ sheet-*.vue ↔ input-*.vue | `$parent` chain (Options API `this.$parent`), plus `character` object passed as prop from the top | Preserve as-is this milestone (see Component Boundaries section) |
| Components ↔ Vuex store | `mapGetters`/`mapMutations`, `this.$store.state...` direct reads in several places (mixing patterns already, e.g. `fate-accelerated.vue`'s `mounted()` calls `this.$store.commit(...)` directly instead of via a mapped mutation) | Vuex 4 keeps this API shape; if you choose Pinia instead, this is the widest-touching part of the migration since every `mapGetters` call site needs updating — factor that into the Stage 2 estimate |
| GameClient/GameServer ↔ Scene components | DOM `CustomEvent` dispatch/listen (`document.dispatchEvent`) | Already flagged as an anti-pattern in the codebase map; not a Vue-3 blocker, but if Stage 7 touches `SceneDetail.vue` anyway, consider (out-of-band from this migration, only if low-risk) tightening this to component-level `emit`/Vuex actions |

## Sources

- [Vue 3 Migration Build (official)](https://v3-migration.vuejs.org/migration-build) — HIGH confidence, official Vue docs
- [Vue Mastery: Vue 3 Migration Build, Pt. 1](https://www.vuemastery.com/blog/vue-3-migration-build/) — MEDIUM confidence, third-party but Vue-core-adjacent authors
- [BootstrapVueNext Migration Guide](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-guide) — MEDIUM confidence, project's own docs; verify current release maturity (was pre-1.0/alpha as of research date) before committing to it in Stage 8 planning
- [Crisp Engineering: Migrating a large Vue 2 project to Vue 3](https://crisp.chat/en/blog/vuejs-migration/) — MEDIUM confidence, real-world case study corroborating component-by-component/leaf-first sequencing
- Direct source inspection (this repository): `src/index.js`, `src/App.vue`, `src/router/index.js`, `src/components/charactersheet.vue`, `src/sheets/fate-accelerated.vue`, `src/components/input-aspect.vue`, `src/assets/js/commonService.js`, `src/assets/js/dbService.js`, `src/assets/js/userService.js`, `src/assets/js/subService.js`, `build/webpack.config.base.js`, `package.json` — HIGH confidence, ground truth
- `.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONCERNS.md` (existing codebase map) — HIGH confidence, prior verified analysis of this same repo

---
*Architecture research for: Vue 2→3 migration structure (Milestone 1, Fate Character Sheet)*
*Researched: 2026-07-23*
