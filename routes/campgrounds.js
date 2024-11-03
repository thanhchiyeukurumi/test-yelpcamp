const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
var multer = require('multer');
const { storage } = require('../cloudinary');
var upload = multer({ storage });

const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');

const { isLoggedIn, isAuthor, vaidateCampground } = require('../middleware')

router.route('/')
    .get(catchAsync(campgrounds.index)) // Home page
    .post(isLoggedIn, upload.array('image'), vaidateCampground, catchAsync(campgrounds.createCampground)) // New campground;
    // New campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) // Show campground
    .put(isLoggedIn, isAuthor, upload.array('image'), vaidateCampground, catchAsync(campgrounds.updateCampground)) //EDIT
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //DELETE    
//EDIT
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;