const express = require('express');
const cors = require('cors'); 

const app = express();

app.use(express.json());
app.use(cors());

const apiRoutes = require('./src/api/routes');

app.use('/api', apiRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Pixel Football Tycoon Backend běží na portu ${PORT}`);
});
