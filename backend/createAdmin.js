import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@rythusethu.in' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@rythusethu.in',
      password: 'admin123', // Will be hashed automatically by the User model
      phone: '9999999999',
      role: 'admin',
      language: 'en',
      location: {
        state: 'Telangana',
        district: 'Hyderabad',
        village: 'Hyderabad',
        pincode: '500001'
      },
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin123');
    console.log('👑 Role:', adminUser.role);
    console.log('🆔 User ID:', adminUser._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
