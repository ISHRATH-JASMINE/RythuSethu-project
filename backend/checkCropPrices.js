import mongoose from 'mongoose';
import CropPrice from './models/CropPrice.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPrices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const allPrices = await CropPrice.find({});
    console.log('\n📊 Total Crop Prices in Database:', allPrices.length);

    if (allPrices.length > 0) {
      console.log('\n📝 Sample Crop Price Entry:');
      console.log(JSON.stringify(allPrices[0], null, 2));

      console.log('\n📋 All Crop Names:');
      const cropNames = await CropPrice.distinct('cropName');
      console.log(cropNames);

      console.log('\n🏪 Prices by Crop:');
      for (const cropName of cropNames) {
        const count = await CropPrice.countDocuments({ cropName });
        const sample = await CropPrice.findOne({ cropName });
        console.log(`\n  ${cropName.toUpperCase()}:`);
        console.log(`    Count: ${count}`);
        if (sample) {
          console.log(`    Sample Price: ₹${sample.pricePerQuintal || sample.price}/qtl`);
          console.log(`    Location: ${sample.location?.district}, ${sample.location?.state}`);
          console.log(`    Stock: ${sample.stockAvailable || sample.quantity?.available} qtl`);
          console.log(`    Active: ${sample.isActive}`);
        }
      }
    } else {
      console.log('\n⚠️ No crop prices found in database!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkPrices();
