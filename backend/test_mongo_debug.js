const mongoose = require('mongoose');
const PersonalMemberList = require('./models/personalMemberList.model');
const User = require('./models/user.model');

async function testMongoDB() {
    try {        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/uniplan');
        console.log('✅ Kết nối MongoDB thành công');

        const ownerId = '6832fb21218f3827624d77c1';
        const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        console.log('🔍 Testing with ownerId:', ownerId);
        console.log('🔍 OwnerObjectId:', ownerObjectId);        // 1. Test simple find with ObjectId
        console.log('\n1️⃣ Test simple find with ObjectId:');
        const simpleFind = await PersonalMemberList.find({ owner_user_id: ownerObjectId });
        console.log('Simple find results:', simpleFind.length);
        if (simpleFind.length > 0) {
            console.log('First result:', {
                _id: simpleFind[0]._id,
                owner_user_id: simpleFind[0].owner_user_id,
                member_user_id: simpleFind[0].member_user_id,
                custom_role: simpleFind[0].custom_role
            });
        }

        // 1.5. Test raw MongoDB query
        console.log('\n1.5️⃣ Test raw MongoDB collection:');
        const db = mongoose.connection.db;
        const rawPersonalMembers = await db.collection('personalmemberlists').find({
            owner_user_id: ownerObjectId
        }).toArray();
        console.log('Raw collection results:', rawPersonalMembers.length);
        if (rawPersonalMembers.length > 0) {
            console.log('First raw result:', {
                _id: rawPersonalMembers[0]._id,
                owner_user_id: rawPersonalMembers[0].owner_user_id,
                member_user_id: rawPersonalMembers[0].member_user_id,
                custom_role: rawPersonalMembers[0].custom_role
            });
        }        // 2. Test users collection
        console.log('\n2️⃣ Test users collection:');
        const users = await User.find({});
        console.log('Total users:', users.length);
        
        // 2.5. Test raw users collection
        console.log('\n2.5️⃣ Test raw users collection:');
        const rawUsers = await db.collection('users').find({}).toArray();
        console.log('Raw users collection:', rawUsers.length);
        if (rawUsers.length > 0) {
            console.log('First raw user:', {
                _id: rawUsers[0]._id,
                name: rawUsers[0].name,
                email: rawUsers[0].email
            });
        }

        // 3. Test specific member IDs
        console.log('\n3️⃣ Test specific member IDs:');
        const memberIds = ['6833648430b1ad3fa16f070d', '6833648430b1ad3fa16f0710'];
        for (let memberId of memberIds) {
            const user = await User.findById(memberId);
            console.log(`User ${memberId}:`, user ? { name: user.name, email: user.email } : 'NOT FOUND');
        }        // 4. Test basic aggregation without lookup
        console.log('\n4️⃣ Test basic aggregation:');
        const basicAgg = await PersonalMemberList.aggregate([
            { $match: { owner_user_id: ownerObjectId } }
        ]);
        console.log('Basic aggregation results:', basicAgg.length);

        // 4.5. Test raw aggregation
        console.log('\n4.5️⃣ Test raw aggregation:');
        const rawAgg = await db.collection('personalmemberlists').aggregate([
            { $match: { owner_user_id: ownerObjectId } }
        ]).toArray();
        console.log('Raw aggregation results:', rawAgg.length);        // 5. Test aggregation with lookup
        console.log('\n5️⃣ Test aggregation with lookup:');
        const lookupAgg = await db.collection('personalmemberlists').aggregate([
            { $match: { owner_user_id: ownerObjectId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'member_user_id',
                    foreignField: '_id',
                    as: 'member_user_data'
                }
            }
        ]).toArray();
        console.log('Lookup aggregation results:', lookupAgg.length);
        if (lookupAgg.length > 0) {
            console.log('First lookup result:', {
                _id: lookupAgg[0]._id,
                custom_role: lookupAgg[0].custom_role,
                member_user_data_count: lookupAgg[0].member_user_data?.length || 0,
                member_user_data: lookupAgg[0].member_user_data?.length > 0 ? 
                    lookupAgg[0].member_user_data[0] : 'NO DATA'
            });
        }

        // 6. Test collection names
        console.log('\n6️⃣ Check collection names:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:');
        collections.forEach(col => console.log(' -', col.name));

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Đã ngắt kết nối MongoDB');
    }
}

testMongoDB();
