# Hướng dẫn chạy backend tự động restart khi sửa code hoặc server bị crash

## Cách sử dụng

1. Đảm bảo đã cài nodemon (đã có trong devDependencies, không cần cài lại)
2. Chỉ cần chạy lệnh:

```powershell
npm start
```

- Server sẽ tự động restart khi bạn sửa file hoặc khi bị crash.
- Không cần Ctrl+C rồi chạy lại thủ công.

## Cấu hình trong package.json

```json
"scripts": {
  "start": "nodemon server.js"
}
```

Nếu file chính không phải `server.js` thì sửa lại đúng tên file.

## Một số lệnh hữu ích

- **Khởi động server:**  
  `npm start`
- **Chạy chế độ an toàn:**  
  `npm run start:safe`
- **Dừng server:**  
  Nhấn `Ctrl + C` trong terminal

---

Nếu muốn cấu hình thêm cho nodemon, hãy tạo file `nodemon.json` (ví dụ ignore folder, custom ext...)

## Ví dụ file nodemon.json

```json
{
  "watch": ["server.js", "controllers", "models"],
  "ext": "js,json",
  "ignore": ["*.test.js", "logs/*"]
}
```

---
**Chúc bạn code vui vẻ và không còn phải restart server thủ công nữa!**
