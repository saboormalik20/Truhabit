const User = require("../model/userModel");
const Notification = require("../model/notificationsModel");
const Story = require("../model/storyModel");
const Post = require("../model/postModel");
const Comment = require("../model/commentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Emails = require("../utils/emails");
const Email = require("../utils/email");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const ObjectId = mongoose.Types.ObjectId;

// const factory = require('../controllers/handlerFactory');
const multerStorageExcel = multer.diskStorage({
  destination: "public/img/users/", // Destination to store video
  filename: (req, file, next) => {
    if (file.fieldname === "sheet") {
      next(null, file.fieldname + "_" + Date.now() + ".csv");
    } else {
      next();
    }
  },
});
const multerStorage = multer.diskStorage({
  destination: "public/img/users/", // Destination to store video
  filename: (req, file, next) => {
    if (file.fieldname === "photo") {
      next(null, file.fieldname + "_" + Date.now() + ".jpg");
    } else if (file.fieldname === "video") {
      next(null, file.fieldname + "_" + Date.now() + ".mp4");
    } else {
      next();
    }
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const uploadexcel = multer({
  storage: multerStorageExcel,
});
const upload = multer({
  storage: multerStorage,
});
exports.addExcelsheet = uploadexcel.single("sheet");
exports.uploadUserPhoto = upload.single("photo");
exports.uploadPhotoVideoPost = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

exports.protect = (model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.headers.jwt);
    let token;

    const abc = await model.find({ token: { $in: [req.headers.jwt] } });
    console.log(model);
    // console.log(req.headers);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // console.log("111");
      token = req.headers.authorization.split(" ")[1];
    } else if (abc.length > 0) {
      // console.log("222");
      token = req.headers.jwt;
    }
    // else if (req.cookies.jwt) {
    //   token = req.cookies.jwt;
    // }
    // console.log(req.cookies);
    if (!token) {
      return next(
        new AppError("You are not logged in! please login to get access", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const freshUser = await model.findById(decoded.id);
    if (!freshUser) {
      const err = new AppError(
        "The user belonging to this token no longer exist!",
        401
      );
      err.name = "User Deleted";
      return next(err);
    }
    // if (freshUser.changePasswordAfter(decoded.iat)) {
    //   const err = new AppError(
    //     "User Recently Changed Password. please login again!",
    //     401
    //   );
    //   err.name = "Change Password";
    //   return next(err);
    // }
    req.user = freshUser;
    res.locals.user = freshUser;

    next();
  });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, statusCode, req, res) => {
  let token = signToken(user._id);
  tokens = token;
  const countToken = user.token.filter((item) => {
    if (item == token) {
      return true;
    }
  });
  if (countToken.length > 0) {
  } else {
    user.token.push(token);
  }
  await user.save({ validateBeforeSave: false });
  // user.token = undefined;
  if (user.password) user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token: tokens,
    data: {
      user,
    },
  });
};

exports.Sendhelp = catchAsync(async (req, res, next) => {
  console.log(req.body.email);
  await new Emails(
    req.params.email,
    req.body.username,
    req.body.message,
    req.body.email
  ).sendWelcome();
  res.status(200).json({
    status: "success",
  });
});
//aa
exports.SendotpsUser = catchAsync(async (req, res, next) => {
  // const resetcode = Math.floor(100000 + Math.random() * 900000);
  let products = [
    {
      product: "aaa",
      quantity: 10,
      price: 102,
    },
    {
      product: "aaa",
      quantity: 10,
      price: 102,
    },
  ];
  await new Emails(
    req.params.email,
    req.body.orderId,
    req.body.userName,
    req.body.time,
    products
  ).sendPasswordUser();
  res.status(200).json({
    status: "success",
  });
});
exports.Sendotps = catchAsync(async (req, res, next) => {
  // const resetcode = Math.floor(100000 + Math.random() * 900000);
  let products = [
    {
      product: "aaa",
      quantity: 10,
      price: 102,
    },
    {
      product: "aaa",
      quantity: 10,
      price: 102,
    },
  ];
  await new Emails(
    req.params.email,
    req.body.orderId,
    req.body.userName,
    req.body.time,
    products
  ).sendPassword();
  res.status(200).json({
    status: "success",
  });
});
//RE BALANCE START
exports.getme = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
});

