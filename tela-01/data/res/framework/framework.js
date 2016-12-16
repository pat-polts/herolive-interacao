/**
Arquivo Principal
*----------------------------------------
Versão: 1.000010-2016
Data: 16/08/2016
*----------------------------------------
*/

var fwIdleTime = 0;
/**
 * Framework principal com ferramentas de auxílio ao desenvolvimento.
 * começa a executar suas funcionalidades com a chamada do metodo <a href="oeds.html#method_inicializar">oeds.inicializar</a>
 *
 * @class oeds
 *  @constructor
 *  @uses _preloader
  */

var oeds = {
    /**
     * Propriedade que será usada para mostrar o titulo da ultima modal,
     *
     * @private
     * @property _tituloModalFinal
     * @type String
     */
    _tituloModalFinal:"",
    /**
     * Propriedade que será usada para mostrar o texto da modal de créditos,
     *
     * @private
     * @property textoModalCredito
     * @type String
     */
    _textoModalCredito:"Creditos",
    /**
     * Propriedade que será usada para mostrar o texto da modal de Ajuda
     *
     * @private
     * @property _textoModalAjuda
     * @type String
     */
    _textoModalAjuda:"Ajuda",
    /**
     * principal canal de midia do framework, é usado para tocar audios videos que contenham assets de legandas ou algo do gênero
     *
     * @private
     * @property _mediaChannel
     * @type Object
     */
    _mediaChannel:{},
    /**
     * propriedade auxiliar usada para verificar o estado do áudio no mediaChannel de maneira local, serve para evitar que um unmute global afete o comportamento da peça.
     * <br><b>Obs:</b> ** Foi solicitado para que não tratasse o áudio de maneira local,
     * então atualmente toda acao de mute ou unmute é global;
     *
     * @private
     * @property _audioLocalEstaMudo
     * @type Boolean
     */
    _audioLocalEstaMudo:false,
    /**
     * propriedade auxiliar usada para verificar o estado da mediaChannel de maneira local, serve para evitar que resume global afete o comportamento da peça de maneira inesperada.
     * <br><b>Obs:</b>  **Foi solicitado para que não tratasse o pause de maneira local,
     * então atualmente toda acao de pauseResume é global;
     *
     * @private
     * @property _isMediaAtualPausada
     * @type Boolean
     */
    _isMediaAtualPausada:false,
    /**
     * identifica o id do Elemento que está sendo reproduzido no _mediaChannel
     *
     * @private
     * @property _idElementoAtual
     * @type String
     */
    _idElementoAtual:"",
    /**
     * identifica como está o audioGlobal da peça para evitar que reproduza som ao reproduzir um áudio
     *
     * @private
     * @property _audioGlobalEstaMudo
     * @type Boolean
     */
    _audioGlobalEstaMudo:false,
    /**
     * identifica se o cenário está pausado, para ajudar a alterar comportamento de todas as peças ou de uma peça especifica
     *
     * @private
     * @property _isPauseGlobalAtivo
     * @type Boolean
     */
    _isPauseGlobalAtivo:false,
    /**
     * Seleciona todos os Tweens (que é o formato de animação usado) da peça é usado para auxiliar no pauseGlobal e evitar o uso do TweenMax
     *
     * @private
     * @property _isPauseGlobalAtivo
     * @type Array
     */
    _allTweens:[],
    /**
     * referencia o escopo atual para auxiliar o acesso em outros escopos.
     *
     * @private
     * @property that
     * @type Object
     */
    tweenAnimation: null,

    that:this,
    /**
     * define o texto que vai aparecer na primeira modal do final da peça
     *
     * @private
     * @property _primeiroTextoModalFinal
     * @type Object
     */
    _primeiroTextoModalFinal:"",
    /**
     * define o segundo texto que vai aparecer na primeira modal do final da peça
     *
     * @private
     * @property _segundoTextoModalFinal
     * @type Object
     */
    _segundoTextoModalFinal:"",

    /**
     * contém as funcionalidades necessárias para disparar animações de acordo com o tempo no vídeo,
     * funciona como da mesma forma que uma legenda, porém ao invés de texto possui funções javascript,
     * apesaar de se chamar animacaoAPI, pode ser usada para disparar qualquer tipo de funcao callback em um tempo determinado do video ou audio escolhido.
     *
     * @private
     * @property _animacaoAPI
     * @type Object
     */
    _animacaoAPI: {
        /**
         * Transforma uma "mm:ss,cc" em segundos
         * <br><b>Obs:</b>** esse método foi duplicado e existe o mesmo método em legendaAPI,
         * o ideal seria ter um módulo de utils com essa função lançando exceção, e na hora que fosse necessário utilizar esse método tratar a exceção de maneira especifica.
         * porém por alguns problemas de tempo e escopo essa foi a solução mais rápida
         *
         * @private
         * @method _transformarTempo
        * @return {int} segundos
         */
        _transformarTempo : function(tempoObtido){
            var segundos = 0;
            try {
                var text = tempoObtido;
                var tempo = text.split(':');
                var segEMili = tempo[1].split(',');
                var segundos = parseInt(tempo[0] * 60) + parseInt(segEMili[0]) + segEMili[1] / 100;

            }catch(e){
                segundos=99999;
            }
            return segundos;
        },
        /**
         * lista com todas as animacoes, que serão reproduzidas
         *
         * @private
         * @property _animacoes
         * @type Array
         */
        _animacoes: [],
        /**
         * identifica a posicao da Animacao Atual, usada para definir qual das _animacoes deve ser reproduzida
         *
         * @private
         * @property _posicaoAnimacaoAtual
         * @type int
         */
        _posicaoAnimacaoAtual: 0,
        
        /**
     * Informa se o objeto é para crianças em alfabetização.
     *
     * @private
     * @property _alfabetizando
     * @type Boolean
     */
        _alfabetizando: false,
        /**
         * toca a  animacao atual e coloca a próxima na fila esperando chegar o tempo determinado
         *
         * @private
         * @method _tocarAnimacao
         */


        _tocarAnimacao: function (audioChannel) {
            var tempoAtual = audioChannel.get(0).currentTime;
            if (this._animacoes[this._posicaoAnimacaoAtual] != undefined) {
                if (tempoAtual >= this._transformarTempo(this._animacoes[this._posicaoAnimacaoAtual].tempoInicial)) {
                    this._animacoes[this._posicaoAnimacaoAtual].executeAnimacao();
                    this._posicaoAnimacaoAtual++;
                }
            }
        }
    },


    /**
     * Carrega todos os Assets em uma midia especificada pelo ID no parametro obrigatório idElemento
     * esse metodo executa a midia passada pelo parametro instantanemente e exibe uma barra de controle
     * para poder controlar o tempo, volume (on/off), e legenda (on/off) o fim da execucao da midia e
     * definido por um callback, que sera executado assim que a midia terminar de ser executada.
     * ao chamar essa funcao o video passa a ser reproduzido imediatamente
     *
     *
     *
     * @method carregarAssetsMedia
     * @param {Object} pacoteDeLegendas <a href="legendas.html">>>>ARQUIVO DE LEGENDAS<<<</a>: objeto no formato de um JSON,  é obrigatorio ser preenchido
     * de acordo com o exemplo,  caso a mídia não possua legendas passar '[]' ou null, no lugar
     * @param {Object} animacoes <a href="animacoes.html">>>>ARQUIVO DE ANIMACOES<<<</a>: objeto no formato de um JSON,  é obrigatorio ser preenchido
     * de acordo com o exemplo,  caso a mídia não possua animacoes passar '[]' ou null, no lugar
     * @param {String} idElemento, deve ser passado o ID da midia que sera reproduzida, parametro OBRIGATORIO
     * @param {Boolean} mostrarBarraDeControle, define se será mostrada a barra de controle do vídeo, parametro OBRIGATORIO
     * @param {Function} callback funcao de callback que define que passo seguir apos a execucao da midia
     /**
     *Declarando um arquivo de legendas
     * @example
     *
     *       carregarAssetsMedia:function(legendas,animacoes, idElemento,mostrarBarraDeControle, callback){
     *      if (legendas==null){
     *          legendas = [];
     *      }
     *      if (animacoes == null){
     *          animacoes=[];
     *      }
     *      //Define se a barra de controles vai aparecer
     *      if (mostrarBarraDeControle){
     *          $(".fw_video_control").css('display','block');
     *      }
     *      //zera a posição da legenda para que ela mostre desde o começo
     *      this.legendaAPI._posicaoLegendaAtual=0;
     *      //idem ao anterior
     *      this._animacaoAPI._posicaoAnimacaoAtual=0;
     *      //seta as animaçoes
     *      this._animacaoAPI._animacoes = animacoes;
     *      //executa o método playmedia, para começar tocar a media que foi carregada
     *      this._playMedia(idElemento);
     *      // começa a carregar os comportamentos do player de acordo com o parametro
     *      this._carregarComportamentos(mostrarBarraDeControle);
     *      //seta o elemento
     *      this.legendaAPI._idElementoAtual = idElemento;
     *      this._idElementoAtual = idElemento;
     *      atualiza o arquivo de legendas, para definir o que será mostrado
     *      this.legendaAPI._legendas = legendas;
     *      var that = this;
     *      //define o que acontece após o vídeo acabar
     *      this._mediaChannel.on('ended',function(){
     *          $("#video-control").css('display','none');
     *          $("#legenda").css('display','none');
     *          callback();
     *      });
     *      /definição do que acontece enquanto o vídeo toca
     *      this._mediaChannel.on('timeupdate',function(){
     *      //esta parte serve para mostar o tempo em minutos e segundos
     *      var duracaoTotalMinutos= Math.floor(Math.floor(this.duration)/60);
     *      var duracaoTotalSegundos=Math.floor(this.duration)%60;
     *      var textoDuracao = "";
     *      if (duracaoTotalMinutos<=0){
     *           textoDuracao = "0:";
     *      }else{
     *           textoDuracao= duracaoTotalMinutos+":";
     *      }
     *      if (duracaoTotalSegundos<10&&duracaoTotalSegundos!=0){
     *           textoDuracao+="0"+duracaoTotalSegundos
     *      }else if(duracaoTotalSegundos==0){
     *           textoDuracao+='00';
     *      }else{
     *           textoDuracao+=duracaoTotalSegundos;
     *      }
     *
     *      $('#duracao').text(textoDuracao);
     *
     *
     *      //define a posicao da range bar,
     *      var valorSeekBarNova = this.currentTime* (550 / this.duration);
     *      document.getElementById('playbar').style.width=valorSeekBarNova+'px';
     *      document.getElementById('scrubber').style.left=valorSeekBarNova+'px';
     *      var tempoMinutosAtual= Math.floor(Math.floor(this.currentTime)/60);
     *      var tempoSegundosAtual=Math.floor(this.currentTime)%60;
     *      var textoTempo = "";
     *      if (tempoMinutosAtual<=0){
     *           textoTempo = "0:";
     *       }else{
     *           textoTempo= tempoMinutosAtual+":";
     *       }
     *       if (tempoSegundosAtual<10&&tempoSegundosAtual!=0){
     *           textoTempo+="0"+tempoSegundosAtual
     *       }else if(tempoSegundosAtual==0){
     *           textoTempo+='00';
     *       }else{
     *           textoTempo+=tempoSegundosAtual;
     *       }
     *       //mostra  tempo atual do video
     *       $('#tempo-atual').text(textoTempo);
     *       //começa a tocar a legenda no tempo atual
     *       that.legendaAPI._playLegenda(that._mediaChannel);
     *       //começa a tocar a animacao no tempo atual
     *       that._animacaoAPI._tocarAnimacao(that._mediaChannel);
     *      })
     *      }
     */
    carregarAssetsMedia:function(pacoteDeLegendas,animacoes, idElemento,mostrarBarraDeControle, callback){
        if (pacoteDeLegendas==null){
            pacoteDeLegendas = [];
        }
        if (animacoes == null){
            animacoes=[];
        }
        if (mostrarBarraDeControle){
            $(".fw_video_control").css('display','block');
        }
        this.legendaAPI._posicaoLegendaAtual=0;
        this._animacaoAPI._posicaoAnimacaoAtual=0;
        this._animacaoAPI._animacoes = animacoes;
        this._playMedia(idElemento);
        this.legendaAPI._pacoteDeLegendas = pacoteDeLegendas;
        this._carregarComportamentos(mostrarBarraDeControle);
        this.legendaAPI._idElementoAtual = idElemento;
        this._idElementoAtual = idElemento;
        console.log(this.legendaAPI._pacoteDeLegendas);
        this._trocaIdioma(this.legendaAPI._idiomaAtual)
        var that = this;
        console.log('pacoteDeLegenda');
        console.log(pacoteDeLegendas);
        
        /*if(pacoteDeLegendas !== []){
            $('#menu-video').append(
                '<li id="fw_btn_menu_legenda" class="item_menu"><a class="fw_btn_menu_legenda" onclick="oeds.legendaAPI.ligaDesligaLegenda()"><i></i></a></li>')
        }*/
          
                //'<li id="fw_btn_menu_legenda" class="item_menu"><a class="fw_btn_menu_legenda" onclick="oeds.legendaAPI.ligaDesligaLegenda()"><i></i></a></li>' +
                //'<li id="fw_btn_menu_idioma" class="item_menu"><a class="fw_btn_menu_idioma" onclick="oeds._mostrarIdiomas()"><i></i>LEGENDAS</a></li>'  +   
        
        this._mediaChannel.on('ended',function(){
            $("#video-control").css('display','none');
            //$('#fw_btn_menu_legenda').remove()
             if(oeds.legendaAPI._isLegendaAtivada){
                $("#legenda").css('display','none');  
			    $("#tab-abas").show();  
            }
            // callback();
        });

        this._mediaChannel.on('timeupdate',function(){

            var duracaoTotalMinutos= Math.floor(Math.floor(this.duration)/60);
            var duracaoTotalSegundos=Math.floor(this.duration)%60;
            var textoDuracao = "";
            if (duracaoTotalMinutos<=0){
                textoDuracao = "0:";
            }else{
                textoDuracao= duracaoTotalMinutos+":";
            }
            if (duracaoTotalSegundos<10&&duracaoTotalSegundos!=0){
                textoDuracao+="0"+duracaoTotalSegundos
            }else if(duracaoTotalSegundos==0){
                textoDuracao+='00';
            }else{
                textoDuracao+=duracaoTotalSegundos;
            }

            $('#duracao').text(textoDuracao);

            var valorSeekBar = this.currentTime* (550 / this.duration);
            document.getElementById('playbar').style.width=valorSeekBar+'px';
            document.getElementById('scrubber').style.left=valorSeekBar+'px';
            var tempoMinutosAtual= Math.floor(Math.floor(this.currentTime)/60);
            var tempoSegundosAtual=Math.floor(this.currentTime)%60;
            var textoTempo = "";
            if (tempoMinutosAtual<=0){
                textoTempo = "0:";
            }else{
                textoTempo= tempoMinutosAtual+":";
            }
            if (tempoSegundosAtual<10&&tempoSegundosAtual!=0){
                textoTempo+="0"+tempoSegundosAtual
            }else if(tempoSegundosAtual==0){
                textoTempo+='00';
            }else{
                textoTempo+=tempoSegundosAtual;
            }

            $('#tempo-atual').text(textoTempo);
            that.legendaAPI._playLegenda(that._mediaChannel);
            that._animacaoAPI._tocarAnimacao(that._mediaChannel);
        })
    },
    /**
     * Função com o objetivo de abaixar a barra de controles define o que acontece com ela e a legenda
     *
     * @private
     * @method _abaixarBarraDeControles
     */
    _abaixarBarraDeControles:function () {

        TweenLite.to($('#video-control'), 1, {
            y: 60,
            ease: 'easeOutQuart'
        });
        TweenLite.to($('#legenda'), 1, {
            y: 60,
            ease: 'easeOutQuart'
        })
    },
    /**
     * Função com o objetivo de subir a barra de controles define o que acontece com ela e a legenda
     *
     * @private
     * @method _subirBarraDeControles
     */
    _subirBarraDeControles:function(){
        TweenLite.to($('#video-control'), 1, {
            y: 0,
            ease: 'easeOutQuart'
        });
        TweenLite.to($('#legenda'), 1, {
            y: 0,
            ease: 'easeOutQuart',
            autoAlpha: 1
        })

    },
    /**
     * Carrega os principais comportamentos relativos ao mouse enter e alguns detalhes quanto a inatividade do usuario,
     * define principalmente o subir da barra de controles seu comportamente está diretamente ligado com carregarAssetsMedia
     * define tambem comportamentos relativos a inatividade na peça
     *
     * @private
     * @method _carregarComportamentos
     */
    _carregarComportamentos:function(mostrarBarraDeControle){
        if(mostrarBarraDeControle) {
            $('#content').mouseleave(this._abaixarBarraDeControles);
            $('#content').mouseenter(this._subirBarraDeControles);
            $('#content').bind('mousemove',function (e) {
                oeds._subirBarraDeControles();
                fwIdleTime = 0;
                }).bind('ontouchstart',function (e) {
                    oeds._subirBarraDeControles();
                    fwIdleTime = 0;
                }).bind('ontouchmove',function (e) {
                    oeds._subirBarraDeControles();
                    fwIdleTime = 0;
                });
        }else{

            $('#content').unbind('mouseleave')
                .unbind('mouseenter')
                .unbind('touchstart')
                .unbind('touchmove')
                .unbind('mousemove')

            TweenLite.to($('#legenda'), 1, {
                y: 60,
                ease: 'easeOutQuart',
                autoAlpha: 1
            })
        }
        var qtdDeLegendas = 0;
        var listaDeLegendas = '' ;
        console.log(this.legendaAPI._pacoteDeLegendas);
        $.each(this.legendaAPI._pacoteDeLegendas, function(idx,obj){
            console.log(obj, idx);
            qtdDeLegendas= idx;
            listaDeLegendas+='<li><a onclick="oeds._trocaIdioma(\''+obj.idioma+'\')">'+obj.idioma.toUpperCase()+'</a></li>';
        });
        console.log(qtdDeLegendas);
        if (qtdDeLegendas>0){
            $('#fw_btn_menu_legenda').css('display','none');
            $('#fw_btn_menu_idioma').css('display','block');
        }else{
            $('#fw_btn_menu_legenda').css('display','block');
            $('#fw_btn_menu_idioma').css('display','none');
        }
        listaDeLegendas +='<li class="item_menu"><a onclick="oeds.legendaAPI._desligaLegenda()">TIRAR LEGENDA</a></li>'
        $('#lista_de_idiomas ul').html(listaDeLegendas);
        $('#lista_de_idiomas ul li').each(function(){
            $(this).mouseenter(function(){
                $(this).addClass('hover');
            })
            $(this).mouseleave(function(){
                $(this).removeClass('hover');
            })
        });

    },
    /**
     * local onde são setadas as configurações da legenda linkada com a media atual
     *
     * @private
     * @property legendaAPI
     * @type Object
     */
        

    legendaAPI:{
        _pacoteDeLegendas:[],
        _idiomaAtual:"",
        /**
         * serve para controlar a aparição da legenda na peça, cada vez que ela é chamada, ela itera sobre todos os nós do objeto _legendas
         * e seta em legendaAPI._posicaoLegendaAtual qual índice deveria ser mostrado  é utilizada apenas na função de "tracking" que ocorre na função _divMove
         *
         * @private
         * @method _controlaLegendas
         * @params {int} tempoAtual define o tempo em segundos em que está o video
         */


        _controlaLegendas:function(tempoAtual){
            if (tempoAtual<0){
                tempoAtual = 0;
            }
            var that =  this;
            $.each(this._legendas, function(index,obj){
                var tempoInicial = that._transformarTempo(obj.tempoInicial);
                var tempoFinal = that._transformarTempo(obj.tempoFinal);
                if( tempoInicial<=tempoAtual && tempoFinal>=tempoAtual){
                    that._posicaoLegendaAtual = index;
                    return false
                }else if(tempoInicial > tempoAtual ){
                    that._posicaoLegendaAtual = index;
                    return false
                }
            });
        },
        /**
         * Transforma uma "mm:ss,cc" em segundos
         * <br><b>Obs:</b>** esse método foi duplicado e existe o mesmo método em legendaAPI,
         * o ideal seria ter um módulo de utils com essa função lançando exceção, e na hora que fosse necessário utilizar esse método tratar a exceção de maneira especifica.
         * porém por alguns problemas de tempo e escopo essa foi a solução mais rápida
         * @private
         * @method _transformarTempo
         * @return {int} segundos
         *
         */
        _transformarTempo : function(tempoObtido){
            var segundos = 0;
            try {
                var text = tempoObtido;
                var tempo = text.split(':');
                var segEMili = tempo[1].split(',');
                segundos = parseInt(tempo[0] * 60) + parseInt(segEMili[0]) + segEMili[1] / 100;

            }catch(e){
                segundos=0;
            }
            return segundos;
        },
        /**
         * define o id do elemento atual para as legendas
         *
         * @private
         * @method _idElementoAtual
         */
        _idElementoAtual:"",
        _legendas:[],
        _posicaoLegendaAtual:0,
        _isLegendaAtivada:true,
        /**
         * Tem como objetivo ligar ou desligar a legenda, funciona apenas se estiver sendo executada uma midia utilizando
         * o método <a href='oeds.html#method_carregarAssetsMedia'>carregarAssetsMedia</a>, não tem necessidade de parâmetros
         *
         * @method ligaDesligaLegenda
         * @example
         *       var botao = $('#btn_legenda);
         *       botao.click(function(){
         *          oeds.ligaDesligaLegenda();
         *       }
         */
        ligaDesligaLegenda:function(){
            $('.fw_btn_legenda').toggleClass('fw_off');
            $('.fw_btn_menu_legenda').toggleClass('fw_off');
            //this._isLegendaAtivada = !this._isLegendaAtivada;
            this._isLegendaAtivada = !this._isLegendaAtivada;
        },
        _desligaLegenda:function(){
            this._isLegendaAtivada = false;
            $('.fw_btn_legenda').addClass('fw_off');
            $('.fw_btn_legenda').removeClass('fw_off');
            oeds.pauseResume();
            //TODO arrumar isso aqui se sobrar tempo

        },

        /**
         * começa a tocar a legenda identificando quando a legenda deve tocar ou quando ela deve parar. fica alternando o display de acordo com a verificação do tempo
         *
         *
         * @method _playLegenda
         *
         */
        _playLegenda:function(audioChannel){
            var tempoAtual = audioChannel.get(0).currentTime;



            if(this._legendas[this._posicaoLegendaAtual]!= undefined){
                var tempoInicialLegenda = this._transformarTempo(this._legendas[this._posicaoLegendaAtual].tempoInicial);
                var tempoFinalLegenda = this._transformarTempo(this._legendas[this._posicaoLegendaAtual].tempoFinal);

                if( tempoAtual >= tempoInicialLegenda &&
                    tempoAtual <= tempoFinalLegenda ){



                 $('#legenda > p').css('display','inline-block');
                if(this._isLegendaAtivada==false){
                    console.log('legenda inativa');
                    $('#legenda > p').css('display','none');
                }else{
                    $('#legenda').css('display','block');
                }
                    $('#legenda > p').html(this._legendas[this._posicaoLegendaAtual].texto);
                    
                }else if(tempoAtual <= tempoInicialLegenda){
                    $('#legenda > p').css('display','none')
                }else{
                    this._posicaoLegendaAtual++;
                }
            }else{
                $('#legenda > p').css('display','none')
            }
            
            if(oeds._alfabetizando == true){
            $('#legenda > p').css('text-transform','uppercase');
            };
        }
    },
    /**
     * Inicia o menu de controle de video e o menu de controle global,
     * @private
     * @method initControleVideo
     *
     */
    initControleVideo: function(){
        var volumeBarIcon = '<div id="fw_btn_mute" class="fw_btn_mute tooltips"><span></span></div>';
        var volumeMenuIcon = '<li class="item_menu" onclick="oeds.volumeOnOff()"><a class="fw_btn_audio"><i></i>ÁUDIO</a></li>';

        var iOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (iOSDevice == true){
            
            volumeBarIcon = "";
            volumeMenuIcon = '<div id="fw_btn_mute" class="fw_btn_mute tooltips" style="display:none"><span></span></div>';
        };

        $("#content").append(
            '<div class="fw_modal">' +
                '<div id="fw_btn_fechar_modal" onclick="oeds._ocultarModal()"><p></p></div>' +
                '<div class="fw_modal_texto"></div>' +
                '</div>'+
                '<div id="wrapper_legenda">'+
                '<div id="legenda" class="fw_legenda"><p></p></div></div>'+

                '<div id="video-control" class="fw_video_control" >' +
                '<div id="play-pause" class="fw_btn_play tooltips"><span>PAUSE</span></div>' +
                '<div class="fw_seek_line"><span id="tempo-atual" class="fw_seek_line_now">0:00</span>'+
                '<div id="seekbar">' +
                '<div id="seekcontrol" class="seek-bar">'+
                '<div id="playbar" class="play-bar"></div>'+
                '</div>' +
                '<div id="scrubber"></div>'+
                '</div>'+
                '<span id="duracao" class="fw_seek_line_out">0:00</span>' +
                '</div>'+
                //'<div id="fw_btn_mute" class="fw_btn_mute tooltips"><span></span></div>'+
                volumeBarIcon +
                '<div id="fw_btn_legenda" class="fw_btn_legenda tooltips fw_off"><span></span></div>'+
                '</div>'+

                '<div>' +
                '<div id="fadePause" class="fw_modal_video_play">'+
                '<div class="fw_btn_pause" onclick="oeds.pauseResume();"></div>'+
                '</div>'+
                '<div id="menu-video" class="fw_sub_menu">' +
                //'<li class="item_menu"><a class="fw_btn_inicio" onclick="location.reload();"><i></i>INÍCIO</a></li>' +
                '<li class="item_menu" onclick="location.reload();"><a class="fw_btn_inicio"><i></i>INÍCIO</a></li>' +
                volumeMenuIcon +
                //'<li class="item_menu"><a class="fw_btn_audio" onclick="oeds.volumeOnOff()"><i></i>ÁUDIO</a></li>' +
                '<li class="item_menu"><a class="fw_btn_tela_cheia" onclick="oeds.goFullScreen()"><i></i>TELA CHEIA</a></li>' +
                '<li id="fw_btn_menu_legenda" class="item_menu" onclick="oeds.legendaAPI.ligaDesligaLegenda();"><a class="fw_btn_menu_legenda"><i></i></a></li>' +
                //'<li id="fw_btn_menu_idioma" class="item_menu"><a class="fw_btn_menu_idioma" onclick="oeds._mostrarIdiomas()"><i></i>LEGENDAS</a></li>'  +
                //'<li id="lista_de_idiomas">'+
                '<ul>' +
                '</ul>' +
                '</li>' +
                //'<li class="item_menu"><a class="fw_btn_ajuda" onclick="oeds.mostrarModal(oeds._textoModalAjuda)"><i></i>ORIENTAÇÕES</a></li>' +
                '<li class="item_menu" onclick="oeds.mostrarModal(oeds._textoModalCredito);"><a class="fw_btn_credito"><i></i>CRÉDITOS</a></li>' +
                // '<li><a href="#" class="fw_btn_fechar" onclick="oeds.fecharJanela()"><i></i>FECHAR</a></li>' +
                '</div>'+
                '<div class="fw_btn_menu" id="init-menu" onclick="oeds.mostrarMenuMedia()"><span>MENU</span></div>' );


        $('video').click(function(){
            oeds.pauseResume();
        });

        $('#fadePause').click(function(){
            if(oeds._isPauseGlobalAtivo){
                oeds._ocultarModal();
                oeds.pauseResume();
            }
        });
        $('.fw_modal').click(function(){
            if(oeds._isPauseGlobalAtivo){
                oeds._ocultarModal();
                oeds.pauseResume();
            }
        })
    },
    _mostrarIdiomas:function(){

        var qtdDeIdiomas = $("#lista_de_idiomas ul li").length;
        var tamanho = (qtdDeIdiomas*31)+'px';
        console.log(tamanho);
        console.log($("#lista_de_idiomas").css('height'));
        if($("#lista_de_idiomas").css('height')=='0px'){
            TweenLite.to($("#lista_de_idiomas"),0.6,{ease:Back.easeOut, height:tamanho,marginTop:'-3px',opacity:1,paddingTop:'0px'})
        }else{
            TweenLite.to($("#lista_de_idiomas"),0.6,{ease:Back.easeIn, height:0,marginTop:'-27px',opacity:0,paddingTop:'13px'})
        }
    },
    _trocaIdioma: function(idiomaSelecionado){
        //this.legendaAPI._isLegendaAtivada = true;
        $('.fw_btn_legenda').removeClass('fw_off');
        $('.fw_btn_legenda').addClass('fw_off');

        if(this.legendaAPI._pacoteDeLegendas.length>0){
        this.legendaAPI._legendas = this.legendaAPI._pacoteDeLegendas[0].legendas;
        this.legendaAPI._idiomaAtual = idiomaSelecionado
        var that = this;
        $.each(this.legendaAPI._pacoteDeLegendas,function(idx,obj){
            console.log("Pacote de legendas: "+obj);
            if (obj.idioma == idiomaSelecionado){
                that.legendaAPI._legendas = obj.legendas;
                that.pauseResume();
            }
        })
        };
    },
    /**
     *  Mostra um modal mostrando mostrando que será exibido com o texto passado por parâmetro
     *  ao tocar em qualquer lugar da tela esse modal some
     * @method mostrarModal
     * @param {String} texto  deve ser parado para informar o que vai aparecer no modal
     * @example
     *       oeds.mostrarModal('<h1>novoModal</h1>');
     */
    mostrarModal: function(texto){
        if (texto== undefined){
            texto='';
        }
        $('#menu-video').css('display','none');
        $('.fw_modal').css('display','block');
        $('.fw_modal_texto').html(texto);
    },
    /**
     *  oculta o modal atual que estiver em exibição, é executado automaticamente quando a pessoa clica em qualquer lugar da tela
     *
     * @private
     * @method _ocultarModal
     */
    _ocultarModal: function(){
        $('.fw_modal').css('display','none');
    },
    /**
     * mostra o menu  do framework com as suas funções
     *
     * @private
     * @method _ocultarModal

     */
    mostrarMenuMedia:function(){
        this._ocultarModal();
        $('.fw_btn_menu').removeClass('hover');
        this.pauseResume();
        if ($('#menu-video').css('display')=='block'){
            $('#menu-video').css('display','none');
        }else if(this._isPauseGlobalAtivo){
            $('#menu-video').css('display','block');
        }
    },

    /**
     * Inicia as funções principais do framework. deve ser chamado logo no inicio.
     *
     *
     *
     * @method inicializar
     *
     * @param {Object} config <a href='fwConfig.html'> >>> ARQUIVO CONFIG <<< </a>: T   raz as configurações basicas do framework, como exibição de mensagens mapa de arquivos para serem carregados,
     * @param {Function} callback funcao de retorno que indica o que deve acontecer após o _preloader ser carregado
     * @example
     *       //
     *       inicializar:function(config,callback){
     *       //seta o texto do Modal ajuda de acordc com o arquivo de configuração
     *       this._textoModalAjuda=(config.textoModalAjuda);
     *       //seta o texto do modal credito de acordo com o arquivo de configuração
     *       this._textoModalCredito=(config.textoModalCredito);
     *       //seta o texto do primeiro modal da ultima tela se o usuário quiser que ela apareça
     *       this._primeiroTextoModalFinal=(config.primeiroTextoModalFinal);
     *       //seta o texto do segundo modal da ultima tela se o usuário quiser que ela apareça
     *       this._segundoTextoModalFinal=(config.segundoTextoModalFinal);
     *       //chama o _preloader passando uma função de callback que será executada assim que o _preloader terminar e a pessoa clicar no botão play
     *       _preloader(config.arquivos,callback,this.identificarBrowser());
     *       //executa o initControleVideo
     *       this.initControleVideo();
     *       //define um esquema para redimensionamento da tela
     *       this.redimensionar();
     *       //garante que esse evento sempre funcione nas funções de resize
     *       window.addEventListener("resize", this.redimensionar, true);
     *       //adiciona listeners nos botões de controle de tempo áudio entre outros do player
     *       window.onload = _addListeners();
     *       },}
     */
    inicializar:function(logo,bgColor,config,callback){
        oeds._alfabetizando=(config.alfabetizando);
        this._textoModalAjuda=(config.textoModalAjuda);
        this._textoModalCredito=(config.textoModalCredito);
        this._primeiroTextoModalFinal=(config.primeiroTextoModalFinal);
        this._segundoTextoModalFinal=(config.segundoTextoModalFinal);
        _preloader(logo,bgColor,config.arquivos,callback,this.identificarBrowser());
        this.initControleVideo();
        /*
        this.redimensionar();
        window.addEventListener("resize", this.redimensionar, true);
        window.onload = _addListeners();
        */
        this.redimensionar();
        window.addEventListener("resize", this.redimensionar, true);
        window.onload = _addListeners();
    },
    /**
     * Identifica o browser que está sendo usado e a sua versao.
     *
     * @method identificaBrowser
     * @return {String} retorna o browser e a versão atual do mesmo em uma String
     * OBS: o nome do browser pode variar de acordo com a sua versao ex:
     * Internet Explorer 11 retorna: 'IE 11'
     * Internet Explorer 9 retorna: 'MSIE 9'
     * @example
     *       alert(oeds.identificaBrowser());
     *       //ira mostrar um alerta com o browser e a versão do mesmo
     */

    identificarBrowser: function (){
        return navigator.sayswho= (function(){
            var ua= navigator.userAgent, tem,
                M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if(/trident/i.test(M[1])){
                tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE '+(tem[1] || '');
            }
            if(M[1]=== 'Chrome'){
                tem= ua.match(/\bOPR\/(\d+)/);
                if(tem!= null) return 'Opera '+tem[1];
            }
            M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
            if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();

    },
    /**
     * faz com que a resolução seja obedecida de acordo com o tamanho da janela
     *
     * @method redimensionar
     */
    redimensionar: function(widthParam, heightParam) {

        //if (widthParam == undefined || heightParam == undefined) {
        //    widthParam = 768;
        //    heightParam = 1024;
        //}
        //var ViewP = document.getElementsByTagName('html')[0],
        //    heigthView = window.innerHeight,
        //    widthView = window.innerWidth,
        //    factorView = Math.min(heigthView / widthParam, widthView / heightParam);
        //
        //
        //_fwProporcaoTela = factorView;
        //ViewP.style.webkitTransform = 'scale(' + factorView + ')';
        //ViewP.style.transform = 'scale(' + factorView + ')';
        //window.focus();

        if (widthParam == undefined || heightParam == undefined) {
            widthParam = 768;
            heightParam = 1024;
        }
        var ViewP = document.getElementsByTagName('html')[0],
            heigthView = window.innerHeight,
            widthView = window.innerWidth,
            factorView = Math.min(heigthView / widthParam, widthView / heightParam);
        _fwProporcaoTela = factorView;
        TweenLite.to('html',0,{perspective:500});
        TweenLite.to('html',0,{scale:factorView});
        window.focus();

    },
    /**
     * Liga ou desliga o audio da OED,  para que não ocorram problemas eles devem estar usando a tag audio.
     *
     * @method volumeOnOff
     * @param {String} idElemento caso seja passado tornará mudo apenas um elemento em específico
     *
     */
    volumeOnOff:function(idElemento){
        $('.fw_btn_audio').toggleClass('fw_off');
        $('.fw_btn_mute').toggleClass('fw_off');

        if(idElemento!= undefined) {

            if($('#'+idElemento).get(0).muted){

                this._volumeOn(idElemento);
            }else{

                this._volumeOff(idElemento);
            }
        }else{
            if(this._audioGlobalEstaMudo){
                this._volumeOn();
            }else{
                this._volumeOff();
            }
        }


    },
    /**
     * vai para o modo fullscreen do video
     *<br><b>Obs:</b>** muitos detalhes podem tornar isso inviável
     * @method goFullScreen
     *
     */
    goFullScreen: function() {

        var element = document.getElementById(this._idElementoAtual);
        if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        }
    },



    _volumeOff: function(idElemento){


        if(idElemento == undefined){
            this._audioGlobalEstaMudo = true;
            $('audio').each(function(){
                this.muted = true;
            });
            if(this._idElementoAtual!==""){
                this._mediaChannel.get(0).muted = true;
            }

        }else{
            this._audioLocalEstaMudo = true;
            $('#'+idElemento).get(0).muted = true;
        }

    },

    _volumeOn: function(idElemento){

        if(idElemento==undefined){
            this._audioGlobalEstaMudo = false;
            $('audio').each(function(){
                this.muted = false;
            });

            if(this._idElementoAtual!==""){
                this._mediaChannel.get(0).muted = false;
            }
            if(this._audioLocalEstaMudo){
                this._mediaChannel.get(0).muted = true;
            }

        }else{
            this._audioLocalEstaMudo= false;
            $('#'+idElemento).get(0).muted = false;
        }
    },
    /**
     * Toca a midia escolhida, caso tenha outra trilha de audio tocando, essa será pausada
     *
     * @method _playMedia
     * @param {String} elementId id do Audio
     */
    _playMedia: function(elementId){
        elementId.mediaGroup = null;

        if(this._idElementoAtual!= elementId){
            this._idElementoAtual = elementId;
            if(Object.keys(this._mediaChannel).length>0){
                //this._mediaChannel.get(0).currentTime  = 0;
                this._mediaChannel.get(0).pause();
            }
            this._mediaChannel = $('#'+elementId);
            if(this._audioGlobalEstaMudo){
                this._mediaChannel.get(0).muted = true;
            }else{
                this._mediaChannel.get(0).muted = false;
            }

            this._mediaChannel.currentTime = 0;
        }else{
            this._mediaChannel.get(0).pause();
            this._mediaChannel.get(0).currentTime  = 0;
        }
        
        console.log("Media é: "+this._mediaChannel.get(0).src);
        console.log("leng do media channel: "+this._mediaChannel.length);
        console.log("leng do media channel: "+this._mediaChannel[0]);
        console.log("leng do media channel: "+this._mediaChannel.get(0));
        this._mediaChannel[0]=this._mediaChannel.get(0);
        
        console.log("leng do media channel: "+this._mediaChannel.get(0));
        console.log(this._mediaChannel.get(0).src.type);
        var midiaatual = this._mediaChannel.get(0);
        console.log("Está mídia é do tipo: "+ midiaatual);
        /*
        if(midiaatual == "[object HTMLAudioElement]"){
            
            
            //console.log("midias "+ midias);
            var pathtoAudio = this._mediaChannel.get(0).src;
            /*
            var _mediaAudio = new Howl({
                //src: this._mediaChannel.get(0).src,                
                urls: [pathtoAudio],
                sprite: {
                        audio: [0, this.length],
    
                    },
            });
            */
            
/*
                this._mediaChannel[0] = new Howl({
                //src: this._mediaChannel.get(0).src,                
                urls: [this._mediaChannel.get(0).src],
                //format: 'audio/mpeg',
                //format: 'mp3',
                onend: function() {
                    console.log('acabou howl' + this);
                    console.log('acabou howl' + this.urls);
                    console.log('acabou howl' + this.urls.src);
                },
                onload: function() {
                    console.log('Carregou howl'+this);
                },
                onloaderror: function() {
                    console.log('Carregou hwol com errro '+this);
                },
                /*
                sprite: {
                        //audio: [0, this.length],
                        audio: [],
    
                    },
                  */  
    /*   
             })
            this._mediaChannel.get(0).play();
            //this._mediaAudio.play('audio');
            
            console.log("Objeto  é "+ this._mediaChannel.get(0));

        } else{
            */
            //var newAudio = new Audio();
            //newAudio.src = this._mediaChannel.get(0).src;
            //this._mediaChannel[0].src = newAudio.src;
            //console.log(this._mediaChannel.get(0));
            this._mediaChannel.get(0).play();
       // };

        
            //this._mediaChannel.get(0).play();
        




        /* Lib para tocar audios - Teste EDU 

        var sources;
        if (fwConfig.arquivos.medias.length) {
          var midias = fwConfig.arquivos.medias;
          for (var item in midias) {
            console.log(midias[item]);
            if (midias[item].id == elementId) {
              sources = midias[item].sources;
              break;
            }
          }
        }
        if (sources) {
          console.log(sources);
          var sfx = new Howl({
            urls: sources,
          });            
          sfx.play();
        }
        //*/

    },

    /**
     * Pausa o a mídia de áudio ou vídeo, caso não seja passado nenhum parâmetro pausa todas as mídias em reprodução
     *
     * @method pausar
     * @param {String} elementoID id do elemento
     */

    pausar:function(){
        this._mediaChannel.get(0).pause();
    },
    
    tocar:function(){
        this._mediaChannel.get(0).play();
    },



    /**
     * Botão de pause ou resume global, funciona como uma função pause que torna inoperável a tela quando o botão é pressionado
     * caso a função seja pra pausar ele seleciona todos os tweens e audios e pausa
     * caso contrario ele da resume em todos os elementos que estavam com um tempo > que 0 evitando a reprodução de elementos que não deveriam ser reproduzidos
     *
     * @method pauseResume
     */

    //pauseResume:function(){
        //var allTweens = TweenLite.getTweensOf('*');
        //var allTweens = window.TweenLite.getTweensOf('*');
        //console.log(allTweens);
        //allTweens[0].pause();
        //allTweens[1].pause();
        /*
        this._allTweens=TweenLite.getTweensOf("*");
        var that = this;
        /*try {
            if (this._isPauseGlobalAtivo) {
                try{
                    $('#menu-video').css('display','none');
                    $('.fw_modal_video_play').css('display','none');
                    $('.fw_modal_video_play').toggleClass('fw_off');
                    $( ".fw_btn_play" ).toggleClass( 'fw_off' );
                    TweenLite.set($('#lista_de_idiomas'),{height:'0px',marginTop:'-27px',opacity:0,paddingTop:'13px'})
                    $('audio, video').each(function (idx,obj) {
                        if (obj.currentTime < obj.duration && obj.currentTime>0) {
                            obj.play(); // Stop playing
                        }
                    });
                    if (this._isMediaAtualPausada) {
                        this._mediaChannel.get(0).pause();
                    } else if (that._idElementoAtual != ""&&this._mediaChannel.currentTime<this._mediaChannel.duration()) {

                        this._mediaChannel.get(0).play();
                    }
                }catch(ex){}
                tweenAnimation.play();
                for (var prop in this._allTweens) {
                    try {
                        this._allTweens[prop].play();
                    } catch (e) {
                    }
                }
            } else {
                
                
                try{
                    $('.fw_modal_video_play').toggleClass('fw_off');
                    $('.fw_modal_video_play').css('display','block');
                    $( ".fw_btn_play" ).toggleClass( 'fw_off' );
                    if (this._idElementoAtual != '') {
                        this.pausar();
                    }
                    $('audio, video').each(function (idx,obj) {
                        obj.pause();
                    });
                }catch(exception){}
                tweenAnimation.pause();
                for (var prop in this._allTweens) {
                    this._allTweens[prop].pause();

                }
            }
        } catch (e) {
        }
        this._isPauseGlobalAtivo = !this._isPauseGlobalAtivo;
        
    },

    continuaModal:function(){
        $('#principal').css('display','none');
        $('#secundaria').css('display','block');
    },
    /**
     * Mostra o ultimo modal do objeto, o usuario precisa chamar essa função caso ele queira que esse modal apareça
     *
     *
     * @method mostrarModalFinal
     */
/*
    pauseResume:function(){
        //var allTweens = window.TweenLite.getTweensOf('*');
        //allTweens[0].pause();
        //allTweens[1].pause();
        this._allTweens=TweenLite.getTweensOf("*");
        var that = this;
        try {
            if (this._isPauseGlobalAtivo) {
                try{
                    $('#menu-video').css('display','none');
                    $('.fw_modal_video_play').css('display','none');
                    $('.fw_modal_video_play').toggleClass('fw_off');
                    $( ".fw_btn_play" ).toggleClass( 'fw_off' );
                    TweenLite.set($('#lista_de_idiomas'),{height:'0px',marginTop:'-27px',opacity:0,paddingTop:'13px'})
                    $('audio, video').each(function (idx,obj) {
                        //if (obj.currentTime < obj.duration && obj.currentTime>0) {
                            //if(obj.mediaGroup!=="paused"){
                                obj.play(); // Stop playing

                                // 4620
                                // 5917,89


                                //obj.mediaGroup = null;
                            //} else{
                              //  console.log("Objeto audio: "+obj.id+"limpo do controle de pausa");
                                //obj.mediaGroup = null;
                            //}    
                        //}
                    });
                    if (this._isMediaAtualPausada) {
                        this._mediaChannel.get(0).pause();
                    } else if (that._idElementoAtual != ""&&this._mediaChannel.currentTime<this._mediaChannel.duration()) {

                        this._mediaChannel.get(0).play();
                    }
                }catch(ex){}
                tweenAnimation.play();
                //TimelineAnimation.play();
                for (var prop in this._allTweens) {
                    try {
                        this._allTweens[prop].play();
                    } catch (e) {
                    }
                }
            } else {
                try{
                    $('.fw_modal_video_play').toggleClass('fw_off');
                    $('.fw_modal_video_play').css('display','block');
                    $( ".fw_btn_play" ).toggleClass( 'fw_off' );
                    
                    $('audio, video').each(function (idx,obj) {
                        console.log("Objeto audio: "+obj.id);
                        
                        //if (obj.paused){
                          //  console.log("Objeto audio: "+obj.id+"já estava padado e deve ficar!");
//                            obj.mediaGroup="paused";
  //                      } else{
    //                        obj.mediaGroup=null;
                        obj.pause();
      //                  };
                    });
                    /*
                    if (this._idElementoAtual != '') {
                        this.pausar();
                    }
                    
                }catch(exception){}
                tweenAnimation.pause();
                //TimelineAnimation.pause();
                for (var prop in this._allTweens) {
                    this._allTweens[prop].pause();

                }
            }
        } catch (e) {
        }
        this._isPauseGlobalAtivo = !this._isPauseGlobalAtivo;
        console.log("contador: "+ prop)
    },
*/


    pauseResume:function(){

        this._allTweens=TweenLite.getTweensOf("*");
        var that = this;
        try {
            if (this._isPauseGlobalAtivo) {
                try{
                    $('#menu-video').css('display','none');
                    $('.fw_modal_video_play').css('display','none');
                    $('.fw_modal_video_play').toggleClass('fw_off');
                    $( ".fw_btn_play" ).toggleClass( 'fw_off' );
                    TweenLite.set($('#lista_de_idiomas'),{height:'0px',marginTop:'-27px',opacity:0,paddingTop:'13px'})
                    $('audio, video').each(function (idx,obj) {
                        if (obj.currentTime<obj.duration && obj.currentTime>0) {
                            obj.play(); // Stop playing
                        }
                    });
                    if (this._isMediaAtualPausada) {
                        this._mediaChannel.get(0).pause();
                    } else if (that._idElementoAtual != ""&&this._mediaChannel.currentTime<this._mediaChannel.duration()) {

                        this._mediaChannel.get(0).play();
                    }
                }catch(ex){}
                for (var prop in this._allTweens) {
                    try {
                        this._allTweens[prop].play();
                    } catch (e) {
                    }
                }
            } else {
                try{
                    $('.fw_modal_video_play').toggleClass('fw_off');
                    $('.fw_modal_video_play').css('display','block');
                    $( ".fw_btn_play" ).toggleClass( 'fw_off' );
                    if (this._idElementoAtual != '') {
                        this.pausar();
                    }
                    $('audio, video').each(function (idx,obj) {
                        obj.pause();
                    });
                }catch(exception){}
                for (var prop in this._allTweens) {


                    this._allTweens[prop].pause();

                }
            }
        } catch (e) {
        }
        this._isPauseGlobalAtivo = !this._isPauseGlobalAtivo;
    },
//-------------------------------------------------

    continuaModal:function(){
        $('#principal').css('display','none');
        $('#secundaria').css('display','block');
    },
    
    mostrarModalFinal:function(){
        $("#content").append(
            '<div id="modal" class="modal_final">' +
                '<div id="secundaria" class="modal_final"><p>'+this._segundoTextoModalFinal +
                '</p>' +
                '</div>' +
                '<div id="principal" class="modal_final"><p>'+this._primeiroTextoModalFinal+'</p>' +
                '<button onclick="oeds.continuaModal()">Ok</button></div>' +
                '' +
                '</div>')
    }

};
/**
 * propriedade usada para fazer com que eventos de touchscreen funcionem adequadamente por causa do resize dinâmico da tela
 *
 * @private
 * @property _fwProporcaoTela
 */

var _fwProporcaoTela = 1;

/**
 * método que cuida da execução dos eventos de touch
 * <br><b>Obs:</b>**  houve alguns problemas na utilização dele dentro do escopo oeds, acredito que essa não seja a melhor forma porém foi a mais rápida para o momento, o ideal seria deixá-lo dentro de oeds, e não global
 *
 * @private
 * @method _touchHandler

 */
function _touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");

    simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null
    );

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}
 /**
 * adiciona os listeners em todos os botões do player, tratando tratando o comportamento de cada um deles de acordo com a sua funcionalidade
 * o hover dos botões está no formato de classe para evitar alguns conflitos que ocorreram no ipad por causa do :hover
 * <br><b>Obs:</b>**  houve alguns problemas na utilização dele dentro do escopo oeds, acredito que essa não seja a melhor forma porém foi a mais rápida para o momento, o ideal seria deixá-lo dentro de oeds, e não global
 *
 * @private
 * @method _addListeners

 */
