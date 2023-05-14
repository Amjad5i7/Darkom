'use strict';
var config = require('../config'); // contains API keys and database credentials
var mongo = require('mongodb'); // provides interface for connecting to and interacting with MongoDB databases
var jwt = require('jsonwebtoken'); // provide functionality for creating and verifying JWTs
var fs = require('fs'); // provide file system-related functionality
var UserSchema = require('../schema/api/users');
var PaymentSchema = require('../schema/api/payment');
var ServiceSchema = require('../schema/api/services');
var ReservationSchema = require('../schema/api/reservation');
const bcrypt = require("bcrypt"); // provide password hashing and comparison functionality
var async = require("async"); // provide functionality for executing asynchronous operations in series or parallel
var ApiModels = require('../models/api/apiModel');
var ObjectId = require("mongodb").ObjectId;
const nodemailer = require("nodemailer"); // provides email sending functionality
const passport = require('passport'); // provides authentication middleware
const stripe = require('stripe')(config.secretKey); //imports stripe module and create new instance of stripe object with the application's secret key (stored in config module). Object is used to interact with Stripe API for processing payments.
const crypto = require('crypto'); // provides cryptographic functionality

// creates new transporter object used to send emails.
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    host: 'smtp.gmail.com', 
    port: 465, // for SSL encryption
    secure: true,

    // authentication credentials to be used to login to the email account
    auth: {
        user: 'darkomtourism@gmail.com',
        pass: 'qicnacwteajgyuio',
    },
});

// defines asynchronous function "hashPassword", takes password string as input and returns a hashed version
async function hashPassword(password) {
    return await bcrypt.hash(password, 10); // uses bcrypt to hash the password with a salt factor of 10, and wait hash function to complete before returning result
}

async function validatePassword(plainPassword, hashedPassword) { // takes plain password and a hashed password as input, and returns a boolean if matches or not
    return await bcrypt.compare(plainPassword, hashedPassword); // wait for comparison to complete before returning the result
}


// Register
module.exports.registration = async (req, res, next) => { 
    try { // handle any potential errors that may occur

        if (req.body) { // checks if the request body is not empty or undefined
            const { 
                user_type,
                firstName,
                lastName,
                email,
                phoneNumber,
                dob,
                address,
                national_id,
                password,
                confirm_password,
            } = req.body;

            
            const strongPass = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/; // regular expression that matches any string containing at least one digit, one lowercase letter, one uppercase letter, and has a length of at least 6 characters
            const hashedPassword = await hashPassword(password); // hash password and store the result in hashedPassword

            // Check email format
            const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!mailformat.test(email)) {
                res.json({ success: false, type: "Validation error", message: "Please enter a valid email format." });
            }

            // Check the first name format
            const checkFirstNa = /^[a-zA-Z ]+$/;
            if (!checkFirstNa.test(firstName)) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "First Name can contain only letters.",
                });
            }

            // Check the last name format
            const checkLastNa = /^[a-zA-Z ]+$/;
            if (!checkLastNa.test(lastName)) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "Last Name can contain only letters.",
                });
            }

            // Check the phone number format
            const checkNumber = /^[0-9]+$/;
            if (!checkNumber.test(phoneNumber)) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "Phone number can contain only numbers.",
                });
            }

            // check if user type is false, empty string, null or undefined, it returns a JSON response indicating validation error for "User type is required"
            if (!user_type || user_type == '' || user_type == null || user_type == undefined) {
                res.json({ success: false, type: "Validation error", message: "User type is required." }); 
            // check if firstName is false, empty string, null or undefined, it returns a JSON response indicating validation error for "First Name is required"
            } else if (!firstName || firstName == '' || firstName == null || firstName == undefined) {
                res.json({ success: false, type: "Validation error", message: "First Name is required." });
            // check if lastName is false, empty string, null or undefined, it returns a JSON response indicating validation error for "Last Name is required"           
            } else if (!lastName || lastName == '' || lastName == null || lastName == undefined) {
                res.json({ success: false, type: "Validation error", message: "Last Name is required." });
            // check if email is false, empty string, null or undefined, it returns a JSON response indicating validation error for "Email Name is required"
            } else if (!email || email == '' || email == null || email == undefined) {
                res.json({ success: false, type: "Validation error", message: "Email is required." });
            // check if password is false, empty string, null or undefined, it returns a JSON response indicating validation error for "password Name is required"
            } else if (!password || password == '' || password == null || password == undefined) {
                res.json({ success: false, type: "Validation error", message: "password is required." });
            // check if password length is less than 6 or more than 15, it returns a JSON response indicating validation error for "Password length must be 6 - 15 character"            
            } else if (password.trim().length < 6 || password.trim().length > 15) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "Password length must be 6 - 15 character.",
                });
            // check if strongPass is false, it returns a JSON response indicating validation error for "Passwords must contain at least one Number, one Small and one Capital letter."           
            } else if (!strongPass.test(password)) {
                res.json({ success: false, type: "Validation error", message: "Passwords must contain at least one Number, one Small and one Capital letter.", });
            // check if phoneNumber is false, empty string, null or undefined, it returns a JSON response indicating validation error for "Phone Number is required."
            } else if (!phoneNumber || phoneNumber == '' || phoneNumber == null || phoneNumber == undefined) {
                res.json({ success: false, type: "Validation error", message: "Phone Number is required." });
            // check if dob is false, empty string, null or undefined, it returns a JSON response indicating validation error for "DOB is required."
            } else if (!dob || dob == '' || dob == null || dob == undefined) {
                res.json({ success: false, type: "Validation error", message: "DOB is required." });
            // check if confirm_password is false, empty string, null or undefined, it returns a JSON response indicating validation error for "Confirm password is required."
            } else if (!confirm_password || confirm_password == '' || confirm_password == null || confirm_password == undefined) {
                res.json({ success: false, type: "Validation error", message: "Confirm password is required." });
            // check if password = confirm_password is false, it returns a JSON response indicating validation error for "Password and Confirm password should be same."           
            } else if (password != confirm_password) {
                res.json({ success: false, type: "Validation error", message: "Password and Confirm password should be same." });
            

            } else {
                const emailCheck = await UserSchema.findOne({ email: email }); // check if email already exist
                const phoneCheck = await UserSchema.findOne({ phoneNumber: phoneNumber }); // check if phone number already exist

                if (emailCheck) {
                    res.json({ success: false, type: "Validation error", message: "Email already exists" });
                } else if (phoneCheck) {
                    res.json({ success: false, type: "Validation error", message: "Phone number already exists" });
                } 
                // if both emailCheck and phoneCheck is false create newUser
                else {
                    const newUser = new UserSchema({
                        user_type: user_type,
                        email: email,
                        password: hashedPassword,
                        phoneNumber: phoneNumber,
                        firstName: firstName,
                        lastName: lastName,
                        address: address,
                        dob: dob,
                        national_id: national_id,
                    });
                    
                    const accessToken = jwt.sign({ userId: newUser._id }, "secret-key", { expiresIn: "30d", }); // generates JWT, and signs it with secret-key, token contains user ID and expires after 30 days
                    newUser.accessToken = accessToken; // // assign generated access token to the accessToken of newUser
                    await newUser.save();
                    // sends JSON response to client with success message and newUser details
                    res.json({
                        success: true,
                        message: "Signup successfully..",
                        response_data: newUser,
                    });
                }
            }


         // if something wrong with details
        } else {
            return res.json({ success: false, message: "Something wrong with details", response_data: {}, });
        }

        // if something wrong with request
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with request.", response_data: err, })
    }

};



