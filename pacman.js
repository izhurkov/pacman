$('input').keydown(function(e) {
	if(e.keyCode === 13) {
		$('input').css('display', 'none');
		lastScore += g.getScore() * 10;
		lastName = $('input').val();
		console.log(lastScore);
		updateLeaders();
		fullLeaders();
		g.reset();
	}
});

$(".restarter").click(function(){
	g.start();
});

var lastScore = 0;
var lastName = "";

var leaders = [
	{score : 100000, name : "Leo DiCaprio"},
	{score : 50000, name : "Bradley Pitt"},
	{score : 25000, name : "Johnny Depp"},
	{score : 10000, name : "Tom Cruise"},
	{score : 8000, name : "Angelina Jolie"},
	{score : 5000, name : "Hugh Jackman"},
	{score : 2500, name : "Bruce Willis"},
	{score : 1000, name : "Julia Roberts"},
	{score : 500, name : "Tom Hardy"},
	{score : 100, name : "Keanu Reeves"}
];

fullLeaders();

function fullLeaders(){
	$('#leader-list').html("");
	for (var i = 0; i < leaders.length; i++) {
		$('#leader-list').append(i + ". " + leaders[i].score + " " + leaders[i].name + "<br>");
	}
	$('#last-score').html("Last score: " + lastScore);
};

function updateLeaders(){
	var start = null;
	for (var i = 0; i < leaders.length; i++){
		if (lastScore > leaders[i].score){
			start = i;
			break
		}
	}
	if (start === null)
		return;
	for (var i = leaders.length; i > start; i--){
		leaders[i] = leaders[i-1];
	}
	leaders[start] = {score : lastScore, name : lastName};
	leaders.pop();
};

var BLOCK_SIZE = 16, //размер блока
	BLOCKS_X = 27, //количесвто блоков в ширину
	BLOCKS_Y = 25, //количество блоков в высоту

	//цвет
	WALL_COLOR = "#3c28f0",
	PACMAN_COLOR = "#f0dc28",
	BACKGROUND_COLOR = "#0d0d0d",
	DOT_COLOR = "#e5e5e5",
	SHADOW_COLOR = "#ff0000",
	SPEEDY_COLOR = "#ffb8ff",
	BASHFUL_COLOR = "#00ffff",
	POKEY_COLOR = "#ffb851",

	//состояния игры
	START = 1,
	WAITING = 2,
	PLAYING = 3,
	PAUSE = 4,
	DIE = 5,
	END = 6,
	NEWLEVEL = 7,

	//число кадров в секунду
	FPS = 30,

	SPEED = 3.4,
	G_SPEED = 3.0,

	TRAIL_LENGTH = 10;

var Game = {};

function randomInteger(min, max) {
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}

//типы клеток
Game.EMPTY = 0; //пустая клетка
Game.DOT = 1; //клетка с точкой
Game.WALL = 2; //стена
Game.BLOCK = 3, //комната с призраками
Game.BONUS = 4, //клетка с бонусом

Game.PACMAN_START = 5, //начальная позиция пакмана
Game.GHOST_START = 6, //начальная позиция призраков
Game.LEFT_TP = 7, //левый туннель
Game.RIGHT_TP = 8; //правый туннель

Game.NODOT = 9;

var canvas = document.getElementById("canvas");

canvas.setAttribute("width", (BLOCK_SIZE * (BLOCKS_X) + "px"));
canvas.setAttribute("height", (BLOCK_SIZE * (BLOCKS_Y) + 30 + "px"));

document.addEventListener("keydown", keyDownHandler, false);

var ctx = canvas.getContext('2d');

$('#canvas-container').css({'width':canvas.width + 3, 'height':canvas.height});

var game_container = $('#container #game-container').first();
game_container.width(canvas.width + 659);
game_container.height(canvas.height + 6);

