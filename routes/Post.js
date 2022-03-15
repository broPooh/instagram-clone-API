const express = require('express');
const router = express.Router();

const { getProfileId } = require('../controllers/authController');

const { protect } = require('../controllers/authController');
const {
  createPost,
  createPostTest,
  getAllPost,
  getPostById,
  deletePost,
  likePost,
  getPostByUserId,
  getPostByFollow,
  getPostByMe,
  deletePostTest,
  updatePost,
  searchHashTag,
  getAllPostTest2
} = require('../controllers/postController');
const upload = require('../utils/multer');
const uploadTest = require('../utils/multerTest');



router.route('/find').get(searchHashTag);
//router.route('/search').get(search);

router
  .route('/testGet')
  .get(protect, getProfileId, getAllPostTest2)

router
  .route('/')
  .get(protect, getProfileId, getAllPost)
  .post(protect, getProfileId, uploadTest.single('file'), createPostTest);
  //.post(protect, getProfileId, upload.array('image'), createPost);

router.route('/test').post(protect, getProfileId, uploadTest.single('file'), createPostTest);

router.route('/getPostByUserId/:id').get(protect, getProfileId, getPostByUserId);
router.route('/getPostByFollow').get(protect, getProfileId, getPostByFollow);
router.route('/getPostByMe').get(protect, getProfileId, getPostByMe);

router
  .route('/:id')
  .get(getPostById)
  .delete(protect, deletePostTest);
  //.delete(protect, deletePost);

  router.route('/test/:id').delete(protect, deletePostTest);
              //.put(protect, updatePost)
router.route('/update/:id').patch(protect, getProfileId, uploadTest.single('file'), updatePost);


router.route('/like/:id').post(protect, likePost);
module.exports = router;