// Login
module.exports.login = async (req, res, next) => { // takes req, res, and next as parameters
    try { // handle any potential errors that may occur

        const { email, password, user_type } = req.body;
        // check if user_type is false, empty string, null or undefined, it returns a JSON response indicating validation error for "User type is required."
        if (!user_type || user_type == '' || user_type == null || user_type == undefined) {
            res.json({ success: false, type: "Validation error", message: "User type is required." });
        }
        // check if email is false, empty string, null or undefined, it returns a JSON response indicating validation error for "Email is required."        
        if (!email || email == '' || email == null || email == undefined) {
            res.json({ success: false, type: "Validation error", message: "Email is required." });
        }
        // check if password is false, empty string, null or undefined, it returns a JSON response indicating validation error for "Password is required."        
        if (!password || password == '' || password == null || password == undefined) {
            res.json({ success: false, type: "Validation error", message: "Password is required." });
        }


        const user = await UserSchema.findOne({ email }); // check if email exist
        console.log("user", user.user_type)
        // if does not exist return message 'Email does not exist'
        if (!user) return next(res.send({
            success: false,
            message: 'Email does not exist',
            response_data: {}
        }));

        // if deleted return message 'Your account has been deleted'
        if (user.isDelete == true) return next(res.send({
            success: false,
            message: 'Your account has been deleted',
            response_data: {}
        }));

        // if user user_type = user_type is false, return message 'Please use a valid user type'
        if (user.user_type != user_type) return next(res.send({
            success: false,
            message: 'Please use a valid user type',
            response_data: {}
        }));

        // check if password matches user password
        const validPassword = await validatePassword(password, user.password);
        // if does not match, return message "Password is not correct"
        if (!validPassword) return next(res.send({
            success: false,
            message: 'Password is not correct',
            response_data: {}
        }));

        // generates access token for user with userId and secret-key for signing. Token expires after 30 days
        const accessToken = jwt.sign({ userId: user._id }, "secret-key", {
            expiresIn: "30d"
        });
        await UserSchema.findByIdAndUpdate(user._id, { accessToken }) // token stored in user record in database using findByIdAndUpdate

        //set user on session object and sends a response with a "Login successfully." message and user's data
        req.session.user = user;
        res.json({
            success: true,
            message: "Login successfully.",
            response_data: { _id: user._id, email: user?.email, dob: user?.dob, address: user?.address, user_type: user?.user_type, accessToken: accessToken, firstName: user?.firstName, lastName: user?.lastName, phoneNumber: user.phoneNumber, national_id: user.national_id, isDelete: user?.isDelete },
        })

        // if something wrong with request
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with request.", response_data: err, })
    }

};


// Retrieved User Data
module.exports.getUser = async (req, res) => { // export async function that retrieves user data and renders a view with the retrieved data when requested
    try { // handle any potential errors that may occur
        // find a user by userId 
        const userId = req.body.userId; 
        if (!ObjectId.isValid(userId)) return res.json({ success: false, message: "Invalid id" }) // if userId is invalid, it returns "Invalid id" message.
        const user = await UserSchema.findOne({ _id: userId }); 
        // if user is not found, it returns 'User not found' message
        if (!user)
            res.send('User not found'); 

        // If user found, render 'servieceproviderprofile' view with user data
        res.render('pages/servieceproviderprofile', {
            title: 'Darkom | Profile',
            data: user
        })

     // if there was an error while retrieving, it sends "something went wrong" message  
    } catch (error) {
        console.log("something went wrong");
        res.send("something went wrong");
    }
};


