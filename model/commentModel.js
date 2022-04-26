const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// const fetch = require("node-fetch");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const commentSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  mention: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
  },
  CreatedAt: { type: String, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
