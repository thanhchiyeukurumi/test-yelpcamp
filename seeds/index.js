// WARNING: This file is not recommended to run. Proceed with caution.
const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');

// Kết nối tới MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db = mongoose.connection;
// Kiểm tra kết nối cơ bản
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => { // Chỉ lắng nghe sự kiện 1 lần duy nhất
    console.log("Database connected");
});

// Hàm lấy mẫu ngẫu nhiên từ mảng
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

// Hàm seed dữ liệu cho cơ sở dữ liệu
const seedDB = async () => {
    await Campground.deleteMany({}); // Xóa để test ban đầu có kết nối không
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '67259ddea1136aae6d3c8fdc', // Đặt author là id của 1 user ban đầu
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dsimlypyu/image/upload/v1730569711/yelpCamp/wny0rhzz8pswdqg5c4to.png',
                    filename: 'yelpCamp/wny0rhzz8pswdqg5c4to'
                },
                {
                    url: 'https://res.cloudinary.com/dsimlypyu/image/upload/v1730568162/yelpCamp/kw8jwjxcdvqyqxf08jjx.png',
                    filename: 'yelpCamp/kw8jwjxcdvqyqxf08jjx'
                }
            ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non nisi eu nulla hendrerit condimentum vehicula in tellus. Maecenas pellentesque mauris ac lobortis efficitur. Aliquam tristique velit in libero tristique rutrum. Donec velit libero, tempor a convallis sed, dignissim pretium nunc.',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
        });
        await camp.save();
    }
};
// Gọi hàm seedDB và đóng kết nối sau khi hoàn thành
seedDB().then(() => {
    mongoose.connection.close();
});
