const mongoose = require('mongoose');
require('dotenv').config();
const Team = require('./models/team.model');

async function findTeams() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan');
    console.log('Connected to MongoDB');
    
    const teams = await Team.find({ is_deleted: false }).populate('created_by', 'full_name email').limit(5);
      console.log('Available teams:');
    teams.forEach((team, i) => {
      console.log(`${i + 1}. ${team.team_name} (ID: ${team._id}) - Created by: ${team.created_by?.full_name || 'Unknown'}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

findTeams();
