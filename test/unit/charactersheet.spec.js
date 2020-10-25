// Import the `mount()` method from Vue Test Utils
import { shallowMount, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
//import VueRouter from 'vue-router'
import CharacterSheetList from '@/pages/CharacterSheetList.vue';
import CharacterSheetDetail from '@/pages/CharacterSheetDetail.vue';
import VueShowdown, { showdown } from 'vue-showdown';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueShowdown);

describe('CharacterSheetList', () => { 
  it('renders a list of sheets', async () => {
    // mount() returns a wrapped Vue component we can interact with
    const wrapper = shallowMount(CharacterSheetList);
    
    // Assert the rendered text of the component
    expect(wrapper.text()).toContain('Fate Condensed');
    expect(wrapper.text()).toContain('Fate Core');
    expect(wrapper.text()).toContain('Fate Accelerated');
    expect(wrapper.text()).toContain('Dresden Files Accelerated');
    expect(wrapper.text()).toContain('Fate of Cthulhu');
  })
})

describe('Fate Core CharacterSheet without authentication', () => {  
  let $route = {
    path: '/charactersheet',
    params: { id: 'fate-core' },  
  }
  let getters
  let store

  beforeEach(() => {
    getters = {
      isAuthenticated: () => false,
      userId: () => null,      
      vttEnabled: () => false,
      vueShowdownOpts: () => {}, 
    }
    store = new Vuex.Store({
      getters
    })
  })
  
  it('does not render save character button', async () => {
    // mount() returns a wrapped Vue component we can interact with
    const wrapper = mount(CharacterSheetDetail, {
      store,
      localVue,
      mocks: {
        $route
      }
    });
        
    expect(wrapper.text()).not.toContain('Save Character');
    const comCharacterSheet = wrapper.findComponent({ name: 'CharacterSheet' });
    expect(comCharacterSheet.exists()).toBe(true);
    expect(comCharacterSheet.props('sheetid')).toBe('fate-core');
  })
})

describe('Fate Core CharacterSheet with authentication', () => {
  let $route = {
    path: '/charactersheet',
    params: { id: 'fate-core' },  
  }
  let getters
  let store

  beforeEach(() => {
    getters = {
      isAuthenticated: () => true,
      userId: () => null,      
      vttEnabled: () => false,
      vueShowdownOpts: () => {}, 
    }
    store = new Vuex.Store({
      getters
    })
  })
  
  it('does not render save character button', async () => {
    // mount() returns a wrapped Vue component we can interact with
    const wrapper = mount(CharacterSheetDetail, {
      store,
      localVue,
      mocks: {
        $route
      }
    });
        
    expect(wrapper.text()).toContain('Save Character');
    const comCharacterSheet = wrapper.findComponent({ name: 'CharacterSheet' });
    expect(comCharacterSheet.exists()).toBe(true);
    expect(comCharacterSheet.props('sheetid')).toBe('fate-core');
  })
})
