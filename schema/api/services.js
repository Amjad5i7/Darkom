//define Mongoose schema for Service collection in a MongoDB database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create serviceSchema object for services in MongoDB 
var serviceSchema = new Schema({
    providerId: { type: mongoose.Schema.ObjectId, ref: 'User', default: "" },
    serviceType: { type: String, enum: ['plan', 'activity'] }, // two types of services
    serviceName: { type: String, default: '' },
    description: { type: String, default: '' },
    numOfVisitors: { type: Number, default: '' },
    fromDate: { type: String, default: '' },
    toDate: { type: String, default: '' },
    price: { type: Number, default: null },
    images: { type: String, default: null },
    activities: [{ type: String, default: '' }],
    isDelete: { type: Boolean, default: false },
},
    {
        timestamps: true //This enables automatic timestamping of the createdAt and updatedAt fields
    });
module.exports = mongoose.model('Service', serviceSchema);  // Exporting Service model, created by compiling serviceSchema