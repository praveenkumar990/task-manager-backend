import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Load env variables
config();

// Connect to Database
connectDB();

const app = express();

// Body Parser Middleware
app.use(json());

// Helmet Middleware to secure headers
app.use(helmet());

// Enable CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'edu-task147.netlify.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy does not allow access from ${origin}`));
  },
  credentials: true
}));

// Prevent NoSQL Injection Attacks
app.use(mongoSanitize());

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/', limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Task Management Portal API is running...');
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
