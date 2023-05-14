// export router which defines a single route for handling HTTP GET requests to the '/serviceRegistration' path
var express = require('express');
var router = express.Router();

/* GET reg. sp page. */
router.get('/', function(req, res, next) { //callback function executed when GET request received
  res.render('pages/serviceRegistration', { title: 'Darkom | serviceRegistration',session: req.session }) // renders serviceRegistration view using res.render(), passing in the title of the page and session object as parameters
});

module.exports = router; //export router
