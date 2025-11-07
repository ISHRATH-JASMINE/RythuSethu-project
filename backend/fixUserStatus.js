import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const fixUserStatus = async () => {
  try {
    await connectDB();
    
    console.log('\n🔧 Fixing user isActive status...\n');
    
    // Set isActive to true for all users who don't have it set
    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with isActive: true`);
    
    // Verify
    const allUsers = await User.find().select('name email role isActive');
    console.log('\n📊 All Users Status:\n');
    allUsers.forEach(user => {
      console.log(`  ${user.role.toUpperCase().padEnd(10)} | ${user.name.padEnd(25)} | isActive: ${user.isActive !== false ? '✅ true' : '❌ false'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixUserStatus();
