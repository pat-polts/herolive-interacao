$(function(){ 

			$("#start").on("click", function(e){
				$(".interacao").hide();
				$(".interacao").show();

				setInterval(function(){
					var currentT = Math.round($('#content').find('video').get(0).currentTime);
					if(currentT >=95){
						$("#grafico-1").hide();
						$("#grafico-2").show();
					}else if(currentT >=182){
						$("#grafico-2").hide();
						$("#grafico-3").show();

					}else{
						$("#grafico-1").show();
					}

				},500);
 
				
		});


			$("#start2").on("click", function(e){
				$(".interacao").hide(); 
				$(".interacao").show(); 

				setInterval(function(){
					var currentT =  Math.round($('#content').find('video').get(0).currentTime);
					if(currentT < 95){
						$("#grafico-2").hide();
						$("#grafico-1").show();
					}else if(currentT >= 180){
						$("#grafico-2").hide();
						$("#grafico-3").show();

					}else{
						$("#grafico-2").show();
					}

				},500);
			});
			$("#start3").on("click", function(e){
				$(".interacao").hide();
				$(".interacao").show();

				setInterval(function(){
					var currentT =  Math.round($('#content').find('video').get(0).currentTime);
					if(currentT < 95){
						$("#grafico-3").hide();
						$("#grafico-1").show();
					}else if(currentT >= 95 && currentT <= 179){
						$("#grafico-3").hide();
						$("#grafico-2").show();

					}else{
						$("#grafico-3").show();
					}

				},500);

			});
			$(".close").on("click", function(e){
			 	$('.interacao').hide();
			});

});