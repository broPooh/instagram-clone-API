const Profile = require('../models/Profile');
const catchAsync = require('../utils/catchAsync');
const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');
const fileUpload = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/Post');
const Message = require('../models/Messages');
const Notification = require('../models/Notification');
const fs = require("fs");

exports.profileValidations = (req, res, next) => {
  if (req.body.accountType)
    return next(
      new AppError('This is invalid route for changing account type', 400)
    );

  next();
};

const deletePhotoCloudinary = async (id) =>
  await cloudinary.uploader.destroy(id);

const uploadPhotoCloudinary = async (file) => {
  // if (file.mimetype.slice(0, 5) === 'video') {
  //   return next(new AppError('Please upload valid image', 400));
  // }
  const { public_id, secure_url } = await fileUpload(file);

  return {
    public_id,
    secure_url,
  };
};

exports.getProfiles = catchAsync(async (req, res, next) => {
  const profiles = await Profile.find({})
    .limit(2);
  if (!profiles) {
    return next(new AppError('No profile found', 400));
  }
  res.status(200).json({
    status: 'success',
    docs: profiles.length,
    data: {
      profiles,
    },
  });
});

exports.getAllProfiles = catchAsync(async (req, res, next) => {
  const profiles = await Profile.find({});
  if (!profiles) {
    return next(new AppError('No profile found', 400));
  }
  res.status(200).json({
    status: 'success',
    docs: profiles.length,
    data: {
      profiles,
    },
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const updatedProfile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  return res.status(200).json({
    status: 'success',
    data: {
      profile: updatedProfile,
    },
  });
});

exports.updateProfileTest = catchAsync(async (req, res, next) => {
  //let myProfile = await Profile.findById(req.user.id);

  const updatedProfile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  return res.status(200).json({
    status: 'success',
    data: {
      profile: updatedProfile,
    },
  });
});


exports.getProfileByName = catchAsync(async (req, res, next) => {
  console.log(req.params.name);
  const profile = await Profile.findOne({ username: req.params.name });

  if (!profile) {
    return next(new AppError('No profile found', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});

exports.getProfileById = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new AppError('No profile found', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});


exports.uploadPhoto = catchAsync(async (req, res, next) => {
  const photo = await uploadPhotoCloudinary(req.file);

  const profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { photo },
    { new: true }
  );
  res.status(200).json({
    success: 'true',
    profile,
  });
});

exports.uploadPhotoTest = catchAsync(async (req, res, next) => {
  const photo = req.file;
  console.log(photo);

  const profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { photo: photo.filename },
    { new: true }
  );
  res.status(200).json({
    success: 'true',
    profile,
  });
});

exports.deletePhotoTest = catchAsync(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });

  const photo = profile.photo;
  if(photo && photo !== "") {
    fs.unlinkSync(`./profiles/${photo}`);
  }
  
  profile.photo = process.env.DEFAULT_PROFILE_PHOTO;
  await profile.save();

  res.status(200).json({
    status: 'success',
    profile,
  });
});

exports.messagePhoto = catchAsync(async (req, res, next) => {
  const photo = await uploadPhotoCloudinary(req.file);
  if (!message) {
    return next(new AppError('Message should not empty', 400));
  }
  const newMessage = await Message.create({
    message: photo,
    sender: req.profile,
    groupId: req.params.groupId,
    to: req.params.to,
  });

  const populatedMessage = await newMessage
    .populate({
      path: 'sender',
      select: 'username user name photo _id',
    })
    .execPopulate();
  return res.status(201).json({
    status: 'success',
    message: populatedMessage,
  });
});
exports.updatePhoto = catchAsync(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });
  await deletePhotoCloudinary(profile.photo.public_id);

  const photo = await uploadPhotoCloudinary(req.file);
  profile.photo = photo;
  profile.save();
  res.status(200).json({
    status: 'success',
    profile,
  });
});

exports.deletePhoto = catchAsync(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });

  await deletePhotoCloudinary(profile.photo.public_id);
  profile.photo = process.env.DEFAULT_PROFILE_PHOTO;
  await profile.save();

  res.status(200).json({
    status: 'success',
    profile,
  });
});

const searchHashtag = async (query) => {
  const queryField = new RegExp('^' + query);
  const result = await Post.find({ hashtag: { $in: [queryField] } });
  return result;
};

//const result = await Post.find({ hashtag: { $regex: '.*' + query + '.*' } });

exports.search = catchAsync(async (req, res, next) => {
  if (req.query.find[0] === '#') {
    const hashtag = await searchHashtag(req.query.find.slice(1));
    return res.status(200).json({
      status: 'success',
      data: hashtag.length,
      hashtag,
    });
  }
  const queryField = new RegExp('^' + req.query.find);

  const result = await Profile.find({
    username: { $regex: queryField },
  });

  res.status(200).json({
    status: 'success',
    data: result.length,
    users: result,
  });
});


