const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getLogin = (req, res) => {
  const { success, error } = req.query;

  res.render("login", { success, error });
};
const getRegister = (req, res) => {
  const { success, error } = req.query;

  res.render("register", { success, error });
};

const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password, confirmPassword } = req.body;

    if (
      !fullName?.trim() ||
      !username?.trim() ||
      !email?.trim() ||
      !password ||
      !confirmPassword
    ) {
      return res.render("register", { error: "All fields  are Required" });
    }

    const valid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!valid.test(email.trim())) {
      return res.render("register", { error: "Invaild Email" });
    }

    if (password.length < 6) {
      return res.render("register", {
        error: " Password must be at least 6 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.render("register", { error: "Passwords do not match" });
    }

    const normalEmail = email.trim().toLowerCase();
    const normalUsername = username.trim();

    const existingUser = await userModel.findOne({
      $or: [{ email: normalEmail }, { username: normalUsername }],
    });

    if (existingUser) {
      return res.render("register", {
        error: "Email or Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      fullname: fullName.trim(),
      username: normalUsername,
      email: normalEmail,
      password: hashedPassword,
    });

    return res.redirect("/login?success= Registration%20Successfully");
  } catch (error) {
    console.log(error);
    return res.render("register", {
      error: "Something Went Wrong, Please Try Again",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.render("login", { error: "Email and Password are Required" });
    }

    const normalEmail = email.trim().toLowerCase();

    const user = await userModel.findOne({
      email: normalEmail,
    });

    if (!user) {
      return res.render("login", { error: "Invaild Email or Password" });
    }

    const compare = await bcrypt.compare(password, user.password);

    if (!compare) {
      return res.render("login", { error: "Invaild Email or Password" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    return res.redirect("/feed");
  } catch (error) {
    return res.render("login", {
      error: "Something Went Wrong, Please Try Again",
    });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.redirect("/login");
};

module.exports = { getLogin, getRegister, registerUser, loginUser, logoutUser };
