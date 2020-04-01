<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="/">
          <img src='/static/img/logo.png' alt="Logo"/>
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">              
              <li class="nav-item dropdown" v-if="isAuthenticated" v-bind:class="{active : isActive('character') || isActive('campaign')}">
                 <a class="nav-link dropdown-toggle" href="#" id="myStuffDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                   <span class="dice">C</span>My Stuff
                 </a>
                 <div class="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                    <a class="nav-link" v-bind:class="{active : isActive('character')}" href="/character"><i class="fas fa-user"></i> My Characters</a>
                    <a class="nav-link" v-bind:class="{active : isActive('campaign')}" href="/campaign"><i class="fas fa-globe"></i> My Campaigns</a>                        
                 </div>
              </li>             
              <li class="nav-item" v-bind:class="{active : isActive('charactersheet')}" ref="el">
                  <a class="nav-link" href="/charactersheet"><span class="dice">D</span>Character Sheets</a>
              </li>
              <li class="nav-item" v-bind:class="{active : isActive('adversary')}" ref="el">
                  <a class="nav-link" href="/adversary"><span class="dice">A</span>Adversaries</a>
              </li>
              <li class="nav-item dropdown">
                 <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                   <i class="fas fa-tools"></i> Tools
                 </a>
                 <div class="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                   <a class="nav-link" target="_blank" href="https://fate-srd.com/"><span class="dice">+</span> Fate SRD</a>
                   <div class="dropdown-divider"></div>
                   <a id="play-fate" class="nav-link" target="_blank" href="https://app.roll20.net/lfg/search/?playingstructured=fate"><img src="/static/img/roll20logo.png" alt="Roll20 logo" class="roll-20"> Roll20.net</a>                   
                   <a class="nav-link" target="_blank" href="https://www.rpgsolo.com/"><span class="dice">+</span> RPG Solo</a>
                   <div class="dropdown-divider"></div>
                   <a id="roll-fate" class="nav-link" target="#" href="#" data-toggle='modal' data-target='#modalDiceRoller'><span class="dice">+</span> Fate Dice Roller</a>
                 </div>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span class="dice">O</span> Support
                </a>
                <div class="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                  <a class="nav-link" target="_blank" href="https://sterlingheibeck.wordpress.com/category/fate-character-sheet/"><i class="fas fa-blog"></i> Blog</a>
                  <a class="nav-link" target="_blank" href="https://github.com/sheibeck/fcs/issues"><i class="fa fa-bug"></i> Report Issue</a>
                </div>
              </li>
               <li class="nav-item" ref="el">
                  <a class="nav-link" href="http://paypal.me/sheibeck" target="_blank"><i class="fas fa-coins"></i> Donate</a>
              </li>			              
          </ul>

          <div v-if="!isAuthenticated" class="form-inline login-button">
              <button type="button" class="btn btn-primary mr-sm-1 mb-sm-1 mb-md-0 js-login">
                  Login <i class="fas fa-sign-in-alt"></i>
              </button>
          </div>
          <div v-if="isAuthenticated" class="form-inline logout-button mx-1 mb-sm-1">
              <button type="button" class="btn btn-primary mr-sm-1 mb-sm-1 mb-md-0" v-on:click="logout">Logout</button>
          </div>
          <div class="form-inline my-2 my-sm-0">
              <div class="input-group">
                <input id="search-text" class="form-control" type="text" placeholder="Search" v-model="$store.state.searchText" @input="search" />
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button" v-on:click="clearSearch"><i class="fa fa-times-circle"></i></button>
                  <button id="search-button" class="btn btn-outline-success" type="button" v-on:click="search">Search</button>
                </div>
              </div>
          </div>
      </div>
    </nav>

    <router-view></router-view>

    <footer class='footer'>
      <div class="container">
        <div class='d-flex justify-content-between'>
          <div>
            <span class="dice">C</span> <span class="d-none d-md-inline">Built by</span> Darktier Studios, LLC.
          </div>
          <div class="d-none d-sm-block">
            <span class="dice">A</span> Powered by Fate
          </div>
          <div class="pt-2">
            <a href="https://www.iubenda.com/privacy-policy/23267044" class="iubenda-black iubenda-embed" title="Privacy Policy ">Privacy Policy</a>            
          </div>       
        </div>
      </div>
    </footer>

    <!-- dice tray -->
    <div class="modal fade" id="modalDiceRoller" tabindex="-1" role="dialog" aria-labelledby="diceRollerLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="diceRollerLabel"> <span class="dice">+</span> Fate Dice Roller <span class="dice">-</span></h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
              </div>
              <div class="row px-0 mx-0 pt-1 pb-1 roll-modifier">
                  <label class="col-4 h5 pt-2">Roll Modifier</label> <input class="form-control col-2 text-center" type="number" id="rollModifier">
              </div>
              <div class="modal-body">
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-primary js-roll-dice">Roll</button>
                  <button type="button" class="btn btn-warning js-clear-dice">Clear</button>
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  metaInfo() {
    return {
       title: "Fate Character Sheet",
       titleTemplate: '%s | Fate Character Sheet',
       meta: [
         { vmid: 'description', name: 'description', content: "Create and manage all your characters for the Fate Roleplaying Game. We have character sheets for Fate Core, Fate Accelerated and additional custom character sheets for the Fate Roleplaying Game. You can roll Fate dice and create and find adversaries for your Fate Roleplaying game." }
       ]
     }
  },
  created(){
    fatesheet.init();
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'searchText'
    ]),
  },
  data () {
    return {
      title: "Fate Character Sheet"
    }
  },
  methods: {
    logout: function() {
      fatesheet.logout();
    },
    isActive : function(val) {
      return val === document.location.pathname.split('/')[1];
    },
    clearSearch : function() {      
      this.$store.commit("updateSearchText", "");
      $("#search-button").trigger("click");
    },
    search : function() {
      let searchText = this.$store.state.searchText;
      fatesheet.search(searchText);
    }
  }
}
</script>
