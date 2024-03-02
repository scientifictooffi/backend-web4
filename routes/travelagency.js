const express = require("express");
const axios = require("axios");
const path = require("path");
const router = express.Router();
const bodyParser = require("body-parser");

// Используйте новый API ключ OpenWeather
const apiKey = "636ebfe4679db2ade2ee5f3673e5333a";

router.use(bodyParser.urlencoded({ extended: true }));

router.get("/travelagency", (req, res) => {
  const filePath = path.join(__dirname, "../public/html", "travelagency.html");
  res.sendFile(filePath);
});

router.post("/submitForm", (req, res) => {
  const adults = req.body.adults;
  const children = req.body.children;
  const phone = req.body.phone;
  const hotelRating = req.body.hotelRating;
  const dateArrival = req.body.dateArrival;
  const dateDeparture = req.body.dateDeparture;
  const cityName = req.body.cityName;
  let price = 500;
  // Назначение широты, долготы и базовой цены в зависимости от города
  switch (cityName) {
    case "Tokyo":
      lat = 35.01;
      lon = 135.76;
      price = 1000;
      break;
    case "Paris, France":
      lat = 48.8566;
      lon = 2.3522;
      price = 1500;
      break;
    case "New York City, USA":
      lat = 40.7128;
      lon = -74.006;
      price = 1700;
      break;
    case "Sydney, Australia":
      lat = -33.8688;
      lon = 151.2093;
      price = 800;
      break;
    case "Bangkok":
      lat = 13.7563;
      lon = 100.5018;
      price = 1100;
      break;
    case "Antalia":
      lat = 36.9;
      lon = 30.7;
      price = 700;
      break;
    default:
      lat = 55.7558;
      lon = 37.6173;
      price = 500;
      break;
  }

  // Изменение цены в зависимости от рейтинга отеля
  switch (hotelRating) {
    case "5":
      price += 500;
      break;
    case "4":
      price += 400;
      break;
    case "3":
      price += 300;
      break;
    case "2":
      price += 200;
      break;
    case "1":
      price += 100;
      break;
    default:
      price += 100;
      break;
  }

  price *= adults;
  if (children > 0) {
    price += 200 * children;
  }

  // Используйте URL OpenWeather API для получения погоды
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  axios.get(url)
    .then((response) => {
      const temp = response.data.main.temp; // Получение температуры из ответа OpenWeather
      const condition = response.data.weather[0].main; // Получение основного состояния погоды

      // Адаптируйте логику расчета цены на основе полученных данных о погоде
      if (temp < 10) {
        price += 200;
      }
      switch (condition) {
        case "Rain":
          price -= 100;
          break;
        case "Thunderstorm":
          price = 0;
          break;
        default:
          break;
      }

      if (price === 0) {
        const filePath = path.join(__dirname, "../public/html", "flightCanceled.html");
        res.sendFile(filePath);
      } else {
        res.render("result", {
          cityName,
          adults,
          children,
          phone,
          hotelRating,
          dateArrival,
          dateDeparture,
          price,
          temp,
          condition: condition // OpenWeather использует другие термины для состояния погоды
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

module.exports = router;