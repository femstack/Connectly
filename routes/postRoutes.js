const express = require("express");

const router = express.Router();

const {
  editProfile,
  updateProfile,
  getCreatePost,
  getPost,
  createpost,
  getFeed,
  addcomment,
  togglelike,
  toggleSave,
  changepassword,
} = require("../controllers/postController");

const { protect } = require("../middlewares/protect");

// console.log("protect:", typeof protect);
// console.log("getCreatePost:", typeof getCreatePost);

router.get("/create-post", protect, getCreatePost);

router.get("/post/:id", protect, getPost);

router.get("/feed", protect, getFeed);

router.post("/create-post", protect, createpost);

router.get("/edit-profile", protect, editProfile);

router.post("/edit-profile", protect, updateProfile);

router.post("/post/:id/comment", protect, addcomment);

router.post("/post/:id/like", protect, togglelike);

router.post("/post/:id/save", protect, toggleSave);

router.post("/profile/change-password", protect, changepassword);

module.exports = router;
