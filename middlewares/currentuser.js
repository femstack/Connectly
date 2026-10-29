const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const currentuser = async (req, res, next) => {
  try {
    res.locals.currentuser = null;

    const token = req.cookies?.token;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel
      .findById(decoded.userId)
      .select("-password")
      .lean();

    if (user) {
      res.locals.currentuser = user;
    }
  } catch (error) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  next();
};

module.exports = currentuser;
