// export router which defines a single route for handling HTTP GET requests to the '/servieceproviderprofile' path
var express = require('express');
var router = express.Router();
var apiService = require('../services/apiService');
var UserSchema = require('../schema/api/users');
var ReservationSchema = require('../schema/api/reservation');

/* GET users listing. */
router.get('/', function(req, res, next) {  //callback function executed when GET request received
  res.send('respond with a resource');
});

// define a route for handling HTTP GET requests to the /servieceproviderprofile/profile path
router.get('/profile', async function(req, res, next) {
  if (req.session.user == undefined || req.session.user == {}) { // check if the user is not logged in or the user session is empty 
    res.redirect('/'); // if undefined, redirect to root
  } else {
    let userId = req.session.user._id; // get the user id from the user session
    if ( req.session.user.user_type == 'visitor') { // check if user is a visitor and retrieve their profile and past reservations
      const userProfile = await UserSchema.findById({ _id: userId }); //retrieve user profile from the database using id
      const pastReservation = await ReservationSchema.find({ visitorId: userId }); // retrieve past reservations made by visitor using id
      console.log("userProfile--->",userProfile)
      console.log("pastReservation--->",pastReservation)
      if (!userProfile){
        return res.send('User not found');
      }
      res.render('pages/servieceproviderprofile', { title: 'Darkom | Profile' ,loggedIn:true,data: userProfile,reservation:pastReservation}) // render pages/servieceproviderprofile view using res.render(), passing in the title of the page, loggedIn, data, and reservation object as parameters
      
    } 
    // check if the user is a service provider and retrieve their profile and past reservations
    else if(req.session.user.user_type == 'service_provider') { 
      const userProfile = await UserSchema.findById({ _id: userId });
      const pastReservation = await ReservationSchema.find({ providerId: userId });
      console.log("userProfile--->",userProfile)
      console.log("pastReservation--->",pastReservation)
      if (!userProfile){
        return res.send('User not found');
      }
      res.render('pages/servieceproviderprofile', { title: 'Darkom | Profile' ,loggedIn:true,data: userProfile,reservation:pastReservation})
      
      
    }
   
    
  }
});

module.exports = router; //export router    