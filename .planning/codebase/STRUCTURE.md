# Codebase Structure

**Analysis Date:** 2026-07-23

## Directory Layout

```
fcs/
├── build/                  # Webpack build configuration
│   ├── webpack.config.base.js    # Shared webpack config
│   ├── webpack.config.dev.js     # Dev server with HMR
│   ├── webpack.config.beta.js    # Beta build
│   └── webpack.config.prod.js    # Production build + Sentry plugin
├── db/                     # Database utilities (empty/reference)
├── fateof20-extension/     # Roll20 browser extension (separate)
├── node_modules/           # Dependencies
├── src/                    # Main application source
│   ├── index.js            # Vue app entry point, store setup
│   ├── App.vue             # Root component, navbar, footer, router-view
│   ├── assets/             # Global assets and services
│   │   ├── js/             # Business logic services
│   │   │   ├── commonService.js        # Utility functions (notify, UUID, slugify)
│   │   │   ├── dbService.js            # DynamoDB CRUD operations
│   │   │   ├── dbTools.js              # Database helper utilities
│   │   │   ├── userService.js          # Cognito auth, session management
│   │   │   ├── gameClient.js           # PeerJS multiplayer client
│   │   │   ├── gameServer.js           # Multiplayer server logic
│   │   │   ├── peerService.js          # PeerJS connection wrapper
│   │   │   ├── fcsVTTClient.js         # FCS VTT player client
│   │   │   ├── fcsVTT.js               # FCS VTT shared logic
│   │   │   ├── fateof20.js             # Fate of the 20 integration
│   │   │   ├── subService.js           # Subscription/payment handling
│   │   │   └── models.js               # Factory functions for domain objects
│   │   ├── site.scss         # Global styles
│   │   ├── beta/             # Beta environment assets
│   │   └── prod/             # Production environment assets
│   ├── components/         # Reusable Vue components
│   │   ├── charactersheet.vue         # Main character sheet container
│   │   ├── characterprops.vue         # Character properties panel
│   │   ├── diceroller.vue             # Dice rolling modal
│   │   ├── input-aspect.vue           # Aspect input widget
│   │   ├── input-aspect-cthulhu.vue   # Cthulhu-specific aspect input
│   │   ├── input-condition.vue        # Condition input widget
│   │   ├── input-condition-extended.vue
│   │   ├── input-consequence.vue      # Consequence input widget
│   │   ├── input-fatepoints.vue       # Fate points input widget
│   │   ├── input-skill-column.vue     # Skill column input
│   │   ├── input-skill-pyramid.vue    # Skill pyramid layout
│   │   ├── input-stress.vue           # Stress box input
│   │   ├── input-stress-track.vue     # Stress track input
│   │   ├── input-stuntextra.vue       # Stunts/extras textarea
│   │   ├── scene-aspect.vue           # Scene aspect widget
│   │   ├── scene-consequence.vue      # Scene consequence widget
│   │   ├── scene-editable-input.vue   # Editable input for scenes
│   │   ├── cta-subscribe.vue          # Call-to-action for subscriptions
│   │   ├── loading.vue                # Loading spinner
│   │   └── pager.vue                  # Pagination component
│   ├── pages/              # Route-level page components
│   │   ├── Home.vue                   # Landing page
│   │   ├── Login.vue                  # Sign in form
│   │   ├── Register.vue               # Sign up form
│   │   ├── Recover.vue                # Password recovery
│   │   ├── Confirm.vue                # Email confirmation
│   │   ├── Account.vue                # User account / subscription
│   │   ├── ThankYou.vue               # Checkout success page
│   │   ├── CharacterList.vue          # My Characters
│   │   ├── CharacterDetail.vue        # Character sheet editor
│   │   ├── CharacterSheetList.vue     # Character sheet templates
│   │   ├── CharacterSheetDetail.vue   # Template editor
│   │   ├── CampaignList.vue           # My Campaigns
│   │   ├── CampaignDetail.vue         # Campaign detail view
│   │   ├── CampaignSummary.vue        # Campaign summary view
│   │   ├── SceneList.vue              # My Scenes
│   │   ├── SceneDetail.vue            # Scene (VTT multiplayer)
│   │   ├── AdversaryList.vue          # Adversary/NPC list
│   │   ├── AdversaryDetail.vue        # Adversary editor
│   │   ├── Error.vue                  # 404 error page
│   │   └── [other pages].vue
│   ├── router/             # Vue Router configuration
│   │   └── index.js        # Route definitions (19 routes)
│   └── sheets/             # Character sheet templates (system-specific)
│       ├── fate-accelerated.vue       # FAE character sheet
│       ├── fate-accelerated-custom.vue
│       ├── fate-core.vue              # Fate Core character sheet
│       ├── fate-core-custom.vue
│       ├── fate-condensed.vue         # Fate Condensed character sheet
│       ├── fate-freeport.vue          # Freeport setting sheet
│       ├── fate-of-cthulhu.vue        # Cthulhu mythos sheet
│       ├── dresden-files-accelerated.vue
│       ├── star-trek.vue              # Star Trek setting sheet
│       ├── mouse-guard.vue            # Mouse Guard setting sheet
│       ├── middle-earth.vue           # LOTR setting sheet
│       └── fate-anything.vue          # Custom/blank sheet template
├── static/                 # Static assets (not bundled)
│   ├── favicon/            # Favicon variants
│   ├── img/                # Images (logo, roll20, etc.)
│   └── [other static assets]
├── test/                   # Test suite
│   ├── jest.config.js      # Jest test runner configuration
│   ├── CSSStub.js          # Mock CSS imports for tests
│   ├── readme.md           # Test documentation
│   └── unit/
│       ├── components/     # Component tests
│       │   ├── charactersheet.spec.js
│       │   └── sheetinputs.spec.js
│       └── pages/          # Page component tests
│           ├── adversary.spec.js
│           ├── character.spec.js
│           ├── charactersheet.spec.js
│           └── home.spec.js
├── .babelrc                # Babel transpiler config
├── .editorconfig           # Editor config (tabs, line endings)
├── .eslintrc               # ESLint config (if present)
├── .gitignore              # Git ignore patterns
├── .postcssrc.js           # PostCSS config
├── index.html              # HTML entry point
├── package.json            # Dependencies, scripts, metadata
├── package-lock.json       # Locked dependency versions
├── README.md               # Project overview
├── sitemap.xml             # SEO sitemap
└── [config files]
```

