// test-env-variables.js
// Script kiểm tra xem environment variables có được đọc đúng không
require('dotenv').config();

console.log('🔍 Kiểm tra Environment Variables...');
console.log('=====================================');

// Kiểm tra các biến cơ bản
console.log('📊 Các biến cơ bản:');
console.log('   PORT:', process.env.PORT || 'KHÔNG TÌM THẤY');
console.log('   MONGO_URI:', process.env.MONGO_URI ? 'CÓ' : 'KHÔNG TÌM THẤY');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'CÓ' : 'KHÔNG TÌM THẤY');

console.log('\n📊 Các biến Supabase:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL || 'KHÔNG TÌM THẤY');
console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? `CÓ (${process.env.SUPABASE_SERVICE_KEY.substring(0, 20)}...)` : 'KHÔNG TÌM THẤY');
console.log('   SUPABASE_BUCKET_NAME:', process.env.SUPABASE_BUCKET_NAME || 'KHÔNG TÌM THẤY');

console.log('\n🧪 Kiểm tra tính hợp lệ:');

// Kiểm tra SUPABASE_URL có hợp lệ không
try {
    if (process.env.SUPABASE_URL) {
        new URL(process.env.SUPABASE_URL);
        console.log('   ✅ SUPABASE_URL hợp lệ');
    } else {
        console.log('   ❌ SUPABASE_URL không tồn tại');
    }
} catch (error) {
    console.log('   ❌ SUPABASE_URL không hợp lệ:', error.message);
}

// Kiểm tra service key có đúng format JWT không
if (process.env.SUPABASE_SERVICE_KEY) {
    if (process.env.SUPABASE_SERVICE_KEY.startsWith('eyJ')) {
        console.log('   ✅ SUPABASE_SERVICE_KEY có vẻ hợp lệ (JWT format)');
    } else {
        console.log('   ⚠️  SUPABASE_SERVICE_KEY không đúng format JWT');
    }
} else {
    console.log('   ❌ SUPABASE_SERVICE_KEY không tồn tại');
}

console.log('\n=====================================');
console.log('✅ Kiểm tra hoàn tất!');

// Test Supabase connection
console.log('\n🔗 Test kết nối Supabase...');
const { createClient } = require('@supabase/supabase-js');

try {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );
    
    console.log('   ✅ Supabase client tạo thành công');
    
    // Test thử list buckets
    supabase.storage.listBuckets()
        .then(({ data, error }) => {
            if (error) {
                console.log('   ❌ Lỗi khi test connection:', error.message);
            } else {
                console.log('   ✅ Kết nối Supabase thành công!');
                console.log('   📁 Buckets hiện có:', data.map(b => b.name).join(', '));
                
                // Kiểm tra bucket cần thiết
                const requiredBucket = process.env.SUPABASE_BUCKET_NAME || 'uniplan-upload-file';
                if (data.find(b => b.name === requiredBucket)) {
                    console.log(`   ✅ Bucket "${requiredBucket}" đã tồn tại`);
                } else {
                    console.log(`   ⚠️  Bucket "${requiredBucket}" chưa tồn tại`);
                }
            }
        })
        .catch(err => {
            console.log('   ❌ Lỗi khi test connection:', err.message);
        });
        
} catch (error) {
    console.log('   ❌ Không thể tạo Supabase client:', error.message);
}
