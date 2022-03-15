const express = require("express");
const router = express.Router();
const {
            addComment,
            checkPost,
            likeComment,
            deleteComment,
            deleteCommentTest,
            updateCommentTest
} = require("../controllers/commentController");

const { getProfileId } = require("../controllers/authController")


const {
            createComment,
            likeReply,
            checkComment,
            deleteReply

} = require("../controllers/replyController")

const { protect } = require("../controllers/authController")

//router.route("/").get(getAllComments)

//router.route("/:id").get(getComment)

//comment
// router.route("/:id")
//             .post(protect, checkPost, getProfileId, addComment)

//comment
router.route("/:postId")
            .post(protect, checkPost, getProfileId, addComment)

router.route("/update/:commentId")
            .put(protect, updateCommentTest)

router.route("/delete/:commentId")
            .delete(protect, deleteCommentTest)            

router.route("/test/:id")
            .post(protect, getProfileId, addComment)

router.route("/like/:id")
            .patch(protect, getProfileId, likeComment)


router.route("/:id/:commentId")
            .delete(protect, checkPost, deleteComment)

router.route("/:id/test/:commentId")
            .put(protect, checkPost, updateCommentTest)
            .delete(protect, checkPost, deleteCommentTest)

//reply

router.route("/reply/:id")
            .post(protect, checkComment,getProfileId,createComment)

router.route("/reply/like/:id/:replyId")
            .patch(protect, checkComment,getProfileId, likeReply)
            .delete(protect, checkComment, deleteReply)

module.exports = router;