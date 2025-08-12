# Hướng Dẫn cho Gemini - Dự án UniPlan

Đây là những quy tắc và ngữ cảnh quan trọng cho dự án này. Vui lòng tuân thủ chặt chẽ khi tạo hoặc chỉnh sửa code.

## 1. Quy tắc Chung

* **Ngôn ngữ:** Code comment và tài liệu phải được viết bằng **Tiếng Việt**.
* **Định dạng Code:** Sử dụng **4 dấu cách (spaces)** để thụt đầu dòng.
* **Quy ước đặt tên:**
    * `camelCase` cho biến và hàm (ví dụ: `getUserProfile`).
    * `PascalCase` cho tên component React và class (ví dụ: `UserProfileCard`).
    * Tên file phải phản ánh tên component/module bên trong (ví dụ: component `UserProfileCard` nằm trong file `UserProfileCard.js`).

## 2. Quy tắc cho Frontend (thư mục `frontend/src`)

* **Kiến trúc:** Tuân thủ kiến trúc phân tách theo chức năng:
    * `pages/`: Chứa các component ở cấp độ trang (ví dụ: `HomePage`, `ProjectDetailPage`). Mỗi page nên có một thư mục riêng.
    * `components/`: Chứa các component UI nhỏ, tái sử dụng được trên nhiều trang (ví dụ: `Button`, `Card`, `Modal`).
    * `layouts/`: Chứa cấu trúc layout chung của ứng dụng (ví dụ: `MainLayout` bao gồm header và footer).
    * `api/`: Chứa các hàm gọi API đến backend. Các hàm liên quan đến một đối tượng nên được nhóm vào một file (ví dụ: `userApi.js`, `projectApi.js`).
    * `redux/`: Chứa mọi thứ liên quan đến Redux, bao gồm `store.js` và các `slices/`.
    * `hooks/`: Chứa các custom React hooks.

* **Styling:**
    * Sử dụng **CSS Modules** (`.module.css`) cho styling của từng component cụ thể để tránh xung đột.
    * Sử dụng `App.css` và `index.css` cho các style toàn cục, reset CSS và các biến CSS.

## 3. Quy tắc cho Backend (thư mục `backend/src`)

* **Kiến trúc:** Tuân thủ nghiêm ngặt luồng xử lý: **`routes` -> `middlewares` -> `controllers` -> `services` -> `models`**.
    * `routes/`: Định nghĩa các API endpoints. Chỉ chứa logic định tuyến, không xử lý business. Gọi đến `controllers`.
    * `controllers/`: Nhận request và trả về response. Điều phối, xác thực input cơ bản và gọi đến các hàm trong `services`.
    * `services/`: Chứa toàn bộ business logic phức tạp. Tương tác với `models` để xử lý dữ liệu.
    * `models/`: Định nghĩa các schema của Mongoose, tương tác trực tiếp với database MongoDB.

* **Xử lý lỗi:** Sử dụng cơ chế `try...catch` trong `controllers` và `services`, và truyền lỗi qua `next()` để `errorHandler` xử lý tập trung.

## 4. Ngữ cảnh Kỹ thuật

* **Frontend:** React.js, Redux Toolkit, React Router, Material-UI (MUI).
* **Backend:** Node.js, Express.js, Mongoose.
* **Endpoint API:** `http://localhost:5000`.