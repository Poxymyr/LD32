require(["const", ], function(CONST) {

	var game = new Phaser.Game(CONST.WIDTH, CONST.HEIGHT, Phaser.AUTO, 'game', { preload: preload, create: create, update: update});

	var player, walls, cursors, lightCanvas, baseSegments,
		isPlayerTurn = true,
		polygons = [],
		map, layer;

	function preload() {
		game.load.image('player', 'public/assets/player.png');
		game.load.image('wall', 'public/assets/wall.png');
		game.load.tilemap('map', 'public/assets/map.json', null, Phaser.Tilemap.TILED_JSON);
	}

	function create() {
		player = game.add.sprite(CONST.TILE_SIZE*11.5, CONST.TILE_SIZE*10.5, 'player');
		player.anchor = {x: 0.5, y: 0.5};
		player.grid = {
			x: 11.5,
			y: 10.5
		};
		player.direction = "up";

		walls = game.add.group();

		cursors = game.input.keyboard.createCursorKeys();

		lightCanvas = game.add.graphics(0,0);
		polygons.push([[-1,-1],[CONST.WIDTH+1,-1],[CONST.WIDTH+1,CONST.HEIGHT+1],[-1,CONST.HEIGHT+1]]);

		map = game.add.tilemap('map');
		map.addTilesetImage('wall');
		layer = map.createLayer('Wall layer');
	    layer.resizeWorld();
	    map.forEach(createPolygon, this, 0, 0, CONST.WIDTH, CONST.HEIGHT, "Wall layer");

		baseSegments = VisibilityPolygon.convertToSegments(polygons);
		baseSegments = VisibilityPolygon.breakIntersections(baseSegments);
	}

	function update() {
		if(isPlayerTurn){
			if (cursors.left.isDown)
			{
				if(player.direction == "left" && map.getTileWorldXY(player.x - CONST.TILE_SIZE, player.y, CONST.TILE_SIZE, CONST.TILE_SIZE, "Wall layer") == null) {
					movePlayerTo("left");
				}
				else if(player.direction == "up" || player.direction == "down"){
					rotatePlayerTo("left");
				}
			}
			else if (cursors.right.isDown)
			{
				if(player.direction == "right"&& map.getTileWorldXY(player.x + CONST.TILE_SIZE, player.y, CONST.TILE_SIZE, CONST.TILE_SIZE, "Wall layer") == null){
					movePlayerTo("right");					
				}
				else if(player.direction == "up" || player.direction == "down"){
					rotatePlayerTo("right");
				}
			}
			else if (cursors.down.isDown)
			{
				if(player.direction == "down"&& map.getTileWorldXY(player.x, player.y + CONST.TILE_SIZE, CONST.TILE_SIZE, CONST.TILE_SIZE, "Wall layer") == null){
					movePlayerTo("down");
				}
				else if(player.direction == "left" || player.direction == "right"){
					rotatePlayerTo("down");
				}
			}
			else if (cursors.up.isDown)
			{
				if(player.direction == "up"&& map.getTileWorldXY(player.x, player.y - CONST.TILE_SIZE, CONST.TILE_SIZE, CONST.TILE_SIZE, "Wall layer") == null){
					movePlayerTo("up");
				}
				else if(player.direction == "left" || player.direction == "right"){
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
			isPlayerTurn = true; //console.log(map.getTileWorldXY(player.x, player.y, CONST.TILE_SIZE, CONST.TILE_SIZE, "Wall layer"));
		});
		move.start();
	}

	function rotatePlayerTo(direction) {
		isPlayerTurn = false;
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

	function createPolygon(tile) {
		if(tile.index == -1) 
			return;
		polygons.push([[tile.worldX,tile.worldY],[tile.worldX+tile.width,tile.worldY],[tile.worldX+tile.width,tile.worldY+tile.height],[tile.worldX,tile.worldY+tile.height]]);
	}

	function createLightPolygon(x,y){
		var dynamicSegments = [];
		var topRight 	= new Phaser.Point(x+2,y-3);
		var bottomRight = new Phaser.Point(x+2,y+2);
		var bottomLeft 	= new Phaser.Point(x-2,y+2);
		var topLeft 	= new Phaser.Point(x-2,y-3);

		Phaser.Point.rotate(topRight, x, y, player.angle, true);
		Phaser.Point.rotate(bottomRight, x, y, player.angle, true);
		Phaser.Point.rotate(bottomLeft, x, y, player.angle, true);
		Phaser.Point.rotate(topLeft, x, y, player.angle, true);

		dynamicSegments.push([[topRight.x,topRight.y], [bottomRight.x,bottomRight.y]]);
		dynamicSegments.push([[bottomRight.x,bottomRight.y], [bottomLeft.x,bottomLeft.y]]);
		dynamicSegments.push([[bottomLeft.x,bottomLeft.y], [topLeft.x,topLeft.y]]);
		dynamicSegments = VisibilityPolygon.breakIntersections(dynamicSegments);

		var segments = baseSegments.concat(dynamicSegments);

		var position = [x, y];
		if (VisibilityPolygon.inPolygon(position, polygons[0])) {
  			return VisibilityPolygon.compute(position, segments);
		}      
		return null;
	}	
});