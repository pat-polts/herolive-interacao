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
        trompa: {
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
        },
        arpa: {
            nome: 'harpa',
            tipo: 'outros'
        },
        gongo: {
            nome: 'tan-tan ou gongo',
            tipo: 'percussão'
        },
        xylophone: {
            nome: 'Xylophone',
            tipo: 'percussão'
        },
        fagote: {
            nome: 'fagote',
            tipo: 'madeiras'
        },
        corneIngles: {
            nome: 'corne-inglês',
            tipo: 'madeiras'
        },
        flautim: {
            nome: 'flautim',
            tipo: 'madeiras'
        },
        violoncello: {
            nome: 'violoncello',
            tipo: 'cordas'
        },
        tuba: {
            nome: 'tuba',
            tipo: 'metais'
        },
        caixa: {
            nome: 'caixa',
            tipo: 'percussão'
        },
        bombo: {
            nome: 'bombo',
            tipo: 'percussão'
        },
        piano: {
            nome: 'piano',
            tipo: 'outros'
        },
        trombone: {
            nome: 'trombone',
            tipo: 'metais'
        },
        clarone: {
            nome: 'clarone',
            tipo: 'madeiras'
        },
        triangulo: {
            nome: 'triangulo',
            tipo: 'percussão'
        },
        sinos: {
            nome: 'sinos',
            tipo: 'percussão'
        },
        trompete: {
            nome: 'trompete',
            tipo: 'metais'
        },
        viola: {
            nome: 'viola',
            tipo: 'cordas'
        }
    };  
    
    $(".instrumentos > div").bind("mouseenter", function(event){
        // event.defaultPrevented(); 
                      
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
                // e.defaultPrevented(); 
                instrumento.pause();
                instrumento.currentTime = 0;
                $('.desc').html('<p></p>');  
                $('.desc').hide();
                // animation.pause(); 

                return false; 
            });

        return false; 
                    
    }); 


});