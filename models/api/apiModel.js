'use strict'; //  to catch common coding mistakes and actions with global objects
// import Node.js modules and schemas
var UserSchema = require('../../schema/api/users');
var config = require('../../config');
var async = require("async"); // to work with asynchronous JavaScript.
var bcrypt = require('bcrypt'); // to hash passwords
var jwt = require('jsonwebtoken'); // to authenticate the users
var fs = require('fs');
var path = require('path');
var https = require('https');
var request = require('request');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;


var apiModel = {

    //register
    register: async function (data, callback) { //function that takes in a data object and a callback function as arguments

        // check if number is not null or undefined or used
        if (data) {
            const phoneCheck = UserSchema.findOne({ email: 'fahdah@gmail.com', phoneNumber: '0554833884' });

            phoneCheck.exec(function (err, user) {
                if (err) {
                    console.error(err);
                    callback({
                        response_code: 505,
                        message: "INTERNAL DB ERROR",
                        response: []
                    });
                } else {
                    console.log(user);
                    if (user != null) {

                        callback({
                            "response_code": 404,
                            "message": "Phone No already exist.",
                            "response_data": {}
                        });

                        return;
                    }
                }
            });
            
            // check if email is not null or undefined or used
            const emailCheck = UserSchema.findOne({ email: 'fahdah@gmail.com' });

            emailCheck.exec(function (err, user) {
                if (err) {
                    console.error(err);
                    callback({
                        response_code: 505,
                        message: "INTERNAL DB ERROR",
                        response: []
                    });
                } else {
                    console.log(user);
                    if (user != null) {
                        callback({
                            response_code: 404,
                            message: "Email address already exist",
                            response: user
                        });
                    }
                    else {
                        new UserSchema(data).save(async function (err, result) {//add user
                            if (err) {
                                callback({
                                    response_code: 505,
                                    message: "INTERNAL DB ERROR",
                                    response: []
                                });
                            } else {
                                callback({
                                    response_code: 200,
                                    message: "Registered successfully.",
                                    response: {}
                                });
                            }
                        });
                    }
                }
            });
        //If the data object is empty:
        } else {
            callback({
                response_code: 505,
                message: "INTERNAL DB ERROR",
                response: []
            });
        }
    },

    //login
    login: async function (data, callback) { // function that takes in a data object and a callback function as arguments


        if (data) {
            // check if email exists or deleted
            UserSchema.findOne({ email: data.email }, function (err, result) {
                if (err) {
                    callback({
                        response_code: 505,
                        message: "INTERNAL DB ERROR",
                        response: []
                    });
                } else {
                    if (result === null) {
                        callback({
                            response_code: 404,
                            message: "Wrong email. Please provide registered details.",
                            response: []
                        });
                    } else if (result.deleted == 'yes') {
                        callback({
                            response_code: 404,
                            message: "Your account has been deleted.",
                            response: []
                        });
                    }
                    //If the user is found and their account is not deleted:     
                    else {
                        bcrypt.compare(data.password.toString(), result.password, function (err, response) {//to compare the provided password with the stored password hash.
                            // result == true
                            if (response == true) {
                                var token = "dafdgfhgkhkhkhkkjkjlkj";//If the passwords match, generate an authentication token.
                                UserSchema.updateOne({
                                    _id: result._id
                                }, {
                                    $set: {//Update the user's record in the database
                                        deviceToken: data.deviceToken,
                                        appType: data.appType
                                    }
                                }, function (err, resUpdate) {
                                    if (err) {
                                        callback({
                                            response_code: 505,
                                            message: "INTERNAL DB ERROR",
                                            response: []
                                        });
                                    } else { // If the update is successful, object containing user information and authentication token.
                                        var all_result = {
                                            authtoken: token,
                                            _id: result._id,
                                            firstName: result.firstName,
                                            lastName: result.lastName,
                                            email: result.email,
                                            phoneNumber: result.phoneNumber,
                                            user_type: result.userType
                                        }
                                        callback({
                                            response_code: 200,
                                            message: "Logged in to your account",
                                            response: all_result
                                        });
                                    }
                                });
                            } else {
                                callback({
                                    response_code: 404,
                                    message: "Wrong password or email. Please provide registered details.",
                                    response: []
                                });
                            }
                        });
                    }
                }
            })
        //If the data object is empty:
        } else {
            callback({
                response_code: 505,
                message: "INTERNAL DB ERROR",
                response: {}
            });
        }
    },
}
module.exports = apiModel;