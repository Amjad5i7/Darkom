//  imports multer module; used for uploading images of services
const multer = require('multer');

// Disk storage engine 
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // set destination folder
    cb(null, './uploads/service-files/');
  },
  filename: function (req, file, cb) {
    if (file.fieldname === "planImages") { //Checks if the field name of the uploaded file is "planImages".
        const fileName = file.originalname.replace(/\s/g, "_");//replacing all spaces in the original filename with underscores.
      cb(null, "planImages-" + Date.now() + "-" + fileName);
    }
    //for activity
    if (file.fieldname === "activityImages") {
        const fileName = file.originalname.replace(/\s/g, "_"); 
      cb(null, "activityImages-" + Date.now() + "-" + fileName);
    }
  }
});

const upload = multer({ storage: storage }); // upload -- middleware 

module.exports = upload; // export upload middleware