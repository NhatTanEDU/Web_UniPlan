# BÁO CÁO CHỨC NĂNG MODULE TEAMS
## UniPlan - Hệ thống quản lý dự án

---

**Ngày tạo báo cáo:** 05/06/2025  
**Phiên bản:** 1.0  
**Tác giả:** Đội phát triển UniPlan  

---

## TỔNG QUAN MODULE TEAMS

Module Teams là một trong những module cốt lõi của hệ thống UniPlan, cho phép người dùng tạo và quản lý các nhóm làm việc, phân quyền thành viên, và quản lý dự án của nhóm một cách hiệu quả.

---

## 1. QUẢN LÝ TEAMS (NHÓM LÀM VIỆC)

### 1.1 Tạo Team
- **Chức năng:** Tạo nhóm làm việc mới
- **Thông tin cần thiết:**
  - Tên team (bắt buộc)
  - Mô tả team (tùy chọn)
  - Loại team (Personal/Work/Other)
- **Quyền hạn:** Người tạo team tự động trở thành Team Leader
- **Validation:** Kiểm tra tên team không được trống và không trùng lặp

### 1.2 Xem Danh Sách Teams
- **Chức năng:** Hiển thị tất cả teams mà user tham gia
- **Thông tin hiển thị:**
  - Tên team
  - Mô tả
  - Loại team
  - Số lượng thành viên
  - Số lượng dự án
  - Vai trò của user trong team
- **Sắp xếp:** Theo thời gian tạo (mới nhất trước)

### 1.3 Chi Tiết Team
- **Chức năng:** Xem thông tin chi tiết của một team cụ thể
- **Thông tin hiển thị:**
  - Thông tin cơ bản team
  - Danh sách thành viên và vai trò
  - Danh sách dự án
  - Lịch sử hoạt động (nếu có)

### 1.4 Cập Nhật Team
- **Chức năng:** Chỉnh sửa thông tin team
- **Quyền hạn:** Chỉ Team Leader mới có thể chỉnh sửa
- **Thông tin có thể chỉnh sửa:**
  - Tên team
  - Mô tả
  - Loại team

### 1.5 Xóa Team
- **Chức năng:** Xóa team khỏi hệ thống
- **Quyền hạn:** Chỉ Team Leader mới có thể xóa
- **Cơ chế:** Soft delete (đánh dấu is_deleted)
- **Ràng buộc:** Phải xóa hết thành viên và dự án trước khi xóa team

---

## 2. QUẢN LÝ THÀNH VIÊN TEAM

### 2.1 Thêm Thành Viên
- **Chức năng:** Mời người dùng khác tham gia team
- **Quyền hạn:** Team Leader và Admin có thể thêm thành viên
- **Cách thêm:**
  - Tìm kiếm theo username hoặc email
  - Chọn vai trò cho thành viên mới (Member/Admin)
  - Gửi lời mời tham gia

### 2.2 Quản Lý Vai Trò Thành Viên
- **Các vai trò trong team:**
  - **Team Leader:** Quyền cao nhất, quản lý toàn bộ team
  - **Admin:** Có thể quản lý thành viên và dự án
  - **Member:** Thành viên thường, chỉ có thể xem và tham gia dự án được phân

### 2.3 Cập Nhật Vai Trò
- **Chức năng:** Thay đổi vai trò của thành viên trong team
- **Quyền hạn:** Chỉ Team Leader mới có thể thay đổi vai trò
- **Ràng buộc:** Không thể thay đổi vai trò của chính mình

### 2.4 Xóa Thành Viên
- **Chức năng:** Loại bỏ thành viên khỏi team
- **Quyền hạn:** Team Leader và Admin có thể xóa Member
- **Ràng buộc:** 
  - Không thể xóa Team Leader
  - Admin không thể xóa Admin khác
  - Phải chuyển giao quyền Team Leader trước khi rời team

