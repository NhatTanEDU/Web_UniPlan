# Document Upload System - Backend

Hệ thống upload tài liệu sử dụng Supabase Storage và MongoDB cho UniPlan.

## 🚀 Cài đặt

### 1. Cài đặt thư viện
```bash
npm install @supabase/supabase-js uuid multer
```

### 2. Cấu hình Environment Variables
Thêm các biến sau vào file `.env`:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
SUPABASE_BUCKET_NAME=uniplan-upload-file
```

### 3. Cấu hình Supabase
1. Tạo bucket `uniplan-upload-file` trên Supabase Dashboard
2. Đặt bucket ở chế độ Public
3. Lấy Project URL và Service Role Key từ Settings > API

## 📁 Cấu trúc Files

```
backend/
├── models/
│   └── document.model.js           # Schema cho documents
├── controllers/
│   └── document.controller.js      # Logic xử lý upload/download
├── routes/
│   └── document.routes.js          # API endpoints
├── test-document-upload.js         # File test
└── .env.document.template          # Template cho environment variables
```

## 🔗 API Endpoints

### 1. Upload Document
```
POST /api/documents/upload
```

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `fileDinhKem`: File to upload
- `taskId`: (Optional) ID của task liên quan
- `projectId`: (Optional) ID của project liên quan  
- `teamId`: (Optional) ID của team liên quan

**Response:**
```json
{
  "success": true,
  "message": "Tải file lên thành công!",
  "data": {
    "_id": "...",
    "fileName": "example.pdf",
    "fileUrl": "https://supabase.url/storage/...",
    "fileType": "application/pdf",
    "fileSize": 1024,
    "storagePath": "documents/uuid.pdf",
    "uploadedBy": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 2. Get Documents
```
GET /api/documents?page=1&limit=10&taskId=...&projectId=...&teamId=...
```

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số items per page (default: 10)
- `taskId`: Filter theo task ID
- `projectId`: Filter theo project ID
- `teamId`: Filter theo team ID

### 3. Delete Document
```
DELETE /api/documents/:id
```

**Headers:**
- `Authorization: Bearer <jwt_token>`

## 🧪 Testing

### Sử dụng Postman
1. Import collection từ file `Personal_Member_Lists_API.postman_collection.json`
2. Tạo request mới:
   - Method: POST
   - URL: `http://localhost:5000/api/documents/upload`
   - Headers: `Authorization: Bearer <your_token>`
   - Body: form-data với key `fileDinhKem` (type: File)

### Sử dụng Test Script
```bash
node test-document-upload.js
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **"Không có file nào được tải lên"**
   - Kiểm tra key name trong form-data phải là `fileDinhKem`
   - Đảm bảo Content-Type là `multipart/form-data`

2. **"Lỗi khi tải file lên dịch vụ lưu trữ"**
   - Kiểm tra SUPABASE_URL và SUPABASE_SERVICE_KEY
   - Đảm bảo bucket `uniplan-upload-file` đã được tạo
   - Kiểm tra quyền truy cập bucket

3. **"Loại file không được hỗ trợ"**
   - Chỉ chấp nhận: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
   - Có thể sửa trong `document.routes.js`

4. **"File quá lớn"**
   - Giới hạn hiện tại: 10MB
   - Có thể điều chỉnh trong `document.routes.js`

## 🔐 Security

- ✅ Authentication required cho tất cả endpoints
- ✅ File type validation
- ✅ File size limit (10MB)
- ✅ Unique file names (UUID)
- ✅ User ownership validation

## 📊 Database Schema

```javascript
{
  fileName: String,        // Tên file gốc
  fileUrl: String,         // URL công khai trên Supabase
  fileType: String,        // MIME type
  fileSize: Number,        // Bytes
  storagePath: String,     // Path trên Supabase để delete
  taskId: ObjectId,        // Optional
  projectId: ObjectId,     // Optional  
  teamId: ObjectId,        // Optional
  uploadedBy: ObjectId,    // Required
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Next Steps

1. ✅ Backend API hoàn thành
2. 🔄 Frontend integration (coming next)
3. 🔄 Drag & drop upload
4. 🔄 File preview
5. 🔄 Bulk upload
