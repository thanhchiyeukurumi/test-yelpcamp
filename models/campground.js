//const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const review = require('./review');
// Định nghĩa schema cho Campground

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
   return this.url.replace('/upload', '/upload/w_200');
});  

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    // Một kiểu dữ liệu ObjectId, tham chiếu đến một document trong bộ sưu tập "User", 
    // khi bạn sử dụng phương thức populate của Mongoose, 
    // bạn có thể thay thế ObjectId trong author bằng tài liệu thực tế từ collection User
    author:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }, // Thông tin tác giả của campground (chỉ có "1" tác giả)
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ], // Mảng chứa nhiều "review" liên quan
}, opts);

// img.thumbnail = cloudinary.image(img.filename, { width: 100, height: 100, crop: 'fill' });

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`
 });  

/**
 * Middleware này sẽ được thực thi sau khi chạy một hàm "findOneAndDelete" 
 * doc chứa dữ liệu campground bị xoá nếu đã xoá thành công
 * sau đó xoá tất cả các review liên quan đến campground đó (có _id trùng với _id trong mảng doc.reviews)
 */
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
        for (let img of doc.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);