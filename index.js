'use strict';

const Path = require('path');
const Express = require('express');
const HashBrown = require('hashbrown-driver');
const BodyParser = require('body-parser');

const PORT = 8000;
const APP_ROOT = Path.resolve(__dirname);

// Express
let app = Express();

// Configure body parser
app.use(BodyParser.json({limit: '50mb'}));
app.use(BodyParser.urlencoded({extended: true}));

// Init HashBrown driver
HashBrown.init(app);

// Configure express
app.use(Express.static(APP_ROOT + '/public'));
app.use('/media', Express.static(APP_ROOT + '/hashbrown/storage/media'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', APP_ROOT + '/views');

// Routes
app.get('*', (req, res) => {
    HashBrown.content.getTree()
    .then((content) => {
        res.status(200).json(content);
    })
    .catch((e) => {
        res.status(404).send(e.stack);
    });
});

// Start server
let server = app.listen(PORT, '0.0.0.0');
