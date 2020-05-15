import CommonService from "./commonService";
import AWS from 'aws-sdk';
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');


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
        this.commonSvc.Notify('Successfully registered. Please check your email for a verification link.', 'success', null, 
          () => { document.location = 'login' });
    });
  }

  Login = (username, password) => {
    //make sure we don't have a cached credential
    if (this.fcs.$store.state.cognito.CognitoUser) {
      this.fcs.$store.state.cognito.CognitoUser.signOut();
    }
    
    let authenticationData = {
        Username : username,
        Password : password,
    };
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    let poolData = {
        UserPoolId : this.fcs.$store.state.cognito.poolId, // Your user pool id here
        ClientId : this.fcs.$store.state.cognito.clientId // Your client id here
    };
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    let userData = {
        Username : username,
        Pool : userPool
    };

    let CognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    CognitoUser.authenticateUser(authenticationDetails, {
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
        this.fcs.$store.commit("CognitoUser", CognitoUser);            
        this.SetupAuthorizedUser(result, CognitoUser);

        document.location = 'character';
      },

      onFailure: (err) => {
          this.commonSvc.Notify(err.message || JSON.stringify(err));
      },
    });
  }

  RefreshSession = async () => {
    if (this.fcs.$store.state.userSession) {
      let refresh_token = this.fcs.$store.state.userSession.refreshToken;
      this.fcs.$store.state.cognito.CognitoUser.refreshSession(refresh_token, async (err, session) => {
        await this.SetupAuthSession(err, session);
      });  
    }
  }

  Authenticate = () => {
    // grab an active session
    let poolData = {
        UserPoolId : this.fcs.$store.state.cognito.poolId, // Your user pool id here
        ClientId : this.fcs.$store.state.cognito.clientId // Your client id here
    };
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    let CognitoUser = userPool.getCurrentUser();

    if (CognitoUser != null) {
      CognitoUser.getSession( (err, session) => {
        this.fcs.$store.commit("CognitoUser", CognitoUser);
        this.SetupAuthSession(err, session);
      });
    }
    else  {
      //get unathenticated user from pool
      let credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId : this.fcs.$store.state.cognito.identityPool, // your identity pool id here
      });

      this.fcs.$store.commit("credentials", credentials);

      this.fcs.$store.state.credentials.refresh( (error) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Refreshed Credentials');
        }

        this.fcs.$store.commit("CognitoUser", CognitoUser);        
        this.fcs.$store.commit("userInfo", "public");
                        
        this.SetupUnAuthorizedUser();
      });
    }
  }

  SetupAuthSession = async(err, session) => {
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

    this.fcs.$store.commit("userSession", session);
    this.fcs.$store.commit("credentials", credentials);
    

    await this.fcs.$store.state.credentials.refresh((error) => {
      if (error) {
          console.error(error);
      } else {
          console.log('Refreshed Credentials');
          
          this.fcs.$store.commit("userInfo", credentials.identityId);
          this.SetupAuthorizedUser(session);
      }
    });
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
    this.fcs.$store.state.credentials.clearCachedId();
    this.fcs.$store.state.cognito.CognitoUser.signOut();
  } 
}