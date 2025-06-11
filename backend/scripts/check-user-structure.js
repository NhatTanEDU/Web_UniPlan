const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan';

async function checkUserStructure() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        const usersCollection = db.collection('users');
        
        // Lấy tất cả users
        const allUsers = await usersCollection.find({}).toArray();
        console.log(`Total users: ${allUsers.length}`);
        
        // Kiểm tra user "New Ghost"
        const ghostUser = await usersCollection.findOne({ email: { $regex: /ghost/i } });
        if (ghostUser) {
            console.log('\nFound Ghost user:');
            console.log(JSON.stringify(ghostUser, null, 2));
        }
          // Kiểm tra user cụ thể với ID
        const { ObjectId } = require('mongodb');
        const specificUser = await usersCollection.findOne({ _id: new ObjectId('683a2523ddf616be1a376995') });
        if (specificUser) {
            console.log('\nFound specific user (ID: 683a2523ddf616be1a376995):');
            console.log(JSON.stringify(specificUser, null, 2));
        }
        
        // Kiểm tra sample users để xem cấu trúc
        console.log('\nSample users structure:');
        const sampleUsers = await usersCollection.find({}).limit(3).toArray();
        sampleUsers.forEach((user, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log(`Email: ${user.email}`);
            console.log(`Fields: ${Object.keys(user).join(', ')}`);
            if (user.is_active !== undefined) console.log(`is_active: ${user.is_active}`);
            if (user.isActive !== undefined) console.log(`isActive: ${user.isActive}`);
            if (user.active !== undefined) console.log(`active: ${user.active}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nMongoDB connection closed');
    }
}

checkUserStructure();
