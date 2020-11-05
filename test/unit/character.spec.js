// Import the `mount()` method from Vue Test Utils
import { shallowMount, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';

import CharacterSheet from '@/components/CharacterSheet.vue';
import CharacterDetail from '@/pages/CharacterDetail.vue';
import VueShowdown from 'vue-showdown';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueShowdown);

describe('Character with authentication', () => {
  let $route = {
    path: "/character/sheet-name/characterid/character-name",    
    params: { 
      id:"characterid",
      name:"character-name",
      sheetname:"sheet-name",
    },  
  }
  let getters, mutations
  let store
  let wrapper

  beforeEach(() => {
    getters = {
      isAuthenticated: () => true,
      userId: () => null,      
      vttEnabled: () => true,
      vueShowdownOpts: () => {}, 
    }
    mutations = {
      updatePageTitle (state, value) {
        state.pageTitle = value
      }
    }
    store = new Vuex.Store({
      getters,
      mutations,
    })

    // mount() returns a wrapped Vue component we can interact with
    wrapper = mount(CharacterDetail, {
      store,
      localVue,      
      mocks: {
        $route
      }
    });
  })
 
  it('renders template container when fate-anything sheet', async () => {  
    await wrapper.setData({ 
      characterData: {
        related_id: "CHARACTERSHEET|fate-anything"
      }
    });

    const templateContainer = wrapper.find("#TemplateContainer");    
    expect(templateContainer.exists()).toBe(true);    
  }) 

  it('does not render template container when not fate-anything sheet', async () => {  
    await wrapper.setData({ 
      characterData: {
        related_id: "CHARACTERSHEET|fate-core"
      }
    });

    const templateContainer = wrapper.find("#TemplateContainer");    
    expect(templateContainer.exists()).toBe(false);    
  }) 
})
