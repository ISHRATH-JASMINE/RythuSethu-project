import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Dummy agent programs and jobs
const programs = [
  {
    id: 1,
    title: 'Organic Farming Training Program',
    organization: 'Agriculture Department',
    description: 'Learn modern organic farming techniques and certification process',
    duration: '3 months',
    location: 'District Agriculture Office',
    eligibility: 'Farmers with minimum 2 acres land',
    benefits: 'Free training, certification, market linkage',
    applicationDeadline: '2025-11-30',
    status: 'open',
  },
  {
    id: 2,
    title: 'Drip Irrigation Subsidy Program',
    organization: 'Horticulture Department',
    description: 'Get subsidy for installing drip irrigation systems',
    duration: 'One-time',
    location: 'Online Application',
    eligibility: 'All farmers',
    benefits: 'Up to 60% subsidy on installation',
    applicationDeadline: '2025-12-31',
    status: 'open',
  },
  {
    id: 3,
    title: 'Farmer Producer Organization (FPO) Training',
    organization: 'NABARD',
    description: 'Training for forming and managing FPOs',
    duration: '2 months',
    location: 'Regional Office',
    eligibility: 'Groups of 10+ farmers',
    benefits: 'Free training, seed funding support',
    applicationDeadline: '2025-10-31',
    status: 'open',
  },
];

const jobs = [
  {
    id: 1,
    title: 'Contract Farming - Rice',
    company: 'AgriCorp Ltd',
    description: 'Contract farming opportunity for basmati rice cultivation',
    location: 'Punjab, Haryana',
    salary: 'Assured buyback at MSP + 10%',
    requirements: 'Minimum 5 acres, irrigation facility',
    type: 'contract',
  },
  {
    id: 2,
    title: 'Dairy Farming Assistant',
    company: 'Milk Producers Cooperative',
    description: 'Assist in dairy farm management and operations',
    location: 'Various Districts',
    salary: '₹15,000 - ₹20,000/month',
    requirements: 'Experience in dairy farming',
    type: 'employment',
  },
  {
    id: 3,
    title: 'Organic Vegetable Supply',
    company: 'Fresh Foods Pvt Ltd',
    description: 'Supply certified organic vegetables to retail chains',
    location: 'Near Major Cities',
    salary: 'Premium pricing - 20% above market',
    requirements: 'Organic certification, consistent supply',
    type: 'contract',
  },
];

// Get all programs
router.get('/programs', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let filteredPrograms = programs;

    if (status) {
      filteredPrograms = filteredPrograms.filter(p => p.status === status);
    }

    if (search) {
      filteredPrograms = filteredPrograms.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(filteredPrograms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all jobs
router.get('/jobs', protect, async (req, res) => {
  try {
    const { type, search } = req.query;
    let filteredJobs = jobs;

    if (type) {
      filteredJobs = filteredJobs.filter(j => j.type === type);
    }

    if (search) {
      filteredJobs = filteredJobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(filteredJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply to program (dummy)
router.post('/programs/:id/apply', protect, async (req, res) => {
  try {
    const program = programs.find(p => p.id === parseInt(req.params.id));
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Dummy application
    res.json({
      message: 'Application submitted successfully',
      applicationId: `APP-${Date.now()}`,
      program: program.title,
      status: 'pending',
      appliedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply to job (dummy)
router.post('/jobs/:id/apply', protect, async (req, res) => {
  try {
    const job = jobs.find(j => j.id === parseInt(req.params.id));
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Dummy application
    res.json({
      message: 'Application submitted successfully',
      applicationId: `JOB-${Date.now()}`,
      job: job.title,
      status: 'pending',
      appliedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly updates (dummy)
router.get('/updates/weekly', protect, async (req, res) => {
  try {
    const updates = {
      week: `Week of ${new Date().toLocaleDateString()}`,
      programs: {
        new: 2,
        closing: 1,
        recommended: programs.slice(0, 2),
      },
      jobs: {
        new: 3,
        recommended: jobs.slice(0, 2),
      },
      insights: [
        'New organic farming subsidy announced',
        'Wheat procurement prices increased by 5%',
        'Drip irrigation training starting next month',
      ],
    };

    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
