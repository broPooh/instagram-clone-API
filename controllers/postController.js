const User = require('../models/User');
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
        data: result.results.length,
        posts : result.results,
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
  try {
    //console.log('test');
    const file = req.file;
    //console.log(file);
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
      //profile: req.profile,
      file: file != undefined ? file.filename : "",
      ...req.body,
    });

    res.status(200).json({
      //status: 'success',
      post,
    });

  } catch(error) {
    return res.sendStatus(500);
  }
});

exports.updatePost = catchAsync(async (req, res, next) => {
  try {
    //console.log(req.file);
    const file = req.file;
    let post = await Post.findById(req.params.id);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    //  console.log(post, post.user.toString() === req.user.id)
    if (post.user.toString() !== req.user.id) {
      return next(
        new AppError('You are not authorized to delete this post', 402)
      );
    }

    if(file) {
      //변경전 파일 지우는 로직 필요
      const oldFile = post.file;
      if(oldFile && oldFile !== "") {
        //console.log(oldFile);
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

    res.status(200).json({
      //status: 'success',
      post : updatePost,
    });
  } catch(error) {
    return res.sendStatus(500);
  }
});

exports.getAllPost = catchAsync(async (req, res, next) => {


  const myQquery = {accountType : "public"};
  await Post.paginate({query : myQquery, limit : 10, next : req.body.next,previous : req.body.previous,})
    .then((result) => {
      res.status(200).json({
        status: 'success',
        data: result.results.length,
        posts : result.results,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  //const posts = await Post.find({})
  // const posts = await Post.find({accountType : "public"})
  //   .sort({ createdAt: 'descending' })
  //   .populate('Profile')
  //   .limit(20);
  // res.status(200).json({
  //   status: 'success',
  //   data: posts.length,
  //   posts,
  // });
});

exports.getPostById = catchAsync(async (req, res, next) => {
  try {
    if(!req.params.id){
      return res.sendStatus(501);
    }

    // const post = await Post.findById(req.params.id).populate({
    //   path: 'commentsPost',
    //   //select: '-comment',
    // });
    //
    //comment: {
    
    //const post = await Post.findById(req.params.id).populate('Comment').lean();
    const post = await Post.findById(req.params.id).lean();
        
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    post.id = post._id;
    
    const comments = await Comment.find({ post: req.params.id }).sort({"createdAt" : -1});
    console.log(comments);
    post.comments = comments;
    console.log(post);

    res.status(200).json({
      //status: 'success',
      post,
    });

  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
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
  try {
    //const post = await Post.findById(req.params.id).populate('Profile');
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    const profileId = req.user.id;
    
    // const profileId = await post.getProfileId(req.user.id);
    
    // if(!profileId) {
    //   return next(new AppError('User not found', 400));
    // }
  
    if (post.likes.includes(profileId)) {
      const index = post.likes.indexOf(profileId);
      post.likes.splice(index, 1);
      await post.save();
      // await post.save((err) => {
      //   console.log(err);
      // });
      // await Notification.deleteMany({
      //   to: post.profile._id,
      //   user: id,
      //   type: 'Like',
      // });
    } else {
      post.likes.push(profileId);
      await post.save();
    }
  
    // res.status(200).json({
    //   //status: 'success',
    //   post,
    // });
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
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
  try {
    //const myProfile = await Profile.findOne({ user: req.user.id });
    const myProfile = await User.findById(req.user.id);
    const followerMap = myProfile.following;
    //console.log(followerMap);
    const followerIdArray = new Array();
    followerMap.forEach((value, key, mapObject) => {
      //console.log(key +' , ' + value.user);
      //followerIdArray.push(`${value.user}`);
      followerIdArray.push(`${value.userId}`);
    });

    //console.log(followerIdArray);

    //const myQquery = {user : { $in : followerIdArray}, accountType : "public"};
    //const myQquery = {user : { $in : followerIdArray}};
    //const myQquery = {accountType : "public"};

    await Post.paginate({
      query : {
        accountType : "public",
        user : {$in : followerIdArray},
        },
      limit : 10,
      next : req.body.next,
      previous : req.body.previous,})
      .then((result) => {
        res.status(200).json({
          //status: 'success',
          data: result.results.length,
          posts : result.results,
          previous : result.previous,
          hasPrevious : result.hasPrevious,
          next : result.next,
          hasNext : result.hasNext,
        });
      })
      .catch((err) => {
        console.log(err);
      });
    // await Post.paginate({query : myQquery, limit : 10, next : req.body.next})
    //   .then((result) => {
    //     res.status(200).json({
    //       status: 'success',
    //       data: result.results.length,
    //       posts : result.results,
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    
    //const posts = await Post.find({user :{$in : followerIdArray}})
    // const posts = await Post.find({user : { $in : followerIdArray}, accountType : "public"})
    //   .sort({ createdAt: 'descending' })
    //   .populate('profile')
    //   .lean();
    
    // res.status(200).json({
    //   status: 'success',
    //   data: {
    //     posts,
    //   },
    // });

  } catch(error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

exports.getPostByMe = catchAsync(async (req, res, next) => {
  try {
    //console.log(req.user.id);
    await Post.paginate({
      query : {
        user : req.user.id,
        },
       limit : 10,
       next : req.body.next,
       previous : req.body.previous,})
      .then((result) => {
        console.log(result);
        res.status(200).json({
          //status: 'success',
          data: result.results.length,
          posts : result.results,
          previous : result.previous,
          hasPrevious : result.hasPrevious,
          next : result.next,
          hasNext : result.hasNext,
        });
      })
      .catch((err) => {
        console.log(err);
      });
      
    // const posts = await Post.find({user: req.user.id})
    //   .sort({ createdAt: 'descending' })
    //   .populate('profile')
    //   .lean();
    // //const posts = await Post.find({user :{$in : followerIdArray}}).lean();
  
    // res.status(200).json({
    //   status: 'success',
    //   data: {
    //     posts,
    //   },
    // });

  } catch (error) {
    return res.sendStatus(500);
  }
});

exports.deletePostTest = catchAsync(async (req, res, next) => {

  try {
    //const post = await Post.deleteOne({ _id: req.params.id });
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    //  console.log(post, post.user.toString() === req.user.id)
    if (post.user.toString() !== req.user.id) {
      return next(
        new AppError('You are not authorized to delete this post', 402)
      );
    }
    //파일삭제 코드 추가하기.
    const oldFile = post.file;
    if(oldFile && oldFile !== "") {
      //console.log(oldFile);

      const oldFilePath = `./uploads/${oldFile}`;

      if(fs.existsSync(oldFilePath)) {
        fs.unlinkSync(`./uploads/${oldFile}`);  
      }

      //fs.unlinkSync(`./uploads/${oldFile}`);
    }

    await Comment.deleteMany({post : req.params.id});
    
    await post.remove();

    // res.status(200).json({
    //   message: 'deleted',
    // });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});


exports.searchHashTag = catchAsync(async (req, res, next) => {
  try {
     //const queryField = new RegExp('^' + query);
  
    if(!req.query.hashTag) {
      return res.sendStatus(501);
    }
    const query = req.query.hashTag;
    console.log(query);
        
    const result = await Post.find({ hashtag: { $regex: '.*' + query + '.*' } });
    console.log(result.length);
    console.log(result);
    // return res.status(200).json({
    //   //status: 'success',
    //   data: result.length,
    //   result,
    // });

    // query : {
    //   user : req.user.id,
    //   },
    //  limit : 10,
    //  next : req.body.next})

    await Post.paginate({
      query : {
        accountType : "public",
        hashtag: { $regex: '.*' + query + '.*' },
        },
      limit : 10,
      next : req.body.next,
      previous : req.body.previous,})
      .then((result) => {
        console.log(result);
        res.status(200).json({
          //status: 'success',
          data: result.results.length,
          posts : result.results,
          previous : result.previous,
          hasPrevious : result.hasPrevious,
          next : result.next,
          hasNext : result.hasNext,
        });
      })
    .catch((err) => {
      //console.log(err);
      res.sendStatus(500);
    });

  } catch (error) {
    return res.sendStatus(500);
  }
});