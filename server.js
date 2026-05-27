// server.js — Main entry point: initializes Express app, connects DB, and starts the server

const express = require('express');
const { connectDB } = require('./config');
const { envConfig } = require('./config');
const employeeRoutes = require('./routes');
const { errorMiddleware, loggerMiddleware } = require('./middlewares');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// ─── Routes ──────────────────────────────────────────────────
app.use('/employees', employeeRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '✅ Employee Management API is running', status: 'OK' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────
const PORT = envConfig.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
