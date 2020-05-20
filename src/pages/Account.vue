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
       
        <div v-if="loaded && !HasSubscription" class="d-md-flex justify-content-center">          
          <div class="card col col-md-6">
            <div class="card-body">
                <h5 class="card-title">Subscribe to Fate Character Sheet</h5>
                <p class="card-text">
                  Pay a low monthly fee or a get a discounted rate by subscribing yearly 
                  and you gain access to subscriber only benefits.
                </p>
                <ul class="list-unstyled font-weight-bold py-3">
                  <li>Roll20 Integration</li>
                  <li>Coming soon</li>
                </ul>
                <p>
                  <!-- Create a button that your customers click to complete their purchase. Customize the styling to suit your branding. -->
                  <button v-on:click="Subscribe('plan_HJ5iyg7r8S6mN8')"
                    style="background-color:#6772E5;color:#FFF;padding:8px 12px;border:0;border-radius:4px;font-size:1em"
                    id="checkout-button-plan_HJ5iyg7r8S6mN8"
                    role="link"
                  >
                    $2.99 per Month
                  </button>
                </p>
                <p> &mdash; OR &mdash;</p>
                <p>
                  <!-- Create a button that your customers click to complete their purchase. Customize the styling to suit your branding. -->
                  <button v-on:click="Subscribe('plan_HJ5jvo20YLp962')"
                    style="background-color:#6772E5;color:#FFF;padding:8px 12px;border:0;border-radius:4px;font-size:1em"
                    id="checkout-button-plan_HJ5iyg7r8S6mN8"
                    role="link"
                  >
                    $24.99 per Year
                  </button>
                </p>              
              </div>
            </div>
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
      title: 'Login',      
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
    }
  },
  methods: {      
    GetEmail() {      
      return this.$store.state.userSession.getIdToken().payload['email'];
    },
    Subscribe(planItem) {

      userSvc.GetUserAttribute("custom:stripe_customer").then( id => {        
        
            subSvc.Checkout(planItem, id);
                
      })      
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
