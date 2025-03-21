const express = require("express");
const { connectToMongoDb } = require("./connection");
require('dotenv').config();

const urlRoute = require("./routes/url");
const path = require("path");
const URL = require("./models/url");
const app = express();
const PORT = process.env.PORT || 8001;

connectToMongoDb(process.env.MONGO_URI).then(() =>
  console.log("mongo connected.")
);

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const staticRoute = require('./routes/staticRoutes');

app.use("/", staticRoute);

app.use("/url", urlRoute);

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