function _addListeners() {
    /* Hide Chrome's annoying text-select-on-drag cursor */
    document.onselectstart = function () {
        return false;
    };

    /* Bind touch events to the magical script up there */
    document.getElementById('seekbar').addEventListener("touchstart", _touchHandler, true);
    document.getElementById('seekbar').addEventListener("touchmove", _touchHandler, true);
    document.getElementById('seekbar').addEventListener("touchend", _touchHandler, true);
    document.getElementById('seekbar').addEventListener("touchcancel", _touchHandler, true);

    /* Bind mouse events */
    document.getElementById('seekbar').addEventListener('mousedown', _mouseDown, false);
    document.getElementById('seekbar').addEventListener('mousedown', _divMove, true);
    document.getElementById('play-pause').addEventListener('touchend',_touchHandler,true);
    document.getElementById('play-pause').addEventListener('mouseup', function(){
        $(this).removeClass('hover');
        oeds.pauseResume();
    }, true);
    document.getElementById('fw_btn_legenda').addEventListener('touchend',_touchHandler,true);
    document.getElementById('fw_btn_legenda').addEventListener('mouseup', function(){
        $(this).removeClass('hover');
        oeds.legendaAPI.ligaDesligaLegenda();
    }, true);
    document.getElementById('fw_btn_mute').addEventListener('touchend',_touchHandler,true);
    document.getElementById('fw_btn_mute').addEventListener('mouseup', function(){
        $(this).removeClass('hover');
        oeds.volumeOnOff();
    }, true);
    $('.fw_btn_menu').mouseenter(function(){
        $(this).addClass('hover')
    });
    $('#video-control .tooltips').each(function(idx,obj){

        $('#'+obj.id).mouseenter(function(){
            $('#'+obj.id).addClass('hover');
        });
        $('#'+obj.id).mouseleave(function(){
            $('#'+obj.id).removeClass('hover');
        });
    })
    $('#menu-video li').each(function(){
        $(this).mouseenter(function(){
            $(this).addClass('hover');
        })
        $(this).mouseleave(function(){
            $(this).removeClass('hover');
        })
    });

    $('#init-menu').mouseenter(function(){
        $(this).addClass('hover');
    }).mouseleave(function(){
            $(this).removeClass('hover');
        })


    window.addEventListener('mouseup', _mouseUp, false);
}
/**
 * remove divmove da window, evitando que o tracking continue sendo executado depois do clique
 * <br><b>Obs:</b>**   houve alguns problemas na utilização dele dentro do escopo oeds, acredito que essa não seja a melhor forma porém foi a mais rápida para o momento, o ideal seria deixá-lo dentro de oeds, e não global
 *
 * @private
 * @method _mouseUp

 */

