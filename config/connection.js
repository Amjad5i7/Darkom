const mongoose = require("mongoose"); // import mongoose using the require function
// description:@connect mongodb
const productionDBString = "mongodb+srv://Amjad:LbgHEqYLbB5LR8Sp@clustera.aecwc.mongodb.net/Darkom"; // MOngodb connection
mongoose.connect( productionDBString, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  },(err) => { // callback function to handle any errors that occur during the connection process
    if (err) {
      console.log(`mongodb connection failed`, err); //  If error connecting to database error message is logged to the console with error object.
    } else {
      console.log("Database connected successfully");
    }
  }
);
mongoose.connection.on('connect',()=>{ 
  console.log('mongodb connection successfull'); //mongodb connection 
});
mongoose.connection.on('error',(err)=>{ 
  console.log('mongodb connection unsuccessfull',err); //mongodb error 
});
mongoose.connection.on('disconnected',()=>{
  console.log('mongodb disconnected...trying to reconnect...please wait...'); //mongodb disconnect..trying to reconnect
  mongoose.createConnection(); // new database connection
});