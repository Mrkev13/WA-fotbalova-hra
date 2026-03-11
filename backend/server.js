const express = require('express');
const cors = require('cors'); 
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../')));

const apiRoutes = require('./src/api/routes');

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Pixel Football Tycoon Backend běží na portu ${PORT}`);
});