Game.Map = function(){
	var width = BLOCKS_X,
		height = BLOCKS_Y,
		map = [
			[2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2],
			[2,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,2],
			[2,1,2,2,1,2,2,2, 2,2,2,2,2,1,2,2,2,2,2, 2,2,2,1,2,2,1,2],
			[2,1,2,2,1,1,1,2, 1,1,1,1,1,1,1,1,1,1,1, 2,1,1,1,2,2,1,2],
			[2,1,2,2,1,2,1,2, 1,2,1,2,2,1,2,2,1,2,1, 2,1,2,1,2,2,1,2],

			[2,1,2,2,1,2,1,1, 1,2,1,2,2,1,2,2,1,2,1, 1,1,2,1,2,2,1,2],
			[2,1,2,2,1,2,1,2, 1,2,1,2,2,1,2,2,1,2,1, 2,1,2,1,2,2,1,2],
			[2,1,2,2,1,1,1,2, 1,1,1,1,1,1,1,1,1,1,1, 2,1,1,1,2,2,1,2],
			[2,1,2,2,1,2,2,2, 1,2,2,2,2,2,2,2,2,2,1, 2,2,2,1,2,2,1,2],
			[2,1,1,1,1,1,1,1, 1,2,2,2,2,2,2,2,2,2,1, 1,1,1,1,1,1,1,2],

			[2,2,2,2,2,2,2,2, 1,9,9,9,9,6,9,9,9,9,1, 2,2,2,2,2,2,2,2],
			[2,2,2,2,2,2,2,2, 1,2,2,2,2,2,2,2,2,2,1, 2,2,2,2,2,2,2,2],
			[7,9,9,9,9,9,9,9, 1,2,2,3,3,3,3,3,2,2,1, 9,9,9,9,9,9,9,8],
			[2,2,2,2,2,2,2,2, 1,2,2,3,3,3,3,3,2,2,1, 2,2,2,2,2,2,2,2],
			[2,1,1,1,1,1,1,1, 1,2,2,2,2,2,2,2,2,2,1, 1,1,1,1,1,1,1,2],

			[2,1,2,2,1,2,2,2, 1,2,1,1,1,5,1,1,1,2,1, 2,2,2,1,2,2,1,2],
			[2,1,2,2,1,2,2,2, 1,2,1,2,2,2,2,2,1,2,1, 2,2,2,1,2,2,1,2],
			[2,1,2,2,1,2,2,2, 1,1,1,1,1,1,1,1,1,1,1, 2,2,2,1,2,2,1,2],
			[2,1,2,2,1,2,2,2, 1,2,2,2,2,2,2,2,2,2,1, 2,2,2,1,2,2,1,2],
			[2,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,2],

			[2,1,2,1,2,1,2,2, 2,2,2,2,1,2,1,2,2,2,2, 2,2,1,2,1,2,1,2],
			[2,1,2,1,1,1,2,2, 2,2,2,2,1,2,1,2,2,2,2, 2,2,1,1,1,2,1,2],
			[2,1,2,2,2,1,2,2, 2,2,2,2,1,2,1,2,2,2,2, 2,2,1,2,2,2,1,2],
			[2,1,1,1,1,1,1,1, 1,1,1,1,1,2,1,1,1,1,1, 1,1,1,1,1,1,1,2],
			[2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2]
		],

		walls = [

		[{}
		],

		[{"line" : [1/8, 0, 1/8, 1]},
		],
		[{"line" : [0, 1/8, 1, 1/8]}
		],
		[{"line" : [7/8, 0, 7/8, 1]}
		],
		[{"line" : [0, 7/8, 1, 7/8]}
		],

		[{"line" : [0, 1/8, 1/2, 1/8]},
		{"line" : [0, 7/8, 1/2, 7/8]},
		{"arc" : [3/2, 1/2, false]}
		],
		[{"line" : [1/8, 1/2, 1/8, 0]},
		{"line" : [7/8, 1/2, 7/8, 0]},
		{"arc" : [0, 1, false]}
		],
		[{"line" : [1, 1/8, 1/2, 1/8]},
		{"line" : [1, 7/8, 1/2, 7/8]},
		{"arc" : [1/2, 3/2, false]}
		],
		[{"line" : [1/8, 1/2, 1/8, 1]},
		{"line" : [7/8, 1/2, 7/8, 1]},
		{"arc" : [1, 2, false]}
		],

		[{"line" : [1/8, 1/2, 1/8, 1]},
		{"line" : [1/2, 1/8, 1, 1/8]},
		{"arc" : [1, 3/2, false]}
		],
		[{"line" : [0, 1/8, 1/2, 1/8]},
		{"line" : [7/8, 1/2, 7/8, 1]},
		{"arc" : [3/2, 2, false]}
		],
		[{"line" : [7/8, 1/2, 7/8, 0]},
		{"line" : [0, 7/8, 1/2, 7/8]},
		{"arc" : [0, 1/2, false]}
		],
		[{"line" : [1/8, 1/2, 1/8, 0]},
		{"line" : [1, 7/8, 1/2, 7/8]},
		{"arc" : [1/2, 1, false]}
		],

		[{"line" : [1/8, 0, 1/8, 1]},
		{"line" : [7/8, 0, 7/8, 1]},
		],
		[{"line" : [0, 1/8, 1, 1/8]},
		{"line" : [0, 7/8, 1, 7/8]},
		],

		[{"arc" : [0, 2, false]}
		]

		];

	function drawBlock(block, i, j){
		ctx.strokeStyle = WALL_COLOR;
        ctx.lineWidth = BLOCK_SIZE/4;
        ctx.lineCap = 'round';

        for (var k = 0; k < walls[block].length; k++) {
        	ctx.beginPath();
        	var w = walls[block][k];
        	if(w.line){
        		ctx.moveTo(i*BLOCK_SIZE + w.line[0]*BLOCK_SIZE, j*BLOCK_SIZE + w.line[1]*BLOCK_SIZE);
        		ctx.lineTo(i*BLOCK_SIZE + w.line[2]*BLOCK_SIZE, j*BLOCK_SIZE + w.line[3]*BLOCK_SIZE);
        	}
        	else if (w.arc){
				ctx.arc(i*BLOCK_SIZE + BLOCK_SIZE/2,j*BLOCK_SIZE + BLOCK_SIZE/2,
					3/8*BLOCK_SIZE,
					Math.PI*w.arc[0],
					Math.PI*w.arc[1], w.arc[2])
        	}
        	ctx.stroke();
        }
	};

	function reset(){
		for (var i = 0; i < this.map[0].length; i++)
			for (var j = 0; j < this.map.length; j++)
				if (this.map[j][i] === Game.EMPTY)
					this.map[j][i] = Game.DOT;
	};

	function update(){
	};

	function initBlock(bLeft, bUp, bRight, bDown, i, j){
		if (bLeft == Game.WALL && bUp == Game.WALL && bRight == Game.WALL && bDown == Game.WALL){
			drawBlock(0, i, j); return;}

		if (bLeft != Game.WALL && bUp == Game.WALL && bRight == Game.WALL && bDown == Game.WALL){
			drawBlock(1, i, j); return;}
		if (bLeft == Game.WALL && bUp != Game.WALL && bRight == Game.WALL && bDown == Game.WALL){
			drawBlock(2, i, j); return;}
		if (bLeft == Game.WALL && bUp == Game.WALL && bRight != Game.WALL && bDown == Game.WALL){
			drawBlock(3, i, j); return;}
		if (bLeft == Game.WALL && bUp == Game.WALL && bRight == Game.WALL && bDown != Game.WALL){
			drawBlock(4, i, j); return;}


		if (bLeft == Game.WALL && bUp != Game.WALL && bRight != Game.WALL && bDown != Game.WALL){
			drawBlock(5, i, j); return;}
		if (bLeft != Game.WALL && bUp == Game.WALL && bRight != Game.WALL && bDown != Game.WALL){
			drawBlock(6, i, j); return;}
		if (bLeft != Game.WALL && bUp != Game.WALL && bRight == Game.WALL && bDown != Game.WALL){
			drawBlock(7, i, j); return;}
		if (bLeft != Game.WALL && bUp != Game.WALL && bRight != Game.WALL && bDown == Game.WALL){
			drawBlock(8, i, j); return;}

		if (bLeft != Game.WALL && bUp != Game.WALL && bRight == Game.WALL && bDown == Game.WALL){
			drawBlock(9, i, j); return;}
		if (bLeft == Game.WALL && bUp != Game.WALL && bRight != Game.WALL && bDown == Game.WALL){
			drawBlock(10, i, j); return;}
		if (bLeft == Game.WALL && bUp == Game.WALL && bRight != Game.WALL && bDown != Game.WALL){
			drawBlock(11, i, j); return;}
		if (bLeft != Game.WALL && bUp == Game.WALL && bRight == Game.WALL && bDown != Game.WALL){
			drawBlock(12, i, j); return;}

		if (bLeft != Game.WALL && bUp == Game.WALL && bRight != Game.WALL && bDown == Game.WALL){
			drawBlock(13, i, j); return;}
		if (bLeft == Game.WALL && bUp != Game.WALL && bRight == Game.WALL && bDown != Game.WALL){
			drawBlock(14, i, j); return;}

		if (bLeft != Game.WALL && bUp != Game.WALL && bRight != Game.WALL && bDown != Game.WALL){
			drawBlock(15, i, j); return;}

	};

	function draw(){
		for (var i = 1; i < map[0].length-1; i++) {
			for (var j = 1; j < map.length-1; j++) {
				
				if (map[j][i] === Game.WALL){
					var d1 = map[j][i-1], //left
						d3 = map[j][i+1], //right
						d2 = map[j-1][i], //up
						d4 = map[j+1][i]; //down
					initBlock(d1, d2, d3, d4, i, j);
				}
				else if(map[j][i] === Game.DOT){
					ctx.fillStyle = DOT_COLOR;
					ctx.fillRect(.5*BLOCK_SIZE + i*BLOCK_SIZE - BLOCK_SIZE/8,
								.5*BLOCK_SIZE + j*BLOCK_SIZE - BLOCK_SIZE/8,
								BLOCK_SIZE/4, BLOCK_SIZE/4);
				}
			}
		}
	};

	function searchStart(startPos){
		for (var i = 0; i < map[0].length; i++)
			for (var j = 0; j < map.length; j++)
				if (map[j][i] === startPos){
					return {j : j, i : i};
				}
		return {j : 1, i : 1};
	};

	function getScores(){
		var count = 0;
		for (var i = 0; i < map[0].length; i++)
			for (var j = 0; j < map.length; j++)
				if (map[j][i] === Game.DOT)
					count++
		return count;
	};

	return {
		"getScores"		: getScores,
		"searchStart" : searchStart,
		"reset"	: reset,
		"update": update,
		"draw": draw,
		"map" : map
	};
};

