
import CommonService from './commonService';

export default class SubService {
  stripe;
  commonSvc;
  userSvc;

  constructor(fcs, commonSvc, userSvc){
    this.fcs = fcs;
    this.stripe = `${process.env.NODE_ENV}` !== "production" ? Stripe('pk_test_11a5BiXqoQRiau0JYwmZ6oLT') : Stripe('pk_live_9lzUOIAo2Vfo3dMmVIyL3wam');
    this.commonSvc = commonSvc;
    this.userSvc = userSvc; 
  }

  async CallLambda(params) {    
    var lambda = new AWS.Lambda();
    lambda.config.credentials = this.fcs.$store.state.credentials;
    return await lambda.invoke(params).promise();
  }

  async GetCustomer(id) { 
    var params = {
      FunctionName: "FCSStripe", 
      Payload: JSON.stringify({         
        environment: this.fcs.$store.state.environment,
        item: "getcustomer",
        id: id,
      }),
     };
        
    const lambdaResult = await this.CallLambda(params);
    const resultObject = JSON.parse(lambdaResult.Payload)

    return resultObject;
  }

  CreateCustomer = async (email) => {
    var lambda = new AWS.Lambda();
    lambda.config.credentials = this.fcs.$store.state.credentials;

    var params = {
      FunctionName: "FCSStripe", 
      Payload: JSON.stringify({         
        environment: this.fcs.$store.state.environment,
        item: "createcustomer",
        email: email,
      }),
    };
        
    const lambdaResult = await this.CallLambda(params);    
    const resultObject = JSON.parse(lambdaResult.Payload)

    return resultObject;
   }

   ManageAccount = async (id) => {

    var lambda = new AWS.Lambda();
    lambda.config.credentials = this.fcs.$store.state.credentials;      

    var params = {
      FunctionName: "FCSStripe", 
      Payload: JSON.stringify({
        environment: this.fcs.$store.state.environment,
        item: "manage",
        id: id,
        redirect: `${window.location.protocol}//${window.location.host}/account`
      }),
    };
        
    const lambdaResult = await this.CallLambda(params);    
    const resultObject = JSON.parse(lambdaResult.Payload)

    return resultObject;
   }

  Checkout = async(pricePlan, customerId) => {    
    var lambda = new AWS.Lambda();    
    lambda.config.credentials = this.fcs.$store.state.credentials;      
      if (!customerId)
      {
        //double check that we really don't have a customer id
        customerId = await this.userSvc.GetUserAttribute("custom:stripe_customer");

        if (!customerId) {
          //once we start to checkout, we need a customer;
          let email = await this.userSvc.GetUserAttribute("email")
          
          let customer = await this.CreateCustomer(email);
          console.log("CREATING CUSTOMER");
          await this.userSvc.SetUserAttribute("custom:stripe_customer", customer.id);
          customerId = customer.id;

          if (!customerId) {
            this.commonSvc.Notify("Cannot find customer id. Please try again.");
            return null;
          }            
        }
      }

      let customerHadTrial = await this.userSvc.GetUserAttribute("custom:stripe_had_trial") ?? 0;      
      
      var params = {
        FunctionName: "FCSStripe", 
        Payload: JSON.stringify({
          environment: this.fcs.$store.state.environment,
          item: "checkout",
          id: customerId,
          pricePlan: pricePlan,
          hadTrial: customerHadTrial,
          success_url: `${window.location.protocol}//${window.location.host}/thankyou`,
          cancel_url: `${window.location.protocol}//${window.location.host}/account`
        }),
      };
          
      const lambdaResult = await this.CallLambda(params);    
      const resultObject = JSON.parse(lambdaResult.Payload)

      if (resultObject.statusCode == 400)
      {
        this.commonSvc.Notify(resultObject.raw.message, "error");

        //NOTE: if we have an issue we can call this to reset the customer_id for stripe
        //might be an one issue at this point.
        //the user has been deleted, unset the stripe_customer
        //await this.userSvc.SetUserAttribute("custom:stripe_customer", "");        
        return;
      }
      
      // When the customer clicks on the button, redirect
      // them to Checkout.
      this.stripe.redirectToCheckout({
        sessionId: resultObject.id
      })
      .then(function (result) {
        if (result.error) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer.
          var displayError = document.getElementById('error-message');
          displayError.textContent = result.error.message;
        }       
      });      
   }   
}
