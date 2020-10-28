// Import the `mount()` method from Vue Test Utils
import { shallowMount, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
//import VueRouter from 'vue-router'
import CharacterSheetList from '@/pages/CharacterSheetList.vue';
import CharacterSheetDetail from '@/pages/CharacterSheetDetail.vue';
import CharacterSheet from '@/components/CharacterSheet.vue';
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

describe('charactersheet component', () => {
  let wrapper
  let charactersheet
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
    
    // mount() returns a wrapped Vue component we can interact with
    wrapper = mount(CharacterSheetDetail, {
      store,
      localVue,
      mocks: {
        $route
      }
    });

    charactersheet = wrapper.findComponent({ name: 'CharacterSheet' });
  })

  test.each([
    ["MsgDiceRoll", "diceroll", "bob", "clever", "+1", "approach", {
      type: "diceroll",
      character: "bob",
      skillType: "approach",
      skill: "clever",
      modifier: "+1"           
    }],
    ["MsgInvoke", "invoke", "bob", "invoked", "high concept", null, {
      type: "invoke",
      character: "bob",
      description: "invoked",
      aspect: "high concept"
    }],
    ["MsgStuntExtra", "stuntextra", "bob", null, "my cool stunt", null, {
      type: "stuntextra",
      character: "bob",
      stuntextra: "my cool stunt",
    }],
    ["MsgFatePoint", "fatepoint", "bob", "gained", "1", null, {
      type: "fatepoint",
      character: "bob",
      description: "gained",
      modifier: "1",   
    }],
    ["MsgStress", "stress", "bob", "took stress", "1", null, {
      type: "stress",
      character: "bob",
      description: "took stress",
      stress: "1",   
    }],
    ["MsgStress", "condition", "bob", "took condition", "1", null, {
      type: "stress",
      character: "bob",
      description: "took condition",
      stress: "1",   
    }],
    ["MsgConsequence", "consequence", "bob", "mild", "ow, my toe", null, {
      type: "consequence",
      character: "bob",
      description: "mild",
      consequence: "ow, my toe",   
    }]
  ])(`formatVTTMessage returns %p message when type is %p`, async(messagetype, type, character, description, data, skillType, expected) => {    
    let actual = await charactersheet.vm.formatVTTMessage(type, character, description, data, skillType);    
    expect(actual).toStrictEqual(expected);
  }); 
});
