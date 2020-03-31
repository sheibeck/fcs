import Vue from 'vue'
import Vuex from 'vuex'
import Meta from 'vue-meta'
import Router from 'vue-router'
import Home from 'pages/Home'
import Login from 'pages/Login'
import Error from 'pages/Error'
import Register from 'pages/Register'
import Recover from 'pages/Recover'
import Confirm from 'pages/Confirm'
import CharacterDetail from 'pages/CharacterDetail'
import CharacterList from 'pages/CharacterList'
import CampaignList from 'pages/CampaignList'
import CampaignDetail from 'pages/CampaignDetail'
import CampaignSummary from 'pages/CampaignSummary'
import CharacterSheetDetail from 'pages/CharacterSheetDetail'
import CharacterSheetList from 'pages/CharacterSheetList'
import AdversaryDetail from 'pages/AdversaryDetail'
import AdversaryList from 'pages/AdversaryList'

Vue.use(Router)
Vue.use(Meta)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'Home', component: Home, props: true},
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/recover', component: Recover },
    { path: '/confirm', component: Confirm },
    { path: '/character', component: CharacterList },
    { path: '/character/:sheetname/:id/:name?', name: 'Character Detail', component: CharacterDetail, props: true },
    { path: '/campaign', component: CampaignList },
    { path: '/campaign/:id/:name?', name: 'Campaign Detail', component: CampaignDetail, props: true },
    { path: '/campaign-summary/:id/:name?', name: 'Campaign Summary', component: CampaignSummary, props: true },
    { path: '/charactersheet', component: CharacterSheetList },    
    { path: '/charactersheet/:id', name: 'Character Sheet Detail', component: CharacterSheetDetail, props: true },
    { path: '/adversary/edit/:id?', component: AdversaryDetail, props: true },
    { path: '/adversary/:id?', component: AdversaryList, props: true },
    { path: '*', component: Error }
  ]
})
