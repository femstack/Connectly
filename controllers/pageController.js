const contactModel = require("../models/contact");
const postmodel = require("../models/post");
const usermodel = require("../models/user");
const mongoose = require("mongoose");

const getContact = (req, res) => {
  const { success, error } = req.query;

  res.render("contact", { success, error });
};

const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    name = name?.trim();
    email = email?.trim();
    message = message?.trim();

    if (!name || !email || !message) {
      return res.render("contact", {
        error: "All fields are Required",
      });
    }

    await contactModel.create({
      name,
      email,
      message,
    });

    return res.redirect(
      "/contact?success=Your%20Message%20Has%20Been%20Submitted%20Successfully",
    );
  } catch (error) {
    console.log(error);

    return res.render("contact", {
      error: "Something Went Wrong, Please Try Again",
    });
  }
};

const getHome = (req, res) => {
  res.render("index");
};
const getAbout = (req, res) => {
  res.render("about");
};
const getChatDetail = (req, res) => {
  res.render("chat-details");
};

const getDashboard = (req, res) => {
  res.render("dashboard");
};
const getEvent = (req, res) => {
  res.render("events");
};
const getExplore = (req, res) => {
  res.render("explore");
};

const getFollowers = (req, res) => {
  res.render("followers");
};
const getForgetPassword = (req, res) => {
  res.render("forget-password");
};
const getFriends = (req, res) => {
  res.render("friends");
};
const getGroups = (req, res) => {
  res.render("groups");
};
const getMessage = (req, res) => {
  res.render("messages");
};
const getNotifications = (req, res) => {
  res.render("notifications");
};

const getPhotos = (req, res) => {
  res.render("photos");
};

const getProfile = async (req, res) => {
  try {
    const { success, error } = req.query;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.render("not-found", { error: "Invalid profile ID" });
    }

    const user = await usermodel.findById(id).select("-password").lean();

    //6cfe => everything about this id
    if (!user) {
      return res.render("profile", { error: "User not Found" });
    }

    const isOwner =
      res.locals.currentuser &&
      res.locals.currentuser._id.toString() === user._id.toString();

    let postQuery = { author: user._id };
    // console.log(postQuery);

    if (!isOwner) {
      postQuery.audience = "Public";
    }

    //postQuery === author: 6cfe => id has a post

    const posts = await postmodel
      .find(postQuery)
      .populate("author", "fullname username profilephoto")
      .sort({ createdAt: -1 })
      .lean();

    // console.log(posts);

    res.render("profile", {
      error,
      user,
      posts,
      isOwner,
      postCount: posts.length,
    });
  } catch (error) {
    console.error("Error loading Profile", error);
    return res.render("post", { error: "Unable To load your Profile" });
  }
};
const getSaved = (req, res) => {
  res.render("saved");
};
const getSearch = (req, res) => {
  res.render("search");
};
const getSettings = (req, res) => {
  res.render("settings");
};
const getStories = (req, res) => {
  res.render("stories");
};
const getVideos = (req, res) => {
  res.render("videos");
};

module.exports = {
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
};