// User Profile Updates
module.exports.editUserProfile = async (req, res, next) => {
    // retrieve userId and uploadedFiles
    try {
        const userId = req.body.id;
        var uploadFiles = req.files;
        console.log("uploadFiles===========", uploadFiles);

        // find user by id
        const userData = await UserSchema.findById(userId);
        console.log("userData===========", userData); 
        var obj = {}; // creates empty object that will be used to update user data
        

        // check request body for updates to user data and any uploaded profile pictures
        // if user data or profile picture is found, update 'obj' with new data
        if (req.body.fullName) {
            const fullName = req.body.fullName; 
            obj.firstName = fullName.split(" ")[0]
            obj.lastName = fullName.split(" ")[1]
        }
        if (req.body.phoneNumber) {
            obj.phoneNumber = req.body.phoneNumber
        }
        if (req.body.dob) {
            obj.dob = req.body.dob
        }
        if (req.body.address) {
            obj.address = req.body.address
        }
        if (req.body.national_id) {
            obj.national_id = req.body.national_id
        }
        if (req.body.wpLink) {
            obj.wpLink = req.body.wpLink
        }
        if (req.body.bio) {
            obj.bio = req.body.bio
        }
        if (uploadFiles.profilePic) {
            const ProfilePic = uploadFiles.profilePic
                ? uploadFiles.profilePic.length > 0
                    ? config.localhost +
                    "/user_profile_pic/" +
                    uploadFiles.profilePic[0].filename
                    : ""
                : false;
            obj.profilePic = ProfilePic
        }
        console.log("req.body.==========    ", req.body);


        // update the user data with 'obj' and retrieve updated user data
        // then returns "User profile updated successfully.." message with updated user data
        const updateData = await UserSchema.findByIdAndUpdate(userId, obj, {
            new: true
        });
        const getUserData = await UserSchema.findById(userId);
        res.json({
            success: true,
            message: "User profile updated successfully..",
            response_data: getUserData,
        })
       // If there is error, it returns `Could not upload the file` message
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: `Could not upload the file`,
        });
    }
}


