const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const { validateReview, isLoggedIn, isAuthor} = require("../middleware.js");

const reviewController = require("../controllers/review.js");
const review = require("../models/review.js");

//Create Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync (reviewController.create));

//Delete Review Route
router.delete("/:reviewId", isLoggedIn,isAuthor, wrapAsync (reviewController.delete));

module.exports = router;