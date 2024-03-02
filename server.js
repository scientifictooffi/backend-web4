const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
const static = require("./routes/static");
app.set("view engine", "ejs");
const trvl = require("./routes/travelagency");
app.use(express.static("public"));

app.use("/", static);
app.use("/", trvl);
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const connectionString =
  "mongodb+srv://220613:Erlan123@cluster0.ma97boq.mongodb.net/";
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const tourBookingSchema = new mongoose.Schema({
  adults: Number,
  children: Number,
  phone: String,
  hotelRating: Number,
  dateArrival: Date,
  dateDeparture: Date,
  cityName: String,
  price: Number,
  timestamp: { type: Date, default: Date.now },
});

const TourBooking = mongoose.model("TourBooking", tourBookingSchema);

// Пример добавления маршрута для бронирования тура
app.post("/bookTour", async (req, res) => {
  const {
    adults,
    children,
    phone,
    hotelRating,
    dateArrival,
    dateDeparture,
    cityName,
    price,
  } = req.body;
  const newTourBooking = new TourBooking({
    adults,
    children,
    phone,
    hotelRating,
    dateArrival,
    dateDeparture,
    cityName,
    price,
  });

  try {
    await newTourBooking.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error booking tour:", error);
    res.status(500).send("Error booking tour");
  }
});

app.get("/travelagency", async (req, res) => {
  try {
    const bookings = await TourBooking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// POST - Создание нового бронирования
app.post("/travelagency", async (req, res) => {
  try {
    const newBooking = new TourBooking(req.body);
    await newBooking.save();
    res.status(201).send(newBooking);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/tours", async (req, res) => {
  try {
    const tours = await TourBooking.find();
    res.send(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT - Обновление бронирования по ID (заменяет объект целиком)
app.put("/travelagency/:id", async (req, res) => {
  try {
    const updatedBooking = await TourBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).send("Booking not found");
    }
    res.send(updatedBooking);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PATCH - Частичное обновление бронирования по ID
app.patch("/travelagency/:id", async (req, res) => {
  try {
    const updatedBooking = await TourBooking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).send("Booking not found");
    }
    res.send(updatedBooking);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// DELETE - Удаление бронирования по ID
app.delete("/travelagency/:id", async (req, res) => {
  try {
    const deletedBooking = await TourBooking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).send("Booking not found");
    }
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const session = require("express-session");

const helmet = require("helmet");
app.use(helmet());

//KEY
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("index", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? req.user.username : null, // Только если вы также хотите отобразить имя пользователя
  });
});

module.exports = User;

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: "Incorrect username." });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Использование:
app.get("/protected-route", checkAuthenticated, (req, res) => {
  res.send("Доступ разрешен");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});
