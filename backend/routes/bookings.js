import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { sendEmail } from '../config/nodemailer.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking (Farmer only)
// @access  Protected
router.post('/', protect, async (req, res) => {
  try {
    const { dealerId, cropName, date, timeSlot, notes } = req.body;

    // Validate required fields
    if (!dealerId || !cropName || !date || !timeSlot) {
      return res.status(400).json({ 
        message: 'Please provide dealer, crop name, date, and time slot' 
      });
    }

    // Verify dealer exists
    const dealer = await User.findById(dealerId);
    if (!dealer || dealer.role !== 'dealer') {
      return res.status(404).json({ message: 'Dealer not found' });
    }

    // Check if dealer is approved
    if (!dealer.dealerInfo?.approved) {
      return res.status(400).json({ 
        message: 'This dealer is not yet approved. Please choose another dealer.' 
      });
    }

    // Parse and validate date
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ 
        message: 'Booking date cannot be in the past' 
      });
    }

    // Check for duplicate booking (same dealer, date, and time slot)
    const existingBooking = await Booking.findOne({
      dealer: dealerId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      timeSlot,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: `This time slot is already booked. Please choose a different time or date.`,
        conflict: true
      });
    }

    // Create booking
    const booking = await Booking.create({
      farmer: req.user._id,
      farmerName: req.user.name,
      dealer: dealerId,
      dealerName: dealer.name,
      cropName,
      date: bookingDate,
      timeSlot,
      notes,
      cropDetails: {
        name: cropName,
        quantity: 0,
        agreedPrice: 0,
        totalAmount: 0,
      }
    });

    // Populate references
    await booking.populate('farmer', 'name email phone location');
    await booking.populate('dealer', 'name email phone dealerInfo');

    // Create notification for dealer about new booking
    try {
      await Notification.create({
        user: dealerId,
        title: '📦 New Booking Request',
        message: `${req.user.name} wants to sell ${cropName} on ${new Date(date).toLocaleDateString()}`,
        type: 'booking',
        data: {
          bookingId: booking._id,
          action: 'new_booking',
          farmerName: req.user.name,
          cropName,
          date: bookingDate
        }
      });

      // Send email notification to dealer
      if (dealer.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🌾 New Booking Request - RythuSetu</h2>
            <p>Dear ${dealer.name},</p>
            <p>You have received a new booking request:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Farmer:</strong> ${req.user.name}</p>
              <p><strong>Crop:</strong> ${cropName}</p>
              <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p><strong>Time Slot:</strong> ${timeSlot}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            <p>Please log in to your dealer dashboard to confirm or reject this booking.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dealer-dashboard" 
               style="display: inline-block; background: #059669; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View Booking
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated email from RythuSetu. Please do not reply.
            </p>
          </div>
        `;
        
        await sendEmail(
          dealer.email,
          '📦 New Booking Request - RythuSetu',
          emailHtml
        );
      }
    } catch (notifError) {
      console.error('Notification/Email error:', notifError);
      // Don't fail the booking if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/farmer
// @desc    Get all bookings for logged-in farmer
// @access  Protected (Farmer)
router.get('/farmer', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.user._id })
      .populate('dealer', 'name email phone dealerInfo location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Fetch farmer bookings error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/dealer
// @desc    Get all bookings for logged-in dealer
// @access  Protected (Dealer)
router.get('/dealer', protect, async (req, res) => {
  try {
    if (req.user.role !== 'dealer') {
      return res.status(403).json({ message: 'Access denied. Dealer only.' });
    }

    const bookings = await Booking.find({ dealer: req.user._id })
      .populate('farmer', 'name email phone location')
      .sort({ createdAt: -1 });

    // Count by status
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      confirmed: bookings.filter(b => b.status === 'Confirmed').length,
      cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    };

    res.json({
      success: true,
      stats,
      bookings
    });
  } catch (error) {
    console.error('Fetch dealer bookings error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('farmer', 'name email phone location')
      .populate('dealer', 'name email phone dealerInfo location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (
      booking.farmer.toString() !== req.user._id.toString() &&
      booking.dealer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Fetch booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status (Dealer or Farmer)
// @access  Protected
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isDealer = booking.dealer.toString() === req.user._id.toString();
    const isFarmer = booking.farmer.toString() === req.user._id.toString();

    if (!isDealer && !isFarmer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate status transitions
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Only dealers can confirm bookings
    if (status === 'Confirmed' && !isDealer && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Only dealers can confirm bookings' 
      });
    }

    // Only dealers can mark as completed
    if (status === 'Completed' && !isDealer && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Only dealers can mark bookings as completed' 
      });
    }

    // Update status
    booking.status = status;
    
    if (notes) {
      if (isDealer) {
        booking.dealerNotes = notes;
      } else if (isFarmer) {
        booking.farmerNotes = notes;
      }
    }

    // Add to status history
    booking.statusHistory.push({
      status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes: notes || ''
    });

    if (status === 'Cancelled') {
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.user._id;
      booking.cancellationReason = notes || '';
    }

    await booking.save();

    // Populate references
    await booking.populate('farmer', 'name email phone');
    await booking.populate('dealer', 'name email phone');

    // Send notifications based on status change
    try {
      let notificationTitle = '';
      let notificationMessage = '';
      let recipientId = null;
      let recipientEmail = null;
      let emailSubject = '';
      let emailHtml = '';

      if (status === 'Confirmed' && isDealer) {
        // Notify farmer that booking is confirmed
        recipientId = booking.farmer._id;
        recipientEmail = booking.farmer.email;
        notificationTitle = '✅ Booking Confirmed';
        notificationMessage = `Your booking with ${booking.dealer.name} for ${booking.cropName} has been confirmed!`;
        emailSubject = '✅ Booking Confirmed - RythuSetu';
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">✅ Booking Confirmed - RythuSetu</h2>
            <p>Dear ${booking.farmer.name},</p>
            <p>Great news! Your booking has been confirmed by the dealer.</p>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <p><strong>Dealer:</strong> ${booking.dealer.name}</p>
              <p><strong>Crop:</strong> ${booking.cropName}</p>
              <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time Slot:</strong> ${booking.timeSlot}</p>
              ${booking.dealerNotes ? `<p><strong>Dealer Notes:</strong> ${booking.dealerNotes}</p>` : ''}
            </div>
            <p>Please prepare your crop for delivery/pickup at the scheduled time.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="display: inline-block; background: #059669; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View Booking Details
            </a>
          </div>
        `;
      } else if (status === 'Completed' && isDealer) {
        // Notify farmer that booking is completed (they can now rate)
        recipientId = booking.farmer._id;
        recipientEmail = booking.farmer.email;
        notificationTitle = '🎉 Transaction Completed';
        notificationMessage = `Your transaction with ${booking.dealer.name} for ${booking.cropName} has been completed. Please rate your experience!`;
        emailSubject = '🎉 Transaction Completed - RythuSetu';
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🎉 Transaction Completed - RythuSetu</h2>
            <p>Dear ${booking.farmer.name},</p>
            <p>Your transaction with ${booking.dealer.name} has been marked as completed!</p>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <p><strong>Dealer:</strong> ${booking.dealer.name}</p>
              <p><strong>Crop:</strong> ${booking.cropName}</p>
              <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time Slot:</strong> ${booking.timeSlot}</p>
            </div>
            <p>We'd love to hear about your experience! Please take a moment to rate the dealer's service.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="display: inline-block; background: #059669; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Rate This Transaction
            </a>
          </div>
        `;
      } else if (status === 'Cancelled') {
        // Notify the other party about cancellation
        if (isDealer) {
          recipientId = booking.farmer._id;
          recipientEmail = booking.farmer.email;
          notificationTitle = '❌ Booking Cancelled';
          notificationMessage = `${booking.dealer.name} cancelled the booking for ${booking.cropName}`;
          emailSubject = '❌ Booking Cancelled - RythuSetu';
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">❌ Booking Cancelled - RythuSetu</h2>
              <p>Dear ${booking.farmer.name},</p>
              <p>Unfortunately, your booking has been cancelled by the dealer.</p>
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p><strong>Dealer:</strong> ${booking.dealer.name}</p>
                <p><strong>Crop:</strong> ${booking.cropName}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
              </div>
              <p>You can create a new booking with another dealer from your dashboard.</p>
            </div>
          `;
        } else if (isFarmer) {
          recipientId = booking.dealer._id;
          recipientEmail = booking.dealer.email;
          notificationTitle = '❌ Booking Cancelled';
          notificationMessage = `${booking.farmer.name} cancelled the booking for ${booking.cropName}`;
          emailSubject = '❌ Booking Cancelled - RythuSetu';
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">❌ Booking Cancelled - RythuSetu</h2>
              <p>Dear ${booking.dealer.name},</p>
              <p>The farmer has cancelled their booking.</p>
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p><strong>Farmer:</strong> ${booking.farmer.name}</p>
                <p><strong>Crop:</strong> ${booking.cropName}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
              </div>
            </div>
          `;
        }
      }

      // Create notification
      if (recipientId) {
        await Notification.create({
          user: recipientId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'booking',
          data: {
            bookingId: booking._id,
            action: status.toLowerCase(),
            status
          }
        });

        // Send email
        if (recipientEmail && emailHtml) {
          await sendEmail(recipientEmail, emailSubject, emailHtml);
        }
      }
    } catch (notifError) {
      console.error('Notification/Email error:', notifError);
      // Don't fail the status update if notification fails
    }

    res.json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Protected (Farmer who created it or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only farmer who created or admin can delete
    if (
      booking.farmer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
