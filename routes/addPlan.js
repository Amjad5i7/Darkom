// export router which defines a single route for handling HTTP GET requests to the '/add-plan' path
var express = require('express');
var router = express.Router();

/* GET add plan page */
router.get('/',function(req, res, next) { //callback function executed when GET request received
  console.log("isLoggedInAddPlanLogSee--->",req.session.user); 
  if (req.session.user == undefined || req.session.user == {}) { // checks if req.session.user is undefined
    res.redirect('/login') // if undefined, redirect to login page
  } else {
    res.render('pages/add-plan', { title: 'Darkom | Add Plan' ,loggedIn:true,user:req.session.user}) // if defined, loggedIn set to true, and render add-plan view using res.render(), passing in the title of the page, loggedIn and user object as parameters
  }
});

module.exports = router; //export router