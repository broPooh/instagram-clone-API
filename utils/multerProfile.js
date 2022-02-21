const multer = require('multer');
const path = require('path');
const AppError = require('./appError');
//const uploadTest = require('../uploads');
const { replaceSpaceToUnder } = require('./replaceSpaceToUnder');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './profiles');
  },
  filename: function(req, file, cb) {
    //cb(null, new Date().toISOString() + replaceSpaceToUnder(file.originalname));

    //cb(null, new Date().now() + replaceSpaceToUnder(file.originalname));
    cb(null, new Date().toISOString() + replaceSpaceToUnder(file.originalname));
    //cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  // let ext = path.extname(file.originalname);
  // console.log('file', ext, file);
    // if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.mp4') {
    //   // cb(new Error(`File type ${ext} not supported`), false)
    //   return cb(new AppError(`File type ${ext} not supported`, 400));
    // }
  // reject a file
  // if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
  //   cb(null, true);
  // } else {
  //   cb(null, false);
  // }
  cb(null, true);
};

module.exports = multer({
  storage: storage,
  fileFilter,
});
