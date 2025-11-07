import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const checkDealer = async () => {
  try {
    await connectDB();
    
    const dealer = await User.findOne({ email: 'ramesh.kumar@rythusetu.com' });
    
    if (!dealer) {
      console.log('Dealer not found');
      process.exit(1);
    }
    
    console.log('\n📋 Full Dealer Document:');
    console.log(JSON.stringify(dealer, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDealer();
