// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'

Vue.use(Vuex)
window.Vue = Vue;

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    isAuthenticated: false,
    userId: "",
  },
  mutations: {
    authenticate (state, bAuth) {
      this.state.isAuthenticated = bAuth;
    },
    userInfo (state, userId) {
      this.state.userId = userId;
    }
  },
  getters: {
    isAuthenticated: state => {
      return state.isAuthenticated;
    },
    userId: state => {
      return state.userId;
    }
  }
})

/* eslint-disable no-new */
window.fcs = new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
