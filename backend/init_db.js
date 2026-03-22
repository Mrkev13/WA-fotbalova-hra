require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/models/db');

async function initDB() {
  try {
    console.log('Načítám schema.sql...');
    // Cesta k vašemu SQL souboru s tabulkami
    const schema = fs.readFileSync(path.join(__dirname, 'src/models/schema.sql'), 'utf8');
    
    console.log('Odesílám tabulky do Render databáze. Prosím čekej...');
    await pool.query(schema);
    
    console.log('✅ Databáze byla úspěšně vytvořena a naplněna tabulkami!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Chyba při vytváření databáze:', err);
    process.exit(1);
  }
}

initDB();