### 2.5 Rời Team
- **Chức năng:** Thành viên tự động rời khỏi team
- **Ràng buộc:** Team Leader phải chuyển quyền trước khi rời team

---

## 3. QUẢN LÝ DỰ ÁN TRONG TEAM

### 3.1 Xem Danh Sách Dự Án Team
- **Chức năng:** Hiển thị tất cả dự án của team
- **Thông tin hiển thị:**
  - Tên dự án
  - Mô tả
  - Ngày bắt đầu/kết thúc
  - Trạng thái (Planning/Active/Completed/On Hold/Cancelled)
  - Mức độ ưu tiên (Low/Medium/High)
  - Loại dự án
  - Người tạo

### 3.2 Tạo Dự Án Mới cho Team
- **Chức năng:** Tạo dự án mới và gán trực tiếp cho team
- **Quyền hạn:** Team Leader và Admin có thể tạo dự án
- **Thông tin cần thiết:**
  - Tên dự án (bắt buộc)
  - Mô tả (tùy chọn)
  - Ngày bắt đầu/kết thúc (bắt buộc)
  - Trạng thái mặc định (Planning)
  - Mức độ ưu tiên (Medium)
  - Loại dự án (từ danh sách có sẵn hoặc tạo mới)

### 3.3 Gán Dự Án Có Sẵn vào Team
- **Chức năng:** Tìm kiếm và gán dự án đã tồn tại vào team
- **Đặc điểm:**
  - Tìm kiếm dự án theo tên, mô tả
  - Hiển thị thông tin chi tiết dự án trước khi gán
  - Chỉ hiển thị các dự án chưa được gán cho team khác
  - Hiển thị trạng thái, mức độ ưu tiên, loại dự án

### 3.4 Modal Kết Hợp (Tạo Mới/Gán Có Sẵn)
- **Chức năng:** Giao diện thống nhất cho cả hai chế độ
- **Tính năng:**
  - **Tab "Tạo Mới":** Form tạo dự án mới (mặc định)
  - **Tab "Gán Có Sẵn":** Tìm kiếm và chọn dự án có sẵn
  - **Chuyển đổi dễ dàng:** Toggle giữa hai chế độ
  - **Tìm kiếm thông minh:** Real-time search với debounce

### 3.5 Cập Nhật Dự Án
- **Chức năng:** Chỉnh sửa thông tin dự án của team
- **Quyền hạn:** Team Leader, Admin và người tạo dự án
- **Thông tin có thể chỉnh sửa:** Tất cả thông tin của dự án

### 3.6 Xóa Dự Án Khỏi Team
- **Chức năng:** Loại bỏ dự án khỏi team (không xóa dự án)
- **Quyền hạn:** Team Leader, Admin và người tạo dự án
- **Thông báo:** Toast notification xác nhận thành công/thất bại

---

## 4. HỆ THỐNG PHÂN LOẠI DỰ ÁN

### 4.1 Quản Lý Loại Dự Án
- **Chức năng:** Tạo và quản lý các loại dự án (Project Types)
- **Loại mặc định:** Marketing, Development, Research, Other
- **Tính năng:**
  - Tạo loại mới trực tiếp từ form
  - Quản lý tập trung các loại dự án
  - Gán loại cho dự án khi tạo mới

### 4.2 Sửa Lỗi Truyền project_type_id
- **Vấn đề đã khắc phục:** Dự án tạo mới luôn hiển thị "Không phân loại"
- **Nguyên nhân:** Không truyền project_type_id từ frontend đến backend
- **Giải pháp:** 
  - Cập nhật hook useTeamProjects để nhận project_type_id
  - Sửa onAssign function để truyền đúng project_type_id
  - Thêm validation và warning log

---

## 5. HỆ THỐNG THÔNG BÁO

### 5.1 Toast Notifications
- **Chức năng:** Hiển thị thông báo tức thời cho người dùng
- **Loại thông báo:**
  - **Success:** Thao tác thành công (màu xanh)
  - **Error:** Thao tác thất bại (màu đỏ)
