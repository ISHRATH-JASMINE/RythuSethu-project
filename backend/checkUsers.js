import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await connectDB();
    
    console.log('\n📊 User Statistics:\n');
    
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const farmers = await User.countDocuments({ role: 'farmer' });
    const dealers = await User.countDocuments({ role: 'dealer' });
    
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admins: ${admins}`);
    console.log(`Farmers: ${farmers}`);
    console.log(`Dealers: ${dealers}`);
    
    console.log('\n👑 Admin Users:\n');
    const adminUsers = await User.find({ role: 'admin' }).select('name email role createdAt');
    adminUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Created: ${user.createdAt?.toLocaleDateString()}`);
    });
    
    console.log('\n👨‍🌾 Farmer Users:\n');
    const farmerUsers = await User.find({ role: 'farmer' }).select('name email role createdAt');
    if (farmerUsers.length === 0) {
      console.log('  No farmers found');
    } else {
      farmerUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Created: ${user.createdAt?.toLocaleDateString()}`);
      });
    }
    
    console.log('\n🏪 Dealer Users (first 5):\n');
    const dealerUsers = await User.find({ role: 'dealer' }).limit(5).select('name email role dealerInfo.businessName createdAt');
    dealerUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Business: ${user.dealerInfo?.businessName || 'N/A'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
