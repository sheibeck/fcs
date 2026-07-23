# Testing Patterns

**Analysis Date:** 2026-07-23

## Test Framework

**Runner:**
- Jest v25.5.4
- Config: `package.json` (root-level jest configuration)

**Transformers:**
- `babel-jest` v25.5.1 for `.js` files
- `vue-jest` v3.0.7 for `.vue` files

**Assertion Library:**
- Jest built-in matchers (`.toBe()`, `.toContain()`, `.exists()`)

**Supporting Libraries:**
- `@vue/test-utils` v1.1.0 - Vue component testing utilities
- `jest-serializer-vue` v2.0.2 - Snapshot serialization for Vue components
- `vuex` v3.5.1 - State management in tests
- `vue-showdown` - Markdown rendering in tests

**Run Commands:**
```bash
yarn test              # Run all tests (Jest)
yarn test:unit         # Run unit tests (alias for test)
yarn test:debug        # Debug mode: node --inspect with --runInBand
```

## Test File Organization

**Location:**
- Co-located in `test/unit/` directory (separate from source)
- Mirrored structure: `test/unit/components/` mirrors `src/components/`
- Mirrored structure: `test/unit/pages/` mirrors `src/pages/`

**Naming:**
- Files: `.spec.js` suffix (e.g., `sheetinputs.spec.js`, `character.spec.js`)

**File Structure:**
```
test/
├── unit/
│   ├── components/
│   │   ├── charactersheet.spec.js
│   │   ├── sheetinputs.spec.js
│   │   └── ...
│   ├── pages/
│   │   ├── adversary.spec.js
│   │   ├── character.spec.js
│   │   └── ...
│   ├── CSSStub.js       # CSS module stub for import mocking
│   └── readme.md
```

## Test Structure

**Suite Organization:**
```javascript
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Component Name', () => {
  let wrapper
  let getters, mutations
  let store

  beforeEach(() => {
    // Setup store, getters, mutations
    store = new Vuex.Store({ getters, mutations })
  })

  it('should render correctly', async () => {
    wrapper = mount(Component, { store, localVue, ... })
    expect(wrapper.exists()).toBe(true)
  })

  test.each(testData)(
    'should handle cases %o',
    async (input, expected) => {
      // Test logic
    }
  )
})
```

**Patterns:**
- Setup in `beforeEach()`: Creates fresh Vuex store and mocks for each test
- Mount approach: Uses `mount()` for full DOM rendering or `shallowMount()` for shallow testing
- Wrapper: Component wrapper returned by `mount()` used to query and interact with component

## Mocking

**Framework:** Vue Test Utils and Jest built-in mocking

**Patterns:**

1. **Store Mocking:**
```javascript
const localVue = createLocalVue();
localVue.use(Vuex);

getters = {
  isAuthenticated: () => true,
  userId: () => null,      
  vttEnabled: () => false,
  vueShowdownOpts: () => {}, 
}
mutations = {
  updatePageTitle (state, value) {
    state.pageTitle = value
  }
}
store = new Vuex.Store({ getters, mutations })
```

2. **Route Mocking:**
```javascript
let $route = {   
  path: '/character/sheet-name/characterid/character-name',
  params: { id: 'characterid', name: 'character-name' }
}

wrapper = mount(Component, {
  store,
  localVue,
  mocks: { $route }
})
```

3. **Component Setup with Props:**
```javascript
wrapper = mount(Component, {
  store,
  localVue,
  propsData: {
    character: {
      name: 'bob',
      skills: { superb: { s1: "Fight" } }
    }
  }
})
```

4. **Cookie/Document Mocking:**
Custom objects created for cookie mocking in tests:
```javascript
const fakeDocumentCookie = {
  cookies: '',
  get cookie() { return this.cookies; },
  set cookie(value) { /* implementation */ }
}
```

**What to Mock:**
- Vuex store (always)
- Vue Router ($route object)
- External service dependencies
- DOM methods when needed

