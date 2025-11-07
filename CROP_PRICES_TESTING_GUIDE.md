# Crop Prices Feature - Testing Guide

## ✅ Database Seeded Successfully!

The database has been populated with realistic test data for the Crop Prices feature.

## 📊 Test Data Summary

### Dealers Created: 8
1. **Rama Krishna Traders** (Guntur, AP) - ⭐ 4.5 stars (48 reviews)
   - Specialization: Rice, Wheat, Cotton
   
2. **Sita Agro Dealers** (Vijayawada, Krishna, AP) - ⭐ 4.2 stars (13 reviews)
   - Specialization: Vegetables, Fruits
   
3. **Venkat Farm Produce** (Hyderabad, Telangana) - ⭐ 4.8 stars (33 reviews)
   - Specialization: Rice, Maize, Pulses
   
4. **Lakshmi Crop Buyers** (Tenali, Guntur, AP) - ⭐ 3.9 stars (28 reviews)
   - Specialization: Cotton, Oilseeds
   
5. **Narayana Agri Hub** (Warangal, Telangana) - ⭐ 4.6 stars (10 reviews)
   - Specialization: Rice, Sugarcane, Vegetables
   
6. **Padma Organic Buyers** (Vizag, Visakhapatnam, AP) - ⭐ 4.3 stars (40 reviews)
   - Specialization: Vegetables, Pulses, Oilseeds
   
7. **Rajesh Cotton Traders** (Karimnagar, Telangana) - ⭐ 4.7 stars (57 reviews)
   - Specialization: Cotton
   
8. **Anand Rice Mills** (Eluru, West Godavari, AP) - ⭐ 4.1 stars (42 reviews)
   - Specialization: Rice, Wheat

### Buying Rates: 34 Active Listings
- Various crops with different varieties
- Realistic prices (₹3-80 per kg depending on crop)
- Time slots and availability windows
- Minimum/maximum quantity requirements
- Quality specifications
- Payment terms (immediate, within 24 hours, within week, negotiable)

### Sample Bookings: 8
- **Pending** (2): Awaiting dealer confirmation
- **Confirmed** (2): Dealer accepted, appointment scheduled
- **Completed** (2): Transaction done, ready for rating
- **Cancelled** (2): Cancelled bookings

### Test Farmer Account
- **Email:** farmer.test@example.com
- **Password:** password123
- **Location:** Mangalagiri, Guntur, Andhra Pradesh
- **Farm Size:** 5 acres
- **Crops:** Rice, Cotton, Vegetables

## 🧪 Testing Steps

### 1. Login as Test Farmer

```
Email: farmer.test@example.com
Password: password123
```

### 2. Test Crop Price Browsing

1. Navigate to **Crop Prices** page
2. Notice the district is auto-filled (Guntur) from your profile
3. Try different filters:
   - **Select Crop:** Rice, Cotton, Vegetables, etc.
   - **Select District:** Guntur, Krishna, Hyderabad, etc.
   - **Sort By:** Price (High to Low), Price (Low to High), Recent
4. Click **"Refresh Prices"** to search
5. Verify you see:
   - ✅ Top Deals section (3 highest-priced offers)
   - ✅ Price cards with dealer info, ratings, location
   - ✅ Statistics (Average Price, Price Range, Dealer Count)

### 3. Test Filtering

**Filter by Crop Type:**
- Select "Rice" → Click Refresh
- Should see only rice varieties (Basmati, IR-64, Sona Masuri, BPT)

**Filter by Location:**
- Select "Guntur" district → Click Refresh
- Should see only dealers in Guntur area (Rama Krishna Traders, Lakshmi Crop Buyers)

**Sort by Price:**
- Select "Price (High to Low)" → Click Refresh
- Should see highest-priced offers first

**Sort by Recent:**
- Select "Recent" → Click Refresh
- Should see newest listings first

### 4. Test Dealer Rating Display

