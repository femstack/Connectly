const axios = require("axios");
const crypto = require("crypto");

const usermodel = require("../models/user");
const paymentmodel = require("../models/payment");

const premium = (req, res) => {
  const { error, success } = req.query;
  res.render("premium", {
    pageTitle: "Premium",
    premiumPrice: "5,000",
    premiumCurrency: "NGN",
    error,
    success,
  });
};
const paymentHistory = async (req, res) => {
  try {
    const userId = res.locals.currentuser._id;

    const payments = await paymentmodel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const paymentSuccessful = payments.filter((payment) => {
      return payment.status === "success";
    });

    const totalPaid = paymentSuccessful.reduce(
      (total, payment) => (total + payment.amount, 0),
    );

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const formattedPayments = payments.map((payment) => ({
      ...payment,

      displayAmount: (payment.amount / 100).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),

      displayDate: new Date(
        payment.paidAt || payment.createdAt,
      ).toLocaleDateString("en-NG", options),
    }));

    res.render("payment-history", {
      payments: formattedPayments,
      successfulPayments: paymentSuccessful.length,
      totalPayments: payments.length,
      totalPaid: (totalPaid / 100).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    });
  } catch (error) {
    console.error("payment history error", error.message);

    return res.render("not-found");
  }
};
const paymentResult = (req, res) => {
  res.render("payment-result");
};
const checkout = async (req, res) => {
  try {
    const { error, success } = req.query;

    const user = await usermodel.findById(res.locals.currentuser._id);

    if (!user) {
      return res.redirect("/login");
    }

    res.render("checkout", {
      pageTitle: "Checkout",
      error,
      success,
      premiumPrice: "5,000",
      premiumCurrency: "NGN",
      userEmail: user.email,
    });
  } catch (error) {
    console.error("checkout page error", error.message);
    return res.render("not-found");
  }
};
// / transaction / initialize;
const PAYSTACK_URL = "https://api.paystack.co";

const premiumAmount = Number(process.env.PREMIUM_AMOUNT);
const premiumDays = Number(process.env.PREMIUM_DAYS);
const premiumCurrency = String(process.env.PREMIUM_CURRENCY);

const getPaystackClient = () => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing");
  }

  if (!Number.isSafeInteger(premiumAmount) || premiumAmount <= 0) {
    throw new Error("PERMIUM_AMOUNT must be a vaild integer");
  }

  if (!Number.isSafeInteger(premiumDays) || premiumDays <= 0) {
    throw new Error("PERMIUM_DAYS must be a vaild integer");
  }

  return axios.create({
    baseURL: PAYSTACK_URL,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });
};

const initializePayment = async (req, res) => {
  try {
    const user = await usermodel.findById(res.locals.currentuser._id);

    if (!user) {
      return res.redirect("/login");
    }

    const reference = `CONN-${Date.now()}-${user._id}`;

    await paymentmodel.create({
      user: user._id,
      reference,
      amount: premiumAmount,
      currency: premiumCurrency,
      status: "pending",
    });

    const paystack = getPaystackClient();

    const response = await paystack.post("/transaction/initialize", {
      email: user.email,
      amount: premiumAmount,
      currency: premiumCurrency,
      reference,
      callback_url: `${process.env.PAYSTACK_CALLBACK_URL}`,
    });

    return res.redirect(response.data.data.authorization_url);
  } catch (error) {
    console.error(
      "Payment initialization error",
      error.response?.data || error.message,
    );

    return res.redirect("/checkout?error=payment_initialization_failed");
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    // console.log(reference);

    if (!reference) {
      return res.redirect("/checkout?error=missing_reference");
    }

    const payment = await paymentmodel.findOne({ reference });

    if (!payment) {
      res.redirect("/checkout?error=payment_not_found");
    }

    if (payment.status === "success") {
      res.redirect("/checkout");
    }

    const paystack = getPaystackClient();

    const response = await paystack.get(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );

    const transaction = response.data.data;

    if (transaction.status !== "success") {
      payment.status = "falied";

      await payment.save();

      res.redirect("/checkout?error=payment_ not_successful");
    }

    if (
      transaction.reference !== payment.reference ||
      transaction.amount !== payment.amount ||
      transaction.currency !== payment.currency
    ) {
      return res.redirect("/checkout?error=payment_verification_failed");
    }

    const user = await usermodel.findById(payment.user);

    if (!user) {
      res.redirect("/checkout?error=user_not_found");
    }

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const now = new Date().toLocaleDateString("en-US", options);

    payment.status = "success";
    payment.paidAt = now;

    await payment.save();

    return res.redirect("/premium?success=Payment_Successfull");
  } catch (error) {
    console.error(
      "Payment verification error",
      error.response?.data || error.message,
    );

    return res.redirect("/checkout?error=payment_verification_failed");
  }
};

module.exports = {
  premium,
  paymentHistory,
  paymentResult,
  checkout,
  initializePayment,
  verifyPayment,
};
