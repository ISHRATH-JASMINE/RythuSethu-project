# 🧪 Complete Testing Guide - RythuSetu Project

## 📋 Table of Contents
1. [Language System Testing](#language-system-testing)
2. [Feature-by-Feature Testing](#feature-by-feature-testing)
3. [Test Data Setup](#test-data-setup)
4. [User Roles Testing](#user-roles-testing)
5. [Known Issues & Fixes](#known-issues--fixes)

---

## 🌐 Language System Testing

### Current Status
- ✅ 3 Languages Supported: English (en), Telugu (te), Hindi (hi)
- ✅ Language selector in Navbar
- ✅ Translations stored in localStorage
- ✅ Auto-sync with i18n

### How to Test Language Switching
1. **Open the Application** in browser
2. **Click the Globe Icon** (🌐) in navbar
3. **Select Language**: English / తెలుగు / हिन्दी
4. **Verify**:
   - All navbar links change language
   - Dashboard content changes language
   - Footer changes language
   - All buttons and labels update
5. **Refresh Browser** - Language should persist

### Pages with Full Translation Support
✅ Navbar
✅ Footer  
✅ Dashboard
✅ Login/Register
✅ Crop Advisor
✅ Government Schemes
✅ Storage Finder
✅ Community Forum
✅ Profile

---

## 🎯 Feature-by-Feature Testing

### 1. **Authentication System** 🔐

#### Test User Accounts (Already Seeded)
```
Admin:
- Email: admin@rythusetu.com
- Password: admin123

Farmer:
- Email: farmer.test@example.com
- Password: password123

Dealer:
- Email: dealer1@example.com
- Password: password123
```

#### Test Cases:
- [ ] Register new farmer
- [ ] Register new dealer (pending approval)
- [ ] Login as admin
- [ ] Login as farmer
- [ ] Login as dealer
- [ ] Logout functionality
- [ ] Profile page access
- [ ] Role-based redirects

---

### 2. **Farmer Dashboard** 👨‍🌾

#### Features to Test:
- [ ] Welcome message with farmer name
- [ ] Quick access cards display:
  - [ ] Crop Advisor
  - [ ] Crop Prices
  - [ ] Cold Storage
  - [ ] Community Forum
  - [ ] Govt. Schemes
- [ ] Bookings section:
  - [ ] View all bookings
  - [ ] Filter by status (All/Pending/Confirmed/Completed/Cancelled)
  - [ ] Search by dealer/crop name
  - [ ] Booking statistics cards
  - [ ] "Book Again" button
  - [ ] Rate completed bookings
- [ ] Language switching updates all text

#### Test Data:
Run: `node backend/seedCropPricesTest.js`
This creates 8 sample bookings for farmer.test@example.com

---

### 3. **Crop Prices & Booking System** 💰

#### Features to Test:
- [ ] Browse crop prices by:
  - [ ] Crop type
  - [ ] State
  - [ ] District
  - [ ] Sort (Price High/Low, Rating)
- [ ] Dealer cards show:
  - [ ] Dealer name & rating
  - [ ] Crop name & variety
  - [ ] Price per kg/quintal
  - [ ] Available quantity
  - [ ] Location
- [ ] Book Slot functionality:
  - [ ] Select date (future dates only)
  - [ ] Select time slot
  - [ ] Add notes
  - [ ] Confirm booking
- [ ] Email notifications sent
- [ ] Bookings appear in farmer dashboard

#### Test Flow:
1. Login as farmer
2. Navigate to Crop Prices
3. Filter by crop (e.g., Rice)
4. Click "Book Slot" on any dealer
5. Fill booking form
6. Submit
7. Check Dashboard → My Bookings
8. Verify booking appears

---

### 4. **Dealer Dashboard** 🏪

#### Features to Test:
- [ ] Statistics cards:
  - [ ] Total buying rates
  - [ ] Total bookings
  - [ ] Pending bookings
  - [ ] Average rating
- [ ] Post Buying Rate:
  - [ ] Crop name dropdown
  - [ ] Variety selection
  - [ ] Price per unit
  - [ ] Available quantity
  - [ ] State/District
  - [ ] Quality grade
  - [ ] Valid until date
- [ ] Manage Bookings:
  - [ ] View all bookings
  - [ ] Confirm booking
  - [ ] Cancel booking
  - [ ] Mark as Complete
- [ ] View buying rates posted
- [ ] Update/delete rates

#### Test Flow:
1. Login as dealer
2. Post a new buying rate
3. Wait for farmer to book
4. Confirm booking
5. Mark as completed
6. Check rating from farmer

---

### 5. **Government Schemes** 📄

#### Features to Test:
- [ ] Statistics dashboard shows:
  - [ ] Total schemes (12)
  - [ ] All India schemes
  - [ ] Financial aid count
  - [ ] Filtered results count
- [ ] Search functionality
- [ ] Category filter dropdown with counts
- [ ] Scheme cards display:
  - [ ] Category icon
  - [ ] Scheme name
  - [ ] Full name
  - [ ] Description
  - [ ] Benefits (green box)
  - [ ] Eligibility (blue box)
  - [ ] How to Apply (purple box)
  - [ ] State/Location
  - [ ] Apply Now button (external link)
- [ ] Language switching updates all text

#### Test Data:
12 schemes pre-loaded:
- PM-KISAN
- Kisan Credit Card
- PM Fasal Bima Yojana
- Soil Health Card
- Rythu Bandhu (Telangana)
- e-NAM
- PMKSY
- Kisan Rail
- PM-KUSUM
- National Horticulture Mission
- Kisan Maan Dhan Yojana
- National Beekeeping Mission

---

### 6. **Cold Storage Finder** 🏭

#### Features to Test:
- [ ] Search by pincode
- [ ] Use GPS location
- [ ] Filter by storage type:
  - [ ] Cold Storage
  - [ ] Warehouse
  - [ ] Mandi
- [ ] Results show:
  - [ ] Storage name
  - [ ] Type
  - [ ] Capacity
  - [ ] Rating
  - [ ] Facilities (grading, packaging, transport)
  - [ ] Contact info
  - [ ] Distance from location
- [ ] Language support

#### Test Data:
Run: `node backend/seedColdStorage.js`
This creates 15 sample storage facilities

---

### 7. **Crop Advisor** 🌱

#### Features to Test:
- [ ] Form inputs:
  - [ ] Location
  - [ ] Soil type dropdown
  - [ ] Soil pH
  - [ ] Season selection
  - [ ] Land size
  - [ ] Rainfall level
  - [ ] Previous crop
- [ ] Get Recommendations button
- [ ] Results display:
  - [ ] Top 3 crop recommendations
  - [ ] Suitability score
  - [ ] Duration
  - [ ] Water requirement
  - [ ] Expected yield
  - [ ] Market demand
  - [ ] Farming tips
- [ ] Language switching

---

### 8. **Community Forum** 💬

#### Features to Test:
- [ ] View all posts
- [ ] Create new post
- [ ] Add comments
- [ ] Like posts
- [ ] View post details
- [ ] Author information
- [ ] Timestamp display
- [ ] Language support

---

### 9. **Admin Dashboard** 👑

#### Features to Test:
- [ ] User management:
  - [ ] View all users
  - [ ] Filter by role
  - [ ] Activate/Deactivate users
- [ ] Dealer approvals:
  - [ ] View pending dealers
  - [ ] Approve dealer
  - [ ] Reject dealer
- [ ] Statistics:
  - [ ] Total users
  - [ ] Total farmers
  - [ ] Total dealers
  - [ ] Active users

---

## 📊 Test Data Setup

### Quick Setup Commands

```bash
# Navigate to backend
cd backend

# 1. Create Admin
node createAdmin.js

# 2. Seed Dealers (8 dealers)
node seedDealers.js

# 3. Seed Crop Prices (34 buying rates)
node seedCropPrices.js

# 4. Seed Test Data (Farmer + 8 bookings)
node seedCropPricesTest.js

# 5. Seed Cold Storage (15 facilities)
node seedColdStorage.js
```

### Manual Test Accounts

**Create Test Farmer:**
1. Go to /register
2. Select "Farmer"
3. Fill details
4. Login

**Create Test Dealer:**
1. Go to /register
2. Select "Dealer"
3. Fill business details
4. Wait for admin approval
5. Admin approves from dashboard
6. Login as dealer

---

## 👥 User Roles Testing

### Admin Role
- Access: `/admin-dashboard`
- Can: Manage users, approve dealers, view statistics
- Navbar shows: Admin Dashboard, Forum

### Dealer Role
- Access: `/dealer-dashboard`
- Can: Post buying rates, manage bookings, view stats
- Navbar shows: Dealer Dashboard, Forum

### Farmer Role
- Access: `/dashboard`
- Can: Browse prices, book slots, rate dealers, use all farmer features
- Navbar shows: Dashboard, Crop Advisor, Crop Prices, Storage Finder, Schemes, Forum

---

## 🐛 Known Issues & Fixes

### Issue 1: Language Not Changing
**Fix:** 
- Clear browser localStorage
- Refresh page
- Select language again

### Issue 2: Bookings Not Showing
**Fix:**
- Ensure you're logged in as farmer
- Run seed script: `node backend/seedCropPricesTest.js`
- Refresh dashboard

### Issue 3: Dealer Account Not Activated
**Fix:**
- Login as admin
- Go to Admin Dashboard → Dealer Approvals
- Approve the dealer
- Dealer can now login

### Issue 4: Translation Missing
**Fix:**
- Check if key exists in translation.json files
- Add missing translations to all 3 language files
- Restart frontend server

---

## ✅ Testing Checklist

### Pre-Launch Checks
- [ ] All 3 languages working (EN, TE, HI)
- [ ] Login/Register working for all roles
- [ ] Farmer can book slots
- [ ] Dealer can post rates and manage bookings
- [ ] Admin can approve dealers
- [ ] Email notifications sent
- [ ] Rating system working
- [ ] Search and filters working
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All links working
- [ ] Images loading
- [ ] Forms validating properly

### Performance Checks
- [ ] Page loads < 3 seconds
- [ ] No memory leaks
- [ ] API calls optimized
- [ ] Images optimized
- [ ] No unnecessary re-renders

---

## 🚀 How to Test Everything (Step-by-Step)

### Day 1: Setup & Basic Features
1. ✅ Run all seed scripts
2. ✅ Test login for all 3 roles
3. ✅ Test language switching on every page
4. ✅ Test navigation for each role

### Day 2: Core Features
1. ✅ Test complete booking flow (Farmer books → Dealer confirms → Marks complete → Farmer rates)
2. ✅ Test government schemes (search, filter, apply)
3. ✅ Test crop advisor (form, recommendations)

### Day 3: Advanced Features
1. ✅ Test cold storage finder
2. ✅ Test community forum
3. ✅ Test admin functions
4. ✅ Test dealer rate posting

### Day 4: Polish & Bug Fixes
1. ✅ Check all translations
2. ✅ Fix any UI issues
3. ✅ Test on mobile
4. ✅ Final checks

---

## 📞 Support

If you find any issues:
1. Check browser console for errors
2. Check network tab for failed API calls
3. Verify MongoDB is running
4. Verify backend server is running on port 5000
5. Verify frontend server is running on port 5173

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0
