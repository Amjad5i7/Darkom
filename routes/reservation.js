// export router which defines a single route for handling HTTP GET requests to the '/reservation' path
var express = require('express');
var router = express.Router();
var ServiceSchema = require('../schema/api/services');

/* GET reservation page. */
router.get('/',async function(req, res, next) {
  const reservationId = req.baseUrl.split('/')[2];
  console.log("isLoggedInuserLogSee--->",req.session.user);

  // user must be logged in before reservation
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/login', {  title: 'Darkom | Login',loggedIn:false})
  } else {
  const reservationDetails = await ServiceSchema.findOne({ _id: reservationId,isDelete:false }).sort({ _id: -1 });


  // Reservation Details
  // create reservationDetailsObj with properties and values based on reservationDetails object
  let reservationDetailsObj = {
    reservationId:reservationId,
    providerId:reservationDetails.providerId,
    serviceType:reservationDetails.serviceType,
    serviceName:reservationDetails.serviceName,
    description:reservationDetails.description,
    numOfVisitors:reservationDetails.numOfVisitors,
    fromDate:reservationDetails.fromDate,
    toDate:reservationDetails.toDate,
    price:reservationDetails.price,
    visitorId:req.session.user._id,
    firstName:req.session.user.firstName,
    lastName:req.session.user.lastName,
    email:req.session.user.email,
    phoneNumber:req.session.user.phoneNumber,
    dob:req.session.user.dob,
    address:req.session.user.address,
    national_id:req.session.user.national_id
  }
  console.log("reservationDetailsObj",reservationDetailsObj) // logs reservationDetailsObj to console
    res.render('pages/reservation', { title: 'Darkom | Reservation',loggedIn:true,data:reservationDetailsObj}) // render reservation view using res.render(), passing in the title of the page, LoggedIn, and data object as parameters
  }
});

module.exports = router; //export router
