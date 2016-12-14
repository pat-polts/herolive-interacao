$(function(){ 

   $('.desc').hide();
    
    var instruments = {
        violino: {
            nome: 'violino',
            tipo: 'cordas'
        },
        contrabaixo: {
            nome: 'contrabaixo',
            tipo: 'cordas'
        },
        tromba: {
            nome: 'trompa',
            tipo: 'metais'
        },
        clarinete: {
            nome: 'clarinete',
            tipo: 'madeiras'
        },
        timpano: {
            nome: 'tímpanos',
            tipo: 'percussão'
        }
    };  
    
    $(".instrumentos > div").bind("mouseenter", function(event){
        event.preventDefault(); 
                      
        var element     = this.id;
        var div         = '#' + element;
        var instrumento = $(div+' > audio').get(0);
        var $stage      = $('.instrumentos > div'+div);
        var sprite      = event.target;

        var animation   = new Motio(sprite, {fps: 15, frames: 9, startPaused: true}); 
        var descricao = instruments[element].tipo + ' - '+instruments[element].nome;
        console.log(element);   
        
        $('.desc').show();
        $('.desc').html('<p>'+descricao+'</p>');

        instrumento.play();
        // animation.play();  

            $stage.on("mouseleave", function(e){
                e.preventDefault(); 
                instrumento.pause();
                $('.desc').html('<p></p>');  
                $('.desc').hide();
                // animation.pause(); 
            });

        return false; 
                    
    }); 


});