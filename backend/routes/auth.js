import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      role, 
      location, 
      language,
      // Dealer-specific fields
      businessName,
      businessAddress,
      gstNumber,
      licenseNumber,
      specialization,
      // Farmer-specific fields
      farmSize,
      crops
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (!role || !['farmer', 'dealer'].includes(role)) {
      return res.status(400).json({ message: 'Please select a valid role (farmer or dealer)' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      location,
      language: language || 'en',
    };

    // Add role-specific data
    if (role === 'dealer') {
      userData.dealerInfo = {
        businessName,
        businessAddress,
        gstNumber,
        licenseNumber,
        specialization: specialization || [],
        approved: false, // Dealers need admin approval
      };
    } else if (role === 'farmer') {
      userData.farmerInfo = {
        farmSize,
        crops: crops || [],
      };
    }

    // Create user
    const user = await User.create(userData);

    // Prepare response message
    let message = 'Registration successful';
    if (role === 'dealer') {
      message = 'Registration successful. Your dealer account is pending admin approval.';
    }

    res.status(201).json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: role === 'dealer' ? false : true,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact admin.' });
    }

    // Check if dealer is approved
    if (user.role === 'dealer' && !user.isDealerApproved()) {
      return res.status(403).json({ 
        message: 'Your dealer account is pending admin approval.',
        approved: false,
        role: 'dealer'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Prepare response data
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      language: user.language,
      isActive: user.isActive,
    };

    // Add role-specific data
    if (user.role === 'dealer') {
      responseData.dealerInfo = {
        businessName: user.dealerInfo?.businessName,
        approved: user.dealerInfo?.approved,
        specialization: user.dealerInfo?.specialization,
      };
    } else if (user.role === 'farmer') {
      responseData.farmerInfo = {
        farmSize: user.farmerInfo?.farmSize,
        crops: user.farmerInfo?.crops,
      };
    }

    res.json({
      success: true,
      user: responseData,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.location = req.body.location || user.location;
      user.language = req.body.language || user.language;
      user.fcmToken = req.body.fcmToken || user.fcmToken;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        language: updatedUser.language,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
