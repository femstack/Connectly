const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const postmodel = require("../models/post");
const usermodel = require("../models/user");

const {
  updateProfileSchema,
  changePasswordSchema,
} = require("../validations/profilevalidation");

const addcomment = async (req, res) => {
  try {
    const text = (req.body.text || "").trim();

    if (!text) {
      return res.render("feed", { error: "Comment Cannot be empty" });
    }

    if (text.length > 2000) {
      return res.render("feed", { error: "Comment is too Long" });
    }

    const { id } = req.params;

    const post = await postmodel.findById(id);
    // console.log("STEP 5: Post found:", !!post);
    if (!post) {
      return res.render("feed", { error: "post not found" });
    }

    const userid = res.locals.currentuser._id.toString();
    const isAuthor = post.author.toString() === userid;

    if (post.audience.toLowerCase() !== "public" && !isAuthor) {
      // console.log("STEP 9: Permission denied");
      return res.render("feed", { error: "You Cannot Comment on this Post" });
    }

    post.comment.push({
      author: res.locals.currentuser._id,
      text,
    });

    await post.save();

    if (req.body.returnTo === "/feed") {
      return res.redirect("/feed");
    }

    res.redirect(`/post/${post._id}#comment`);
  } catch (error) {
    console.error("COMMENT ERROR:", error);

    return res.render("feed", { error: "Unable To add comment" });
  }
};

const getCreatePost = (req, res) => {
  const { success, error } = req.query;

  res.render("create-post", {
    success,
    error,
    currentuser: res.locals.currentuser,
  });
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const posts = await postmodel
      .findById(id)
      .populate("author", "fullname username")
      .populate("comment.author", "fullname username")
      .lean();

    if (!posts || !posts.author) {
      return res.render("post", { error: "Post Not Found" });
    }

    const userid = res.locals.currentuser._id.toString();
    const isAuthor = posts.author._id.toString() === userid;

    if (posts.audience !== "Public" && !isAuthor) {
      res.render("post", { error: "You Cannot view this Post" });
    }

    posts.isliked = posts.likes.some((id) => id.toString() === userid);

    posts.isSaved = posts.bookmarks.some((id) => id.toString() === userid);

    posts.isAuthor = isAuthor;
    posts.likeCount = posts.likes.length;
    posts.saveCount = posts.bookmarks.length;
    posts.commentCount = (posts.comment || []).length;
    // posts.commentCount = posts.comment.length;

    // posts.initials = getInitials(posts.author.fullname);

    // posts.comment.forEach((comm) => {
    //   comm.initials = getInitials(comment.author?.fullname);
    // });

    res.render("post", { post: posts, pageTitle: "Connectly - Post-Details" });
  } catch (error) {
    console.error("Error loading Post", error);
    return res.render("post", { error: "Unable To load the post" });
  }
};

const togglelike = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postmodel.findById(id);

    if (!post) {
      return res.render("post", { error: "post not found" });
    }

    const userid = res.locals.currentuser._id.toString();

    const alreadyliked = post.likes.some(
      (id) => id.toString() === userid.toString(),
    );

    if (alreadyliked) {
      post.likes.pull(userid);
    } else {
      post.likes.addToSet(userid);
    }

    await post.save();

    res.redirect(`/post/${post._id}`);
  } catch (error) {
    console.error("Like Error", error);
    return res.render("post", { error: "Unable To update like" });
  }
};

const toggleSave = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postmodel.findById(id);

    if (!post) {
      return res.render("post", { error: "post not found" });
    }

    const userid = res.locals.currentuser._id.toString();

    const alreadySaved = post.bookmarks.some(
      (id) => id.toString() === userid.toString(),
    );

    console.log(alreadySaved);

    if (alreadySaved) {
      post.bookmarks.pull(userid);
    } else {
      post.bookmarks.addToSet(userid);
    }

    await post.save();

    res.redirect(`/post/${post._id}`);
  } catch (error) {
    console.error("Save Error", error);
    return res.render("post", { error: "Unable To update save" });
  }
};

const getFeed = async (req, res) => {
  try {
    const posts = await postmodel
      .find()
      .populate("author", "fullname username, profilephoto")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const validpost = posts.filter((post) => post.author);

    const formattedpost = validpost.map((post) => ({
      ...post,

      isLiked: post.likes.some(
        (id) => id.toString() === res.locals.currentuser._id.toString(),
      ),

      isSaved: post.bookmarks.some(
        (id) => id.toString() === res.locals.currentuser._id.toString(),
      ),

      likeCount: post.likes.length,

      initials: post.author.fullname
        ? post.author.fullname
            .split("")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "U",

      timeAgo: post.createdAt
        ? new Date(post.createdAt).toLocaleString()
        : "Recently",
    }));

    const userPostCount = await postmodel.countDocuments({
      author: res.locals.currentuser._id,
    });

    res.render("feed", {
      posts: formattedpost,
      userPostCount,
      currentuser: res.locals.currentuser,
    });
  } catch (error) {
    console.error("Error loading Feed", error);
    return res.render("feed", { error: "Unable To load the feed" });
  }
};