**What NOT to Mock:**
- Vue component logic (test the actual implementation)
- Built-in browser APIs unless necessary for isolation

## Fixtures and Factories

**Test Data:**
Test data embedded directly in test files, often as arrays for `test.each()`:
```javascript
const skillColumnTestData = [
  [{
    label1:"A custom Skill",
    skill1:"1"            
  }, true, "A custom Skill", "1", SheetFateCondensed, 0],
  // ... more test cases
]
```

**Location:**
- Defined inline in `.spec.js` files above test suites
- No separate fixtures directory or factory pattern

## Coverage

**Requirements:** Not enforced (no Jest coverage config)

**View Coverage:**
```bash
yarn test -- --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual Vue components (charactersheet.spec.js, sheetinputs.spec.js)
- Approach: Mount component with mocked Vuex store and props, verify rendered output and behavior
- Example: `describe('skill components', () => { ... })`

**Component Tests:**
- Scope: Component-to-component interaction (e.g., parent mounts child component)
- Approach: Mount parent, find child component with `findComponent()` or `findAllComponents()`, verify child exists and renders correctly
- Example: `const comInput = wrapper.findComponent(InputSkillPyramid); expect(comInput.exists()).toBe(true)`

**Page Tests:**
- Scope: Full page components (Home.vue, CharacterDetail.vue, AdversaryList.vue)
- Approach: Mount page with complete store and mocks, verify page structure and component integration
- Example: `test/unit/pages/character.spec.js` mounts CharacterDetail page

**Integration Tests:**
- Not separate from unit tests; integration happens within component mount tests
- Component tests interact with store, props, and child components

**E2E Tests:**
- Not used in this project

## Common Patterns

**Async Testing:**
```javascript
it('should render correctly', async () => { 
  wrapper = mount(Component, { ... })
  await wrapper.setData({ propertyName: value })
  expect(wrapper.text()).toContain('Expected text')
})
```

**Async Operations with Promises:**
```javascript
it('should handle async operations', async () => {
  let $route = { path: '/character', params: { id: 'fate-core' } }
  wrapper = mount(Component, { mocks: { $route } })
  // Component makes async calls, wait for them
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.element').exists()).toBe(true)
})
```

**Parameterized Tests:**
```javascript
test.each(testDataArray)(
  'should handle case %o',
  async (input, expectedValue, Component, index) => {
    wrapper = mount(Component, { store, localVue, propsData: { character: input } })
    const element = wrapper.findAllComponents(InputComponent).at(index)
    expect(element.exists()).toBe(true)
    expect(element.find('input').element.value).toBe(expectedValue)
  }
)
```

**DOM Interaction:**
```javascript
// Find elements
const input = wrapper.find('input.form-control')
const inputs = wrapper.findAll('input')
const component = wrapper.findComponent(ChildComponent)

// Check existence
expect(input.exists()).toBe(true)

// Read/verify values
expect(input.element.value).toBe('expected')
expect(wrapper.text()).toContain('Expected Text')
expect(label.element.innerHTML).toBe('Label Text')
```

**Setting Component State:**
```javascript
await wrapper.setData({ isEditLocked: false })
await wrapper.setProps({ customLabel: true })
```

## Module Resolution

**Configuration:**
```javascript
// jest config in package.json
"moduleNameMapper": {
  "^@/(.*)$": "<rootDir>/src/$1",
  "^.+\\.(css|less)$": "<rootDir>/test/CSSStub.js"
},
"snapshotSerializers": [
  "<rootDir>/node_modules/jest-serializer-vue"
]
```

**CSS Handling:**
CSS imports in components are stubbed via `test/CSSStub.js` to prevent errors in tests.

## LocalVue Pattern

Each test creates an isolated Vue instance:
```javascript
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueShowdown);

// Use localVue in mount options to avoid polluting global Vue
wrapper = mount(Component, { localVue, store, ... })
```

This prevents plugin side effects between tests.

---

*Testing analysis: 2026-07-23*
