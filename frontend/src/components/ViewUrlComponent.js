import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import config from "../config";
import "./styles.css";

const DOMAIN_URL = config.DOMAIN_URL;

const ViewUrlComponent = () => {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const result = await axios.get(`${DOMAIN_URL}/all`);
        setUrls(result.data);
      } catch (error) {
        console.error("Помилка при отриманні URL-адрес:", error);
      }
    };
    fetchUrls();
  }, []);

  return (
    <div className="container">
      <div className="viewShortenedBox">
        <h1 className="header">Перегляд скорочених URL</h1>
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>Оригінальний URL</th>
              <th>Скорочений URL</th>
              <th>Кількість кліків</th>
              <th>Дата закінчення</th>
            </tr>
          </thead>
          <tbody>
            {/* Відображення усіх скорочених URL */}
            {urls.map((url, idx) => (
              <tr key={url.shortUrl}>
                <td style={{ whiteSpace: "normal", wordBreak: "break-all" }}>{url.origUrl}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {url.shortUrl}
                  </a>
                </td>
                <td style={{ whiteSpace: "normal", wordBreak: "break-all" }}>{url.clickCount}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
                  {url.expiryDate
                    ? format(new Date(url.expiryDate), "yyyy-MM-dd HH:mm:ss")
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewUrlComponent;
