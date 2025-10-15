# API Testing Guide for Price Analytics

## Test if Backend is Running

Open browser and visit: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "OK",
  "message": "RythuSetu Backend is running"
}
```

## Test Price Analytics Endpoints

### 1. Test Get Crops (requires authentication)

**URL**: http://localhost:5000/api/price-analytics/crops

**Method**: GET

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response**:
```json
{
  "crops": [
    "Rice",
    "Wheat",
    "Cotton",
    "Sugarcane",
    "Maize",
    "Tomato",
    "Onion",
    "Potato"
  ]
}
```

### How to Get JWT Token

1. Login first:
   - URL: http://localhost:5000/api/auth/login
   - Method: POST
   - Body:
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```

2. Copy the `token` from the response
3. Use it in Authorization header: `Bearer <token>`

### Using Browser Console to Test

Open browser console (F12) on http://localhost:5173/price-analytics and run:

```javascript
// Check if crops are loaded
console.log('Crops state:', crops);

// Check localStorage for user token
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Manual API call test
fetch('http://localhost:5000/api/price-analytics/crops', {
  headers: {
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Crops API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'map')"

**Causes**:
1. Backend not running on port 5000
2. User not logged in (no JWT token)
3. API call failing due to CORS or authentication

**Solutions**:
1. ✅ Check backend is running: Visit http://localhost:5000/api/health
2. ✅ Ensure you're logged in to the frontend
3. ✅ Check browser console for network errors
4. ✅ Verify JWT token exists in localStorage

### Issue: "401 Unauthorized"

**Solution**: Login again to refresh JWT token

### Issue: CORS Error

**Solution**: Backend already has CORS enabled. Make sure backend is running.

## Current Status

- ✅ Backend route: `/api/price-analytics/crops` returns `{ crops: [...] }`
- ✅ Frontend: Has fallback crops array if API fails
- ✅ Frontend: Safety check before mapping crops
- ✅ Translation function fixed (t function with language parameter)

## Expected Behavior Now

1. Page loads without error (blank or with form)
2. If API call succeeds: Dropdown populated with 8 crops
3. If API call fails: Dropdown populated with fallback 8 crops
4. No "undefined.map" error should occur

## Quick Fix Verification

Refresh the page at: http://localhost:5173/price-analytics

The page should now load without errors!
