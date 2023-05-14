// export router which defines a single route for handling HTTP GET requests to the '/services' path
var express = require('express');
var router = express.Router();
var ServiceSchema = require('../schema/api/services');

/* GET services page. */
router.get('/',async function(req, res, next) { // function executed when GET request received
  console.log("isLoggedInServicesLogSee--->",req.session.user);
 
  if (req.session.user == undefined ) { // checks if req.session.user is undefined
    res.render('pages/services', { title: 'Darkom | Services',loggedIn:false,data:{user_type:'user'} ,services:[]}) // if defined render pages/services view using res.render(), passing in the title of the page, loggedIn, data, and services object as parameters
  } else { // if not undefined
    const servicesActivityList = await ServiceSchema.find({ providerId: req.session.user._id,isDelete:false }).sort({ _id: -1 }); // execute asynchronous query to ServiceSchema to find all services where providerId property matches _id of logged-in user. results sorted in descending based on _id
    console.log("servicesActivityList",servicesActivityList) //log servicesActivityList to console
    res.render('pages/services', { title: 'Darkom | Services',loggedIn:true,data:req.session.user,services: servicesActivityList}) // render pages/services view using res.render(), passing in the title of the page, loggedIn, data, and services object as parameters
  }
 
});
module.exports = router; //export router
