# Quy tắc Backend cho Copilot - Dự án UniPlan

Tài liệu này định nghĩa các quy tắc, kiến trúc và công nghệ cụ thể cho phần Backend của dự án.

## 1. Kiến trúc và Luồng xử lý (`backend/src`)

Phải tuân thủ nghiêm ngặt luồng xử lý và kiến trúc đã định sẵn: **`routes` -> `middlewares` -> `controllers` -> `services` -> `models`**.

* **`routes/`**: Định nghĩa các API endpoints. Chỉ chứa logic định tuyến và gọi đến `controllers`. Không chứa business logic.
* **`controllers/`**: Nhận request từ `routes` và trả về response cho client. Chịu trách nhiệm điều phối, xác thực input cơ bản và gọi đến các hàm trong `services`.
* **`services/`**: **Nơi chứa toàn bộ business logic phức tạp**. Tương tác với `models` để xử lý, truy xuất, và lưu trữ dữ liệu.
* **`models/`**: Định nghĩa các schema của Mongoose. Đây là lớp duy nhất tương tác trực tiếp với database MongoDB.
* **`middlewares/`**: Chứa các hàm xử lý trung gian như xác thực token (`authMiddleware`), xử lý lỗi tập trung (`errorHandler`), v.v.

## 2. Quy tắc Kỹ thuật

* **Xử lý lỗi:** Sử dụng cơ chế `try...catch` trong `controllers` và `services`. Khi có lỗi, truyền lỗi qua hàm `next()` để `errorHandler` middleware xử lý tập trung.
* **Tương tác Database:** Mọi tương tác với CSDL phải thông qua Mongoose models. Viết các truy vấn hiệu quả, tránh N+1 query.
* **API Response:** Trả về các mã trạng thái HTTP (HTTP status codes) phù hợp và một cấu trúc JSON nhất quán. Ví dụ:
    ```json
    {
      "success": true,
      "data": { ... }
    }
    // hoặc khi có lỗi
    {
      "success": false,
      "message": "Mô tả lỗi"
    }
    ```

## 3. Ngữ cảnh Công nghệ

* **Framework:** Node.js, Express.js
* **Ngôn ngữ:** JavaScript (ES6+)
* **Database:** MongoDB với Mongoose ODM
* **Endpoint gốc:** `http://localhost:5000`