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
app.use(compression({ threshold: 0 })); // GZIP komprese pro VŠECHNY odpovědi (i ty nejmenší)
app.use(express.json());

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*', // Allow all for now or specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ═══════════════════════════════════════════════════
// STATIC FILES + API
// ═══════════════════════════════════════════════════

// Pokud existuje .min verze JS/CSS souboru, servuj ji místo originálu
app.use((req, res, next) => {
  const isJS  = req.path.endsWith('.js')  && !req.path.endsWith('.min.js');
  const isCSS = req.path.endsWith('.css') && !req.path.endsWith('.min.css');
  if (!isJS && !isCSS) return next();

  const minPath = req.path.replace(/\.(js|css)$/, '.min.$1');
  const minFull = path.join(__dirname, '../frontend', minPath);

  if (require('fs').existsSync(minFull)) {
    req.url = minPath;
  }
  next();
});

// Nastavení statických souborů s hlavičkami Cache-Control a Etag (invalidace)
app.use(express.static(path.join(__dirname, '../frontend'), {
  maxAge: 86400000, // Cache pro obrázky, CSS a JS na 1 den v ms (1 den = 86400 sekund = 86400000 ms)
  etag: true        // Generuje Etag pro invalidaci cache při změně souboru
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
