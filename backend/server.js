// server.js
// Purpose: Main entry point. Initializes Express, connects MongoDB,
//          registers middleware and routes, and starts the HTTP server.
//          Covers Checklist #1, #9, #10, #11.

const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const { envConfig } = require('./config/env');
const employeeRoutes  = require('./routes/employeeRoutes');
const searchRoutes    = require('./routes/searchRoutes');    // Search System
const analyticsRoutes = require('./routes/analyticsRoutes'); // Analytics System
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { loggerMiddleware } = require('./middlewares/loggerMiddleware');

const app = express();

// ─── Core Middleware ──────────────────────────────────────────
app.use(express.json());                    // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ─── CORS (Checklist #11) ─────────────────────────────────────
app.use(cors({
  origin: '*',                             // Allow all origins (update for production)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Request Logger (Checklist #10) ──────────────────────────
app.use(loggerMiddleware);

// ─── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Employee Management System API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/employees', employeeRoutes);
app.use('/search',    searchRoutes);     // GET /search/employees?q=keyword
app.use('/analytics', analyticsRoutes);  // GET /analytics/employees/*

// ─── 404 Handler (Unknown Routes) ────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler (MUST be last) ─────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────
const PORT = envConfig.PORT || 5000;

const startServer = async () => {
  await connect();
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log(`🚀  Server       : http://localhost:${PORT}`);
    console.log(`📦  Environment  : ${envConfig.NODE_ENV}`);
    console.log(`🗄️   Database     : MongoDB (Mongoose)`);
    console.log('═══════════════════════════════════════');
  });
};

startServer();