Game.inСrossing = function(pos, speed){
	return (Math.round(pos.y)%BLOCK_SIZE < speed &&
			Math.round(pos.x)%BLOCK_SIZE < speed) ? true : false;
};

Game.continueMoving = function(course, pos, speed){
	if (course !== null){
		switch(course){
			case 'left':
				pos.x-=speed;
				break;
			case 'right':
				pos.x+=speed;
				break;
			case 'up':
				pos.y-=speed;
				break;
			case 'down':
				pos.y+=speed;
				break;
			default:
				break;
		}
	}
	return pos;
};

Game.updateTrail = function(trail, cell){
	if (trail.length >= TRAIL_LENGTH){
		trail.shift();
	};
	return{y : cell.y, x : cell.x};
}

Game.getCurrentCells = function(pos){
	return {x : Math.floor(Math.round(pos.x + BLOCK_SIZE/2)/BLOCK_SIZE), //(pos.x - ((pos.x)%BLOCK_SIZE))/BLOCK_SIZE;
			y : Math.floor(Math.round(pos.y + BLOCK_SIZE/2)/BLOCK_SIZE)}; //(pos.y - ((pos.y)%BLOCK_SIZE))/BLOCK_SIZE
};

Game.getCurrentPos = function(cell){
	return {x : cell.x * BLOCK_SIZE, 
			y : cell.y * BLOCK_SIZE};
};

