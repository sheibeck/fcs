// Import the `mount()` method from Vue Test Utils
import { shallowMount, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import VueCookies from 'vue-cookies'

import AdversaryList from '@/pages/AdversaryList.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueCookies);

const fakeDocumentCookie = {
  cookies: '',
  
  get cookie() {
    return this.cookies;
  },
  
  set cookie(cookieValue) {
    const cookies = this.cookies.split(' ');
    const cookieName = cookieValue.split('=').shift();
    const cookieNameLength = cookieName.length;
    let cookieIndex = -1;
    cookies.forEach((value, index) => {
      if (`${value.substr(0, cookieNameLength)}=` === `${cookieName}=`) {
        cookieIndex = index;
      }
    });
    if (cookieIndex > -1) {
      cookies[cookieIndex] = `${cookieValue};`;
    } else {
      cookies.push(`${cookieValue};`);
    }
    this.cookies = cookies.join(' ').trim();
  },
};

describe('Adversary List', () => {  
  let $route = {
    path: '/adversary',
    params: { id: "ADVERSARY|blah"}  
  }
  let getters, mutations
  let store

  beforeEach(() => {
    getters = {
      isAuthenticated: () => true,
      userId: () => null,      
      vttEnabled: () => false,
      vueShowdownOpts: () => {}, 
    }
    mutations = {      
    }
    store = new Vuex.Store({
      getters,
      mutations,
    })
  })
  
  it('renders adversary with new data format', async () => {
    // mount() returns a wrapped Vue component we can interact with
    const wrapper = shallowMount(AdversaryList, {
      store,
      localVue,
      data() {
        return {
          adversaries: [
            {
              "search_data":"name=weasel raider||highconcept=cunning and savage weasel",
              "stunts":[
                {"name":"Natural Trickster","value":"Grain +2 when creating advantages to deceive or trick"},
                {"name":"Gear","value":"Axe, Sack"}
              ],
              "object_type":"ADVERSARY",
              "slug":"weasel-raider",
              "name":"Weasel Raider",
              "genre":"Fantasy",
              "stress":[
                {"name":"Injured","value":"2"},
                {"name":"Exhausted","value":"1"},
                {"name":"Wounded","value":"4"}
              ],
              "aspects":{"trouble":"Kill. Steal. Gloat.","high_concept":"Cunning and Savage Weasel"},
              "owner_id":"guid",
              "system":"Other",
              "skills":[
                {"name":"Fighter","value":"4"},
                {"name":"Hunter","value":"4"},
                {"name":"Scout","value":"3"}
              ],
              "id":"ADVERSARY|blah",
              "consequences":[
                {"name":"Mild","value":"-2"}
              ],
              "type":"Enemy"
            },            
          ]
        }
      },  
      mocks: {
        $route
      }
    });
                 
    expect(wrapper.find('#stunt-0').exists()).toBe(true);
    expect(wrapper.find('#stunt-1').exists()).toBe(true);

    expect(wrapper.find('#stresstrack-0').exists()).toBe(true);
    expect(wrapper.find('#stresstrack-1').exists()).toBe(true);
    expect(wrapper.find('#stresstrack-2').exists()).toBe(true);
    
    expect(wrapper.find('#skill-0').exists()).toBe(true);
    expect(wrapper.find('#skill-1').exists()).toBe(true);
    expect(wrapper.find('#skill-2').exists()).toBe(true);

    expect(wrapper.find('#consequence-0').exists()).toBe(true);    
  })

  it('renders adversary with old data format', async () => {    
    const wrapper = shallowMount(AdversaryList, {
      store,
      localVue,
      data() {
        return {
          adversaries: [
            {
              "stunts":{"Scythe-Like Claws":"Weapon: 2"},
              "object_type":"ADVERSARY",
              "slug":"badger",
              "name":"Badger",
              "genre":"Fantasy",
              "stress":{"Exhausted":["1"],"Wounded":["4"],"Inured":["2"],"Broken":["6"]},
              "aspects":{"trouble":"Nocturnal","high_concept":"Keen-smelling Predator"},
              "owner_id":"guid",
              "system":"Other",
              "skills":{"Fighter":"4","Hunter":"4","Scout":"3"},
              "id":"ADVERSARY|blah",
              "consequences":{"Mild":"-2","Moderate":"-4","Severe":"-6"},
              "type":"Enemy"}
          ]
        }
      },  
      mocks: {
        $route
      }
    });
                 
    expect(wrapper.find('#highconcept').exists()).toBe(true);
    expect(wrapper.find('#trouble').exists()).toBe(true);

    expect(wrapper.find('#stresstrack-Exhausted').exists()).toBe(true);
    expect(wrapper.find('#stresstrack-Wounded').exists()).toBe(true);
    expect(wrapper.find('#stresstrack-Inured').exists()).toBe(true);
    expect(wrapper.find('#stresstrack-Broken').exists()).toBe(true);
    
    expect(wrapper.find('#skill-Fighter').exists()).toBe(true);
    expect(wrapper.find('#skill-Hunter').exists()).toBe(true);
    expect(wrapper.find('#skill-Scout').exists()).toBe(true);

    expect(wrapper.find('#consequence-Mild').exists()).toBe(true);
    expect(wrapper.find('#consequence-Moderate').exists()).toBe(true);
    expect(wrapper.find('#consequence-Severe').exists()).toBe(true);
  })
})