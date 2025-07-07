# Hướng Dẫn Commit Message Tiếng Việt

## Quy tắc chung cho commit message
- Sử dụng tiếng Việt có dấu
- Bắt đầu với một động từ chỉ hành động (Thêm, Sửa, Cập nhật, Xóa, v.v.)
- Mô tả ngắn gọn những thay đổi đã thực hiện
- Nếu cần thiết, thêm chi tiết ở phần nội dung

## Cấu trúc commit message
```
<loại>: <mô tả ngắn>

<mô tả chi tiết>

<tham chiếu issue>
```

## Các loại commit phổ biến
- `feat`: Thêm tính năng mới
- `fix`: Sửa lỗi
- `docs`: Thay đổi tài liệu
- `style`: Thay đổi không ảnh hưởng đến code (định dạng, khoảng trắng, v.v.)
- `refactor`: Tái cấu trúc code
- `perf`: Cải thiện hiệu suất
- `test`: Thêm hoặc sửa test
- `chore`: Thay đổi build process, công cụ, v.v.

## Ví dụ
- `feat: Thêm chức năng đăng nhập bằng Google`
- `fix: Sửa lỗi không hiển thị avatar người dùng`
- `docs: Cập nhật hướng dẫn API`
- `refactor: Tối ưu hóa hook useUserInfo`
