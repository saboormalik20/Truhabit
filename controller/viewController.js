const Admin = require("../model/adminModel");
const User = require("../model/userModel");
const axios = require("axios");
const Region = require("../model/regionModel");
const Store = require("../model/storeSchema");
const Points = require("../model/pointsModel");
const PointsPredict = require("../model/pointsPredict");
const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Emails = require("../utils/emails");
const Email = require("../utils/email");

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
exports.isLoggedIn = async (req, res, next) => {
  console.log("hii");
  if (req.cookies) {
    if (req.cookies.jwt) {
      try {
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
        const freshUser = await Admin.findById(decoded.id);
        // console.log(freshUser);
        //s
        if (!freshUser) {
          return next();
        }

        res.locals.user = freshUser;
        req.user = freshUser;
        req.jwt = req.cookies.jwt;

        console.log(req.user);

        return next();
      } catch (err) {
        return next();
      }
    }
  }
  console.log("hii");

  next();
  // if (true) {
  //   if (true) {
  //     console.log("ajjaja");
  //     try {
  //       const decoded = await promisify(jwt.verify)(
  //         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMzFkMmViMDNjMjI5YmQ3ZTVkMjM4YSIsImlhdCI6MTY0NzQzMjgyMiwiZXhwIjoxNjU1MjA4ODIyfQ.I8LztZsjyis86Fg24iCP5g0AKCBFs2zwcGNzflwcYXY",
  //         process.env.JWT_SECRET
  //       );
  //       const freshUser = await Admin.findById(decoded.id);
  //       // console.log(freshUser);
  //       //s
  //       if (!freshUser) {
  //         return next();
  //       }

  //       res.locals.user = freshUser;
  //       req.user = freshUser;
  //       req.jwt =
  //         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMzFkMmViMDNjMjI5YmQ3ZTVkMjM4YSIsImlhdCI6MTY0NzQzMjgyMiwiZXhwIjoxNjU1MjA4ODIyfQ.I8LztZsjyis86Fg24iCP5g0AKCBFs2zwcGNzflwcYXY";

  //       console.log(req.user);

  //       return next();
  //     } catch (err) {
  //       return next();
  //     }
  //   }
  // }
  // console.log("hii");

  // next();
};
exports.login = catchAsync(async (req, res, next) => {
  if (req.user) {
    let totals = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getTotals`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(totals.data);
    res.status(200).render("dashboard", { totals: totals.data });
  } else {
    res.status(200).render("login", {});
  }
});
exports.getorders = catchAsync(async (req, res, next) => {
  if (req.user) {
    let totals = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getAllOrders`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(totals.data.data);
    let allusers = [];
    totals.data.data.map((item) => {
      allusers.push(User.findById(item.user));
    });
    allusers = await Promise.all(allusers);
    totals.data.data.map((item, i) => {
      item.user = allusers[i];
      return item;
    });
    console.log(totals.data.data);
    res.status(200).render("orders", {
      orders: totals.data.data,
    });
  } else {
    res.status(200).render("login", {});
  }
});
exports.orderdetails = catchAsync(async (req, res, next) => {
  if (req.user) {
    let totals = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getOrderById/${req.params.id}`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(totals.data.data);
    totals.data.data.user = await User.findById(totals.data.data.user);

    let allprods = [];
    totals.data.data.products.map((item) => {
      allprods.push(Product.findById(item.id));
    });
    allprods = await Promise.all(allprods);

    totals.data.data.products = totals.data.data.products.map((item, i) => {
      item.fullproduct = allprods[i];
      return item;
    });

    console.log(totals.data.data);
    res.status(200).render("orderdetails", {
      product: totals.data.data,
    });
  } else {
    res.status(200).render("login", {});
  }
});
exports.coutries = catchAsync(async (req, res, next) => {
  if (req.user) {
    let totals = await axios.get(
      `http://localhost:3000/api/v1/admin/getAllCountries`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    let totalse = await axios.get(
      `http://localhost:3000/api/v1/admin/getregions`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(totalse.data);
    res.status(200).render("country", {
      countries: totals.data.data,
      regions: totalse.data.data,
    });
  } else {
    res.status(200).render("login", {});
  }
});
exports.notification = catchAsync(async (req, res, next) => {
  if (req.user) {
    let users = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getAllUsers`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(users.data.data);
    res.status(200).render("notifications", {
      data: users.data.data,
    });
  } else {
    res.status(200).render("login", {});
  }
});
exports.stores = catchAsync(async (req, res, next) => {
  if (req.user) {
    let totalse = await axios.get(
      `http://localhost:3000/api/v1/admin/getAllStores`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(totalse.data.data);
    res.status(200).render("store", {
      data: totalse.data.data,
    });
  } else {
    res.status(200).render("login", {});
  }
});
exports.getDashboard = catchAsync(async (req, res, next) => {
  if (req.user) {
    let totals = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getTotals`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(totals.data);
    res.status(200).render("dashboard", { totals: totals.data });
  } else {
    res.status(200).render("login", {});
  }
});
exports.getUsers = catchAsync(async (req, res, next) => {
  if (req.user) {
    let users = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getAllUsers`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(users.data.data);
    res.status(200).render("users", { users: users.data.data });
  } else {
    res.status(200).render("login", {});
  }
});
exports.getpoints = catchAsync(async (req, res, next) => {
  if (req.user) {
    let excelpoints = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getExcelPoints`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(excelpoints.data.excelpoints);
    res.status(200).render("points", {
      excel: excelpoints.data.excelpoints,
    });
  } else {
    res.status(200).render("login", {});
  }
});
exports.getproducts = catchAsync(async (req, res, next) => {
  if (req.user) {
    let products = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getAllProducts`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(products.data.data);
    res.status(200).render("products", {
      products: products.data.data,
    });
  } else {
    res.status(200).render("login", {});
  }
});
exports.getproductDetails = catchAsync(async (req, res, next) => {
  if (req.user) {
    let products = await axios.get(
      `https://rebalance.dejuretechnologies.com/api/v1/admin/getProductById/${req.params.id}`,
      {
        headers: {
          jwt: req.jwt,
        },
      }
    );
    console.log(products);
    res.status(200).render("productdetails", {
      product: products.data.product,
    });
  } else {
    res.status(200).render("login", {});
  }
});
