
$(document).ready(function(){

    $('#video2').css('display','none');
    $('#video').css('display','none');
        
      oeds.inicializar(true,'#cf181d', fwConfig, function(){
        $('#video').css('display', 'block');
        //carregarAssetsMedia:function(pacoteDeLegendas,animacoes, idElemento,mostrarBarraDeControle, callback){
        oeds.carregarAssetsMedia(legendas,[],'video',true);
    });

    
});
