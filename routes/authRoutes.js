const express = require("express");

const {
  getLogin,
  getRegister,
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");

const router = express.Router();

router.get("/login", getLogin);

router.post("/login", loginUser);

router.get("/register", getRegister);

router.post("/register", registerUser);

router.get("/logout", logoutUser);

module.exports = router;
