// export router which defines a single route for handling HTTP GET requests to the '/activities-services-provider' path
var express = require('express');
var router = express.Router();

/* GET servicies sp page. */
router.get('/',function(req, res, next) { //callback function executed when GET request received
  console.log("isLoggedInuserLogSee--->",req.session.user); 
  if (req.session.user == undefined || req.session.user == {}) { // checks if req.session.user is undefined
    res.render('pages/activities-services-provider', { title: 'Darkom | Activities' ,loggedIn:false}) // if undefined, loggedIn set to false, and render activities-services-provider view using res.render(), passing in the title of the page, loggedIn object as parameters
  } else {
    res.render('pages/activities-services-provider', { title: 'Darkom | Activities' ,loggedIn:true}) // if defined, loggedIn set to true, and render activities-services-provider view using res.render(), passing in the title of the page, loggedIn object as parameters
  }
});

module.exports = router; //export router