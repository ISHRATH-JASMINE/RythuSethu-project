import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware - Verifies JWT token and attaches user to request
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Check if user is active
      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      // Update last login
      req.user.lastLogin = new Date();
      await req.user.save();
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Admin only middleware
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      requiredRole: 'admin',
      currentRole: req.user?.role
    });
  }
};

/**
 * Farmer only middleware
 */
export const farmer = (req, res, next) => {
  if (req.user && req.user.role === 'farmer') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Farmer account required.',
      requiredRole: 'farmer',
      currentRole: req.user?.role
    });
  }
};

/**
 * Dealer only middleware
 */
export const dealer = (req, res, next) => {
  if (req.user && req.user.role === 'dealer') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Dealer account required.',
      requiredRole: 'dealer',
      currentRole: req.user?.role
    });
  }
};

/**
 * Approved dealer middleware - Dealer must be approved by admin
 */
export const approvedDealer = (req, res, next) => {
  if (req.user && req.user.role === 'dealer') {
    if (req.user.isDealerApproved()) {
      next();
    } else {
      res.status(403).json({ 
        message: 'Your dealer account is pending approval. Please wait for admin verification.',
        approved: false
      });
    }
  } else {
    res.status(403).json({ 
      message: 'Access denied. Approved dealer account required.',
      requiredRole: 'dealer',
      currentRole: req.user?.role
    });
  }
};

/**
 * Multiple roles middleware - User must have one of the specified roles
 * @param {Array} roles - Array of allowed roles ['farmer', 'dealer', 'admin']
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        requiredRoles: roles,
        currentRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Self or admin middleware - User can access their own data or admin can access any
 */
export const selfOrAdmin = (req, res, next) => {
  const targetUserId = req.params.id || req.params.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === targetUserId) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. You can only access your own data.',
    });
  }
};

