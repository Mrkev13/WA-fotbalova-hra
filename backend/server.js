const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();

// ═══════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════
app.use(helmet());

// Custom CSP overrides if needed (Helmet default is usually strict)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some frontend scripts if they are inline
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https://*"], // allow images from anywhere or specific domains
    connectSrc: ["'self'", "http://localhost:3000", "https://wa-fotbalova-hra.onrender.com"],
  },
}));

// ═══════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════
app.use(compression()); // GZIP komprese pro velké odpovědi
app.use(express.json());

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*', // Allow all for now or specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ═══════════════════════════════════════════════════
// STATIC FILES + API
// ═══════════════════════════════════════════════════
// Nastavení statických souborů s hlavičkami Cache-Control a Etag (invalidace)
app.use(express.static(path.join(__dirname, '../frontend'), {
  maxAge: '1d', // Cache pro obrázky, CSS a JS na 1 den
  etag: true    // Generuje Etag pro invalidaci cache při změně souboru
}));

const apiRoutes = require('./src/api/routes');
app.use('/api', apiRoutes);

// ═══════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pixel Football Tycoon Backend běží na portu ${PORT}`);
});
