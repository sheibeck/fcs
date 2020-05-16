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
              <a href="/login" type="button" class="btn btn-primary mr-sm-1 mb-sm-1 mb-md-0">
                  Login <i class="fas fa-sign-in-alt"></i>
              </a>
          </div>
          <div v-if="isAuthenticated" class="form-inline mx-1 mb-sm-1">
              <button type="button" class="btn btn-primary mr-sm-1 mb-sm-1 mb-md-0" v-on:click="logout">Logout</button>
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
    <diceroller />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import CommonService from "./assets/js/commonService"
import UserService from "./assets/js/userService"
import DiceRoller from "./components/diceroller"

let userSvc = null;
let commonSvc = null;

export default {
  name: 'App',
  components: {
    diceroller: DiceRoller,
  },
  metaInfo() {
    return {
       title: "Fate Character Sheet",
       titleTemplate: '%s | Fate Character Sheet',
       meta: [
         { vmid: 'description', name: 'description', content: "Create and manage all your characters for the Fate Roleplaying Game. We have character sheets for Fate Core, Fate Accelerated and additional custom character sheets for the Fate Roleplaying Game. You can roll Fate dice and create and find adversaries for your Fate Roleplaying game." }
       ]
     }
  },
  mounted(){
    userSvc = new UserService(this.$root);
    commonSvc = new CommonService(this.$root);
    this.init();    
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
      userSvc.Logout();
      document.location.href = '/';
    },
    isActive : function(val) {
      return val === document.location.pathname.split('/')[1];
    },
    init: function() {     
      /* extend some libraries */
      $.expr[":"].contains = $.expr.createPseudo(function (arg) {
        return function (elem) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
      });
      
      /* populate function ala Dave Stewart - http://davestewart.io/plugins/jquery/jquery-populate/ */
      jQuery.fn.populate = function (g, h) { function parseJSON(a, b) { b = b || ''; if (a == undefined) { } else if (a.constructor == Object) { for (var c in a) { var d = b + (b == '' ? c : '[' + c + ']'); parseJSON(a[c], d) } } else if (a.constructor == Array) { for (var i = 0; i < a.length; i++) { var e = h.useIndices ? i : ''; e = h.phpNaming ? '[' + e + ']' : e; var d = b + e; parseJSON(a[i], d) } } else { if (k[b] == undefined) { k[b] = a } else if (k[b].constructor != Array) { k[b] = [k[b], a] } else { k[b].push(a) } } }; function debug(a) { if (window.console && console.log) { console.log(a) } } function getElementName(a) { if (!h.phpNaming) { a = a.replace(/\[\]$/, '') } return a } function populateElement(a, b, c) { var d = h.identifier == 'id' ? '#' + b : '[' + h.identifier + '="' + b + '"]'; var e = jQuery(d, a); c = c.toString(); c = c == 'null' ? '' : c; e.html(c) } function populateFormElement(a, b, c) { var b = getElementName(b); var d = a[b]; if (d == undefined) { d = jQuery('#' + b, a); if (d) { d.html(c); return true } if (h.debug) { debug('No such element as ' + b) } return false } if (h.debug) { _populate.elements.push(d) } var elements = d.type == undefined && d.length ? d : [d]; for (var e = 0; e < elements.length; e++) { var d = elements[e]; if (!d || typeof d == 'undefined' || typeof d == 'function') { continue } switch (d.type || d.tagName) { case 'radio': d.checked = (d.value != '' && c.toString() == d.value); case 'checkbox': var f = c.constructor == Array ? c : [c]; for (var j = 0; j < f.length; j++) { d.checked |= d.value == f[j] } break; case 'select-multiple': var f = c.constructor == Array ? c : [c]; for (var i = 0; i < d.options.length; i++) { for (var j = 0; j < f.length; j++) { d.options[i].selected |= d.options[i].value == f[j] } } break; case 'select': case 'select-one': d.value = c.toString() || c; break; case 'text': case 'button': case 'textarea': case 'submit': default: c = c == null ? '' : c; d.value = c } } } if (g === undefined) { return this }; var h = jQuery.extend({ phpNaming: true, phpIndices: false, resetForm: true, identifier: 'id', debug: false }, h); if (h.phpIndices) { h.phpNaming = true } var k = []; parseJSON(g); if (h.debug) { _populate = { arr: k, obj: g, elements: [] } } this.each(function () { var a = this.tagName.toLowerCase(); var b = a == 'form' ? populateFormElement : populateElement; if (a == 'form' && h.resetForm) { this.reset() } for (var i in k) { b(this, i, k[i]) } }); return this };
      
      /* add some prototypes */
      String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
      };
      
      String.prototype.toCamelCase = function() {
        return this.replace(/^([A-Z])|\s(\w)/g, function(match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();
        });
      };
      
      String.prototype.toTitleCase = function () {
        return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      };   
      
      commonSvc.SetupForEnvironment();

      // initialize the application
      //domEvents();
      $(document).on('keyup', '#search-text', function (event) {
        if (event.keyCode === 13) {
            $("#search-button").click();
        }
      });

      AWS.config.region = 'us-east-1';      
      
      userSvc.Authenticate();
    }
  }
}
</script>
