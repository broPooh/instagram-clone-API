const mongoose = require('mongoose');
const Profile = require('./Profile');
const MongoPaging = require('mongo-cursor-pagination');
// const counterSchema = new mongoose.Schema({ counter: Number });
// counterSchema.plugin(MongoPaging.mongoosePlugin);
// const counter = mongoose.model('counter', counterSchema);
//const moongooseCursor = require('moongoose-cursor');



const postSchema = new mongoose.Schema(
  {
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    // },
    user: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // profile: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Profile',
    // },
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    caption: {
      type: String,
      trim: true,
    },
    // location: {
    //   type: String,
    // },
    hashtag: Array,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        //ref: 'Profile',
        ref: 'User',
      },
    ],
    //image: Array,
    file: {
      type: String,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    counter : Number
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
postSchema.plugin(MongoPaging.mongoosePlugin);

postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

postSchema.virtual('commentsPost', {
  ref: 'Comment',
  localField: '_id',
  //foreignField: 'post',
  foreignField: 'comment',
});

var autoPopulate = function(next) {
  //this.populate('updated_by','name').populate('created_by','name');
  this.find().populate('commentsPost');
  next();
};

postSchema.pre('commentsPost', autoPopulate);

postSchema.pre('save', function (next) {
  let caption = this.caption.replace(/\s/g, '');
  //console.log(caption);
  let hashTagIndex = caption.indexOf('#');
  if (hashTagIndex === -1) {
    //this.hashtag = undefined;
    this.hashtag = [];
    return next();
  }
  let hashTagSplice = caption.slice(hashTagIndex);
  //let res= hashTagSplice.replace(/#/, '').split('#');

  this.hashtag = hashTagSplice.replace(/#/, '').split('#');
  next();
});

// postSchema.pre("save", async function (next) {
//             const { _id } = await Profile.findOne({ user: this.user });
//             this.profile = _id;
//             next();
// })

postSchema.methods.getProfileId = async function (id) {
  const { _id } = await Profile.findOne({ user: id });
  return _id;
};

//Todo
// postSchema.pre(/^find/, function (next) {
//   this.find().populate('commentsPost');

//   next();
// });




const Post = mongoose.model('Post', postSchema);

module.exports = Post;
