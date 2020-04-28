require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
/////////////////////// WINSTON ////////////////////////////////////
const winston = require('winston'); 
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File( { filename: 'info.log'} )
    ]
}); 
if(NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console( {
        format: winston.format.simple()
    }));
}
/////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////

let bookmarks = require('./bookmarks-data');
app.get('/', (req, res) => {
    res.send(bookmarks);
})

//////////////////////////////////GET, POST, DELETE route handlers/////////////////////////////////////////
//write a ROUTE handler for the GET /bookmarks endpoint that returns a list of bookmark titles
app.get('/bookmarks', (req, res) => {
    const response = bookmarks;
    const { search = " " } = req.query;
    res.json(response);
});
//write a ROUTE handler for the GET /bookmarks/:id endpoint that retrieves a bookmark id
const handleGetBookmarkById = (req, res) => {
    const { id } = req.params;
    const bookmarkId = bookmarks["bookmarks"].find(bookmark => bookmark.id == id);
    //validate request
    if(!bookmarkId) {
        logger.error(`Card id ${id} not found.`);
        return res.status(404).send("No bookmark found.")
    }
    res.json(bookmarkId);
}
app.get('/bookmarks/:id', handleGetBookmarkById)
//write a ROUTE handler for the POST /bookmarks that accepts a JSON object bookmark and add it to the bookmarks list
const handleNewBookmark = (req, res) => {
    //GET the data from the body with the .body method (use JSON data to parse body of request)
    const { title, url, rating, description } = req.body;
    //validate requests and ensure required parameters provided
    if(!title) {
        logger.error(`A title is required.`);
        return res.status(400).send(`Invalid data.`);
    }
    if(!url) {
        logger.error(`url is required.`);
        return res.status(400).send(`Please provide a valid URL.`);
    }
    if(!rating || isNaN(rating)) {
        logger.error(`A valid number is required`);
        return res.status(400).send(`Please provide a whole number between 1 and 5.`);
    }
    
    //if valid request, construct a bookmark with request data and generated ID; push the bookmark object into the bookmarks array
    const id = uuid();
    console.log(`id is`, id);
    const newBookmark = {
        id,
        title,
        url,
        rating,
        description
    };
    bookmarks["bookmarks"].push(newBookmark);
    logger.info(`Card ID ${id} created!`);
    res.status(202).location(`http://localhost:8000/bookmarks/${id}`).json(newBookmark);
}   
app.post('/bookmarks', handleNewBookmark);
//write a ROUTE handler for the DELETE /bookmarks/:id that deletes a bookmark with a valid ID
const handleDeleteBookmark = (req, res) => {
    const { id } = req.params;
    const bookmarksIndex = bookmarks["bookmarks"].findIndex(bookmark => bookmark.id == id);
    //validate request by ensuring the ID is valid
    if(bookmarksIndex === -1) {
        logger.error(`Bookmarks ID ${id} not found.`)
        return res.status(404).send("Bookmark ID not found.");
    }
    bookmarks["bookmarks"].splice(bookmarksIndex, 1);
    logger.info(`Bookmark ID ${id} deleted.`);
    res.status(204).end();
}
app.delete('/bookmarks/:id', handleDeleteBookmark);

/////////////////////////////////////////////////////////////////////////

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
