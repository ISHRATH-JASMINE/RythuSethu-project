# RythuSetu – AI-Powered Farmer Empowerment Platform

RythuSetu is a full-stack agriculture platform for farmers, dealers, and administrators. It combines crop advice, crop prices, weather, marketplace, forum, schemes, and dealer workflows in one app.

## What Works Today

- Multilingual UI with English, Telugu, and Hindi
- Crop advisor with weather-aware recommendations
- Crop prices dashboard with booking flow
- Weather and soil page backed by the backend weather API
- Marketplace and product details
- Community forum
- Admin, farmer, and dealer dashboards
- Seed scripts for repeatable local demo data

## Tech Stack

### Frontend
- Vite + React
- React Router DOM
- Tailwind CSS
- Axios
- Framer Motion
- React Toastify
- React Icons and Lucide React

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- bcryptjs password hashing
- Nodemailer
- Firebase Admin SDK

## Project Structure

```
RythuSethu-project/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── seed.js
│   ├── createAdmin.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── locales/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

## Route Map

### Frontend Routes

- `/` home
- `/login`
- `/register`
- `/dashboard`
- `/crop-advisor`
- `/weather`
- `/storage-finder`
- `/marketplace`
- `/marketplace/:id`
- `/marketplace/add`
- `/schemes`
- `/agent-hub`
- `/forum`
- `/forum/:id`
- `/profile`
- `/crop-prices`
- `/dealer-dashboard`
- `/admin-dashboard`

### Backend Routes

- `/api/auth`
- `/api/crop`
- `/api/weather`
- `/api/marketplace`
- `/api/schemes`
- `/api/agent`
- `/api/forum`
- `/api/notifications`
- `/api/price-analytics`
- `/api/storage`
- `/api/dealer`
- `/api/admin`
- `/api/farmer`
- `/api/public`
- `/api/crop-prices`
- `/api/bookings`
- `/api/ratings`
- `/api/buying-rates`

## Default Demo Accounts

These are the accounts currently seeded in the database.
- Farmer: `farmer.demo@rythusethu.demo` / `Demo@123`
- Dealer: `dealer.demo@rythusethu.demo` / `Demo@123`

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite’s default dev port, usually `http://localhost:5173`.

## Environment Variables

### Backend

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `WEATHER_API_KEY` or `OPENWEATHER_API_KEY`

### Frontend

- `VITE_API_URL`
- Firebase web config values

## Seed Notes

- `backend/seed.js` resets the demo database and creates only the admin, demo farmer, and demo dealer.
- The demo dealer is linked to crop-price listings so the crop-prices page has bookable data.
- Use the seed only for local/demo environments because it clears existing data.

## Validation Notes

- Frontend production build passes.
- Backend weather endpoint returns data for authenticated users.
- Crop-prices endpoint returns dealer listings for the seeded location filters.

## Deployment Notes

1. Set production environment variables for backend and frontend.
2. Run the frontend build with `npm run build` in `frontend`.
3. Start the backend with `npm run start` in `backend`.
4. Ensure MongoDB is reachable from the deployed backend.
5. Verify the auth, crop-prices, weather, and marketplace flows after deployment.

## Known Caveats

- The weather page depends on the logged-in user’s location if available.
- Demo data is intentionally minimal right now.
