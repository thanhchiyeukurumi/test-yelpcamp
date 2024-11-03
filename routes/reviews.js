const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review')
const {vaidateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, vaidateReview, catchAsync(reviews.createReview))
//review; can check loi thong qua postman 
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;