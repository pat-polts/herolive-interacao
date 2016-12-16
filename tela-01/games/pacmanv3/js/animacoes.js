/**
 * Created by ABarbosa on 27/01/2015.
 */
var animacoes = [
    {
        tempoInicial:'00:00,00',
        executeAnimacao:function(){
            TweenLite.to($('#content'),1, {
                y: 60,
                ease: 'easeOutQuart'
            })
        }
    },
    {
        tempoInicial:'00:02,40',
        executeAnimacao:function(){
            TweenLite.to($('#content'),1, {
                y: 200,
                ease: 'easeOutQuart'
            })
        }
    },
    {
        tempoInicial:'00:03,40',
        executeAnimacao:function(){
            TweenLite.to($('#video-control'),1, {
                y: -200,
                x: 150,
                ease: 'easeOutQuart'
            });

            TweenLite.to($('#base'),1, {
                y: -300,
                x: 300,
                ease: 'easeOutQuart'
            })
        }
    }
];