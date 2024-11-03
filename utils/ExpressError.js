class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
module.exports = ExpressError;
/**
 * ExpressError là một class mở rộng từ Error, dùng để tạo lỗi tùy chỉnh trong ứng dụng.
 * Constructor nhận vào message và statusCode, để tạo lỗi với thông điệp và mã trạng thái HTTP tương ứng.
 * Khi một lỗi ExpressError được tạo và chuyển vào next(), middleware xử lý lỗi trong app.js sẽ nhận diện và hiển thị thông tin lỗi này.
*/