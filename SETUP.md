# Quick Setup Guide for RythuSetu

## Prerequisites Check
- [ ] Node.js installed (v16+)
- [ ] MongoDB installed or MongoDB Atlas account
- [ ] Firebase account
- [ ] Gmail account (for email notifications)

## Step 1: Install Dependencies

From the root directory:
```powershell
npm run install-all
```

Or install separately:
```powershell
cd backend
npm install
cd ../frontend
npm install
```

## Step 2: Configure Backend

1. Navigate to `backend` folder
2. Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

3. Edit `.env` file with your configurations:

### MongoDB Configuration
```
MONGODB_URI=mongodb://localhost:27017/rythusetu
```
Or for MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rythusetu
```

### JWT Secret
```
JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure
```

### Email Configuration (Gmail)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**To get Gmail App Password:**
1. Go to Google Account Settings
2. Security → 2-Step Verification (enable it)
3. App Passwords → Generate new app password
4. Select "Mail" and "Windows Computer"
5. Copy the generated password

### Firebase Admin SDK
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. Copy credentials to `.env`:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## Step 3: Configure Frontend

1. Navigate to `frontend` folder
2. Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

3. Edit `.env` file:

### Firebase Web App Configuration
Go to Firebase Console → Project Settings → General → Your Apps → Add Web App

```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

**To get VAPID Key:**
1. Firebase Console → Project Settings → Cloud Messaging
2. Web Push certificates → Generate key pair
3. Copy the key

## Step 4: Start MongoDB

### Local MongoDB:
```powershell
mongod
```

### MongoDB Atlas:
- Already running, just ensure connection string is correct in `.env`

## Step 5: Start the Application

### Option 1: Start Both Together (from root directory)
```powershell
npm run dev
```

### Option 2: Start Separately

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

## Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## Step 7: Create First User

1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form
4. Login and explore!

## Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access in MongoDB Atlas

### Firebase Errors
- Double-check all Firebase credentials
- Ensure Firebase services are enabled (FCM, Storage)
- Verify VAPID key is correct

### Email Not Sending
- Ensure Gmail 2FA is enabled
- Use App Password, not regular password
- Check EMAIL_HOST and EMAIL_PORT

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Change port in frontend/vite.config.js

### CORS Errors
- Ensure backend is running
- Check proxy configuration in frontend/vite.config.js

## Testing the Features

1. **Authentication:** Register and login
2. **Crop Advisor:** Go to Crop Advisor, select soil type and season
3. **Marketplace:** Add a product, browse products
4. **Weather:** Check weather and soil insights (dummy data)
5. **Schemes:** Browse government schemes
6. **Agent Hub:** View programs and jobs
7. **Forum:** Create a post, like and comment
8. **Profile:** Update your profile information

## Next Steps

- Replace dummy data with real APIs
- Configure Firebase Cloud Messaging for push notifications
- Add more government schemes
- Customize the platform for your needs

## Support

For issues, check:
1. Console errors in browser (F12)
2. Backend terminal logs
3. MongoDB connection
4. Environment variables

Happy Farming! 🌾
