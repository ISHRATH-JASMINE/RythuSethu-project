import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BuyingRate from './models/BuyingRate.js';
import User from './models/User.js';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';

dotenv.config();

const seedCropPricesTestData = async () => {
  try {
    await connectDB();
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing buying rates and test bookings...');
    await BuyingRate.deleteMany({});
    await Booking.deleteMany({}); // Clear test bookings
    
    // Find or create test dealers
    const dealers = [];
    const dealerData = [
      {
        name: 'Rama Krishna Traders',
        email: 'rama.krishna@example.com',
        location: { state: 'Andhra Pradesh', district: 'Guntur', village: 'Guntur', pincode: '522001' },
        phone: '9876543210',
        businessName: 'Rama Krishna Agricultural Traders',
        specialization: ['Rice', 'Wheat', 'Cotton']
      },
      {
        name: 'Sita Agro Dealers',
        email: 'sita.agro@example.com',
        location: { state: 'Andhra Pradesh', district: 'Krishna', village: 'Vijayawada', pincode: '520001' },
        phone: '9876543211',
        businessName: 'Sita Agricultural Products',
        specialization: ['Vegetables', 'Fruits']
      },
      {
        name: 'Venkat Farm Produce',
        email: 'venkat.farm@example.com',
        location: { state: 'Telangana', district: 'Hyderabad', village: 'Secunderabad', pincode: '500003' },
        phone: '9876543212',
        businessName: 'Venkat Quality Farm Produce',
        specialization: ['Rice', 'Maize', 'Pulses']
      },
      {
        name: 'Lakshmi Crop Buyers',
        email: 'lakshmi.crops@example.com',
        location: { state: 'Andhra Pradesh', district: 'Guntur', village: 'Tenali', pincode: '522201' },
        phone: '9876543213',
        businessName: 'Lakshmi Agricultural Buyers',
        specialization: ['Cotton', 'Oilseeds']
      },
      {
        name: 'Narayana Agri Hub',
        email: 'narayana.agri@example.com',
        location: { state: 'Telangana', district: 'Warangal', village: 'Warangal', pincode: '506001' },
        phone: '9876543214',
        businessName: 'Narayana Agricultural Hub',
        specialization: ['Rice', 'Sugarcane', 'Vegetables']
      },
      {
        name: 'Padma Organic Buyers',
        email: 'padma.organic@example.com',
        location: { state: 'Andhra Pradesh', district: 'Visakhapatnam', village: 'Vizag', pincode: '530001' },
        phone: '9876543215',
        businessName: 'Padma Organic Products',
        specialization: ['Vegetables', 'Pulses', 'Oilseeds']
      },
      {
        name: 'Rajesh Cotton Traders',
        email: 'rajesh.cotton@example.com',
        location: { state: 'Telangana', district: 'Karimnagar', village: 'Karimnagar', pincode: '505001' },
        phone: '9876543216',
        businessName: 'Rajesh Premium Cotton',
        specialization: ['Cotton']
      },
      {
        name: 'Anand Rice Mills',
        email: 'anand.rice@example.com',
        location: { state: 'Andhra Pradesh', district: 'West Godavari', village: 'Eluru', pincode: '534001' },
        phone: '9876543217',
        businessName: 'Anand Rice Processing',
        specialization: ['Rice', 'Wheat']
      }
    ];

    for (const data of dealerData) {
      let dealer = await User.findOne({ email: data.email });
      
      if (!dealer) {
        dealer = await User.create({
          name: data.name,
          email: data.email,
          password: 'password123', // Will be hashed automatically
          phone: data.phone,
          role: 'dealer',
          location: data.location,
          dealerInfo: {
            businessName: data.businessName,
            businessAddress: `${data.location.village}, ${data.location.district}`,
            approved: true,
            approvedAt: new Date(),
            specialization: data.specialization,
            rating: 0, // Will be updated with ratings
            totalRatings: 0
          }
        });
        console.log(`✅ Created dealer: ${dealer.name}`);
      } else {
        // Update existing dealer to ensure they're approved
        dealer.dealerInfo = dealer.dealerInfo || {};
        dealer.dealerInfo.approved = true;
        dealer.dealerInfo.approvedAt = new Date();
        dealer.dealerInfo.businessName = data.businessName;
        dealer.dealerInfo.specialization = data.specialization;
        dealer.dealerInfo.rating = dealer.dealerInfo.rating || 0;
        dealer.dealerInfo.totalRatings = dealer.dealerInfo.totalRatings || 0;
        dealer.location = data.location;
        await dealer.save();
        console.log(`✅ Updated dealer: ${dealer.name}`);
      }
      
      dealers.push(dealer);
    }

    // Create buying rates with realistic data
    console.log('\n📊 Creating buying rates...');
    
    const crops = [
      { name: 'Rice', varieties: ['Basmati', 'IR-64', 'Sona Masuri', 'BPT'] },
      { name: 'Wheat', varieties: ['Durum', 'Common', 'Hard Red'] },
      { name: 'Maize', varieties: ['Yellow', 'White', 'Sweet'] },
      { name: 'Cotton', varieties: ['MCU-5', 'Bunny Bt', 'Suraj'] },
      { name: 'Sugarcane', varieties: ['Co-86032', 'Co-0238'] },
      { name: 'Pulses', varieties: ['Chickpea', 'Pigeon Pea', 'Black Gram'] },
      { name: 'Vegetables', varieties: ['Tomato', 'Potato', 'Onion'] },
      { name: 'Oilseeds', varieties: ['Groundnut', 'Sunflower', 'Sesame'] }
    ];

    const timeSlots = [
      { from: '09:00', till: '17:00' },
      { from: '08:00', till: '18:00' },
      { from: '10:00', till: '16:00' },
      { from: '09:00', till: '14:00' },
      { from: '14:00', till: '19:00' }
    ];

    const paymentTerms = ['immediate', 'within-24-hours', 'within-week', 'negotiable'];

    const buyingRates = [];

    // Create 3-5 buying rates per dealer
    for (const dealer of dealers) {
      const dealerSpecialization = dealer.dealerInfo.specialization;
      const numRates = Math.floor(Math.random() * 3) + 3; // 3-5 rates per dealer
      
      for (let i = 0; i < numRates; i++) {
        // Select crop from dealer's specialization
        let cropName = dealerSpecialization[Math.floor(Math.random() * dealerSpecialization.length)];
        
        // Find the crop object - handle case where specialization might not match exactly
        let crop = crops.find(c => c.name.toLowerCase() === cropName.toLowerCase());
        
        // If not found, use a default crop
        if (!crop) {
          crop = crops[0]; // Default to Rice
          cropName = crop.name;
        }
        
        const variety = crop.varieties[Math.floor(Math.random() * crop.varieties.length)];
        
        // Generate realistic prices based on crop type
        let basePrice;
        switch (cropName) {
          case 'Rice':
            basePrice = 20 + Math.random() * 15; // ₹20-35 per kg
            break;
          case 'Wheat':
            basePrice = 18 + Math.random() * 12; // ₹18-30 per kg
            break;
          case 'Maize':
            basePrice = 15 + Math.random() * 10; // ₹15-25 per kg
            break;
          case 'Cotton':
            basePrice = 50 + Math.random() * 30; // ₹50-80 per kg
            break;
          case 'Sugarcane':
            basePrice = 3 + Math.random() * 2; // ₹3-5 per kg
            break;
          case 'Pulses':
            basePrice = 40 + Math.random() * 40; // ₹40-80 per kg
            break;
          case 'Vegetables':
            basePrice = 10 + Math.random() * 20; // ₹10-30 per kg
            break;
          case 'Oilseeds':
            basePrice = 45 + Math.random() * 35; // ₹45-80 per kg
            break;
          default:
            basePrice = 20;
        }

        const pricePerKg = Math.round(basePrice * 100) / 100; // Round to 2 decimals
        const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const payment = paymentTerms[Math.floor(Math.random() * paymentTerms.length)];

        const rate = {
          dealer: dealer._id,
          dealerName: dealer.name,
          cropName: `${cropName} (${variety})`,
          buyPricePerKg: pricePerKg,
          availableFrom: timeSlot.from,
          availableTill: timeSlot.till,
          location: {
            state: dealer.location.state,
            district: dealer.location.district,
            address: dealer.dealerInfo.businessAddress,
            pincode: dealer.location.pincode
          },
          minimumQuantity: Math.floor(Math.random() * 400) + 100, // 100-500 kg
          maximumQuantity: Math.floor(Math.random() * 4000) + 1000, // 1000-5000 kg
          qualityRequirements: `Grade A ${variety}, moisture content below 14%, clean and dry`,
          paymentTerms: payment,
          status: 'active',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
          views: Math.floor(Math.random() * 100), // Random views
          inquiries: Math.floor(Math.random() * 20) // Random inquiries
        };

        buyingRates.push(rate);
      }
    }

    // Insert all buying rates
    const createdRates = await BuyingRate.insertMany(buyingRates);
    console.log(`✅ Created ${createdRates.length} buying rates`);

    // Add some ratings to dealers to make it realistic
    console.log('\n⭐ Adding sample ratings to dealers...');
    const ratings = [4.5, 4.2, 4.8, 3.9, 4.6, 4.3, 4.7, 4.1];
    for (let i = 0; i < dealers.length; i++) {
      const dealer = dealers[i];
      dealer.dealerInfo.rating = ratings[i] || 4.0;
      dealer.dealerInfo.totalRatings = Math.floor(Math.random() * 50) + 10; // 10-60 ratings
      await dealer.save();
      console.log(`⭐ ${dealer.name}: ${dealer.dealerInfo.rating} stars (${dealer.dealerInfo.totalRatings} reviews)`);
    }

    // Create a test farmer if not exists
    console.log('\n👨‍🌾 Creating test farmer...');
    let testFarmer = await User.findOne({ email: 'farmer.test@example.com' });
    
    if (!testFarmer) {
      testFarmer = await User.create({
        name: 'Test Farmer',
        email: 'farmer.test@example.com',
        password: 'password123',
        phone: '9999999999',
        role: 'farmer',
        location: {
          state: 'Andhra Pradesh',
          district: 'Guntur',
          village: 'Mangalagiri',
          pincode: '522503'
        },
        farmerInfo: {
          farmSize: 5,
          crops: ['Rice', 'Cotton', 'Vegetables']
        }
      });
      console.log('✅ Created test farmer');
    } else {
      console.log('✅ Test farmer already exists');
    }

    // Create some sample bookings in different states
    console.log('\n📅 Creating sample bookings...');
    const bookingStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    const timeSlotOptions = ['Morning', 'Afternoon', 'Evening'];
    
    for (let i = 0; i < 8; i++) {
      const dealer = dealers[i % dealers.length];
      const rate = createdRates.find(r => r.dealer.toString() === dealer._id.toString());
      
      if (rate) {
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 10) - 5); // -5 to +5 days
        
        const booking = await Booking.create({
          farmer: testFarmer._id,
          farmerName: testFarmer.name,
          dealer: dealer._id,
          dealerName: dealer.name,
          cropName: rate.cropName,
          date: bookingDate,
          timeSlot: timeSlotOptions[i % 3],
          status: bookingStatuses[i % 4],
          notes: i === 0 ? 'Looking to sell 500 kg of produce' : '',
          cropDetails: {
            name: rate.cropName,
            quantity: 0,
            agreedPrice: 0,
            totalAmount: 0
          }
        });
        
        console.log(`✅ Booking #${i + 1}: ${booking.status} - ${rate.cropName}`);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   • Dealers: ${dealers.length}`);
    console.log(`   • Buying Rates: ${createdRates.length}`);
    console.log(`   • Sample Bookings: 8`);
    console.log(`   • Test Farmer: farmer.test@example.com (password: password123)`);
    console.log(`\n🔐 Test Dealer Credentials:`);
    dealers.forEach((dealer, index) => {
      console.log(`   ${index + 1}. ${dealer.email} (password: password123)`);
    });
    console.log('\n💡 Test the feature:');
    console.log('   1. Login as test farmer');
    console.log('   2. Go to Crop Prices page');
    console.log('   3. Search by crop type and district');
    console.log('   4. Book a slot with any dealer');
    console.log('   5. Check "My Bookings" in Dashboard');
    console.log('   6. Rate completed transactions\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedCropPricesTestData();
