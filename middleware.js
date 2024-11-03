const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Campground = require('./models/campground');
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError');

// Middleware để kiểm tra xem người dùng đã đăng nhập hay chưa
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// Middleware để kiểm tra xem người dùng có phải là tác giả của campground không
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!') //thông báo khi không có quyền
        return res.redirect(`/campgrounds/${id}`) //tránh gửi lại form khi reset trang
    }
    next();
}

// Middleware để kiểm tra xem người dùng có phải là tác giả của review không
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!') //thông báo khi không có quyền
        return res.redirect(`/campgrounds/${id}`) //tránh gửi lại form khi reset trang
    } //kiểm tra xem người dùng có phải là tác giả của campground không
    next();
}

// Middleware để kiểm tra dữ liệu campground từ form khi người dùng gửi 1 yêu cầu post hoặc put
module.exports.vaidateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Middleware để xác thực dữ liệu review từ form
module.exports.vaidateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Middleware để lưu lại URL trước đó
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}





