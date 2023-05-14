//define Mongoose schema for User collection in a MongoDB database
var mongoose = require('mongoose');
var bcrypt = require('bcrypt'); // import bcrypt module to hash password
var mongoosePaginate = require('mongoose-paginate'); // for pagination
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;

var userschema = new Schema({
    user_type        : { type: String, enum: ['service_provider', 'visitor']}, // two types of users
    firstName       : { type: String, default: '' },
    lastName        : { type: String, default: '' },
    email           : { type: String, default: '' },
    phoneNumber     : { type: String, default: '' },
    dob             : { type: String, default: '' },
    address       : { type: String, default: null },
    national_id    : { type: String, default: null },
    password        : { type: String, default: '' },
    accessToken     : { type: String, default: '' },
    emailSend        : { type: Boolean, default: false },
    profilePic     : { type: String, default: '' },
    wpLink         : { type: String, default: '' },
    bio             : { type: String, default: '' },
    accountOwnerName : { type: String, default: '' },
    accountNumberOrIBAN: { type: String,  unique: true, default: '' },
    isDelete        : { type: Boolean, default: false },
    },
    {
     timestamps: true //This enables automatic timestamping of the createdAt and updatedAt fields

});

// plugins added to schema to enable pagination
userschema.plugin(mongoosePaginate);
userschema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('User', userschema); // Exporting User model, created by compiling userschema