// START
const filterObj = (obj, next, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    } else {
      return next(new AppError(`${el} cannot be update here!`, 400));
    }
  });
  return newObj;
};
exports.forgotpassword = catchAsync(async (req, res, next) => {
  const user = await User.find({ email: req.params.email });
  if (user.length == 0) {
    return next(new AppError("Email is incorrect", 401));
  }

  console.log(user[0].email);
  const resetcode = Math.floor(100000 + Math.random() * 900000);
  await new Email(user[0], resetcode).sendPassword();
  res.status(200).json({
    status: "Email sent successfully",
    verificationcode: resetcode,
    userid: user[0]._id,
  });
});
exports.resetpassword = catchAsync(async (req, res, next) => {
  // console.log();
  // const user = await User.findById();
  if (req.body.password) {
    console.log("hi");
    req.body.password = await bcrypt.hash(req.body.password, 12);
  }

  const user = await User.findByIdAndUpdate(req.params.userid, req.body, {
    new: true,
    runValidators: true,
  }).select("+password");

  createSendToken(user, 200, req, res);
});
exports.createSocialUser = catchAsync(async (req, res, next) => {
  let userExist = await User.find({ email: req.params.emailorid });
  console.log(userExist);
  if (userExist.length > 0) {
    createSendToken(userExist[0], 201, req, res);
    return;
  }
  //aaa
  const user = new User({
    email: req.params.emailorid,
  });

  createSendToken(user, 201, req, res);
});
exports.searchpeople = catchAsync(async (req, res, next) => {
  const people = await User.aggregate([
    {
      $addFields: {
        result: {
          $regexMatch: {
            input: { $toUpper: "$name" },
            regex: req.params.input,
          },
        },
      },
    },
    { $match: { result: true } },
    {
      $project: { name: 1, photo: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: people,
  });
});
exports.updateSocialUser = catchAsync(async (req, res, next) => {
  const bodykeys = Object.keys(req.body);
  if (bodykeys.length < 1) {
    return next(new AppError("There is nothing to update.", 400));
  }
  let user = await User.findById(req.user.id);
  console.log(req.body);

  let filteredBody = filterObj(req.body, next, [
    "name",
    "gender",
    "password",
    "dob",
  ]);

  if (req.file) {
    filteredBody.photo = `/img/users/${req.file.filename}`;
  }

  const keys = Object.keys(filteredBody);
  keys.forEach((key, index) => {
    user[key] = filteredBody[key];
  });
  //aa
  user = await user.save({ validateBeforeSave: false });

  if (!user) {
    return next(new AppError("No User Found to request ", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
  });

  createSendToken(newUser, 201, req, res);
});
exports.acceptrequest = catchAsync(async (req, res, next) => {
  if (req.user.friendrequests.includes(req.params.touser)) {
    req.user.friendrequests = req.user.friendrequests.filter(
      (data) => String(data) != String(req.params.touser)
    );
  } else {
    return next(new AppError("Request not found!", 404));
  }
  console.log(req.user.friendrequests);
  req.user.friends.push(req.params.touser);
  let user = await User.findById(req.params.touser);
  user.friends.push(req.user._id);
  await user.save();
  await req.user.save();
  await Notification.create({
    title: "Request Accepted",
    type: "Request Accepted",
    message: `${req.user.name} Accepted your friend request`,
    requestfromuser: req.user._id,
    user: [req.params.touser],
  });
  res.status(200).json({
    status: "success",
    message: `you accepted ${user.name} request`,
  });
});
exports.rejectrequest = catchAsync(async (req, res, next) => {
  if (req.user.friendrequests.includes(req.params.touser)) {
    req.user.friendrequests = req.user.friendrequests.filter(
      (data) => String(data) != String(req.params.touser)
    );
  } else {
    return next(new AppError("Request not found!", 404));
  }
  await req.user.save();

  let notification = await Notification.find({
    requestfromuser: ObjectId(req.params.touser),
  });
  await notification[0].remove();
  res.status(200).json({
    status: "success",
    message: `You successfully reject this request`,
  });
});
exports.likecomment = catchAsync(async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentid);
  let likestatus = "";
  if (!comment.likes.includes(req.user._id)) {
    likestatus = "Liked";
    comment.likes.push(req.user._id);
  } else {
    likestatus = "Disliked";

    comment.likes = comment.likes.filter(
      (data) => String(data) != String(req.user._id)
    );
  }
  await comment.save();
  res.status(200).json({
    status: "success",
    message: `You ${likestatus} this comment`,
  });
});
exports.sharePost = catchAsync(async (req, res, next) => {
  let post = await Post.create({
    description: req.body.description,
    share: req.params.postid,
    postedBy: req.user._id,
  });
  res.status(200).json({
    status: "success",
    data: post,
  });
});
exports.addHWGA = catchAsync(async (req, res, next) => {
  let BMR = "";
  console.log(req.user.id);
  if (req.file) req.body.photo = req.file.filename;
  let newobj = {};
  let { height, weight, age, gender } = req.body;
  console.log(height, weight, age, gender);
  newobj.height = height;
  newobj.weight = weight;
  newobj.age = age;
  newobj.gender = gender;
  if (!height || !weight || !age || !gender) {
    return next(new AppError("data is missing !", 401));
  }
  if (gender === "male") {
    let W = Number(weight) * 6.23;
    // console.log(W);
    let H = Number(height) * 12.7;
    // console.log(H);
    let A = Number(age) * 6.8;
    // console.log(A);
    BMR = 66 + W + H - A;
    BMR = BMR * 1.2; // for no excercise
    BMR = BMR * 6; // Total per week
    BMR = BMR / 7; // Total per week
    // console.log(BMR);
  } else if (gender === "female") {
    let W = Number(weight) * 4.35;
    // console.log(W);
    let H = Number(height) * 4.7;
    // console.log(H);
    let A = Number(age) * 4.7;
    // console.log(A);
    BMR = 655 + W + H - A;
    BMR = BMR * 1.2; // for no excercise
    // console.log(BMR);
    BMR = BMR * 6; // Total per week
    BMR = BMR / 7; // Total per day
    // console.log(BMR);
  }
  req.user.height = Number(height);
  req.user.weight = Number(weight);
  req.user.age = Number(age);
  req.user.gender = gender;
  await req.user.save();
  res.status(200).json({
    status: "success",
    BMR: Number(BMR.toFixed(2)),
  });
});
exports.addpost = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (req.files.photo) {
    req.body.photo = `/img/users/${req.files.photo[0].filename}`;
  }
  if (req.files.video) {
    req.body.video = `/img/users/${req.files.video[0].filename}`;
  }
  let post = await Post.create({
    description: req.body.description,
    photo: req.body.photo,
    video: req.body.video,
    postedBy: req.user._id,
  });
  res.status(200).json({
    status: "success",
    data: post,
  });
});
exports.addcomment = catchAsync(async (req, res, next) => {
  let comment = await Comment.create({
    post: req.params.postid,
    description: req.body.description,
    user: req.user._id,
    mention: req.body.mention,
  });
  await Notification.create({
    title: "Comment Post",
    type: "Comment Post",
    message: `${req.user.name} Comment on your Post`,
    requestfromuser: req.user._id,
    postid: req.params.postid,
    user: [req.params.touser],
  });
  res.status(200).json({
    status: "success",
    data: comment,
  });
});
exports.sentmessagenotification = catchAsync(async (req, res, next) => {
  await Notification.create({
    title: req.body.title,
    type: "Message",
    message: req.body.message,
    requestfromuser: req.user._id,
    user: [req.params.touser],
  });
});
exports.getAllStories = catchAsync(async (req, res, next) => {
  let stories = await Story.aggregate([
    {
      $group: {
        _id: "$postedBy",
        shoutouts: {
          $addToSet: {
            _id: "$_id",
            video: "$video",
            photo: "$photo",
            description: "$description",
            CreatedAt: "$CreatedAt",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        as: "_id",
        let: { user: "$_id" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: stories,
  });
});
exports.changepassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("No User Found With That Id", 404));
  }
  if (req.body.password) {
    console.log("hi");
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your Current Password Is Wrong", 401));
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);
  }
  const userr = await User.findByIdAndUpdate(req.user.id, req.body).select(
    "+password"
  );
  res.status(200).json({
    status: "success",
    data: userr,
  });
});
exports.postStory = catchAsync(async (req, res, next) => {
  if (req.files.photo) {
    req.body.photo = `/img/users/${req.files.photo[0].filename}`;
  }
  if (req.files.video) {
    req.body.video = `/img/users/${req.files.video[0].filename}`;
  }
  let story = await Story.create({
    description: req.body.description,
    photo: req.body.photo,
    postedBy: req.user._id,
    video: req.body.video,
  });
  res.status(200).json({
    status: "success",
    data: story,
  });
});
exports.getUserById = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id).select(
    "name photo email phone friends friendrequests"
  );
  let post = await Post.aggregate([
    {
      $match: {
        postedBy: ObjectId(req.params.id),
      },
    },
    {
      $addFields: {
        isLiked: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $in: [req.user._id, "$likes"] },
            else: false,
          },
        },
      },
    },
    {
      $addFields: {
        likes: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $size: "$likes" },
            else: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        as: "comments",
        let: { user: "$_id" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$post"] }, // $_id consider as foreign key
            },
          },
          { $project: { description: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "posts",
        as: "share",
        let: { user: "$share" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          {
            $lookup: {
              from: "users",
              as: "postedBy",
              let: { user: "$postedBy" }, // consider as foreign key

              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
                  },
                },
                {
                  $project: {
                    name: 1,
                    photo: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        as: "postedBy",
        let: { user: "$postedBy" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
    {
      $addFields: {
        comments: {
          $cond: {
            if: { $isArray: "$comments" },
            then: { $size: "$comments" },
            else: 0,
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: user,
    post,
  });
});
exports.getAllPosts = catchAsync(async (req, res, next) => {
  let post = await Post.aggregate([
    {
      $addFields: {
        isLiked: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $in: [req.user._id, "$likes"] },
            else: false,
          },
        },
      },
    },
    {
      $addFields: {
        likes: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $size: "$likes" },
            else: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        as: "comments",
        let: { user: "$_id" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$post"] }, // $_id consider as foreign key
            },
          },
          { $project: { description: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "posts",
        as: "share",
        let: { user: "$share" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          {
            $lookup: {
              from: "users",
              as: "postedBy",
              let: { user: "$postedBy" }, // consider as foreign key

              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
                  },
                },
                {
                  $project: {
                    name: 1,
                    photo: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        as: "postedBy",
        let: { user: "$postedBy" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
    {
      $addFields: {
        comments: {
          $cond: {
            if: { $isArray: "$comments" },
            then: { $size: "$comments" },
            else: 0,
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: post,
  });
});
exports.getPostById = catchAsync(async (req, res, next) => {
  let post = await Post.aggregate([
    {
      $match: {
        _id: ObjectId(req.params.postid),
      },
    },

    {
      $addFields: {
        isLiked: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $in: [req.user._id, "$likes"] },
            else: false,
          },
        },
      },
    },
    {
      $addFields: {
        likes: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $size: "$likes" },
            else: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        as: "comments",
        let: { user: "$_id" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$post"] }, // $_id consider as foreign key
            },
          },
          { $project: { description: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "posts",
        as: "share",
        let: { user: "$share" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          {
            $lookup: {
              from: "users",
              as: "postedBy",
              let: { user: "$postedBy" }, // consider as foreign key

              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
                  },
                },
                {
                  $project: {
                    name: 1,
                    photo: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        as: "postedBy",
        let: { user: "$postedBy" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
    {
      $addFields: {
        comments: {
          $cond: {
            if: { $isArray: "$comments" },
            then: { $size: "$comments" },
            else: 0,
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: post,
  });
});
exports.deleteStoryById = catchAsync(async (req, res, next) => {
  let story = await Story.findById(req.params.id);
  await story.remove();
  res.status(200).json({
    status: "success",
    message: "Story Deleted",
  });
});
exports.deletePostById = catchAsync(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  await post.remove();
  res.status(200).json({
    status: "success",
    message: "Post Deleted",
  });
});
exports.getMyPosts = catchAsync(async (req, res, next) => {
  let skip = +req.params.stage - 1 * 5;
  let post = await Post.aggregate([
    {
      $match: {
        postedBy: req.user._id,
      },
    },
    { $skip: skip },
    { $limit: 5 },
    {
      $addFields: {
        isLiked: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $in: [req.user._id, "$likes"] },
            else: false,
          },
        },
      },
    },
    {
      $addFields: {
        likes: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $size: "$likes" },
            else: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        as: "comments",
        let: { user: "$_id" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$post"] }, // $_id consider as foreign key
            },
          },
          { $project: { description: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "posts",
        as: "share",
        let: { user: "$share" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          {
            $lookup: {
              from: "users",
              as: "postedBy",
              let: { user: "$postedBy" }, // consider as foreign key

              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
                  },
                },
                {
                  $project: {
                    name: 1,
                    photo: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        as: "postedBy",
        let: { user: "$postedBy" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
    {
      $addFields: {
        comments: {
          $cond: {
            if: { $isArray: "$comments" },
            then: { $size: "$comments" },
            else: 0,
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: post,
  });
});
exports.getPostComments = catchAsync(async (req, res, next) => {
  let comment = await Comment.aggregate([
    {
      $match: { post: ObjectId(req.params.postid) },
    },
    {
      $lookup: {
        from: "users",
        as: "user",
        let: { user: "$user" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        as: "mention",
        let: { user: "$mention" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
    {
      $addFields: {
        isLiked: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $in: [req.user._id, "$likes"] },
            else: false,
          },
        },
      },
    },

    {
      $addFields: {
        likes: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $size: "$likes" },
            else: 0,
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: comment,
  });
});
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  let notifications = await Notification.aggregate([
    {
      $redact: {
        $cond: [
          {
            $in: [req.user._id, "$user"],
          },
          "$$KEEP",
          "$$PRUNE",
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        as: "requestfromuser",
        let: { user: "$requestfromuser" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$user", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1, photo: 1 } },
        ],
      },
    },
    {
      $project: {
        title: 1,
        message: 1,
        requestfromuser: 1,
        CreatedAt: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    notifications,
  });
});
exports.getme = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
});
exports.like = catchAsync(async (req, res, next) => {
  let post = await Post.findById(req.params.postid);
  let finalStatus = "";
  if (post.likes.includes(req.user._id)) {
    post.likes = post.likes.filter(
      (data) => String(data) != String(req.user._id)
    );
    let notification = await Notification.find(
      {
        requestfromuser: ObjectId(req.user._id),
      },
      { postid: req.params.postid },
      { type: "Like Post" }
    );
    if (notification.length > 0) {
      await notification[0].remove();
    }
    finalStatus = "disliked";
  } else {
    post.likes.push(req.user._id);
    await Notification.create({
      title: "Like Post",
      type: "Like Post",
      message: `${req.user.name} Like your Post`,
      requestfromuser: req.user._id,
      postid: req.params.postid,
      user: [req.params.touser],
    });
    finalStatus = "liked";
  }
  await post.save();

  res.status(200).json({
    status: "success",
    message: finalStatus,
  });
});
exports.sendfriendrequest = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.touser);
  if (user.friendrequests.includes(req.user._id)) {
    return next(new AppError("Already sent!", 404));
  }
  if (user.friends.includes(req.user._id)) {
    return next(new AppError("You are already friends!", 404));
  }
  user.friendrequests.push(req.user._id);
  await user.save();
  await Notification.create({
    title: "New Friend Request",
    type: "Friend Request",
    message: `${req.user.name} Sent you a friend request`,
    requestfromuser: req.user._id,
    user: [req.params.touser],
  });
  res.status(200).json({
    status: "success",
    message: "Request Sent",
  });
});

exports.genderanddob = catchAsync(async (req, res, next) => {
  let bodytoin = ["gender", "dob"];
  let bodyenter = {};
  for (const property in req.body) {
    if (bodytoin.includes(property)) {
      bodyenter[property] = req.body[property];
    } else {
      return next(new AppError(`${property} is not allowed here!`, 400));
    }
  }
  if (req.file) {
    bodyenter.photo = `/img/users/${req.file.filename}`;
  }
  const user = await User.findByIdAndUpdate(req.user._id, bodyenter, {
    new: true,
    runValidators: true,
  }).select("+password");
  res.status(200).json({
    status: "success",
    data: user,
  });
});
// END
exports.getcarousels = catchAsync(async (req, res, next) => {
  let carousel = await Carousel.find();
  res.status(200).json({
    status: "success",
    data: carousel,
  });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }
  createSendToken(user, 200, req, res);
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  let products = await Product.find();
  res.status(200).json({
    status: "success",
    data: products,
  });
});
exports.getAllProductss = catchAsync(async (req, res, next) => {
  console.log(req.headers.ultra);
  if (req.headers.ultra === "okrebu") {
    let products = await Product.find();
    res.status(200).json({
      status: "success",
      data: products,
    });
  } else {
    return next(new AppError("Unauthorized", 401));
  }
});
exports.getpoints = catchAsync(async (req, res, next) => {
  let points = await Points.find();
  points = points.filter((item) => {
    if (`${item.prefix}${item.code}` === String(req.params.code)) {
      return true;
    } else {
      return false;
    }
  });
  if (points.length < 1) {
    return next(new AppError("Invalid Code", 401));
  }
  if (points[0].status === true) {
    return next(new AppError("Already Used", 401));
  }
  let pointspredict = await PointsPredict.find({
    prefix: String(points[0].prefix),
  });
  console.log(pointspredict[0].points);
  req.user.points += Number(pointspredict[0].points);
  await req.user.save();
  let singlepoint = await Points.findById(points[0]._id);
  singlepoint.status = true;
  await singlepoint.save();
  await CollectedPoint.create({
    user: req.user._id,
    points: pointspredict[0].points,
  });
  res.status(200).json({
    status: "success",
    points: pointspredict[0].points,
    data: `${pointspredict[0].points} points has been added`,
  });
});

exports.getAddedpoints = catchAsync(async (req, res, next) => {
  let Collected = await CollectedPoint.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: Collected,
  });
});

exports.generateOrder = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Email not found!", 401));
  }
  if (!req.body.phone) {
    return next(new AppError("phone not found!", 401));
  }
  if (!req.body.address) {
    return next(new AppError("address not found!", 401));
  }
  let products = [
    {
      id: "6231dc470367030e4bd13754",
      quantity: 2,
      points: 100,
    },
  ];
  console.log(req.user.points);
  if (Number(req.body.totalPoints) + 100 > Number(req.user.points)) {
    return next(
      new AppError("You dont have enough points to buy this order", 401)
    );
  } else {
    req.user.points -= Number(req.body.totalPoints) + 100;
    await req.user.save();
  }
  let ordernocheck = await Order.find({ orderno: req.body.orderno });
  if (ordernocheck.length > 0) {
    return next(new AppError("Generate Another Orderno", 401));
  } else {
  }
  let order = await Order.create({
    user: req.user._id,
    products,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    orderno: req.body.orderno,
    points: Number(req.body.totalPoints) + 100,
    ordertype: "Home Delivery",
  });
  res.status(200).json({
    status: "success",
    data: order,
    points: req.user.points,
  });
});
exports.clickandcollect = catchAsync(async (req, res, next) => {
  let store = await Store.findById(req.body.storeid);
  let products = [
    {
      id: "6231dc470367030e4bd13754",
      quantity: 2,
      points: 100,
    },
  ];
  if (Number(req.body.totalPoints) > Number(req.user.points)) {
    return next(
      new AppError("You dont have enough points to buy this order", 401)
    );
  } else {
    req.user.points -= Number(req.body.totalPoints);
    await req.user.save();
  }
  let ordernocheck = await Order.find({ orderno: req.body.orderno });
  if (ordernocheck.length > 0) {
    return next(new AppError("Generate Another Orderno", 401));
  } else {
  }
  let order = await Order.create({
    user: req.user._id,
    products,
    storename: store.name,
    email: store.email,
    phone: store.phone,
    address: store.address,
    orderno: req.body.orderno,
    ordertype: "Take Away",
    points: Number(req.body.totalPoints),
  });
  res.status(200).json({
    status: "success",
    data: order,
    points: req.user.points,
  });
});

exports.getmyorders = catchAsync(async (req, res, next) => {
  let myorders = await Order.find();
  myorders = myorders.filter((item) => {
    if (String(item.user) === String(req.user._id)) {
      return true;
    }
    return false;
  });
  let allProds = [];
  myorders.map((item) => {
    item.products.map((item2) => {
      allProds.push(Product.findById(item2.id));
    });
  });
  allProds = await Promise.all(allProds);
  console.log(allProds);
  myorders = myorders.map((item) => {
    item.products.map((item2) => {
      allProds.map((item3) => {
        if (String(item3._id) === String(item2.id)) {
          item2.id = item3;
        }
      });
    });
    return item;
  });
  // console.log(myorders)
  res.status(200).json({
    status: "success",
    myorders,
  });
});

exports.getAllCountries = catchAsync(async (req, res, next) => {
  let country = await Country.find();
  res.status(200).json({
    status: "success",
    data: country,
  });
});
exports.getAllRegions = catchAsync(async (req, res, next) => {
  let regions = await Region.find({ country: req.params.countryid });
  res.status(200).json({
    status: "success",
    data: regions,
  });
});
exports.getAllStores = catchAsync(async (req, res, next) => {
  let stores = await Store.find({ region: req.params.regionid });
  res.status(200).json({
    status: "success",
    data: stores,
  });
});
//RE BALANCE END

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id).select("+password");

//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError("Your Current Password Is Wrong", 401));
//   }
//   user.password = req.body.newPassword;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save({ validateBeforeSave: false });
//   // createSendToken(user, 200, req, res);
//   res.status(200).json({
//     status: "success",
//     data: {
//       user,
//     },
//   });
// });

// exports.addFriend = catchAsync(async (req, res, next) => {
//   let user = await User.findById(req.params.id);
//   if (!user) {
//     return next(new AppError("No User Found to request ", 404));
//   }
//   const checkRequests = req.user.requests.filter((account) => {
//     if (account.id == user._id) {
//       return true;
//     }
//     return false;
//   });
//   if (checkRequests.length > 0) {
//     return next(
//       new AppError(
//         `${user.name} has already sent you friend request. Accept it in requests list`,
//         404
//       )
//     );
//   }

//   let error1 = req.user.blocked.map((account) => {
//     if (String(account._id) == String(req.params.id)) {
//       return "throws";
//     }
//     return false;
//   });
//   if (error1 == "throws") {
//     return next(
//       new AppError(
//         `You blocked ${user.name}. Please Unblock to send request.`,
//         404
//       )
//     );
//   }

//   let error2 = req.user.blockedBy.map((account) => {
//     if (String(account._id) == String(req.params.id)) {
//       return "throws";
//     }
//     return false;
//   });
//   if (error2 == "throws") {
//     return next(
//       new AppError(`You are blocked by ${user.name}. Can't sent request.`, 404)
//     );
//   }

//   const checkRequestAlreadyExist = user.requests.filter((account) => {
//     if (account._id == req.user.id) {
//       return true;
//     }
//     return false;
//   });

//   if (checkRequestAlreadyExist.length > 0)
//     return next(new AppError("Already Request sent ", 404));

//   user.requests.push(req.user.id);

//   await user.save({ validateBeforeSave: false });

//   res.status(200).json({
//     status: "succcess",
//     message: `you sent request to ${user.name}`,
//   });
// });

// exports.allRequest = catchAsync(async (req, res, next) => {
//   res.status(200).json({
//     status: "succcess",
//     data: {
//       data: req.user.requests,
//     },
//   });
// });

// exports.declineRequest = catchAsync(async (req, res, next) => {
//   let doc = {};
//   let user = await User.findById(req.params.id);
//   if (req.user.requests.length > 0) {
//     const requestsAfterDecline = req.user.requests.filter((request) => {
//       if (req.params.id == request.id) {
//         return false;
//       }
//       return true;
//     });
//     if (requestsAfterDecline.length == req.user.requests.length) {
//       return next(
//         new AppError(`${user.name} never sent you friend request`, 404)
//       );
//     }

//     req.user.requests = requestsAfterDecline;

//     doc = await req.user.save({ validateBeforeSave: false });
//   } else {
//     return next(new AppError("This user have no Requests", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       data: doc,
//     },
//   });
// });

// exports.blockFriend = catchAsync(async (req, res, next) => {
//   let userToBlock = await User.findById(req.params.id);

//   let checkForBlock = userToBlock.blocked.filter((account) => {
//     if (String(account._id) == String(req.user._id)) {
//       return true;
//     }
//     return false;
//   });

//   if (checkForBlock.length > 0) {
//     return next(
//       new AppError(
//         `You are already blocked by ${userToBlock.name}. Now you cannot block ${userToBlock.name}`,
//         404
//       )
//     );
//   }

//   let checkIfAlreadyBlock = req.user.blocked.filter((account) => {
//     if (String(account._id) == String(userToBlock._id)) {
//       return true;
//     }
//     return false;
//   });
//   if (checkIfAlreadyBlock.length > 0) {
//     return next(new AppError(`You already blocked ${userToBlock.name}`, 404));
//   }

//   let FriendsAfterBlockedBy = [];
//   let FriendsAfterBlocked = [];
//   if (userToBlock) {
//     FriendsAfterBlocked = userToBlock.friends.filter((friend) => {
//       if (friend.id == req.user.id) {
//         return false;
//       }
//       return true;
//     });

//     FriendsAfterBlockedBy = req.user.friends.filter((friend) => {
//       if (friend.id == userToBlock.id) {
//         return false;
//       }
//       return true;
//     });

//     req.user.friends = FriendsAfterBlockedBy;
//     userToBlock.friends = FriendsAfterBlocked;

//     req.user.blocked.push(userToBlock.id);
//     userToBlock.blockedBy.push(req.user.id);
//     await userToBlock.save({ validateBeforeSave: false });
//     await req.user.save({ validateBeforeSave: false });
//   } else {
//     return next(new AppError("User Not Found To Block", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     message: `You Have Blocked ${userToBlock.name} successfully.`,
//   });
// });

// exports.unblockFriend = catchAsync(async (req, res, next) => {
//   // getting account of user to block
//   const userToBlock = await User.findById(req.params.id);
//   // if no user found with that id then throw an error
//   if (!userToBlock) {
//     return next(new AppError(`no user found with that Id`, 404));
//   }
//   // check if the user is available in my bloick list or not if yes then Update the user Array
//   const unblockedDone = req.user.blocked.filter((blockedUser) => {
//     if (blockedUser == userToBlock.id) {
//       return false;
//     }
//     return true;
//   });

//   if (unblockedDone.length == req.user.blocked.length) {
//     return next(
//       new AppError(`${userToBlock.name} is not in your block list`, 404)
//     );
//   }
//   req.user.blocked = unblockedDone;

//   // Update the blocked user Array

//   const unblockedDone2 = userToBlock.blockedBy.filter((user) => {
//     if (user == req.user.id) {
//       return false;
//     }
//     return true;
//   });
//   userToBlock.blockedBy = unblockedDone2;

//   // Save both users in database

//   await userToBlock.save({ validateBeforeSave: false });
//   await req.user.save({ validateBeforeSave: false });

//   res.status(200).json({
//     status: "succcess",
//     message: `${userToBlock.name} unblock done`,
//   });
// });

// exports.acceptRequest = catchAsync(async (req, res, next) => {
//   // find the record of friend request
//   const user = await User.findById(req.params.id);
//   if (!user) {
//     return next(new AppError("No User Found With That Id", 404));
//   }
//   const realRequests = req.user.requests.filter((requests) => {
//     if (requests.id != req.params.id) {
//       return true;
//     }
//     return false;
//   });
//   if (realRequests.length == req.user.requests.length) {
//     return next(
//       new AppError(`Friend Request of ${user.name} is not found`, 404)
//     );
//   }
//   // check if i already have that friend, if yes then place a error that "Already a friend"
//   const checkFriendOfMe = req.user.friends.filter((friends) => {
//     if (friends.id == req.params.id) {
//       return true;
//     }
//     return false;
//   });
//   if (checkFriendOfMe.length > 0) {
//     return next(new AppError("Already a friend", 404));
//   } else {
//     req.user.friends.push(req.params.id);
//   }

//   // check if he already have me as friend if yes then place a error that "Already a friend"

//   const checkFriendOfHim = user.friends.filter((friends) => {
//     if (friends.id == req.user.id) {
//       return true;
//     }
//     return false;
//   });

//   if (checkFriendOfHim.length > 0) {
//     return next(new AppError("Already a friend", 404));
//   } else {
//     user.friends.push(req.user.id);
//   }

//   // delete request after accept

//   req.user.requests = realRequests;

//   // Save Both Updated Accounts

//   const doc = await user.save({ validateBeforeSave: false });
//   const doc2 = await req.user.save({ validateBeforeSave: false });
//   res.status(200).json({
//     status: "succcess",
//     message: `you accepted ${user.name} request. ${user.name} is your friend now.`,
//   });
// });

// exports.getUser = catchAsync(async (req, res, next) => {
//   let query = User.findById(req.params.id);
//   const user = await query;

//   if (!user) {
//     return next(new AppError("No User Found With That Id", 404));
//   }

//   res.status(200).json({
//     status: "succcess",
//     data: {
//       data: user,
//     },
//   });
// });

// exports.updateUser = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id).select("+password");
//   if (!user) {
//     return next(new AppError("No User Found With That Id", 404));
//   }

//   user.name = req.body.name;
//   user.phonenumber = req.body.phonenumber;
//   user.bio = req.body.bio;
//   if (req.file) user.photo = req.file.filename;

//   await user.save({ validateBeforeSave: false });

//   res.status(200).json({
//     status: "success",
//     data: {
//       data: user,
//     },
//   });
// });
