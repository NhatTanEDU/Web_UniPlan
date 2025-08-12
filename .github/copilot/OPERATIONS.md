# Quy tắc Vận hành (Operations) cho Copilot - Dự án UniPlan

Tài liệu này định nghĩa các lệnh và quy trình vận hành cốt lõi của dự án UniPlan, bao gồm cách khởi động server, chạy kiểm thử, và build dự án. Copilot phải sử dụng các lệnh này khi được yêu cầu thực hiện các tác vụ liên quan đến terminal.

## 1. Môi trường Phát triển (Development)

Đây là các lệnh để khởi động dự án cho việc lập trình hàng ngày.

### 1.1. Cách khởi động TOÀN BỘ dự án (Ưu tiên nhất)

Để chạy cả frontend và backend cùng một lúc, hãy di chuyển đến **thư mục gốc (root)** của dự án và thực thi lệnh duy nhất:

```bash
npm run dev
1.2. Cách khởi động riêng lẻ
Trong trường hợp cần làm việc hoặc gỡ lỗi riêng cho từng phần:

Để chỉ chạy Backend:

Di chuyển vào thư mục backend: cd backend

Chạy lệnh: npm run dev (lệnh này sử dụng nodemon để tự động khởi động lại server khi có thay đổi code).

Để chỉ chạy Frontend:

Di chuyển vào thư mục frontend: cd frontend

Chạy lệnh: npm run dev (lệnh này sử dụng react-scripts start).

Build Frontend: Để tạo bản build tối ưu cho frontend, di chuyển vào thư mục frontend và chạy:
npm run build
Chạy Backend cho Production: Để chạy backend một cách ổn định, di chuyển vào thư mục backend và chạy:
npm run start:production
Lệnh này sử dụng node server.js trực tiếp, không qua nodemon.
### 3. Chạy Kiểm thử (Testing)
Test Backend: Di chuyển vào thư mục backend và chạy lệnh tương ứng, ví dụ:
npm test
Test Frontend: Di chuyển vào thư mục frontend và chạy:
npm test
4. Tóm tắt Lệnh
Tác vụ	Thư mục	Lệnh
Chạy full dev	Thư mục gốc	npm run dev
Chạy dev Backend	backend/	npm run dev
Chạy dev Frontend	frontend/	npm run dev
Build Frontend	frontend/	npm run build
Chạy production Backend	backend/	npm run start:production
