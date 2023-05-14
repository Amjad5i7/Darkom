// export router which defines a single route for handling HTTP GET requests to the '/plan-details-services' path
var express = require('express');
var router = express.Router();

/* GET Plan Details page. */
var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');

router.get('/',async function(req, res, next) { // function executed when GET request received
  const planId = req.baseUrl.split('/')[2]; // This extracts the planId from the URL of the request
  const planDetails = await ServiceSchema.findOne({ _id: planId,isDelete:false }).sort({ _id: -1 }); // query the database using findOne() on ServiceSchema and retrieve what matches criteria. isDelete to exclude deleted documents. sort() to sort results in descending order by  _id
  const providerinfo = await UserSchema.findById({_id:planDetails.providerId}).exec(); // query database using findById() on UserSchema and retrieve what matches the _id. The _id is extracted from the planDetails


  // SP profile
  // extract information from providerinfo and store it in local variables
  let providerName = providerinfo.firstName + ' ' + providerinfo.lastName;
    let providerPic = providerinfo.profilePic;
    let providerBio = providerinfo.bio;
    let providerAddress = providerinfo.address;
    let providerwpLink = providerinfo.wpLink;

    // Plan Details
    // create new planObj object with properties and values based on planDetails object
    let planObj ={
      id:planDetails._id,
      providerId:planDetails.providerId,
      providerName:providerName,
      providerPic:providerPic,
      providerBio:providerBio,
      providerAddress:providerAddress,
      providerwpLink:providerwpLink,
      serviceType:planDetails.serviceType,
      serviceName:planDetails.serviceName,
      description:planDetails.description,
      numOfVisitors:planDetails.numOfVisitors,
      fromDate:planDetails.fromDate,
      toDate:planDetails.toDate,
      price:planDetails.price,
      images:planDetails.images,
      activities:planDetails.activities
    }


    console.log("planObj",planObj);  // logs planObj to console
  console.log("isLoggedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) { // checks if req.session.user is undefined
    res.render('pages/plan-details-services', { title: 'Darkom | Details' ,loggedIn:false,data:planObj}) // if undefined, loggedIn set to false, and render plan-details-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  } else {
    res.render('pages/plan-details-services', { title: 'Darkom | Details' ,loggedIn:true,data:planObj}) // if defined, loggedIn set to true, and render plan-details-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  }
});

module.exports = router; //export router