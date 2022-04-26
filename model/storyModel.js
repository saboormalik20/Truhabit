const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// const fetch = require("node-fetch");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const storySchema = new mongoose.Schema({
  description: {
    type: String,
  },
  photo: {
    type: String,
  },
  video: {
    type: String,
  },

  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  CreatedAt: { type: String, default: Date.now },
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
