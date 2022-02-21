const Post = require('../models/Post');
const Profile = require('../models/Profile');
const getProfileId = require('../utils/profile');
const cloudinary = require('cloudinary').v2;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const fileUpload = require('../utils/fileUpload');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const fs = require("fs");



exports.getAllPostTest2 = catchAsync(async (req, res, next) => {

  //await Post.paginate({limit : 10, next : req.body.next})
  const myQquery = {accountType : "public"};
  await Post.paginate({query : myQquery, limit : 10, next : req.body.next})
    .then((result) => {
      // console.log(`next ${result}`);
      // console.log(`length ${result.size}`);
      res.status(200).json({
        status: 'success',
        data: result.length,
        posts : result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // if(req.body.next) {
  //   await Post.paginate({limit : 10, next : req.body.next})
  //   .then((result) => {
  //     console.log(`next ${result}`);
  //     res.status(200).json({
  //       status: 'success',
  //       data: result.length,
  //       posts : result,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // } else {
  //   await Post.paginate({limit : 10})
  //   .then((result) => {
  //     console.log(result);
  //     res.status(200).json({
  //       status: 'success',
  //       data: result.length,
  //       posts : result,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // }
  
});

const deleteImageCloudinary = async (id) => {
  const { image } = await Post.findById(id);

  await image.map((img) => cloudinary.uploader.destroy(img.cloudinary_id));
};

exports.createPost = catchAsync(async (req, res, next) => {
  const files = req.files;
  console.log(req.files);
  let image = [];
  for (const file of files) {
    const newPath = await fileUpload(file);

    image.push({
      cloudinary_id: newPath.public_id,
      url: newPath.secure_url,
    });
  }

  const post = await Post.create({
    user: req.user.id,
    image: image,
    ...req.body,
    profile: req.profile,
  });

  res.status(201).json({
    status: 'success',
    post,
  });
});

exports.createPostTest = catchAsync(async (req, res, next) => {
  //console.log('test');
  const file = req.file;
  console.log(file);
  //console.log(req.file);
  //let image = [];
  // for (const file of files) {
  //   const newPath = await fileUpload(file);

  //   image.push({
  //     cloudinary_id: newPath.public_id,
  //     url: newPath.secure_url,
  //   });
  // }

  const post = await Post.create({
    user: req.user.id,
    //user: req.profile,
    //image: image,
    //image: file != undefined ? `http://localhost:8080/${file.path}` : null,
    //file: file != undefined ? `http://localhost:8080/${file.path}` : "",
    file: file != undefined ? file.filename : "",
    ...req.body,
    profile: req.profile,
  });

  res.status(201).json({
    status: 'success',
    post,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  console.log(req.file);
  const file = req.file;
  let post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 400));
  }
  //  console.log(post, post.user.toString() === req.user.id)
  if (post.user.toString() !== req.user.id) {
    return next(
      new AppError('You are not authorized to delete this post', 401)
    );
  }

  if(file) {
    //변경전 파일 지우는 로직 필요
    const oldFile = post.file;
    if(oldFile && oldFile !== "") {
      console.log(oldFile);
      fs.unlinkSync(`./uploads/${oldFile}`);
    }
      post.file = file.filename;
  }
  
  if(req.body.title) {
    post.title = req.body.title;
  }
  if(req.body.body) {
    post.body = req.body.body;
  }
  if(req.body.caption) {
    post.caption = req.body.caption;
  }
  if(req.body.accountType) {
    post.accountType = req.body.accountType;
  }
  await post.save();
  const updatePost = await Post.findById(req.params.id);

  res.status(201).json({
    status: 'success',
    post : updatePost,
  });
});

exports.getAllPost = catchAsync(async (req, res, next) => {

  const myQquery = {accountType : "public"};
  await Post.paginate({query : myQquery, limit : 10, next : req.body.next})
    .then((result) => {
      res.status(200).json({
        status: 'success',
        data: result.length,
        posts : result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  //const posts = await Post.find({})
  const posts = await Post.find({accountType : "public"})
    .sort({ createdAt: 'descending' })
    .populate('Profile')
    .limit(20);
  res.status(200).json({
    status: 'success',
    data: posts.length,
    posts,
  });
});

exports.getPostById = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'profile',
    select: '-bio -website -user -_v',
  });

  if (!post) {
    return next(new AppError('Post not found', 400));
  }

  res.status(200).json({
    status: 'success',
    post,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  //const post = await Post.deleteOne({ _id: req.params.id });
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 400));
  }
  //  console.log(post, post.user.toString() === req.user.id)
  if (post.user.toString() !== req.user.id) {
    return next(
      new AppError('You are not authorized to delete this post', 401)
    );
  }

  post.commentsPost.length &&
    (await Comment.findByIdAndDelete(post.commentsPost[0]._id));

  await deleteImageCloudinary(req.params.id);
  await post.remove();

  res.status(200).json({
    message: 'deleted',
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('Profile');

  if (!post) {
    return next(new AppError('Post not found', 400));
  }
  const id = await post.getProfileId(req.user.id);

  if (post.likes.includes(id)) {
    const index = post.likes.indexOf(id);
    post.likes.splice(index, 1);
    await post.save((err) => {
      console.log(err);
    });
    // await Notification.deleteMany({
    //   to: post.profile._id,
    //   user: id,
    //   type: 'Like',
    // });
  } else {
    post.likes.push(id);
    await post.save();
  }

  res.status(200).json({
    status: 'success',
    post,
  });
});

exports.getPostByUserId = catchAsync(async (req, res, next) => {
  //req.user.id
  //const posts = await Post.find({user : req.params.id});
  const posts = await Post.find({user : req.params.id, accountType : "public"});
  // const posts = await Post.find({})
  //   .sort({ createdAt: 'descending' })
  //   .populate('Profile')
  //   .limit(20);
  // const profile = await Profile.findById(req.params.id);

  if (!posts) {
    return next(new AppError('No posts found', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});


exports.getPostByFollow = catchAsync(async (req, res, next) => {
  const myProfile = await Profile.findOne({ user: req.user.id });
  const followerMap = myProfile.following;
  const followerIdArray = new Array();
  followerMap.forEach((value, key, mapObject) => {
    console.log(key +' , ' + value.user);
    followerIdArray.push(`${value.user}`);
  });
  
  //const posts = await Post.find({user :{$in : followerIdArray}})
  const posts = await Post.find({user : { $in : followerIdArray}, accountType : "public"})
    .sort({ createdAt: 'descending' })
    .populate('profile')
    .lean();
  //const posts = await Post.find({user :{$in : followerIdArray}}).lean();

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.getPostByMe = catchAsync(async (req, res, next) => {
    
  const posts = await Post.find({user: req.user.id})
    .sort({ createdAt: 'descending' })
    .populate('profile')
    .lean();
  //const posts = await Post.find({user :{$in : followerIdArray}}).lean();

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.deletePostTest = catchAsync(async (req, res, next) => {
  //const post = await Post.deleteOne({ _id: req.params.id });
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 400));
  }
  //  console.log(post, post.user.toString() === req.user.id)
  if (post.user.toString() !== req.user.id) {
    return next(
      new AppError('You are not authorized to delete this post', 401)
    );
  }
  //파일삭제 코드 추가하기.
  const oldFile = post.file;
  if(oldFile && oldFile !== "") {
    console.log(oldFile);
    fs.unlinkSync(`./uploads/${oldFile}`);
  }

  await Comment.deleteMany({post : req.params.id});
  
  await post.remove();

  res.status(200).json({
    message: 'deleted',
  });
});


exports.searchHashTag = catchAsync(async (req, res, next) => {
   //const queryField = new RegExp('^' + query);
  
  const query = req.query.hashTag;
  //console.log(query);
  //UserSchema.find({name: { $regex: '.*' + name + '.*' } }).limit(5);
  //return res.sendStatus(200);
  const result = await Post.find({ hashtag: { $regex: '.*' + query + '.*' } });
  //const result = await Post.find({ hashtag: { $in: [queryField] } });
  return res.status(200).json({
    status: 'success',
    data: result.length,
    result,
  });

});