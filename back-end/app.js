const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const path = require('path');

require('dotenv').config();
const app = express();

const userRoute = require('./routes/user');
const expenseRoute = require('./routes/expense');
const premiumRoute = require('./routes/premium');
const passwordRoute = require('./routes/password');

app.use(express.json());
app.use(cookieParser());

app.use('/user', userRoute);
app.use('/expense', expenseRoute);
app.use('/premium', premiumRoute);
app.use('/password', passwordRoute);

app.use((req, res, next) => {
    let filePath = req.url === '/' ? 'login.html' : req.url;
    res.sendFile(path.join(__dirname, 'public', 'views', filePath));
})
app.use((req, res, next) => {
    res.send('<h2>Sorry, Page not found!</h2>')
})

mongoose
    .connect(process.env.DB_CONNECTION_STRING)
    .then(() => app.listen(process.env.PORT, () => {
        console.log('Server is up and listening!!');
    }))
    .catch(err => console.log(err));