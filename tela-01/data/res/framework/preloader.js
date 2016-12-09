/**
Arquivo Préloader
*----------------------------------------
Versão: 1.000007-2016
Data: 10/06/2016
*----------------------------------------
*/  

(function() {

    try {
        var a = new Uint8Array(1);
        return; //no need
    } catch(e) { }

    function subarray(start, end) {
        return this.slice(start, end);
    }

    function set_(array, offset) {
        if (arguments.length < 2) offset = 0;
        for (var i = 0, n = array.length; i < n; ++i, ++offset)
            this[offset] = array[i] & 0xFF;
    }

    // we need typed arrays
    function TypedArray(arg1) {
        var result;
        if (typeof arg1 === "number") {
            result = new Array(arg1);
            for (var i = 0; i < arg1; ++i)
                result[i] = 0;
        } else
            result = arg1.slice(0);
        result.subarray = subarray;
        result.buffer = result;
        result.byteLength = result.length;
        result.set = set_;
        if (typeof arg1 === "object" && arg1.buffer)
            result.buffer = arg1.buffer;

        return result;
    }

    window.Uint8Array = TypedArray;
    window.Uint32Array = TypedArray;
    window.Int32Array = TypedArray;
})();

/**
 * Classe consumida pelo framework. utilizada para fazer o carregamento inicial da pessa trazendo todos os assets necessários
 *
 * @private
 * @class _preloader
 *  @constructor
 *
 */