## Directory Purposes

**build/:**
- Purpose: Webpack configuration for bundling and deployment
- Contains: Separate configs for dev (HMR), beta, production
- Key files: `webpack.config.base.js` (shared), `webpack.config.prod.js` (Sentry integration)

**src/:**
- Purpose: All application source code
- Contains: Entry point, components, pages, services, sheets, router
- Organized by feature type (components, pages, sheets) not by business domain

**src/assets/js/:**
- Purpose: Business logic services and utilities
- Contains: Service classes (singleton pattern), data factories, external integrations
- Key pattern: Services accept Vue root instance for Vuex store access

**src/components/:**
- Purpose: Reusable Vue components
- Patterns: Input components (input-*.vue) and display components
- Naming: PascalCase filenames (Vue convention), kebab-case in templates

**src/pages/:**
- Purpose: Route-level page components (one per route)
- Pattern: Correspond 1:1 with routes defined in `src/router/index.js`
- Responsibilities: Data fetching, orchestrating child components, handling page-level logic

**src/sheets/:**
- Purpose: Character sheet templates for different RPG systems
- Pattern: Each system has its own .vue file with layout and ruleset-specific logic
- Data format: Normalized to common character object structure (aspects, skills, stress, consequences)

**src/router/:**
- Purpose: Vue Router configuration
- Contains: 19 routes for main app features (characters, campaigns, scenes, auth, etc.)
- Pattern: History mode (HTML5 history API), not hash-based

**static/:**
- Purpose: Static assets not bundled (images, favicons)
- Contents: Logo, favicon variants, Roll20 branding, SVG graphics
- Served directly without webpack processing

