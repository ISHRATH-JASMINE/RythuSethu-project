import express from 'express';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendEmail } from '../config/nodemailer.js';
import { admin } from '../config/firebase.js';
import { sendBookingReminders, checkOverdueBookings } from '../services/bookingReminders.js';

const router = express.Router();

// Get user notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.user.toString() === req.user._id.toString()) {
      notification.read = true;
      await notification.save();
      res.json(notification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.user.toString() === req.user._id.toString()) {
      await notification.deleteOne();
      res.json({ message: 'Notification deleted' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send push notification
router.post('/send-push', protect, async (req, res) => {
  try {
    const { userId, title, message, data } = req.body;

    // Save to database
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type: data?.type || 'general',
      data,
    });

    // Send FCM push notification
    const user = await User.findById(userId);
    
    if (user && user.fcmToken) {
      try {
        const fcmMessage = {
          notification: {
            title,
            body: message,
          },
          data: data || {},
          token: user.fcmToken,
        };

        await admin.messaging().send(fcmMessage);
        console.log('✅ Push notification sent');
      } catch (fcmError) {
        console.error('❌ FCM Error:', fcmError);
      }
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send email notification
router.post('/send-email', protect, async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    const result = await sendEmail(to, subject, html);

    if (result.success) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test notification (dummy)
router.post('/test', protect, async (req, res) => {
  try {
    const notification = await Notification.create({
      user: req.user._id,
      title: 'Test Notification',
      message: 'This is a test notification from RythuSetu',
      type: 'general',
    });

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send booking reminders (Admin only - can be called by cron job)
router.post('/send-reminders', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await sendBookingReminders();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check overdue bookings (Admin only - can be called by cron job)
router.post('/check-overdue', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await checkOverdueBookings();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
