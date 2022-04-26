const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// const fetch = require("node-fetch");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const postSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  photo: {
    type: String,
  },
  video: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  share: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  CreatedAt: { type: String, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