- **Tự động ẩn:** Sau 3-5 giây
- **Vị trí:** Góc trên cùng bên phải

### 5.2 Ứng Dụng Toast
- **Tạo dự án thành công/thất bại**
- **Gán dự án thành công/thất bại**
- **Xóa dự án khỏi team thành công/thất bại**
- **Thêm/xóa thành viên thành công/thất bại**
- **Cập nhật vai trò thành công/thất bại**

---

## 6. API BACKEND ĐÃ TRIỂN KHAI

### 6.1 Team APIs
- `GET /api/teams` - Lấy danh sách teams của user
- `POST /api/teams` - Tạo team mới
- `GET /api/teams/:id` - Lấy chi tiết team
- `PUT /api/teams/:id` - Cập nhật team
- `DELETE /api/teams/:id` - Xóa team

### 6.2 Team Members APIs
- `GET /api/teams/:id/members` - Lấy danh sách thành viên
- `POST /api/teams/:id/members` - Thêm thành viên
- `PUT /api/teams/:teamId/members/:userId` - Cập nhật vai trò
- `DELETE /api/teams/:teamId/members/:userId` - Xóa thành viên

### 6.3 Team Projects APIs
- `GET /api/teams/:id/projects` - Lấy danh sách dự án team
- `POST /api/teams/:id/projects` - Gán dự án vào team
- `DELETE /api/teams/:teamId/projects/:projectId` - Xóa dự án khỏi team

### 6.4 Projects APIs (Enhanced)
- `GET /api/projects/available` - Lấy dự án có thể gán
- `GET /api/projects/search?query=...` - Tìm kiếm dự án
- `POST /api/projects` - Tạo dự án mới
- `PUT /api/projects/:id` - Cập nhật dự án

---

## 7. BẢO MẬT VÀ PHÂN QUYỀN

### 7.1 Authentication
- **JWT Token:** Xác thực người dùng cho mọi API
- **Middleware auth:** Kiểm tra token hợp lệ
- **Token expiry:** Tự động đăng xuất khi token hết hạn

### 7.2 Authorization
- **Team Level:**
  - Team Leader: Toàn quyền trong team
  - Admin: Quản lý thành viên và dự án
  - Member: Chỉ xem và tham gia dự án được phân
- **Project Level:**
  - Chỉ thành viên team mới truy cập được dự án team
  - Người tạo dự án có quyền chỉnh sửa/xóa

### 7.3 Validation
- **Input validation:** Kiểm tra dữ liệu đầu vào
- **Business logic validation:** Kiểm tra quy tắc nghiệp vụ
- **Error handling:** Xử lý lỗi graceful với thông báo rõ ràng

---

## 8. GIAO DIỆN NGƯỜI DÙNG (UI/UX)

### 8.1 Responsive Design
- **Desktop:** Layout 3 cột với sidebar
- **Tablet:** Layout 2 cột responsive
- **Mobile:** Layout 1 cột với hamburger menu

### 8.2 Dark/Light Mode
- **Tự động phát hiện:** Theo system preference
- **Toggle manual:** Switch trong header
- **Consistency:** Tất cả component đều hỗ trợ

### 8.3 Loading States
- **Skeleton loading:** Cho danh sách teams/projects
- **Spinner:** Cho các thao tác cập nhật
- **Progress indicators:** Cho upload/download

### 8.4 Empty States
- **No teams:** Hướng dẫn tạo team đầu tiên
- **No projects:** Hướng dẫn tạo project đầu tiên
- **No members:** Hướng dẫn mời thành viên

---

## 9. TÍNH NĂNG NÂNG CAO

### 9.1 Real-time Search
- **Debounced search:** Tìm kiếm với độ trễ 300ms
- **Auto-complete:** Gợi ý trong quá trình gõ
- **Highlight matches:** Làm nổi bật kết quả tìm kiếm

