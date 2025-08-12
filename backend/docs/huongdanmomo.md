#
Chạy server Node.js của bạn:

Mở terminal 1.
Điều hướng đến thư mục backend của bạn.
Chạy npm start (hoặc nodemon server.js). Server của bạn phải chạy ở cổng 5000.
Chạy ngrok:

Mở terminal 2.
Chạy lệnh ngrok bằng đường dẫn đầy đủ của nó:
Bash

D:\Official_Project\Project_UniPlan\dowload\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
Trong output của ngrok, tìm dòng Forwarding có giao thức https://. Đó là URL ngrok mới của bạn.
Sao chép URL này.
Cập nhật .env:

Mở file .env của bạn.
Thay thế phần Public URL trong MOMO_REDIRECT_URL và MOMO_IPN_URL bằng URL ngrok mới bạn vừa sao chép, nhớ thêm /momo/return và /momo/ipn vào cuối.
Khởi động lại server Node.js:

Quay lại terminal 1.
Nhấn Ctrl + C để dừng server.
Chạy lại npm start (hoặc nodemon server.js).
Sau các bước này, server của bạn sẽ sử dụng URL ngrok mới và bạn có thể tiếp tục test MoMo.