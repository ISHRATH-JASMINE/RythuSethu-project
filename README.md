# RythuSetu – AI-Powered Farmer Empowerment Platform

A comprehensive platform that bridges the gap between farmers, buyers, and agri-experts through technology, insights, and real-time updates.

## Features

- **Multilingual Interface**: Support for English, Telugu, and Hindi
- **AI Crop Advisor**: Crop recommendations based on soil, weather, and season (dummy data)
- **Marketplace**: Direct buying/selling platform for agricultural products
- **Weather & Soil Insights**: Real-time forecasts and soil condition updates
- **Government Schemes**: Browse and apply for agricultural schemes and subsidies
- **Agent Integration**: Job suggestions, program tracking, and weekly updates
- **Notification System**: Email alerts (Nodemailer) and push notifications (Firebase)
- **Community Forum**: Discussion space for farmers, buyers, and experts

## Tech Stack

### Frontend
- Vite + React.js (.jsx)
- Tailwind CSS
- React Router DOM
- Axios
- React Toastify
- React Icons
- Firebase (for FCM and storage)

### Backend
- Node.js + Express
- MongoDB (user data, products, forum posts)
- Firebase Admin SDK (push notifications, storage)
- Nodemailer (email notifications)
- JWT Authentication
- Bcrypt (password hashing)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- Firebase project (for notifications and storage)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
- MongoDB connection string
- JWT secret
- Email credentials (Gmail SMTP recommended)
- Firebase Admin SDK credentials
- Weather API key (optional)

5. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure Firebase credentials in `.env`:
- Firebase API key
- Firebase project details
- VAPID key for push notifications

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firebase Cloud Messaging
3. Enable Firebase Storage
4. Download service account key for backend
5. Get web app config for frontend
6. Generate VAPID key for web push

## MongoDB Setup

### Local MongoDB
```bash
mongod --dbpath /path/to/data/directory
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to `.env` file

## Email Configuration

For Nodemailer with Gmail:
1. Enable 2-factor authentication on Google account
2. Generate App Password
3. Use App Password in `.env` EMAIL_PASS field

## Project Structure

```
Rythusethu_Project/
├── backend/
│   ├── config/         # Database, Firebase, Nodemailer config
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   ├── server.js       # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable components
    │   ├── pages/      # Page components
    │   ├── context/    # Auth & Language context
    │   ├── utils/      # API client, translations
    │   ├── App.jsx     # Main app component
    │   └── main.jsx    # Entry point
    ├── index.html
    └── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile

### Crop Advisor
- POST `/api/crop/recommend` - Get crop recommendations
- GET `/api/crop/fertilizer/:cropName` - Get fertilizer advice
- GET `/api/crop/all` - Get all crops

### Marketplace
- GET `/api/marketplace` - Get all products
- GET `/api/marketplace/:id` - Get single product
- POST `/api/marketplace` - Create product
- PUT `/api/marketplace/:id` - Update product
- DELETE `/api/marketplace/:id` - Delete product

### Weather & Soil
- GET `/api/weather/forecast` - Get weather forecast
- GET `/api/weather/soil` - Get soil insights
- GET `/api/weather/combined` - Get both weather and soil data

### Government Schemes
- GET `/api/schemes` - Get all schemes
- GET `/api/schemes/:id` - Get single scheme

### Agent Hub
- GET `/api/agent/programs` - Get all programs
- GET `/api/agent/jobs` - Get all jobs
- POST `/api/agent/programs/:id/apply` - Apply to program
- POST `/api/agent/jobs/:id/apply` - Apply to job
- GET `/api/agent/updates/weekly` - Get weekly updates

### Community Forum
- GET `/api/forum` - Get all posts
- GET `/api/forum/:id` - Get single post
- POST `/api/forum` - Create post
- POST `/api/forum/:id/like` - Like post
- POST `/api/forum/:id/comment` - Add comment

### Notifications
- GET `/api/notifications` - Get user notifications
- POST `/api/notifications/send-push` - Send push notification
- POST `/api/notifications/send-email` - Send email notification

## Default User Roles

- **farmer**: Can sell products, get crop advice, join forum
- **buyer**: Can buy products, join forum
- **expert**: Can provide advice, join forum
- **admin**: Full access

## Future Enhancements

- Replace dummy AI crop advisor with real ML model/API
- Integrate real weather API (OpenWeatherMap, etc.)
- Add payment gateway for marketplace
- Implement auto-apply for government schemes
- Add video consultation with experts
- Mobile app (React Native)
- Advanced analytics dashboard

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
