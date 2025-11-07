import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import CropPrice from './models/CropPrice.js';
import connectDB from './config/db.js';

dotenv.config();

const telanganaDistricts = [
  'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
  'Nalgonda', 'Adilabad', 'Mahbubnagar', 'Medak', 'Rangareddy',
  'Sangareddy', 'Siddipet', 'Vikarabad', 'Kamareddy', 'Mancherial',
  'Jagtial', 'Peddapalli', 'Suryapet', 'Nagarkurnool', 'Wanaparthy'
];

const crops = [
  { name: 'Rice', varieties: ['Basmati', 'Sona Masuri', 'BPT'] },
  { name: 'Cotton', varieties: ['Bt Cotton', 'Hybrid', 'Desi'] },
  { name: 'Maize', varieties: ['Yellow', 'White', 'Sweet'] },
  { name: 'Turmeric', varieties: ['Duggirala', 'Armoor', 'Salem'] },
  { name: 'Chilli', varieties: ['Guntur', 'Warangal', 'Khammam'] },
  { name: 'Tomato', varieties: ['Hybrid', 'Desi', 'Cherry'] },
  { name: 'Groundnut', varieties: ['Bold', 'Java', 'Red Natal'] },
  { name: 'Soybean', varieties: ['JS 335', 'JS 95-60', 'MAUS'] },
  { name: 'Paddy', varieties: ['MTU 1010', 'RNR 15048', 'JGL'] },
  { name: 'Sugarcane', varieties: ['Co 86032', 'CoC 671', 'Co 0238'] }
];

