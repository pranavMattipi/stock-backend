const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const calculatorRoutes = require('./routes/calculator');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Routes
app.use('/api', calculatorRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Stock Quantity Calculator API is running on port 8000 🚀' });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Starting server without MongoDB (history will not be saved)...');
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running at http://localhost:${PORT} (no DB)`);
    });
  });