Game.drawTrail = function(trail, color){
	ctx.fillStyle = color;
	for (var i = 0; i < trail.length; i++) {
		ctx.beginPath();
		ctx.arc(trail[i].x * BLOCK_SIZE + BLOCK_SIZE/2,
				trail[i].y * BLOCK_SIZE + BLOCK_SIZE/2,
               	BLOCK_SIZE/(6*(trail.length-i)),
                0, 
                Math.PI * 2,
                true);
		ctx.fill();
	};
};

Game.setStartPosition = function(cell, pos, trail, map, start){
	var st = map.searchStart(start);
	cell.x = st.i;
	cell.y = st.j;
	pos.x = cell.x * BLOCK_SIZE;
	pos.y = cell.y * BLOCK_SIZE;
	trail.push({y : cell.y, x : cell.x});
};

Game.drawBody = function(pos, color){
	ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x + BLOCK_SIZE / 2,
            pos.y + BLOCK_SIZE / 2,
            7/16 * BLOCK_SIZE,
            Math.PI * 0.1,
            Math.PI * 0.9,
            true);
    ctx.moveTo(pos.x + 1/16 * BLOCK_SIZE,
        		pos.y + BLOCK_SIZE / 2);
    ctx.lineTo(pos.x,
        		pos.y + BLOCK_SIZE);
    ctx.lineTo(pos.x + 1/8 * BLOCK_SIZE,
        		pos.y + 7/8 * BLOCK_SIZE);
    ctx.lineTo(pos.x + 2/8 * BLOCK_SIZE,
        		pos.y + BLOCK_SIZE);
    ctx.lineTo(pos.x + 3/8 * BLOCK_SIZE,
        		pos.y + 7/8 * BLOCK_SIZE);
    ctx.lineTo(pos.x + 4/8 * BLOCK_SIZE,
        		pos.y + BLOCK_SIZE);
    ctx.lineTo(pos.x + 5/8 * BLOCK_SIZE,
        		pos.y + 7/8 * BLOCK_SIZE);
    ctx.lineTo(pos.x + 6/8 * BLOCK_SIZE,
        		pos.y + BLOCK_SIZE);
    ctx.lineTo(pos.x + 7/8 * BLOCK_SIZE,
       		   	pos.y + 7/8 * BLOCK_SIZE);
    ctx.lineTo(pos.x + BLOCK_SIZE,
       		   	pos.y + BLOCK_SIZE);
    ctx.lineTo(pos.x + 15/16 * BLOCK_SIZE,
        	   	pos.y + BLOCK_SIZE/2);
    ctx.fill();
};

Game.drawEyes = function(pos, directionLeft){
	ctx.fillStyle = BACKGROUND_COLOR;
    ctx.beginPath();
    ctx.arc(pos.x + ((directionLeft) ? -2 : 2) + 5/16 * BLOCK_SIZE,
            pos.y + BLOCK_SIZE / 2,
            BLOCK_SIZE / 8,
            0,
            Math.PI * 2,
            true);
    ctx.arc(pos.x + ((directionLeft) ? -2 : 2) + 11/16 * BLOCK_SIZE,
            pos.y + BLOCK_SIZE / 2,
            BLOCK_SIZE / 8,
            0,
            Math.PI * 2,
            true);
	ctx.fill();
};

