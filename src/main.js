// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueAppend from 'vue-append'
import VueShowdown, { showdown } from 'vue-showdown'
import App from './App'
import router from './router'
import 'whatwg-fetch'

Vue.use(Vuex)
Vue.use(VueAppend)

Vue.use(VueShowdown, {
  // set default flavor of showdown
  flavor: 'github',
  // set default options of showdown (will override the flavor options)
  options: {
    emoji: false,
  },
})

window.Vue = Vue;

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    isAuthenticated: false,
    userId: "",
    sessions: [],
    filteredSessions: [],
    campaigns: [],
    filteredCampaigns: [],
    searchText: "",
  },
  mutations: {
    authenticate (state, bAuth) {
      this.state.isAuthenticated = bAuth;
    },
    userInfo (state, userId) {
      this.state.userId = userId;
    },
    updateSessions (state, value) {
      this.state.sessions = value; 
      this.state.filteredSessions = this.state.sessions;
    },
    updateFilteredSessions (state, value) {     
      this.state.filteredSessions = value;
    },
    updateCampaigns (state, value) {      
      this.state.campaigns = value; 
      this.state.filteredCampaigns = this.state.campaigns;
    },
    updateFilteredCampaigns (state, value) {     
      this.state.filteredCampaigns = value;      
    },
    updateSearchText (state, value) {
      this.state.searchText = value;
    }
  },
  getters: {
    isAuthenticated: state => {
      return state.isAuthenticated;
    },
    sessions: state => {
      this.state.sessions = value;      
    },
    userId: state => {
      return state.userId;
    },
    filteredSessions: state => {      
      //return state.filteredSessions.sort((a, b) => (a.date < b.date) ? 1 : -1);
      return state.filteredSessions;
    },
    filteredCampaigns: state => {      
      return state.filteredCampaigns;
    },
    searchText: state => {
      return state.searchText;
    }
  }
})

Vue.filter('filterSessions', function () {
  let searchText = fcs.$store.state.searchText.toLowerCase();
  let sessions = fcs.$store.state.sessions;
  if (searchText.length > 0) {
    sessions = fcs.$store.state.sessions.filter(item => item.description.toLowerCase().includes(searchText));    
  }      
  fcs.$store.commit('updateFilteredSessions', sessions);  
});

Vue.filter('filterCampaigns', function () {
  let searchText = fcs.$store.state.searchText.toLowerCase();
  let campaigns = fcs.$store.state.campaigns;
  if (searchText.length > 0) {
    campaigns = fcs.$store.state.campaigns.filter(item => item.description.toLowerCase().includes(searchText) || item.title.toLowerCase().includes(searchText) || item.scale.toLowerCase().includes(searchText));    
  }      
  fcs.$store.commit('updateFilteredCampaigns', campaigns);  
});

/* eslint-disable no-new */
window.fcs = new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
});
