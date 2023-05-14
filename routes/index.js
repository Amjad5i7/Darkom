// define routes 
// import Node.js modules and schemas
var express = require('express');
var router = express.Router();
var apiService = require('../services/apiService')
var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');
 
router.get('/',async function(req, res, next) { // function executed when GET request received
  // for 4 activities in home page
  const serviceOfActivity = await ServiceSchema.find({ serviceType: "activity",isDelete:false }).sort({ _id: -1 }).limit(4); // query database for up to 4 activities (deleted activities are excluded). Sorts  results in descending order based on _id
      // create activityList array then looping through each object in serviceOfActivity to get service provider information by their ID
  let activityList=[];
  for (const singleServices of serviceOfActivity) {
    const providerinfo = await UserSchema.findById({_id:singleServices.providerId}).exec();
    let providerName = providerinfo.firstName + ' ' + providerinfo.lastName;
    let providerPic = providerinfo.profilePic;
      // create activityObj that contains information about service and service provider's name & profile picture
    let activityObj ={
      id:singleServices._id,
      providerId:singleServices.providerId,
      providerName:providerName,
      providerPic:providerPic,
      serviceType:singleServices.serviceType,
      serviceName:singleServices.serviceName,
      description:singleServices.description,
      numOfVisitors:singleServices.numOfVisitors,
      fromDate:singleServices.fromDate,
      toDate:singleServices.toDate,
      price:singleServices.price,
      images:singleServices.images,
      activities:singleServices.activities
    }
    activityList.push(activityObj); //adds activityObj object to the activityList array
  }
  console.log("activityList",activityList);
  console.log("isLoggedInuserLogSee--->",req.session.user);
    // handle HTTP GET requests
    // renders home page and passes the activityList data to the page.
  if (req.session.user == undefined ) {
    res.render('pages/home', {title: 'Darkom | Home Page',loggedIn:false,homeActivity: activityList}) // if undefined, loggedIn set to false, and render home view using res.render(), passing in the title of the page, loggedIn, and homeActivity object as parameters
  } else {
    res.render('pages/home', { title: 'Darkom | Home Page',loggedIn:true,homeActivity: activityList}) // if defined, loggedIn set to true,  and render home view using res.render(), passing in the title of the page, loggedIn, and homeActivity object as parameters
  }
})

    // renders aboutUs page and passes the user data to the page
router.get('/aboutUs', function(req, res, next) {
  res.render('aboutUs', { title: 'About Us',user: req.session });
});

    // renders faqq page and passes the user data to the page    
router.get('/faqq', function(req, res, next) {
  res.render('faqq', { title: 'FAQ',user: req.session });
});

   // sets user property in session to undefined and redirects user to root URL
router.get('/logout', function(req, res, next) {
  req.session.user = undefined;
  res.redirect('/');
});

    // renders forgot-password-one page, and passes the user data to the page
router.get('/forgot-password-one', function(req, res, next) {
  if (req.session.user == undefined ) {
    res.render('pages/forgot-password-one', { title: ' Darkom | Reset Passward',loggedIn:false,user: req.session.user}) // if undefined, loggedIn set to false, and render forgot-password-one view using res.render(), passing in the title of the page, loggedIn and req.session object as parameters
  } else {
   res.render('pages/forgot-password-one', { title: ' Darkom | Reset Passward',loggedIn:true,user: req.session.user}) // if defined, loggedIn set to true, and render forgot-password-one view using res.render(), passing in the title of the page, loggedIn and req.session object as parameters
  }
});

    // renders forgot-password-two page, and passes the resetId data to the page
router.get('/forgot-password-two/:id', function(req, res, next) {
  const passwordId = req.params.id; // retrieves value of id by the req.params 
  console.log("passwordId",passwordId);
  if (req.session.user == undefined ) { // checks if req.session.user is undefined
    res.render('pages/forgot-password-two', { title: ' Darkom | Reset Passward',loggedIn:false,resetId: passwordId}) // if undefined, loggedIn set to false, and render forgot-password-two view using res.render(), passing in the title of the page, loggedIn and resetId object as parameters
  } else {
   res.render('pages/forgot-password-two', { title: ' Darkom | Reset Passward',loggedIn:true,resetId: passwordId}) // if defined, loggedIn set to true, and render forgot-password-two view using res.render(), passing in the title of the page, loggedIn and resetId object as parameters
  }
});


module.exports = router; //export router
