import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const email = 'b23cs150@kitsw.ac.in';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      console.log('\n📋 Creating test user...');
      
      const newUser = await User.create({
        name: 'Test User',
        email: email,
        password: '123456',
        phone: '1234567890',
        role: 'farmer',
        location: {
          state: 'Telangana',
          district: 'Warangal'
        }
      });
      
      console.log('✅ Test user created successfully!');
      console.log('Email:', newUser.email);
      console.log('Password: 123456');
      console.log('Role:', newUser.role);
    } else {
      console.log('✅ User found!');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      
      // Test password
      const isMatch = await user.matchPassword('123456');
      console.log('Password "123456" matches:', isMatch);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testLogin();
