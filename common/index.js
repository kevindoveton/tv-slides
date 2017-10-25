function nextSlide(curSlide, isLeader, sock) {
    var totalSlides = document.querySelectorAll('.img').length;
    var nextSlide = curSlide + 1;
    if (nextSlide >= totalSlides || curSlide < 0) {
        nextSlide = 0;
        if (typeof(isLeader) != 'undefined' && typeof(sock) != 'undefined' && isLeader) {
            sock.emit('reachedFirstSlide');
        }
    }
    
    goToSlide(curSlide, nextSlide);

    return nextSlide;
}

var schedule = document.querySelector('html').dataset.currentSchedule;

var socket = io();
var isLeader = false;
var leaderId = Math.random();
var slideInterval = null;
var currentSlide = 0;

socket.on('connect', function() {
    socket.emit('subscribe', schedule);
    socket.emit('whoIsLeader');
    setUpInterval();
});

socket.on('areYouLeader', function() {
    if (isLeader) {
        socket.emit('iAmLeader', leaderId);
    } else {
        socket.emit('iWantToBeLeader', leaderId);
    }
});

socket.on('youAreLeader', function() {
    isLeader = true;
    console.log('i am leader!');
    setUpInterval();
});

socket.on('goToSlide', function(newSlide) {
    setUpInterval();
    currentSlide = goToSlide(currentSlide, newSlide);
    console.log(currentSlide);
    console.log('go to slide:', newSlide);
});

socket.on('newLeader', function(newLeaderId) {
    if (leaderId == newLeaderId) {
        isLeader = true;
    } else {
        isLeader = false;
        console.log(newLeaderId, 'new leader', isLeader);
    }
    setUpInterval();
});

socket.on('reloadPage', function(socket) {
    location.reload(true);
});

function setUpInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(function() {
        currentSlide = nextSlide(currentSlide, isLeader, socket);
    }, 5000);
}

function goToSlide(curSlide, newSlide) {
    if (curSlide == newSlide) {
        return newSlide;
    }

    var next = document.querySelector('.img[data-cur-slide="'+newSlide+'"');
    next.className += " show";

    var cur = document.querySelector('.img[data-cur-slide="'+curSlide+'"]');
    cur.className = cur.className.replace('show', '').replace('  ', '');
    
    return newSlide;
}
