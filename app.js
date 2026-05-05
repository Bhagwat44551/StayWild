if (process.env.NODE_ENV !== "production") {
require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const Path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session'); 
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const { iscurrentPath } = require('./middleware.js');

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.set("view engine", "ejs");
app.set("views", Path.join(__dirname, "/views"));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(Path.join(__dirname, "/public")));

// const MONGO_URL = mongodb:'mongodb://127.0.0.1:27017/wanderlust';
const DbUrl = process.env.ATLASDB_URL; 

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(DbUrl);
}

const store = MongoStore.create({
    mongoUrl: DbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600, // time period in sec
});

store.on("error", () => {
    console.log("Error in SeESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*3600*1000, // 7 days
        maxAge: 7*24*3600*1000,
        httpOnly:true,
    },
};


// Passport authentication
app.use(session(sessionOptions));
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());


// Locals for flash messages and current user
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
    });

// Custom Middleware to track current path
app.use(iscurrentPath);

//  privacy & terms routes here
app.get("/privacy", (req, res) => {
  res.render("privacy");
});

app.get("/terms", (req, res) => {
  res.render("terms");
});

//Using required routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Middleware to check if pages are not found
app.all("*splat", (req, res, next) => {
   next(new ExpressError(404, "Page not Found!"));
});

// Error handling and generating middleware
app.use((err, req, res, next) => {
    console.error("ERROR:", err);
    let {statusCode = 500, message="Something went Wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

// Starting the server
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

