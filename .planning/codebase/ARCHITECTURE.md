<!-- refreshed: 2026-07-23 -->
# Architecture

**Analysis Date:** 2026-07-23

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    Vue.js Frontend Application                      │
│                         (SPA - Single Page App)                     │
├──────────────────┬──────────────────┬──────────────┬────────────────┤
│   Vue Router     │   Components     │   Sheets     │   Pages        │
│  `router/`       │  `components/`   │ `sheets/`    │  `pages/`      │
└────────┬─────────┴────────┬─────────┴──────┬───────┴────────┬───────┘
         │                  │                │                │
         ▼                  ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Vuex Store                                    │
│            Global State Management (authentication,                  │
│          campaigns, characters, UI state, Cognito config)           │
│                    `index.js` (inlined)                             │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Service Layer                                    │
│  `src/assets/js/` - Business logic & external integrations          │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  DbService   │  UserService │ GameClient   │ CommonService,        │
│  (DynamoDB)  │  (Cognito)   │  (PeerJS)    │ PeerService, others   │
└──────────────┴──────────────┴──────────────┴───────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  External Services                                                   │
├──────────────────────────┬────────────────┬──────────────────────────┤
│  AWS Services            │  Authentication│  Real-time Comms         │
│  ├─ DynamoDB             │  ├─ Cognito    │  ├─ PeerJS (peer2peer) │
│  ├─ Cognito Identity     │  └─ Stripe     │  └─ WebRTC (media)     │
│  └─ Lambda               │                 │                         │
└──────────────────────────┴────────────────┴──────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Vue Router | Client-side routing, navigation between pages | `src/router/index.js` |
| Vuex Store | Global state (auth, campaigns, characters, UI config) | `src/index.js` (lines 102-241) |
| Page Components | Top-level route handlers, coordinate page logic | `src/pages/*.vue` |
| Sheet Components | Character sheet templates for different RPG systems | `src/sheets/*.vue` |
| Input Components | Reusable form inputs (aspects, skills, stress, etc.) | `src/components/input-*.vue` |
| DbService | DynamoDB CRUD operations, data persistence | `src/assets/js/dbService.js` |
| UserService | Cognito authentication, session management | `src/assets/js/userService.js` |
| GameClient | PeerJS multiplayer/VTT client, media streaming | `src/assets/js/gameClient.js` |
| CommonService | Utility functions (notifications, UUID generation, slugifying) | `src/assets/js/commonService.js` |
| PeerService | PeerJS connection management | `src/assets/js/peerService.js` |
| Models | Factory functions for domain objects (messages, scenes) | `src/assets/js/models.js` |

## Pattern Overview

**Overall:** Model-View-ViewModel (MVVM) via Vue 2 + Vuex centralized state

**Key Characteristics:**
- Single-page application (SPA) with client-side routing
- Reactive data binding through Vue 2's reactivity system
- Centralized state via Vuex store (single source of truth)
- Service layer abstraction for business logic
- Component composition for reusable UI pieces
- No separate backend API layer — direct AWS SDK calls from frontend

## Layers

