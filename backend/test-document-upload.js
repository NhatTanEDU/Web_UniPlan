// test-document-upload.js
// File test đơn giản để kiểm tra upload document

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Cấu hình
const SERVER_URL = 'http://localhost:5000'; // Thay đổi port nếu cần
const TEST_USER_TOKEN = 'your_jwt_token_here'; // Thay bằng token thực

// Test function
async function testDocumentUpload() {
    try {
        console.log('🧪 Bắt đầu test upload document...');

        // Tạo file test đơn giản
        const testContent = 'Đây là file test cho hệ thống upload document của UniPlan';
        const testFilePath = path.join(__dirname, 'test-file.txt');
        fs.writeFileSync(testFilePath, testContent);

        // Tạo FormData
        const formData = new FormData();
        formData.append('fileDinhKem', fs.createReadStream(testFilePath));
        formData.append('taskId', '507f1f77bcf86cd799439011'); // ObjectId giả
        formData.append('projectId', '507f1f77bcf86cd799439012'); // ObjectId giả

        // Gửi request
        const response = await axios.post(`${SERVER_URL}/api/documents/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${TEST_USER_TOKEN}`
            }
        });

        console.log('✅ Upload thành công!');
        console.log('📄 Response:', JSON.stringify(response.data, null, 2));

        // Cleanup
        fs.unlinkSync(testFilePath);
        console.log('🧹 Đã xóa file test tạm');

    } catch (error) {
        console.error('❌ Lỗi khi test upload:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else {
            console.error('   Message:', error.message);
        }
    }
}

// Test function để lấy danh sách documents
async function testGetDocuments() {
    try {
        console.log('🧪 Bắt đầu test get documents...');

        const response = await axios.get(`${SERVER_URL}/api/documents`, {
            headers: {
                Authorization: `Bearer ${TEST_USER_TOKEN}`
            }
        });

        console.log('✅ Lấy danh sách thành công!');
        console.log('📄 Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Lỗi khi test get documents:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else {
            console.error('   Message:', error.message);
        }
    }
}

// Chạy test
if (require.main === module) {
    console.log('🚀 Chạy test Document Upload API...');
    console.log('⚠️  Lưu ý: Cần cập nhật TEST_USER_TOKEN và đảm bảo server đang chạy');
    console.log('');
    
    // testDocumentUpload();
    // testGetDocuments();
    
    console.log('Uncomment các dòng trên để chạy test thực tế');
}

module.exports = {
    testDocumentUpload,
    testGetDocuments
};
