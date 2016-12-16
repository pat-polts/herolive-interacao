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

			$("#end").on("click", function(e){
				$(".grafico").hide();
				$(".interacao").hide();
			    $("#end").hide();  
			    $("#tab-abas").hide();
			    $("#start").show();
           		$("#video-control").css('display','block');
                $("#legenda").css('display','block'); 
                $(".fw_btn_menu").show(); 

				$('#content').find('video').get(0).currentTime = 0;
				$('#content').find('video').get(0).play();
			});

			$(".close").on("click", function(e){
			 	$('.interacao').hide();
				$('#content').find('video').get(0).play();
			});

});