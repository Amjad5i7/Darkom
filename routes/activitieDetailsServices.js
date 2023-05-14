// export router which defines a single route for handling HTTP GET requests to the '/activity-details-services' path
var express = require('express'); //import express.js 
var router = express.Router(); 
var ServiceSchema = require('../schema/api/services'); // import ServiceSchema from schema/api/services
var UserSchema = require('../schema/api/users'); // import UserSchema from schema/api/users

/* GET activity details page. */
router.get('/',async function(req, res, next) { 
  const serviceId = req.baseUrl.split('/')[2]; // This extracts the serviceId from the URL of the request
  console.log("serviceId",serviceId);
  console.log("isLoggedInActivityDetailsServicesLogSee--->",req.session.user);
  const activityDetails = await ServiceSchema.findOne({ _id: serviceId,isDelete:false }).sort({ _id: -1 }); // query the database using findOne() on ServiceSchema and retrieve what matches criteria. isDelete to exclude deleted documents. sort() to sort results in descending order by  _id
  const providerinfo = await UserSchema.findById({_id:activityDetails.providerId}).exec(); // query database using findById() on UserSchema and retrieve what matches the _id. The _id is extracted from the activityDetails

  // SP profile
  // extract information from providerinfo and store it in local variables
    let providerName = providerinfo.firstName + ' '+ providerinfo.lastName; // concatenated to create the full name
    let providerPic = providerinfo.profilePic;
    let providerBio = providerinfo.bio;
    let providerAddress = providerinfo.address;
    let providerwpLink = providerinfo.wpLink;

  // Activity Details
  // create new activityObj object with properties and values based on activityDetails object
    let activityObj ={
      id:activityDetails._id,
      providerId:activityDetails.providerId,
      providerName:providerName,
      providerPic:providerPic,
      providerBio:providerBio,
      providerAddress:providerAddress,
      providerwpLink:providerwpLink,
      serviceType:activityDetails.serviceType,
      serviceName:activityDetails.serviceName,
      description:activityDetails.description,
      numOfVisitors:activityDetails.numOfVisitors,
      fromDate:activityDetails.fromDate,
      toDate:activityDetails.toDate,
      price:activityDetails.price,
      images:activityDetails.images,
      activities:activityDetails.activities
    }

    console.log("activityObj",activityObj);  // logs activityObj to console
  if (req.session.user == undefined || req.session.user == {}) { // checks if req.session.user is undefined
    res.render('pages/activity-details-services', { title: 'Darkom | Details' ,loggedIn:false,data:activityObj}) // if undefined, loggedIn set to false, and render activity-details-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  } else {
    res.render('pages/activity-details-services', { title: 'Darkom | Details' ,loggedIn:true,data:activityObj}) // if defined, loggedIn set to true, and render activity-details-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  }
});

module.exports = router; //export router