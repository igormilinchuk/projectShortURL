import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import "./styles.css";

const DOMAIN_URL = config.DOMAIN_URL;

const AddUrlComponent = () => {
  const [url, setUrl] = useState("");
  const [customShortUrl, setCustomShortUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    // Перевірка наявності URL
    if (!url.trim()) {
      alert("Будь ласка, введіть URL.");
      return;
    }

    // Перевірка формату дати
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (expiryDate && !expiryDate.match(dateRegex)) {
      alert("Будь ласка, введіть правильну дату закінчення у форматі YYYY-MM-DDTHH:MM.");
      return;
    }

    // Перевірка майбутньої дати
    const currentDateTime = new Date();
    const selectedDateTime = new Date(expiryDate);
    if (expiryDate && selectedDateTime <= currentDateTime) {
      alert("Будь ласка, введіть майбутню дату закінчення.");
      return;
    }

    try {
      // Відправка запиту на сервер для скорочення URL
      const response = await axios.post(`${DOMAIN_URL}/short`, {
        origUrl: url,
        customShortUrl: customShortUrl.trim() || null,
        expiryDate: expiryDate || null,
      });
      // Встановлення скороченого URL та очищення полів вводу
      setShortUrl(response.data.shortUrl);
      setUrl("");
      setCustomShortUrl("");
      setExpiryDate("");
    } catch (error) {
      console.error(error.message);
    }
  };

  const generateRandomUrl = () => {
    // Генерація випадкового короткого URL
    const possibleChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomUrl = "";
    for (let i = 0; i < 5; i++) {
      randomUrl += possibleChars.charAt(
        Math.floor(Math.random() * possibleChars.length)
      );
    }
    // Встановлення випадкового короткого URL
    setCustomShortUrl(randomUrl);
  };

  return (
    <div className="container">
      <div className="shortenerBox">
        <h1 className="header">Скорочувач URL</h1>
        <form onSubmit={onSubmit}>
          <div className="inputGroup">
            <input
              type="text"
              className="inputField"
              placeholder="Введіть URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              type="text"
              className="inputField"
              placeholder="Введіть короткий URL (необов'язково)"
              value={customShortUrl}
              onChange={(e) => setCustomShortUrl(e.target.value)}
            />
            <button
              type="button"
              className="generateButton"
              onClick={generateRandomUrl}
            >
              Згенерувати випадковий URL
            </button>
            <input
              type="datetime-local"
              className="inputField"
              placeholder="Введіть дату закінчення (необов'язково)"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <button type="submit" className="submitButton">
            Скоротити URL
          </button>
        </form>
        {shortUrl && (
          <div>
            <h2>Ваш скорочений URL:</h2>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUrlComponent;
