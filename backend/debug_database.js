// Check database collections and data
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseState() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan');
    console.log('🔗 Connected to MongoDB');
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log('📂 Database name:', dbName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections in database:');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`  ${collectionName}: ${count} documents`);
      
      // Show sample data for users collection if it exists
      if (collectionName === 'users' && count > 0) {
        const sample = await mongoose.connection.db.collection(collectionName).findOne();
        console.log('    Sample user:', JSON.stringify(sample, null, 2));
      }
    }
    
    // Check if there might be data in a different database
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('\n🗄️ All databases:');
    dbs.databases.forEach(db => {
      console.log(`  ${db.name} (${(db.sizeOnDisk/1024/1024).toFixed(2)} MB)`);
    });
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseState();
