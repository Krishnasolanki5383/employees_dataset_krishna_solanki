// server.js
// Purpose: Main entry point. Initializes Express, connects MongoDB,
//          registers middleware and routes, and starts the HTTP server.
//          Covers Checklist #1, #9, #10, #11.

const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const { envConfig } = require('./config/env');
const employeeRoutes   = require('./routes/employeeRoutes');
const searchRoutes     = require('./routes/searchRoutes');     // Search System
const analyticsRoutes  = require('./routes/analyticsRoutes'); // Analytics System
const statsRoutes      = require('./routes/statsRoutes');      // Statistics System
const adminRoutes      = require('./routes/adminRoutes');      // Admin (auth + role)
const protectedRoutes  = require('./routes/protectedRoutes'); // Auth-protected CRUD
const middlewareRoutes = require('./routes/middlewareRoutes'); // Middleware demos
const authRoutes       = require('./routes/authRoutes');       // Authentication
const jwtRoutes        = require('./routes/jwtRoutes');        // JWT operations
const { errorMiddleware }       = require('./middlewares/errorMiddleware');
const { loggerMiddleware }      = require('./middlewares/loggerMiddleware');
const { requestTimeMiddleware } = require('./middlewares/requestTimeMiddleware');
const { rateLimitMiddleware }   = require('./middlewares/rateLimitMiddleware');
const { auditLogMiddleware }    = require('./middlewares/auditLogMiddleware');

const app = express();

// ─── Core Middleware ──────────────────────────────────────────
app.use(express.json());                         // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ─── CORS (Checklist #11) ─────────────────────────────────────
app.use(cors({
  origin: '*',                             // Allow all origins (update for production)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Global Rate Limiter ──────────────────────────────────────
app.use(rateLimitMiddleware);               // Max 100 req/15min per IP

// ─── Request Timer ────────────────────────────────────────────
app.use(requestTimeMiddleware);             // Sets X-Response-Time header

// ─── Request Logger (Checklist #10) ──────────────────────────
app.use(loggerMiddleware);

// ─── Audit Logger ─────────────────────────────────────────────
app.use(auditLogMiddleware);               // Logs method, URL, user, timestamp

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
app.use('/employees',  employeeRoutes);                 // GET  /employees
app.use('/search',     searchRoutes);                   // GET  /search/employees?q=keyword
app.use('/analytics',  analyticsRoutes);                // GET  /analytics/employees/*
app.use('/stats',      statsRoutes);                    // GET  /stats/employees/*
app.use('/admin',      adminRoutes);                    // GET  /admin/* (auth + role)
app.use('/protected',  protectedRoutes);                // POST /protected/* (auth)
app.use('/middleware', middlewareRoutes);               // GET  /middleware/* (demos)
app.use('/auth',       authRoutes);                     // POST /auth/register, /auth/login …
app.use('/jwt',        jwtRoutes);                      // GET  /jwt/profile, /jwt/dashboard …

// ─── 404 Handler (Unknown Routes) ────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors:  [],
  });
});

// ─── Global Error Handler (MUST be last) ─────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────
const PORT = envConfig.PORT || 5000;

const startServer = async () => {
  await connect();
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log(`🚀  Server       : http://localhost:${PORT}`);
    console.log(`📦  Environment  : ${envConfig.NODE_ENV}`);
    console.log(`🗄️   Database     : MongoDB (Mongoose)`);
    console.log(`🔐  Auth         : JWT (access + refresh tokens)`);
    console.log(`🛡️   Rate Limit   : 100 req / 15min per IP`);
    console.log('═══════════════════════════════════════════════════');
  });
};

startServer();
