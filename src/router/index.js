import Vue from 'vue'
import Vuex from 'vuex'
import Meta from 'vue-meta'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Error from '@/components/Error'
import Register from '@/components/Register'
import Recover from '@/components/Recover'
import Confirm from '@/components/Confirm'
import CharacterDetail from '@/components/CharacterDetail'
import CharacterList from '@/components/CharacterList'
import CharacterSheetDetail from '@/components/CharacterSheetDetail'
import CharacterSheetList from '@/components/CharacterSheetList'
import AdversaryDetail from '@/components/AdversaryDetail'
import AdversaryList from '@/components/AdversaryList'

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
    { path: '/charactersheet', component: CharacterSheetList },
    { path: '/charactersheet/:id', name: 'Character Sheet Detail', component: CharacterSheetDetail, props: true },
    { path: '/adversary/edit/:id?', component: AdversaryDetail, props: true },
    { path: '/adversary/:id?', component: AdversaryList, props: true },
    { path: '*', component: Error }
  ]
})
