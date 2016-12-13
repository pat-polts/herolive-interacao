$(function(){ 
 
    var current = false; 

   console.log($(".instrumentos"));
    $(".instrumentos > div").bind("mouseenter", function(event){
        event.preventDefault(); 
                           
        var element     = this.id;
        var div         = '#' + element;
        var instrumento = $('audio'+div).get(0);
        var $stage      = $('.instrumentos > div'+div);
        var sprite      = event.target;

        var animation   = new Motio(sprite, {fps: 15, frames: 9, startPaused: true}); 

        instrumento.play();
        animation.play();  

            $stage.on("mouseleave", function(e){
                e.preventDefault(); 
                instrumento.pause();
                animation.pause(); 
            });

        return false; 
                    
    }); 


});