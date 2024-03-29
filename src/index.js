// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { BootstrapVue } from 'bootstrap-vue'
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
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@trevoreyre/autocomplete-vue/dist/style.css'

import * as Sentry from "@sentry/browser";
import { Vue as VueIntegration } from "@sentry/integrations";
import { Integrations } from "@sentry/tracing";
import {version} from '../package.json';

Sentry.init({
  dsn: "https://2efc80c955be4b38b84e67b30d23610a@o302915.ingest.sentry.io/5174522",
  environment: process.env.NODE_ENV,  
  ignoreErrors: [
    // Random plugins/extensions
    "top.GLOBALS",
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.epicplay.com",
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    "http://loading.retry.widdit.com/",
    "atomicFindClose",
    // Facebook borked
    "fb_xd_fragment",
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
    // reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    "conduitPage",
    "Error: Extension context invalidated.",
    "ResizeObserver loop limit exceeded",
  ],
  denyUrls: [
    // Facebook flakiness
    /graph\.facebook\.com/i,
    // Facebook blocked
    /connect\.facebook\.net\/en_US\/all\.js/i,
    // Woopra flakiness
    /eatdifferent\.com\.woopra-ns\.com/i,
    /static\.woopra\.com\/js\/woopra\.js/i,
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Other plugins
    /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
    /webappstoolbarba\.texthelp\.com\//i,
    /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
  ],
  integrations: [
    new VueIntegration({
      Vue,      
      attachProps: true,
      logErrors: true,          
    }),    
  ],  
});

Vue.use(BootstrapVue)
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
    fcsVttEnabled: true,    
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
    },
    vueShowdownOpts: { emoji: false, openLinksInNewWindow: true },
    lastEvaluatedKey: null,
    pageTitle: null,
  },
  mutations: {
    authenticate (state, bAuth) {
      state.isAuthenticated = bAuth;
    },
    userInfo (state, userId) {
      state.userId = userId;
    },
    CognitoUser (state, currentUser) {
      state.cognito.CognitoUser = currentUser;
    },
    credentials (state, credentials) {
      state.credentials = credentials;
    },  
    userSession (state, session) {
      state.userSession = session;
    },    
    updateSessions (state, value) {
      state.sessions = value; 
      state.filteredSessions = this.state.sessions;
    },
    updateFilteredSessions (state, value) {     
      state.filteredSessions = value;
    },
    updateCampaigns (state, value) {      
      state.campaigns = value; 
      state.filteredCampaigns = this.state.campaigns;
    },
    updateFilteredCampaigns (state, value) {     
      state.filteredCampaigns = value;      
    },
    updateSearchText (state, value) {
      state.searchText = value;
    },
    updateDiceRoller (state, value) {
      state.diceRoller = value;
    },
    updateLastEvaluatedKey (state, value) {
      state.lastEvaluatedKey = value
    },
    updatePageTitle (state, value) {
      state.pageTitle = value
    }
  },
  getters: {
    pageTitle : state => {
      return state.pageTitle;
    },
    isSubscriber : state => {
      return state.hasActiveSubscription;
    },
    roll20Enabled: (state, getters) => {
      //don't show roll20 stuff on the creation screen, only saved characters      
      if (document.location.href.indexOf("/charactersheet") > -1) return false;      
      let enabled = getters.isSubscriber && state.roll20Enabled && state.roll20Installed && state.roll20Running;
      return enabled;
    },
    fcsVttEnabled: (state, getters) => {
      if (!window.opener || window.opener.origin !== window.origin) return false;
      let enabled = state.fcsVttEnabled && state.isAuthenticated; //you don't need to be a subscriber to play a character
      return enabled;
    },
    vttEnabled: (state, getters) => {    
      if (!state.isAuthenticated) return false;
      if (getters.fcsVttEnabled) return "fcsVtt"; //fcs takes priority over roll20
      if (getters.roll20Enabled) return "roll20";
      return false;
    },
    vttPlayer: (state, getters) => {
      return vttEnabled == "fcsVtt" && getters.isAuthenticated;
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
    },
    filteredCampaigns: state => {      
      return state.filteredCampaigns;
    },
    searchText: state => {
      return state.searchText;
    },
    diceRoller: state => {
      return state.diceRoller;
    },
    vueShowdownOpts: state => {
      return state.vueShowdownOpts;
    },
    lastEvaluatedKey: state => {
      return state.lastEvaluatedKey;
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