### 9.2 Drag & Drop (Planned)
- **Reorder projects:** Kéo thả sắp xếp dự án
- **Move between teams:** Chuyển dự án giữa các team
- **Priority adjustment:** Thay đổi mức độ ưu tiên

### 9.3 Bulk Actions (Planned)
- **Multi-select:** Chọn nhiều item cùng lúc
- **Bulk delete:** Xóa nhiều item một lần
- **Bulk update:** Cập nhật hàng loạt

---

## 10. PERFORMANCE & OPTIMIZATION

### 10.1 Frontend Optimization
- **Code splitting:** Lazy loading components
- **Memoization:** React.memo cho component không đổi
- **Virtual scrolling:** Cho danh sách dài

### 10.2 Backend Optimization
- **Database indexing:** Index trên các field tìm kiếm
- **Query optimization:** Optimize MongoDB queries
- **Caching:** Cache kết quả API phổ biến

### 10.3 Network Optimization
- **API batching:** Gộp nhiều request thành một
- **Request deduplication:** Tránh duplicate requests
- **Compression:** Gzip response data

---

## 11. TESTING & QUALITY ASSURANCE

### 11.1 Unit Testing
- **Component testing:** Test từng React component
- **Hook testing:** Test custom hooks
- **Utility testing:** Test helper functions

### 11.2 Integration Testing
- **API testing:** Test endpoints với Postman/Jest
- **E2E testing:** Test user workflows hoàn chỉnh
- **Cross-browser testing:** Đảm bảo tương thích

### 11.3 Error Monitoring
- **Error boundaries:** Catch React errors
- **API error logging:** Log lỗi server-side
- **User feedback:** Collect user error reports

---

## 12. TÀI LIỆU VÀ HƯỚNG DẪN

### 12.1 Technical Documentation
- **API documentation:** Swagger/OpenAPI specs
- **Component storybook:** UI component library
- **Database schema:** ERD và mô tả bảng

### 12.2 User Documentation
- **User manual:** Hướng dẫn sử dụng chi tiết
- **Video tutorials:** Screen recording các tính năng
- **FAQ:** Câu hỏi thường gặp

---

## 13. TƯƠNG LAI VÀ KẾ HOẠCH PHÁT TRIỂN

### 13.1 Tính Năng Sắp Tới
- **Team Templates:** Mẫu team có sẵn
- **Advanced Permissions:** Phân quyền chi tiết hơn
- **Team Analytics:** Thống kê hoạt động team
- **Integration:** Kết nối với tools khác

### 13.2 Cải Tiến UX
- **Onboarding flow:** Hướng dẫn user mới
- **Keyboard shortcuts:** Phím tắt cho power users
- **Customizable dashboard:** Tùy chỉnh giao diện

### 13.3 Scalability
- **Microservices:** Tách module thành services
- **Load balancing:** Cân bằng tải cho nhiều user
- **Database sharding:** Phân tán dữ liệu

---

## KẾT LUẬN

Module Teams của UniPlan đã được phát triển hoàn chỉnh với đầy đủ các tính năng cốt lõi:

✅ **Quản lý Teams**: Tạo, xem, sửa, xóa teams  
✅ **Quản lý Thành viên**: Thêm, xóa, phân quyền thành viên  
✅ **Quản lý Dự án**: Tạo mới và gán dự án có sẵn  
✅ **Phân loại Dự án**: Hệ thống project types hoàn chỉnh  
✅ **Thông báo**: Toast notifications cho mọi thao tác  
✅ **Bảo mật**: Authentication & Authorization đầy đủ  
✅ **UI/UX**: Giao diện thân thiện, responsive design  

Module này đã sẵn sàng để triển khai production và có thể mở rộng thêm nhiều tính năng nâng cao trong tương lai.

---

**Liên hệ support:** [developer@uniplan.com]  
**Repository:** [GitHub Link]  
**Documentation:** [Wiki Link]
