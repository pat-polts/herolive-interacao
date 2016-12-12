$(function(){
    var playing = false; //

    $(".instrumentos > img").on("mouseenter mouseleave", function(event){
                    
        playing         = !playing;
        var elId        = '#' + this.id;
        var instrumento = $('audio'+elId).get(0);

        if(event.type === 'mouseenter'){
            return !instrumento.play(); 
        }else{
            return !instrumento.pause(); 
        }
                    
    }); 
});