**Presentation Layer (Vue Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/pages/`, `src/components/`, `src/sheets/`, `src/App.vue`
- Contains: Vue single-file components (.vue files)
- Depends on: Vuex store, service layer
- Used by: Vue Router, component hierarchy

**Routing Layer:**
- Purpose: Map URLs to page components and manage navigation
- Location: `src/router/index.js`
- Contains: Route definitions, lazy-loading setup
- Depends on: Vue Router
- Used by: App.vue, page components

**State Management Layer:**
- Purpose: Hold global state (authentication, data, UI preferences)
- Location: `src/index.js` (lines 102-241)
- Contains: Vuex store with state, mutations, getters
- Depends on: None
- Used by: All components via mapGetters/mapMutations

**Service Layer:**
- Purpose: Encapsulate business logic and external integrations
- Location: `src/assets/js/` (dbService.js, userService.js, etc.)
- Contains: Service classes (singleton-like usage)
- Depends on: AWS SDK, Cognito, PeerJS, external libraries
- Used by: Page components, components, App.vue

**Integration Layer:**
- Purpose: Interface with external systems
- Location: AWS SDK calls in services, Sentry in index.js
- Contains: API client initialization, credential management
- Depends on: AWS, Cognito, PeerJS, Sentry SDKs
- Used by: Service layer

## Data Flow

### Primary Request Path (View Character)

1. **Route Entry** (`src/router/index.js:38`)
   - User navigates to `/character/:sheetname/:id/:name?`
   - Router loads `CharacterDetail` component

2. **Page Initialization** (`src/pages/CharacterDetail.vue:79-86`)
   - Component mounted, `init()` called
   - Create CommonService and DbService instances
   - Parse route parameters (sheetname, id)

3. **Data Fetch** (`src/pages/CharacterDetail.vue:91-96`)
   - Call `dbSvc.GetObject(characterId, ownerId?)`
   - DbService gets Cognito credentials from Vuex store
   - Creates DynamoDB DocumentClient
   - Queries FateCharacterSheet table by owner_id and id
   - Returns character data object

4. **Data Binding** (`src/pages/CharacterDetail.vue:3-4`)
   - Character data passed to `charactersheet` component as prop
   - Vue reactively renders character properties
   - User edits form inputs

5. **Save Operation** (`src/pages/CharacterDetail.vue:97-118`)
   - User clicks Save button, triggers `save()` method
   - Validate character data (e.g., name required)
   - Enrich object: set owner_id, related_id (sheet type), slug, search_data
   - Call `dbSvc.SaveObject(characterData)`
   - DynamoDB putItem with auto-generated timestamp
   - Show success notification via CommonService

### Secondary Flow: Authentication

1. **Login Page** (`src/pages/Login.vue`)
   - User submits email/password
   - UserService calls `CognitoUserPool.authenticateUser()`

2. **Credentials Creation** (`src/assets/js/userService.js:38-88`)
   - Cognito returns ID token and refresh token
   - Create AWS.CognitoIdentityCredentials with identity pool
   - Commit credentials to Vuex store

3. **Authorization** (`src/assets/js/userService.js:100+`)
   - Subsequent DbService calls use stored credentials
   - Credentials auto-refresh if expired (RefreshUserSession)
   - All DynamoDB operations scoped to authenticated user

### Multiplayer/VTT Flow (Scene Detail)

1. **Scene Connection** (`src/pages/SceneDetail.vue`)
   - User joins a collaborative scene
   - GameClient initializes with scene ID and player ID

2. **PeerJS Setup** (`src/assets/js/gameClient.js:30-84`)
   - Create PeerJS peer with own ID
   - Listen for peer connections and media calls
   - Optionally stream audio/video

3. **Game Messages** (`src/assets/js/models.js:6-59`)
   - Players send game events (dice rolls, aspect invokes, stress)
   - Messages formatted via Models factory methods
   - Transmitted via PeerJS data connections

4. **Custom Events** (`src/assets/js/gameClient.js:73-74`)
   - GameClient dispatches CustomEvents to DOM
   - Components listen and update UI

**State Management:**
- Global app state lives in Vuex store (centralized)
- Component local state for UI-only concerns (edit mode, collapsed sections)
- Service instances are singletons, stateless (services read from Vuex)
- Credentials stored in Vuex, used by all services

## Key Abstractions

**Character Sheet Templates:**
- Purpose: Represent character data structure for different RPG systems
- Examples: `src/sheets/fate-accelerated.vue`, `src/sheets/fate-core.vue`, `src/sheets/middle-earth.vue`
- Pattern: Each sheet file defines a Vue component with system-specific layout and rules
- Data is normalized to a character object with skill data, aspects, stress, consequences, etc.

**Service Layer (Singleton Pattern):**
- Purpose: Encapsulate external dependencies and business logic
- Examples: `DbService`, `UserService`, `GameClient`, `CommonService`
- Pattern: Instantiated once per use, accept `fcs` (Vue root) as constructor parameter for Vuex access
- Benefit: Testable, reusable, decouples UI from infrastructure

**Input Components:**
- Purpose: Reusable form widgets for character properties
- Examples: `src/components/input-aspect.vue`, `src/components/input-stress.vue`
- Pattern: Accept value via prop, emit change events, delegate to parent for persistence

**Models (Data Factory):**
- Purpose: Create domain objects with consistent structure
- Examples: `MsgDiceRoll()`, `SceneAspect()`, `SceneStress()`
- Pattern: Static methods returning objects with required fields and unique IDs

## Entry Points

**Web Application:**
- Location: `src/index.js` (lines 263-269)
- Triggers: Page load
- Responsibilities: Initialize Vue app, Vuex store, Vue Router, plugins (BootstrapVue, Sentry)

**Router:**
- Location: `src/router/index.js`
- Triggers: User navigation or direct URL access
- Responsibilities: Match route patterns, load page components, pass params

**Page Components:**
- Location: `src/pages/*.vue`
- Triggers: Router directs to route
- Responsibilities: Fetch data, orchestrate child components, handle user actions

**Service Initialization:**
- Pattern: Services instantiated ad-hoc in components
- Example: `let dbSvc = new DbService(this.$root)` in CharacterDetail.vue:81
- No global service container; Vue root instance passed for Vuex access

## Architectural Constraints

- **Routing:** Vue Router in history mode (HTML5 history API), not hash-based
- **Global state:** Centralized in single Vuex store (multiple modules not used)
- **Authentication:** AWS Cognito credentials stored in Vuex, refreshed on demand
- **Database:** DynamoDB queries from frontend; no backend API; table scoped by owner_id
- **Real-time comms:** PeerJS peer-to-peer; not centralized server
- **Singletons:** Service instances created per-use; no global service registry
- **Module scoping:** Path aliases used (assets, pages, components) but no module boundaries enforced

## Anti-Patterns

### Direct AWS SDK Usage in Components

**What happens:** Components instantiate DbService and call DynamoDB directly from UI
**Why it's wrong:** Exposes infrastructure details to presentation layer; hard to test; credentials exposed to frontend
**Do this instead:** Create a dedicated API service layer (backend) to mediate DB access, or establish a plugin-based service registry for dependency injection in `src/assets/js/`

### Multiple Service Instances

**What happens:** Each component creates new DbService, UserService, etc. via `new DbService(this.$root)`
**Why it's wrong:** No shared state across instances; difficult to mock for testing; increases memory usage
**Do this instead:** Create a service factory or container (e.g., in `src/assets/js/serviceContainer.js`) and register services as Vue plugins or in Vuex modules

### Custom Events for Internal Communication

**What happens:** GameClient dispatches DOM CustomEvents ('userdisconnected', 'clienterror') for component communication
**Why it's wrong:** Unreliable; no type safety; hard to trace; pollutes global event bus
**Do this instead:** Use Vuex actions/mutations or EventEmitter; emit on GameClient instance directly to listening components

### Inline Vuex Store in index.js

**What happens:** Entire Vuex store (state, mutations, getters) defined inline in `src/index.js:102-241`
**Why it's wrong:** Store grows unbounded; no module separation; difficult to split by feature
**Do this instead:** Extract store into `src/store/index.js` with modules (e.g., `src/store/auth.js`, `src/store/characters.js`)

## Error Handling

**Strategy:** Notifications to user via `CommonService.Notify()`

**Patterns:**
- Service methods catch exceptions and call `commonSvc.Notify(err.code, 'error')`
- DbService retries pagination queries on failure
- UserService Cognito callbacks split into `onSuccess` and `onFailure`
- Sentry integration configured for runtime error tracking (index.js:31-82)
- Page components check for null/undefined data and show fallback UI

## Cross-Cutting Concerns

**Logging:** Sentry browser SDK initialized in `src/index.js:31-82`; captures errors and frontend exceptions

**Validation:** Page components validate before save (e.g., CharacterDetail:101-104 checks name is not empty)

**Authentication:** UserService handles Cognito login/logout; DbService auto-refreshes credentials if expired

**Notifications:** CommonService.Notify() used globally; wraps Noty library for toast messages

---

*Architecture analysis: 2026-07-23*
