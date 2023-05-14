// export router which defines a single route for handling HTTP GET requests to the '/plans-services' path
var express = require('express');
var router = express.Router();
var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');

/* GET plans page. */
router.get('/',async function(req, res, next) {
  console.log("isLoggedInuserLogSee--->",req.session.user);
  const servicesPlanList = await ServiceSchema.find({ serviceType: "plan",isDelete:false }).sort({ _id: -1 });
  let planList=[];
  for (const singlePlan of servicesPlanList) {
    const providerinfo = await UserSchema.findById({_id:singlePlan.providerId}).exec();
    let providerName = providerinfo.firstName + ' '+providerinfo.lastName;
    let providerPic = providerinfo.profilePic;

    // Plans list
    let planObj ={
      id:singlePlan._id,
      providerId:singlePlan.providerId,
      providerName:providerName,
      providerPic:providerPic,
      serviceType:singlePlan.serviceType,
      serviceName:singlePlan.serviceName,
      description:singlePlan.description,
      numOfVisitors:singlePlan.numOfVisitors,
      fromDate:singlePlan.fromDate,
      toDate:singlePlan.toDate,
      price:singlePlan.price,
      images:singlePlan.images,
      activities:singlePlan.activities
    }
    planList.push(planObj); //adds planObj object to the planList array
  }
  console.log("planList",planList)
  if (req.session.user == undefined || req.session.user == {}) {  // checks if req.session.user is undefined
    res.render('pages/plans-services', { title: 'Darkom | Plans' ,loggedIn:false,data:planList}) // if undefined, loggedIn set to false, and render plans-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  } else {
    res.render('pages/plans-services', { title: 'Darkom | Plans' ,loggedIn:true,data:planList}) // if defined, loggedIn set to true, and render plans-services view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  }
});

module.exports = router; //export router