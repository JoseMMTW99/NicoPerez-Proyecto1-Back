const express = require('express')
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const cors = require('cors');
app.use(express.json());
app.use(cors());
require('./database/db');

const users = require('./routes/users');

app.use('/users', users);

app.listen(port, () =>  {
    console.log(`Estamos trabajando en el puerto ${port}`);
});