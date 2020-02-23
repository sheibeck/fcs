

/***********************************
  CORE FateCharacterSheet Library
***********************************/

$.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

/* populate function ala Dave Stewart - http://davestewart.io/plugins/jquery/jquery-populate/ */
jQuery.fn.populate = function (g, h) { function parseJSON(a, b) { b = b || ''; if (a == undefined) { } else if (a.constructor == Object) { for (var c in a) { var d = b + (b == '' ? c : '[' + c + ']'); parseJSON(a[c], d) } } else if (a.constructor == Array) { for (var i = 0; i < a.length; i++) { var e = h.useIndices ? i : ''; e = h.phpNaming ? '[' + e + ']' : e; var d = b + e; parseJSON(a[i], d) } } else { if (k[b] == undefined) { k[b] = a } else if (k[b].constructor != Array) { k[b] = [k[b], a] } else { k[b].push(a) } } }; function debug(a) { if (window.console && console.log) { console.log(a) } } function getElementName(a) { if (!h.phpNaming) { a = a.replace(/\[\]$/, '') } return a } function populateElement(a, b, c) { var d = h.identifier == 'id' ? '#' + b : '[' + h.identifier + '="' + b + '"]'; var e = jQuery(d, a); c = c.toString(); c = c == 'null' ? '' : c; e.html(c) } function populateFormElement(a, b, c) { var b = getElementName(b); var d = a[b]; if (d == undefined) { d = jQuery('#' + b, a); if (d) { d.html(c); return true } if (h.debug) { debug('No such element as ' + b) } return false } if (h.debug) { _populate.elements.push(d) } elements = d.type == undefined && d.length ? d : [d]; for (var e = 0; e < elements.length; e++) { var d = elements[e]; if (!d || typeof d == 'undefined' || typeof d == 'function') { continue } switch (d.type || d.tagName) { case 'radio': d.checked = (d.value != '' && c.toString() == d.value); case 'checkbox': var f = c.constructor == Array ? c : [c]; for (var j = 0; j < f.length; j++) { d.checked |= d.value == f[j] } break; case 'select-multiple': var f = c.constructor == Array ? c : [c]; for (var i = 0; i < d.options.length; i++) { for (var j = 0; j < f.length; j++) { d.options[i].selected |= d.options[i].value == f[j] } } break; case 'select': case 'select-one': d.value = c.toString() || c; break; case 'text': case 'button': case 'textarea': case 'submit': default: c = c == null ? '' : c; d.value = c } } } if (g === undefined) { return this }; var h = jQuery.extend({ phpNaming: true, phpIndices: false, resetForm: true, identifier: 'id', debug: false }, h); if (h.phpIndices) { h.phpNaming = true } var k = []; parseJSON(g); if (h.debug) { _populate = { arr: k, obj: g, elements: [] } } this.each(function () { var a = this.tagName.toLowerCase(); var b = a == 'form' ? populateFormElement : populateElement; if (a == 'form' && h.resetForm) { this.reset() } for (var i in k) { b(this, i, k[i]) } }); return this };

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