Each price card should show:
- ⭐ Star rating (e.g., 4.5 stars)
- Number of reviews (e.g., "48 reviews")
- Yellow stars filled based on rating
- Gray stars for unfilled portion

### 5. Test Booking Flow

1. Click **"Book Slot"** on any dealer card
2. Verify modal opens with:
   - Dealer name and crop info displayed
   - Date picker (can only select tomorrow or later)
   - Time slot dropdown (Morning/Afternoon/Evening)
   - Optional notes field
3. Fill the form:
   - **Date:** Select tomorrow's date
   - **Time Slot:** Morning
   - **Notes:** "Looking to sell 500 kg"
4. Click **"Confirm Booking"**
5. Verify:
   - ✅ Success toast notification appears
   - ✅ Modal closes
   - ✅ Booking created in database

### 6. Test My Bookings Dashboard

1. Navigate to **Dashboard** (home page after login)
2. Scroll to **"My Bookings"** section
3. Verify you see:
   - All 9 bookings (8 sample + 1 you just created)
   - Status badges with correct colors:
     - 🟡 Pending (yellow)
     - 🔵 Confirmed (blue)
     - 🟢 Completed (green)
     - 🔴 Cancelled (red)
   - Booking details: dealer name, crop, date, time, location
   - Notes if any

### 7. Test Rating System

1. In **"My Bookings"**, find a **Completed** booking
2. You should see **"Rate This Transaction"** button
3. Click the button
4. Rating modal opens with:
   - Dealer name and crop displayed
   - 5-star selection interface
   - Optional review text area
5. Test the rating:
   - Click on different stars (1-5)
   - Notice emoji feedback changes (😞 Poor → ⭐ Excellent)
   - Type a review: "Great service, good prices!"
6. Click **"Submit Rating"**
7. Verify:
   - ✅ Success toast: "Thank you for your feedback!"
   - ✅ Modal closes
   - ✅ Bookings refresh

### 8. Test Rating Updates

1. Go back to **Crop Prices** page
2. Search for the dealer you just rated
3. Verify their rating has updated:
   - Star count increased
   - Review count increased (e.g., 49 reviews instead of 48)

### 9. Test Empty States

**No Results:**
1. Filter by a crop not available in selected district
   - Example: Select "Cotton" + "Visakhapatnam"
2. Click Refresh Prices
3. Should see: "No dealers found in your area" message
4. Should have "Adjust Filters" button

**No Bookings:**
1. Login with a different farmer account (create new)
2. Check dashboard
3. Should see: "No bookings yet" with link to Crop Prices

### 10. Test UI/UX Features

**No Flickering:**
1. Go to Crop Prices page
2. Type in filter inputs
3. Notice UI doesn't flicker/change while typing
4. Only updates when you click "Refresh Prices"

**Loading States:**
1. Click Refresh Prices
2. Should see spinner animation while loading
3. Results appear after loading

**Toast Notifications:**
1. Try booking without selecting a dealer
2. Should see error toast
3. Try rating without selecting stars
4. Should see "Please select a rating" error

**Responsive Design:**
1. Resize browser window
2. Verify price cards stack properly on mobile
3. Modals should be scrollable on small screens

## 🔐 Additional Test Accounts

### Dealer Accounts (for testing dealer perspective)

1. rama.krishna@example.com / password123
2. sita.agro@example.com / password123
3. venkat.farm@example.com / password123
4. lakshmi.crops@example.com / password123
5. narayana.agri@example.com / password123
6. padma.organic@example.com / password123
7. rajesh.cotton@example.com / password123
8. anand.rice@example.com / password123

### Dealer Testing Steps

1. Login as dealer
2. Go to Dealer Dashboard
3. View incoming bookings
4. Confirm a pending booking
5. Mark a confirmed booking as completed
6. Check that farmer receives notification

## 📊 Expected Results

