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

// Функція для перевірки та видалення неактивних посилань за закінченням терміну дії
const checkAndDeleteExpiredUrls = async () => {
  try {
    // Отримати всі посилання з закінченням часу менше поточного часу
    const expiredUrls = await Url.find({ expiryDate: { $lte: new Date() } });

    // Видалити всі знайдені неактивні посилання
    await Url.deleteMany({ expiryDate: { $lte: new Date() } });

    console.log(`${expiredUrls.length} expired URLs have been deleted.`);
  } catch (error) {
    console.error("Error checking and deleting expired URLs:", error);
  }
};


// Почати перевірку і видалення застарілих URL при старті сервера
checkAndDeleteExpiredUrls();

// Регулярно запускати функцію checkAndDeleteExpiredUrls, наприклад, кожні 24 години
setInterval(checkAndDeleteExpiredUrls, 60 * 1000);

// Отримати всі збережені URL
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
  
  // Встановлюємо дефолтний час (1 хвилина) якщо користувач не вказав expiryDate
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
        expiryDate: expiryDate || defaultExpiryDate, // Встановлення дефолтного значення
      });

      await url.save();

      // Відправляємо посилання зі збереженим expiryDate на фронтенд
      return res.json(url);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
});

// Запит на отримання кількості переходів за коротким посиланням
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

// Запит на перенаправлення за коротким посиланням
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  try {
    // Очистимо параметри запиту, якщо вони є
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
