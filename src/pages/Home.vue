<template>
<div>
  <div v-if="anouncement" class="d-print-none alert alert-danger m-0">
    <a class="close" style="cursor:pointer;" data-dismiss="alert">×</a><span>{{anouncement.title}} <a :href="anouncement.html_url" target="_blank">[more]</a></span>
  </div>
  <div class="container mt-2">  
    <div class="row">
      <div class="col-12 text-center">
        <img class="img-fluid" src="/static/img/big-logo.png" alt="Big Logo" />
      </div>   
    </div>

    <div class="row">
          <div v-if="!isSubscriber && !isAuthenticated" class="col-sm-6">
            <div class="card card m-2">
              <div class="card-body">
                <h5 class="card-title">Get Started for Free</h5>
                <p class="card-text">Register for a free account to create and manage as many Fate characters and campaigns as you want.</p>
                <a href="register" class="btn btn-primary"><span class='dice'>C</span> Create a Free Account</a>
              </div>
            </div>
          </div>
          <div v-if="isSubscriber" class="col-sm-6">
            <div class="card card m-2">
              <div class="card-body">
                <h5 class="card-title">Build Your Scenes &amp; Play Online</h5>
                <p class="card-text">Build scenes for your fate sessions and import your existing characters and adversaries, then play online. Players don't need a subscription to play!</p>
                <a v-if="isAuthenticated" href="scene" type="button" class="btn btn-primary">
                    <i class="fas fa-book-open"></i> Build &amp; Play Online
                </a>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card m-2">
              <div class="card-body">
                <h5 class="card-title">View Your Fate Characters</h5>
                <p class="card-text">Create and manage all of your fate characters online. You can store and edit as many characters as you want using any of our Fate Character Sheets.</p>
                <a href="character" class="btn btn-primary requires-auth hidden"><i class="fas fa-user"></i> Play a Fate Character</a>
                <a href="login" type="button" class="btn btn-primary requires-noauth">
                    <i class="fas fa-user"></i> Login to View Your Characters
                </a>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card card m-2">
              <div class="card-body">
                <h5 class="card-title">View Your Campaigns</h5>
                <p class="card-text">Create and manage multiple campaign settings. Record session notes and share them with your players. Build your world and start playing!</p>
                <a href="campaign" class="btn btn-primary requires-auth hidden"><i class="fas fa-globe-americas"></i> Play a Campaign</a>
                <a href="login" type="button" class="btn btn-primary requires-noauth">
                  <i class="fas fa-globe-americas"></i> Login to View Your Campaigns
                </a>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card card m-2">
              <div class="card-body">
                <h5 class="card-title">Find a Fate Character Sheet</h5>
                <p class="card-text">Find a character sheet for the setting you want. We have form-fillable Fate Core, Fate Accelerated and other setting character sheets.</p>
                <a href="charactersheet" class="btn btn-primary"><span class='dice'>D</span> Find a Character Sheet</a>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card card m-2">
              <div class="card-body">
                <h5 class="card-title">View the Adversary Codex</h5>
                <p class="card-text">View a codex of premade fate adversaries. If you can't find an adversary that you like, you can create your own and share it with the community.</p>
                <a href="adversary" class="btn btn-primary"><span class='dice'>A</span> Build &amp; Play an Adversary</a>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card card m-2">
              <div class="card-body">
                <h5 class="card-title">Need Some Fate Dice?</h5>
                <p class="card-text">Forgot your dice? Want to keep track of all your session rolls? We've got you covered! Use our fate dice roller to cover your game play needs.</p>
                <a href="#" data-toggle='modal' data-target='#modalDiceRoller' class="btn btn-primary"><span class='dice'>+</span> Roll Fate Dice</a>
              </div>
            </div>
          </div>
      </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Home',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Home',      
  },
  mounted() {
    this.fetchAnouncements();
  },
  data () {
    return {
      anouncement: null,
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'isSubscriber'
    ]),
  },
  methods: {
    fetchAnouncements() {
      fetch('https://api.github.com/repos/sheibeck/fcs/issues?labels=anouncement')
        .then(res => res.json())
        .then(data => {          
          if (data.length > 0) {
            this.anouncement = data[0];
          }
        });
    }
  }
}
</script>
