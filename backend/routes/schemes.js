import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Comprehensive government schemes data for Indian farmers
const schemes = [
  {
    id: 1,
    name: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Direct income support of ₹6000 per year to all farmer families across the country in three equal installments.',
    benefits: '₹2000 per installment, 3 times a year directly to bank account',
    eligibility: 'All farmer families owning cultivable land, irrespective of size',
    category: 'financial',
    state: 'All India',
    link: 'https://pmkisan.gov.in/',
    howToApply: 'Apply through CSC centers or online portal with Aadhaar and land records',
  },
  {
    id: 2,
    name: 'Kisan Credit Card',
    fullName: 'KCC Scheme',
    description: 'Short-term credit facility to farmers for crop production, maintenance, and post-harvest expenses at subsidized interest rates.',
    benefits: 'Credit facility up to ₹3 lakhs at 7% interest rate (4% after subsidy)',
    eligibility: 'All farmers including tenant farmers, sharecroppers with cultivation rights',
    category: 'credit',
    state: 'All India',
    link: 'https://www.india.gov.in/spotlight/kisan-credit-card-kcc',
    howToApply: 'Visit nearest bank branch with land documents, Aadhaar, and application form',
  },
  {
    id: 3,
    name: 'PM Fasal Bima Yojana',
    fullName: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Comprehensive crop insurance scheme protecting farmers against crop loss due to natural calamities, pests, and diseases.',
    benefits: 'Premium: 2% for Kharif, 1.5% for Rabi, 5% for Horticulture crops. Claims within 30 days',
    eligibility: 'All farmers growing notified crops in notified areas',
    category: 'insurance',
    state: 'All India',
    link: 'https://pmfby.gov.in/',
    howToApply: 'Enroll through banks, CSCs, or online portal before sowing season ends',
  },
  {
    id: 4,
    name: 'Soil Health Card',
    fullName: 'Soil Health Card Scheme',
    description: 'Provides detailed soil nutrient status and recommendations for appropriate dosage of nutrients for farmers.',
    benefits: 'Free soil testing every 3 years with nutrient recommendations',
    eligibility: 'All farmers across India',
    category: 'advisory',
    state: 'All India',
    link: 'https://soilhealth.dac.gov.in/',
    howToApply: 'Contact local agriculture department for soil sample collection',
  },
  {
    id: 5,
    name: 'Rythu Bandhu',
    fullName: 'Rythu Bandhu Scheme',
    description: 'Investment support scheme providing financial assistance per acre to farmers in Telangana for crop cultivation.',
    benefits: '₹5000 per acre per season (₹10,000 per year for 2 seasons)',
    eligibility: 'All farmers owning cultivable land in Telangana',
    category: 'financial',
    state: 'Telangana',
    link: 'https://rythubandhu.telangana.gov.in/',
    howToApply: 'Automatically enrolled if land records are updated with Aadhaar',
  },
  {
    id: 6,
    name: 'e-NAM',
    fullName: 'National Agriculture Market',
    description: 'Pan-India electronic trading platform connecting APMCs for transparent sale transactions and better price discovery.',
    benefits: 'Better price discovery, online trading, transparent auction, direct payment',
    eligibility: 'Farmers can register and trade in commodities listed in e-NAM',
    category: 'market',
    state: 'All India',
    link: 'https://www.enam.gov.in/',
    howToApply: 'Register online with Aadhaar, mobile number, and bank details',
  },
  {
    id: 7,
    name: 'PMKSY',
    fullName: 'Pradhan Mantri Krishi Sinchayee Yojana',
    description: 'Scheme for enhancing irrigation efficiency, expanding cultivable area, and water conservation in agriculture.',
    benefits: 'Subsidy up to 55% for micro-irrigation systems like drip and sprinkler',
    eligibility: 'Individual farmers, self-help groups, and farmer groups',
    category: 'irrigation',
    state: 'All India',
    link: 'https://pmksy.gov.in/',
    howToApply: 'Apply through district agriculture office or online portal',
  },
  {
    id: 8,
    name: 'Kisan Rail',
    fullName: 'Kisan Rail Scheme',
    description: 'Special parcel trains for fast transportation of perishable agricultural and horticultural commodities.',
    benefits: 'Fast transportation at 50% subsidy, refrigerated coaches, reduced wastage',
    eligibility: 'Individual farmers, FPOs, and farmer groups',
    category: 'transport',
    state: 'All India',
    link: 'https://www.indianrailways.gov.in/',
    howToApply: 'Book through railway parcel offices or online booking system',
  },
  {
    id: 9,
    name: 'PM-KUSUM',
    fullName: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan',
    description: 'Financial support for installation of solar pumps and grid-connected solar power plants on barren land.',
    benefits: '60% subsidy for solar pump installation (30% by govt, 30% by state)',
    eligibility: 'Individual farmers, farmer groups, FPOs, water user associations',
    category: 'irrigation',
    state: 'All India',
    link: 'https://www.mnre.gov.in/pm-kusum/',
    howToApply: 'Apply through state nodal agency with land documents',
  },
  {
    id: 10,
    name: 'National Horticulture Mission',
    fullName: 'Mission for Integrated Development of Horticulture',
    description: 'Holistic growth of horticulture sector covering fruits, vegetables, root crops, mushrooms, spices, and flowers.',
    benefits: 'Subsidy for planting material, irrigation, infrastructure (40-50%)',
    eligibility: 'Individual farmers, groups, and institutions',
    category: 'financial',
    state: 'All India',
    link: 'https://midh.gov.in/',
    howToApply: 'Submit application through district horticulture officer',
  },
  {
    id: 11,
    name: 'Kisan Maan Dhan Yojana',
    fullName: 'Pradhan Mantri Kisan Maan Dhan Yojana',
    description: 'Old age pension scheme providing monthly pension of ₹3000 to small and marginal farmers after 60 years.',
    benefits: '₹3000 per month pension after 60 years of age',
    eligibility: 'Small and marginal farmers (18-40 years) with land up to 2 hectares',
    category: 'financial',
    state: 'All India',
    link: 'https://maandhan.in/',
    howToApply: 'Enroll through CSC centers with Aadhaar and land documents',
  },
  {
    id: 12,
    name: 'National Beekeeping & Honey Mission',
    fullName: 'NBHM',
    description: 'Promotion of scientific beekeeping for increasing productivity and honey production.',
    benefits: 'Subsidy for beehive boxes, training, honey processing equipment (40-60%)',
    eligibility: 'Individual beekeepers, farmer groups, self-help groups',
    category: 'advisory',
    state: 'All India',
    link: 'https://nbhm.nhmportal.com/',
    howToApply: 'Apply through State Agriculture Department',
  },
];

// Get all schemes
router.get('/', protect, async (req, res) => {
  try {
    const { category, state, search } = req.query;
    let filteredSchemes = schemes;

    if (category) {
      filteredSchemes = filteredSchemes.filter(s => s.category === category);
    }

    if (state && state !== 'All India') {
      filteredSchemes = filteredSchemes.filter(
        s => s.state === state || s.state === 'All India'
      );
    }

    if (search) {
      filteredSchemes = filteredSchemes.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(filteredSchemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single scheme
router.get('/:id', protect, async (req, res) => {
  try {
    const scheme = schemes.find(s => s.id === parseInt(req.params.id));
    if (scheme) {
      res.json(scheme);
    } else {
      res.status(404).json({ message: 'Scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get scheme categories
router.get('/meta/categories', protect, async (req, res) => {
  try {
    const categories = [...new Set(schemes.map(s => s.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