Game.Player = function(map){
	var cell = {x : 0, y : 0}, //позиция пакмана на поле
		pos = {x : 0, y : 0}, //позиция пакмана на холсте для отрисовки
		course = null, //текущее направление
		direction = null, //последнее направление, выбранное игроком 
		state = 'alive', //состояние пакмана: alive, dead, charged
		score = 0, //очки игрока 
		lives = 3,
		trail = [];

	function init() {
		Game.setStartPosition(cell, pos, trail, map, Game.PACMAN_START);
		course = null;
		direction = null;
		state = 'alive';
		trail = [];
		lives = 3;
		score = 0;
	}

	function reset(){
		Game.setStartPosition(cell, pos, trail, map, Game.PACMAN_START);
		course = null;
		direction = null;
		state = 'alive';
		trail = [];
	};

	function loseLive(){ lives--; return lives; };

	function getLives(){ return lives; };

	function getScore(){ return score; };

	function setDir(dir){ direction = dir; };

	function moving(){
		if (Game.inСrossing(pos, SPEED)){
			trail.push(Game.updateTrail(trail, cell));
			if (map.map[cell.y][cell.x] === Game.DOT){
				map.map[cell.y][cell.x] = Game.EMPTY;
				score += 1;
			} else if (map.map[cell.y][cell.x] === Game.LEFT_TP){
				cell.x = 25;
				pos.x = 25*BLOCK_SIZE;
				course = 'left';
				return;
			} else if (map.map[cell.y][cell.x] === Game.RIGHT_TP){
				cell.x = 1;
				pos.x = 1;
				course = 'right';
				return;
			}
			if (direction !== null){
				var d1 = map.map[cell.y][cell.x-1], //left
					d2 = map.map[cell.y][cell.x+1], //right
					d3 = map.map[cell.y-1][cell.x], //up
					d4 = map.map[cell.y+1][cell.x]; //down
				switch(direction){
					case 'left':
						if (d1 !== Game.WALL && d1 !== Game.BLOCK){
							pos.y = cell.y*BLOCK_SIZE;
							pos.x-=SPEED;
							course = 'left';
						}
						break;
					case 'right':
						if (d2 !== Game.WALL && d2 !== Game.BLOCK){
							pos.y = cell.y*BLOCK_SIZE;
							pos.x+=SPEED;
							course = 'right';
						}
						break;
					case 'up':
						if (d3 !== Game.WALL && d3 !== Game.BLOCK){
							pos.x = cell.x*BLOCK_SIZE;
							pos.y-=SPEED;
							course = 'up';
						}
						break;
					case 'down':
						if (d4 != Game.WALL && d4 != Game.BLOCK){
							pos.x = cell.x*BLOCK_SIZE;
							pos.y+=SPEED;
							course = 'down';
						}
						break;
				}
				if (course !== null){
					switch(course){
						case 'left':
							if (d1 === Game.WALL || d1 === Game.BLOCK)
								course = 'stop';
							else
								pos.x-=SPEED;
							break;
						case 'right':
							if (d2 === Game.WALL || d2 === Game.BLOCK)
								course = 'stop';
							else
								pos.x+=SPEED;
							break;
						case 'up':
							if (d3 === Game.WALL || d3 === Game.BLOCK)
								course = 'stop';
							else
								pos.y-=SPEED;
							break;
						case 'down':
							if (d4 === Game.WALL || d4 === Game.BLOCK)
								course = 'stop';
							else
								pos.y+=SPEED;
							break;
						default:
							break;
					}
					if (course === 'stop')
						pos = Game.getCurrentPos(cell)
				}
			}
		}
		else
			pos = Game.continueMoving(course, pos, SPEED);
		cell = Game.getCurrentCells(pos);
	};

	function update(){
		if (state === 'alive') moving();
	};

	function draw(){
		Game.drawTrail(trail, PACMAN_COLOR);
		if (state === 'alive') drawAlive();
	};

	function drawAlive(){
		ctx.fillStyle = PACMAN_COLOR;
        ctx.beginPath();
        ctx.moveTo(pos.x + BLOCK_SIZE / 2,
                   pos.y + BLOCK_SIZE / 2);
        ctx.arc(pos.x + BLOCK_SIZE / 2,
                pos.y + BLOCK_SIZE / 2,
                BLOCK_SIZE / 2, 0, 
                Math.PI * 2,
                true); 
        ctx.fill();
	};

	function drawDead(value){
		ctx.fillStyle = PACMAN_COLOR;
        ctx.beginPath();
        ctx.moveTo(pos.x + BLOCK_SIZE / 2,
                   pos.y + BLOCK_SIZE / 2);
        ctx.arc(pos.x + BLOCK_SIZE / 2,
                pos.y + BLOCK_SIZE / 2,
                BLOCK_SIZE / 2, 0,
                (Math.PI * 2 * value),
                true); 
        ctx.fill();
	};

	function setState(s){ state = s; };

	function getCell(){ return cell; };

	return{
		"getCell"	: getCell,
		"setState"	: setState,
		"reset" 	: reset,
		"cell"		: cell,
		"drawDead"	: drawDead,
		"setDir"	: setDir,
		"draw" 		: draw,
		"update"	: update,
		"direction" : direction,
		"loseLive"	: loseLive,
		"getScore"	: getScore,
		"getLives"	: getLives,
		"init"		: init
	}
};

