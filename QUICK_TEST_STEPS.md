# 🚀 Quick Test Steps - RythuSetu

## ⚡ 5-Minute Quick Test

### 1. Test Language Switching (2 mins)
```
✅ Open http://localhost:5173
✅ Click globe icon (🌐) in navbar
✅ Select "తెలుగు" (Telugu)
   → All text should change to Telugu
✅ Select "हिन्दी" (Hindi)
   → All text should change to Hindi
✅ Select "English"
   → All text should change to English
✅ Refresh page
   → Language should persist
```

### 2. Test Farmer Journey (3 mins)
```
✅ Login as Farmer:
   Email: farmer.test@example.com
   Password: password123

✅ Dashboard should show:
   → Welcome message
   → 5 quick access cards
   → My Bookings section (8 bookings)
   
✅ Click "Crop Prices" card

✅ Browse dealers:
   → Should see multiple dealers
   → Filter by crop
   → Filter by location
   
✅ Click "Book Slot" on any dealer
   → Fill form (future date + time)
   → Submit
   
✅ Go back to Dashboard
   → New booking should appear
   
✅ Filter bookings by "Pending"
   → Should show only pending bookings
   
✅ Search for dealer name
   → Should filter results
```

### 3. Test Government Schemes (1 min)
```
✅ Click "Govt. Schemes" from dashboard

✅ Should see:
   → 12 total schemes
   → Statistics cards
   → Search bar
   → Category filter
   
✅ Search "PM-KISAN"
   → Should show PM-KISAN scheme
   
✅ Filter by "Financial"
   → Should show only financial schemes
   
✅ Click "Apply Now" on any scheme
   → Should open government website
```

### 4. Test Language on All Features
```
✅ Change to Telugu
✅ Go to Dashboard → Check translations
✅ Go to Crop Prices → Check translations
✅ Go to Schemes → Check translations
✅ Go to Profile → Check translations
✅ Check Navbar → Check translations
✅ Check Footer → Check translations
```

---

## 🔧 If Something Doesn't Work

### Language Not Changing?
```bash
# Clear browser storage
1. Press F12 (Developer Tools)
2. Go to Application tab
3. Click "Clear storage"
4. Refresh page
```

### No Bookings Showing?
```bash
cd backend
node seedCropPricesTest.js
# Refresh dashboard
```

### No Dealers?
```bash
cd backend
node seedDealers.js
node seedCropPrices.js
# Refresh crop prices page
```

### Backend Not Running?
```bash
cd backend
npm run dev
# Should show: Server running on port 5000
```

### Frontend Not Running?
```bash
cd frontend
npm run dev
# Should show: Local: http://localhost:5173
```

---

## ✅ Everything Working Checklist

### Language System
- [ ] English works
- [ ] Telugu works
- [ ] Hindi works
- [ ] Language persists after refresh
- [ ] All pages translate

### Farmer Features
- [ ] Can login
- [ ] Dashboard loads
- [ ] Can view bookings
- [ ] Can filter bookings
- [ ] Can search bookings
- [ ] Can browse crop prices
- [ ] Can book slots
- [ ] Can view schemes

### Dealer Features
- [ ] Can login (if approved)
- [ ] Can post buying rates
- [ ] Can view bookings
- [ ] Can confirm bookings
- [ ] Can mark complete

### Admin Features
- [ ] Can login
- [ ] Can view all users
- [ ] Can approve dealers
- [ ] Can activate/deactivate users

---

## 📊 Test Accounts

```
Admin:
Email: admin@rythusetu.com
Password: admin123

Farmer:
Email: farmer.test@example.com
Password: password123

Dealer:
Email: dealer1@example.com
Password: password123
```

---

## 🎯 Final Check

1. **Open 3 browser tabs:**
   - Tab 1: English
   - Tab 2: Telugu
   - Tab 3: Hindi

2. **Navigate to same page in all 3:**
   - Dashboard
   - Crop Prices
   - Schemes

3. **Verify all text changes correctly**

4. **Test booking flow:**
   - Farmer books → Dealer confirms → Marks complete → Farmer rates

5. **Test on mobile:**
   - Responsive design
   - Language switcher works
   - All features accessible

---

**Status:** ✅ Ready for Testing
**Date:** October 26, 2025
