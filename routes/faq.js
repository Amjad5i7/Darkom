// export router which defines a single route for handling HTTP GET requests to the '/faq' path
var express = require('express');
var router = express.Router();

/* GET FAQ page. */
router.get('/',function(req, res, next) { //callback function executed when GET request received
  console.log("isLoggedInFaqLogSee--->",req.session.user); 
  if (req.session.user == undefined ) { // checks if req.session.user is undefined
    res.render('pages/faq', {title: 'Darkom | FAQ',loggedIn:false}) // if undefined, loggedIn set to false, and render faq view using res.render(), passing in the title of the page and loggedIn object as parameters
  } else {
    res.render('pages/faq', { title: 'Darkom | FAQ',loggedIn:true}) // if defined, loggedIn set to true, and render faq view using res.render(), passing in the title of the page and loggedIn object as parameters
  }
 
});
module.exports = router; //export router