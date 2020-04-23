import CommonService from "./commonService";

export default class UserService {    
  constructor(fcs, commonSvc = new CommonService())
  {
    this.fcs = fcs;
    this.commonSvc = commonSvc;
  }

  Register = (email, password) => {
    var poolData = {
      UserPoolId : this.fcs.$store.state.cognito.poolId, // Your user pool id here
      ClientId : this.fcs.$store.state.cognito.clientId // Your client id here
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : email
    };

    userPool.signUp(email, password, null, null, (err, result) => {
        if (err) {
            this.commonSvc.Notify(err.message || JSON.stringify(err));
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        this.commonSvc.Notify('Successfully registered. Please check your email for a verification link.', 'success', 2000, () => { document.location = 'login' });
    });
  }

  Login = (username, password) => {  
    var authenticationData = {
        Username : username,
        Password : password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = {
        UserPoolId : this.fcs.$store.state.cognito.poolId, // Your user pool id here
        ClientId : this.fcs.$store.state.cognito.clientId // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username : username,
        Pool : userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            console.log('access token + ' + result.getAccessToken().getJwtToken());

            //AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            let credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : this.fcs.$store.state.cognito.identityPool, // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_x9gvO6Gy3' : result.getIdToken().getJwtToken()
                }
            });

            this.fcs.$store.commit("credentials", credentials);
            this.fcs.$store.commit("cognitoUser", cognitoUser);            
            this.SetupAuthorizedUser(result, cognitoUser);

            document.location = 'character';
        },

        onFailure: (err) => {
            this.commonSvc.Notify(err.message || JSON.stringify(err));
        },

    });
  }

  Authenticate = () => {
    // grab an active session
    var poolData = {
        UserPoolId : this.fcs.$store.state.cognito.poolId, // Your user pool id here
        ClientId : this.fcs.$store.state.cognito.clientId // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession( (err, session) => {
          if (err) {
              this.commonSvc.Notify(err.message || JSON.stringify(err));
              return;
          }
          console.log('session validity: ' + session.isValid());

          //AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          let credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId : this.fcs.$store.state.cognito.identityPool, // your identity pool id here
              Logins : {
                  // Change the key below according to the specific region your user pool is in.
                  'cognito-idp.us-east-1.amazonaws.com/us-east-1_x9gvO6Gy3' : session.getIdToken().getJwtToken()
              }
          });

          this.fcs.$store.commit("credentials", credentials);

          this.fcs.$store.state.credentials.refresh((error) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Successfully logged!');

                this.fcs.$store.commit("cognitoUser", cognitoUser);
                this.fcs.$store.commit("userInfo", credentials.identityId);
                this.SetupAuthorizedUser(session);
            }
          });
      });
    }
    else  {
      //get unathenticated user from pool
      let credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId : this.fcs.$store.cognito.identityPool, // your identity pool id here
      });

      this.fcs.$store.commit("credentials", credentials);      

      this.fcs.$store.state.credentials.refresh( (error) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Successfully logged!');
        }

        this.fcs.$store.commit("cognitoUser", cognitoUser);
        this.fcs.$store.commit("userInfo", null);
                
        this.setupUnAuthorizedUser();
      });
    }
  }

  SetupUnAuthorizedUser = () => {    
    this.fcs.$store.commit('authenticate', false);    
    $('.requires-auth').addClass('hidden');
    $('.requires-noauth').removeClass('hidden');
  }

  SetupAuthorizedUser = (response) => {    
    this.fcs.$store.commit('authenticate', true);    
    $('.requires-auth').removeClass('hidden');
    $('.requires-noauth').addClass('hidden');
  }

  Logout = () => {    
    this.fcs.$store.state.cognito.cognitoUser.signOut();
    document.location.href = '/';
  }
}