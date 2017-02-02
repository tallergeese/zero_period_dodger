var game = null;

$(document).ready(initializeGame);

function initializeGame(){
	game = new DodgerGame();
	game.initialize('#gameArea');
}

function DodgerGame(){
	this.currentPlayer = null;
	this.domElement = null;
	this.playerAreaDomElement = null;
	this.gameIsRunning = true;
	this.playerAreaStats = null;
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
	this.getPlayerAreaStats = function(){
		this.playerAreaStats = this.playerAreaDomElement.position();
		this.playerAreaStats.right = this.playerAreaDomElement.width();
		this.playerAreaStats.bottom = this.playerAreaDomElement.height();
	}
	this.checkValidPlayerNewPosition = function(position){
		debugger;
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