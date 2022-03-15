const Comment = require('../models/Comment');
const catchAsync = require('../utils/catchAsync');
const Post = require('../models/Post');
const AppError = require('../utils/appError');
//const getProfileId = require("../utils/profile");

//check post is in db
exports.checkPost = async (req, res, next) => {
  //console.log(`23 ${req.params.id}`);
  //const post = await Post.findById(req.params.id);
  
  //const post = await Post.findById(req.params.id).lean();
  const post = await Post.findById(req.params.postId).lean();

  //const post = await Post.findOne({_id : req.params.id}).lean();
  //console.log(post);

  if (!post) {
    return next(new AppError('Post not available', 404));
  }
  next();
};

//comment to a post

exports.addComment = catchAsync(async (req, res, next) => {
  try {
    const id = req.profile;
    // console.log(id);
    // console.log(req.params.id);
    //const post = await Post.find();
    
    //const post = await Post.findById(req.params.id).lean();
    const post = await Post.findById(req.params.postId).lean();
    //const post = await Post.findOne({_id : req.params.id}).lean();
    //console.log(post);

    if (!post) {
      return next(new AppError('Post not available', 404));
    }
    // const comment = await Comment.create({
    //   user: req.user.id,
    //   profile: id,
    //   post: req.params.id,
    //   ...req.body,
    // });
    const comment = new Comment({
      user: req.user.id,
      username: req.user.username,
      //profile: id,
      post: req.params.postId,
      ...req.body,
    });
    await comment.save();

    //console.log(comment);

    res.status(200).json({
      //status: 'success',
      comment,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
});

//like comment
exports.likeComment = catchAsync(async (req, res, next) => {
  try {
    //const id = req.profile;
    const id = req.user.id;
    console.log(id);

    const comment = await Comment.findById(req.params.id);
  
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
  
    const checkLike = comment.likes.findIndex((like) => 
      like._id.toString() === id.toString()
    );
  
    if (checkLike >= 0) {
      comment.likes.splice(checkLike, 1);
      await comment.save();
    } else {
      comment.likes.unshift(id);
      await comment.save();
    }

    console.log(comment);
  
    // res.status(200).json({
    //   status: 'success',
    // });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

//delete comment

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  return comment.user.toString() === req.user.id.toString()
    ? (await comment.remove(),
      res.json({
        status: 'success',
      }))
    : next(new AppError('You are not authorized to delete this comment', 401));
});

exports.deleteCommentTest = catchAsync(async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if(!comment) {
      return next(new AppError('Comment not available', 404));
    }

    // const post = await Post.findById(req.params.id);

    // if(!post) {
    //   return next(new AppError('Post not available', 405));
    // }

    if(comment && (comment.user.toString() === req.user.id.toString()) || (post.user.toString() === req.user.id.toString())) {
      await comment.remove();
      // res.json({
      //     status: 'success',
      // });
      return res.sendStatus(200);
    } else {
      next(new AppError('You are not authorized to delete this comment', 402));
    }
  } catch (error) {
    return res.sendStatus(500);
  }
});

exports.updateCommentTest = catchAsync(async (req, res, next) => {
  try {
    if(!req.body.comment) {
      next(new AppError('Enter the comment', 501));
    }
    const comment = await Comment.findById(req.params.commentId);

    if(!comment) {
      return res.sendStatus(404);
    }

    if(comment && (comment.user.toString() === req.user.id.toString())) {
      comment.comment = req.body.comment;
      await comment.save();
      res.json({
          //status: 'success',
          comment,
      });
    } else {
      next(new AppError('You are not authorized to delete this comment', 402));
    }
  } catch (error) {
    return res.sendStatus(500);
  }
});