const express = require('express')
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const cors = require('cors');
app.use(express.json());
app.use(cors());
require('./database/db');

const users = require('./routes/users');
const uploads = require('./routes/uploads');

app.use('/users', users);
app.use('/uploads', uploads);

app.listen(port, () =>  {
    console.log(`Estamos trabajando en el puerto ${port}`);
});