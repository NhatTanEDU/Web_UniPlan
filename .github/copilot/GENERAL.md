# Quy tắc Chung cho Copilot - Dự án UniPlan

Tài liệu này cung cấp các quy tắc chung về ngôn ngữ, phong cách code, và các nguyên tắc hoạt động, an toàn khi sử dụng Copilot trong dự án. Các quy tắc này áp dụng cho cả frontend và backend.

## 1. Ngôn ngữ và Tài liệu

* **Code Comments:** Sử dụng **Tiếng Việt** cho tất cả các comment giải thích logic phức tạp.
* **Commit Messages:** Viết commit message bằng **Tiếng Việt**, tuân thủ chuẩn Conventional Commits (ví dụ: `feat: thêm trang đăng nhập`).
* **Documentation:** Sử dụng **Tiếng Việt** cho các tài liệu dự án (`README.md`, `CHANGELOG.md`, v.v.).

## 2. Nguyên tắc Tương tác (Interaction Principles) - MỤC MỚI

* **Ngôn ngữ Phản hồi:** **Luôn luôn trả lời, giải thích, và đặt câu hỏi bằng Tiếng Việt.** Mọi giao tiếp với người dùng phải bằng Tiếng Việt, bất kể ngôn ngữ của các tài liệu tham khảo.

## 3. Phong cách Mã hóa (Coding Style)

* **Thụt lề (Indentation):** 4 dấu cách (spaces).
* **Dấu chấm phẩy (Semicolons):** Luôn sử dụng dấu chấm phẩy ở cuối câu lệnh.
* **Dấu ngoặc kép (Quotes):** Sử dụng dấu nháy đơn (`'`) thay vì nháy kép (`"`).
* **Quy ước đặt tên:**
    * `camelCase` cho biến và hàm (ví dụ: `getUserProfile`).
    * `PascalCase` cho tên component React và class (ví dụ: `UserProfileCard`).

## 4. Nguyên tắc Hoạt động và An toàn (Operating Principles)

Đây là những quy tắc quan trọng nhất khi Copilot thực hiện các yêu cầu.

### 4.1. Phạm vi Tác động (Scope of Impact) 🎯
* **Chỉ sửa file liên quan:** Chỉ được phép chỉnh sửa các file trực tiếp liên quan đến yêu cầu hiện tại. **Tuyệt đối không** tự ý thay đổi các file khác.
* **Không thay đổi logic không liên quan:** Trong một file, chỉ tập trung vào việc thêm mới hoặc sửa đổi logic được yêu cầu.

### 4.2. Đảm bảo Chất lượng (Quality Assurance) ✅
* **Kiểm tra lại sau khi sửa:** Sau khi hoàn thành yêu cầu, phải tự động rà soát lại file đã sửa đổi để đảm bảo không phát sinh lỗi cú pháp hoặc logic.
* **Không tạo code lỗi:** Code được tạo ra phải hoàn chỉnh và chạy được.

### 4.3. Tôn trọng Mã nguồn hiện có (Respect Existing Code) 🏛️
* **Không tự ý đổi tên:** Giữ nguyên tên biến, hàm, component, và đường dẫn API đã tồn tại. Chỉ đổi tên (refactor) khi được yêu cầu rõ ràng.
* **Tái sử dụng code:** Ưu tiên sử dụng lại các hàm hoặc component đã có sẵn thay vì viết lại.

### 4.4. Bảo mật (Security) 🔒
* **Không để lộ thông tin nhạy cảm:** **Tuyệt đối không** viết mã nguồn có chứa API key, mật khẩu... trực tiếp trong code. Luôn hướng dẫn sử dụng biến môi trường từ file `.env`.

### 4.5. Quản lý Thư viện (Dependency Management) 📦
* **Hạn chế thêm thư viện mới:** Ưu tiên sử dụng các thư viện đã có sẵn trong `package.json`. Nếu cần thư viện mới, hãy đề xuất để chờ chấp thuận.
* **Cập nhật thư viện:** Luôn cập nhật các thư viện đã có trong dự án
