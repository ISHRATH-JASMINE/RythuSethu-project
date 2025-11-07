import express from 'express';
import User from '../models/User.js';
import CropPrice from '../models/CropPrice.js';
import Booking from '../models/Booking.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalFarmers,
      totalDealers,
      pendingDealers,
      approvedDealers,
      totalPrices,
      activePrices,
      totalBookings,
      recentUsers,
      recentDealers
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'dealer' }),
      User.countDocuments({ role: 'dealer', 'dealerInfo.approved': false }),
      User.countDocuments({ role: 'dealer', 'dealerInfo.approved': true }),
      CropPrice.countDocuments(),
      CropPrice.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      User.find({ role: { $ne: 'admin' } })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(10),
      User.find({ role: 'dealer', 'dealerInfo.approved': false })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalAdmins,
        totalFarmers,
        totalDealers,
        pendingDealers,
        approvedDealers,
        totalPrices,
        activePrices,
        totalBookings,
      },
      recentUsers,
      pendingDealerApprovals: recentDealers,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering
 * @access  Private (Admin only)
 */
router.get('/users', protect, admin, async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20, search } = req.query;

    const query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/dealers/pending
 * @desc    Get all pending dealer approvals
 * @access  Private (Admin only)
 */
router.get('/dealers/pending', protect, admin, async (req, res) => {
  try {
    const pendingDealers = await User.find({
      role: 'dealer',
      'dealerInfo.approved': false,
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      dealers: pendingDealers,
      total: pendingDealers.length,
    });
  } catch (error) {
    console.error('Get pending dealers error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/admin/dealers/:id/approve
 * @desc    Approve a dealer account
 * @access  Private (Admin only)
 */
router.put('/dealers/:id/approve', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'dealer') {
      return res.status(400).json({ message: 'User is not a dealer' });
    }

    if (user.dealerInfo.approved) {
      return res.status(400).json({ message: 'Dealer is already approved' });
    }

    // Approve dealer
    user.dealerInfo.approved = true;
    user.dealerInfo.approvedBy = req.user._id;
    user.dealerInfo.approvedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Dealer approved successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Approve dealer error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/admin/dealers/:id/reject
 * @desc    Reject a dealer account
 * @access  Private (Admin only)
 */
router.put('/dealers/:id/reject', protect, admin, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'dealer') {
      return res.status(400).json({ message: 'User is not a dealer' });
    }

    // Reject dealer
    user.dealerInfo.approved = false;
    user.dealerInfo.rejectionReason = reason || 'No reason provided';
    user.isActive = false; // Deactivate account
    await user.save();

    res.json({
      success: true,
      message: 'Dealer rejected successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Reject dealer error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/admin/users/:id/toggle-active
 * @desc    Activate or deactivate a user account
 * @access  Private (Admin only)
 */
router.put('/users/:id/toggle-active', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin accounts' });
    }

    // Toggle active status
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account
 * @access  Private (Admin only)
 */
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/prices
 * @desc    Admin manually adds crop price
 * @access  Private (Admin only)
 */
router.post('/prices', protect, admin, async (req, res) => {
  try {
    const {
      cropName,
      variety,
      price,
      unit,
      quantity,
      location,
      contactInfo,
      qualityGrade,
      validUntil,
      imageUrl,
      description
    } = req.body;

    // Validation
    if (!cropName || !price || !location?.state || !location?.district) {
      return res.status(400).json({
        message: 'Please provide crop name, price, state, and district'
      });
    }

    const cropPrice = await CropPrice.create({
      cropName,
      variety,
      price,
      unit: unit || 'quintal',
      quantity,
      location,
      postedBy: req.user._id,
      postedByRole: 'admin',
      contactInfo,
      qualityGrade,
      validUntil,
      imageUrl,
      description,
      status: 'active',
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Crop price added successfully',
      cropPrice,
    });
  } catch (error) {
    console.error('Admin add price error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/prices
 * @desc    Get all crop prices
 * @access  Private (Admin only)
 */
router.get('/prices', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const prices = await CropPrice.find(query)
      .populate('postedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CropPrice.countDocuments(query);

    res.json({
      success: true,
      prices,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/admin/prices/:id
 * @desc    Update any crop price
 * @access  Private (Admin only)
 */
router.put('/prices/:id', protect, admin, async (req, res) => {
  try {
    const cropPrice = await CropPrice.findById(req.params.id);

    if (!cropPrice) {
      return res.status(404).json({ message: 'Crop price not found' });
    }

    // Update all fields
    const updateFields = [
      'cropName', 'variety', 'price', 'unit', 'quantity',
      'location', 'contactInfo', 'qualityGrade', 'validUntil',
      'imageUrl', 'description', 'status', 'isVerified'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        cropPrice[field] = req.body[field];
      }
    });

    await cropPrice.save();

    res.json({
      success: true,
      message: 'Crop price updated successfully',
      cropPrice,
    });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/prices/:id
 * @desc    Delete any crop price
 * @access  Private (Admin only)
 */
router.delete('/prices/:id', protect, admin, async (req, res) => {
  try {
    const cropPrice = await CropPrice.findById(req.params.id);

    if (!cropPrice) {
      return res.status(404).json({ message: 'Crop price not found' });
    }

    await cropPrice.deleteOne();

    res.json({
      success: true,
      message: 'Crop price deleted successfully',
    });
  } catch (error) {
    console.error('Delete price error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings
 * @access  Private (Admin only)
 */
router.get('/bookings', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('farmer', 'name phone email')
      .populate('dealer', 'name phone email dealerInfo.businessName')
      .populate('cropPrice', 'cropName variety price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
