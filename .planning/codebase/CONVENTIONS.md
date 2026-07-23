# Coding Conventions

**Analysis Date:** 2026-07-23

## Naming Patterns

**Files:**
- Vue components: `kebab-case.vue` (e.g., `input-aspect.vue`, `character-sheet.vue`)
- JavaScript services: `PascalCaseService.js` (e.g., `CommonService.js`, `DbService.js`)
- Pages: `PascalCase.vue` (e.g., `Home.vue`, `CharacterDetail.vue`)

**Vue Components:**
- Component names in script: PascalCase (e.g., `export default { name: 'InputAspect' }`)
- Props: camelCase (e.g., `customlabel`, `editlock`, `removable`)
- Methods: camelCase (e.g., `removeAspect()`, `sendToVTT()`)
- Computed properties: camelCase (e.g., `getPlaceHolder`, `getLabelValue`)
- Event emitters: kebab-case (e.g., `@remove-aspect`)

**Functions & Methods:**
- Regular functions: camelCase
- Arrow functions used for class methods: `methodName = (params) => { ... }`
- PascalCase for class constructors

**Variables:**
- camelCase for local variables and properties
- UPPER_SNAKE_CASE for constants (e.g., `TableName`)
- camelCase for object properties

**Types/Classes:**
- PascalCase for class names (e.g., `class CommonService`)
- PascalCase for Vue component class definitions

## Code Style

**Formatting:**
- Editor Config: 2-space indentation (`.editorconfig`)
- UTF-8 charset
- LF line endings
- Insert final newline
- Trim trailing whitespace

**Linting:**
- ESLint available but disabled in webpack config (`build/webpack.config.base.js` has commented-out eslint-loader)
- Run linting manually with: `yarn lint` or `yarn lint:fix`
- ESLint extends: `.eslintrc` configuration (if present) or default

## Import Organization

**Order:**
1. External packages/dependencies (Vue, Vuex, third-party libraries)
2. Local components and pages (using `@/` alias)
3. Local services (`.js` files in `assets/js/`)
4. Styles (`.scss` files)

**Path Aliases:**
- `@/` → `src/`
- `assets` → `src/assets`
- `pages` → `src/pages`
- `components` → `src/components`
- `static` → `static/`

**Example imports:**
```javascript
import CommonService from "./assets/js/commonService"
import UserService from "./assets/js/userService"
import { mapGetters } from "vuex"
import CharacterSheet from '@/components/charactersheet.vue'
```

## Error Handling

**Patterns:**
- Promises: `.catch((err) => { ... })` for promise rejections
- Try/catch blocks for synchronous operations
- User notifications via `CommonService.Notify(message, type, timeout, callback)`
  - Types: 'error', 'info', 'success'
  - Default timeout: 2000ms for errors, 1000ms for others
- Sentry integration in `src/index.js` for error tracking and reporting
- Common approach: catch errors and notify user, optionally log to Sentry

**Example pattern:**
```javascript
try {
  // operation
} catch(ex) {
  this.commonSvc.Notify(ex, 'error');
}
```

**Promise pattern:**
```javascript
return await docClient.get(params).promise()
  .then((data) => {
    return data.Item;
  }).catch(function(err) {
    this.commonSvc.Notify(err.code, 'error');
  });
```

## Logging

**Framework:** `console.*` for development logging, Sentry for production errors

**Patterns:**
- `console.log()` for informational logging (e.g., debugging values)
- `console.error()` for error logging (e.g., caught exceptions)
- Sentry integration captures unhandled errors automatically
- Debug logging often includes stringified JSON: `JSON.stringify(data, null, 2)`

**Example:**
```javascript
console.log(text);
console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
```

## Comments

**When to Comment:**
- TODO comments for incomplete features (e.g., `//TODO: allow adding labels to aspects when adding NPCs`)
- Inline comments for complex logic or non-obvious implementations
- Comments for workarounds or known issues

**JSDoc/TSDoc:**
- Not consistently used in this codebase
- When needed, add JSDoc comments for service classes and public methods

## Function Design

**Size:** Functions range from 20-400+ lines; services like `gameClient.js` and `dbService.js` are large

**Parameters:**
- Services use constructor injection pattern
- Vue components receive props and parent component references via `this.$parent`
- Async methods are common, especially for database operations

**Return Values:**
- Promise-based returns for async operations (e.g., `async GetObject()` returns `Promise`)
- Void returns for mutations and side-effect operations (e.g., `Notify()`)
- Direct object/data returns for synchronous operations

## Module Design

**Exports:**
- Default exports: `export default class ServiceName { ... }`
- CommonJS for some modules in test environment
- ES6 module syntax throughout codebase

**Barrel Files:**
- Not used consistently; imports reference individual files

**Service Pattern:**
Services are instantiated and passed around (often via constructor):
```javascript
let userSvc = new UserService(this.$root);
let commonSvc = new CommonService(this.$root);
```

Services often reference parent Vue instance to access store or other services.

## State Management

**Vuex:**
- State defined in `src/index.js` in store configuration
- Mutations use camelCase: `authenticate()`, `userInfo()`, `credentials()`
- Getters use camelCase: `isAuthenticated`, `userId`, `vttEnabled`
- Components access state via `this.$store.state.propertyName`
- Computed properties use `mapGetters` from Vuex for reactive access

**Example:**
```javascript
computed: {
  ...mapGetters([
    'isAuthenticated',
    'vttEnabled'
  ]),
  HasSubscription() {
    return this.$store.state.hasActiveSubscription;
  }
}
```

## Vue Component Structure

Standard Vue Single File Component order:
1. `<template>` - HTML structure
2. `<script>` - JavaScript logic with:
   - `name` property
   - `components` object
   - `props` object
   - `computed` properties (with mapGetters)
   - `data()` function
   - `methods` object
3. `<style scoped>` - Component-scoped styles (SCSS)

---

*Convention analysis: 2026-07-23*
