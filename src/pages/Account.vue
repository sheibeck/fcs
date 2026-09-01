<template>
  <div class="container mt-2 text-center">
    <div class="row">
      <div class="col-sm-12 h1">
        Your Account
      </div>
      <div class="col-sm-12 h4">
        View and update information about your account
      </div>
    </div>
    <div class="row m-4 justify-content-md-center">
      <div v-if="isAuthenticated">
        <div class="form-group">
          <label>Email address: </label>
          <span>{{GetEmail()}}</span>
        </div>
        <div class="form-group">
          <label>Password: </label>
          <a href='/recover'>
            Change your password
          </a>
        </div>

        <div v-if="loaded && HasSubscription" class="form-group">
          <label>Subscription: </label> <span>{{SubscriptionStatus}}</span>
          <a href="#" v-on:click="GotoManagePortal($event)">[Manage]</a>
        </div>  
       
        <div v-if="loaded" class="d-md-flex justify-content-center">          
          <div class="card col col-md-6">

            <div v-if="HasSubscription" class="card-body">
              <p>You are a subscriber, thank you!</p>
              <div class="alert alert-info" role="alert">
                <strong>Subscriptions are being discontinued.</strong> Your subscription will
                no longer renew, and you won't be charged again. You'll keep your subscriber
                features until the end of your current billing period. You can review or cancel
                anytime using the <strong>[Manage]</strong> link above.
              </div>
              <p>For information about Roll20 integration please visit the
                <a href="https://github.com/sheibeck/fcs/wiki/Fate-of-20" target="_blank">Fate of 20 Page</a>.
              </p>
              <p>For information about Scene Builder please visit the
                <a href="https://github.com/sheibeck/fcs/wiki/Scene-Builder" target="_blank">Scene Builder Page</a>.
              </p>
            </div>

            <div v-if="!HasSubscription" class="card-body">
              <h5 class="card-title">Subscriptions Closed</h5>
              <p class="card-text">
                New subscriptions are no longer available. All of your characters,
                campaigns, and adversaries remain free to create and manage.
              </p>
            </div>
          </div>
        </div>
        <div v-if="loaded && HasSubscription" class="pt-3">
          <button v-if="isAuthenticated" class="btn btn-link" type="button" data-toggle="collapse" data-target="#extension" aria-expanded="true" aria-controls="extension">
              Manual Extension Installation <i class="fas fa-cog"></i>
          </button>
          <div class="pt-2 collapse" id="extension">             
            <p class="small">Open browser extensions and copy the ID of <strong>Fate of 20 extension</strong> here.</p>
            <input type="text" id="devextid" name="devextid" @change="SetExtensionId($event.target.value)" :value="GetExtensionId" /><button type="button" class="ml-1 btn-primary btn-sm btn">save</button>              
          </div>
        </div>
      </div>
    </div>              
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserService from "./../assets/js/userService";
import CommonService from '../assets/js/commonService';
import SubService from '../assets/js/subService';

var userSvc = null;
var commonSvc = null;
var subSvc = null;

export default {
  name: 'Account',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Account',      
  },
  mounted() {
    userSvc = new UserService(this.$root);
    commonSvc = new CommonService(this.$root);
    subSvc = new SubService(this.$root, commonSvc, userSvc);    
    setTimeout( () => {this.loaded = true;}, 2000);
  },   
  data () {
    return {
      title: "Account",
      loaded: false,          
    }
  },  
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId'  
    ]),   
    HasSubscription() {
      return this.$store.state.hasActiveSubscription;
    },
    SubscriptionStatus() {
      return this.$store.state.subscriptionStatus;
    },
    GetExtensionId() {
      return localStorage.getItem('fatecharactersheet_dev_extension_id');
    }
  },
  methods: {
    SetExtensionId(value) {
      return localStorage.setItem('fatecharactersheet_dev_extension_id', value);
    }, 
    GetEmail() {      
      return this.$store.state.userSession.getIdToken().payload['email'];
    },
    GotoManagePortal(e) {
      e.preventDefault();
      userSvc.GetUserAttribute("custom:stripe_customer").then( id => {        
        subSvc.ManageAccount(id).then( account => {
          if (account.url) {
            //let form = document.getElementById("billingPortal");
            //form.action = account.url;
            //form.submit();
            document.location.href = account.url;
          }
          else {
            commonSvc.Notify("Cannot find account management portal. Please try again.", "Error");
          }
        });
      })
    }    
  }
}
</script>


<style lang="scss">

	label {
    font-weight: 700;
  }

</style>