function _preloader(hasLogo,color,arquivos,callback,navegador) {
  
    /**
     * propriedade que define o estado da animacao princiapal inicial, é necessário que ela seja executada por completo para a peça funcionar
     *
     * @private
     * @property animacaoTerminou
     * @type Boolean
     */
    var animacaoTerminou=false;
    /**
     * propriedade que define o estado do preloader princiapal inicial, é necessário que ele seja finalizado para a peça funcionar
     *
     * @private
     * @property preloaderTerminou
     * @type Boolean
     */
    var preloaderTerminou=false;
    /**
     * Define quantas midias com ID possuimos, auxilia o preloader descobrir se foram carregados todos os assets necessários
     *
     * @private
     * @property qtdDeMediaComId
     * @type int
     */
    var qtdDeMediaComId = 0;
    /**
     * Conforme o preloader carrega uma midia de audio ou video esse valor é incrementado
     *
     * @private
     * @property qtdDeMediaComIdCarregadas
     * @type int
     */
    var qtdDeMediaComIdCarregadas = 0;
    /**
     * Funcao que define verifica se o preloader deve ser finalizado ou não
     *
     * @private
     * @method finalizarPreloader
     */
    var finalizarPreloader = function() {
        qtdDeMediaComIdCarregadas++;
        if (qtdDeMediaComIdCarregadas == qtdDeMediaComId) {
            preloaderTerminou = true;
            preloaderSettings.isFinished(preloaderTerminou,hasLogo,arquivos,callback);
        }
    };
    /**
    *Variaveis para selecionar as cores de fundo e do botão play
    */

    preloaderSettings.start(color);

    /*(function() {
        //auto called function on old code
    }());*/

    /**
     * Mapa que define o parte do mimetype baseando-se na extensao
     *
     * @private
     * @property mediaTypes
     * @type Object
     */
    var mediaTypes={
        "mp3": "/mpeg",
        "mp4": "/mp4",
        "ogg": "/ogg",
        "wav": "/wav",
        "ogv": "/ogv",
        "m4a": "/m4a"
    }
    /**
     * define o source que deve ser usado, tentando executar os srcs com a função canPlayType, caso o navegador atual consiga tocar ele retorna a string com o src.
     *
     * @private
     * @method getSourceCompativel
     * @return string
     */
    var Audiomedia = false;
    var getSourceCompativel = function(id, sources){
        var sourceEscolhido='';
        $.each(sources, function(idx, obj){
            var extensao = obj.substring(obj.length-3, obj.length);
            var media= $('#'+id).get(0);
            if(media.canPlayType && media.canPlayType(media.tagName.toLowerCase()+mediaTypes[extensao]).replace(/no/, '')) {
                sourceEscolhido = obj;
                return false;
            }

        });
        return sourceEscolhido;
    };
    
//----------------------DECLARAÇÕES-----------------------
    /**
     * Cria um novo objeto do tipo PXLoader framework usado para fazer preload de imagens
     *
     * @private
     * @property loaderImg
     * @type Object
     */
    var loaderImg = new PxLoader();

    /**
     * método que define o request que deve ser feito de acordo com o navegador usado,  caso exista alguma nova regra é só adicionar nos ifs, ele retorna um valor que faz referência a proprieda mapRequest
     *
     * @private
     * @method defineRequest
     */
    ;
    var nua = navigator.userAgent;
    var isAndroid = nua.search("ndroid 4.4.2");
    if(isAndroid==-1){
        var isAndroid = nua.search("ndroid 4.4.4");
    }

    console.log("navegador" + navegador);
    console.log("navegador user agent" + nua);
    

    var defineRequest = function(navegador){
        if (navegador.indexOf('IE')>=0){
            console.log("arraybase64");
            return 'arraybase64';
        }else if (navegador.indexOf('afari')>=0 || isAndroid!=-1){
            console.log("Is android 4!");
            console.log("streaming");
            return 'streaming';
        }else{
            console.log("blob");
            return 'blob';
            //return 'streaming';
        }
    };
    /**
     * função que define uma requisição do tipo blob, serve para setar um source dinâmicamente no cache evitando que a tag AUDIO, ou VIDEO faça referência ao src no server funcionando por streaming.
     * a função ja seta o src automáticamente
     *
     * @private
     * @method requisicaoBlob
     */

    var requisicaoBlob = function(mediaSrc, mediaId){
      //const count = document.getElementById('counter');
       var xhr = new XMLHttpRequest();
        xhr.open('GET', mediaSrc, true);
        console.log("Source = " + mediaSrc);
        var lengSrc = mediaSrc.length-4;
        var extentionSrc = mediaSrc.slice(lengSrc);
        xhr.responseType = 'blob';
        xhr.onerror = function(){
            document.getElementById(mediaId).src = mediaSrc;
            finalizarPreloader(callback);
        }
        xhr.onload = function(e) {
            if (this.status == 200) {
                var myBlob= this.response;
                try {
                    var src = (window.URL ? URL : URL).createObjectURL(myBlob);
                    document.getElementById(mediaId).src = src;
                    finalizarPreloader(callback);
                }catch(ex){
                    document.getElementById(mediaId).src = mediaSrc;
                    finalizarPreloader(callback);
                }
            }else{
                document.getElementById(mediaId).src = mediaSrc;
                finalizarPreloader(callback);
            }
        };
        xhr.onprogress = function(e){
            preloaderSettings.update(e.loaded, e.total);
        };

        xhr.send();

        return document.getElementById(mediaId).src != mediaSrc;
    };
    /**
     * função que define uma requisição do tipo ArrayBuffer, serve para setar um source dinâmicamente usando encode base64 no cache evitando que a tag AUDIO, ou VIDEO faça referência ao src no server funcionando por streaming.
     * a função ja seta o src automáticamente
     *
     * @private
     * @method requisicaoBlob
     */
    var requisicaoArrayBuffer = function(mediaSrc, mediaId){
        //const count = document.getElementById('counter');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', mediaSrc, true);
        xhr.responseType = 'arraybuffer';
        xhr.onerror = function(){
            document.getElementById(mediaId).src = mediaSrc;
            finalizarPreloader(callback);
        }
        xhr.onload = function(e) {
            if (this.status == 200) {
                var uInt8Array = new Uint8Array(this.response);
                var i = uInt8Array.length;
                var binaryString = new Array(i);
                while (i--) {
                    binaryString[i] = String.fromCharCode(uInt8Array[i]);
                }
                var data = binaryString.join('');
                var base64 = jQuery.base64.encode(data);
                document.getElementById(mediaId).src = "data:"+mediaTypes[mediaSrc.substring(mediaSrc.length-3, mediaSrc.length)]+";base64," + base64;
                finalizarPreloader(callback);
            }else{
                document.getElementById(mediaId).src = mediaSrc;
                finalizarPreloader(callback);
            }
        };
        xhr.onprogress = function(e){
            preloaderSettings.update(e.loaded, e.total);
        };

        xhr.send();
        return document.getElementById(mediaId).src != mediaSrc;
    };
    /**
     * Este mapa tem como objetivo, definir como o src deve ser setado,
     *
     * @private
     * @property mapRequest
     * type Object
     */
    var mapRequest = {
        'arraybase64': function(mediaSrc,mediaId){
            requisicaoArrayBuffer(mediaSrc,mediaId);
        },
        'blob':function(mediaSrc,mediaId){
            requisicaoBlob(mediaSrc,mediaId);
        },
        'streaming':function(mediaSrc,mediaId){
            document.getElementById(mediaId).src=mediaSrc;
            finalizarPreloader(callback);
        }
    }
//----------------------FIM  DECLARAÇÕES-----------------------
    $.each(arquivos.imgs, function (idx, obj) {
        var pxImage = new PxLoaderImage(obj);
        loaderImg.add(pxImage);
    });


    loaderImg.addCompletionListener(function () {
        $.each(arquivos.medias,function(idx, obj){
            if(obj.id!=undefined) {
                qtdDeMediaComId++;
            }
        });
        $.each(arquivos.medias,function(idx, obj){
            if(obj.id!=undefined){
                var src = getSourceCompativel(obj.id, obj.sources);
                try{
                    mapRequest[defineRequest(navegador)](src,obj.id);
                }catch(ex){
                    document.getElementById(obj.id).src=src;
                    finalizarPreloader(callback);
                }
            }
        })
    });

    loaderImg.addProgressListener(function (e) {
    });
    loaderImg.start();
}
oeds.redimensionar();
$(document).ready(function() {

//TweenMax.staggerFrom(".quadrado", 2, {scale:3, opacity:0, delay:0.5, ease:Elastic.easeOut, force3D:true}, 0.1 ,function(){myCompleteAll()});
});


