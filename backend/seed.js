import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import ForumPost from './models/ForumPost.js';

dotenv.config();

const users = [
  {
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'farmer',
    language: 'te',
    location: { state: 'Telangana', district: 'Warangal', village: 'Dharmasagar' }
  },
  {
    name: 'Lakshmi Devi',
    email: 'lakshmi@example.com',
    password: 'password123',
    phone: '9876543211',
    role: 'farmer',
    language: 'te',
    location: { state: 'Andhra Pradesh', district: 'Krishna', village: 'Vijayawada' }
  },
  {
    name: 'Ramesh Reddy',
    email: 'ramesh@example.com',
    password: 'password123',
    phone: '9876543212',
    role: 'buyer',
    language: 'en',
    location: { state: 'Telangana', district: 'Hyderabad', village: 'Kukatpally' }
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

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await ForumPost.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log('✅ Created users');

    // Create products with seller references
    const productsWithSeller = products.map((product, index) => ({
      ...product,
      seller: createdUsers[index % 2]._id, // Assign to farmers
    }));
    await Product.create(productsWithSeller);
    console.log('✅ Created products');

    // Create forum posts with author references
    const postsWithAuthor = forumPosts.map((post, index) => ({
      ...post,
      author: createdUsers[index]._id,
    }));
    await ForumPost.create(postsWithAuthor);
    console.log('✅ Created forum posts');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Sample Users:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} (password: password123) - Role: ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
