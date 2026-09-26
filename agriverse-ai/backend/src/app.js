const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const expertRoutes = require('./routes/expertRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const locationRoutes = require('./routes/locationRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = new Set([
  env.corsOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AgriVerse AI API.',
  });
});

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farmers', farmerRoutes);
app.use('/api/v1/experts', expertRoutes);
app.use('/api/v1/buyers', buyerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
