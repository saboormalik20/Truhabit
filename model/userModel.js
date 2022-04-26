const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// const fetch = require("node-fetch");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, " Please Provide a valid email"],
  },
  phone: { type: String },
  photo: { type: String, default: "/img/users/default.jpg" },
  friends: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  friendrequests: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  password: {
    type: String,
    required: [true, "Please provide your Password"],
    select: false,
  },
  gender: {
    type: String,
  },
  dob: {
    type: String,
  },
  token: [
    {
      type: String,
    },
  ],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

// for bcrypt the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// userSchema.pre("save", function (next) {
//   if (!this.isModified("password") || this.isNew) {
//     return next();
//   }
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//Phone number validation and formatting  😀

// userSchema.pre("save", async function (next) {
//   if (this.isModified("phonenumber") || this.isNew) {
//     console.log("yessss");
//     //   Current Location
//     const resp = await fetch(
//       "https://api.geoapify.com/v1/ipinfo?apiKey=c54b8d9142ca4b3081fe6bfa1aa59806",
//       {
//         method: "GET",
//       }
//     );

//     const js = await resp.json();
//     console.log(js);

//     //   Current Location Phone Format

//     const accountSid = process.env.TWILIO_ACCOUNT_SID;
//     const authToken = process.env.TWILIO_AUTH_TOKEN;
//     //    console.log(accountSid, authToken);

//     const client = require("twilio")(accountSid, authToken);

//     try {
//       const number = await client.lookups.v1
//         .phoneNumbers(String(this.phonenumber))
//         .fetch({ countryCode: js.country.iso_code });
//       //    console.log(number);
//       this.phonenumber = number.phoneNumber;
//     } catch (err) {
//       console.log("Error 😴");
//     }
//     if (!String(this.phonenumber).startsWith("+")) {
//       console.log("truessssssssssssssssssssss");
//       return next(new AppError("Phone Number not correct", 404));
//     }
//   }
//   next();
// });

// userSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "friends",
//     select:
//       "-__v -friends -requests -blocked -blockedBy -phonenumber -email -bio",
//   })
//     .populate({
//       path: "requests",
//       select:
//         "-__v -friends -requests -blocked -blockedBy -phonenumber -email -bio",
//     })
//     .populate({
//       path: "blocked",
//       select: "-__v -friends -requests -blocked -blockedBy -phonenumber -email",
//     })
//     .populate({
//       path: "blockedBy",
//       select: "-__v -friends -requests -blocked -blockedBy -phonenumber -email",
//     });
//   next();
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
