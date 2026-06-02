const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root first (user standard), falling back to server subfolder
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spendwise';

// Connectivity flag for 503 database unavailable handling
let isDbConnected = false;

// Attempt database connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to local MongoDB.');
  isDbConnected = true;
})
.catch((err) => {
  console.error('Database connection failure on startup:', err.message);
  isDbConnected = false;
  // We keep the server alive so we can serve 503 to client instead of crashing!
});

// Setup mongoose event listeners to dynamically track connection health
mongoose.connection.on('connected', () => {
  console.log('Mongoose re-connected to MongoDB.');
  isDbConnected = true;
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from MongoDB.');
  isDbConnected = false;
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error occurred:', err.message);
  isDbConnected = false;
});

// Middleware Stack
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 503 Database Availability Guard Middleware
app.use((req, res, next) => {
  if (!isDbConnected && req.path.startsWith('/api')) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Cannot connect to database. Please ensure MongoDB is running locally.'
    });
  }
  next();
});

// API Routes
const expenseRoutes = require('./routes/expenses');
const assistantRoutes = require('./routes/assistant');
app.use('/api/expenses', expenseRoutes);
app.use('/api/assistant', assistantRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  // Format CastErrors (invalid ObjectIds) if they slipped past route validation
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`SpendWise backend listening on port ${PORT}`);
});