var preloaderSettings = {

    start: function(color){
        //variables
        var pl = document.getElementById('preloader'); //get preloader element in DOM
        var btPlay = document.getElementById('fw_btn_iniciar_objeto'); // get play btn in DOM
        var bgColor = color; // set color of background and play button

        //set all dinamic colors
        pl.style.background = bgColor;
        btPlay.style.background = bgColor;

        //old code line set element to be showed
        $('#fw_fundo').css('display','block');
        
    },

    isFinished: function(preloaderTerminou, hasLogo, arquivos, callback){
        var count = document.getElementById('counter');
        var pl = document.getElementById('preloader'); //get preloader element in DOM
        var showLogo = hasLogo; // see if preloader is commercial or not
        var jp = document.getElementsByClassName('bar'); // get all bars from preloader in DOM
        var brand = document.getElementById('brand'); // get brand element in DOM
        var bx1 = document.getElementById('bx-1'); // get #b-x1 element in DOM
        var bx2 = document.getElementById('bx-2'); // get #bx-2 element in DOM
        var iOS = /iPad|iPhone|iPod/.test(navigator.platform);

        var sfx = new Howl({
          urls:arquivos.sfx,
          onend: function() {
                    console.log('ACABOU' + this.urls);
          },
          onload: function() {
                    console.log('Carregou '+this);
          },
          onloaderror: function() {
                    console.log('Carregou com erro '+this);
          },
        });
        

        if (preloaderTerminou) {

            var counter = jp.length - 1;

            function loop(){
                if (counter >= 0 && showLogo) {
                    var target = jp[counter].classList;

                    if (counter === 0) {
                      setTimeout(function(){
                        $('.wrp').css('overflow', 'hidden');
                      }, 500);
                    }

                    setTimeout(function(){
                        target.add('grow');

                        if (iOS) {
                          target.remove('jumping');
                        }

                        loop();
                    }, 120);

                    if (sfx._playStart === undefined) {
                      sfx.play();
                      sfx._playStart = 0;
                    }

                    counter--;
                } else {
                    setTimeout(function(){
                        if (showLogo) {
                            brand.style.display = 'block';

                            for (var i = 0; i < jp.length ; i++) {
                             jp[i].style.display = 'none';
                            };

                            count.classList.add('fadeOut');
                            bx1.classList.add('show');
                            bx2.classList.add('show');
                            setTimeout(function(){
                               pl.classList.add('fadeOut');
                               afterDoneTrasit(callback);
                            },2000);

                        } else {
                          var i = 8;
                          setInterval(function(){
                            if (i >= 0) {
                              jp[i].classList.add('fadeOut');
                              i--;
                            }
                          },100);
                          count.classList.add('fadeOut');
                          setTimeout(function(){
                            pl.classList.add('fadeOut');
                            afterDoneTrasit(callback);
                          },900);
                        }

                    },1100);
                }
            }
            loop();
        }
    },


    update: function(l,p){
        var count = document.getElementById('counter');
        var buffered = parseInt(l);
        var totalSize = parseInt(p);
        var p = (buffered/totalSize)*100;
        p = parseInt(p);
        if (isNaN(p)) {
          console.log('local');
          cLocal();
        } else {
          console.log('online');
          count.innerHTML = p + "%";
        }

    },

};

function cLocal(listner){
  var count = document.getElementById('counter');
  var i = 0;
  setInterval(function(){
    
    if (i < 101) {
      count.innerHTML = i + "%";
      i++;
      if (listner !== undefined && i === 100) {
        listner();
      }
    }
  },14);
}

function afterDoneTrasit(callback){
    //this is a copy and past of old code.
    animacaoTerminou = true;
    if(oeds._alfabetizando == true){
        $('#fw_titulo').css('text-transform','uppercase');
        $('.fw_footer').css('text-transform','uppercase');
    };
    $('#fw_capa').delay(1500).fadeIn(1000);

    $('#fw_btn_iniciar_objeto').click(function(){
        $('.fw_btn_menu').toggleClass('tooltips');
        $(".iniciar").css('display', 'none');
        $('#content').css('display', 'block');
        $('#fw_fundo, #preloader').css('display', 'none');
        callback();
        $('#content').css({"display": "block"});
    });
}
