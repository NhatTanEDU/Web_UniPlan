const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Environment Variables Debug');
console.log('=====================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Check all environment variables that contain 'mongo' or 'db'
console.log('\n🔍 All MongoDB-related environment variables:');
for (let key in process.env) {
    if (key.toLowerCase().includes('mongo') || key.toLowerCase().includes('db')) {
        console.log(`${key}:`, process.env[key]);
    }
}

async function testCurrentConnection() {
    console.log('\n🔍 Testing current connection...');
    try {
        const MONGO_URI = process.env.MONGO_URI;
        console.log('Attempting to connect to:', MONGO_URI);
        
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
        console.log('Database name:', mongoose.connection.name);
        
        // List all collections and their counts
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📊 Collections in current database:');
        for (let collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`  ${collection.name}: ${count} documents`);
        }
        
        await mongoose.disconnect();
        console.log('✅ Disconnected');
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

testCurrentConnection();
