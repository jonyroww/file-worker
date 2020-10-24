require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require("./DB/models");
db.sequelize.sync();

/*
db.connect(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    process.env.DB_HOST,
    process.env.DB_PORT,
    process.env.SEQUELIZE_DIALECT
    );
    */

app.use(express.json());
app.use(cors());

const authRouter = require('./app/routes/auth');
app.use('/auth', authRouter);


app.listen(process.env.API_PORT, () => {
    console.log('Server has started')
});