const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email:{
        type: String,
        requires: true,
        unique: true
    }
})
UserSchema.plugin(passportLocalMongoose); // Thêm plugin passportLocalMongoose vào schema

module.exports = mongoose.model('User', UserSchema);