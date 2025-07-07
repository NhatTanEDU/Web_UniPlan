const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan';

async function fixUserFields() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        const usersCollection = db.collection('users');
        
        // Tìm tất cả users có field isActive
        const usersWithIsActive = await usersCollection.find({ isActive: { $exists: true } }).toArray();
        console.log(`Found ${usersWithIsActive.length} users with 'isActive' field`);
        
        if (usersWithIsActive.length > 0) {
            console.log('Fixing field names from isActive to is_active...');
            
            for (const user of usersWithIsActive) {
                // Thêm field is_active với giá trị từ isActive
                await usersCollection.updateOne(
                    { _id: user._id },
                    { 
                        $set: { is_active: user.isActive },
                        $unset: { isActive: 1 }
                    }
                );
                console.log(`Updated user: ${user.email || user._id} - isActive: ${user.isActive} -> is_active: ${user.isActive}`);
            }
            
            console.log('All users updated successfully!');
        }
        
        // Kiểm tra lại sau khi fix
        const usersWithIsActiveAfter = await usersCollection.find({ is_active: { $exists: true } }).toArray();
        console.log(`\nAfter fix: ${usersWithIsActiveAfter.length} users with 'is_active' field`);
        
        // Hiển thị một vài user để kiểm tra
        const sampleUsers = await usersCollection.find({}).limit(3).toArray();
        console.log('\nSample users after fix:');
        sampleUsers.forEach(user => {
            console.log(`- ${user.email || user._id}: is_active=${user.is_active}, isActive=${user.isActive || 'undefined'}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

fixUserFields();
