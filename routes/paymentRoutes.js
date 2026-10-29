const express = require("express");

const router = express.Router();

const {
  premium,
  paymentHistory,
  paymentResult,
  checkout,
  initializePayment,
  verifyPayment,
} = require("../controllers/paymentController");

const { protect } = require("../middlewares/protect");

router.get("/premium", premium);

router.get("/checkout", protect, checkout);

router.post("/checkout", protect, initializePayment);

router.get("/payment-history", protect, paymentHistory);

router.get("/payment-result", protect, paymentResult);

router.get("/payment/verify", verifyPayment);

module.exports = router;
