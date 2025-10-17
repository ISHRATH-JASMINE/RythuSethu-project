# Testing Cold Storage Finder Feature

## 🎯 Quick Test Guide

### Prerequisites
✅ Backend running on port 5000
✅ Frontend running on port 5174
✅ Database seeded with 21 cold storages
✅ User account created and logged in

---

## Test Scenarios

### Test 1: Pincode Search (Hyderabad)
**Steps:**
1. Navigate to http://localhost:5174/storage-finder
2. Enter pincode: `500001`
3. Click "Search by Pincode"

**Expected Results:**
- ✅ Map centers on Hyderabad area
- ✅ Shows 5 nearby storages:
  - Sri Krishna Cold Storage (500001)
  - Telangana Food Storage Corp (500016)
  - AP State Cold Storage (520001) - Vijayawada
  - Varalakshmi Cold Storage (506002) - Warangal
  - Kaveri Cold Storage (505001) - Karimnagar
- ✅ Distance displayed for each (sorted nearest first)
- ✅ Map markers appear at correct locations
- ✅ Storage cards show all details

---

### Test 2: GPS Location Search
**Steps:**
1. Click "Use Current Location" button
2. Allow browser location permission when prompted

**Expected Results:**
- ✅ Browser requests geolocation permission
- ✅ After allowing, automatically searches nearby storages
- ✅ Shows storages within 50km radius
- ✅ Distance calculated from your actual GPS location
- ✅ Map centers on your location

**Note:** If you're not in India, this may show "No storages found" since our database only has Indian locations.

---

### Test 3: Filter by Type
**Steps:**
1. Search using pincode `500001`
2. Click "Type Filter" dropdown
3. Select "Cold Storage"

**Expected Results:**
- ✅ Shows only Cold Storage facilities (not Mandis or Warehouses)
- ✅ Map updates to show only filtered markers
- ✅ Storage cards update accordingly

**Repeat with:**
- "Mandi" filter
- "Warehouse" filter
- "All Types" (shows all)

---

### Test 4: Map Interaction
**Steps:**
1. Search using any pincode
2. Click on a red marker on the map

**Expected Results:**
- ✅ Popup opens showing:
  - Storage name
  - Type
  - Address
  - Distance from search location
  - Capacity in MT
  - Contact phone

---

### Test 5: Get Directions
**Steps:**
1. Search using pincode `500001`
2. Scroll to first storage card
3. Click "Get Directions" button

**Expected Results:**
- ✅ Opens new tab/window
- ✅ Google Maps loads with destination set to storage address
- ✅ Shows route from current location to storage

---

### Test 6: Language Switching
**Steps:**
1. Navigate to Storage Finder page
2. Click language dropdown in navbar
3. Switch to Telugu

**Expected Results:**
- ✅ Page title changes to "కోల్డ్ స్టోరేజ్ ఫైండర్"
- ✅ All buttons translate to Telugu
- ✅ Storage details remain in English (addresses, names)
- ✅ UI labels translate correctly

**Repeat with:**
- Hindi (कोल्ड स्टोरेज खोजक)
- Switch back to English

---

### Test 7: Error Handling - Invalid Pincode
**Steps:**
1. Enter invalid pincode: `999999`
2. Click "Search by Pincode"

**Expected Results:**
- ✅ Shows "No cold storages found nearby" message
- ✅ Displays suggestion: "Try searching with a different location"
- ✅ Map shows default center (Hyderabad)
- ✅ No error crashes

---

### Test 8: Error Handling - GPS Denied
**Steps:**
1. Click "Use Current Location"
2. Deny browser location permission

**Expected Results:**
- ✅ Shows error message
- ✅ Suggests using pincode search instead
- ✅ Page doesn't crash
- ✅ Can still use pincode search normally

---

## State-wise Test Pincodes

### Telangana
- **500001** - Hyderabad (Multiple storages)
- **506002** - Warangal
- **505001** - Karimnagar
- **503001** - Nizamabad
- **507001** - Khammam
- **504001** - Adilabad

### Andhra Pradesh
- **520001** - Vijayawada
- **530001** - Visakhapatnam
- **522001** - Guntur
- **517501** - Tirupati
- **533001** - Kakinada
- **518001** - Kurnool
- **524001** - Nellore
- **515001** - Anantapur
- **533101** - Rajahmundry

### Karnataka
- **560001** - Bangalore

### Maharashtra
- **431601** - Nanded

---

## API Testing (Using Browser or Postman)

### Test Backend Endpoints Directly

**1. Search by Pincode:**
```
GET http://localhost:5000/api/storage/nearby?pincode=500001&radius=50
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Sri Krishna Cold Storage",
      "address": "Survey No. 123, Bollaram Village, Hyderabad",
      "pincode": "500001",
      "location": {
        "type": "Point",
        "coordinates": [78.4867, 17.385]
      },
      "state": "Telangana",
      "district": "Hyderabad",
      "capacity": 5000,
      "type": "Cold Storage",
      "contact": {
        "phone": "+91-40-12345678",
        "email": "info@skcold.in",
        "manager": "Mr. K. Ramesh"
      },
      "facilities": ["Refrigeration", "Packaging", "Transportation"],
      "isActive": true,
      "distance": 0.5 // km from search location
    },
    // ... 4 more storages
  ]
}
```

**2. Search by GPS:**
```
GET http://localhost:5000/api/storage/nearby?lat=17.385&lng=78.4867&radius=50
```

**3. Get by Pincode:**
```
GET http://localhost:5000/api/storage/pincode/500001
```

**4. Get by State:**
```
GET http://localhost:5000/api/storage/state/Telangana
```

---

## Mobile Testing

### Responsive Design Check
**Test on:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667 - iPhone SE)
- Mobile (414x896 - iPhone 11)

**Expected:**
- ✅ Map resizes appropriately
- ✅ Storage cards stack vertically on mobile
- ✅ Buttons remain clickable
- ✅ Text remains readable
- ✅ No horizontal scrolling

### Mobile GPS Test
1. Open on actual mobile device
2. Click "Use Current Location"
3. Should use device GPS
4. More accurate than desktop

---

## Performance Testing

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] Map tiles load smoothly
- [ ] API response in < 500ms

### Map Performance
- [ ] Smooth zoom in/out
- [ ] Markers render without lag
- [ ] Popups open instantly
- [ ] No memory leaks after multiple searches

---

## Browser Compatibility

Test on:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari (macOS/iOS)
- ⚠️ Internet Explorer (not supported - Leaflet requires modern browsers)

---

## Known Limitations

1. **Database Coverage**: Currently only 21 storages in 4 states
2. **GPS Accuracy**: Depends on device/browser capabilities
3. **Offline**: Requires internet for map tiles
4. **Real-time Data**: Storage capacities are static (not real-time)

---

## Bug Report Template

If you find issues, report using:

```
**Issue Title**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Screenshots**:


**Environment**:
- Browser: 
- OS: 
- Screen Size: 
- Pincode Tested: 

**Console Errors** (if any):

```

---

## Success Criteria

✅ All 8 test scenarios pass
✅ All state pincodes return results
✅ Map displays correctly on all screen sizes
✅ All 3 languages work properly
✅ No console errors
✅ Directions link works
✅ GPS permission handling works
✅ Fast response times (< 2 seconds)

---

**Ready to Test?** 

1. Make sure both servers are running
2. Login to RythuSetu
3. Navigate to "Cold Storage Finder" in menu
4. Start with Test 1 (Pincode Search)
5. Work through all scenarios
6. Report any issues found

**Happy Testing! 🚀**
