if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize');


const helmet = require('helmet');
// Import các model
const User = require('./models/user');
// Import các route
const campgroundsRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');
const usersRoute = require('./routes/users');

// Import các tiện ích và middleware tùy chỉnh
const ExpressError = require('./utils/ExpressError');
const { name } = require('ejs');

// Kết nối tới MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
//process.env.DB_URL;
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();
// Cấu hình view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
/** 
 * Chỉ định EJS làm viewengine mặc định, Express sẽ tự động render các file có đuôi .ejs
 * vd: res.render('filename')
*/
app.set('views', path.join(__dirname, 'views'));
/**
 * Mục đích: Dòng lệnh này thiết lập thư mục chứa các file view cho ứng dụng. path.join(__dirname, 'views') 
 * Tạo ra một đường dẫn chính xác đến thư mục views trong thư mục gốc của dự án, 
 * đảm bảo rằng ứng dụng sẽ tìm kiếm các file EJS trong thư mục này.
 * Kết quả: Khi bạn gọi res.render('filename'), Express sẽ tìm file EJS trong thư mục views mà bạn đã thiết lập,
 * giúp dễ dàng quản lý và tổ chức các file view. 
*/

// Middleware
app.use(express.urlencoded({ extended: true })); // Để phân tích các yêu cầu POST với dữ liệu URL-encoded
app.use(methodOverride('_method')); // Để hỗ trợ các phương thức HTTP không chuẩn (như PUT hoặc DELETE) từ các form HTML
app.use(express.static(path.join(__dirname, 'public'))); // Để phục vụ các file tĩnh từ thư mục 'public'
app.use(mongoSanitize({
    replaceWith: '_'
})); // Middleware này sẽ ngăn chặn các cuộc tấn công NoSQL Injection bằng cách loại bỏ các ký tự đặc biệt từ các truy vấn gửi đến máy chủ MongoDB.    

// Cấu hình session 
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    secret,
});

store.on('error', function (e) {
    console.log('Session Store Error', e)
})
const sessionConfig = {
    store, // Lưu session vào MongoDB
    name: 'session', // Tên của cookie được gửi tới trình duyệt
    secret, // Chuỗi bí mật được sử dụng để ký session ID cookie. Điều này giúp bảo vệ session khỏi các cuộc tấn công giả mạo.
    resave: false, //Nếu false, session sẽ không được lưu lại vào store nếu không có thay đổi nào. Điều này giúp giảm tải cho store.
    saveUninitialized: true, //Nếu true, session mới nhưng chưa được khởi tạo sẽ được lưu vào store. Điều này hữu ích cho việc theo dõi người dùng mới.
    cookie: {
        httpOnly: true, //Nếu true, cookie sẽ không thể truy cập được từ JavaScript phía client, giúp bảo vệ khỏi các cuộc tấn công XSS.
        //secure: true, //Nếu true, cookie chỉ được gửi qua HTTPS.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Thời gian hết hạn của cookie
        maxAge: 1000 * 60 * 60 * 24 * 7, //Thời gian sống tối đa của cookie
    }
}
/**
 * Khi người dùng truy cập vào trang web, một session mới sẽ được tạo ra và lưu trữ trên máy chủ.
 * Một cookie chứa session ID sẽ được gửi tới trình duyệt của người dùng.
 * Trình duyệt sẽ lưu trữ cookie này và gửi nó kèm theo mỗi yêu cầu HTTP tới máy chủ.
 * Máy chủ sẽ sử dụng session ID từ cookie để truy xuất thông tin session tương ứng từ store.
 */
app.use(session(sessionConfig));
app.use(flash()); // Quản lý flash messages

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dsimlypyu/", 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
                "https://nrs.objectstore.gov.bc.ca"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize()); // Khơi tạo passport, chuẩn bị nó cho việc xác thực
app.use(passport.session()); // Dùng session để theo dõi người dùng đã đăng nhập
passport.use(new LocalStrategy(User.authenticate())); // Khi người dùng gửi yêu cầu đăng nhập với tên đăng nhập và mật khẩu, Passport.js sẽ sử dụng chiến lược này để xác thực người dùng.
passport.serializeUser(User.serializeUser()); // Khi người dùng đăng nhập thành công, Passport.js sẽ lưu trữ ID của người dùng vào session để duy trì trạng thái đăng nhập giữa các yêu cầu HTTP.
passport.deserializeUser(User.deserializeUser()); // Khi người dùng gửi yêu cầu HTTP tiếp theo, Passport.js sẽ sử dụng hàm này để lấy thông tin người dùng từ session và gán nó vào req.user.
 
// Middleware để thiết lập các biến cục bộ cho flash messages
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Thiết lập biến currentUser cho tất cả các views (biến cục bộ)
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Sử dụng các route
app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);
app.use('/', usersRoute);
// Trang chủ cho có    
app.get('/', (req, res) => {
    res.render('home');
});

// 404
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404)); // Cái này next đến middleware ở dưới chứ không phải chuyển sang ExpressError
});

// Middleware xử lý tất cả lỗi được chuyển đến
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error.ejs', { err });
});

const port = process.env.PORT || 3000;
// Khởi động server
app.listen(port, () => {
    console.log('Listening on port 3000');
});