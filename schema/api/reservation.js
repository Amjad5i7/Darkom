//define Mongoose schema for Reservation collection in a MongoDB database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create reservationSchema object for reservations info in MongoDB 
var reservationSchema = new Schema({
    visitorId: { type: mongoose.Schema.ObjectId, ref: 'User', default: "" },
    visitorName: { type: String, default: '' },
    date: { type: Date, default: Date.now() },
    visitorEmail: { type: String, default: '' },
    serviceId: { type: String, default: '' },
    paymentMethodId: { type: String, default: '' },
    amount: { type: String, amount: '' },
    providerId: { type: String, default: '' },
    serviceType: { type: String, default: '' },
    serviceName: { type: String, default: '' },
    address: { type: String, default: '' },
    quantity: { type: String, default: '' },
    details: { type: String, default: '' },
    isDelete: { type: Boolean, default: false },
    serviceImage:{ type: String, default: '' },
},
    {
        timestamps: true //This enables automatic timestamping of the createdAt and updatedAt fields
    });
module.exports = mongoose.model('Reservation', reservationSchema); // Exporting Reservation model, created by compiling reservationSchema