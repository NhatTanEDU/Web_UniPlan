const mongoose = require('mongoose');
const TeamMember = require('./models/teamMember.model');
const Team = require('./models/team.model');
require('dotenv').config();

async function testDatabaseDirectly() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const userId = '6832fb21218f3827624d77c1'; // Admin user ID
        const userObjectId = new mongoose.Types.ObjectId(userId);

        console.log('🔍 Testing TeamMember query...');
        const startTime = Date.now();
        
        // Simple query to see if it hangs
        const memberships = await TeamMember.find({ 
            user_id: userObjectId, 
            is_active: true 
        }).limit(5).lean();
        
        const duration = Date.now() - startTime;
        console.log(`✅ TeamMember query completed in ${duration}ms`);
        console.log(`Found ${memberships.length} memberships`);

        // Test aggregation
        console.log('🔍 Testing TeamMember aggregation...');
        const aggStartTime = Date.now();
        
        const userMembershipsAgg = await TeamMember.aggregate([
            { 
                $match: { 
                    user_id: userObjectId, 
                    is_active: true 
                } 
            },
            { $limit: 5 },
            {
                $project: {
                    team_id: 1,
                    role: 1
                }
            }
        ]);
        
        const aggDuration = Date.now() - aggStartTime;
        console.log(`✅ Aggregation completed in ${aggDuration}ms`);
        console.log(`Found ${userMembershipsAgg.length} teams via aggregation`);

        // Test Team query
        if (userMembershipsAgg.length > 0) {
            const teamIds = userMembershipsAgg.map(m => m.team_id);
            
            console.log('🔍 Testing Team query...');
            const teamStartTime = Date.now();
            
            const teams = await Team.find({
                _id: { $in: teamIds },
                is_deleted: { $ne: true }
            }).limit(5).lean();
            
            const teamDuration = Date.now() - teamStartTime;
            console.log(`✅ Team query completed in ${teamDuration}ms`);
            console.log(`Found ${teams.length} teams`);
        }

        mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.disconnect();
    }
}

testDatabaseDirectly();
