require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const bookmarksRouter = require('./bookmarks-router');

const app = express();
const morganOptions = (NODE_ENV === "production") 
    ? 'tiny'
    : 'common';

app.use(morgan(morganOptions));
app.use(cors());
app.use(helmet());
app.use(express.json());
/////////////////////// AUTH FUNCTION ////////////////////////////////////
app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');
    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        //if auth fails, create an error log with information helpful to the client
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json( { error: 'Unauthorized request' } );
    }
    next();
})
//connect the express router file with app.use (put after validation handler)
app.use(bookmarksRouter);

app.use(function errorHandler(error, req, res, next) {
    let response;
    if(NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
        } else {
            console.log(error);
            response = { message: error.message, error }
        }
        res.status(500).json(response);
    });

module.exports = app;
