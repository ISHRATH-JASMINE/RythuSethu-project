import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../config/nodemailer.js';

/**
 * Send booking reminders for upcoming bookings (24 hours before)
 * This should be run as a cron job daily
 */
export const sendBookingReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all confirmed bookings happening tomorrow
    const upcomingBookings = await Booking.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: 'Confirmed'
    })
    .populate('farmer', 'name email phone')
    .populate('dealer', 'name email phone dealerInfo');

    console.log(`📅 Found ${upcomingBookings.length} bookings for tomorrow`);

    for (const booking of upcomingBookings) {
      // Send reminder to farmer
      try {
        await Notification.create({
          user: booking.farmer._id,
          title: '⏰ Booking Reminder',
          message: `Reminder: Your booking with ${booking.dealer.name} for ${booking.cropName} is tomorrow at ${booking.timeSlot}`,
          type: 'reminder',
          data: {
            bookingId: booking._id,
            action: 'reminder',
            date: booking.date
          }
        });

        if (booking.farmer.email) {
          const farmerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">⏰ Booking Reminder - RythuSetu</h2>
              <p>Dear ${booking.farmer.name},</p>
              <p>This is a friendly reminder about your upcoming booking tomorrow.</p>
              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Dealer:</strong> ${booking.dealer.name}</p>
                <p><strong>Crop:</strong> ${booking.cropName}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time Slot:</strong> ${booking.timeSlot}</p>
                ${booking.dealer.phone ? `<p><strong>Contact:</strong> ${booking.dealer.phone}</p>` : ''}
              </div>
              <p>Please ensure your crop is ready for delivery/pickup at the scheduled time.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; margin: 20px 0;">
                View Booking Details
              </a>
            </div>
          `;
          
          await sendEmail(
            booking.farmer.email,
            '⏰ Booking Reminder Tomorrow - RythuSetu',
            farmerEmailHtml
          );
        }
      } catch (error) {
        console.error(`Error sending reminder to farmer ${booking.farmer.name}:`, error);
      }

      // Send reminder to dealer
      try {
        await Notification.create({
          user: booking.dealer._id,
          title: '⏰ Booking Reminder',
          message: `Reminder: Booking with ${booking.farmer.name} for ${booking.cropName} is tomorrow at ${booking.timeSlot}`,
          type: 'reminder',
          data: {
            bookingId: booking._id,
            action: 'reminder',
            date: booking.date
          }
        });

        if (booking.dealer.email) {
          const dealerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">⏰ Booking Reminder - RythuSetu</h2>
              <p>Dear ${booking.dealer.name},</p>
              <p>This is a friendly reminder about an upcoming booking tomorrow.</p>
              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Farmer:</strong> ${booking.farmer.name}</p>
                <p><strong>Crop:</strong> ${booking.cropName}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time Slot:</strong> ${booking.timeSlot}</p>
                ${booking.farmer.phone ? `<p><strong>Contact:</strong> ${booking.farmer.phone}</p>` : ''}
              </div>
              <p>Please be ready to receive the crop at the scheduled time.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dealer-dashboard" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; margin: 20px 0;">
                View Booking Details
              </a>
            </div>
          `;
          
          await sendEmail(
            booking.dealer.email,
            '⏰ Booking Reminder Tomorrow - RythuSetu',
            dealerEmailHtml
          );
        }
      } catch (error) {
        console.error(`Error sending reminder to dealer ${booking.dealer.name}:`, error);
      }
    }

    console.log(`✅ Sent ${upcomingBookings.length * 2} booking reminders`);
    return { success: true, count: upcomingBookings.length };
  } catch (error) {
    console.error('❌ Error sending booking reminders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check for overdue bookings and send alerts
 */
export const checkOverdueBookings = async () => {
  try {
    const now = new Date();
    
    // Find confirmed bookings that are past due
    const overdueBookings = await Booking.find({
      date: { $lt: now },
      status: 'Confirmed'
    })
    .populate('farmer', 'name email')
    .populate('dealer', 'name email');

    console.log(`⚠️ Found ${overdueBookings.length} overdue bookings`);

    for (const booking of overdueBookings) {
      // Update status to completed (or you can add an "overdue" status)
      booking.status = 'Completed';
      await booking.save();

      // Notify both parties to update final details
      await Notification.create({
        user: booking.farmer._id,
        title: '📝 Booking Completed',
        message: `Your booking for ${booking.cropName} with ${booking.dealer.name} has been marked as completed. Please rate your experience!`,
        type: 'booking',
        data: { bookingId: booking._id, action: 'completed' }
      });

      await Notification.create({
        user: booking.dealer._id,
        title: '📝 Booking Completed',
        message: `Booking with ${booking.farmer.name} for ${booking.cropName} has been completed.`,
        type: 'booking',
        data: { bookingId: booking._id, action: 'completed' }
      });
    }

    return { success: true, count: overdueBookings.length };
  } catch (error) {
    console.error('Error checking overdue bookings:', error);
    return { success: false, error: error.message };
  }
};
