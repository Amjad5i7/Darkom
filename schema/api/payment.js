//define Mongoose schema for Payment collection in a MongoDB database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create paymentSchema object for SP Payment Info in MongoDB 
var paymentSchema = new Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', default: "" },
    accountOwnerName: { type: String, default: '' },
    accountNumberOrIBAN: { type: String,  unique: true, default: '' },
    isDelete: { type: Boolean, default: false },
},
    {
        timestamps: true //This enables automatic timestamping of the createdAt and updatedAt fields
    });
module.exports = mongoose.model('Payment', paymentSchema); // Exporting Payment model, created by compiling paymentSchema