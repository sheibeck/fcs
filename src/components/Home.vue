<template>
<div class="container mt-2">
  <div class="row">
    <div class="col-12 text-center">
    <img class="img-fluid" src="../assets/big-logo.png" alt="Big Logo" />
    </div>
  </div>

  <div class="row">
        <div class="col-sm-6">
          <div class="card m-2">
            <div class="card-body">
              <h5 class="card-title">View Your Fate Characters</h5>
              <p class="card-text">Create and manage all of your fate characters online. You can store and edit as many characters as you want using any of our Fate Character Sheets.</p>
              <a href="character" class="btn btn-primary requires-auth hidden">Play a Fate Character <span class='dice'>C</span></a>
              <a href="login" type="button" class="btn btn-primary requires-noauth">
                  Login to View Your Characters <span class='dice'>C</span>
              </a>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="card card m-2">
            <div class="card-body">
              <h5 class="card-title">View Your Campaigns</h5>
              <p class="card-text">Create and manage a campaign setting. Build your world and start playing!</p>
              <a href="campaign" class="btn btn-primary requires-auth hidden">Play a Campaign <i class="fas fa-globe"></i></a>
              <a href="login" type="button" class="btn btn-primary requires-noauth">
                  Login to View Your Campaigns <i class="fas fa-globe"></i>
              </a>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="card card m-2">
            <div class="card-body">
              <h5 class="card-title">Find a Fate Character Sheet</h5>
              <p class="card-text">Find and print a character sheet for the setting you want. We have form-fillable Fate Core, Fate Accelerated and other setting character sheets.</p>
              <a href="charactersheet" class="btn btn-primary">Find a Character Sheet <span class='dice'>D</span></a>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="card card m-2">
            <div class="card-body">
              <h5 class="card-title">View the Adversary Codex</h5>
              <p class="card-text">View a codex of premade fate adversaries. If you can't find an adversary that you like, you can create your own and share it with the community.</p>
              <a href="adversary" class="btn btn-primary">Fight a Fate Adversary <span class='dice'>A</span></a>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="card card m-2">
            <div class="card-body">
              <h5 class="card-title">Need Some Fate Dice?</h5>
              <p class="card-text">Forgot your dice? Want to keep track of all your session rolls? We've got you covered! Use our fate dice roller to cover your game play needs.</p>
              <a href="#" data-toggle='modal' data-target='#modalDiceRoller' class="btn btn-primary">Roll Fate Dice <span class='dice'>+</span></a>
            </div>
          </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Home',      
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
}
</script>
