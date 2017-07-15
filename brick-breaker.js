var ballX = 75;
var ballY = 75;
var ballSpeedX = 5;
var ballSpeedY = 7;

const BRICK_W = 80;
const BRICK_H = 20; 
const BRICK_GAP = 2;
const BRICK_COLS = 10;
const BRICK_ROWS = 14; 
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
var bricksLeft = 0;

const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60;
var paddleX = 400;

var canvas, canvasContext;

var mouseX = 0;
var mouseY = 0;

function updateMousePos(evt) {
	var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;

	mouseX = evt.clientX - rect.left - root.scrollLeft;
	mouseY = evt.clientY - rect.top - root.scrollTop;

	paddleX = mouseX - PADDLE_WIDTH/2;

	// cheat/hack to test ball in any position
	/*ballX = mouseX;
	ballY = mouseY;
	ballSpeedX = 4;
	ballSpeedY = -4;*/
}

function brickReset() {
	bricksLeft = 0;
	var i;
	for (i = 0 * BRICK_COLS; i < 3 * BRICK_COLS; i++){
		brickGrid[i] = false;
	}
	for (; i < BRICK_COLS * BRICK_ROWS; i++){
		brickGrid[i] = true;
		bricksLeft++;
	} // end of for each brick
} // end of brickReset func

window.onload = function() {
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');

	var framePerSecond = 60;
	setInterval(updateAll, 1000/framePerSecond);

	canvas.addEventListener('mousemove', updateMousePos);

	brickReset();
	ballReset();
}

function updateAll() {
	// This function updates every frame
	moveAll();
	drawAll();
} 

function ballReset() {
	ballX = canvas.width/2;
	ballY = canvas.height/2;
}

function ballMove(){
	ballX += ballSpeedX;

	if (ballX < 0) { // left 
		ballSpeedX *= -1;
	}
	if (ballX > canvas.width) { // right
		ballSpeedX *= -1;
	}

	ballY += ballSpeedY;
	
	if (ballY < 0) { // top
		ballSpeedY *= -1;
	}
	if (ballY > canvas.height) { // bottom
		ballReset();
		brickReset();
	}
}

function ballBrickHandling(){
	var ballBrickCol = Math.floor(ballX / BRICK_W);
	var ballBrickRow = Math.floor(ballY / BRICK_H);
	var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

	if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS && 
		ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {

		if (brickGrid[brickIndexUnderBall]) {
			brickGrid[brickIndexUnderBall] = false;
			bricksLeft--;
			console.log(bricksLeft);

			var prevBallX = ballX - ballSpeedX;
			var prevBallY = ballY - ballSpeedY;
			var prevBrickCol = Math.floor(prevBallX / BRICK_W);
			var prevBrickRow = Math.floor(prevBallY / BRICK_H);

			var bothTestsFailed = true;

			if (prevBrickCol != ballBrickCol) {
				var adjBrickSide = rowColToArrayIndex(prevBrickCol, ballBrickRow);

				if (brickGrid[adjBrickSide] == false) {
					ballSpeedX *= -1;
					bothTestsFailed = false;
				}
			}
			if (prevBrickRow != ballBrickRow) {
				var adjBrickTopBot = rowColToArrayIndex(ballBrickCol, prevBrickRow);

				if (brickGrid[adjBrickTopBot] == false) {
					ballSpeedY *= -1;
					bothTestsFailed = false;
				}
			}

			if (bothTestsFailed) { // prevents armpit case 
				ballSpeedX *= -1;
				ballSpeedY *= -1;
			}
			
		} // End of brick found
	} // end of valid col and row
}

function ballPaddleHandling(){
	var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
	var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
	var paddleLeftEdgeX = paddleX;
	var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;
	if (ballY > paddleTopEdgeY && // below the top of paddle
		ballY < paddleBottomEdgeY && // above bottom of paddle 
		ballX > paddleLeftEdgeX && // right of the left side of paddle
		ballX < paddleRightEdgeX) { // left of the right side of the paddle

		ballSpeedY *= -1; // bounce the ball off the paddle

		var centerOfPaddleX = paddleX + PADDLE_WIDTH/2;
		var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
		ballSpeedX = ballDistFromPaddleCenterX * 0.35;

		if (bricksLeft == 0) {
			brickReset();
		} // out of bricks
	} // ball center inside paddle
} // end of ballPaddleHandling

function moveAll() {
	ballMove();

	ballBrickHandling();

	ballPaddleHandling();
}

function rowColToArrayIndex(col, row){
	return col + BRICK_COLS * row;
}

function drawBricks() {

	for (var eachRow=0; eachRow < BRICK_ROWS; eachRow++){
		for (var eachCol=0; eachCol < BRICK_COLS; eachCol++){

			var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

			if (brickGrid[arrayIndex]) {
				colorRect(BRICK_W*eachCol,BRICK_H*eachRow, 
					BRICK_W-BRICK_GAP, BRICK_H-BRICK_GAP, 'blue');
			} // end of is this brick here
		} // end of for each brick
	}
} // end of drawBricks func

function drawAll() {
	// Redraw the canvas each frame
	colorRect(0,0, canvas.width,canvas.height,'black')

	// Draw the ball
	colorCircle(ballX,ballY, 10, 'white');

	// Draw the paddle
	colorRect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'blue');

	drawBricks();
}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor){
	canvasContext.fillStyle = fillColor;
	canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
}

function colorCircle(centerX,centerY, radius, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.beginPath();
	canvasContext.arc(centerX,centerY, radius, 0, Math.PI*2, true);
	canvasContext.fill();
}

function colorText(showWords, textX, textY, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.fillText(showWords, textX,textY);
}