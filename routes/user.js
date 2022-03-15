const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const {
  register,
  activateAccount,
  signUpValidations,
  login,
  getUsers,
  getUser,
  activate,
  myProfile,
  protect,
  getProfileId,
  signUpWeb,
} = require('../controllers/authController');

const {
  follow,
  unfollow,
  uploadPhotoTest,
  deletePhotoTest,
  searchProfile
} = require('../controllers/profileController');
const profileUpload = require('../utils/multerProfile');

router.route('/').get(getUsers);
//outer.route("/").get(getUser)
router.route('/me').get(protect, myProfile);

router.post(
  '/register',
  signUpValidations,
  [check('email', 'Please enter valid email address').isEmail()],
  register
);

router.post(
  '/activate',
  [
    check('email', 'Please enter valid email address').isEmail(),

    check('password', 'Password should be minimum of 8 characters')
      .not()
      .isEmpty()
      .isLength({ min: 8 }),
  ],
  activate
);

router.post(
  '/confirm/',
  [
    check('Otp', 'Otp should be minimum of 6 number')
      .not()
      .isEmpty()
      .isInt({ min: 6, maz: 6 }),
  ],
  activateAccount
);
router.post(
  '/login',
  [
    check('email', 'Please enter valid email address').isEmail(),
    check('password', 'Password should be minimum of 8 characters')
      .not()
      .isEmpty(),
  ],
  login
);

router.post(
  '/signup',
  [
    check('email', 'Please enter valid email address').isEmail(),

    check('password', 'Password should be minimum of 8 characters')
      .not()
      .isEmpty()
      .isLength({ min: 8 }),
  ],
  signUpWeb
);


router.route('/find').get(searchProfile);

router
.route('/photo')
.post(protect, profileUpload.single('image'), uploadPhotoTest)
.delete(protect, deletePhotoTest);

router.route('/follow').post(protect, getProfileId, follow);
router.route('/unfollow').post(protect, getProfileId, unfollow);

module.exports = router;
