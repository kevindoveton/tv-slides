'use strict';

const Path = require('path');
const Express = require('express');
const HashBrown = require('hashbrown-driver');
const BodyParser = require('body-parser');

const PORT = 8000;
const APP_ROOT = Path.resolve(__dirname);

// Express
let app = Express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Configure body parser
app.use(BodyParser.json({limit: '50mb'}));
app.use(BodyParser.urlencoded({extended: true}));

// Init HashBrown driver
HashBrown.init(app);

// Configure express
app.use('/common', Express.static(APP_ROOT + '/common'));
app.use('/media', Express.static(APP_ROOT + '/hashbrown/storage/media'));
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'pug');
app.set('views', APP_ROOT + '/views');

// Routes
app.get('*', (req, res) => {
    HashBrown.content.getByUrl(req.originalUrl) 
    .then((page) => {
        HashBrown.content.getTree().then((tree) => {
            var date = new Date();
            var ampm = date.getHours() >= 12 ? 'pm' : 'am';
            var day = date.getDay()
            var schedule = page.Schedule;
            var curSchedule = page.Default;
            for (var i = 0; i < schedule.length; i++) {
                if (day == schedule[i].Day 
                    && (ampm == schedule[i].time || schedule[i].time == 'all')) {

                    curSchedule = schedule[i];
                    break;
                }
            }

            var images = tree[curSchedule].properties.en.slides;

            res.status(200).render('pages/slideshow', {
                images: images,
                currentSchedule: curSchedule
            });
        });
    })
    .catch((e) => {
        res.status(404).send(e.stack);
    });
});

var groups = {};

io.on('connection', function(socket){
    let group = null;

    socket.on('subscribe', (d) => {
        socket.join(d);
        group = d;
        if (typeof(groups[d]) == 'undefined') {
            groups[d] = {}
            socket.emit('youAreLeader');
        }
    })
    
    socket.on('whoIsLeader', (d) => {
        groups[group].votes = [];
        groups[group].leader = false;
        io.to(group).emit('areYouLeader');
        setTimeout(() => {
            if (groups[group].leader == false) {
                var newLeader = groups[group].votes[0]
                io.to(group).emit('newLeader', newLeader);
            }
        }, 3000);
    });

    socket.on('iAmLeader', (d) => {
        if (typeof(groups[group].leader) == 'undefined') {
            groups[group].leader = true;
            io.to(group).emit('newLeader', d);
        }
    })

    socket.on('iWantToBeLeader', (d) => {
        groups[group].votes.push(d);
    });
    
    socket.on('reachedFirstSlide', () => {
        socket.to(group).emit('goToSlide', 0);
    })

});

// Start server
let server = http.listen(PORT, '0.0.0.0');