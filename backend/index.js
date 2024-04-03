const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shortid = require("shortid");
const Url = require("./url");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {});
    console.log("Connected to database successfully");
  } catch (error) {
    console.error('Could not connect to database:', error.message);
  }
};
connectDB();

const checkAndDeleteExpiredUrls = async () => {
  try {
    const expiredUrls = await Url.find({ expiryDate: { $lte: new Date() } });

    await Url.deleteMany({ expiryDate: { $lte: new Date() } });

    console.log(`${expiredUrls.length} expired URLs have been deleted.`);
  } catch (error) {
    console.error("Error checking and deleting expired URLs:", error);
  }
};


checkAndDeleteExpiredUrls();

setInterval(checkAndDeleteExpiredUrls, 60 * 1000);

app.get("/all", async (req, res, next) => {
  try {
    const data = await Url.find().exec();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.post("/short", async (req, res) => {
  const { origUrl, customShortUrl, expiryDate } = req.body;

  const base = "http://localhost:3333";

  const defaultExpiryDate = new Date();
  defaultExpiryDate.setMinutes(defaultExpiryDate.getMinutes() + 1);

  try {
    let url = await Url.findOne({ origUrl });
    if (url) {
      return res.json(url);
    } else {
      const urlId = customShortUrl || shortid.generate();
      const shortUrl = `${base}/${urlId}`;

      url = new Url({
        origUrl,
        shortUrl,
        urlId,
        expiryDate: expiryDate || defaultExpiryDate, 
      });

      await url.save();

      return res.json(url);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
});

app.get("/clicks/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  try {
    const url = await Url.findOne({ urlId: shortUrl });
    if (url) {
      return res.json({ clickCount: url.clickCount });
    } else {
      return res.status(404).json("URL not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json("Server Error");
  }
});

app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  try {
    const cleanShortUrl = shortUrl.split('?')[0];
    const url = await Url.findOneAndUpdate(
      { urlId: cleanShortUrl },
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    if (url) {
      return res.redirect(url.origUrl);
    } else {
      return res.status(404).json("URL not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json("Server Error");
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
