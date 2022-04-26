const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// const fetch = require("node-fetch");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const notificationSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  requestfromuser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
  },
  type: {
    type: String,
  },
  postid: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
  },
  message: {
    type: String,
  },
  CreatedAt: { type: String, default: Date.now },
});

notificationSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

notificationSchema.methods.changePasswordAfter = function (JWTTimestamp) {
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
notificationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

notificationSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
