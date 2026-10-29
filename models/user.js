const { required } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    // firstname: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // lastname: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    //profile information

    coverphoto: {
      type: String,
      default: "",
      required: true,
    },
    profilephoto: {
      type: String,
      default: "",
      required: true,
    },
    bio: {
      type: String,
      trim: true,
      mexlength: "300",
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["female", "male"],
    },
    dob: {
      type: Date,
      default: null,
    },
    twitter: {
      type: String,
      trim: true,
      default: "",
    },
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
    instagram: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("user", userSchema);
