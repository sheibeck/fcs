// Import the `mount()` method from Vue Test Utils
import { createLocalVue, shallowMount } from '@vue/test-utils';
import CharacterSheet from '@/components/charactersheet.vue';

const localVue = createLocalVue();

describe('Character Sheet Component', () => { 
  let wrapper

  beforeEach(() => {   
    // mount() returns a wrapped Vue component we can interact with
    wrapper = shallowMount(CharacterSheet, {      
      localVue,
      props: {
        sheetid: "fate-anything",
        character: {
          related_id: "CHARACTERSHEET|fate-anything"
        },
        isOwner: true,
      },     
      computed: {
        currentCharacterSheet() {  
          //override because we don't need to navigate in tests        
        }
      }
    });
  })

  const vttMessageCases = [
    [
      "diceroll", "character name", "skill name", "1", "skill type", 
      {
        type: "diceroll",
        character: "character name",
        skillType: "skill type",
        skill: "skill name",
        modifier: "1"
      }
    ],
    [
      "invoke", "character name", "description of aspect", "aspect name", "skill type", 
      {
        type: "invoke",
        character: "character name",
        description: "description of aspect",
        aspect: "aspect name",
      }
    ],
    [
      "stuntextra", "character name", "description", "stunt name", "skill type", 
      {
        type: "stuntextra",
        character: "character name",
        stuntextra: "stunt name",
      }
    ],
    [
      "fatepoint", "character name", "description", "1", "skill type", 
      {
        type: "fatepoint",
        character: "character name",
        description: "description",
        modifier: "1",  
      }
    ],
    [
      "stress", "character name", "took 1", "stress type", "skill type", 
      {
        type: "stress",
        character: "character name",
        description: "took 1",
        stress: "stress type",  
      }
    ],
    [
      "condition", "character name", "took 1", "stress type", "skill type", 
      {
        type: "stress",
        character: "character name",
        description: "took 1",
        stress: "stress type",  
      }
    ],
    [
      "consequence", "character name", "gained consequence", "consequence name", "skill type", 
      {
        type: "consequence",
        character: "character name",
        description: "gained consequence",
        consequence: "consequence name",  
      }
    ]
  ];

  test.each(vttMessageCases)(
    "given %p,%p,%p,%p,%p arguments, returns %o",
    (type, character, description, data, skillType, expectedResult) => {  
    let result = wrapper.vm.formatVTTMessage(type, character, description, data, skillType);
    expect(result).toEqual(expectedResult);
  }) 
})
