"use strict";

function geronimo() {
/* ----- Variaveis Globais ---------------------------------------- */
	var canvas;
	var joystick;
	var context;
	var game;
	var canvas_walls, context_walls;

	var mapConfig = "data/map.json";


	/* AJAX */
	
	function buildWall(context,gridX,gridY,width,height) {
		console.log("BuildWall");
		width = width*2-1;
		height = height*2-1;
		context.fillRect(pacman.radius/2+gridX*2*pacman.radius,pacman.radius/2+gridY*2*pacman.radius, width*pacman.radius, height*pacman.radius);
	}
	
	function between(x, min, max) {
		return x >= min && x <= max;
	}

	// Logger
	var logger = function() {
	    var oldConsoleLog = null;
	    var pub = {};

	    pub.enableLogger =  function enableLogger() 
	                        {
	                            if(oldConsoleLog === null)
	                                return;

	                            window['console']['log'] = oldConsoleLog;
	                        };

	    pub.disableLogger = function disableLogger()
	                        {
	                            oldConsoleLog = console.log;
	                            window['console']['log'] = function() {};
	                        };

	    return pub;
	}();

	// parar relogio para medir o tempo
	function Timer() {
		this.time_diff = 0;
		this.time_start = 0;
		this.time_stop = 0;
		this.start = function() {
			this.time_start = new Date().getTime();
		}
		this.stop = function() {
			this.time_stop = new Date().getTime();
			this.time_diff += this.time_stop - this.time_start;
			this.time_stop = 0;
			this.time_start = 0;
		}
		this.reset = function() {
			this.time_diff = 0;
			this.time_start = 0;
			this.time_stop = 0;
		}
		this.get_time_diff = function() {
			return this.time_diff;
		}
	}
	
	// "IDDQD do Game"
	function Game() {
		this.timer = new Timer();
		this.refreshRate = 33;		// velocidade do refresh
		this.running = false;
		this.pause = true;
		this.score = new Score();
		this.soundfx = 0;
		this.map;
		this.monsters;
		this.level = 1;
		this.refreshLevel = function(h) {
			$(h).html("Lvl: "+this.level);
		};
		this.gameOver = false;
		this.canvas = $("#myCanvas").get(0);
		this.wallColor = "Blue";
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		/* Funcoes do jogo ("IDKFA do game") */
		this.getMapContent = function (x, y) {
			var maxX = game.width / 30 -1;
			var maxY = game.height / 30 -1;
			if (x < 0) x = maxX + x;
			if (x > maxX) x = x-maxX;
			if (y < 0) y = maxY + y;
			if (y > maxY) y = y-maxY;
			return this.map.posY[y].posX[x].type;
		};

		this.setMapContent = function (x,y,val) {
			this.map.posY[y].posX[x].type = val;
		};
		
		this.toggleSound = function() { 
			this.soundfx === 0 ? this.soundfx = 1 : this.soundfx = 0; 
			$('#mute').toggle();
			};

		this.reset = function() {
			};

		this.newGame = function() {
		    var r = confirm("Quer jogar novamente?");
            if (r) {
        	    console.log("new Game");
                this.init(0);
                this.pauseResume();
            }
		};

		this.nextLevel = function() {
			this.level++;
            console.log("Level "+game.level);
			game.showMessage("Nivel "+game.level, this.getLevelTitle() + "<br/>(Clique para começar!)");
			game.refreshLevel(".level");
			this.init(1);
		};

		this.drawHearts = function (count) {
			var html = "";
			for (var i = 0; i<count; i++) {
				html += " <img src='img/heart.png'>";
				}
			$(".lives").html("Lives: "+html);
			
		};

		this.showContent = function (id) {
			$('.content').hide();
			$('#'+id).show();
		};

		this.getLevelTitle = function() {
			switch(this.level) {
				case 2:
					return '"Vamos nessa!"';
				case 3:
					return '"Mais uma!"';
				case 4:
					return '"Ultima Fase!"';
				default:
					return '"Nada de novo..."';
			}
		}

		this.showMessage = function(title, text) {
			this.timer.stop();
			this.pause = true;
			$('#canvas-overlay-container').fadeIn(200);
			if ($('.controls').css('display') != "none") $('.controls').slideToggle(200);
			$('#canvas-overlay-content #title').text(title);
			$('#canvas-overlay-content #text').html(text);
		};

		this.closeMessage = function() {
			$('#canvas-overlay-container').fadeOut(200);
			$('.controls').slideToggle(200);
		};

		this.pauseResume = function () {
			if (!this.running) {
				// inicia timer
				this.timer.start();

				this.pause = false;
				this.running = true;
				this.closeMessage();
				animationLoop();
			}
			else if (this.pause) {
				// para timer
				this.timer.stop();

				this.pause = false;
				this.closeMessage();
				}
			else {
				this.showMessage("Pausado","Clique para Continuar");
				}
			};

		this.init = function (state) {
			
			console.log("init game "+state);

			// reseta timer para reiniciar
			if( state === 0 ) {
                this.timer.reset();
			}
			
			// pega mapa da fase
			$.ajax({
				url: mapConfig,
				async: false,
				 beforeSend: function(xhr){
					if (xhr.overrideMimeType) xhr.overrideMimeType("application/json"); 
				},
				dataType: "json",
				success: function (data) {
					game.map =  data;
				}
			});

			if (state === 0) {
				this.score.set(0);
				this.score.refresh(".score");
				pacman.lives = 3;
				game.level = 1;
				this.refreshLevel(".level");
				game.gameOver = false;
				}
			pacman.reset();

			game.drawHearts(pacman.lives);	

		};

		this.win = function () {};
		this.gameover = function () {};

		this.toPixelPos = function (gridPos) {
			return gridPos*30;
		};

		this.toGridPos = function (pixelPos) {
			return ((pixelPos % 30)/30);
		};

		/* ------------ Comeca a preconstruir paredes  ------------ */
		this.buildWalls = function() {
			game.wallColor = "Blue";
			
			canvas_walls = document.createElement('canvas');
			canvas_walls.width = game.canvas.width;
			canvas_walls.height = game.canvas.height;
			context_walls = canvas_walls.getContext("2d");

			context_walls.fillStyle = game.wallColor;
			context_walls.strokeStyle = game.wallColor;
			
			//horizontal de fora
			buildWall(context_walls,0,0,18,1);
			buildWall(context_walls,0,12,18,1);
			
			// vertical de fora
			buildWall(context_walls,0,0,1,6);
			buildWall(context_walls,0,7,1,6);
			buildWall(context_walls,17,0,1,6);
			buildWall(context_walls,17,7,1,6);
			
			// single blocks
			buildWall(context_walls,4,0,1,2);
			buildWall(context_walls,13,0,1,2);
			
			buildWall(context_walls,2,2,1,2);
			buildWall(context_walls,6,2,2,1);
			buildWall(context_walls,15,2,1,2);
			buildWall(context_walls,10,2,2,1);
			
			buildWall(context_walls,2,3,2,1);
			buildWall(context_walls,14,3,2,1);
			buildWall(context_walls,5,3,1,1);
			buildWall(context_walls,12,3,1,1);
			buildWall(context_walls,3,3,1,3);
			buildWall(context_walls,14,3,1,3);
			
			buildWall(context_walls,3,4,1,1);
			buildWall(context_walls,14,4,1,1);
			
			buildWall(context_walls,0,5,2,1);
			buildWall(context_walls,3,5,2,1);
			buildWall(context_walls,16,5,2,1);
			buildWall(context_walls,13,5,2,1);
			
			buildWall(context_walls,0,7,2,2);
			buildWall(context_walls,16,7,2,2);
			buildWall(context_walls,3,7,2,2);
			buildWall(context_walls,13,7,2,2);
			
			buildWall(context_walls,4,8,2,2);
			buildWall(context_walls,12,8,2,2);
			buildWall(context_walls,5,8,3,1);
			buildWall(context_walls,10,8,3,1);
			
			buildWall(context_walls,2,10,1,1);
			buildWall(context_walls,15,10,1,1);
			buildWall(context_walls,7,10,4,1);
			buildWall(context_walls,4,11,2,2);
			buildWall(context_walls,12,11,2,2);
			/* ------------ fim da construcao das paredes  ------------ */
		};

	}

	game = new Game();



	function Score() {
		this.score = 0;
		this.set = function(i) {
			this.score = i;
		};
		this.add = function(i) {
			this.score += i;
		};
		this.refresh = function(h) {
			$(h).html("Score: "+this.score);
		};
		
	}
	
	
	
	// audio do game
	var Sound = {};
	Sound.play = function (sound) {
		if (game.soundfx == 1) {
			var audio = document.getElementById(sound);
			(audio !== null) ? audio.play() : console.log(sound+" not found");
			}
	};
	
	
	// Direcao do objeto na notacao do Constructor
	function Direction(name,angle1,angle2,dirX,dirY) {
		this.name = name;
		this.angle1 = angle1;
		this.angle2 = angle2;
		this.dirX = dirX;
		this.dirY = dirY;
		this.equals = function(dir) {
			return  JSON.stringify(this) ==  JSON.stringify(dir);
		};
	}
	
	// Objetos das direcoes
	var up = new Direction("up",1.75,1.25,0,-1);		// cima
	var left = new Direction("left",1.25,0.75,-1,0);	// esquerda
	var down = new Direction("down",0.75,0.25,0,1);		// baixo
	var right = new Direction("right",0.25,1.75,1,0);	// direita

	// DirectionWatcher
	function directionWatcher() {
		this.dir = null;
		this.set = function(dir) {
			this.dir = dir;
		};
		this.get = function() {
			return this.dir;
		};
	}
	
	// Super Classe do Pacman
	function Figure() {
		this.posX;
		this.posY;
		this.speed;
		this.dirX = right.dirX;
		this.dirY = right.dirY;
		this.direction;
		this.stop = true;
		this.directionWatcher = new directionWatcher();
		this.getNextDirection = function() { console.log("Figure getNextDirection");};
		this.checkDirectionChange = function() {
			if (this.inGrid() && (this.directionWatcher.get() == null)) this.getNextDirection();
			if ((this.directionWatcher.get() != null) && this.inGrid()) {
				//console.log("changeDirection to "+this.directionWatcher.get().name);
				this.setDirection(this.directionWatcher.get());
				this.directionWatcher.set(null);
			}
			
		}
	
		
		this.inGrid = function() {
			if((this.posX % (2*this.radius) === 0) && (this.posY % (2*this.radius) === 0)) return true;
			return false;
		}
		this.getOppositeDirection = function() {
			if (this.direction.equals(up)) return down;
			else if (this.direction.equals(down)) return up;
			else if (this.direction.equals(right)) return left;
			else if (this.direction.equals(left)) return right;
		}
		this.move = function() {
		
			if (!this.stop) {
				this.posX += this.speed * this.dirX;
				this.posY += this.speed * this.dirY;
				
				// Check if out of canvas
				if (this.posX >= game.width-this.radius) this.posX = this.speed-this.radius;
				if (this.posX <= 0-this.radius) this.posX = game.width-this.speed-this.radius;
				if (this.posY >= game.height-this.radius) this.posY = this.speed-this.radius;
				if (this.posY <= 0-this.radius) this.posY = game.height-this.speed-this.radius;
				}
			}
		this.stop = function() { this.stop = true;}
		this.start = function() { this.stop = false;}
		
		this.getGridPosX = function() {
			return (this.posX - (this.posX % 30))/30;
		}
		this.getGridPosY = function() {
			return (this.posY - (this.posY % 30))/30;
		}
		this.setDirection = function(dir) {			
			this.dirX = dir.dirX;
			this.dirY = dir.dirY;
			this.angle1 = dir.angle1;
			this.angle2 = dir.angle2;
			this.direction = dir;
		}
		this.setPosition = function(x, y) {
			this.posX = x;
			this.posY = y;
		}
	}
	
	function pacman() {
		this.radius = 15;
		this.posX = 0;
		this.posY = 6*2*this.radius;
		this.speed = 5;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.mouth = 1; /* boca aberta ou fechada */
		this.dirX = right.dirX;
		this.dirY = right.dirY;
		this.lives = 3;
		this.stuckX = 0;
		this.stuckY = 0;
		this.frozen = false;		// para animacao de morte
		this.freeze = function () {
			this.frozen = true;
		}
		this.unfreeze = function() {
			this.frozen = false;
		}
		this.getCenterX = function () {
			return this.posX+this.radius;
		}
		this.getCenterY = function () {
			return this.posY+this.radius;
		}
		this.directionWatcher = new directionWatcher();
		
		this.direction = right;
		
		this.checkCollisions = function () {
			
			if ((this.stuckX == 0) && (this.stuckY == 0) && this.frozen == false) {
				
				// posicao do Pac no grid
				var gridX = this.getGridPosX();
				var gridY = this.getGridPosY();
				var gridAheadX = gridX;
				var gridAheadY = gridY;
				
				var field = game.getMapContent(gridX, gridY);

				// proximo ponto para checar colisao
				if ((this.dirX == 1) && (gridAheadX < 17)) gridAheadX += 1;
				if ((this.dirY == 1) && (gridAheadY < 12)) gridAheadY += 1;
				var fieldAhead = game.getMapContent(gridAheadX, gridAheadY);
				
				/*	checagem de colisao com a parede */
				if ((fieldAhead === "wall") || (fieldAhead === "door")) {
					this.stuckX = this.dirX;
					this.stuckY = this.dirY;
					pacman.stop();
					// sai da parede
					if ((this.stuckX == 1) && ((this.posX % 2*this.radius) != 0)) this.posX -= 5;
					if ((this.stuckY == 1) && ((this.posY % 2*this.radius) != 0)) this.posY -= 5;
					if (this.stuckX == -1) this.posX += 5;
					if (this.stuckY == -1) this.posY += 5;
				}
				
			}
		}
		this.checkDirectionChange = function() {
			if (this.directionWatcher.get() != null) {

				if ((this.stuckX == 1) && this.directionWatcher.get() == right) this.directionWatcher.set(null);
				else {
					// resete dos pontos de travado
					this.stuckX = 0;
					this.stuckY = 0;
					

					// permite mudanca de direcao apenas no grid
					if ((this.inGrid())) {

						// checagem se eh possivel mudar de direcao sem ficar travado
						console.log("x: "+this.getGridPosX()+" + "+this.directionWatcher.get().dirX);
						console.log("y: "+this.getGridPosY()+" + "+this.directionWatcher.get().dirY);
						var x = this.getGridPosX()+this.directionWatcher.get().dirX;
						var y = this.getGridPosY()+this.directionWatcher.get().dirY;
						if (x <= -1) x = game.width/(this.radius*2)-1;
						if (x >= game.width/(this.radius*2)) x = 0;
						if (y <= -1) x = game.height/(this.radius*2)-1;
						if (y >= game.heigth/(this.radius*2)) y = 0;

						console.log("x: "+x);
						console.log("y: "+y);
						var nextTile = game.map.posY[y].posX[x].type;
						console.log("checkNextTile: "+nextTile);

						if (nextTile != "wall") {
							this.setDirection(this.directionWatcher.get());
							this.directionWatcher.set(null);
						}
					}
				}
			}
		}
		this.setDirection = function(dir) {
			if (!this.frozen) {
				this.dirX = dir.dirX;
				this.dirY = dir.dirY;
				this.angle1 = dir.angle1;
				this.angle2 = dir.angle2;
				this.direction = dir;
			}
		}

		this.move = function() {
		
			if (!this.frozen) {
				
				this.posX += this.speed * this.dirX;
				this.posY += this.speed * this.dirY;
				
				// Checagem se saiu do canvas
				if (this.posX >= game.width-this.radius) this.posX = 5-this.radius;
				if (this.posX <= 0-this.radius) this.posX = game.width-5-this.radius;
				if (this.posY >= game.height-this.radius) this.posY = 5-this.radius;
				if (this.posY <= 0-this.radius) this.posY = game.height-5-this.radius;
			}
			else this.dieAnimation();
		}
		
		this.eat = function () {
		
			if (!this.frozen) {
				if (this.dirX == this.dirY == 0) {
				
					this.angle1 -= this.mouth*0.07;
					this.angle2 += this.mouth*0.07;
					
					var limitMax1 = this.direction.angle1;
					var limitMax2 = this.direction.angle2;
					var limitMin1 = this.direction.angle1 - 0.21;
					var limitMin2 = this.direction.angle2 + 0.21;
						
					if (this.angle1 < limitMin1 || this.angle2 > limitMin2)
					{
						this.mouth = -1;
					}
					if (this.angle1 >= limitMax1 || this.angle2 <= limitMax2)
					{
						this.mouth = 1;
					}
				}
			}
		}
		this.stop = function() {
			this.dirX = 0;
			this.dirY = 0;
		}
		this.reset = function() {
			this.unfreeze();
			this.posX = 0;
			this.posY = 6*2*this.radius;
			this.setDirection(right);
			this.stop();
			this.stuckX = 0;
			this.stuckY = 0;
			//console.log("reset pacman");
		}
		this.dieAnimation = function() {
			this.angle1 += 0.05;
			this.angle2 -= 0.05;
			if (this.angle1 >= this.direction.angle1+0.7 || this.angle2 <= this.direction.angle2-0.7) {
				this.dieFinal();
				}
		}
		this.die = function() {
			Sound.play("die");
			this.freeze();
			this.dieAnimation();
			}
		this.dieFinal = function() {
			this.reset();
			pinky.reset();
			inky.reset();
			blinky.reset();
			clyde.reset();
    		this.lives--;
	        console.log("pacman died, "+this.lives+" lives left");
	    	if (this.lives <= 0) {
				game.gameOver = true;
				}
			game.drawHearts(this.lives);
		}
		this.getGridPosX = function() {
			return (this.posX - (this.posX % 30))/30;
		}
		this.getGridPosY = function() {
			return (this.posY - (this.posY % 30))/30;
		}
	}
	pacman.prototype = new Figure();
	var pacman = new pacman();
	game.buildWalls();

	
// Checar se ha novo cache da aplicacao a ser carregado
function checkAppCache() {
	console.log('check AppCache');
	window.applicationCache.addEventListener('updateready', function(e) 
	{
		console.log("AppCache: updateready");
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {

			// Browser baixou nova versao
			// Pedir para trocar
			window.applicationCache.swapCache();
			if (confirm('Uma nova versão está disponível, deseja recarregar?')) {
				window.location.reload();
			}

		} else {
		// Manifest nao mudou. Nada novo no servidor.
		}
	}, false);
	
	window.applicationCache.addEventListener('cached', function(e) 
	{
		console.log("AppCache: cached");
	}, false);
    
}

	
	// Acoes:
	
	function hideAdressbar() {
		console.log("hide adressbar");
		$("html").scrollTop(1);
		$("body").scrollTop(1);
	}
	
	$(document).ready(function() {	
	
		$.ajaxSetup({ mimeType: "application/json" });
		
		$.ajaxSetup({beforeSend: function(xhr){
			if (xhr.overrideMimeType){
				xhr.overrideMimeType("application/json");
				}
			}
		});
		
		// Esconder barra de enderecos
		hideAdressbar();
		
		if (window.applicationCache != null) checkAppCache();
		
		// --------------- Controles
		
		
		// Teclado
		window.addEventListener('keydown',doKeyDown,true);
		
		$('#canvas-container').click(function() {
			if (!(game.gameOver == true))	game.pauseResume();
		});

		$('body').on('click', '#score-submit', function(){
			console.log("submit highscore pressed");
			if ($('#playerName').val() === "" || $('#playerName').val() === undefined) {
				$('#form-validater').html("Please enter a name<br/>");
			} else {
				$('#form-validater').html("");
				addHighscore();
			}
		});

		$('body').on('click', '#show-highscore', function(){
			game.showContent('highscore-content');
			getHighscore();
		});

		Hammer('.container').on("swiperight", function(event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(right);
				}
		});
		Hammer('.container').on("swipeleft", function(event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(left);
			}
		});
		Hammer('.container').on("swipeup", function(event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(up);
			}
		});
		Hammer('.container').on("swipedown", function(event) {
			if ($('#game-content').is(":visible")) {
				event.gesture.preventDefault();
				pacman.directionWatcher.set(down);
			}
		});
		
		// Menu
		$(document).on('click','.button#newGame',function(event) {
			game.newGame();
		});
		// back button
		$(document).on('click','.button#back',function(event) {
			game.showContent('game-content');
		});
		// toggleSound
		$(document).on('click','.controlSound',function(event) {
			game.toggleSound();
		});
		// get latest
		$(document).on('click', '#updateCode', function(event) {
			console.log('check for new version');
			event.preventDefault();
			window.applicationCache.update(); 
		});

		canvas = $("#myCanvas").get(0);
		context = canvas.getContext("2d");

            
 
		/* --------------- INICIALIZACAO ------------------------------------ */
		
		game.init(0);
		logger.disableLogger();
		
		renderContent();
		});
		
		function renderContent()
		{
			// Refresh Score
			game.score.refresh(".score");
						
			// Paredes
			context.drawImage(canvas_walls, 0, 0);
			
			
			if (game.running == true) {
				
				// Pac Man
				context.beginPath();
				context.fillStyle = "Yellow";
				context.strokeStyle = "Yellow";
				context.arc(pacman.posX+pacman.radius,pacman.posY+pacman.radius,pacman.radius,pacman.angle1*Math.PI,pacman.angle2*Math.PI);
				context.lineTo(pacman.posX+pacman.radius, pacman.posY+pacman.radius);
				context.stroke();
				context.fill();
			}
			
		}
		
		function renderGrid(gridPixelSize, color)
		{
			context.save();
			context.lineWidth = 0.5;
			context.strokeStyle = color;
			
			// linhas horizontais
			for(var i = 0; i <= canvas.height; i = i + gridPixelSize)
			{
				context.beginPath();
				context.moveTo(0, i);
				context.lineTo(canvas.width, i);
				context.closePath();
				context.stroke();
			}
			
			// linhas verticais
			for(var i = 0; i <= canvas.width; i = i + gridPixelSize)
			{
				context.beginPath();
				context.moveTo(i, 0);
				context.lineTo(i, canvas.height);
				context.closePath();
				context.stroke();
			}
			
			context.restore();
		}
		
		function animationLoop()
		{
			canvas.width = canvas.width;

			renderContent();
			
			if (game.dieAnimation == 1) pacman.dieAnimation();
			if (game.pause != true){
				// alteracoes antes do proximo loop
				pacman.move();
				pacman.eat();
				pacman.checkDirectionChange();
				pacman.checkCollisions();		// ultimo metodo do pacman sempre

			}
			
			setTimeout(animationLoop, game.refreshRate);
			
		}


	
	function doKeyDown(evt){
	
		switch (evt.keyCode)
			{
			case 38:	// Flecha cima
				evt.preventDefault();
			case 87:	// W
				pacman.directionWatcher.set(up);
				break;
			case 40:	// Flecha pra baixo
				evt.preventDefault();
			case 83:	// S
				pacman.directionWatcher.set(down);
				break;
			case 37:	// Flecha da esquerda
				evt.preventDefault();
			case 65:	// A
				pacman.directionWatcher.set(left);
				break;
			case 39:	// Flecha direita
				evt.preventDefault();
			case 68:	// D
				pacman.directionWatcher.set(right);
				break;
			case 78:	// N (novo jogo)
				game.pause = 1;
				game.newGame();
				break;
			case 77:	// M (som/mute)
				game.toggleSound();
				break;
			case 32:	// Espaço (pause)
                evt.preventDefault();
				if (!(game.gameOver == true) 
					&& $('#game-content').is(':visible')
					)	game.pauseResume();
				break;
			}
		}
}

geronimo();