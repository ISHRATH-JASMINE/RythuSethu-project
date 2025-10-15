import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import cropRoutes from './routes/crop.js';
import marketplaceRoutes from './routes/marketplace.js';
import weatherRoutes from './routes/weather.js';
import schemeRoutes from './routes/schemes.js';
import agentRoutes from './routes/agent.js';
import forumRoutes from './routes/forum.js';
import notificationRoutes from './routes/notifications.js';
import priceAnalyticsRoutes from './routes/priceAnalytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/price-analytics', priceAnalyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RythuSetu Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
