//  imports multer module; used for uploading images of services
const multer = require('multer');

// Disk storage engine 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {// set destination folder
    cb(null, './uploads/user_profile_pic/');
  },
  filename: function (req, file, cb) {
    if (file.fieldname === "profilePic") { //Checks if the field name of the uploaded file is "profilePic".
        const fileName = file.originalname.replace(/\s/g, "_");//replacing all spaces in the original filename with underscores.
      cb(null, "profilePic-" + Date.now() + "-" + fileName);
    }
  }
});

const uploadPic = multer({ storage: storage }); // uploadPic -- middleware 

module.exports = uploadPic; // export uploadPic middleware