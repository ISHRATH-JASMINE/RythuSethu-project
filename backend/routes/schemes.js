import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Dummy government schemes data
const schemes = [
  {
    id: 1,
    name: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Direct income support of ₹6000 per year to all farmer families',
    benefits: '₹2000 per installment, 3 times a year',
    eligibility: 'All farmer families owning cultivable land',
    category: 'financial',
    state: 'All India',
    link: 'https://pmkisan.gov.in/',
  },
  {
    id: 2,
    name: 'Kisan Credit Card',
    fullName: 'KCC Scheme',
    description: 'Short-term credit to farmers for crop production and other needs',
    benefits: 'Credit facility up to ₹3 lakhs at subsidized interest rate',
    eligibility: 'Farmers with ownership/cultivation rights',
    category: 'credit',
    state: 'All India',
    link: 'https://www.india.gov.in/spotlight/kisan-credit-card-kcc',
  },
  {
    id: 3,
    name: 'PM Fasal Bima Yojana',
    fullName: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Crop insurance scheme for farmers against crop loss',
    benefits: 'Premium: 2% for Kharif, 1.5% for Rabi crops',
    eligibility: 'All farmers growing notified crops',
    category: 'insurance',
    state: 'All India',
    link: 'https://pmfby.gov.in/',
  },
  {
    id: 4,
    name: 'Soil Health Card',
    fullName: 'Soil Health Card Scheme',
    description: 'Provides soil nutrient status information to farmers',
    benefits: 'Free soil testing and recommendations',
    eligibility: 'All farmers',
    category: 'advisory',
    state: 'All India',
    link: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: 5,
    name: 'Rythu Bandhu',
    fullName: 'Rythu Bandhu Scheme',
    description: 'Investment support for farmers in Telangana',
    benefits: '₹5000 per acre per season',
    eligibility: 'All farmers in Telangana',
    category: 'financial',
    state: 'Telangana',
    link: 'https://rythubandhu.telangana.gov.in/',
  },
  {
    id: 6,
    name: 'e-NAM',
    fullName: 'National Agriculture Market',
    description: 'Online trading platform for agricultural commodities',
    benefits: 'Better price discovery and transparent auction system',
    eligibility: 'Farmers can register and trade online',
    category: 'market',
    state: 'All India',
    link: 'https://www.enam.gov.in/',
  },
  {
    id: 7,
    name: 'PMKSY',
    fullName: 'Pradhan Mantri Krishi Sinchayee Yojana',
    description: 'Enhancing irrigation efficiency and water conservation',
    benefits: 'Subsidy for micro-irrigation and water conservation',
    eligibility: 'Individual farmers and groups',
    category: 'irrigation',
    state: 'All India',
    link: 'https://pmksy.gov.in/',
  },
  {
    id: 8,
    name: 'Kisan Rail',
    fullName: 'Kisan Rail Scheme',
    description: 'Special trains for transporting perishable agricultural products',
    benefits: 'Fast and efficient transportation at subsidized rates',
    eligibility: 'Farmers and farmer groups',
    category: 'transport',
    state: 'All India',
    link: 'https://www.indianrailways.gov.in/',
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
