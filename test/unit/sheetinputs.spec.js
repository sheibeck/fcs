// Import the `mount()` method from Vue Test Utils
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import CharacterSheet from '@/components/CharacterSheet.vue';
import SheetFateCore from '@/sheets/fate-core.vue';
import SheetFateCondensed from '@/sheets/fate-condensed.vue';
import SheetFateOfCthulhu from '@/sheets/fate-of-cthulhu.vue';
import SheetFateAnything from '@/sheets/fate-anything.vue';
import VueShowdown from 'vue-showdown';

//inputs
import InputSkillPyramid from '@/components/input-skill-pyramid.vue';
import InputSkillColumn from '@/components/input-skill-column.vue';
import InputAspect from '@/components/input-aspect.vue';

function mountComponentWithProps (store, Component, propsData) {
  let $route = {   
  }

  return mount(Component, {
    parentComponent: CharacterSheet,
    store,
    localVue,
    propsData: propsData,
    mocks: {
      $route
    }
  });    
}

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueShowdown);

describe('skill components', () => {
  let wrapper   
  let getters,mutations  
  let store

  beforeEach(() => {
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
    store = new Vuex.Store({
      getters,
      mutations,
    })
  })  

  it('SkillPyramid should properly render', async () => { 
    // mount() returns a wrapped Vue component we can interact with
    let $route = {
      path: '/character',
      params: { id: 'fate-core' },  
    }

    wrapper = mount(SheetFateCore, {
      parentComponent: CharacterSheet,
      store,
      localVue,
      propsData: {        
        character: {
          name: 'bob',
          skills: { 
            superb: { 
              s1: "Fight"
            },
            fair: { 
              s1: "Drive"
            } 
          }
        }
      },
      mocks: {
        $route
      }
    });    

    const comInput = wrapper.findComponent(InputSkillPyramid); 
    expect(comInput.exists()).toBe(true)
        
    expect(comInput.text()).toContain('Superb +5:   Fight');   
    expect(comInput.text()).toContain('Fair +2:   Drive');
  });

  const skillColumnTestData = [
    [{
        label1:"A custom Skill",
        skill1:"1"            
      }, true, "A custom Skill", "1", SheetFateCondensed, 0],
    [{
        skill2:"4"
      }, true, "", "4", SheetFateCondensed, 1],
    [{
        burglary:"-1"
      }, false, "BURGLARY", "-1", SheetFateOfCthulhu, 2]
  ]

  test.each(skillColumnTestData)(
    'SkillColumn should properly render %o',
    async (skill, isCustomLabel, expectedSkillLabel, expectedSkillValue, CharacterSheetComponent, index) => { 

      wrapper = mountComponentWithProps(store, CharacterSheetComponent, 
        {
          character: {         
            skills: skill
          }
        }
      );

      //first skill
      const comInput = wrapper.findAllComponents(InputSkillColumn).at(index);      
      expect(comInput.exists()).toBe(true)   
                    
      if (isCustomLabel)
      {
        const labeLInput = comInput.find('input.inputlabel');
        expect(labeLInput.exists()).toBe(true);
        expect(labeLInput.element.value).toBe(expectedSkillLabel);
      }
      else {
        const labeLInput = comInput.find('label.inputlabel');
        expect(labeLInput.exists()).toBe(true);
        expect(labeLInput.element.innerHTML).toBe(expectedSkillLabel);
      }

      const valueInput = comInput.find('input.form-control');
      expect(valueInput.exists()).toBe(true);
      expect(valueInput.element.value).toBe(expectedSkillValue);   
    }
  );
 
  it('AspectInput should render label element if locked', async () => { 
      wrapper = mountComponentWithProps(store, SheetFateAnything, 
        {
          character: {         
            aspects: [
              {id: 1, label:"aspects.label1", obj:"aspects.aspect1", placeholder:"High Concept"},
            ]
          }
        }
      );

      //first skill
      const comInput = wrapper.findAllComponents(InputAspect).at(0);   
      expect(comInput.exists()).toBe(true);

      await comInput.setProps({editlock: true, customlabel: true});
      const comLabel = comInput.find('label');
      expect(comLabel.exists()).toBe(true);
    }
  );

  it('AspectInput should render inputlabel if not locked', async () => { 
    wrapper = mountComponentWithProps(store, SheetFateAnything, 
      {
        character: {         
          aspects: [
            {id: 1, label:"aspects.label1", obj:"aspects.aspect1", placeholder:"High Concept"},
          ]
        }
      }
    );
            
    //first skill
    const comInput = wrapper.findAllComponents(InputAspect).at(0);
    expect(comInput.exists()).toBe(true);

    await comInput.setProps({editlock: false, customlabel: true});    
    const comLabel = comInput.find('input.inputlabel');
    expect(comLabel.exists()).toBe(true) 
  }
);
});
