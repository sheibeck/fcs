<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="/">
          <img src='./assets/logo.png' alt="Logo"/>
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
              <li class="nav-item">
                  <a class="nav-link" href="/charactersheet"><span class="dice">D</span>Character Sheets</a>
              </li>
              <li class="hidden nav-item requires-auth">
                  <a class="nav-link" href="/character"><span class="dice">C</span>My Characters</a>
              </li>
              <li class="nav-item">
                  <a class="nav-link" href="/adversary"><span class="dice">A</span>Adversaries</a>
              </li>
              <li class="nav-item dropdown">
                 <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                   <span class="dice">+</span>Fate
                 </a>
                 <div class="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                   <a class="nav-link" target="_blank" href="https://fate-srd.com/"><span class="dice">O</span> Fate SRD</a>
                   <a id="play-fate" class="nav-link" target="_blank" href="https://app.roll20.net/lfg/search/?playingstructured=fate"><img src="./assets/roll20logo.png" alt="Roll20 logo" class="roll-20"> Play Fate</a>
                   <div class="dropdown-divider"></div>
                   <a id="roll-fate" class="nav-link" target="#" href="#" data-toggle='modal' data-target='#modalDiceRoller'><span class="dice">+</span> Roll Dice</a>
                 </div>
              </li>
          </ul>

          <div class="form-inline login-button requires-noauth hidden">
              <button type="button" class="btn btn-primary mr-sm-1 mb-sm-1 mb-md-0 js-login">
                  Login <i class="fas fa-sign-in-alt"></i>
              </button>
          </div>
          <div class="form-inline logout-button mx-1 mb-sm-1 requires-auth hidden">
              <button type="button" class="btn btn-primary mr-sm-1 mb-sm-1 mb-md-0" onclick="fatesheet.logout()">Logout</button>
          </div>
          <div class="form-inline my-2 my-sm-0">
              <div class="input-group">
                <input id="search-text" class="form-control" type="text" placeholder="Search"></input>
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary js-clear-search" type="button"><i class="fa fa-times-circle"></i></button>
                  <button id="search-button" class="btn btn-outline-success" type="button">Search</button>
                </div>
              </div>
          </div>
      </div>
    </nav>

    <router-view></router-view>

    <footer class='footer'>
      <div class="container">
        <div class='row'>
            <div class='col text-muted'>
              <a href='https://github.com/sheibeck/fatecharactersheet/issues' target='_blank'>Report an issue <i class="fa fa-bug"></i></a>
            </div>
            <div class='col text-right text-muted'>
              <a href='https://www.facebook.com/fatecharactersheet' target='_blank'><i class="fab fa-facebook"></i></a>
              <a href='https://plus.google.com/communities/110751336085208780937' target='_blank'><i class="fab fa-google-plus-square"></i></a>
              <a href='https://github.com/sheibeck/fatecharactersheet' target='_blank'><i class="fab fa-github-square"></i></a>
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
export default {
  name: 'App',
  created(){
    fatesheet.init();
  },
  data () {
    return {
      title: "Fate Character Sheet"
    }
  }
}
</script>
