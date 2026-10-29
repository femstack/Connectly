const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const exphbs = require("express-handlebars");
const path = require("path");
dotenv.config();
const cookieparser = require("cookie-parser");
const expfileupld = require("express-fileupload");
const pageRoutes = require("./routes/pageRoute");
const authRoute = require("./routes/authRoutes");
const currentuser = require("./middlewares/currentuser");
const postRoute = require("./routes/postRoutes");
const paymentRoute = require("./routes/paymentRoutes");

const { getInitials, formatTime, timeAgo } = require("./utils/helpers");

const app = express();

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
    },
    helpers: {
      eq: (a, b) => a === b,
      getInitials,
      formatTime,
      timeAgo,
    },
  }),
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  expfileupld({
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
);
app.use(cookieparser());

app.use(currentuser);

app.use("/", pageRoutes);
app.use("/", authRoute);
app.use("/", postRoute);
app.use("/", paymentRoute);

const URL = process.env.MONGO_URL || "mongodb://localhost:27017/connectly";

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected To MongoDB");
  })
  .catch((error) => {
    console.log("Unable to Connect to MongoDB", error.message);
  });

app.use((req, res) => {
  res.status(404).render("not-found");
});

const PORT = process.env.PORT || 8050;
app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
