const express = require('express');
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
    .post(bodyParser, (req, res) => {
        const { title, url, rating, description } = req.body;
        if(!title) {
            return res.status(400).send('Please provide a title.');
        }
        if(!url) {
            return res.status(400).send('Please provide a url.');
        }
        if(!rating || isNaN(rating)) {
            return res.status(400).send('Please provide a number between 1 and 5.');
        }
        const id = uuid()
        const newBookmark =  {
            id,
            title,
            url,
            rating,
            description
        }
        bookmarks["bookmarks"].push(newBookmark);
        res.status(202).location(`http://localhost:8000/bookmarks/${id}`).json(newBookmark);
        
    });

    module.exports = bookmarksRouter;