Game.setRandomDirection = function(){
		var rand = randomInteger(0, 3);
		switch(rand){
			case 0:
				return 'left';
			case 1:
				return 'up';
			case 2:
				return 'right';
			case 3:
				return 'down';
			default:
				break;
		}
		return 'stop';
	};

Game.checkBlock = function(cell, map, course){
	var dir = [];
	if (map.map[cell.y][cell.x+1] !== Game.WALL)
		dir.push({y:cell.y, x:cell.x+1, d:'left'});
	if (map.map[cell.y][cell.x-1] !== Game.WALL)
		dir.push({y:cell.y, x:cell.x-1, d:'right'});
	if (map.map[cell.y+1][cell.x] !== Game.WALL)
		dir.push({y:cell.y+1, x:cell.x, d:'down'});
	if (map.map[cell.y-1][cell.x] !== Game.WALL)
		dir.push({y:cell.y-1, x:cell.x, d:'up'});
	return dir;
};

Game.distance = function(c1, c2){
	var a = c1.x - c2.x;
	var b = c1.y - c2.y;
	return Math.sqrt(a*a + b*b);
}

Game.Shadow = function(map, color){
	var cell = {x : 0, y : 0}, //позиция пакмана на поле
		pos = {x : 0, y : 0},
		fav = {x : 0, y : 0},
		course = null, //текущее направление
		direction = null,
		directionLeft = true, 
		directionUp = true,
		state = 'alive', //состояние пакмана: alive, dead, charged
		trail = [];

	function reset(){
		Game.setStartPosition(cell, pos, trail, map, Game.GHOST_START);
		direction = null;
		course = 'up';
	};

	function updateFav(player_cell){
		fav = player_cell;
	};

	function update(){
		cell = Game.getCurrentCells(pos);
		if (Game.inСrossing(pos, G_SPEED)){
			pos = Game.getCurrentPos(cell);
			trail.push(Game.updateTrail(trail, cell));
			if (map.map[cell.y][cell.x] === Game.LEFT_TP){
				cell.x = 25;
				pos.x = 25*BLOCK_SIZE;
				course = 'left';
			} else if (map.map[cell.y][cell.x] === Game.RIGHT_TP){
				cell.x = 1;
				pos.x = 1;
				course = 'right';
			}
			var dir = Game.checkBlock(cell, map, course);
			if (dir.length > 2){
				direction = Game.setRandomDirection();
			}

			//console.log(direction, course);			
			var d1 = map.map[cell.y][cell.x-1], //left
				d2 = map.map[cell.y][cell.x+1], //right
				d3 = map.map[cell.y-1][cell.x], //up
				d4 = map.map[cell.y+1][cell.x]; //down
			if (direction !== null){
				switch(direction){
					case 'left':
						if (d1 !== Game.WALL){
							pos.y = cell.y*BLOCK_SIZE;
							pos.x-=G_SPEED;
							course = 'left';
						}
						break;
					case 'right':
						if (d2 !== Game.WALL){
							pos.y = cell.y*BLOCK_SIZE;
							pos.x+=G_SPEED;
							course = 'right';
						}
						break;
					case 'up':
						if (d3 !== Game.WALL){
							pos.x = cell.x*BLOCK_SIZE;
							pos.y-=G_SPEED;
							course = 'up';
						}
						break;
					case 'down':
						if (d4 != Game.WALL){
							pos.x = cell.x*BLOCK_SIZE;
							pos.y+=G_SPEED;
							course = 'down';
						}
						break;
				}
			}
			if (course !== null){
				switch(course){
					case 'left':
						if (d1 === Game.WALL)
							direction = Game.setRandomDirection();
						else
							pos.x-=G_SPEED;
						break;
					case 'right':
						if (d2 === Game.WALL)
							direction = Game.setRandomDirection();
						else
							pos.x+=G_SPEED;
						break;
					case 'up':
						if (d3 === Game.WALL)
							direction = Game.setRandomDirection();
						else
							pos.y-=G_SPEED;
						break;
					case 'down':
						if (d4 === Game.WALL)
							direction = Game.setRandomDirection();
						else
							pos.y+=G_SPEED;
						break;
					default:
						break;
				}
			}
		}
		else
			pos = Game.continueMoving(course, pos, G_SPEED);
	};

	function draw(){
		Game.drawTrail(trail, color);
		Game.drawBody(pos, color);
		Game.drawEyes(pos, directionLeft);
	};

	function getCell(){ return cell; };

	return{
		"updateFav"	: updateFav,
		"getCell"	: getCell,
		"reset" 	: reset,
		"update"	: update,
		"draw"		: draw
	}
};

