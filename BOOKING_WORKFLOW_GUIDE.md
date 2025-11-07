# Booking Workflow Guide - Farmer & Dealer

## 🌾 Complete Booking & Rating Flow

This guide explains how farmers book appointments with dealers and how dealers manage those bookings.

---

## 👨‍🌾 FARMER SIDE

### 1. Browse Crop Prices

**Where:** Crop Prices page (`/crop-prices`)

**Steps:**
1. Login as farmer
2. Navigate to "Crop Prices" from the menu
3. Use filters to find dealers:
   - Select crop type (e.g., Rice, Cotton)
   - Select location (State/District)
   - Choose sort order (Price High/Low, Recent)
4. Click "Refresh Prices"

**What You See:**
- List of dealer buying rates
- Dealer ratings (⭐ stars)
- Prices per kg and per quintal
- Availability hours
- Location details
- "Book Slot" button

---

### 2. Book an Appointment

**Where:** Crop Prices page - Click "Book Slot" on any dealer card

**Steps:**
1. Click "Book Slot" button
2. Modal opens with booking form
3. Fill in details:
   - **Date:** Select tomorrow or any future date
   - **Time Slot:** Morning (9-12), Afternoon (12-4), or Evening (4-7)
   - **Notes:** Optional (e.g., "Looking to sell 500kg of paddy")
4. Click "Confirm Booking"

**What Happens:**
- ✅ Booking created with status "Pending"
- 📧 Dealer receives email notification
- 🔔 Dealer gets in-app notification
- 🎉 You see success toast: "Booking created successfully!"
- Modal closes automatically

---

### 3. View Your Bookings

**Where:** Dashboard (`/dashboard`)

**Steps:**
1. Go to Dashboard (home page after login)
2. Scroll to "My Bookings" section
3. See all your bookings with:
   - 🟡 **Pending** - Waiting for dealer confirmation
   - 🔵 **Confirmed** - Dealer accepted, appointment scheduled
   - 🟢 **Completed** - Transaction finished
   - 🔴 **Cancelled** - Cancelled by you or dealer

**What You See:**
- Dealer name and crop
- Booking date and time slot
- Dealer location
- Status badge
- Notes if any
- "Rate This Transaction" button (for Completed bookings only)

---

### 4. Rate Completed Transactions

**Where:** Dashboard - "My Bookings" section

**Steps:**
1. Find a booking with status "Completed"
2. Click "Rate This Transaction" button
3. Rating modal opens
4. Select stars (1-5):
   - ⭐ 1 star = 😞 Poor
   - ⭐⭐ 2 stars = 😐 Fair
   - ⭐⭐⭐ 3 stars = 👍 Good
   - ⭐⭐⭐⭐ 4 stars = 😊 Very Good
   - ⭐⭐⭐⭐⭐ 5 stars = ⭐ Excellent!
5. Write review (optional): "Great prices and quick service!"
6. Click "Submit Rating"

**What Happens:**
- ✅ Rating saved to database
- 📊 Dealer's average rating updates
- 🎉 Success toast: "Thank you for your feedback!"
- Updated rating shows on dealer's price cards
- Other farmers can see the rating

**Validation:**
- ❌ Can only rate Completed bookings
- ❌ Can't rate same booking twice
- ❌ Must select at least 1 star

---

## 🏪 DEALER SIDE

### 1. View Incoming Bookings

**Where:** Dealer Dashboard (`/dealer-dashboard`)

**Steps:**
1. Login as dealer
2. Dashboard opens to "Bookings" tab by default
3. See all bookings from farmers
4. Bookings are organized by status

**What You See:**
- Farmer name and contact
- Crop they want to sell
- Requested date and time slot
- Farmer's location
- Booking notes
- Status badge
- Action buttons

---

### 2. Approve/Confirm a Booking

**When:** Booking status is "Pending"

**Steps:**
1. Review the booking details
2. Check:
   - Farmer name and location
   - Crop type and quantity (in notes)
   - Requested date and time
3. Click "✅ Confirm" button

**What Happens:**
- ✅ Booking status changes to "Confirmed"
- 📧 Farmer receives email notification
- 🔔 Farmer gets in-app notification
- 🎉 Toast: "Booking confirmed successfully!"
- "Confirm" button disappears
- Shows "Mark Complete" button

**Alternative:** Click "❌ Cancel" to reject the booking

---

### 3. Mark Booking as Completed

**When:** Booking status is "Confirmed" AND transaction is done

**Steps:**
1. After farmer visits and sells crops
2. Transaction completed successfully
3. Click "✔️ Mark Complete" button

**What Happens:**
- ✅ Booking status changes to "Completed"
- 📧 Farmer receives email asking for rating
- 🔔 Farmer gets notification: "Transaction completed - Please rate!"
- 🎉 Toast: "Booking completed successfully!"
- In farmer's dashboard, "Rate This Transaction" button appears

**This is Important:** Only completed bookings can be rated!

---

### 4. Cancel a Booking

**When:** Need to cancel (any status except Completed)

**Steps:**
1. Click "❌ Cancel" button
2. Confirm the action

**What Happens:**
- ❌ Booking status changes to "Cancelled"
- 📧 Farmer receives cancellation email
- 🔔 Farmer gets notification
- Status badge turns red

---

### 5. View Your Ratings

**Where:** Dealer Dashboard - "Ratings" tab (if implemented)

**What You See:**
- Overall average rating (e.g., ⭐ 4.5 stars)
- Total number of ratings
- Individual farmer reviews
- Rating distribution (how many 5-star, 4-star, etc.)

