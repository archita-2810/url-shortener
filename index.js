const express = require("express");
const { connectToMongoDb } = require("./connection");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { checkForAuthentication, restrictTo} = require("./middlewares/auth");

const URL = require("./models/url");

const urlRoute = require("./routes/url");
const path = require("path");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDb("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("mongo connected.")
);

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);
const staticRoute = require('./routes/staticRoutes');

app.use("/", staticRoute);
app.use("/user", userRoute);
app.use("/url", restrictTo(['NORMAL']), urlRoute);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
            timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectUrl);
});

app.listen(PORT, () => console.log(`Port started on `, PORT));
