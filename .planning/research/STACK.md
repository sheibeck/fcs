# Stack Research

**Domain:** Print-faithful character-sheet SPA on Firebase (v2.0 greenfield rebuild of Fate Character Sheet)
**Researched:** 2026-08-31
**Confidence:** HIGH (framework/tooling versions verified against npm/official sources this session); MEDIUM on Cloud Run PDF-service specifics (pattern is well-established but not yet validated against this app's actual sheet markup)

## Recommendation (one line)

**Vue 3.5 + Vite 8, as a static SPA on Firebase Hosting, with VueFire for Firestore/Auth, Pinia for state, Vue Router 5, Tailwind CSS 4 for app chrome + hand-authored CSS Grid/print stylesheets for the sheets themselves, and a small Cloud Run Puppeteer service for one-click PDF export.** No SSR framework (no Nuxt/Next/SvelteKit) — SSR buys nothing here and adds infrastructure a solo maintainer doesn't need.

## Why Vue 3, not React or Svelte

The print-fidelity premise (sheets must look like the paper original) is **framework-agnostic** — it lives entirely in CSS (Grid/Flexbox layout, `@page`/`@media print` rules, exact typography). Vue, React, and Svelte all compile to the same DOM/CSS and are equally capable of pixel-faithful layout. So the framework choice is decided by the *other* three axes in the question, and on all three Vue 3 wins for this project:

1. **Firebase fit:** `vuefire` is built and maintained by the Vue core team itself (`vuejs/vuefire`), with first-class Composition API bindings for Firestore/Auth/Storage (auto-unsubscribe, reactive collections/docs, SSR-safe if ever needed). React's Firebase bindings (`reactfire`) are community-maintained and less actively developed; Svelte has no comparably official binding. Firebase itself is framework-agnostic (`firebase` JS SDK works anywhere), but VueFire measurably reduces boilerplate and is a lower-maintenance choice specifically for Vue.
2. **Solo-maintainer DX:** the maintainer's entire existing mental model — component composition, `.vue` SFCs, reactive character-object binding, the sheet-per-file pattern in `src/sheets/*` — is Vue. A rebuild is the right time to fix Vue-2-era mistakes (Options API global mixins, `Vue.set`, the monolithic Vuex store, jQuery+Bootstrap-Vue), but there is no compounding reason to also change frameworks. Retraining onto React's render model or Svelte's compiler idioms is unrecouped cost for a single maintainer with a fixed backlog (12 sheet types + campaigns/scenes/adversaries + VTT to rebuild) and no team to spread the learning curve across.
3. **Vue 3 is no longer "the risky pick":** Vue 3 has been the default Vue release since 2022, Vue 2 hit EOL in Sept 2024 (confirmed in `.planning/codebase/CONCERNS.md`), and Vue 3.5.x / the upcoming 3.6 (Vapor mode, currently in RC) show active, well-funded core-team investment. Ecosystem tooling (Vite, Pinia, Vue Router, VueFire, `@sentry/vue`, `@vueuse/core`) is mature and stable, not bleeding-edge.

**Why not Next.js / Nuxt / SvelteKit (SSR):** see "SSR vs static SPA" below — none of the SSR wins (SEO, first-paint-with-data) apply to an authenticated, ~1.3k-views/week character-management tool, and SSR would force a Cloud Run/Cloud Functions render tier into an app that today is a pure static bundle. That's strictly more infrastructure for a solo maintainer to own, for no product benefit. If Vue were rejected for some other reason, **SvelteKit** would be the strongest runner-up (excellent DX, smallest output, can be deployed as a static SPA via `adapter-static`) — but there is no reason here to leave Vue.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vue | 3.5.x (3.5.42 current; 3.6 in RC) | UI framework | Mature Vue 3 line; team's existing Vue expertise carries over; huge, stable ecosystem |
| Vite | 8.x (8.2.2 current) | Bundler + dev server | Replaces Webpack 4; near-instant HMR, zero-config Vue SFC support, first-class Firebase/GCP deploy compatibility (plain static `dist/`); the de facto standard Vue 3 build tool |
| Vue Router | 5.x (5.3.0 current — successor line to the "Vue Router 4" era, still targets Vue 3) | Client-side routing | Official router; `history` mode maps directly onto Firebase Hosting's SPA rewrite (`"rewrites":[{"source":"**","destination":"/index.html"}]`) |
| Pinia | 4.x (4.0.3 current) | State management | Official Vuex successor, endorsed by the Vue core team; modular by design (fixes the "monolithic Vuex store" tech debt flagged in `.planning/codebase/CONCERNS.md`) — one store per domain (auth, characters, campaigns, scenes, VTT) instead of one 150-line God store |
| firebase (JS SDK) | 12.x (12.18.0 current) | Auth, Firestore, Hosting, Functions client | Modular/tree-shakeable v9+ API; single SDK replaces `aws-sdk` v2 DynamoDB DocumentClient + `amazon-cognito-identity-js` entirely |
| vuefire | 3.x (3.2.3 current) | Vue↔Firebase bindings | Official Vue-core-team library; reactive Firestore documents/collections and Auth state as Composition API composables (`useDocument`, `useCollection`, `useCurrentUser`) — removes almost all hand-rolled subscription/cleanup code that `dbService.js` currently does by hand |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 4.3.x | Utility CSS for app chrome | Nav, forms, buttons, list/detail pages, auth screens — everything that is *not* a character sheet. Do **not** use Tailwind's utility classes to build the sheet layouts themselves (see below) |
| Sass (dart-sass) | 1.8x (via `sass` npm pkg, Vite-native) | Sheet-specific stylesheets | Each sheet keeps its own hand-authored SCSS (as today), using CSS Grid/Flexbox to reproduce the paper layout exactly, plus a co-located `@media print` block |
| radix-vue (aka `reka-ui`) | current (`reka-ui` is the actively maintained successor package name) | Unstyled, accessible interaction primitives (Dialog, Dropdown, Popover, Tabs, Combobox) | Replaces Bootstrap-Vue's modal/dropdown/tab components without importing a whole opinionated design system that would fight the print-fidelity sheet styling |
| @vueuse/core | 14.x (14.4.0 current) | Composition utilities (debounce, localStorage, event listeners, media query, drag) | Replaces `vue-debounce`, `vue-cookies`, and hand-rolled resize/drag glue |
| vue-draggable-plus | 0.6.x | Drag-and-drop lists | Vue-3-maintained Sortable.js wrapper; replaces `vuedraggable`/`vue-draggable-resizable` (both stalled on Vue 2) |
| interactjs | current 1.10.x | Free-form pan/resize/drag on the VTT scene canvas | Framework-agnostic, already Vue-3-safe as-is; no replacement needed |
| @panzoom/panzoom | current 4.x | Pan/zoom on the VTT scene canvas | Framework-agnostic; no replacement needed |
| vue3-colorpicker | current | Color picker (aspects/tags) | Replaces `vue-color` (Vue-2-only) |
| @vuepic/vue-datepicker | current | Date/time picker | Replaces `vue-datetime` (Vue-2-only, beta, unmaintained) |
| luxon | current 3.x | Date/time logic | Keep — framework-agnostic, still actively maintained; only the *picker component* needs replacing, not the date library |
| vue-sonner or vue3-toastify | current | Toast notifications | Replaces `noty` (last released as a 3.2.0-**beta**, effectively unmaintained) |
| vue-showdown | current (Vue 3-compatible fork) or `markdown-it` + a thin composable | Markdown rendering (campaign/scene descriptions) | If `vue-showdown` lacks a healthy Vue 3 release, prefer `markdown-it` directly with `DOMPurify` sanitization — also closes the XSS gap flagged in `CONCERNS.md` around `v-html` |
| zod | 4.x (4.5.x current) | Runtime schema validation + static types for character/campaign/scene JSON | Every object written to Firestore is validated against a Zod schema before `setDoc`; directly closes the "No Input Validation Framework" gap in `.planning/codebase/CONCERNS.md`. Use `z.infer<>` to derive JSDoc/TS types from the same schema instead of maintaining types twice |
| @sentry/vue | 10.x (10.70.x current) | Error/perf monitoring | Vue-3-native Sentry SDK; direct replacement for `@sentry/browser` + `@sentry/integrations` + `@sentry/tracing` (those are folded into one package now) |
| peerjs | current 1.5.x | P2P WebRTC for VTT | Client library is framework-agnostic and unaffected by the framework choice; only its **server** needs a new home (see "PeerJS signaling" below) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@vitejs/plugin-vue` | Vite ↔ Vue SFC compilation | Replaces `vue-loader` + `babel-loader`; ships with `create-vue` scaffolding |
| Vitest | Unit testing | Vite-native Jest replacement — same `describe/it/expect` API as the existing Jest suite, so `test/unit/**` largely ports with a config swap, not a rewrite. Pairs with `@vue/test-utils` 2.x (Vue-3-compatible; the current `test/unit/components/sheetinputs.spec.js` pattern carries over almost unchanged). Keep Jest only if migration risk to Vitest is judged not worth it for a greenfield rebuild — it isn't; Vitest is the recommended default |
| ESLint (flat config) + `eslint-plugin-vue` (Vue 3 ruleset) | Linting | `.eslintrc` → `eslint.config.js` flat config is required for current ESLint; Vue 3 rule set replaces the Vue 2 one |
| firebase-tools | Firebase CLI (deploy, emulators, extensions) | 15.x (15.28.2 current). Run the Auth/Firestore/Functions/Hosting **emulator suite** locally on Windows — this is the direct replacement for the `*_dev` DynamoDB table split (`yarn dev` today) |
| `firebase deploy --only hosting` / GitHub Actions | Deployment | Replaces the S3/CloudFront sync in `.github/workflows/beta.yml` / `production.yml`; Firebase Hosting + GitHub Actions has an official `firebase-tools` GH Action for preview channels on PRs |

## Print / PDF Export — concrete approach

This is the crux of the whole stack decision, so it gets its own section.

**Two-tier approach, both driven by the *same* CSS:**

1. **Primary, zero-dependency path — browser print.** Build every sheet with a dedicated `@media print` stylesheet (and `@page` rules for margins/size) layered on top of the same CSS Grid used on screen. A "Print" button simply calls `window.print()`. Because the print output *is* the on-screen layout (same DOM, same Grid, print-only overrides for shadows/backgrounds/interactive chrome), this is the highest-fidelity option available — there is no re-rendering step to drift out of sync with the live sheet. Modern Chrome/Edge/Firefox "Save as PDF" print destinations are high quality and this requires no server.
2. **One-click "Download PDF" — server-rendered, for consistency across browsers/OSes.** Browser print output varies slightly by OS font rendering and print-driver quirks. For a reliable, single-click, always-identical PDF (e.g., to email a GM, or for users on mobile where `window.print()` UX is poor), stand up one small **Cloud Run** service running headless Chromium via **Puppeteer**, which loads a dedicated unauthenticated-but-token-gated `/print/:type/:id` route (same Vue app, same print CSS, app-chrome stripped) and calls `page.pdf()`. Use the full `puppeteer` package (bundled Chromium) in a Cloud Run container rather than `puppeteer-core` + `@sparticuz/chromium` — that combination exists to work around AWS Lambda's binary-size limits, which do not apply to Cloud Run's container model, so there's no reason to take on the added fragility (missing-font/missing-lib failures are the most common serverless-Puppeteer complaint, and they're avoided by just installing Chromium's real dependencies in the container). Deploy Cloud Run with `min-instances=1` to avoid Chromium cold-start latency on first request.

**What NOT to use for PDF export:**

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `html2canvas` + `jsPDF` (or the `html2pdf.js` wrapper around them) | Rasterizes the DOM to a bitmap and embeds that image in a PDF — output is not selectable/searchable text, fonts blur/scale incorrectly, and CSS Grid layouts frequently mis-measure during the canvas snapshot. Directly undermines "must look like the printed sheet" | `window.print()` + `@media print` CSS (client), or Puppeteer `page.pdf()` (server) — both render real HTML/CSS, not a screenshot |
| `pdfmake` (or any declarative PDF-layout library) | Requires re-implementing every one of the 12 sheet layouts a second time in a separate layout DSL that doesn't understand CSS Grid — doubles the design work and guarantees visual drift between the on-screen sheet and the exported PDF over time | Reuse the same HTML/CSS via Puppeteer instead of maintaining two parallel layout systems |
| Running Puppeteer inside a Cloud **Function** (Gen 1 or 2) instead of Cloud Run | Cloud Functions' packaging/cold-start characteristics are a poor fit for a large Chromium binary; this is the most commonly reported source of "works locally, times out/crashes in serverless" Puppeteer bugs | A small, dedicated Cloud Run service (own Dockerfile, own scaling settings) |

## Firebase / Stripe integration specifics

- **Auth:** Firebase Auth replaces Cognito directly; `vuefire`'s `useCurrentUser()` composable replaces the hand-rolled Cognito session/refresh logic in `userService.js`.
- **Firestore:** replaces DynamoDB. The old single-table `owner_id`+`id` design was a DynamoDB-specific pattern to minimize table count; Firestore's per-entity-type top-level collections (`characters`, `campaigns`, `scenes`, `adversaries`) with security rules scoping by `ownerId` are the idiomatic equivalent and remove the need for the GSIs the old schema relied on. (Full collection design is an ARCHITECTURE.md concern, not a stack concern — flagged here only because it changes how `dbService.js`'s replacement gets built.)
- **Stripe:** do **not** rebuild the custom `FCSStripe` Lambda. Use the official **"Run Subscriptions with Stripe" Firebase Extension** (`firestore-stripe-payments`, maintained by Invertase under Stripe's transfer agreement). It auto-generates the `createCustomer`, `createCheckoutSession`, `createPortalLink`, and `handleWebhookEvents` Cloud Functions, syncs subscription status straight into Firestore, and sets Firebase Auth custom claims for access control — this eliminates almost all of the custom billing backend code the old app had to hand-write and hand-maintain. Requires the Blaze (pay-as-you-go) plan, which the project needs anyway for Cloud Run/Functions.
- **PeerJS signaling (replaces Heroku):** the `peerjs-server` package runs fine as a small **Cloud Run** service (Cloud Run supports WebSockets natively, with connection timeouts configurable up to 60 minutes). Use `min-instances=1` and session-affinity enabled so a given browser's WebSocket stays pinned to one instance across the life of a game session. This is a Cloud Run, not Cloud Functions, workload for the same reason PDF export is — Cloud Functions doesn't hold long-lived WebSocket connections well.

## Installation

```bash
# Scaffold (Vite's official Vue template)
npm create vite@latest fcs-v2 -- --template vue

# Core
npm install vue@^3.5 vue-router@^5 pinia@^4 firebase@^12 vuefire@^3

# Styling
npm install -D tailwindcss@^4 sass

# Interaction primitives / utilities
npm install reka-ui @vueuse/core vue-draggable-plus vue3-colorpicker @vuepic/vue-datepicker vue-sonner luxon

# VTT
npm install peerjs interactjs @panzoom/panzoom

# Validation & monitoring
npm install zod @sentry/vue

# Dev/test tooling
npm install -D vitest @vue/test-utils@^2 eslint eslint-plugin-vue

# Firebase CLI (global or devDependency)
npm install -D firebase-tools
```

```bash
# Cloud Run PDF service (separate small Node project, its own Dockerfile)
npm install puppeteer express
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Vue 3 + Vite (SPA) | React + Vite/Next.js | If the maintainer already had deep React expertise, or if the app needed a public, SEO-indexed marketing surface — neither applies here. Next's SSR would also force a render-server dependency this app doesn't otherwise need |
| Vue 3 + Vite (SPA) | SvelteKit (as `adapter-static`) | Strongest technical runner-up — smaller bundles, excellent DX — but the maintainer has zero existing Svelte investment while having a large, current Vue mental model; not worth the retraining cost for a solo rebuild on a fixed timeline |
| Firestore | Firebase Realtime Database | RTDB is a better fit for extremely high-frequency ephemeral state (e.g. cursor positions), and *is* worth considering later for VTT live-session state specifically, but Firestore's document model is the better default for characters/campaigns/scenes (structured queries, security rules per document) |
| Cloud Run (PDF + PeerJS signaling) | Cloud Functions (2nd gen) | Fine for short, stateless HTTP calls (e.g. the Stripe extension's webhook handler), but a poor fit for a bundled-Chromium PDF renderer or a long-lived WebSocket signaling server — both want Cloud Run's container + longer-timeout model |
| Puppeteer + Cloud Run for PDF | `window.print()` only, no server tier | Legitimate simplification if the maintainer decides "browser print is good enough" and wants zero extra infra; downgrade path, not a blocker — can be added later without touching the frontend sheet CSS at all |
| Tailwind CSS + hand-authored sheet SCSS | A full component library (PrimeVue, Vuetify 3, Element Plus) for everything including the sheets | A full component library actively works against the print-fidelity goal for the sheets (its component chrome/spacing conventions fight a paper-accurate Grid layout) and adds a large, opinionated dependency for a solo maintainer to keep current. (Note: PrimeVue specifically also announced in 2026 that its GitHub repo is moving to security-fixes-only status as it folds into "PrimeUI" — an added reason to avoid taking a hard dependency on it right now.) Use a full component library only for the app chrome if the maintainer later decides hand-building modals/dropdowns is too slow |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Webpack (any version) | The old app's Webpack 4 config is itself part of the debt being escaped; Webpack 5 would still be slower to configure and run than Vite for a Vue 3 SFC-heavy app | Vite 8 |
| Bootstrap-Vue / Bootstrap-Vue-Next | Bootstrap-Vue is Vue-2-only and effectively dead; the community "Bootstrap-Vue-Next" fork exists but is a small-team, low-velocity project — a risky dependency for a "low-maintenance" mandate | Tailwind CSS (app chrome) + Reka UI/Radix Vue primitives (interactive widgets) |
| jQuery | Bypasses Vue's reactivity by design; was flagged as tech debt in `.planning/codebase/CONCERNS.md` in the old app. A rebuild is the point at which to drop it entirely, not carry it forward | Native DOM APIs via `@vueuse/core`, or plain Vue template bindings |
| `aws-sdk` (v2 or v3), `amazon-cognito-identity-js` | This milestone replaces AWS entirely with Firebase; there is no reason to bring any AWS client library into the new codebase | `firebase` SDK + `vuefire` |
| Vuex | Superseded by Pinia, which the Vue core team now recommends as the default; Vuex is in low-activity maintenance mode | Pinia |
| Options API global mixins for cross-cutting concerns (the old `getVal`/`setVal` `$parent` delegation pattern) | Worked for Vue 2 but fights Vue 3's Composition API and was already flagged as fragile ("Character Sheet Type Registration" in `CONCERNS.md`) | Composable functions (`useCharacterField()` style) built on Zod-validated schemas, injected via `provide`/`inject` where a sheet needs shared character state |
| `eval()` for dynamic property access (3 call sites in the old app per `CONCERNS.md`) | Arbitrary code execution risk if any input reaches it | Optional chaining / a small typed path-accessor utility (`lodash.get`/`lodash.set` or a hand-written equivalent), reinforced by Zod schemas so "dynamic" access is against a known, validated shape |
| `html2canvas`/`jsPDF`/`html2pdf.js` for the primary PDF export path | See "Print/PDF export" section — rasterization undermines print fidelity | `window.print()` + Puppeteer/Cloud Run, both rendering real HTML/CSS |
| Heroku for the PeerJS signaling server | Off the Firebase/GCP platform the milestone is consolidating onto; an unnecessary second vendor for a solo maintainer to manage | `peerjs-server` on Cloud Run |

## Stack Patterns by Variant

**If the maintainer wants stronger static typing than JS+JSDoc:**
- Adopt TypeScript (`<script setup lang="ts">`) throughout, and derive types from the same Zod schemas via `z.infer<typeof CharacterSchema>` rather than hand-writing interfaces twice
- Because Zod schemas are the recommended validation layer regardless (see Supporting Libraries) — TypeScript is additive on top of that decision, not a separate one. Default recommendation is JS + `// @ts-check` + Zod for lower ceremony on a solo, fixed-scope rebuild; upgrade to full TS is a reasonable variant if the maintainer prefers it from day one, since retrofitting TS later is expensive and best avoided by deciding up front

**If browser-only print (no Cloud Run PDF service) proves sufficient after building the sheets:**
- Skip the Cloud Run Puppeteer service entirely for v2.0's initial ship and revisit post-launch based on real user feedback about PDF quality/consistency
- Because it removes a whole extra service (container, Dockerfile, Cloud Run config, cost) from a solo maintainer's ongoing surface area, and the CSS work for `@media print` is required either way (the server path reuses it, it doesn't replace it)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| vue@^3.5 | vite@^8, @vitejs/plugin-vue (matching major), vue-router@^5, pinia@^4, vuefire@^3, @sentry/vue@^10, @vue/test-utils@^2 | All verified as current, actively maintained Vue-3-targeting releases as of this research date |
| firebase@^12 | vuefire@^3 (requires firebase JS SDK >= 9) | VueFire's peer-dependency floor (SDK v9+) is satisfied well within margin by v12 |
| zod@^4 | TypeScript >= 5.5 if using TS `strict` mode | Only relevant if the TypeScript variant is chosen; irrelevant for the default JS+JSDoc path |
| puppeteer (full package) | Cloud Run container base image with Chromium's OS-level dependencies present | Do not swap to `puppeteer-core` + a minimized Chromium build unless a specific Cloud Run cold-start/cost problem justifies it — that trade only pays off in Lambda-style size-constrained environments |

## Sources

- npm registry lookups (web search, current as of 2026-08-31/09-01): `vue`, `vite`, `vue-router`, `pinia`, `firebase`, `vuefire`, `tailwindcss`, `primevue`/`@primevue/core`, `@vueuse/core`, `firebase-tools`, `zod`, `@sentry/vue`, `vuedraggable`/`vue-draggable-plus` — MEDIUM-HIGH confidence (web search aggregation of npm data, not a direct npm registry API call)
- VueFire official docs (`vuefire.vuejs.org`) — Vue-3/Composition-API support, Firebase SDK v9+ requirement — HIGH confidence (official source)
- Firebase Extensions Hub / Invertase `stripe-firebase-extensions` repo — official "Run Subscriptions with Stripe" extension, ownership transfer from Stripe to Invertase — HIGH confidence (official/maintainer source)
- Google Cloud Run docs + community posts on Puppeteer-on-Cloud-Run and WebSocket support (timeouts up to 60 min, native WebSocket support) — MEDIUM-HIGH confidence (official docs + corroborating practitioner writeups)
- MDN `@media print` / `@page` guidance; multiple current CSS-print-stylesheet best-practice writeups — HIGH confidence (MDN is authoritative; corroborated by multiple independent sources)
- `.planning/codebase/STACK.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/INTEGRATIONS.md` (this repo's own codebase map) — used to identify exactly which old dependencies need replacements and which tech-debt items this rebuild should close — HIGH confidence (direct repo analysis)

---
*Stack research for: Print-faithful character-sheet SPA on Firebase*
*Researched: 2026-08-31*
