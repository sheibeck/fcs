<template>
  <div class="container mt-2 text-center">
    <div class="row">
      <div class="col-sm-12 h1">
        Password Confirmation
      </div>
      <div class="col-sm-12 h4">
        Confirm your new password by entering your new password and the confirmation code sent to your email address.
      </div>
    </div>
    <div class="row m-4 justify-content-md-center">
      <div class="col-sm-12 col-md-4">
        <div class="form-group">
          <input type="password" class="form-control" id="password" aria-describedby="emailHelp" placeholder="Enter new password">
          <input type="confirmationcode" class="form-control" id="confirmationcode" aria-describedby="emailHelp" placeholder="Enter confirmation code">
        </div>
        <button type="button" class="btn btn-primary col-sm-12 mt-1 mb-1" v-on:click="confirm">
            Update Password <i class="fas fa-sign-in-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";

export default {
  name: 'Recover',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Confirm Recover Password',      
  },
  data () {
    return {
      title: "Recover Password",
      email: this.$route.query.u
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  methods: {
    confirm: function() {
      let commonSvc = new CommonService(this.$root);

      var poolData = {
          UserPoolId : this.$store.state.cognito.poolId, // Your user pool id here
          ClientId : this.$store.state.cognito.clientId // Your client id here
      };

      var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
      var cognitoUser = null;

      if ($('#password').val() == '') {
        commonSvc.Notify('You must enter your new password.');
        return;
      }
      if ($('#confirmationcode').val() == '') {
        commonSvc.Notify('You must enter your confirmation code from your email.');
        return;
      }

      // setup cognitoUser first
      cognitoUser = new AmazonCognitoIdentity.CognitoUser({
         Username: this.$route.query.u,
         Pool: userPool
      });

      cognitoUser.confirmPassword($('#confirmationcode').val(), $('#password').val(), {
        onSuccess: function (result) {
            console.log('Successfully reset password');
            commonSvc.Notify('Your password was successfully reset.', 'success', 2000, function() { location.href = 'login'});
        },
        onFailure: function(err) {
            commonSvc.Notify(err.message || JSON.stringify(err));
        }
      });

      return false;
    }
  }
}
</script>