exports.searchProfile = catchAsync(async (req, res, next) => {

  //const queryField = new RegExp('^' + req.query.find);
  const query = req.query.find;
  const result = await Profile.find({ username: { $regex: '.*' + query + '.*' } }).lean();

  let newResult = new Array();
  result.forEach(profile => {
    delete profile.posts;
    newResult.push(profile);
    console.log(profile);
  });

  // follwings.forEach(following => {
  //   delete following.posts;
  //   newFollwings.push(following);
  //   console.log(following);
  // });

  // const result = await Profile.find({
  //   username: { $regex: queryField },
  // });

  res.status(200).json({
    status: 'success',
    data: newResult.length,
    users: newResult,
  });
});

const followRequest = async (id, profile) => {
  const request = await Profile.findByIdAndUpdate(
    id,
    {
      $push: { requests: profile },
    },
    { new: true }
  );
  if (!request) return next(new AppError('User not found', 400));

  return request;
};

exports.followRequestTest = catchAsync(async (req, res, next) => {
  
  const request = await Profile.findByIdAndUpdate(
    id = req.body.id,
    {
      $push: { requests: profile },
    },
    { new: true }
  );
  if (!request) return next(new AppError('User not found', 400));

  return res.status(200).json({
    status: 'success',
    request,
  });
});

exports.follow = catchAsync(async (req, res, next) => {
  console.log("here");
  req.profile.toString() === req.body.id.toString() &&
    next(new AppError('You cant follow yourself', 400));

  if (req.body.accountType === 'private') {
    const request = followRequest(req.body.id, req.profile);

    return res.status(200).json({
      data: request,
    });
  }

  const following = await Profile.findOne({ user: req.user.id });
  //console.log(following);

  await following.following.set(req.body.name, {
    user: req.body.id,
  });
  await following.save();

  console.log(req.body.id);

  //const user = await Profile.findById(req.body.id);
  const user = await Profile.findOne({ user: req.body.id });
  console.log(user);
  await user.followers.set(following.username, {
    user: req.user.id,
  });
  await user.save();
  res.status(200).json({
    status: 'success',
    following,
    user: user.followers,
  });
});
//Todo unfollow
exports.unfollow = catchAsync(async (req, res, next) => {
  req.user.id === req.params.id &&
    next(new AppError('You cant unfollow yourself', 400));
  const following = await Profile.findOne({ user: req.user.id });
  if (!(await following.following.get(req.body.name))) {
    return res.status(200).json({
      status: 'success',
      following,
    });
  }
  await following.following.delete(req.body.name);
  await following.save();

  const user = await Profile.findById(req.body.id);

  await user.followers.delete(following.username);
  await user.save();

  // await Notification.deleteMany({
  //   to: req.body.id,
  //   user: following._id,
  //   type: 'Follow',
  // });

  res.status(200).json({
    status: 'success',

    following,
    user: user.followers,
  });
});

exports.userSettings = catchAsync(async (req, res, next) => {
  const user = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { accountType: req.body.account },
    { new: true }
  );

  if (!user) return next(new AppError('No user found', 400));

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.getFollowRequest = catchAsync(async (req, res, next) => {
  const user = await Profile.findOne({ user: req.user.id }).select(
    '+accountType'
  );
  if (!user || user.accountType === 'public') {
    return next(new AppError('Not authorized to access this route', 400));
  }
  if (user.requests.length === 0)
    return res.status(200).json({ data: 'No follow requests' });
  res.status(200).json({
    data: user.requests,
  });
});

exports.acceptRequest = catchAsync(async (req, res, next) => {
  const user = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { requests: req.body.id } }
  );
  user.followers.unshift(req.body.id);
  await user.save();

  const updateUser = await Profile.findByIdAndUpdate(req.body.id, {
    $push: { following: req.profile },
  });
  res.status(200).json({
    data: updateUser,
  });
});

exports.getNotification = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ to: req.profile })
    .sort({ createdAt: 'descending' })
    .exec();
  await Notification.updateMany(
    {
      to: req.profile,
      seen: false,
    },
    {
      seen: true,
    },
    {
      new: true,
    }
  );

  return res.status(200).json({
    notifications,
  });
});


exports.getFollowingList = catchAsync(async (req, res, next) => {
  const myProfile = await Profile.findOne({ user: req.user.id });
  const followerMap = myProfile.following;
  const followerIdArray = new Array();
  followerMap.forEach((value, key, mapObject) => {
    console.log(key +' , ' + value.user);
    followerIdArray.push(`${value.user}`);
  });
  
  console.log(followerIdArray);
  //const posts = await Post.find({user : { $in : followerIdArray}, accountType : "public"})
  const follwings = await Profile.find({user :{$in : followerIdArray}}, {user:1, username:1, photo:1})
    //.populate('profile')
    .lean();
  const newFollwings = new Array();

  follwings.forEach(following => {
    delete following.posts;
    newFollwings.push(following);
    console.log(following);
  });
  //const posts = await Post.find({user :{$in : followerIdArray}}).lean();

  res.status(200).json({
    status: 'success',
    data: {
      follwings : newFollwings,
    },
  });
});