// Add plan
module.exports.servicesAddPlan = async (req, res, next) => {
    const serviceFile = req.files;
    const postData = req.body;
    // object with "success" initially set to false and "message" initially set to an empty string
    let errors = {
        success: false,
        message: "",
    };

    try {  // handle any potential errors that may occur

        // checks if the property in postData is empty, set error message in the errors object, returns the error messageresponse with a JSON object
        if (postData.providerId == "") {
            errors.message = "Provider Id is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.serviceType == "") { 
            errors.message = "Service type is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.serviceName == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.description == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.numOfVisitors == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.fromDate == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.toDate == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.price == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }

        // check if serviceFile has planImages or activityImages, set planImage or activityImage to a string containing the file path of the first file uploaded for that property, false if there were no files uploaded
        const planImage = serviceFile.planImages
            ? serviceFile.planImages.length > 0
                ? config.localhost +
                "/service-files/" +
                serviceFile.planImages[0].filename
                : false
            : false;
        const activityImage = serviceFile.activityImages
            ? serviceFile.activityImages.length > 0
                ? config.localhost +
                "/service-files/" +
                serviceFile.activityImages[0].filename
                : false
            : false;

        // search in UserSchema for a user with _id matching providerId in postData, if none found, returns JSON response with an error message
        const userIdCheck = await UserSchema.findOne({ _id: postData.providerId });
        if (!userIdCheck) {
            return res.json({ success: false, message: "Please provide a valid provider id", })
        }

        // search in UserSchema for a user with _id matching the providerId
        const userCheck = await UserSchema.findOne({ _id: postData.providerId }, 'user_type');
        // check if user_type does not match "service_provider", if it does not match, returns JSON response with success field set to false and  "You are not allowed to create services." message
        if (userCheck.user_type != "service_provider") {
            return res.json({ success: false, message: "You are not allowed to create services.", })

        } 

        // if user_type matches "service_provider"
        else if (userCheck.user_type == "service_provider") {
            if (postData.serviceType == "plan") {
                
                //if serviceType = "plan"
                const newServices = new ServiceSchema({
                    providerId: postData.providerId,
                    serviceType: postData.serviceType,
                    serviceName: postData.serviceName,
                    description: postData.description,
                    numOfVisitors: postData.numOfVisitors,
                    fromDate: postData.fromDate,
                    toDate: postData.toDate,
                    price: postData.price,
                    images: planImage,
                    activities: postData.activities,
                })
                newServices.save();
                res.json({
                    success: true,
                    message: "Plan added successfully..",
                    response_data: newServices,
                });

                // if serviceType = "activity"
            } else if (postData.serviceType == "activity") {
                const newServices = new ServiceSchema({
                    providerId: postData.providerId,
                    serviceType: postData.serviceType,
                    serviceName: postData.serviceName,
                    description: postData.description,
                    numOfVisitors: postData.numOfVisitors,
                    fromDate: postData.fromDate,
                    toDate: postData.toDate,
                    price: postData.price,
                    images: activityImage,
                })
                newServices.save();
                res.json({
                    success: true,
                    message: "Activity added successfully..",
                    response_data: newServices,
                });

                // if neither, return JSON response with  "Service Type should be plan or activity .." message
            } else {
                res.json({
                    success: false,
                    message: "Service Type should be plan or activity ..",
                });
            }

        } 
        // if user_type does not matches "service_provider"
        else {
            errors.message = "Error in add new service data.";
            res.status(200).json(errors);
            return;
        }

    } catch (e) {
        console.log("e", e)
        errors.message = e.message;
        res.status(200).json(errors);
        return;
    }
};


// Get list of services provided by service providers
module.exports.getServiceList = async (req, res, next) => {
    let errors = {
        success: false,
        message: "",
    };
    try {
        const userId = req.body.Id; // get userId from the request body

        // check if userId is false or empty string, null, or undefined, and return JSON response "User Id is required."
        if (!userId || userId == '' || userId == null || userId == undefined) {
            res.json({ success: false, type: "Validation error", message: "User Id is required." });
        }
        // check if userId is valid MongoDB ObjectId, if not, return JSON response "Invalid id"
        if (!ObjectId.isValid(userId)) return res.json({ success: false, message: "Invalid id" })
        // find user with specified userId
        const user = await UserSchema.findById(userId);
        // if no user found, return JSON response "User does not exists .."
        if (!user) { 
            res.json({
                success: false,
                message: "User does not exists ..",
            });
        }

        // find all services with where providerId matches userId
        const getData = await ServiceSchema.find({ providerId: userId });
        if (getData) {
            // if found
            res.status(200).json({
                success: true,
                message: "Fetch User service details successfully..",
                response_data: getData,
            });
            // if not found
        } else {
            res.json({
                success: false,
                message: "No data found..",
            });
        }
    } catch (error) {
        console.log("e", error)
        errors.message = error.message;
        res.status(200).json(errors);
        return;
    }
};

// Last four activities to be displayed in home page
module.exports.getFourActivities = async (req, res) => {
    try {
        // query the database for 4 activities that have the service type "activity" and sorts them by ID in descending order, then assigns them to serviceOfActivity
        const serviceOfActivity = await ServiceSchema.find({ serviceType: "activity" }).sort({ _id: -1 }).limit(4);
        // check if serviceOfActivity is false, returns JSON response with a success value of false, "INTERNAL DB ERROR." message, and empty response data object
        if (!serviceOfActivity) { 
            return res.json({ success: false, message: "INTERNAL DB ERROR.", response_data: {}, })
        }
        // successful, returns JSON response with a success value of true, "Get activity details." message, and serviceOfActivity data object
        else {
            return res.json({ success: true, message: "Get activity details.", response_data: serviceOfActivity, })
        }

             // if there was an error while retrieving, it sends "something went wrong" message 
    } catch (error) {
        console.log("something went wrong");
        res.send("something went wrong");
    }
};

// Activity Details
module.exports.viewActivitydetails = async (req, res) => {
    try { // handle any potential errors that may occur
        const activityDetailsId = req.body.activityId; //get activityId from request body
        
        // checks if activityDetailsId does not exists, is empty, is null, and is undefined, a response is sent back with "Activity Id is required." message
        if (!activityDetailsId || activityDetailsId == '' || activityDetailsId == null || activityDetailsId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Activity Id is required." });
        }

        // checks if activityDetailsId is not valid object Id, a response is sent back with "Invalid id" message
        if (!ObjectId.isValid(activityDetailsId)) return res.json({ success: false, message: "Invalid id" })
        const activityCheck = await ServiceSchema.findOne({ _id: activityDetailsId }, 'serviceType'); // search for activity with given Id in ServiceSchema and retrieves only serviceType

        // checks if activityCheck has serviceType equal to "activity", if not, a response is sent back with "Please provide a valid activity id." message
        if (activityCheck.serviceType != "activity") {
            return res.json({ success: false, message: "Please provide a valid activity id.", response_data: {}, })
        // if  activityCheck is not found, a response is sent back with "No data found." message
        } else if (!activityCheck) {
            return res.json({ success: false, message: "No data found.", response_data: {}, })
        // if activityCheck is found and has a serviceType of "activity", a response is sent back with "view activity details." message and the activity details
        } else {
            return res.json({ success: true, message: "view activity details.", response_data: activityCheck, })
        }
    
        // if there was an error while retrieving, it sends "something went wrong" message 
    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};

// Plan Details
module.exports.viewPlandetails = async (req, res) => {
    try {
        // extract plan id from request body and checks if it is valid, if not valid, it sends validation error response
        const planDetailsId = req.body.planId;
        if (!planDetailsId || planDetailsId == '' || planDetailsId == null || planDetailsId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Plan Id is required." });
        }
        // check if plan id is a valid ObjectId, if not, send error response
        if (!ObjectId.isValid(planDetailsId)) return res.json({ success: false, message: "Invalid id" })
        // query ServiceSchema to find plan that matches given id and returns specified fields
        const planCheck = await ServiceSchema.findOne({ _id: planDetailsId }, 'serviceType providerId serviceName description numOfVisitors fromDate toDate price images activities');
        // query UserSchema to find user that matches providerId of plan and returns their first name, last name, and email
        const userName = await UserSchema.findOne({ _id: planCheck.providerId }, 'firstName lastName email');
        // create new object that includes plan details, as well as the provider name and email
        const obj = {
            _id: planCheck._id,
            providerId: planCheck?.providerId,
            providerEmail: userName ? userName?.email : "",
            providerName: userName ? userName?.firstName + " " + userName?.lastName : "",
            serviceType: planCheck?.serviceType ? planCheck?.serviceType : "",
            serviceName: planCheck?.serviceName ? planCheck?.serviceName : "",
            description: planCheck?.description ? planCheck?.description : "",
            numOfVisitors: planCheck?.numOfVisitors ? planCheck?.numOfVisitors : 0,
            fromDate: planCheck?.fromDate ? planCheck?.fromDate : "",
            toDate: planCheck?.toDate ? planCheck?.toDate : "",
            price: planCheck?.price ? planCheck?.price : 0,
            images: planCheck?.images ? planCheck?.images : "",
            activities: planCheck?.activities ? planCheck?.activities : [],
            isDelete: planCheck?.isDelete ? planCheck?.isDelete : false,
        }
        // check if retrieved plan is valid and send appropriate response.
        if (planCheck.serviceType != "plan") {
            return res.json({ success: false, message: "Please provide a valid plan id.", response_data: {}, })
        } else if (!planCheck) {
            return res.json({ success: false, message: "No data found.", response_data: {}, })
        } else {
            return res.json({ success: true, message: "view plan details.", response_data: obj, })
        }

        // if there was an error while retrieving, it sends "something went wrong" message 
    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};


// Service Provider Profile
module.exports.viewServiceProviderProfile = async (req, res) => {
    try {
        const serviceProviderId = req.body.providerId; // extract providerId from the request body
        // check whether serviceProviderId is false, an empty string, null, or undefined, and sends an error response if it is
        if (!serviceProviderId || serviceProviderId == '' || serviceProviderId == null || serviceProviderId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Service Provider Id is required." });
        }
        // check serviceProviderId is a valid MongoDB ObjectId and sends an error response if it isn't
        if (!ObjectId.isValid(serviceProviderId)) return res.json({ success: false, message: "Invalid id" })

        // query UserSchema for user with _id matching serviceProviderId and select specified fields to be returned
        const userCheck = await UserSchema.findOne({ _id: serviceProviderId }, { firstName: 1, lastName: 1, email: 1, user_type: 1, phoneNumber: 1, dob: 1, address: 1, national_id: 1, isDelete: 1, });
        console.log("userCheck", userCheck) // log userCheck to console for debugging purposes

        // create object called obj contains selected fields from userCheck
        const obj = {
            _id: userCheck?._id,
            user_type: userCheck?.user_type ? userCheck?.user_type : "",
            email: userCheck?.email ? userCheck?.email : "",
            fullName: userCheck ? userCheck?.firstName + " " + userCheck?.lastName : "",
            lastName: userCheck?.lastName ? userCheck?.lastName : "",
            phoneNumber: userCheck?.phoneNumber ? userCheck?.phoneNumber : "",
            dob: userCheck?.dob ? userCheck?.dob : "",
            address: userCheck?.address ? userCheck?.address : "",
            national_id: userCheck?.national_id ? userCheck?.national_id : "",
            isDelete: userCheck?.isDelete ? userCheck?.isDelete : false,
        }
        // checks whether userCheck has user_type that equals "service_provider". 
        if (userCheck.user_type != "service_provider") {
            return res.json({ success: false, message: "Please provide a valid provider id.", response_data: {}, }) // if it doesn't, sends an error response
        } else if (!userCheck) {
            return res.json({ success: false, message: "No data found.", response_data: {}, }) // if false, sends a "No data found" response
        } else {
            return res.json({ success: true, message: "view service provider details.", response_data: obj, }) // sends a success response that includes obj 
        }

    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};


// Service Provider Payment Data
module.exports.addPaymentData = async (req, res, next) => {
    const postData = req.body;
    let errors = {
        success: false,
        message: "",
    };
    try {
        // check if "userId" is an empty string, assigns an error message to the "errors" object and sends a JSON response to the user
        if (postData.userId == "") {
            errors.message = "User Id is required";
            res.status(200).json(errors);
            return; // exits the function and prevents further execution of the code
        }

        // check if "accountOwnerName" is an empty string, assigns an error message to the "errors" object and sends a JSON response to the user
        if (postData.accountOwnerName == "") {
            errors.message = "Account Owner name is required";
            res.status(200).json(errors);
            return;
        }

        // check if "accountNumberOrIBAN" is an empty string, assigns an error message to the "errors" object and sends a JSON response to the user
        if (postData.accountNumberOrIBAN == "") {
            errors.message = "Account number or IBAN is required";
            res.status(200).json(errors);
            return;
        }

        //  query "UserSchema" to find a user with the specified "userId". If no used found, an error response is sent to the user
        const userIdCheck = await UserSchema.findOne({ _id: postData.userId })
        if (!userIdCheck) {
            return res.json({ success: false, message: "No data found! Please provide a valid id", response_data: {}, })
        }

        // create new document in "PaymentSchema" model using data from the "postData" object and save it to the database
        const newPaymentData = new PaymentSchema({
            userId: postData.userId,
            accountOwnerName: postData.accountOwnerName,
            accountNumberOrIBAN: postData.accountNumberOrIBAN
        })
        newPaymentData.save();
 
        // sends JSON response to user indicating that payment data was successfully added to database
        res.json({
            success: true,
            message: "Payment data added successfully..",
            response_data: newPaymentData,
        });

        // catches any errors that occurred during execution
    } catch (e) {
        console.log("e", e)
        errors.message = e.message;
        res.status(200).json(errors);
        return;
    }
};

module.exports.getFourActivitiesHome = async (req, res) => {
    try {
        console.log("userLogSee--->",req.session.user);
        const serviceOfActivity = await ServiceSchema.find({ serviceType: "activity" }).sort({ _id: -1 }).limit(4);
        if (!serviceOfActivity) {
            return res.json({ success: false, message: "INTERNAL DB ERROR.", response_data: {}, })
        }
        res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page', baseUrl: req.baseUrl, homeActivity: serviceOfActivity})
        
    } catch (error) {
        console.log("something went wrong");
        res.send("something went wrong");
    }
};


module.exports.getAllPlanDetails = async (req, res, next) => {
    let errors = {
        success: false,
        message: "",
    };
    try {
            let getList = [];
            const serviceOfPlan = await ServiceSchema.find({ serviceType: "plan" }).sort({ _id: -1 });

            // loop iterates over the serviceOfPlan array to get all plans
            for (const providersPlan of serviceOfPlan) {
                const userInfo = await this.getUserById(providersPlan.providerId);
                const getObj = {
                    planId: providersPlan?._id,
                    providerName: providersPlan ? userInfo?.firstName + " " + userInfo.lastName : "",
                    providerImage: providersPlan ? userInfo?.profilePic : "",
                    providerId: providersPlan?.providerId ? providersPlan?.providerId : "",
                    serviceType: providersPlan?.serviceType ? providersPlan?.serviceType : "",
                    serviceName: providersPlan?.serviceName ? providersPlan?.serviceName : "",
                    description: providersPlan?.description ? providersPlan?.description : "",
                    numOfVisitors: providersPlan?.numOfVisitors ? providersPlan?.numOfVisitors : 0,
                    fromDate: providersPlan?.fromDate ? providersPlan?.fromDate : "",
                    toDate: providersPlan?.toDate ? providersPlan?.toDate : "",
                    price: providersPlan?.price ? providersPlan?.price : 0,
                    images: providersPlan?.images ? providersPlan?.images : "",
                    activities: providersPlan?.activities ? providersPlan?.activities : [],
                    isDelete: providersPlan?.isDelete ? providersPlan?.isDelete : false,
                };
                getList.push(getObj);
            }
            if (getList.length > 0) {
                return res.send({ status: true, message: "Fetch all plan List", response_data: getList });
            } else {
                res.send({ status: false, message: "No Data Found" });
                return;
            }
    } catch (error) {
        console.log("e", error)
        errors.message = error.message;
        res.status(200).json(errors);
        return;
    }
};


exports.getUserById = (_id) => {
    let query = { _id };
    return UserSchema.findById(query).exec();
};

// All activities
module.exports.getAllActivityDetails = async (req, res, next) => {
    let errors = {
        success: false,
        message: "",
    };
    try {
            let getList = []; // declares empty array called getLis
            const serviceOfPlan = await ServiceSchema.find({ serviceType: "activity" }).sort({ _id: -1 }); // finds all the services in ServiceSchema where serviceType = "activity", sorts results in descending order based on _id

            // loop iterates over the serviceOfPlan array to get all activities
            for (const providersPlan of serviceOfPlan) {
                const userInfo = await this.getUserById(providersPlan.providerId);
                const getObj = {
                    planId: providersPlan?._id,
                    providerName: providersPlan ? userInfo?.firstName + " " + userInfo.lastName : "",
                    providerImage: providersPlan ? userInfo?.profilePic : "",
                    providerId: providersPlan?.providerId ? providersPlan?.providerId : "",
                    serviceType: providersPlan?.serviceType ? providersPlan?.serviceType : "",
                    serviceName: providersPlan?.serviceName ? providersPlan?.serviceName : "",
                    description: providersPlan?.description ? providersPlan?.description : "",
                    numOfVisitors: providersPlan?.numOfVisitors ? providersPlan?.numOfVisitors : 0,
                    fromDate: providersPlan?.fromDate ? providersPlan?.fromDate : "",
                    toDate: providersPlan?.toDate ? providersPlan?.toDate : "",
                    price: providersPlan?.price ? providersPlan?.price : 0,
                    images: providersPlan?.images ? providersPlan?.images : "",
                    isDelete: providersPlan?.isDelete ? providersPlan?.isDelete : false,
                };
                getList.push(getObj); // pushes getObj object into getList array
            }
            if (getList.length > 0) {
                return res.send({ status: true, message: "Fetch all activity List", response_data: getList });
            } else {
                res.send({ status: false, message: "No Data Found" });
                return;
            }
    } catch (error) {
        console.log("e", error)
        errors.message = error.message;
        res.status(200).json(errors);
        return;
    }
};


module.exports.deleteServicesPlanOrActivity = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        // check if the service ID is present and valid. If not, it sends a JSON response with a validation error message
        if (!serviceId || serviceId == '' || serviceId == null || serviceId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Service Id is required." });
        }
        // check if the service ID is a valid MongoDB object ID. If not, it sends a JSON response with an "Invalid id" error message
        if (!ObjectId.isValid(serviceId)) return res.json({ success: false, message: "Invalid id" })

        // query the database to check if the service ID exists and whether it has already been marked as deleted
        const isServiceIdCheck = await ServiceSchema.findOne({ _id: serviceId },'isDelete');
        // checks query and determines whether plan or activity has already been marked as deleted or not
        if(!isServiceIdCheck){
            return res.json({ success: false, message: "Please provide a valid service id.", response_data: {}, }) // if service ID not found in database, it sends a JSON response with an error message indicating that the ID is invalid
        } else if(isServiceIdCheck.isDelete == true){ // If it has, it sends a JSON response with a "service already deleted" error message
            return res.json({ success: false, message: "Your service was already deleted.", response_data: {}, })
        } else {
            // If not, marks it as deleted in database and sends a JSON response indicating success
            const isServiceCheck = await ServiceSchema.updateOne({ _id: serviceId }, { isDelete: true });
            return res.json({ success: true, message: "Service deleted successfully", response_data: isServiceCheck, })
        }
    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};


module.exports.successPaymentsendmail = async (req, res, next) => {
    try {
        const emailData = req.body.email;
        if (!emailData || emailData == '' || emailData == null || emailData == undefined) {
            res.json({ success: false, type: "Validation error", message: "Email is required." });
        }
        //Email Verification
        const sendUserData = await UserSchema.findOne(
            { email: emailData },
            "_id firstName lastName email"
        );
        if (sendUserData) {
            let currYear = moment().format("YYYY");
            var name = sendUserData.firstName + " " + sendUserData.lastName;

            let mailOptions = {
                from: "sDarkom@gmail.com",
                to: sendUserData.email,
                subject: "Your Reservation Details !!! ",
                html:
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="70%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img style="height:100px" src="" alt="Darkom Logo" title="" border=0;/></td></tr><tr><td valign="top" style="padding: 40px; text-align: center" height="200">Hello ' +
                    name +
                    '",Your Reservation Payment Has Been Successfully Completed." </td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;">Copyright @' +
                    currYear +
                    " Darkom All rights reserved..</p></td></tr></table></td></tr></table></body></html>",
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Mail resent: " + info.response);
                }
            });

            ReservationSchema.updateOne(
                { _id: sendUserData._id },
                { reservedPaymentMailSend: true }
            )
                .then((updateReserve) => {
                    return res.json({
                        success: true,
                        message: "Email send successfully.",
                        response_data: updateReserve,
                    });
                })
                .catch((e) => {
                    return res.json({
                        success: false,
                        message: "update request mail send successfully.",
                        response_data: {},
                    });
                });
        } else {
            return res.json({
                success: false,
                message: "user email does not exist",
                response_data: {},
            });
        }
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with requested data.", response_data: err, })
    }
};


module.exports.makeReservation = async (req, res, next) => {
    const postData = req.body;
    let errors = {
        success: false,
        message: "",
    };
    try {
        if (postData.serviceId == "") {
            errors.message = "Service Id is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.visitorId == "") {

            errors.message = "Visitor Id is required";
            res.status(200).json(errors);
            return;
        }
        if (!ObjectId.isValid(postData.visitorId)) return res.json({ success: false, message: "Invalid id" })
        if (postData.visitorName == "") {
            errors.message = "Visitor name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.date == "") {
            errors.message = "Date is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.visitorsNo == "") {
            errors.message = "No of visitors is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.details == "") {
            errors.message = "details is required";
            res.status(200).json(errors);
            return;
        }
        // const reqDate = postData.date;
        const userIdCheck = await UserSchema.findOne({ _id: postData.visitorId });
        if (!userIdCheck) {
            return res.json({ success: false, message: "Please provide a valid visitor id", })
        }
        const userCheck = await UserSchema.findOne({ _id: postData.visitorId }, 'user_type');
        if (userCheck.user_type != "visitor") {
            return res.json({ success: false, message: "You are not allowed to make reservation.", })
        } else if (userCheck.user_type == "visitor") {
            const serviceIdCheck = await ServiceSchema.findOne({ _id: postData.serviceId }, 'serviceType numOfVisitors fromDate toDate isDelete')
            if (!serviceIdCheck) {
                return res.json({ success: false, message: "Please provide a valid service id.", })
            } else if (serviceIdCheck.isDelete === true) {
                return res.json({ success: false, message: "You can not make reservation on this service.", })
            } else if (serviceIdCheck) {
                const dateString = postData.date; // Date string in "DD-MM-YYYY" format
                const parts = dateString.split('-'); // Split date string into day, month, and year components

                const year = parseInt(parts[2]); // Convert year string to number
                const month = parseInt(parts[1]) - 1; // Convert month string to zero-based index
                const day = parseInt(parts[0]); // Convert day string to number

                const date = new Date(year, month, day).toISOString(); // Create ISODate string // Output: 2023-05-05T21:00:00.000Z
                console.log("reqDate", date)
                const dateStringg = serviceIdCheck.fromDate; // Date string in "DD-MM-YYYY" format
                const partsp = dateStringg.split('-'); // Split date string into day, month, and year components

                const yr = parseInt(partsp[2]); // Convert year string to number
                const mh = parseInt(partsp[1]) - 1; // Convert month string to zero-based index
                const dy = parseInt(partsp[0]); // Convert day string to number

                const fromDate = new Date(yr, mh, dy).toISOString(); // Create ISODate string // Output: 2023-05-05T21:00:00.000Z
                console.log("fromDate", fromDate)

                const dateStrings = serviceIdCheck.toDate; // Date string in "DD-MM-YYYY" format
                const part = dateStrings.split('-'); // Split date string into day, month, and year components

                const yer = parseInt(part[2]); // Convert year string to number
                const mnt = parseInt(part[1]) - 1; // Convert month string to zero-based index
                const dey = parseInt(part[0]); // Convert day string to number

                const toDate = new Date(yer, mnt, dey).toISOString(); // Create ISODate string // Output: 2023-05-05T21:00:00.000Z
                console.log("toDate", toDate)

                const checkDate = await ServiceSchema.find({
                    dateString: { $gte: dateStringg, $lt: dateStrings },
                    _id: postData.serviceId,
                });
                console.log("checkDate", checkDate)
                if (!checkDate) {
                    return res.json({ success: false, message: "Please provide valid date under services add date.", })
                } else if (postData.visitorsNo <= serviceIdCheck.numOfVisitors) {
                    const newReservation = new ReservationSchema({
                        serviceId: postData.serviceId,
                        visitorId: postData.visitorId,
                        visitorName: postData.visitorName,
                        date: postData.date,
                        visitorsNo: postData.visitorsNo,
                        details: postData.details
                    })
                    newReservation.save();
                    res.json({ success: true, message: "Reservation added successfully..", response_data: newReservation, });
                } else {
                    res.json({ success: false, message: "Value must be less than or equal to maximum visitors on add services.", });
                }
            } else {
                res.json({ success: false, message: "Something went wrong.", });
            }
        } else {
            errors.message = "Error in add reservation data.";
            res.status(200).json(errors);
            return;
        }
    } catch (e) {
        console.log("e", e)
        errors.message = e.message;
        res.status(200).json(errors);
        return;
    }
};


module.exports.testPayment = async (req, res) => {
    console.log('Test Payment=>', req.body);
    try {
        const { paymentMethodId, amount,reservationId,visitorEmail, name,providerId,serviceType,serviceName,address,quantity,details,serviceImage} = req.body;
        let customerName = name;
        let aedAmt = amount+'00';
        let visitorId = req.session.user._id;

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: aedAmt,
            currency: 'AED',
            payment_method: paymentMethodId,
            confirm: true
          });
    
        // If the payment is successful
        if (paymentIntent.status === 'succeeded') {
          // Handle the successful payment and update your database
       
        const newReservation = new ReservationSchema({
            visitorId:visitorId,
            visitorName:name,
            visitorEmail:visitorEmail,
            serviceId:reservationId,
            paymentMethodId:paymentMethodId,
            amount:amount,
            providerId:providerId,
            serviceType:serviceType,
            serviceName:serviceName,
            address:address,
            quantity:quantity,
            details:details,
            serviceImage:serviceImage
        })
        newReservation.save();
          // Send a success response to the client
          const mailOptions = {
            from: 'darkomtourism@gmail.com',
            to: '218410176@psu.edu.sa.com',
            subject: 'Payment Confirmation',
            html: `
              <h1>Payment Confirmation</h1>
              <p>Your payment was successful. Thank you!</p>
              <h2>Payment Details:</h2>
              <p>Amount:AED ${amount}</p>
              <p>Payment Method: ${paymentMethodId}</p>
            `,
          };
    
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.status(200).json({success: true, message: 'Payment successful' });
        } else {
          // Handle payment failure
          res.status(400).json({success: false, message: 'Payment failed' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false,message: 'Internal server error' });
      }
    
};


