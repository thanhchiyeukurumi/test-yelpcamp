   // Kiểm tra form phía Client
        (() => {
            'use strict'
          
            // Tìm tất cả các form cần validate
            const forms = document.querySelectorAll('.needs-validation')
          
            // Lặp qua từng form và thêm sự kiện submit
            Array.from(forms).forEach(form => {
              form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                  event.preventDefault()
                  event.stopPropagation()
                }
                form.classList.add('was-validated')
              }, false)
            })
          })()

  /**
   * Thư mục public chứa các file tĩnh như css, js, images, fonts, ...
   * Người dùng có thể truy cập các file này thông qua đường dẫn /public/...
   * Phân tách rõ ràng giữa cilent và server
   */