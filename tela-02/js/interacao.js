$(function(){ 

			$("#start").on("click", function(e){
				$(".grafico").hide();
				$(".interacao").show();

				$('#content').find('video').get(0).pause();
				
				$("#grafico-1").show(); 
 				
			});

			$("#start2").on("click", function(e){
				$(".grafico").hide();
				$(".interacao").show();

				$('#content').find('video').get(0).pause();
				
				$("#grafico-2").show(); 
			});

			$("#start3").on("click", function(e){
				$(".grafico").hide();
				$(".interacao").show();

				$('#content').find('video').get(0).pause();
				
				$("#grafico-3").show(); 
			});

			$(".close").on("click", function(e){
			 	$('.interacao').hide();
				$('#content').find('video').get(0).play();
			});

});