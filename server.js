const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path'); // <--- 1. Import 'path' at the top

// Route Files
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();
const app = express();

// --- MIDDLEWARE ---
// Enable CORS (Cross-Origin Resource Sharing) for Frontend
app.use(cors({
    origin: 'http://localhost:5173', // Adjust this to match your frontend port
    credentials: true
}));

// Body Parser (allow JSON data in request body)
app.use(express.json());

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// --- ROOT ROUTE (Health Check) ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- ERROR HANDLING MIDDLEWARE ---

// 1. Not Found Handler (404)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 2. Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));