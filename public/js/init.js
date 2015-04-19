require(["const"], function(CONST) {

	var game = new Phaser.Game(CONST.WIDTH, CONST.HEIGHT, Phaser.AUTO, 'game', { preload: preload, create: create, update: update});

	var player, cursors, lightCanvas,
		isPlayerTurn = true,
		polygons = [];

	function preload() {
		game.load.image('player', 'public/assets/player.png');
	}

	function create() {
		player = game.add.sprite(CONST.TILE_SIZE*10, CONST.TILE_SIZE*10, 'player');
		player.anchor = {x: 0.5, y: 0.5};
		player.grid = {
			x: 10,
			y: 10
		};
		player.direction = "up";

		cursors = game.input.keyboard.createCursorKeys();

		lightCanvas = game.add.graphics(0,0);
		polygons.push([[-1,-1],[CONST.WIDTH+1,-1],[CONST.WIDTH+1,CONST.HEIGHT+1],[-1,CONST.HEIGHT+1]]);
		polygons.push([[250,100],[260,140],[240,140]]);
	}

	function update() {
		if(isPlayerTurn){
			if (cursors.left.isDown)
			{
				if(player.direction == "left") {
					movePlayerTo("left");
				}
				else if(player.direction != "right"){
					rotatePlayerTo("left");
				}
			}
			else if (cursors.right.isDown)
			{
				if(player.direction == "right"){
					movePlayerTo("right");					
				}
				else if(player.direction != "left"){
					rotatePlayerTo("right");
				}
			}
			else if (cursors.down.isDown)
			{
				if(player.direction == "down"){
					movePlayerTo("down");
				}
				else if(player.direction != "up"){
					rotatePlayerTo("down");
				}
			}
			else if (cursors.up.isDown)
			{
				if(player.direction == "up"){
					movePlayerTo("up");
				}
				else if(player.direction != "down"){
					rotatePlayerTo("up");
				}
			}
		}

		drawFoV(player.x, player.y);
		game.world.bringToTop(player);
	}

	function movePlayerTo(direction) {
		isPlayerTurn = false;
		var move = game.add.tween(player);
		switch(direction) {
			case "left":
				player.grid.x--;
				break;

			case "right":
				player.grid.x++;
				break;

			case "down":
				player.grid.y++;
				break;

			case "up":
				player.grid.y--;
				break;

		}
		move.to({x: player.grid.x*CONST.TILE_SIZE, y: player.grid.y*CONST.TILE_SIZE}, 500);
		move.onComplete.add(function() {
			isPlayerTurn = true;
		});
		move.start();
	}

	function rotatePlayerTo(direction) {
		isPlayerTurn = false; console.log(direction);
		var rotate = game.add.tween(player);
		var newAngle;
		switch(direction) {
			case "left":
				newAngle = -90;
				player.direction = "left";
				break;

			case "right":
				if(player.direction == "up") {
					newAngle = 90;
				}
				else {
					newAngle = -270;
				}
				player.direction = "right";
				break;

			case "down":
				if(player.direction == "right") {
					newAngle = 180;
				}
				else {
					newAngle = -180;
				}
				player.direction = "down";
				break;

			case "up":
				newAngle = 0;
				player.direction = "up";
				break;

		}

		rotate.to({angle: newAngle}, 500);
		rotate.onComplete.add(function() {
			isPlayerTurn = true;
		});
		rotate.start();
	}

	function drawFoV(x, y){
     	var visibility = createLightPolygon(x, y);
     	
		lightCanvas.clear();
		lightCanvas.lineStyle(2, 0xffff88, 1);
		lightCanvas.beginFill(0xffff88); 
		lightCanvas.moveTo(visibility[0][0],visibility[0][1]);	
     	for(var i=1;i<=visibility.length;i++){
			lightCanvas.lineTo(visibility[i%visibility.length][0],visibility[i%visibility.length][1]);		
		}
		lightCanvas.endFill();
	}

	function createLightPolygon(x,y){
		var segments = VisibilityPolygon.convertToSegments(polygons);
		segments = VisibilityPolygon.breakIntersections(segments);
		var position = [x, y];
		if (VisibilityPolygon.inPolygon(position, polygons[0])) {
  			return VisibilityPolygon.compute(position, segments);
		}      
		return null;
	}	
});