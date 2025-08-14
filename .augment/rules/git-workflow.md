---
type: "agent_requested"
description: "Example description"
---
# Git Workflow & Commit Hygiene Rules

# Part 1: Branching Strategy (Chiến lược phân nhánh)
- **CRITICAL:** All new work (features, bugfixes, etc.) MUST be done on a separate, dedicated branch. You must never suggest committing directly to `main` or `develop`.
- Branch names must be descriptive, in English, and use kebab-case with a prefix. Examples: `feature/user-login-google`, `fix/avatar-display-bug`, `docs/update-readme`.

# Part 2: Committing Process (Quy trình Commit)
- Before creating a commit, you must ensure the code is complete for that specific task, functional, and does not break existing functionality. Do not commit unfinished or broken code.
- You should always suggest running local tests (`npm test`, `pytest`) and linters (`eslint`, `prettier`) before committing to catch errors early.
- **(Advanced):** For project setup, you should suggest implementing **pre-commit hooks** using tools like `Husky` and `lint-staged`. This automates testing and formatting before each commit is allowed, preventing bad code from entering the repository.

# Part 3: Commit Message Standard (Tiêu chuẩn Commit Message)
- **CRITICAL:** All commit messages MUST be written in **Vietnamese**.
- All commit messages MUST follow the **Conventional Commits** standard, adapted for Vietnamese. The format is: `<loại>(<phạm_vi>): <mô_tả_ngắn_gọn>`
- **Valid `<loại>` (types) are:**
  - `tinhnang` (feat): Một tính năng mới cho người dùng.
  - `sua_loi` (fix): Sửa một lỗi trong code.
  - `tai_lieu` (docs): Thay đổi liên quan đến tài liệu.
  - `phong_cach` (style): Thay đổi về định dạng code (dấu chấm phẩy, thụt đầu dòng...).
  - `tai_cau_truc` (refactor): Tái cấu trúc code mà không thay đổi tính năng.
  - `hieu_suat` (perf): Cải thiện hiệu suất.
  - `kiem_thu` (test): Thêm hoặc sửa các bài test.
  - `cong_viec_nho` (chore): Các công việc khác không ảnh hưởng đến code (cập nhật build scripts, cài đặt package...).
- **Example of a good commit message:** `tinhnang(xac_thuc): Thêm chức năng đăng nhập bằng Google`
- **Example of a commit with scope:** `sua_loi(api-thanh-toan): Sửa lỗi làm tròn số tiền khi thanh toán qua VNPAY`

# Part 4: Pull Request (PR) & Merging Process
- Once a feature branch is complete and tested, you must suggest creating a **Pull Request (PR)** to merge it into the main working branch (e.g., `develop` or `main`).
- The PR description must clearly explain what was changed, why it was changed, and how to test it.
- Code should only be merged after the PR has been reviewed by at least one other team member and all automated checks (CI/CD pipeline) have passed successfully.