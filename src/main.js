// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueAppend from 'vue-append'
import App from './App'
import router from './router'
import 'whatwg-fetch'

Vue.use(Vuex)
Vue.use(VueAppend)

window.Vue = Vue;

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    isAuthenticated: false,
    userId: "",
    sessions: [],
    filteredSessions: [],
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
      this.state.filteredSessions = value;
    },
    updateFilteredSessions (state, value) {     
      this.state.filteredSessions = value;      
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
      return state.filteredSessions;
    },
    searchText: state => {
      return state.searchText;
    }
  }
})

Vue.filter('filterSession', function () {
  let searchText = fcs.$store.state.searchText;
  let sessions = fcs.$store.state.sessions;
  if (searchText.length > 0) {
    sessions = fcs.$store.state.sessions.filter(item => item.description.includes(searchText));    
  }      
  fcs.$store.commit('updateFilteredSessions', sessions);  
});

/* eslint-disable no-new */
window.fcs = new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
});
