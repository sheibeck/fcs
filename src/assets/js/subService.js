
import CommonService from './commonService';

export default class SubService {
  stripe;
  commonSvc;

  constructor(fcs, commonSvc, userSvc){
    this.fcs = fcs;
    this.stripe = Stripe('pk_test_11a5BiXqoQRiau0JYwmZ6oLT');
    this.commonSvc = commonSvc;  
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
        environment: "development",
        item: "getcustomer",
        id: id,
      }),
     };
        
    const lambdaResult = await this.CallLambda(params);
    const resultObject = JSON.parse(lambdaResult.Payload)

    return resultObject;

   /* 
   Response:
{
  "id": "cus_HJEltLkQhdOFKP",
  "object": "customer", 
  "email": "jouctasjaxx@gmail.com",  
  "subscriptions": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/customers/cus_HJEltLkQhdOFKP/subscriptions"
  }
}
*/

  }

  CreateCustomer = async (email) => {
    var lambda = new AWS.Lambda();
    lambda.config.credentials = this.fcs.$store.state.credentials;

    var params = {
      FunctionName: "FCSStripe", 
      Payload: JSON.stringify({         
        environment: "development",
        item: "createcustomer",
        email: email,
      }),
    };
        
    const lambdaResult = await this.CallLambda(params);    
    const resultObject = JSON.parse(lambdaResult.Payload)

    return resultObject;

    //deleted: { id: 'cus_HJ5eBBr4pAwjZV', object: 'customer', deleted: true }
    //not exists: 
    //exists: 

    //success
    /*Response:
      {
        "id": "cus_HJEltLkQhdOFKP",
        "object": "customer",
        "address": null,
        "balance": 0,
        "created": 1589921052,
        "currency": null,
        "default_source": null,
        "delinquent": false,
        "description": "Fate Character Sheet Subscriber",
        "discount": null,
        "email": "jouctasjaxx@gmail.com",
        "invoice_prefix": "B2E0F131",
        "invoice_settings": {
          "custom_fields": null,
          "default_payment_method": null,
          "footer": null
        },
        "livemode": false,
        "metadata": {},
        "name": null,
        "next_invoice_sequence": 1,
        "phone": null,
        "preferred_locales": [],
        "shipping": null,
        "sources": {
          "object": "list",
          "data": [],
          "has_more": false,
          "total_count": 0,
          "url": "/v1/customers/cus_HJEltLkQhdOFKP/sources"
        },
        "subscriptions": {
          "object": "list",
          "data": [],
          "has_more": false,
          "total_count": 0,
          "url": "/v1/customers/cus_HJEltLkQhdOFKP/subscriptions"
        },
        "tax_exempt": "none",
        "tax_ids": {
          "object": "list",
          "data": [],
          "has_more": false,
          "total_count": 0,
          "url": "/v1/customers/cus_HJEltLkQhdOFKP/tax_ids"
        }
      }
      */
   }

   ManageAccount = async (id) => {

    var lambda = new AWS.Lambda();
    lambda.config.credentials = this.fcs.$store.state.credentials;      

    var params = {
      FunctionName: "FCSStripe", 
      Payload: JSON.stringify({
        environment: "development",
        item: "manage",
        customer: id,
      }),
    };
        
    const lambdaResult = await this.CallLambda(params);    
    const resultObject = JSON.parse(lambdaResult.Payload)

    return resultObject;

     //self-service portal in stripe
     // navigate to url
     /*
     Response:
      {
        "id": "bps_1GkcKXAjwMRrxxrcOhWnTPVv",
        "object": "billing_portal.session",
        "created": 1589921189,
        "customer": "cus_HJEltLkQhdOFKP",
        "livemode": false,
        "return_url": "https://fatecharactersheet.com/account",
        "url": "https://billing.stripe.com/session/QXoSNc0B7JuDuYK4fbUJj3bed5L1St1O"
      }*/
   }

   Checkout = async(pricePlan) => {
      //this is from .js so it's ok here.
      var stripe = Stripe('pk_test_11a5BiXqoQRiau0JYwmZ6oLT');
      // When the customer clicks on the button, redirect
      // them to Checkout.
      stripe.redirectToCheckout({
        lineItems: [{price: pricePlan, quantity: 1}],
        mode: 'subscription',
        // Do not rely on the redirect to the successUrl for fulfilling
        // purchases, customers may not always reach the success_url after
        // a successful payment.  
        // Instead use one of the strategies described in
        // https://stripe.com/docs/payments/checkout/fulfillment
        successUrl: `${window.location.host}/success`,
        cancelUrl: `${window.location.host}/cancelled`        
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