**Benefits:**
- Higher ratings attract more farmers
- Good reviews build trust
- Ratings displayed on all your buying rate cards

---

## 📊 Complete Booking Lifecycle

### Status Flow:

```
1. PENDING (🟡)
   ↓
   Dealer clicks "Confirm"
   ↓
2. CONFIRMED (🔵)
   ↓
   Transaction happens in real life
   ↓
   Dealer clicks "Mark Complete"
   ↓
3. COMPLETED (🟢)
   ↓
   Farmer clicks "Rate This Transaction"
   ↓
4. RATING SUBMITTED (⭐)
   ↓
   Dealer's rating updates
```

### Cancellation:
```
PENDING → Dealer/Farmer cancels → CANCELLED (🔴)
CONFIRMED → Dealer/Farmer cancels → CANCELLED (🔴)
```

---

## 🔐 Test Accounts

### Farmer Account:
```
Email: farmer.test@example.com
Password: password123
```

### Dealer Accounts (8 dealers):
```
1. rama.krishna@example.com / password123
2. sita.agro@example.com / password123
3. venkat.farm@example.com / password123
4. lakshmi.crops@example.com / password123
5. narayana.agri@example.com / password123
6. padma.organic@example.com / password123
7. rajesh.cotton@example.com / password123
8. anand.rice@example.com / password123
```

---

## 🧪 Testing the Complete Flow

### Test Scenario 1: Happy Path

1. **Farmer books:**
   - Login as farmer.test@example.com
   - Go to Crop Prices
   - Filter: Rice + Guntur
   - Click "Book Slot" on Rama Krishna Traders
   - Select tomorrow, Morning slot
   - Submit booking

2. **Dealer approves:**
   - Logout and login as rama.krishna@example.com
   - Go to Dealer Dashboard
   - See new booking in Pending status
   - Click "✅ Confirm"

3. **Transaction happens:**
   - (In real life: Farmer visits dealer, sells crops)
   - Dealer clicks "✔️ Mark Complete"

4. **Farmer rates:**
   - Logout and login as farmer.test@example.com
   - Go to Dashboard
   - See Completed booking
   - Click "Rate This Transaction"
   - Give 5 stars and write review
   - Submit rating

5. **Verify rating:**
   - Go to Crop Prices
   - Search for Rama Krishna Traders
   - See updated rating on their card

### Test Scenario 2: Cancellation by Dealer

1. Farmer creates booking
2. Dealer sees it in Pending status
3. Dealer clicks "❌ Cancel"
4. Booking status → Cancelled
5. Farmer sees cancellation in their bookings

### Test Scenario 3: Multiple Bookings

1. Farmer creates 3 bookings with different dealers
2. Different dates and time slots
3. Check all appear in "My Bookings"
4. Dealers see their respective bookings
5. Each dealer can manage independently

---

## 📧 Notifications You'll Receive

### Farmer Notifications:
1. **Booking Confirmed:**
   - Subject: "✅ Booking Confirmed - RythuSetu"
   - Message: Dealer accepted your booking, prepare crops

2. **Booking Cancelled:**
   - Subject: "❌ Booking Cancelled - RythuSetu"
   - Message: Dealer cancelled, try another dealer

3. **Transaction Completed:**
   - Subject: "🎉 Transaction Completed - RythuSetu"
   - Message: Rate your experience!

### Dealer Notifications:
1. **New Booking Request:**
   - Subject: "📦 New Booking Request - RythuSetu"
   - Message: Farmer wants to sell crops

2. **Booking Cancelled by Farmer:**
   - Subject: "❌ Booking Cancelled - RythuSetu"
   - Message: Farmer cancelled their booking

---

## ✅ Features Summary

### Farmer Features:
- ✅ Browse dealer buying rates
- ✅ Filter by crop and location
- ✅ Sort by price
- ✅ View dealer ratings
- ✅ Book appointments online
- ✅ View all bookings in dashboard
- ✅ Track booking status
- ✅ Rate completed transactions
- ✅ Write reviews

### Dealer Features:
- ✅ Receive booking notifications
- ✅ View all incoming bookings
- ✅ Confirm bookings
- ✅ Cancel bookings
- ✅ Mark bookings as completed
- ✅ Track booking status
- ✅ View ratings and reviews
- ✅ Build reputation through ratings

---

## 🎯 Benefits

### For Farmers:
- 📱 Book appointments from home
- 📊 Compare prices easily
- ⭐ Choose trusted dealers (via ratings)
- 🔔 Get instant notifications
- 📅 Plan visits in advance
- 💬 Share feedback through ratings

### For Dealers:
- 📦 Manage bookings efficiently
- 📧 Get notified of new requests
- ⭐ Build reputation
- 👥 Attract more farmers
- 📊 Track transaction history
- 💼 Professional online presence

---

## 🐛 Troubleshooting

**Q: I can't book a slot**
- Ensure you're logged in as farmer
- Check if dealer has active buying rates
- Select future date (not today/past)

**Q: Dealer doesn't see my booking**
- Check if dealer is approved
- Verify booking was created (check dashboard)
- Dealer should refresh their dashboard

**Q: Can't rate a booking**
- Only Completed bookings can be rated
- Can't rate twice
- Must select at least 1 star

**Q: Rating doesn't update**
- Refresh the page
- Check backend is running
- Verify booking status is Completed

---

## 📱 Mobile Experience

All features work on mobile:
- ✅ Responsive design
- ✅ Touch-friendly buttons
- ✅ Scrollable modals
- ✅ Mobile notifications
- ✅ Easy to use on phones

---

**Happy Trading! 🌾✨**

For support, contact: support@rythusetu.com
