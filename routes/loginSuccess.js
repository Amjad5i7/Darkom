// export router which defines a single route for handling HTTP GET requests to the '/loginSuccess' path
var express = require('express');
var router = express.Router();

/* GET login success page. */
router.get('/', function(req, res, next) { //callback function executed when GET request received
  res.render('pages/loginSuccess', { title: 'Darkom | LoginSuccess' ,session: req.session}) // callback function renders loginSuccess view using res.render(), passing in the title of the page and session object as parameters
});

module.exports = router; //export router
