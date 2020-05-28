// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueAppend from 'vue-append'
import VueCookies from 'vue-cookies'
import { Datetime } from 'vue-datetime'
// You need a specific loader for CSS files
import 'vue-datetime/dist/vue-datetime.css'
import VueShowdown, { showdown } from 'vue-showdown'
import App from './App'
import router from './router'
import 'whatwg-fetch'
import './assets/site.scss'

import 'aws-sdk'
import 'amazon-cognito-identity-js'
import 'jquery'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.use(Vuex)
Vue.use(VueAppend)
Vue.use(VueCookies)
Vue.use(Datetime)
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
    hasActiveSubscription: null,
    customerId: null,
    roll20Enabled: true,
    roll20Installed: false,
    roll20Running: false,    
    sessions: [],
    filteredSessions: [],
    campaigns: [],
    filteredCampaigns: [],
    searchText: "",
    diceRoller: null,
    callback: null,
    content: $('#results'),
    environment: process.env.NODE_ENV,
    isAuthenticated: false,
    authorizedUserArn: 'arn:aws:iam::210120940769:role/FateCharacterSheetUser',
    userId: null,
    authProvider: '',
    credentials: null,
    cognito: {
      poolArn: 'arn:aws:cognito-idp:us-east-1:210120940769:userpool/us-east-1_x9gvO6Gy3',
      poolId: 'us-east-1_x9gvO6Gy3',
      clientId: '4hds760dsd2acikun12bpcljhk',
      identityPool: 'us-east-1:ba495e76-4ecc-4ae5-b116-62ed4dd2a596',
      CognitoUser: null,      
    }
  },
  mutations: {
    authenticate (state, bAuth) {
      this.state.isAuthenticated = bAuth;
    },
    userInfo (state, userId) {
      this.state.userId = userId;
    },
    CognitoUser (state, currentUser) {
      this.state.cognito.CognitoUser = currentUser;
    },
    credentials (state, credentials) {
      this.state.credentials = credentials;
    },  
    userSession (state, session) {
      this.state.userSession = session;
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
    },
    updateDiceRoller (state, value) {
      this.state.diceRoller = value;
    }
  },
  getters: {
    isSubscriber : state => {
      var groups = state.userSession.getIdToken().payload['cognito:groups'];
      if (groups && groups.includes("super-user")) {
        return true;
      }      
      return state.hasActiveSubscription;
    },
    roll20Enabled: (state, getters) => {
      //don't show roll20 stuff on the creation screen, only saved characters      
      if (document.location.href.indexOf("/charactersheet") > -1) return false;      
      let enabled = state.roll20Enabled && state.roll20Installed && getters.isSubscriber && state.roll20Running;
      return enabled;
    },
    isAuthenticated: state => {
      return state.isAuthenticated;
    },
    sessions: state => {
      this.state.sessions = value;      
    },
    currentUser: state => {
      return state.cognito.CognitoUser;      
    },
    userId: state => {
      return state.userId;
    },
    cognito : state => {
      return state.cognito;
    },
    credentials : state => {
      return state.credentials;
    }, 
    filteredSessions: state => {      
      return state.filteredSessions.sort((a, b) => (a.date < b.date) ? 1 : -1);
      //return state.filteredSessions;
    },
    filteredCampaigns: state => {      
      return state.filteredCampaigns;
    },
    searchText: state => {
      return state.searchText;
    },
    diceRoller: state => {
      return state.diceRoller;
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
    campaigns = fcs.$store.state.campaigns.filter(item => (item.description && item.description.toLowerCase().includes(searchText)) || (item.name && item.name.toLowerCase().includes(searchText)) || (item.scale && item.scale.toLowerCase().includes(searchText)));
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