function _mouseUp() {
    window.removeEventListener('mousemove', _divMove, true);
}
/**
 * define o que deve ocorrer quando abaixa o botão do mouse
 * <br><b>Obs:</b>**    houve alguns problemas na utilização dele dentro do escopo oeds, acredito que essa não seja a melhor forma porém foi a mais rápida para o momento, o ideal seria deixá-lo dentro de oeds, e não global
 * @private
 * @method _mouseDown

 */
function _mouseDown(e) {
    window.addEventListener('mousemove', _divMove, true);
}

/**
 * função que realiza o tracking da barra de progresso, usada para  identificar o que deve ser feito com a barra e com o vídeo
 * <br><b>Obs:</b>** houve alguns problemas na utilização dele dentro do escopo oeds, acredito que essa não seja a melhor forma porém foi a mais rápida para o momento, o ideal seria deixá-lo dentro de oeds, e não global
 * @private
 * @method _divMove

 */
function _divMove(e) {
    var div = document.getElementById('playbar'); //Set this to the play bar
    var scrubber = document.getElementById('scrubber');
    var offset = 203;

    var maxWidth = 550;

    /* Percentage calc */

    var qtdDeProgresso= ((e.clientX/_fwProporcaoTela)-(offset));

    div.style.width = qtdDeProgresso+ 'px';
    oeds._mediaChannel.get(0).currentTime = qtdDeProgresso*oeds._mediaChannel.get(0).duration/maxWidth;
    oeds.legendaAPI._controlaLegendas(qtdDeProgresso*oeds._mediaChannel.get(0).duration/maxWidth);
    if(qtdDeProgresso>(maxWidth-5)){
        scrubber.style.left = maxWidth-10+'px';
    }else{
        scrubber.style.left = div.style.width;
    }
}

$(document).ready(function () {
    //Increment the idle time counter every minute.
    var idleInterval = setInterval(timerIncrement, 4000); // 1 minute

    //Zero the idle timer on mouse movement.

});
/**
 * função para identificar o tempo de inatividade na peça para definir se a barra de controles deve permanecer ativa ou deve ser removida.
 * <br><b>Obs:</b>**  houve alguns problemas na utilização dele dentro do escopo oeds, acredito que essa não seja a melhor forma porém foi a mais rápida para o momento, o ideal seria deixá-lo dentro de oeds, e não global
 *
 * @private
 * @method timerIncrement
 */

function timerIncrement() {
    fwIdleTime++;
    if (fwIdleTime > 1) { // 20 minutes
        oeds._abaixarBarraDeControles();
    }
}
