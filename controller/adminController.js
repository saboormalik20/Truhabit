const Admin = require("../model/adminModel");
const Carousel = require("../model/carouselModel");
const Country = require("../model/countryModel");
const Region = require("../model/regionModel");
const Store = require("../model/storeSchema");
const Notification = require("../model/notificationsModel");
const PointsPredict = require("../model/pointsPredict");
const fetch = require("node-fetch");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
const User = require("../model/userModel");
const Points = require("../model/pointsModel");
const jwt = require("jsonwebtoken");
const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Emails = require("../utils/emails");
const Email = require("../utils/email");
const { resolve } = require("path");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken2 = async (user, statusCode, req, res) => {
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
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });
  res.status(statusCode).json({
    status: "success",
    token: tokens,
    data: {
      user,
    },
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
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password!", 400));
  }

  const user = await Admin.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }
  createSendToken(user, 200, req, res);
});
exports.addcarousel = catchAsync(async (req, res, next) => {
  console.log(req.file);
  if (req.file) {
    req.body.photo = `/img/users/${req.file.filename}`;
  }
  let carousel = await Carousel.create({
    photo: req.body.photo,
  });
  res.status(200).json({
    status: "success",
    data: carousel,
  });
});
exports.getUserById = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: user,
  });
});
exports.updateUserById = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 12);
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("+password");
  res.status(200).json({
    status: "success",
    user,
  });
});
exports.getExcelPoints = catchAsync(async (req, res, next) => {
  let excelpoints = await Points.find();
  res.status(200).json({
    status: "success",
    excelpoints,
  });
});
exports.login2 = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password!", 400));
  }

  const user = await Admin.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }
  createSendToken2(user, 200, req, res);
});
exports.createAdmin = catchAsync(async (req, res, next) => {
  const newUser = await Admin.create({
    name: req.body.name ?? next(new AppError("Name Is Required", 401)),
    email: req.body.email ?? next(new AppError("Email Is Required", 401)),
    password:
      req.body.password ?? next(new AppError("Password Is Required", 401)),
  });

  createSendToken(newUser, 201, req, res);
});
exports.createProduct = catchAsync(async (req, res, next) => {
  req.body.photo = req.file?.filename ?? undefined;
  let product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    points: Number(req.body.points),
    photo: req.body.photo ? `/img/users/${req.body.photo}` : undefined,
  });
  res.status(200).json({
    status: "success",
    data: product,
  });
});
exports.addCountry = catchAsync(async (req, res, next) => {
  let country = await Country.create({
    name: req.body.name,
  });
  res.status(200).json({
    status: "success",
    data: country,
  });
});
exports.addRegion = catchAsync(async (req, res, next) => {
  let region = await Region.create({
    name: req.body.name,
    country: req.body.country,
  });
  res.status(200).json({
    status: "success",
    data: region,
  });
});
exports.addStore = catchAsync(async (req, res, next) => {
  let store = await Store.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    country: req.body.country,
    region: req.body.region,
  });
  res.status(200).json({
    status: "success",
    data: store,
  });
});
exports.getTotals = catchAsync(async (req, res, next) => {
  let user = await User.find();
  let product = await Product.find();
  let order = await Order.find();
  res.status(200).json({
    status: "success",
    user: user.length,
    product: product.length,
    order: order.length,
  });
});
exports.addDesirePoints = catchAsync(async (req, res, next) => {
  let { prefix, points } = req.body;
  let pointsPredict = await PointsPredict.create({
    prefix,
    points,
  });
  res.status(200).json({
    status: "success",
    data: pointsPredict,
  });
});
exports.addExcel = catchAsync(async (req, res, next) => {
  let filename = req.file?.filename ?? undefined;
  console.log(filename);
  let sheetdata;
  let promisesInsert = [];
  let promisesaInsert = [];
  let alldone = [];
  fetch(`http://localhost:3000/img/users/${filename}`)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      sheetdata = xlsx.read(new Uint8Array(buffer, { type: "array" }));
      sheetdata.SheetNames.map((item) => {
        // sheetdata.Sheets[item] = sheetdata.Sheets[item]["!ref"] = undefined;
        let length = Object.keys(sheetdata.Sheets[item]).length;
        // console.log(sheetdata.Sheets[item]["!ref"]);
        let count = 0;

        let overall = Object.keys(sheetdata.Sheets[item]).length;
        new Promise((resolve, reject) => {
          Object.entries(sheetdata.Sheets[item]).forEach(([key, value]) => {
            promisesInsert.push(value);
            // console.log(count, overall);
            count++;
            if (count === overall) {
              resolve(promisesInsert);
            }
          });
        }).then(async (response) => {
          response = response.filter((item) => {
            if (typeof item != "object") {
              return false;
            } else {
              return true;
            }
          });
          let prefix = 0;
          let code = 0;
          let countt = 0;
          let promisesaInsert = [];
          console.log(countt);
          response.map((item) => {
            let ok = true;
            if (countt === 0 && ok === true) {
              ok = false;
              countt = 1;
              prefix = item.w;
            } else if (countt === 1 && ok === true) {
              ok = false;
              countt = 0;
              code = item.w;
              console.log("ajaj");
              promisesaInsert.push({
                prefix,
                code,
              });
            }
          });
          console.log(promisesaInsert);
          // let result = await Promise.all(promisesaInsert);
          // let result = await Points.find();
          res.status(200).json({
            status: "success",
            data: promisesaInsert,
          });
        });
      });
    })
    .catch((err) => console.error(err));
});
exports.getProductById = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  res.status(200).json({
    sttaus: "success",
    product,
  });
});
exports.deleteProductById = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id).remove();
  res.status(200).json({
    sttaus: "success",
  });
});
exports.getregions = catchAsync(async (req, res, next) => {
  let reg = await Region.aggregate([
    {
      $lookup: {
        from: "countries",
        as: "country",
        let: { country: "$country" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$country", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1 } },
        ],
      },
    },
    {
      $project: {
        country: { $first: "$country.name" },
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: reg,
  });
});
exports.getAllStores = catchAsync(async (req, res, next) => {
  let str = await Store.aggregate([
    {
      $lookup: {
        from: "countries",
        as: "country",
        let: { country: "$country" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$country", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1 } },
        ],
      },
    },

    {
      $lookup: {
        from: "regions",
        as: "region",
        let: { region: "$region" }, // consider as foreign key

        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$region", "$_id"] }, // $_id consider as foreign key
            },
          },
          { $project: { name: 1 } },
        ],
      },
    },
    {
      $project: {
        country: { $first: "$country.name" },
        region: { $first: "$region.name" },
        name: 1,
        email: 1,
        phone: 1,
        CreatedAt: 1,
        address: 1,
      },
    },
  ]);
  res.status(200).json({
    sttaus: "success",
    data: str,
  });
});
exports.deleteStorebyid = catchAsync(async (req, res, next) => {
  let str = await Store.findById(req.params.id);
  await str.remove();
  res.status(200).json({
    status: "success",
    data: str,
  });
});
exports.updateStorebyid = catchAsync(async (req, res, next) => {
  const str = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: str,
  });
});
exports.getStorebyid = catchAsync(async (req, res, next) => {
  let str = await Store.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: str,
  });
});
exports.getAllOrders = catchAsync(async (req, res, next) => {
  let orders = await Order.find();
  res.status(200).json({
    status: "success",
    data: orders,
  });
});
exports.getOrderById = catchAsync(async (req, res, next) => {
  let order = await Order.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: order,
  });
});
exports.getAllCountries = catchAsync(async (req, res, next) => {
  let count = await Country.find();
  res.status(200).json({
    status: "success",
    data: count,
  });
});
exports.sendNotifications = catchAsync(async (req, res, next) => {
  console.log(req.body.users);
  let notification = await Notification.create({
    user: JSON.parse(req.body.users),
    title: req.body.title,
    message: req.body.message,
  });
  res.status(200).json({
    status: "success",
    data: notification,
  });
});
exports.updateProductById = catchAsync(async (req, res, next) => {
  if (req.file) req.body.photo = `/img/users/${req.file.filename}`;

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: product,
  });
});
exports.addPointToDB = catchAsync(async (req, res, next) => {
  let points = await Points.create({
    prefix: req.params.prefix,
    code: req.params.code,
  });
  res.status(200).json({
    status: "succcess",
    points,
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  let users = await User.find();
  res.status(200).json({
    status: "success",
    data: users,
  });
});
exports.delUser = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  await user.remove();
  res.status(200).json({
    status: "success",
    data: "User Deleted",
  });
});
