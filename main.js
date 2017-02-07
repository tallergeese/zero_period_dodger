var game = null;

$(document).ready(initializeGame);

function initializeGame(){
	game = new DodgerGame();
	game.initialize('#gameArea');
}

function DodgerGame(){
	this.currentPlayer = null;
	this.fallers = [];
	this.domElement = null;
	this.playerAreaDomElement = null;
	this.gameIsRunning = true;
	this.playerAreaStats = null;
	this.gameSettings = {
		fallerSettings:{
			minSpeed: 20,
			maxSpeed: 100
		}
	};
	this.initialize = function(domElement){
		if(domElement === undefined){
			console.error('must provide an element to attach gameplay to');
		}
		this.domElement = $(domElement);
		this.createPlayerArea();
		this.getPlayerAreaStats();
		this.createPlayer();
		this.attachKeyboardHandlers();
	}
	this.getRandom = function(min,max){
		if(Array.isArray(min)){
			var data = min;
			min = 0;
			max = data.length;
		}
		if(max===undefined){
			max = min;
			min = 0;
		}
		return data ? data[Math.floor(Math.random()*(max-min))+min] : Math.floor(Math.random()*(max-min))+min;
	}
	this.createFaller = function(fallerClasses){
		if(fallerClasses!==undefined){
			this.gameSettings.fallerSettings.fallerClasses = fallerClasses;
		} else if(this.gameSettings.fallerSettings.fallerClasses===undefined) {
			console.error('must supply at least one class as an array to this method');
			return;
		}
		var newFaller = new Faller(this);
		this.fallers.push(newFaller);
		var randomSpeed = this.getRandom(this.gameSettings.fallerSettings.minSpeed,this.gameSettings.fallerSettings.maxSpeed);
		var randomClass = this.getRandom(this.gameSettings.fallerSettings.fallerClasses);
		var fallerDomElement = newFaller.initialize({
			speed: randomSpeed,
			additionalClasses: randomClass
		});
		var gameWidth = this.domElement.width();
		var randomX = this.getRandom(gameWidth);
		//TODO: check out reason all squares are red
		fallerDomElement.css({
			left: randomX+'px',
			top: '0px',
		});
		this.domElement.append(fallerDomElement);
	}
	this.removeFaller = function(faller){
		var fallerIndex = this.fallers.indexOf(faller);
		this.fallers.splice(fallerIndex,1);
		//TODO make this more robust against possible race conditions having to do with fallers being removed mid stream
	}
	this.getGameAreaHeight = function(){
		return this.domElement.height();
	}
	this.getPlayerAreaStats = function(){
		this.playerAreaStats = this.playerAreaDomElement.position();
		this.playerAreaStats.right = this.playerAreaDomElement.width();
		this.playerAreaStats.bottom = this.playerAreaDomElement.height();
	}
	this.checkValidPlayerNewPosition = function(position){
		var playerStats = this.currentPlayer.getPlayerStats();
		return (position.left>=0 && position.left < this.playerAreaStats.right - playerStats.width);
	}
	this.attachKeyboardHandlers = function(){
		//this.domElement.focus();
		//SET THIS TO THE GAME AREA
		$('body').on('keypress',this.handleKeyPress.bind(this));

	}
	this.handleKeyPress = function(){
		if(this.gameIsRunning){
			this.currentPlayer.keyboardHandler(event);
		}
	}
	this.createPlayerArea = function(){
		this.playerAreaDomElement = $("<div>",{
			class: 'playerArea'
		});
		this.domElement.append(this.playerAreaDomElement);
	}
	this.createPlayer = function(){
		this.currentPlayer = new Player(this);
		var playerElement = this.currentPlayer.createElement();
		this.playerAreaDomElement.append(playerElement);
	}
	/*************  FALER SUB OBJECT ****************/
	function Faller(parent){
		this.parent = parent;
		this.parentHeight = null;
		this.currentY = null;
		this.height = null;
		this.fallerElement = null;
		this.heartBeatTimer = null;
		this.options = null;
		this.heartbeatIntervals = 30; //in ms
		this.alive = true;
	}
	Faller.prototype.initialize = function(fallerOptions){
		/*{
			speed: //pixels per second
			additionalClasses:
		}*/
		this.options = fallerOptions;
		this.options.fallDelta = this.options.speed / this.heartbeatIntervals;
		this.startHeartbeat();
		return this.createElement();
	}
	Faller.prototype.createElement = function(){
		this.fallerElement = $("<div>",{
			class: 'fallerObject '+ this.options.additionalClasses
		});
		this.parentHeight = this.parent.getGameAreaHeight();
		this.height = this.fallerElement.height();
		return this.fallerElement;
	}
	Faller.prototype.startHeartbeat = function(){
		this.heartBeatTimer = setInterval(this.handleHeartbeat.bind(this),this.heartbeatIntervals);
	}
	Faller.prototype.stopHeartbeat = function(){
		clearInterval(this.heartBeatTimer);
		this.heartBeatTimer = null;
	}
	Faller.prototype.handleHeartbeat = function(){
		if(this.alive){
			this.fall();
			this.checkPosition();
		}
	}
	Faller.prototype.checkPosition = function(){
		if((this.currentY+this.height) > this.parentHeight){
			this.die();
		}
	}
	Faller.prototype.fall = function(){
		this.currentY = this.fallerElement.position().top + this.options.fallDelta;
		this.fallerElement.css('top',this.currentY+'px');
	}
	Faller.prototype.die = function(){
		this.alive = false;
		this.stopHeartbeat();
		this.fallerElement.remove();
		this.parent.removeFaller(this);
	}
	/*************  PLAYER SUB OBJECT ***************/
	function Player(parent){
		this.parent = parent;
		this.playerDomElement = null;
		this.playerMovementDelta = 10;
		this.avatarStats = null
		this.createElement = function(){
			this.playerDomElement = $("<div>",{
				class: 'playerAvatar'
			});
			return this.playerDomElement;
		}
		this.setPlayerStats = function(){
			this.avatarStats = this.playerDomElement.position();
			this.avatarStats.width = this.playerDomElement.width();
			this.avatarStats.height = this.playerDomElement.height();			
		}
		this.getPlayerStats = function(){
			this.setPlayerStats();
			this.getPlayerStats = this.getContinuingPlayerStats;
			return this.avatarStats;
		}
		this.getContinuingPlayerStats = function(){
			return this.avatarStats;
		}
		this.keyboardHandler = function(keyEvent){
			var letterCode = keyEvent.code;
			switch(letterCode){
				case 'KeyA':
					//handle left movement
					this.move(-1);
					break;
				case 'KeyD':
					//handle right movement
					this.move(1);
					break;
				default:
					//no idea why you pressed that
			}
		}
		this.move = function(direction){
			var currentPosition = this.playerDomElement.position();
			var newX = currentPosition.left + (direction * this.playerMovementDelta);
			if(parent.checkValidPlayerNewPosition({left: newX})){
				this.playerDomElement.css('left',newX+'px');			
			} else {
				console.log('out of bounds');
			}
		}
	}
	/*************  PLAYER SUB OBJECT ***************/
}