module.exports.forgotPasswordEmail = async (req, res, next) => {
    const {email} = req.body;
    let errors = {
        success: false,
        message: "",
    };
    if (email == "" || email == undefined) {
        errors.message = "email id is required";
        res.status(200).json(errors);
        return;
    }
    const checkUser = await UserSchema.findOne({email:email}).exec();
    if (!checkUser) {
        errors.message = "email id doesn't exist";
        res.status(200).json(errors);
        return;
    }
    const expiringToken = generateExpiringToken();
    const mailOptions = {
        from: 'darkomtourism@gmail.com',
        to: email,
        subject: 'Your Password Reset Request',
        html:`<html>
        <head>
          <style>
            /* Inline CSS styles */
              .heahing{
              }
              .para{
                font-weight: 600;
              }
              .con-body{
                background: #DA9D6F;
                padding: 5%;
              }
              .link{
                display: block;
                width: 115px;
                height: 25px;
                background: #4E9CAF;
                padding: 10px;
                text-align: center;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                line-height: 25px;
              }

        
            /* More CSS styles */
          </style>
            </head>
            <body class="con-body">
            <h1>Hi ${checkUser.firstName +' '+checkUser.lastName}</h1>
            <p >Click the link below to reset your password.(Link valid for 5 mins)</p>
            <a class="link" href="http://127.0.0.1:3112/forgot-password-two/${checkUser._id+'$'+expiringToken}">Link</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p >Your Password won't change until you access the link above and create a new one.</p>
            </body>
            </html>`,
        
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
      return res.send({ success: true, message: "An email has been sent to your email address. Follow the instruction in the email to reset your password."});
};

module.exports.forgotPasswordReset = async (req, res, next) => {
    const {resetId,password,confirm_password} = req.body;
     let userId = resetId.split('$')[0];
  let resetToken = resetId.split('$')[1];
  console.log("userId",userId);
  console.log("resetToken",resetToken);
  const isValid = verifyExpiringToken(resetToken);
  console.log("resetTokenisValid",isValid);

    let errors = {
        success: false,
        message: "",
    };
    if (password == "" || password == undefined) {
        errors.message = "password is required";
        res.status(200).json(errors);
        return;
    }
    if (confirm_password == "" || confirm_password == undefined) {
        errors.message = "confirm password is required";
        res.status(200).json(errors);
        return;
    }
    if (password != confirm_password) {
        errors.message = "Passsword and confirm-password doesnot match";
        res.status(200).json(errors);
        return;
    }
    if (password.trim().length < 6 || password.trim().length > 15) {
        errors.message = "Password length must be 6 - 15 character.";
        res.status(200).json(errors);
        return;
    }
    const hashedPassword = await hashPassword(password);
    if (isValid) {
        const updateUserPassword = await UserSchema.findByIdAndUpdate({_id:userId},{password:hashedPassword}).exec();
        console.log("updateUserPassword",updateUserPassword);
        return res.send({ success: true, message: "Password changed successfully"});
    } else {
        errors.message = "The reset token has expired";
        res.status(200).json(errors);
        return;
    }
    

};

const generateExpiringToken = () => {
    const token = crypto.randomBytes(20).toString('hex'); // Generate a random token
    const expiration = Date.now() + 5 * 60 * 1000; // Set expiration time to 5 minutes from now
    // const expiration = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes from now
    const expiringToken = `${token}_${expiration}`; // Combine token and expiration time
    return expiringToken;
  };


  // Verify an expiring token
const verifyExpiringToken = (token) => {
    const [tokenValue, expiration] = token.split('_');
    const currentTime = Date.now();
  
    if (currentTime > parseInt(expiration, 10)) {
      // Token has expired
      return false;
    }
  
    // Token is still valid
    return true;
  };



  module.exports.addAccountDetails = async (req, res, next) => {
    try {
        console.log("addAccountDetails",req.body);
        const userId = req.body.id;
        const userData = await UserSchema.findById(userId);
        console.log("userData===========", userData);
        if (userData) {
            var obj = {};
            if (req.body.accountOwnerName) {
                obj.accountOwnerName = req.body.accountOwnerName
            }
            if (req.body.accountNumberOrIBAN) {
                obj.accountNumberOrIBAN = req.body.accountNumberOrIBAN
            }
            console.log("req.body.==========    ", req.body);

            const updateData = await UserSchema.findByIdAndUpdate(userId, obj, {
                new: true
            });
            const getUserData = await UserSchema.findById(userId);
            res.json({
                success: true,
                message: "User account data added successfully..",
                response_data: getUserData,
            })
        }
        else {
            res.json({
                success: false,
                message: "User id not found",
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: `INTERNAL DB ERROR`,
        });
    }
}