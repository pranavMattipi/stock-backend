const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const calculatorRoutes = require('./routes/calculator');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// MongoDB Connection helper (cached for serverless execution)
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGO_URI;
  if (!uri || (process.env.VERCEL && uri.includes('localhost'))) {
    // Skip connecting to local mongo in Vercel serverless environment if no cloud Atlas URI is provided
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000, // 2s timeout instead of hanging 10s
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

// Middleware to ensure DB connection attempt before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api', calculatorRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Stock Quantity Calculator API is running 🚀', status: 'OK' });
});

// Start local listener only if run directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
