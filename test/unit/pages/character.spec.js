// Import the `mount()` method from Vue Test Utils
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';

import CharacterDetail from '@/pages/CharacterDetail.vue';
import CharacterSheet from '@/components/charactersheet.vue';
import CharacterProps from '@/components/characterprops'
import VueShowdown from 'vue-showdown';
window.$ = require('../../../node_modules/jquery');

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
      },
      data() {
        return {
          sheet: "",
          sheetId: "fate-anything",
          title: "Character",
          description: "Hello World",
          characterid: "12345",
          characterData: {
            related_id: "CHARACTERSHEET|fate-anything"
          },    
        }
      }      
    });
  })

  it('renders character sheet and props', async () => {  
    await wrapper.setData({ 
      sheetId: "fate-anything",
      characterData: {
        related_id: "CHARACTERSHEET|fate-anything"
      }
    });
        
    const characterSheet = wrapper.findComponent(CharacterSheet);   
    expect(characterSheet.exists()).toBe(true);    
  }) 

  it('renders character props', async () => {  
    await wrapper.setData({ 
      sheetId: "fate-anything",
      characterData: {
        related_id: "CHARACTERSHEET|fate-anything"
      }
    });
        
    const characterProps = wrapper.findComponent(CharacterProps);   
    expect(characterProps.exists()).toBe(true);    
  }) 
 
  it('renders sheet properties tab when fate-anything sheet', async () => {  

    await wrapper.setData({ 
      sheetId: "fate-anything",
      characterData: {
        related_id: "CHARACTERSHEET|fate-anything"
      }
    });
        
    const characterProps = wrapper.findComponent(CharacterProps);      
    const templateContainer = characterProps.find("#TabSheetProperties");    
    expect(templateContainer.exists()).toBe(true);    
  }) 

  it('does not render sheet properties tab when not fate-anything sheet', async () => {  
    await wrapper.setData({ 
      sheetId: "fate-core",
      characterData: {
        related_id: "CHARACTERSHEET|fate-core"
      }
    });

    const characterProps = wrapper.findComponent(CharacterProps);   
    const templateContainer = characterProps.find("#TabSheetProperties");    
    expect(templateContainer.exists()).toBe(false);    
  }) 
})
