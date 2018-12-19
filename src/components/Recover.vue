<template>
  <div class="container mt-2 text-center">
    <div class="row">
      <div class="col-sm-12 h1">
        {{title}}
      </div>
      <div class="col-sm-12 h4">
        Enter your email address, click the Recover Password button, then check your email for a confirmation code.
      </div>
    </div>
    <div class="row m-4 justify-content-md-center">
      <div class="col-sm-12 col-md-4">
        <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email">
        </div>
        <button type="button" class="btn btn-primary col-sm-12 mt-1 mb-1" v-on:click="recover">
            Recover Password <i class="fas fa-sign-in-alt"></i>
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Recover',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Recover Password',      
  },
  data () {
    return {
      title: "Recover Password"
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  methods: {
    recover: function() {
        var poolData = {
            UserPoolId : fatesheet.config.cognito.poolId, // Your user pool id here
            ClientId : fatesheet.config.cognito.clientId // Your client id here
        };

        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var cognitoUser = null;


        if ($('#email').val() == '') {
          fatesheet.notify('You must enter your email address.');
          return;
        }


        // setup cognitoUser first
        cognitoUser = new AmazonCognitoIdentity.CognitoUser({
           Username: $('#email').val(),
           Pool: userPool
        });


        cognitoUser.forgotPassword({
            onSuccess: function (result) {
                console.log('call result: ' + result);
                location.href = 'confirm?u=' + $('#email').val();
            },
            onFailure: function(err) {
                fatesheet.notify(err.message || JSON.stringify(err));
            }
        });

        return false;
    }
  }
}
</script>