### Crop Price Cards Should Show:
- ✅ Dealer name and location
- ✅ Crop name with variety
- ✅ Price per quintal (large, bold)
- ✅ Price per kg (smaller)
- ✅ Minimum quantity
- ✅ Availability hours (e.g., "09:00 - 17:00")
- ✅ View count and inquiry count
- ✅ Active status badge
- ✅ Dealer rating stars
- ✅ "Book Slot" button

### Statistics Panel Should Display:
- ✅ Average Price (calculated from results)
- ✅ Highest Price
- ✅ Lowest Price
- ✅ Number of Dealers

### Top Deals Section Should:
- ✅ Show exactly 3 cards
- ✅ Display highest-priced offers
- ✅ Have gold/yellow styling
- ✅ Show ranking badges (1, 2, 3)

## 🐛 Known Issues to Verify Fixed

1. ✅ No flickering while typing in filters
2. ✅ Empty state only shows after clicking refresh (not before)
3. ✅ AuthContext import error fixed
4. ✅ Dealer rating display working
5. ✅ Booking creates successfully
6. ✅ Completed bookings show rating button

## 💡 Advanced Testing Scenarios

### Test Booking Conflicts
1. Login as dealer
2. Note a confirmed booking's date/time
3. Login as another farmer
4. Try booking same dealer at same date/time
5. Should get error: "This time slot is already booked"

### Test Rating Validation
1. Complete a booking
2. Rate it with 5 stars
3. Try rating the same booking again
4. Should get error: "You have already rated this booking"

### Test Search Combinations
1. Filter by Crop + District
2. Filter by Crop + State
3. Filter by District only
4. No filters (show all)
5. Verify each combination returns correct results

### Test Sorting
1. Search for Rice in Guntur
2. Sort by Price (High to Low)
3. Verify prices are in descending order
4. Sort by Price (Low to High)
5. Verify prices are in ascending order

## 📸 Screenshots to Capture

1. Crop Prices page with search results
2. Top Deals section
3. Individual price card with ratings
4. Booking modal
5. My Bookings section in dashboard
6. Rating modal
7. Success toast notifications
8. Empty states
9. Loading states
10. Mobile responsive views

## ✅ Success Criteria

- [ ] All 34 buying rates visible in search
- [ ] Dealers show correct ratings (3.9 - 4.8 stars)
- [ ] Can filter by crop type
- [ ] Can filter by location
- [ ] Can sort by price and recency
- [ ] Can book appointments successfully
- [ ] Bookings appear in dashboard
- [ ] Can rate completed transactions
- [ ] Ratings update dealer scores
- [ ] No UI flickering
- [ ] All animations smooth
- [ ] Mobile responsive
- [ ] Toast notifications working
- [ ] Empty states display correctly
- [ ] Loading states show appropriately

## 🔧 Troubleshooting

**If no results appear:**
- Check backend is running on port 5000
- Verify MongoDB connection
- Check browser console for errors
- Ensure buying rates are active status

**If bookings don't create:**
- Verify user is logged in as farmer
- Check API endpoint /api/bookings is accessible
- Look for validation errors in backend logs

**If ratings don't submit:**
- Ensure booking status is "Completed"
- Verify rating API endpoint working
- Check for duplicate rating errors

**If dealer ratings don't display:**
- Verify dealer has dealerInfo.rating field
- Check that dealers were seeded correctly
- Ensure populate('dealer') is working in API

## 🎯 Next Steps After Testing

1. Document any bugs found
2. Test with real farmers (UAT)
3. Optimize performance if needed
4. Add more crops/dealers as needed
5. Implement any requested features
6. Deploy to production

---

## 📞 Support

If you encounter any issues during testing:
1. Check browser console for errors
2. Check backend terminal for API errors
3. Verify all dependencies installed
4. Ensure both frontend and backend are running
5. Clear browser cache and retry

Happy Testing! 🌾✨
