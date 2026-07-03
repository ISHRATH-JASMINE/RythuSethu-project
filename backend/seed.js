import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import ForumPost from './models/ForumPost.js';
import CropPrice from './models/CropPrice.js';

dotenv.config();

const users = [
  {
    name: 'Farmer Demo',
    email: 'farmer.demo@rythusethu.demo',
    password: 'Demo@123',
    phone: '9876543210',
    role: 'farmer',
    language: 'en',
    location: { state: 'Telangana', district: 'Warangal', village: 'Warangal' }
  },
  {
    name: 'Dealer Demo',
    email: 'dealer.demo@rythusethu.demo',
    password: 'Demo@123',
    phone: '9876543211',
    role: 'dealer',
    language: 'en',
    dealerInfo: {
      businessName: 'Dealer Demo Market',
      approved: true,
      rating: 4.7,
      totalRatings: 18
    },
    location: { state: 'Telangana', district: 'Warangal', village: 'Warangal' }
  },
];

const products = [
  {
    name: 'Organic Rice',
    category: 'grains',
    description: 'Premium quality organic basmati rice',
    quantity: 100,
    unit: 'kg',
    price: 80,
    location: { state: 'Telangana', district: 'Warangal', village: 'Dharmasagar' }
  },
  {
    name: 'Fresh Tomatoes',
    category: 'vegetables',
    description: 'Farm fresh tomatoes, harvested today',
    quantity: 50,
    unit: 'kg',
    price: 40,
    location: { state: 'Andhra Pradesh', district: 'Krishna', village: 'Vijayawada' }
  },
  {
    name: 'Pure Turmeric Powder',
    category: 'spices',
    description: 'Organically grown and processed turmeric powder',
    quantity: 20,
    unit: 'kg',
    price: 150,
    location: { state: 'Telangana', district: 'Warangal', village: 'Dharmasagar' }
  },
];

const forumPosts = [
  {
    title: 'Best fertilizer for paddy cultivation?',
    content: 'I am planning to cultivate paddy this kharif season. What fertilizer combination would you recommend for better yield?',
    category: 'crop-advice',
  },
  {
    title: 'Current tomato prices in Hyderabad market',
    content: 'Can anyone share the current market price for tomatoes in Hyderabad? Planning to sell my produce next week.',
    category: 'market-info',
  },
  {
    title: 'PM-KISAN scheme - Application process',
    content: 'Has anyone recently applied for PM-KISAN scheme? What documents are required and what is the process?',
    category: 'schemes',
  },
];

const cropPrices = [
  {
    cropName: 'rice',
    variety: 'Sona Masoori',
    price: 2400,
    unit: 'quintal',
    quantity: { available: 120, unit: 'quintal' },
    location: { state: 'Telangana', district: 'Warangal', market: 'Warangal Market' },
    qualityGrade: 'A',
    status: 'active',
    description: 'Fresh rice stock for farmers in Warangal'
  },
  {
    cropName: 'rice',
    variety: 'Basmati',
    price: 2500,
    unit: 'quintal',
    quantity: { available: 150, unit: 'quintal' },
    location: { state: 'Andhra Pradesh', district: 'Krishna', market: 'Vijayawada Market' },
    qualityGrade: 'A+',
    status: 'active',
    description: 'Premium basmati rice'
  },
  {
    cropName: 'maize',
    variety: 'Yellow Corn',
    price: 1850,
    unit: 'quintal',
    quantity: { available: 180, unit: 'quintal' },
    location: { state: 'Telangana', district: 'Warangal', market: 'Hanamkonda Market' },
    qualityGrade: 'A',
    status: 'active'
  },
  {
    cropName: 'cotton',
    price: 6200,
    unit: 'quintal',
    quantity: { available: 90, unit: 'quintal' },
    location: { state: 'Telangana', district: 'Warangal', market: 'Warangal Cotton Market' },
    qualityGrade: 'A+',
    status: 'active'
  },
  {
    cropName: 'wheat',
    price: 2100,
    unit: 'quintal',
    quantity: { available: 200, unit: 'quintal' },
    location: { state: 'Andhra Pradesh', district: 'Krishna', market: 'Machilipatnam Market' },
    qualityGrade: 'A',
    status: 'active'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await ForumPost.deleteMany({});
    await CropPrice.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const farmerUser = await User.create(users[0]);
    const dealerUser = await User.create(users[1]);
    console.log('✅ Created users');

    // Create products with seller references
    const productsWithSeller = products.map((product, index) => ({
      ...product,
      seller: farmerUser._id,
    }));
    await Product.create(productsWithSeller);
    console.log('✅ Created products');

    // Create forum posts with author references
    const postsWithAuthor = forumPosts.map((post, index) => ({
      ...post,
      author: farmerUser._id,
    }));
    await ForumPost.create(postsWithAuthor);
    console.log('✅ Created forum posts');

    // Create the default admin account used by the UI and docs
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@rythusethu.in',
      password: 'admin123',
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
    console.log('✅ Created admin user');

    const cropPricesWithSeller = cropPrices.map((price) => ({
      ...price,
      postedBy: dealerUser._id,
      postedByRole: 'dealer',
      dealerName: dealerUser.dealerInfo.businessName,
      contactInfo: {
        phone: dealerUser.phone,
        email: dealerUser.email,
      },
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }));

    await CropPrice.create(cropPricesWithSeller);
    console.log('✅ Created crop prices');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Sample Users:');
    console.log(`   - ${farmerUser.email} (password: Demo@123) - Role: farmer`);
    console.log(`   - ${dealerUser.email} (password: Demo@123) - Role: dealer`);
    console.log(`   - ${adminUser.email} (password: admin123) - Role: admin`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