const dealers = [
  { name: 'Ramesh Kumar', business: 'Sri Venkateswara Traders', phone: '9876543210' },
  { name: 'Lakshmi Devi', business: 'Lakshmi Agro Foods', phone: '9876543211' },
  { name: 'Venkat Rao', business: 'Venkat Rice Mills', phone: '9876543212' },
  { name: 'Anjali Reddy', business: 'Reddy Cotton Traders', phone: '9876543213' },
  { name: 'Suresh Babu', business: 'Suresh Agro Products', phone: '9876543214' },
  { name: 'Madhavi Sharma', business: 'Sharma Commodities', phone: '9876543215' },
  { name: 'Krishna Murthy', business: 'Krishna Trading Co', phone: '9876543216' },
  { name: 'Padma Srinivas', business: 'Padma Agro Exports', phone: '9876543217' },
  { name: 'Ravi Teja', business: 'Ravi Grain Merchants', phone: '9876543218' },
  { name: 'Swathi Naidu', business: 'Swathi Cotton Mills', phone: '9876543219' },
  { name: 'Prakash Goud', business: 'Prakash Agri Traders', phone: '9876543220' },
  { name: 'Uma Maheshwari', business: 'Uma Food Products', phone: '9876543221' },
  { name: 'Naresh Kumar', business: 'Naresh Commodity Hub', phone: '9876543222' },
  { name: 'Sowmya Reddy', business: 'Sowmya Spice Traders', phone: '9876543223' },
  { name: 'Balaji Naik', business: 'Balaji Agro Center', phone: '9876543224' },
  { name: 'Kavitha Rani', business: 'Kavitha Rice Traders', phone: '9876543225' },
  { name: 'Mahesh Chandra', business: 'Mahesh Cotton Market', phone: '9876543226' },
  { name: 'Divya Lakshmi', business: 'Divya Grain Dealers', phone: '9876543227' },
  { name: 'Srinivas Yadav', business: 'Srinivas Agro Exports', phone: '9876543228' },
  { name: 'Priya Kumari', business: 'Priya Trading Company', phone: '9876543229' }
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomQuantity = () => Math.floor(Math.random() * 500) + 100;

const seedDealers = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing dealers and their prices...');
    const existingDealers = await User.find({ role: 'dealer' });
    const dealerIds = existingDealers.map(d => d._id);
    await CropPrice.deleteMany({ postedBy: { $in: dealerIds } });
    await User.deleteMany({ role: 'dealer' });

    console.log('👨‍💼 Creating 20 dealers from different districts of Telangana...');
    
    const createdDealers = [];

    for (let i = 0; i < dealers.length; i++) {
      const district = telanganaDistricts[i];
      const dealerInfo = dealers[i];
      
      const dealer = await User.create({
        name: dealerInfo.name,
        email: `${dealerInfo.name.toLowerCase().replace(/ /g, '.')}@rythusetu.com`,
        password: 'dealer123', // Plain password - will be hashed by pre-save hook
        phone: dealerInfo.phone,
        role: 'dealer',
        dealerInfo: {
          businessName: dealerInfo.business,
          businessType: 'Trader',
          approved: true,
          location: {
            district: district,
            state: 'Telangana',
            pincode: `50${String(i + 1).padStart(4, '0')}`
          },
          licenseNumber: `TG-DLR-${String(i + 1).padStart(4, '0')}`,
          gstNumber: `36AAAAA${String(i + 1).padStart(4, '0')}A1Z5`
        }
      });
      
      createdDealers.push(dealer);
      console.log(`✅ Created dealer: ${dealerInfo.name} from ${district}`);
    }

    console.log('\n🌾 Adding crop prices for each dealer...');
    
    let totalPrices = 0;
    for (const dealer of createdDealers) {
      const numCrops = Math.floor(Math.random() * 5) + 3; // 3-7 crops per dealer
      const selectedCrops = [];
      
      // Randomly select crops
      const shuffledCrops = [...crops].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numCrops && i < shuffledCrops.length; i++) {
        const crop = shuffledCrops[i];
        const variety = getRandomElement(crop.varieties);
        
        let pricePerKg;
        switch (crop.name) {
          case 'Rice':
          case 'Paddy':
            pricePerKg = getRandomPrice(25, 45);
            break;
          case 'Cotton':
            pricePerKg = getRandomPrice(60, 90);
            break;
          case 'Maize':
            pricePerKg = getRandomPrice(18, 28);
            break;
          case 'Turmeric':
            pricePerKg = getRandomPrice(80, 150);
            break;
          case 'Chilli':
            pricePerKg = getRandomPrice(100, 200);
            break;
          case 'Tomato':
            pricePerKg = getRandomPrice(15, 35);
            break;
          case 'Groundnut':
            pricePerKg = getRandomPrice(50, 80);
            break;
          case 'Soybean':
            pricePerKg = getRandomPrice(40, 60);
            break;
          case 'Sugarcane':
            pricePerKg = getRandomPrice(3, 5);
            break;
          default:
            pricePerKg = getRandomPrice(20, 50);
        }

        const district = dealer.dealerInfo?.location?.district || 'Hyderabad';
        
        const cropPrice = await CropPrice.create({
          cropName: crop.name,
          variety: variety,
          price: pricePerKg,
          unit: 'kg',
          quantity: {
            available: getRandomQuantity(),
            unit: 'kg'
          },
          location: {
            state: 'Telangana',
            district: district,
            market: `${district} Mandi`
          },
          postedBy: dealer._id,
          postedByRole: 'dealer',
          dealerName: dealer.name,
          contactInfo: {
            phone: dealer.phone,
            email: dealer.email
          },
          qualityGrade: getRandomElement(['A+', 'A', 'B']),
          status: 'active'
        });
        
        selectedCrops.push(`${crop.name} (${variety})`);
        totalPrices++;
      }
      
      console.log(`  ✅ ${dealer.name}: Added ${numCrops} crops - ${selectedCrops.join(', ')}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Dealers created: ${createdDealers.length}`);
    console.log(`   - Total crop prices: ${totalPrices}`);
    console.log(`   - Districts covered: ${telanganaDistricts.length}`);
    console.log('\n🔑 Login credentials for all dealers:');
    console.log('   Email: [firstname.lastname]@rythusetu.com');
    console.log('   Password: dealer123');
    console.log('\n📝 Example logins:');
    console.log('   - ramesh.kumar@rythusetu.com / dealer123');
    console.log('   - lakshmi.devi@rythusetu.com / dealer123');
    console.log('   - venkat.rao@rythusetu.com / dealer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding dealers:', error);
    process.exit(1);
  }
};

seedDealers();
