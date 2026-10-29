const express = require("express");
const {
  getContact,
  submitContact,
  getHome,
  getAbout,
  getChatDetail,
  getDashboard,
  getEvent,
  getExplore,
  getFollowers,
  getForgetPassword,
  getFriends,
  getGroups,
  getMessage,
  getNotifications,
  getPhotos,
  getProfile,
  getSaved,
  getSearch,
  getSettings,
  getStories,
  getVideos,
} = require("../controllers/pageController");

const { protect } = require("../middlewares/protect");

const router = express.Router();

router.route("/contact").get(getContact).post(submitContact);
router.get("/", getHome);
router.get("/about", getAbout);
router.get("/chat-details", protect, getChatDetail);
router.get("/dashboard", protect, getDashboard);
router.get("/events", protect, getEvent);
router.get("/explore", protect, getExplore);
router.get("/followers", protect, getFollowers);
router.get("/forget-password", protect, getForgetPassword);
router.get("/friends", protect, getFriends);
router.get("/groups", protect, getGroups);
router.get("/message", protect, getMessage);
router.get("/notifications", protect, getNotifications);
router.get("/photos", protect, getPhotos);
router.get("/profile/:id", protect, getProfile);
router.get("/saved", protect, getSaved);
router.get("/search", protect, getSearch);
router.get("/settings", protect, getSettings);
router.get("/stories", protect, getStories);
router.get("/videos", protect, getVideos);

module.exports = router;