**test/:**
- Purpose: Unit tests using Jest + Vue Test Utils
- Pattern: Tests co-located with components/pages (mirror naming)
- Config: `jest.config.js` with vue-jest and babel-jest presets

## Key File Locations

**Entry Points:**
- `src/index.js`: Vue app initialization (store, router, plugins, Sentry)
- `index.html`: HTML entry point with metadata, CDN scripts

**Configuration:**
- `build/webpack.config.*.js`: Bundler configuration (dev/beta/prod)
- `.babelrc`: ES6+ transpilation settings
- `.postcssrc.js`: CSS preprocessing
- `package.json`: Dependencies and build scripts

**Core Logic:**
- `src/assets/js/dbService.js`: DynamoDB operations, data persistence
- `src/assets/js/userService.js`: Cognito authentication, session management
- `src/assets/js/gameClient.js`: PeerJS multiplayer, real-time game state
- `src/assets/js/commonService.js`: Shared utilities (notifications, UUID, slugify)

**Routing & Navigation:**
- `src/router/index.js`: Route definitions
- `src/App.vue`: Root component with navbar and router-view

**UI Layouts:**
- `src/pages/CharacterDetail.vue`: Character sheet editor page
- `src/pages/SceneDetail.vue`: Multiplayer VTT scene
- `src/pages/CampaignDetail.vue`: Campaign management

**Sheet Templates:**
- `src/sheets/fate-accelerated.vue`: FAE ruleset template
- `src/sheets/fate-core.vue`: Fate Core ruleset template
- `src/sheets/middle-earth.vue`: LOTR setting template

## Naming Conventions

**Files:**
- Vue components: `PascalCase` for `.vue` files (e.g., `CharacterDetail.vue`, `inputAspect.vue`)
- JavaScript services: `camelCase` + `Service` suffix (e.g., `dbService.js`, `userService.js`)
- Sheets: `kebab-case` system name (e.g., `fate-accelerated.vue`, `middle-earth.vue`)

**Directories:**
- Feature type grouping: `components/`, `pages/`, `sheets/`, `router/`
- Lowercase plural names (Vue convention)

**Import Aliases (webpack):**
- `@/` → `src/` (configured in jest.config.js)
- `components` → `src/components/`
- `pages` → `src/pages/`
- `assets` → `src/assets/`
- `static` → `static/`

## Where to Add New Code

**New Feature (e.g., New Page):**
1. Create page component: `src/pages/FeatureName.vue`
2. Add route to `src/router/index.js`
3. Create service if needed: `src/assets/js/featureService.js`
4. Create tests: `test/unit/pages/feature.spec.js`

**New Component/Module:**
- Reusable components: `src/components/ComponentName.vue`
- Input widgets: `src/components/input-*.vue` (follow naming pattern)
- Service layer logic: `src/assets/js/moduleName.js`

**Utilities:**
- Shared functions: Add to `src/assets/js/commonService.js` or create new service file
- Global filters/helpers: Register in `src/index.js` via `Vue.filter()` or `Vue.prototype`

**Styling:**
- Global styles: `src/assets/site.scss`
- Component-scoped styles: Use `<style scoped>` in .vue files
- Bootstrap utilities: Available via BootstrapVue (configured in index.js)

**New Sheet Template:**
1. Create `src/sheets/system-name.vue`
2. Follow FAE/Fate Core layout patterns
3. Register in character sheet list

## Special Directories

**build/:**
- Purpose: Webpack build configurations
- Generated: No
- Committed: Yes
- Note: Separate configs for dev (with HMR), beta, production (with Sentry plugin)

**node_modules/:**
- Purpose: NPM dependencies
- Generated: Yes (from package-lock.json)
- Committed: No (.gitignore)
- Note: Large; install via `npm install`

**.planning/:**
- Purpose: GSD project planning and codebase documentation
- Generated: During planning phases
- Committed: Yes
- Contains: ROADMAP.md, phase plans, codebase analysis (ARCHITECTURE.md, STRUCTURE.md, etc.)

**static/:**
- Purpose: Static assets not bundled by webpack
- Generated: No
- Committed: Yes
- Served directly; copied to dist/ on build

---

*Structure analysis: 2026-07-23*
