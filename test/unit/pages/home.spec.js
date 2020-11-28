// Import the `mount()` method from Vue Test Utils
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Home from '@/pages/Home.vue';

const localVue = createLocalVue();
localVue.use(Vuex);


describe('Home without authentication', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      isAuthenticated: () => false,
      userId: () => null,
      isSubscriber: () => false
    }
    store = new Vuex.Store({
      getters
    })
  })

  it('renders create account CTA', async () => {
    // mount() returns a wrapped Vue component we can interact with
    const wrapper = shallowMount(Home, { store, localVue });
    
    // Assert the rendered text of the component
    expect(wrapper.text()).toContain('Create a Free Account');
  })
})

describe('Home with authentication and no subscription', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      isAuthenticated: () => true,
      userId: () => null,
      isSubscriber: () => false
    }
    store = new Vuex.Store({
      getters
    })
  })

  it('renders subscribe CTA', async () => {
    // mount() returns a wrapped Vue component we can interact with
    const wrapper = shallowMount(Home, { store, localVue });
    
    // Assert the rendered text of the component
    expect(wrapper.text()).toContain('Become a Subscriber');
  })
})

describe('Home with authentication and subscription', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      isAuthenticated: () => true,
      userId: () => null,
      isSubscriber: () => true
    }
    store = new Vuex.Store({
      getters
    })
  })
 
  it('renders play online CTA', async () => {
    // mount() returns a wrapped Vue component we can interact with
    const wrapper = shallowMount(Home, { store, localVue });
    
    // Assert the rendered text of the component
    expect(wrapper.text()).toContain('Build & Play Online');
  })
})