# Quy ước Commit Message Tiếng Việt

Tài liệu này mô tả quy ước sử dụng tiếng Việt cho commit message trong dự án.

## Cấu trúc cơ bản

```
<loại>: <mô tả ngắn>

[mô tả chi tiết tùy chọn]

[tham chiếu issue]
```

## Loại commit

- **feat**: Thêm tính năng mới
- **fix**: Sửa lỗi
- **docs**: Thay đổi tài liệu
- **style**: Định dạng, thêm dấu chấm câu, v.v (không thay đổi code)
- **refactor**: Tái cấu trúc code
- **perf**: Cải thiện hiệu suất
- **test**: Thêm/sửa test
- **chore**: Công việc bảo trì

## Ví dụ

```
feat: Thêm chức năng đăng nhập bằng Google

Thêm OAuth2 cho phép người dùng đăng nhập bằng tài khoản Google.
Cải thiện trải nghiệm người dùng mới.

Liên quan đến #123
```

```
fix: Sửa lỗi mất kết nối khi refresh token

Giải quyết vấn đề người dùng bị đăng xuất sau khi refresh token hết hạn.
Thêm cơ chế tự động làm mới token.
```

```
refactor: Tối ưu hóa hook useUserInfo

- Cải thiện cơ chế fallback khi API lỗi
- Giảm số lượng re-render không cần thiết
- Thêm kiểm soát lỗi chi tiết hơn
```