(function (fatesheet, $, undefined) {


  /***********************************
          CONFIG
  ***********************************/
    fatesheet.config = {
        callback: null,
        content: $('#results'),
        environment: '',
        isAuthenticated: false,
        fbAppId: '189783225112476',
        authorizedUserArn: 'arn:aws:iam::210120940769:role/FateCharacterSheetUser',
        userId: null,
        authProvider: '',
        cognito: {
          poolArn: 'arn:aws:cognito-idp:us-east-1:210120940769:userpool/us-east-1_x9gvO6Gy3',
          poolId: 'us-east-1_x9gvO6Gy3',
          clientId: '4hds760dsd2acikun12bpcljhk',
          identityPool: 'us-east-1:ba495e76-4ecc-4ae5-b116-62ed4dd2a596',
          currentUser: null,
        }
    }

    function configAWS() {
        AWS.config.region = 'us-east-1';
    }

    fatesheet.getDBClient = function() {
      // Create DynamoDB document client
      var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
      docClient.service.config.credentials = fatesheet.config.credentials;

      return docClient;
    }

    /***********************************
            HELPERS METHODS
    ***********************************/
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    // clean out empty objects - used for cleaning adversary  objects
    //https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript/24190282
    fatesheet.removeEmptyObjects = function(obj) {
      $.each(obj, function(key, value){
         if (key === "")
         {
            delete obj[""];
         }
         else {
           if (value === "" || value === null || value === undefined || value === {}){
               delete obj[key];
           } else if (Object.prototype.toString.call(value) === '[object Object]') {
               fatesheet.removeEmptyObjects(value);
           } else if ($.isArray(value)) {
               $.each(value, function (k,v) {
                 if (v === "") {
                   value.splice(k);
                 }
               });
           }
         }
       });
    };

    fatesheet.addNav = function(navBar) {
        /// add nav bars to a character sheet so we know what actions are available
        $('.sheet', fatesheet.config.content).append(fatesheet.config.isAuthenticated ? navBar.auth : navBar.noauth);
        $('.sheet', fatesheet.config.content).wrap('<form></form>')
    }


    fatesheet.generateUUID = function() { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    fatesheet.emptyGuid = function() {
        return "00000000-0000-0000-0000-000000000000";
    }

    fatesheet.generateShortUID = function() {
        // I generate the UID from two parts here
        // to ensure the random number provide enough bits.
        var firstPart = (Math.random() * 46656) | 0;
        var secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        return firstPart + secondPart;
    }

    function sortObject(obj) {
        return Object.keys(obj).sort().reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    }

    fatesheet.slugify = function(text) {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    }

    fatesheet.logAnalyticEvent = function(event) {
    }

    fatesheet.search = function(searchText) {
    	if (location.pathname.indexOf('charactersheets') > -1 || location.pathname.indexOf('character') > -1)
    	{
    		$('.card').hide();

    		// filter by character name and description
    		$(".card-title:contains('" + searchText + "'), .card-note:contains('" + searchText + "'), .card-text:contains('" + searchText + "')", ".card")
    			.parent().show();

    		//account for body text in a card
    		$(".card-title:contains('" + searchText + "'), .card-note:contains('" + searchText + "'), .card-text:contains('" + searchText + "')", ".card-body")
    			.parent().parent().show();

    		// filter by footer content
    		$(".card-footer:contains('" + searchText + "')")
    			.parent().show();
    	}
    	else if (location.pathname.indexOf('adversary') > -1)
    	{
        fcs.$children[0].$children[0].list(searchText); //adversary search
    	}

    }

    fatesheet.notify = function(message, type, timeout, callback) {
      Noty.closeAll();

      if (!type)
      {
        type = 'error';
      }

      if (!timeout) {
        timeout = false;
      }

      new Noty({
          theme: 'metroui',
          type: type,
          timeout: timeout,
          text: message,
          callbacks: {
            onClose: callback || null,
          }
      }).show();
    }


  /***************
    AUTHENTICATION
  ****************/

    fatesheet.register = function(email, password) {
      var poolData = {
        UserPoolId : fatesheet.config.cognito.poolId, // Your user pool id here
        ClientId : fatesheet.config.cognito.clientId // Your client id here
      };

      var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

      var attributeList = [];

      var dataEmail = {
          Name : 'email',
          Value : email
      };

      userPool.signUp(email, password, null, null, function(err, result){
          if (err) {
              fatesheet.notify(err.message || JSON.stringify(err));
              return;
          }
          cognitoUser = result.user;
          console.log('user name is ' + cognitoUser.getUsername());
          fatesheet.notify('Successfully registered. Please check your email for a verification link.', 'success', 2000, function() { document.location = 'login' });
      });
    }

    fatesheet.login = function(username, password)
    {
      var authenticationData = {
          Username : username,
          Password : password,
      };
      var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
      var poolData = {
          UserPoolId : fatesheet.config.cognito.poolId, // Your user pool id here
          ClientId : fatesheet.config.cognito.clientId // Your client id here
      };
      var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
      var userData = {
          Username : username,
          Pool : userPool
      };

      var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
              console.log('access token + ' + result.getAccessToken().getJwtToken());

              //AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              fatesheet.config.credentials = new AWS.CognitoIdentityCredentials({
                  IdentityPoolId : fatesheet.config.cognito.identityPool, // your identity pool id here
                  Logins : {
                      // Change the key below according to the specific region your user pool is in.
                      'cognito-idp.us-east-1.amazonaws.com/us-east-1_x9gvO6Gy3' : result.getIdToken().getJwtToken()
                  }
              });

              fatesheet.config.cognito.cognitoUser = cognitoUser;
              fatesheet.config.userId = fatesheet.config.credentials.identityId; //cognito sub for row based security
              fatesheet.setupAuthorizedUser(result);

              document.location = 'character';
          },

          onFailure: function(err) {
              fatesheet.notify(err.message || JSON.stringify(err));
          },

      });
    }

    function authenticate() {
        // grab an active session
        var poolData = {
            UserPoolId : fatesheet.config.cognito.poolId, // Your user pool id here
            ClientId : fatesheet.config.cognito.clientId // Your client id here
        };
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {
                if (err) {
                    fatesheet.notify(err.message || JSON.stringify(err));
                    return;
                }
                console.log('session validity: ' + session.isValid());

                //AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                fatesheet.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId : fatesheet.config.cognito.identityPool, // your identity pool id here
                    Logins : {
                        // Change the key below according to the specific region your user pool is in.
                        'cognito-idp.us-east-1.amazonaws.com/us-east-1_x9gvO6Gy3' : session.getIdToken().getJwtToken()
                    }
                });

                fatesheet.config.credentials.refresh(function(error){
                  if (error) {
                      console.error(error);
                  } else {
                      console.log('Successfully logged!');

                      fatesheet.config.cognito.cognitoUser = cognitoUser;
                      fatesheet.config.userId = fatesheet.config.credentials.identityId; //cognito sub for row based security
                      fatesheet.setupAuthorizedUser(session);
                  }
                });
            });
        }
        else  {
            //get unathenticated user from pool
            fatesheet.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : fatesheet.config.cognito.identityPool, // your identity pool id here
            });

            fatesheet.config.credentials.refresh(function(error) {
              if (error) {
                  console.error(error);
              } else {
                  console.log('Successfully logged!');
              }

              fatesheet.config.cognito.cognitoUser = null;
              fatesheet.config.userId = null; //cognito sub for row based security
              fatesheet.setupUnAuthorizedUser();
            });
        }

    }

    fatesheet.setupUnAuthorizedUser = function () {
        fatesheet.config.isAuthenticated = false;
        fcs.$store.commit('authenticate', fatesheet.config.isAuthenticated);
        fcs.$store.commit('userInfo', fatesheet.config.userId);

        $('.requires-auth').addClass('hidden');
        $('.requires-noauth').removeClass('hidden');

    }

    fatesheet.setupAuthorizedUser = function (response) {
        fatesheet.config.isAuthenticated = true;
        fcs.$store.commit('authenticate', fatesheet.config.isAuthenticated);
        fcs.$store.commit('userInfo', fatesheet.config.userId);

        $('.requires-auth').removeClass('hidden');
        $('.requires-noauth').addClass('hidden');

    }

    fatesheet.logout = function () {
        fatesheet.config.cognito.cognitoUser.signOut();
        document.location.href = '/';
    };

  /***************
    ENVIRONMENT
  ****************/
    // help out with dev tasks by switching environments up based on the URL
    fatesheet.setupForEnvironment = function (env) {

      switch (env) {
          case 'localhost:8080':
              fatesheet.config.environment = 'develop';
              $('body').prepend('<h1 class="d-print-none">'+ fatesheet.config.environment.toUpperCase() +'</h1>');
              break;

          case 'fatecharactersheet.s3-website-us-east-1.amazonaws.com':
              fatesheet.config.environment = 'beta';
              $('body').prepend('<h1 class="d-print-none">'+ fatesheet.config.environment.toUpperCase() +'</h1>');
              break;

          default:
              fatesheet.config.environment = 'production';
              break;
      }
    }

    fatesheet.setTitle = function(title, page) {
      if (!page) {
        page = 'Fate Character Sheet';
      }
      var newTitle = title + ' - ' + page;
      if (document.title != newTitle) {
          document.title = newTitle;
      }
    }

  /***************
    INITIALIZE
  ****************/
    function domEvents() {

        $(document).on('keyup', '#search-text', function (event) {
            if (event.keyCode === 13) {
                $("#search-button").click();
            }
        });

        $(document).on('click', '.js-clear-search', function (e) {
            $("#search-text").val('');
            $("#search-button").click();
        });

        $(document).on('click', '#search-button', function () {
          var searchText = $('#search-text').val(); // get the value of the input, which we filter on
          fatesheet.search(searchText);
        });

        $(document).on('click', '.js-login', function (e) {
            document.location = '/login';
        });
    }

    fatesheet.init = function () {
      fatesheet.setupForEnvironment(window.location.host);

      // initialize the application
      domEvents();
      configAWS();

      //if we have cached auth credentials then login automatically
      authenticate();
    }

})(window.fatesheet = window.fatesheet || {}, jQuery);
