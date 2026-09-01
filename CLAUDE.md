# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Fate Character Sheet (`fatecharactersheet`) is a **Vue 2** single-page app for creating and managing characters, campaigns, scenes, and adversaries for Fate-based tabletop RPGs. It is a pure client-side app — there is no backend server in this repo. It talks directly to **AWS DynamoDB** (via the AWS SDK in the browser) and authenticates against **AWS Cognito**. It also has a peer-to-peer virtual tabletop (VTT) built on **PeerJS**.

## Commands

```bash
yarn dev              # webpack-dev-server on http://localhost:8080 (hot reload, uses *_dev DynamoDB table)
yarn beta             # build the beta bundle
yarn prod             # build the production bundle (uploads sourcemaps to Sentry; needs SENTRY_AUTH_TOKEN)
yarn lint             # eslint over src (.js, .vue)
yarn lint:fix         # eslint --fix
yarn test             # run Jest unit tests
yarn test:unit        # same as `yarn test`
yarn test:debug       # run Jest with node --inspect (single-threaded)
```

Run a single test file or test:

```bash
yarn jest test/unit/components/sheetinputs.spec.js       # one file
yarn jest -t "SkillPyramid should properly render"       # by test name
```

`npm`/`yarn` are interchangeable; the `.gitpod.yml` uses `npm install` + `npm run dev`.

## Environment / build behavior

- `process.env.NODE_ENV` drives which DynamoDB table is used. Anything other than `"production"` appends `_dev` to the table name (`FateCharacterSheet` vs `FateCharacterSheet_dev`) — see `src/assets/js/dbService.js`. So `yarn dev` reads/writes the dev table.
- Webpack config lives in `build/` (`webpack.config.base.js` + per-env merges). Path aliases are defined there: `assets`, `pages`, `components`, `static`, and `vue` → `vue/dist/vue.js` (runtime + compiler build, because sheets use string templates). Jest maps `@/` → `src/` separately (see `jest` block in `package.json`).
- `jQuery`/`$` are provided globally via webpack `ProvidePlugin` and are used pervasively alongside Vue. `AWS`, `fcs` (the root Vue instance), and `Vue` are attached to `window`.
- Production build drops all `console.*` calls (`drop_console`) and reports errors to **Sentry**.

## Architecture

### Entry point and global state
`src/index.js` bootstraps the root Vue instance as `window.fcs`, wires the router, and creates the single **Vuex store**. There is one global store (no modules) holding auth state (`isAuthenticated`, `credentials`, `cognito`, `userId`), the entity lists (`sessions`/`campaigns` with `filtered*` mirrors for search), subscription flags, and VTT enablement getters (`vttEnabled` returns `"fcsVtt"`, `"roll20"`, or `false`). Note the store is defined inline in `index.js`, not in a separate module.

### Service layer (`src/assets/js/`)
Business logic lives in plain ES6 classes instantiated with the root Vue instance (`new SomeService(this.$root)` or `new SomeService(fcs)`) so they can reach `$store`. Key services:
- **`commonService.js`** — cross-cutting utilities: `Notify` (Noty toasts), `getVal`/`setVal` (safe nested-path get/set on character objects, the backbone of the sheet system), UUID generation, environment setup, version checks.
- **`dbService.js`** — all DynamoDB access. Single-table design; every entity is a row keyed by `owner_id` (partition) + `id` (sort), discriminated by `object_type`. Reads refresh the Cognito session first (`RefreshUserSession`). Writes always use `put` (never `update`) because a character's shape varies by sheet type. Empty attributes are stripped before save (DynamoDB rejects empty strings).
- **`userService.js`** — Cognito auth (login, register, confirm, recover, session refresh, credentials).
- **`subService.js`** — subscription/billing status.
- **`models.js`** — factory functions for entity/message shapes (scene objects, VTT messages like `MsgDiceRoll`/`MsgInvoke`).
- **VTT (peer-to-peer play):** `peerService.js` (PeerJS connection), `gameServer.js` / `gameClient.js` (GM hosts a server, players connect as clients), `fcsVTT.js` / `fcsVTTClient.js` (the in-app VTT), and `fateof20.js` (integration with the external Roll20 "Fate of 20" browser extension, source under `fateof20-extension/`). Communication is via `CustomEvent`s dispatched on `document` (e.g. `'gameserver'`).

### DynamoDB data model
`db/FateCharacterSheet-DynamoDb-Model` is the exported table schema (single table, GSIs: `type` by `object_type`, `relations` by `related_id`, `item` by `id`). Use it as the reference for entity fields and access patterns. `GetObject` queries the `item` GSI when the owner is unknown.

### Routing and pages
`src/router/index.js` uses `vue-router` in `history` mode. `src/pages/*.vue` are the routed views (Character/Campaign/Scene/Adversary list+detail, auth pages, Account, Home). Pages compose components and call the services.

### The character-sheet system (the core feature)
- `src/components/charactersheet.vue` is the **parent wrapper**. It registers every sheet type as a child component and picks the right one via the `currentCharacterSheet` computed property, which validates the sheet id against a hardcoded whitelist (redirects to `/404` if invalid).
- `src/sheets/*.vue` are the individual game-system sheets (`fate-core`, `fate-accelerated`, `fate-condensed`, `middle-earth`, `star-trek`, `fate-of-cthulhu`, `mouse-guard`, etc.). Each is a template over a `character` object.
- Sheets read/write character data through the parent's `getVal`/`setVal` (called as `$parent.getVal(...)` / via `setVal('field', value)`), which delegate to `commonService`. Logos come from `$parent.GetSheetImage()` → `/static/sheets/<sheet-id>/logo.png`. **When adding a sheet type, register it in `charactersheet.vue` (both the `components` map and the `validSheets` whitelist) and add its assets under `static/sheets/`.**
- `src/components/input-*.vue` and `scene-*.vue` are reusable sheet widgets (skill pyramids, aspects, stress tracks, consequences, fate points, scene objects). VTT interactivity flows through `charactersheet.vue`'s `parseVTTMessage`/`formatVTTMessage`/`sendToVTT`.

## Testing
Jest + `@vue/test-utils` (`mount`), with `vue-jest` for `.vue` and `jest-serializer-vue` for snapshots. Tests live in `test/unit/{components,pages}`. Tests build their own local Vuex store with mocked getters (`isAuthenticated`, `userId`, `vttEnabled`, `vueShowdownOpts`) and mock `$route` — follow the pattern in `test/unit/components/sheetinputs.spec.js` when adding sheet/component tests.

## Deployment (CI/CD)
GitHub Actions (`.github/workflows/`) deploy the built bundle to S3 (Node 12.x):
- **`beta.yml`** — triggers automatically on **push to `develop`**: runs `npm run beta` and syncs `dist/` to the beta S3 bucket. Note it does **not** run `yarn lint` or `yarn test` first, so a green push does not mean tests passed — run them locally before pushing.
- **`production.yml`** — **manual** `workflow_dispatch` only (takes a release tagname input): runs `npm run prod` and deploys to the production bucket.
Both need repo secrets (`SENTRY_AUTH_TOKEN`, `AWS_*`, S3 bucket names).