const createpost = async (req, res) => {
  try {
    // console.log("Content-Type:", req.headers["content-type"]);
    // console.log("Body:", req.body);
    // console.log("Files:", req.files);
    // console.log("File input:", req.files?.media);

    const content = (req.body?.textContent || "").trim();
    const audience = req.body?.audience || "public";

    const allowedAudiences = ["Public", "Friends", "Only Me"];

    if (!allowedAudiences.includes(audience)) {
      return res.render("create-post", { error: "invaild audience selected" });
    }

    const media = req.files?.media;
    if (!content && !media) {
      res.render("create-post");
    }

    let mediaUrl = "";
    let mediaType = "";

    if (media) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
      ];

      if (!allowedTypes.includes(media.mimetype)) {
        res.render("create-post", {
          error: "Please Upload a Supported image or video",
        });
      }

      const extension = path.extname(media.name).toLowerCase(); //.jpg //.png

      const filename = `${crypto.randomUUID()}${extension}`;

      const uploadDirectory = path.join(__dirname, "../public/uploads");

      fs.mkdirSync(uploadDirectory, { recursive: true });

      const uploadPath = path.join(uploadDirectory, filename);

      await media.mv(uploadPath);

      mediaUrl = `/uploads/${filename}`;
      mediaType = media.mimetype.startsWith("image/") ? "image" : "video";

      await postmodel.create({
        author: res.locals.currentuser._id,
        content,
        audience,
        mediaUrl,
        mediaType,
      });
    }
    return res.redirect("/feed?success=Post Created SuccessFully!");
  } catch (error) {
    console.error("Error Creating Post", error);
    return res.render("create-post", { error: "Error creating post" });
  }
};

const saveimage = async (file) => {
  if (!file || file === 0) {
    return "";
  }

  const allowedType = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedType.includes(file.mimetype)) {
    res.render("edit-profile", {
      error: "Only JPG,PNG, and WebP images are allowed",
    });
  }

  //5MB
  if (file.size > 5 * 1024 * 1024) {
    res.render("edit-profile", {
      error: "Image must not exceed 5mb",
    });
  }

  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const filename = crypto.randomUUID() + "." + extensions[file.mimetype];

  const uploadDirectory = path.join(__dirname, "../public/uploads");

  await fs.promises.mkdir(uploadDirectory, {
    recursive: true,
  });

  await file.mv(path.join(uploadDirectory, filename));

  return `/uploads/${filename}`;
};

const editProfile = async (req, res) => {
  const user = await usermodel.findById(res.locals.currentuser._id);

  if (!user) {
    res.render("edit-profile", {
      error: "User not Found",
    });
  }

  const dobInput = user.dob
    ? new Date(user.dob).toISOString().slice(0, 10)
    : "";

  const { error, success } = req.query;

  res.render("edit-profile", { user, dobInput, error, success });
};

const updateProfile = async (req, res) => {
  try {
    const userId = res.locals.currentuser?._id;

    if (!userId) {
      return res.redirect("/login");
    }
    // console.log(userId);

    const formData = req.body;

    const { error, value } = updateProfileSchema.validate(formData, {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);

      console.log("Validation errors:", errors);

      return res.render("edit-profile", {
        user: res.locals.currentuser,
        errors,
        formData: req.body,
      });
    }
    // console.log("Validation passed");

    const user = await usermodel.findById(userId);
    // console.log("User found:", user);
    if (!user) {
      res.render("edit-profile", {
        error: "User not Found",
      });
    }
    // console.log(user);

    user.fullname = `${value.firstname} ${value.lastname}`.trim();
    user.bio = value.bio || "";
    user.location = value.location || "";
    user.website = value.website || "";
    user.dob = value.dob || null;
    user.email = value.email;
    user.username = value.username;
    user.gender = value.gender;
    user.twitter = value.twitter || "";
    user.instagram = value.instagram || "";
    user.linkedin = value.linkedin || "";

    if (req.files?.avatar) {
      const avatarPath = await saveimage(req.files.avatar);
      // console.log(avatarPath);
      if (avatarPath) {
        user.profilephoto = avatarPath;
      }
    }

    if (req.files?.cover) {
      const coverPath = await saveimage(req.files.cover);
      // console.log(coverPath);
      if (coverPath) {
        user.coverphoto = coverPath;
      }
    }

    await user.save();

    return res.redirect(`/profile/${user._id}`);
  } catch (error) {
    console.error("Error Updating Profile", error);
    if (error.message.includes("5MB") || error.message.includes("Only JPG")) {
      return res.render("edit-profile", error.message);
    }
    return res.render("edit-profile", { error: "Error Updating Profile" });
  }
};

const changepassword = async (req, res) => {
  try {
    const userId = res.locals.currentuser?._id;
    // console.log(userId);

    if (!userId) {
      return res.redirect("/login");
    }

    const formData = req.body;
    console.log(formData);

    const { error, value } = changePasswordSchema.validate(formData, {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      console.log("Validation errors:", error);

      return res.render("edit-profile", {
        user: res.locals.currentuser,
        passwordErrors: error.details.map((detail) => detail.message),
      });
    }

    const user = await usermodel.findById(userId);
    // console.log(user);

    if (!user) {
      res.render("edit-profile", {
        error: "User not Found",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      value.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      res.render("edit-profile", {
        error: "Your Current Password is Incorrect",
      });
    }

    user.password = await bcrypt.hash(value.newPassword, 12);

    await user.save();

    return res.redirect(`/profile/${user._id}/?success=passwordChanged`);
  } catch (error) {
    console.error("Change Password Error", error);
    if (res.headersSent) {
      return;
    }
    return res.render("edit-profile", {
      error: "Something went Wrong while Changing your Password",
    });
  }
};

module.exports = {
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
};
