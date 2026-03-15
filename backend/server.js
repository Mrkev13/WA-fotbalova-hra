const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ═══════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════
app.use((req, res, next) => {
  // Zabrání clickjacking útokům
  res.setHeader('X-Frame-Options', 'DENY');

  // Zabrání MIME sniffingu
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // HSTS — vynutí HTTPS (platí jen na produkci s HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Origin Resource Policy
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Cross-Origin Opener Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    // Skripty jen ze stejné origin
    "script-src 'self'",
    // Styly — same origin + Google Fonts
    "style-src 'self' https://fonts.googleapis.com",
    // Fonty — same origin + Google Fonts CDN
    "font-src 'self' https://fonts.gstatic.com",
    // Obrázky — same origin + data URI
    "img-src 'self' data:",
    // API fetch jen na same origin
    "connect-src 'self'",
    // Žádné iframes
    "frame-ancestors 'none'",
    // Žádné embedy
    "object-src 'none'",
    // Base tag jen same origin
    "base-uri 'self'",
    // Formuláře jen same origin
    "form-action 'self'",
  ].join('; '));

  next();
});

// ═══════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════
app.use(express.json());

// CORS — jen pro API (pokud voláš z jiné domény/portu)
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ═══════════════════════════════════════════════════
// STATIC FILES + API
// ═══════════════════════════════════════════════════
app.use(express.static(path.join(__dirname, '../frontend')));

const apiRoutes = require('./src/api/routes');
app.use('/api', apiRoutes);

// ═══════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pixel Football Tycoon Backend běží na portu ${PORT}`);
});
