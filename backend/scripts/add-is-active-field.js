const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan';

async function addIsActiveToAllUsers() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        const usersCollection = db.collection('users');
        
        // Tìm tất cả users không có field is_active
        const usersWithoutIsActive = await usersCollection.find({ 
            is_active: { $exists: false } 
        }).toArray();
        
        console.log(`Found ${usersWithoutIsActive.length} users without 'is_active' field`);
        
        if (usersWithoutIsActive.length > 0) {
            // Cập nhật tất cả users không có is_active
            const result = await usersCollection.updateMany(
                { is_active: { $exists: false } },
                { $set: { is_active: true } }
            );
            
            console.log(`Updated ${result.modifiedCount} users with is_active: true`);
        }
        
        // Kiểm tra lại sau khi cập nhật
        const totalUsers = await usersCollection.countDocuments({});
        const usersWithIsActive = await usersCollection.countDocuments({ 
            is_active: { $exists: true } 
        });
        
        console.log(`\nAfter update:`);
        console.log(`Total users: ${totalUsers}`);
        console.log(`Users with is_active field: ${usersWithIsActive}`);
        
        // Kiểm tra một vài users
        const sampleUsers = await usersCollection.find({}).limit(5).toArray();
        console.log('\nSample users after update:');
        sampleUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} - is_active: ${user.is_active}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nMongoDB connection closed');
    }
}

addIsActiveToAllUsers();
