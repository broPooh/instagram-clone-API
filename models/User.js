const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  { username: {
      type: String,
      required: [true, 'username is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required'],
      validate: validator.isEmail,
      unique: [true, 'Email already exists'],
    },
    password: {
      type: String,
      minlength: 8,
      required: [true, 'Password is required'],
      select: false,
    },
    // name: {
    //   type: String,
    // },
    photo: {
      type: String,
      default:
        'https://res.cloudinary.com/brocloudinary/image/upload/v1644206367/cld-sample.jpg',
    },
    followers: {
      type: Map,
      of: {
        userId: {
          type: String,
        },
      },
      default: {},
    },
    following: {
      type: Map,
      of: {
        userId: {
          type: String,
        },
      },
      default: {},
    },

    // passwordChangedAt: {
    //   type: Date,
    // },
    // passwordResetToken: String,
    // passwordResetExpires: Date,
    // active: {
    //   type: Boolean,
    //   default: true,
    //   select: false,
    // },
  },
  //{ timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//^Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//~Compare Password
userSchema.methods.comparePassword = async function (dbPassword, userPassword) {
  return await bcrypt.compare(dbPassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
