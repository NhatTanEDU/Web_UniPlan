# MA NGUYỄN NHẬT TÂN

**Ngày sinh:** 18/08/2003  
**Điện thoại:** _(chưa cung cấp – vui lòng điền)_  
**Email:** _(chưa cung cấp – vui lòng điền)_  
**Địa chỉ:** _(chưa cung cấp – vui lòng điền)_  
**GitHub:** [github.com/NhatTanEDU](https://github.com/NhatTanEDU)  
**LinkedIn:** _(chưa cung cấp – vui lòng điền)_  
**Portfolio / Demo:** _(chưa cung cấp – vui lòng điền)_

---

## MỤC TIÊU NGHỀ NGHIỆP

Tôi là sinh viên CNTT đam mê phát triển phần mềm full-stack, với kinh nghiệm thực tế qua dự án **UniPlan** – nền tảng quản lý dự án sử dụng React, Node.js/Express và MongoDB. Mục tiêu của tôi là gia nhập đội ngũ kỹ thuật của một công ty phát triển phần mềm ERP, nơi tôi có thể áp dụng kỹ năng xây dựng REST API, thiết kế CRUD, xác thực JWT và kiến trúc backend phân tầng để đóng góp vào hệ thống vận hành doanh nghiệp chuyên nghiệp. Tôi chủ động học hỏi, thích nghi nhanh và mong muốn phát triển lâu dài trong môi trường Agile/Scrum.

---

## KỸ NĂNG

### 🔧 Backend & API
- **Node.js** và **Express.js**: xây dựng REST API theo kiến trúc `routes → middlewares → controllers → services → models`
- Thiết kế và triển khai **CRUD** đầy đủ (Create – Read – Update – Delete)
- **REST API**: định nghĩa endpoints, xử lý HTTP methods (GET/POST/PUT/PATCH/DELETE), status codes chuẩn
- Xử lý lỗi tập trung bằng `try...catch` và middleware `errorHandler`
- Middleware xác thực token, phân quyền vai trò (role-based access control)

### 🖥️ Frontend
- **React.js** (Hooks: `useState`, `useEffect`, `useMemo`, `useCallback`)
- **Redux Toolkit**: quản lý global state, `createSlice`, `useDispatch`, `useSelector`
- **React Router**: điều hướng trang SPA
- **Material-UI (MUI)**: xây dựng giao diện người dùng nhất quán
- **CSS Modules** và **Tailwind CSS**: styling component
- Gọi API từ frontend bằng `axios` / `fetch`

### 🗄️ Database
- **MongoDB** với **Mongoose ODM**: thiết kế schema, populate (relations), query và indexing
- Hiểu quan hệ dữ liệu giữa các collection: User, Project, Task, Team
- Kinh nghiệm thực tế với **MongoDB Atlas** (cloud) và local MongoDB

### ⚙️ DevOps & Hệ thống _(nhận thức & tìm hiểu)_
- **Docker**: containerization ứng dụng (nhận thức cơ bản)
- **CI/CD**: biết nguyên lý pipeline tự động build/test/deploy (GitHub Actions)
- **Railway / Vercel**: deploy ứng dụng full-stack lên cloud
- **Linux**: thao tác dòng lệnh cơ bản
- Hiểu khái niệm Cloud services (Azure, GCP)

### 🧪 Testing _(cơ bản)_
- **Unit test** và **Integration test**: biết mục đích và cách tổ chức bộ test
- Viết test case kiểm tra API endpoints (Postman, REST client)
- Hiểu khái niệm automation test và các công cụ phổ biến (Selenium, JUnit)

### 🔐 Security
- **JWT (JSON Web Token)**: cơ chế tạo token, verify, refresh token, bảo vệ route
- Hiểu nhận thức **OWASP Top 10**: SQL Injection, XSS, CSRF, Broken Authentication
- Áp dụng xác thực input, kiểm soát quyền truy cập theo vai trò (RBAC)
- Bảo vệ API bằng middleware xác thực trước khi vào controller

### 🛠️ Công cụ & Quy trình
- **Git / GitHub**: version control, branching, pull request, merge conflict
- **Agile / Scrum**: hiểu quy trình sprint, daily standup, backlog
- **Postman**: test và document API
- **VS Code**: môi trường phát triển chính
- Đọc hiểu tài liệu kỹ thuật tiếng Anh

---

## DỰ ÁN NỔI BẬT

### UniPlan – Nền tảng Quản lý Dự án Thông minh

> _Dự án đồ án tốt nghiệp / cá nhân – Full-stack Web Application_  
> **Repo:** [github.com/NhatTanEDU/Web_UniPlan](https://github.com/NhatTanEDU/Web_UniPlan)  
> **Tech stack chi tiết:** xem [`README.md`](./README.md) và [`GEMINI.md`](./GEMINI.md) trong repo.

#### Mô tả dự án
UniPlan là ứng dụng web quản lý dự án và công việc (task) dành cho cá nhân và đội nhóm. Hệ thống hỗ trợ theo dõi tiến độ, phân công công việc và cộng tác nhóm theo thời gian thực.

#### Công nghệ sử dụng
| Tầng | Công nghệ |
|---|---|
| Frontend | React.js, Redux Toolkit, React Router, Material-UI (MUI), Tailwind CSS, TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (JSON Web Token) |
| Real-time | Socket.IO |
| File Storage | Supabase |
| Payment | MoMo Payment Gateway |
| Deploy | Railway (backend), Vercel (frontend) |
| Version Control | Git, GitHub |

#### Tính năng chính
- **Quản lý Dự án (Project CRUD):** Tạo, cập nhật, xóa, xem danh sách dự án với phân quyền theo vai trò.
- **Quản lý Công việc (Task CRUD):** Phân chia dự án thành task cụ thể, gán cho thành viên, theo dõi trạng thái (Kanban board với drag & drop).
- **Xác thực người dùng (Auth JWT):** Đăng ký, đăng nhập, đăng xuất an toàn; refresh token tự động.
- **Phân quyền (RBAC):** Quản lý vai trò Team Leader / Admin / Member, kiểm soát quyền truy cập theo cấp độ.
- **Quản lý nhóm (Team Management):** Tạo team, thêm/xóa thành viên, quản lý dự án theo team.
- **Thông báo Real-time:** Socket.IO cho cộng tác và cập nhật trạng thái theo thời gian thực.
- **Tích hợp AI:** Google Gemini API hỗ trợ tạo nội dung và ý tưởng cho dự án.
- **Thanh toán:** Tích hợp MoMo Gateway cho tính năng đăng ký gói dịch vụ.

#### Kiến trúc Backend
Tuân thủ luồng phân tầng rõ ràng (xem [`GEMINI.md`](./GEMINI.md)):
```
routes → middlewares → controllers → services → models
```
- `routes/`: định nghĩa API endpoints, không xử lý business logic.
- `middlewares/`: xác thực JWT, kiểm tra quyền, xử lý lỗi tập trung.
- `controllers/`: nhận request, xác thực input, gọi service.
- `services/`: toàn bộ business logic phức tạp, tương tác với models.
- `models/`: Mongoose schema, quan hệ dữ liệu.

#### Kiến trúc Frontend
Phân tách theo chức năng (xem [`GEMINI.md`](./GEMINI.md)):
```
pages/ | components/ | layouts/ | api/ | redux/ | hooks/
```

#### Đóng góp / Công việc thực hiện
- Thiết kế và xây dựng toàn bộ REST API backend từ đầu với Node.js/Express.
- Định nghĩa Mongoose schema cho các collection: User, Project, Task, Team.
- Triển khai hệ thống xác thực JWT đầy đủ: đăng ký, đăng nhập, bảo vệ route, phân quyền vai trò.
- Xây dựng giao diện React với Redux Toolkit quản lý state toàn cục.
- Tích hợp Socket.IO cho tính năng cộng tác theo thời gian thực.
- Triển khai ứng dụng lên Railway (backend) và Vercel (frontend).
- Viết tài liệu kỹ thuật: README, hướng dẫn deploy, test API với Postman.
- Sử dụng GitHub để quản lý source code, branching và CI/CD pipeline cơ bản.

---

## HỌC VẤN

| Thông tin | Chi tiết |
|---|---|
| Trình độ | _(Cao đẳng / Đại học – vui lòng điền)_ |
| Chuyên ngành | Công nghệ Thông tin (hoặc ngành liên quan) |
| Trường | _(tên trường – vui lòng điền)_ |
| Năm tốt nghiệp | _(năm – vui lòng điền)_ |

---

## CHỨNG CHỈ & KHÓA HỌC

_(Điền chứng chỉ nếu có: TOEIC, chứng chỉ lập trình, v.v.)_

---

## NGOẠI NGỮ

- **Tiếng Anh:** Đang theo học lớp tiếng Anh giao tiếp; có khả năng đọc hiểu tài liệu kỹ thuật tiếng Anh.

---

## THÔNG TIN THÊM

- Chủ động học hỏi công nghệ mới (Docker, CI/CD, OWASP, Agile/Scrum).
- Có khả năng chịu áp lực và hoàn thành công việc đúng deadline.
- Quan tâm đến lĩnh vực phần mềm ERP và hệ thống quản lý doanh nghiệp.
- Sẵn sàng làm việc theo mô hình nhóm và phối hợp với PM, designer, dev.
