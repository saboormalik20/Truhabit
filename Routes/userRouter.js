const express = require("express");
const User = require("../model/userModel");
const userController = require("../controller/userController");

const router = express.Router();

router.post("/login", userController.uploadUserPhoto, userController.login);

router
  .route("/signup")
  .post(userController.uploadUserPhoto, userController.createUser);
router.route("/socialUser/:emailorid").post(userController.createSocialUser);
router
  .route("/genderanddob")
  .patch(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.genderanddob
  );
router
  .route("/updateSocilalUser")
  .patch(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.updateSocialUser
  );
router
  .route("/searchpeople/:input")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.searchpeople
  );
router
  .route("/sendfriendrequest/:touser")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.sendfriendrequest
  );
router
  .route("/getme")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.getme
  );
router
  .route("/getMyNotifications")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.getMyNotifications
  );
router
  .route("/acceptrequest/:touser")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.acceptrequest
  );
router
  .route("/rejectrequest/:touser")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.rejectrequest
  );
router
  .route("/addpost")
  .post(
    userController.protect(User),
    userController.uploadPhotoVideoPost,
    userController.addpost
  );
router
  .route("/addcomment/:postid")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.addcomment
  );

router
  .route("/likecomment/:commentid")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.likecomment
  );

router
  .route("/sentmessagenotification/:touser")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.sentmessagenotification
  );
router
  .route("/postStory")
  .post(
    userController.protect(User),
    userController.uploadPhotoVideoPost,
    userController.postStory
  );
router
  .route("/getAllStories")
  .get(
    userController.protect(User),
    userController.uploadPhotoVideoPost,
    userController.getAllStories
  );
router
  .route("/deleteStoryById/:id")
  .post(
    userController.protect(User),
    userController.uploadPhotoVideoPost,
    userController.deleteStoryById
  );
router
  .route("/addHWGA")
  .patch(
    authenticationController.protect(User),
    userController.uploadUserPhoto,
    userController.addHWGA
  );
router
  .route("/deletePostById/:id")
  .post(
    userController.protect(User),
    userController.uploadPhotoVideoPost,
    userController.deletePostById
  );
router
  .route("/changepassword")
  .patch(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.changepassword
  );
// router
//   .route("/addcomment/:postid")
//   .post(
//     userController.protect(User),
//     userController.uploadUserPhoto,
//     userController.addcomment
//   );
router
  .route("/like/:postid")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.like
  );
router
  .route("/getUserById/:id")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.getUserById
  );
router
  .route("/getAllPosts")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.getAllPosts
  );
router
  .route("/getPostById/:postid")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.getPostById
  );
router
  .route("/getMyPosts/:stage")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.getMyPosts
  );
router
  .route("/getPostComments/:postid")
  .get(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.getPostComments
  );
router
  .route("/sharePost/:postid")
  .post(
    userController.protect(User),
    userController.uploadUserPhoto,
    userController.sharePost
  );
router.route("/forgotpassword/:email").post(userController.forgotpassword);
router
  .route("/resetpassword/:userid")
  .post(userController.uploadUserPhoto, userController.resetpassword);
// router
//   .route("/BodyFat")
//   .patch(
//     userController.protect(User),
//     userController.uploadUserPhoto,
//     userController.BodyFat
//   );
module.exports = router;
