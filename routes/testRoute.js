// export router which defines a single route for handling HTTP GET requests to the '/' path (for testing route)
var express = require('express');
var router = express.Router();

/* test route */
router.post('/', function(req, res, next) { //callback function executed when GET request received
  console.log("objectres",req.body); //log objectres to console.
});

module.exports = router; //export router            