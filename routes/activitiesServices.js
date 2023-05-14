// export router which defines a single route for handling HTTP GET requests to the '/activities-services' path
var express = require('express');
var router = express.Router();
var {getAllActivityDetails} = require('../services/apiService') 
var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');

/* GET activities page. */
router.get('/',async function(req, res, next) {
  console.log("isLoggedInActivityServicesLogSee--->",req.session.user);
  const servicesActivityList = await ServiceSchema.find({ serviceType: "activity",isDelete:false }).sort({ _id: -1 });
  let activityList=[];
  for (const singleServices of servicesActivityList) {
    const providerinfo = await UserSchema.findById({_id:singleServices.providerId}).exec();
    let providerName = providerinfo.firstName + ' '+providerinfo.lastName;
    let providerPic = providerinfo.profilePic;
    
  // Activities list
    let activityObj ={
      id:singleServices._id,
      providerId:singleServices.providerId,
      providerName:providerName,
      providerPic:providerPic,
      serviceType:singleServices.serviceType,
      serviceName:singleServices.serviceName,
      description:singleServices.description,
      numOfVisitors:singleServices.numOfVisitors,
      fromDate:singleServices.fromDate,
      toDate:singleServices.toDate,
      price:singleServices.price,
      images:singleServices.images,
      activities:singleServices.activities
    }
    activityList.push(activityObj); //adds activityObj object to the activityList array
  }


  console.log("activityList",activityList)
  if (req.session.user == undefined || req.session.user == {}) { // checks if req.session.user is undefined
    res.render('pages/activities-services', { title: 'Darkom | Activities' ,loggedIn:false,data:activityList}) // if undefined, loggedIn set to false, and render activities-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  } else {
    res.render('pages/activities-services', { title: 'Darkom | Activities' ,loggedIn:true,data:activityList}) // if defined, loggedIn set to true, and render activities-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  }
});


module.exports = router; //export router