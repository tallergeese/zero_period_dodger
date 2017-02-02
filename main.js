

function DodgerGame(){
	this.currentPlayer = null;
	this.domElement = null;
	this.initialize = function(domElement){
		this.domElement = $(domElement);
		this.createPlayer();
	}
	this.createPlayer = function(){
		this.currentPlayer = new Player();
	}
	/*************  PLAYER SUB OBJECT ***************/
	function Player(){
		this.playerDomElement = null;
		this.createElement = function(){
			this.playerDomElement = $("<div>",{
				class: 'playerAvatar'
			});
			return this.playerDomElement;
		}
	}
	/*************  PLAYER SUB OBJECT ***************/
}