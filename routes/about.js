// export router which defines a single route for handling HTTP GET requests to the '/about' path
var express = require('express');
var router = express.Router();

/* GET about page. */
router.get('/',function(req, res, next) { //callback function executed when GET request received
  console.log("isLoggedInAboutLogSee--->",req.session.user); 
  if (req.session.user == undefined ) { // checks if req.session.user is undefined
    res.render('pages/about', {title: 'Darkom | About Us',loggedIn:false}) // if undefined, loggedIn set to false, and render about view using res.render(), passing in the title of the page and LoggedIn object as parameters
  } else {
    res.render('pages/about', { title: 'Darkom | About Us',loggedIn:true}) // if defined, loggedIn set to true, and render about view using res.render(), passing in the title of the page and LoggedIn object as parameters
  }
 
});
module.exports = router; //export router