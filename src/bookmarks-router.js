const express = require('express');
const logger = require('./logger');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const { v4: uuid } = require('uuid');

let bookmarks = require('./bookmarks-data');

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        const { search = " " } = req.query;
        res
            .status(200)
            .json(bookmarks)
    }) 
    .post(bodyParser, (req, res) => { //route handler for POST /bookmarks accepts a JSON object and adds it to bookmarks-data 
        const { title, url, rating, description } = req.body; //get POST data with the .body method; use JSON middleware to parse body of request
    //validate requests have the required parameters
        if(!title) {
            logger.error(`A title is required.`);
            return res.status(400).send('Please provide a title.');
        }
        if(!url) {
            logger.error(`url is required.`);
            return res.status(400).send('Please provide a url.');
        }
        if(!rating || isNaN(rating)) {
            logger.error(`A valid number is required`);
            return res.status(400).send('Please provide a number between 1 and 5.');
        }
    //if the request is valid, construct a bookmark with the request data and UUID generated ID
        const id = uuid()
        const newBookmark =  {
            id,
            title,
            url,
            rating,
            description
        }
        bookmarks["bookmarks"].push(newBookmark);//push the new bookmark object into the bookmarks data file
        logger.info(`Bookmarks ID ${id} created!`);
        res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(newBookmark); //return a status of created, with new bookmark info
        
    });

    module.exports = bookmarksRouter;