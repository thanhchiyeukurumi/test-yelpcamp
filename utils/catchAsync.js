module.exports = func =>{
    return (req, res, next)=>{
        func(req, res, next).catch(next);
    }
}
/**catchAsync là một higher-order function (hàm bậc cao), nhận vào một hàm bất đồng bộ func và trả về một hàm mới.
 * Hàm mới này tự động bắt bất kỳ lỗi nào xảy ra trong quá trình thực thi func bằng .catch(next).
 * Nếu có lỗi, .catch(next) sẽ chuyển lỗi đó tới middleware xử lý lỗi kế tiếp (qua next), 
 * giúp tránh việc phải sử dụng try...catch lặp lại trong từng route handler.
 * trong app.js, mọi lỗi của await sẽ được chuyển đến middleware lỗi, không làm gián đoạn dòng xử lý
 * 
 * Tóm lại là thay thế cái try{}catch(e){next(e)} bằng cách viết catchAsync(async(req,res,next)=>{...})
*/