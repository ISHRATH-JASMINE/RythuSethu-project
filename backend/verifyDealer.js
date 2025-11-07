import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const verifyDealer = async () => {
  try {
    await connectDB();
    
    const email = 'ramesh.kumar@rythusetu.com';
    const password = 'dealer123';
    
    console.log(`\n🔍 Checking dealer with email: ${email}`);
    
    const dealer = await User.findOne({ email });
    
    if (!dealer) {
      console.log('❌ Dealer not found in database!');
      
      // Check all dealers
      const allDealers = await User.find({ role: 'dealer' }).select('name email');
      console.log(`\n📋 Found ${allDealers.length} dealers in database:`);
      allDealers.forEach((d, i) => {
        console.log(`   ${i + 1}. ${d.name} - ${d.email}`);
      });
      
      process.exit(1);
    }
    
    console.log('✅ Dealer found!');
    console.log(`   Name: ${dealer.name}`);
    console.log(`   Email: ${dealer.email}`);
    console.log(`   Role: ${dealer.role}`);
    console.log(`   Approved: ${dealer.dealerInfo?.approved}`);
    console.log(`   Business: ${dealer.dealerInfo?.businessName}`);
    console.log(`   Location: ${dealer.dealerInfo?.location?.district}, ${dealer.dealerInfo?.location?.state}`);
    
    // Test password
    console.log(`\n🔐 Testing password: ${password}`);
    const isMatch = await bcrypt.compare(password, dealer.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('   Stored hash:', dealer.password.substring(0, 20) + '...');
      
      // Create new hash for comparison
      const newHash = await bcrypt.hash(password, 10);
      console.log('   New hash would be:', newHash.substring(0, 20) + '...');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyDealer();
