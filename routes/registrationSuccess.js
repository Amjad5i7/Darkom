// export router which defines a single route for handling HTTP GET requests to the '/registrationSuccess' path
var express = require('express');
var router = express.Router();

/* GET reg. success page. */
router.get('/', function(req, res, next) { //callback function executed when GET request received
  res.render('pages/registrationSuccess', { title: 'Darkom | RegistrationSuccess' ,session: req.session}) // callback function renders registrationSuccess view using res.render(), passing in the title of the page and session object as parameters
});

module.exports = router; //export router