var MainGame = function(){
	var state = START; //состояние игры

	var map, //карта
		player, //пэкмен
		shadow, //красное приведение
		speedy, //розовое приведение
		bashful, //голубое приведение
		pokey; //оранжевое приведение

	var time;
	var timer;

	var level, needScore;

	function start(){
		level = 0;
		state = START;
		map = new Game.Map();
		map.reset();
		player = new Game.Player(map);
		player.init();

		shadow = new Game.Shadow(map, SHADOW_COLOR);
		shadow.reset();
		speedy = new Game.Shadow(map, SPEEDY_COLOR);
		speedy.reset();
		bashful = new Game.Shadow(map, BASHFUL_COLOR);
		bashful.reset();
		pokey = new Game.Shadow(map, POKEY_COLOR);
		pokey.reset();

		needScore = map.getScores();
		time = 0;
		timer = 0;
		setInterval(main, 1000/FPS);
	};

	function reset(){
		state = START;
		map.reset();
		player.init();
		shadow.reset();
		speedy.reset();
		bashful.reset();
		pokey.reset();
		time = 0;
		timer = 0;
		needScore = map.getScores();
	};

	function newLevel(){
		state = NEWLEVEL;
		level++;
		map.reset();
		player.reset();
		shadow.reset();
		speedy.reset();
		bashful.reset();
		pokey.reset();
		needScore += map.getScores();
	};

	function die(){
		state = WAITING;
		player.reset();
		shadow.reset();
		speedy.reset();
		bashful.reset();
		pokey.reset();
	};

	function lose(){
			state = START;
			$('input').css({
				'display' 	: 'block',
				'background': BACKGROUND_COLOR,
				'border' 	: '3px solid ' + PACMAN_COLOR,
				'color'		: PACMAN_COLOR,
				'padding' 	: '0px 4px 0px',
				'top'		: $('canvas').position().top + (BLOCK_SIZE * BLOCKS_Y)/2 - 60,
				'left'		: $('canvas').position().left + (BLOCK_SIZE * BLOCKS_X)/2 - 150
			});
			$('input').attr({
				'maxlength' : '15',
				'placeholder' : 'Введите свой никнейм и нажмите Enter'});
	};

	function collision(player, obj){
		if (player.getCell().x === obj.getCell().x && player.getCell().y === obj.getCell().y)
			return true;
		return false;
	};

	function main(){
		if (state === PLAYING){
			if (collision(player, shadow) || collision(player, speedy)
			 	|| collision(player, bashful) || collision(player, pokey)){
				timer = time;
				state = DIE;
				player.setState('dead');
				return;
			}
			update(++time);
		}
		draw();
		if (state === START){
			time++;
			message("START","Press SPACE for start");
		}
		if (state === NEWLEVEL){
			message("LEVEL " + (level+2),"Press SPACE for start");
		}
		if (state === WAITING){
			if (++time > timer + 2 * FPS){
				state = PLAYING;
			}
			messageWaiting(2);
		}
		if (state === PAUSE){
			message("PAUSE", "SPACE or P for continue");
		}
		if (state === DIE){
			if (++time < timer + 2 * FPS){
				player.drawDead((time - timer) / (FPS * 2))
			}
			else{
				timer = time;
				if (player.loseLive() < 1){
					lose();
					return;
				};
				die();
				return;
			}
		}
	};

	function getKey(e){
	    if((e.keyCode == 37 || e.keyCode == 108) && state == PLAYING) {
	    	player.setDir('left');
	    }
	    else if((e.keyCode == 38 || e.keyCode == 104) && state == PLAYING) {
	    	player.setDir('up');
	    }
	    else if((e.keyCode == 39 || e.keyCode == 102) && state == PLAYING) {
	    	player.setDir('right');
	    }
	    else if((e.keyCode == 40 || e.keyCode == 98) && state == PLAYING){
	    	player.setDir('down');
	    }
	    else if(e.keyCode == 32 && state == START){
			state = WAITING;
			timer = time;
	    }
	    else if(e.keyCode == 32 && state === NEWLEVEL){
	    	newLevel();
			state = WAITING;
			timer = time;
	    }
	    else if(e.keyCode == 80 || e.keyCode == 112 || e.keyCode == 32){
	    	if (state == PLAYING)
				state = PAUSE;
			else if (state == PAUSE)
				state = PLAYING;
    	}
    	else if(e.keyCode == 46){
    		player.loseLive();
    	}
	};

	function message(){
		var maxText = 0;
		for (var i = 0; i < arguments.length; i++) {
			text = arguments[i];
			if (text.length >= maxText){
				maxText = text.length;
			};
		};
		var size = maxText * 12.4;

		ctx.fillStyle = 'rgba(13, 13, 13, 0.8)';
		ctx.fillRect(canvas.width/2-size/2, canvas.height/2-50, size, 16 + arguments.length * 20);

		ctx.strokeStyle = PACMAN_COLOR;
		ctx.lineWidth = 3;
		ctx.strokeRect(canvas.width/2-size/2, canvas.height/2-50, size, 16 + arguments.length * 20);

		ctx.fillStyle = PACMAN_COLOR;
		ctx.font = "16px ocr a std";
		for (var i = 0; i < arguments.length; i++) {
			text = arguments[i];
			size = text.length * 13;
	    	ctx.fillText(text, canvas.width/2 - text.length*5.7, canvas.height/2-25 + i * 20);
		};
		
	};

	function messageWaiting(seconds){
		var timeText = (time - timer)/FPS;
		size = 220;
		ctx.fillStyle = 'rgba(13, 13, 13, 0.8)';
		ctx.fillRect(canvas.width/2-size/2, canvas.height/2-50, size, 35);
		ctx.strokeStyle = PACMAN_COLOR;
		ctx.lineWidth = 3;
		ctx.strokeRect(canvas.width/2-size/2, canvas.height/2-50, size, 35);
		ctx.fillStyle = PACMAN_COLOR;
		ctx.font = "16px ocr a std";
    	ctx.fillText("Game starts in " + Math.round(seconds-timeText), canvas.width/2 - size/2.5, canvas.height/2-25);    
	};

	function update(time){
		map.update();
		player.update();
		if(player.getScore() >= needScore)
			{state = NEWLEVEL;}
		shadow.updateFav(player.getCell());
		shadow.update();
		speedy.update();
		bashful.update();
		pokey.update();
	};

	function draw(){
		ctx.fillStyle = BACKGROUND_COLOR;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		map.draw();
		player.draw();
		shadow.draw();
		speedy.draw();
		bashful.draw();
		pokey.draw();

		drawScores();
		drawLives();
		drawFrame();
	};

	function drawFrame(){
		ctx.strokeStyle = BACKGROUND_COLOR;
		ctx.lineWidth = BLOCK_SIZE;
        ctx.strokeRect(BLOCK_SIZE/2, BLOCK_SIZE/2, BLOCK_SIZE*(BLOCKS_X-1), BLOCK_SIZE*(BLOCKS_Y-1));
		ctx.strokeStyle = WALL_COLOR;
        ctx.lineWidth = BLOCK_SIZE/4;
        ctx.strokeRect(BLOCK_SIZE-BLOCK_SIZE/8, BLOCK_SIZE-BLOCK_SIZE/8,
        	BLOCK_SIZE*(BLOCKS_X-2) + BLOCK_SIZE/4,
        	BLOCK_SIZE*(BLOCKS_Y-2) + BLOCK_SIZE/4);
	};

	function drawScores(){
		var top = BLOCK_SIZE * BLOCKS_Y + 22;
	    ctx.fillStyle = PACMAN_COLOR;
	    ctx.font = BLOCK_SIZE + "px ocr a std";
	    ctx.fillText("Score: " + player.getScore() * 10, BLOCK_SIZE/2, top);
	};

	function drawLives(){		
		var top = BLOCK_SIZE * BLOCKS_Y + 10;
		var right = BLOCKS_X * BLOCK_SIZE;
		for (var i = player.getLives(); i > 0; i--) {
			drawLive({x : right - i * (BLOCK_SIZE + 10), y : top });
		}
	};

	function drawLive(pos){
		ctx.fillStyle = PACMAN_COLOR;
        ctx.beginPath();
        ctx.arc(pos.x + 1/4 * BLOCK_SIZE,
                pos.y + 1/4 * BLOCK_SIZE,
                1/4 * BLOCK_SIZE,
                0,
                Math.PI,
                true);
        ctx.arc(pos.x + 3/4 * BLOCK_SIZE ,
                pos.y + 1/4 * BLOCK_SIZE,
                1/4 * BLOCK_SIZE,
                0,
                Math.PI,
                true);
        ctx.moveTo(pos.x,
        		   pos.y + 1/4 * BLOCK_SIZE);
    	ctx.lineTo(pos.x + 1/16 * BLOCK_SIZE,
        		   pos.y + 3/8 * BLOCK_SIZE);
    	ctx.lineTo(pos.x + 1/2 * BLOCK_SIZE,
        		   pos.y + 7/8 * BLOCK_SIZE);
    	ctx.lineTo(pos.x + 15/16 * BLOCK_SIZE,
        		   pos.y + 3/8 * BLOCK_SIZE);
		ctx.lineTo(pos.x + BLOCK_SIZE,
        		   pos.y + 1/4 * BLOCK_SIZE);
        ctx.fill();
	};

	function getScore(){
		return player.getScore();
	};

	return {
		"getScore"	: getScore,
		"getKey" : getKey,
        "start" : start,
        "reset"	: reset
    };
};

var g = new MainGame();
g.start();

function keyDownHandler(e) {
	g.getKey(e);
}