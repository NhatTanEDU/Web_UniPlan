# Quy tắc Frontend cho Copilot - Dự án UniPlan

Tài liệu này định nghĩa các quy tắc, kiến trúc và công nghệ cụ thể cho phần Frontend của dự án.

## 1. Kiến trúc Thư mục và File (`frontend/src`)

Phải tuân thủ nghiêm ngặt kiến trúc phân tách theo chức năng:

* **`pages/`**: Chứa các component ở cấp độ trang (ví dụ: `HomePage`, `ProjectDetailPage`). Mỗi page nên có một thư mục riêng.
* **`components/`**: Chứa các component UI nhỏ, tái sử dụng được trên nhiều trang (ví dụ: `Button`, `Card`, `Modal`).
* **`layouts/`**: Chứa cấu trúc layout chung của ứng dụng (ví dụ: `MainLayout` bao gồm header và footer).
* **`api/`**: Chứa các hàm gọi API đến backend. Các hàm liên quan đến một đối tượng nên được nhóm vào một file (ví dụ: `userApi.js`, `projectApi.js`).
* **`redux/`**: Chứa mọi thứ liên quan đến Redux, bao gồm `store.js` và các `slices/`.
* **`hooks/`**: Chứa các custom React hooks.

## 2. Quy tắc Kỹ thuật

* **Styling:**
    * Sử dụng **CSS Modules** (`.module.css`) cho styling của từng component cụ thể để tránh xung đột.
    * Sử dụng `App.css` và `index.css` cho các style toàn cục, reset CSS và các biến CSS.
* **Quản lý State:** Sử dụng **Redux Toolkit** cho việc quản lý state toàn cục.
* **Định tuyến (Routing):** Sử dụng thư viện **React Router** để quản lý việc điều hướng trang.
* **Thư viện UI:** Ưu tiên sử dụng các component từ thư viện **Material-UI (MUI)** đã được cài đặt trong dự án.

## 3. Ngữ cảnh Công nghệ

* **Framework/Library:** React.js
* **Ngôn ngữ:** JavaScript (ES6+)
* **Công cụ build:** Create React App
