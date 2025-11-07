import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CropPrice from './models/CropPrice.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

// Sample crop prices data
const sampleCropPrices = [
  // Rice prices in Andhra Pradesh
  {
    cropName: 'rice',
    variety: 'Basmati',
    location: {
      state: 'Andhra Pradesh',
      district: 'Krishna',
      market: 'Vijayawada Market'
    },
    price: 2500,
    unit: 'quintal',
    quantity: { available: 150, unit: 'quintal' },
    qualityGrade: 'A+',
    status: 'active',
    description: 'Premium quality basmati rice, freshly harvested'
  },
  {
    cropName: 'rice',
    variety: 'Sona Masoori',
    location: {
      state: 'Andhra Pradesh',
      district: 'Guntur',
      market: 'Guntur Mandi'
    },
    price: 2200,
    unit: 'quintal',
    quantity: { available: 200, unit: 'quintal' },
    qualityGrade: 'A',
    status: 'active',
    description: 'High quality sona masoori rice'
  },
  {
    cropName: 'rice',
    location: {
      state: 'Telangana',
      district: 'Warangal',
      market: 'Warangal Market'
    },
    price: 2400,
    unit: 'quintal',
    quantity: { available: 100, unit: 'quintal' },
    qualityGrade: 'A',
    status: 'active'
  },

  // Wheat prices
  {
    cropName: 'wheat',
    location: {
      state: 'Punjab',
      district: 'Ludhiana',
      market: 'Ludhiana Mandi'
    },
    price: 2100,
    unit: 'quintal',
    quantity: { available: 300, unit: 'quintal' },
    qualityGrade: 'A+',
    status: 'active',
    description: 'Premium wheat from Punjab'
  },
  {
    cropName: 'wheat',
    location: {
      state: 'Haryana',
      district: 'Karnal',
      market: 'Karnal Market'
    },
    price: 2050,
    unit: 'quintal',
    quantity: { available: 250, unit: 'quintal' },
    qualityGrade: 'A',
    status: 'active'
  },

  // Cotton prices
  {
    cropName: 'cotton',
    location: {
      state: 'Gujarat',
      district: 'Ahmedabad',
      market: 'Ahmedabad Cotton Market'
    },
    price: 6500,
    unit: 'quintal',
    quantity: { available: 80, unit: 'quintal' },
    qualityGrade: 'A+',
    status: 'active',
    description: 'Premium quality cotton'
  },
  {
    cropName: 'cotton',
    location: {
      state: 'Maharashtra',
      district: 'Nagpur',
      market: 'Nagpur Market'
    },
    price: 6200,
    unit: 'quintal',
    quantity: { available: 120, unit: 'quintal' },
    qualityGrade: 'A',
    status: 'active'
  },

  // Maize prices
  {
    cropName: 'maize',
    location: {
      state: 'Karnataka',
      district: 'Belgaum',
      market: 'Belgaum Mandi'
    },
    price: 1800,
    unit: 'quintal',
    quantity: { available: 180, unit: 'quintal' },
    qualityGrade: 'A',
    status: 'active'
  },
  {
    cropName: 'maize',
    location: {
      state: 'Andhra Pradesh',
      district: 'Krishna',
      market: 'Vijayawada Market'
    },
    price: 1850,
    unit: 'quintal',
    quantity: { available: 150, unit: 'quintal' },
    qualityGrade: 'A+',
    status: 'active'
  },

  // Sugarcane prices
  {
    cropName: 'sugarcane',
    location: {
      state: 'Uttar Pradesh',
      district: 'Muzaffarnagar',
      market: 'Muzaffarnagar Market'
    },
    price: 3500,
    unit: 'ton',
    quantity: { available: 500, unit: 'ton' },
    qualityGrade: 'A+',
    status: 'active'
  },

  // Pulses prices
  {
    cropName: 'pulses',
    variety: 'Tur Dal',
    location: {
      state: 'Madhya Pradesh',
      district: 'Indore',
      market: 'Indore Mandi'
    },
    price: 8500,
    unit: 'quintal',
    quantity: { available: 60, unit: 'quintal' },
    qualityGrade: 'A+',
    status: 'active'
  },

  // More Krishna district prices
  {
    cropName: 'rice',
    variety: 'IR-64',
    location: {
      state: 'Andhra Pradesh',
      district: 'Krishna',
      market: 'Machilipatnam Market'
    },
    price: 2300,
    unit: 'quintal',
    quantity: { available: 180, unit: 'quintal' },
    qualityGrade: 'A',
    status: 'active'
  },
  {
    cropName: 'maize',
    variety: 'Sweet Corn',
    location: {
      state: 'Andhra Pradesh',
      district: 'Krishna',
      market: 'Gudivada Market'
    },
    price: 1900,
    unit: 'quintal',
    quantity: { available: 120, unit: 'quintal' },
    qualityGrade: 'A+',
    status: 'active'
  }
];

const seedCropPrices = async () => {
  try {
    await connectDB();

    // Find all dealers and admins
    const dealers = await User.find({ role: { $in: ['dealer', 'admin'] } });
    
    if (dealers.length === 0) {
      console.log('⚠️  No dealers or admins found. Creating sample admin user...');
      
      // Create a sample admin/dealer user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      
      const adminUser = await User.create({
        name: 'Sample Dealer',
        email: 'dealer@sample.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'dealer',
        dealerInfo: {
          businessName: 'Sample Agro Dealers',
          approved: true
        },
        location: {
          state: 'Andhra Pradesh',
          district: 'Krishna'
        }
      });
      
      dealers.push(adminUser);
      console.log('✅ Created sample dealer user');
    }

    console.log(`📊 Found ${dealers.length} dealers`);

    // Clear existing crop prices
    await CropPrice.deleteMany({});
    console.log('🗑️  Cleared existing crop prices');

    // Add crop prices with random dealer assignments
    const cropPricesToInsert = sampleCropPrices.map((price, index) => {
      const dealer = dealers[index % dealers.length];
      return {
        ...price,
        postedBy: dealer._id,
        postedByRole: 'dealer',
        dealerName: dealer.dealerInfo?.businessName || dealer.name,
        contactInfo: {
          phone: dealer.phone,
          email: dealer.email
        },
        // Add some price trends
        previousPrice: price.price - Math.floor(Math.random() * 200),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
    });

    const createdPrices = await CropPrice.insertMany(cropPricesToInsert);
    
    console.log(`✅ Successfully created ${createdPrices.length} crop prices`);
    
    // Show summary by crop
    const summary = await CropPrice.aggregate([
      {
        $group: {
          _id: '$cropName',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$quantity.available' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📈 Crop Price Summary:');
    summary.forEach(crop => {
      console.log(`  ${crop._id}: ${crop.count} entries, Avg: ₹${crop.avgPrice.toFixed(0)}, Total Stock: ${crop.totalStock}`);
    });

    console.log('\n🎉 Crop price seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding crop prices:', error);
    process.exit(1);
  }
};

seedCropPrices();
