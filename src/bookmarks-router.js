const express = require('express');
const logger = require('./logger');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const { v4: uuid } = require('uuid');

let bookmarks = require('./bookmarks-data');

//write a route handler for the GET /bookmarks endpoint that returns all bookmarks
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

    bookmarksRouter
        .route('/bookmarks/:id')
        .get((req, res) => { //write a ROUTE handler for the GET /bookmarks/:id that retrieves a bookmark with a valid ID
            const { id } = req.params;
            const bookmarkID = bookmarks["bookmarks"].find(bookmark => bookmark.id == id);
            if(!bookmarkID) {
                logger.error(`Card id ${id} not found.`);
                return res.status(404).send("No bookmark found.");
            }
            res.json(bookmarkID);
        })
        .delete((req, res) => { //write a ROUTE handler for the DELETE /bookmarks/:id that deletes a bookmark with a valid ID
            const { id } = req.params;
            const bookmarksIndex = bookmarks["bookmarks"].findIndex(bookmark => bookmark.id == id);
            if(bookmarksIndex === -1) {
                logger.error(`Bookmarks ID ${id} not found.`);
                return res.status(404).send("Bookmark ID not found.");
            }
            bookmarks["bookmarks"].splice(bookmarksIndex, 1)
            logger.info(`Bookmark ID ${id} deleted.`);
            res.status(204).end();
        })
    module.exports = bookmarksRouter;