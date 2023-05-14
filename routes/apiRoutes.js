'use strict'; //  to catch common coding mistakes and actions with global objects
// import Node.js modules
var express = require('express');
var apiService = require('../services/apiService'); // import a module that provides API functionality
var api = express.Router(); // instance of express.Router to define API routes
const jwtvalidation = require('../middleware/auth.middleware') // middleware function that validates JWTs in HTTP requests
var bodyParser = require('body-parser'); // middleware module that parses the body of incoming HTTP requests into a JSON object
const upload = require('../middleware/uploadServiceImages'); // middleware module that handles file uploads to the server
const { ensureAuthenticated, forwardAuthenticated } = require('../passport-auth'); // middleware functions that implement password authentication
const passport = require('passport'); // module that provides authentication functionality for Node.js and Express.js applications
const uploadPic = require('../middleware/uploadUserImage'); // 

//add middleware functions to handle parsing JSON and url-encoded data in HTTP requests
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: false
}));

// GET default listing
api.get('/', function (req, res, next) {
    res.send('respond with a get method')
  })

// Register API
api.post('/registration', apiService.registration);

// Login API
api.post('/login',forwardAuthenticated, apiService.login);

// User Profile details API
api.post('/getUser', apiService.getUser);

// User edit Profile details API
api.post('/editUserProfile', uploadPic.fields([{name:'profilePic',maxCount:1}]),  apiService.editUserProfile);

// Add service plan or activity API
api.post('/addServices',  upload.fields([{name:'planImages',maxCount:1},{name:'activityImages',maxCount:1}]),  apiService.servicesAddPlan);

// Get Service of plan or activity details by user id
api.post('/getServiceList', apiService.getServiceList);

// Get Service activity details last 4 data
api.post('/getFourActivities', apiService.getFourActivities);

// view activity details data
api.post('/viewActivitydetails', apiService.viewActivitydetails);

// view plan details data
api.post('/viewPlandetails', apiService.viewPlandetails);

// view service provider details data
api.post('/viewServiceProviderProfile', apiService.viewServiceProviderProfile);

// save payment payment data
api.post('/makeReservation', apiService.makeReservation);

// save payment information data
api.post('/addPaymentData', apiService.addPaymentData); // route for handling HTTP POST requests with /addPaymentData, and the addPaymentData function in the apiService that will handle the request
api.post('/getAllActivityDetails', apiService.getAllActivityDetails); // route for handling HTTP POST requests with /getAllActivityDetails, and the getAllActivityDetails function in the apiService that will handle the request
api.post('/deleteServicesPlanOrActivity', apiService.deleteServicesPlanOrActivity); // route for handling HTTP POST requests with /deleteServicesPlanOrActivity, and the addPaymentData function in the apiService that will handle the request
api.post('/successPaymentsendmail', apiService.successPaymentsendmail); // route for handling HTTP POST requests with /successPaymentsendmail, and the successPaymentsendmail function in the apiService that will handle the request
api.post('/testPayment', apiService.testPayment); // route for handling HTTP POST requests with /testPayment, and the testPayment function in the apiService that will handle the request
api.post('/forgotPasswordEmail', apiService.forgotPasswordEmail); // route for handling HTTP POST requests with /forgotPasswordEmail, and the forgotPasswordEmail function in the apiService that will handle the request
api.post('/forgotPasswordReset', apiService.forgotPasswordReset); // route for handling HTTP POST requests with /forgotPasswordReset, and the forgotPasswordReset function in the apiService that will handle the request
api.post('/addAccountDetails', apiService.addAccountDetails); // route for handling HTTP POST requests with /addAccountDetails, and the addAccountDetails function in the apiService that will handle the request

module.exports = api; //export router
