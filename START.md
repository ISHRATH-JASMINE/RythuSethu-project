# 🚀 Quick Start Instructions

## Installation (One-time setup)

### 1. Install all dependencies
```powershell
# From root directory
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 2. Setup Environment Files

**Backend (.env):**
```powershell
cd backend
copy .env.example .env
# Edit .env file with your configurations
```

**Frontend (.env):**
```powershell
cd frontend
copy .env.example .env
# Edit .env file with your Firebase config
```

### 3. Seed Database (Optional - for sample data)
```powershell
cd backend
npm run seed
```

## Running the Application

### Method 1: Run both servers (Recommended)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Method 2: Individual servers

**Backend only:**
```powershell
cd backend
npm run dev
```

**Frontend only:**
```powershell
cd frontend
npm run dev
```

## Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

## Sample Login Credentials (after seeding)

1. **Farmer Account:**
   - Email: ravi@example.com
   - Password: password123

2. **Farmer Account 2:**
   - Email: lakshmi@example.com
   - Password: password123

3. **Buyer Account:**
   - Email: ramesh@example.com
   - Password: password123

## Troubleshooting

### MongoDB not connecting?
- Start MongoDB: `mongod`
- Or use MongoDB Atlas connection string

### Port already in use?
- Backend: Change PORT in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### Frontend can't reach backend?
- Ensure backend is running on port 5000
- Check VITE_API_URL in `frontend/.env`

## Next Steps

1. ✅ Register a new account or use sample credentials
2. ✅ Explore Dashboard
3. ✅ Try Crop Advisor
4. ✅ Browse Marketplace
5. ✅ Check Weather & Soil data
6. ✅ View Government Schemes
7. ✅ Explore Agent Hub
8. ✅ Join Community Forum

Enjoy using RythuSetu! 🌾
