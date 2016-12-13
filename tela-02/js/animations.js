$(function(){ 
    var $example = $('#field');
    var frame = $example.find('.frame')[0];
    var offset = $example.offset();
    var motio = new Motio(frame, {
        fps: 30,
        bgWidth: 1024,
        bgHeight: 1024
    });

    // Play/Pause when mouse enters/leaves the frame
    $example.on('mouseenter mouseleave', function (event) {
        if (event.type === 'mouseenter') {
            motio.play();
        } else {
            motio.pause();
        }
    });

    // Update the animation speed & direction based on a cursor position
    $example.on('mousemove', function (event) {
        motio.set('speedX', event.pageX - offset.left - motio.width / 2);
        motio.set('speedY', event.pageY - offset.top - motio.height / 2);
    });

});