// server.js
// Entry point backend portfolio Khairunnisa

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const contactRoute = require('./routes/contact');
const {
  projectsRouter,
  skillsRouter,
  authRouter,
  statsRouter,
} = require('./routes/index');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ─────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:5500',     // VS Code Live Server default
    'http://localhost:5500',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiter — global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 menit
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
});
app.use(limiter);

// Rate limiter khusus form kontak (lebih ketat)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 jam
  max: 5,
  message: { success: false, message: 'Terlalu banyak pesan. Coba lagi dalam 1 jam.' },
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/contact',  contactLimiter, contactRoute);
app.use('/api/projects', projectsRouter);
app.use('/api/skills',   skillsRouter);
app.use('/api/stats',    statsRouter);

// Serve frontend static files (production)
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Portfolio Khairunnisa berjalan!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Catch-all: serve index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Error Handler ────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('🔴 Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan server.'
      : err.message,
  });
});

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Portfolio API Server berjalan!');
  console.log(`   ● Local:   http://localhost:${PORT}`);
  console.log(`   ● Health:  http://localhost:${PORT}/api/health`);
  console.log(`   ● Env:     ${process.env.NODE_ENV}`);
  console.log('');
});

module.exports = app;
