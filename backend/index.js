const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const dbs = require('./dbs');
require('dotenv').config()
const recordingRouter = require('./Routers/Recording.router');
const port = 5000;




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', recordingRouter)


app.listen(port, () => {

    try {

        dbs()
        console.log(`Server running on port ${port}`);

    } catch (error) {

        console.log("error")
    }

});
