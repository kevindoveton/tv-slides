function nextSlide(curSlide) {
    var totalSlides = document.querySelectorAll('.img').length;
    var nextSlide = curSlide + 1;
    if (nextSlide >= totalSlides) {
        nextSlide = 0;
    }
    
    var next = document.querySelector('.img[data-cur-slide="'+nextSlide+'"');
    next.style.display = "block";

    var cur = document.querySelector('.img[data-cur-slide="'+curSlide+'"');
    cur.style.display = "none";

    return nextSlide;
}

var currentSlide = 0;
setInterval(function() {
    currentSlide = nextSlide(currentSlide);
}, 5000);