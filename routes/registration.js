// export router which defines a single route for handling HTTP GET requests to the '/registration' path
var express = require('express');
var router = express.Router();

/* GET reg. page */
router.get('/',function(req, res, next) { //callback function executed when GET request received
  console.log("isLoggedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) { // checks if req.session.user is undefined
    res.render('pages/registration', { title: 'Darkom | Registration' ,loggedIn:false}) // if undefined, loggedIn set to false, and render registration view using res.render(), passing in the title of the page and loggedIn object as parameters
  } else {
    res.redirect('/'); // if defined redirect to root
  }
});

module.exports = router; //export router
