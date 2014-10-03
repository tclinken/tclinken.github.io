var leftKey = 0;
var rightKey = 0;
var upKey = 0;
var downKey = 0;
var score = 0;
var numTicks = 0;
var numChasers = 2;
var numMagic = 0;
var beastMode = 0;
var level = 1;
var pause = 0;

$(function() {
	// Keydown listener
	$("body").keydown(function(e) {
		ek = e.keyCode;
		if (ek==37) leftKey=1;
		if (ek==39) rightKey=1;
		if (ek==38) upKey=1;
		if (ek==40) downKey=1;
		if (ek==80) togglePause();
	});
	// Keyup listener
	$("body").keyup(function(e) {
		ek = e.keyCode;
		if (ek==37) leftKey=0;
		if (ek==39) rightKey=0;
		if (ek==38) upKey=0;
		if (ek==40) downKey=0;
	});
	$('#score').html("0");
	$('#level').html("1");
	setupIntervals();
});

function setupIntervals() {
	playerMove = setInterval( function() { tickMove("player") }, 10);
	miniCircleChase = setInterval( function() { $(".minicircle").each(function(index) { tickChase($(".minicircle:eq("+index+")").attr('id'), "player"); })}, 60);
	magicCircleBlink = setInterval( function() { $(".magiccircle").each(function(index) { tickBlink($(".magiccircle:eq("+index+")").attr('id')) })}, 100);
	randomGen = setInterval( function() { generateRandom(); }, 200);
}

function pauseIntervals() {
	clearInterval(playerMove);
	clearInterval(miniCircleChase);
	clearInterval(magicCircleBlink);
	clearInterval(randomGen);
}

function togglePause() {
	if (pause) setupIntervals();
	else pauseIntervals();
	pause = !pause;
}

function tickLeft(id) {
	if (parseInt($('#' + id).css("left")) > 0) $('#' + id).css({"left": "-=2"});
}
function tickRight(id) {
	if (parseInt($('#' + id).css("left")) < 1000) $('#' + id).css({"left": "+=2"});
}
function tickUp(id) {
	if (parseInt($('#' + id).css("top")) > 0) $('#' + id).css({"top": "-=2"});
}
function tickDown(id) {
	if (parseInt($('#' + id).css("top")) < 500) $('#' + id).css({"top": "+=2"});
}
function tickMove(id) {
	if (leftKey) tickLeft(id);
	if (rightKey) tickRight(id);
	if (upKey) tickUp(id);
	if (downKey) tickDown(id);
	checkCollision(id);
	upScore(1);
}

function tickChase(chaser, runner) {
	chaser_x = parseInt($('#' + chaser).css("left")) + parseInt($('#' + chaser).css("border-radius"));
	chaser_y = parseInt($('#' + chaser).css("top")) + parseInt($('#' + chaser).css("border-radius"));
	runner_x = parseInt($('#' + runner).css("left")) + parseInt($('#' + runner).css("border-radius"));
	runner_y = parseInt($('#' + runner).css("top")) + parseInt($('#' + runner).css("border-radius"));
	if (beastMode) {
		var goLeft = (chaser_x < runner_x);
		var goRight = (chaser_x > runner_x);
		var goUp = (chaser_y < runner_y);
		var goDown = (chaser_y > runner_y);
	}
	else {
		var goLeft = (chaser_x > runner_x);
		var goRight = (chaser_x < runner_x);
		var goUp = (chaser_y > runner_y);
		var goDown = (chaser_y < runner_y);
	}
	if (goLeft) tickLeft(chaser);
	if (goRight) tickRight(chaser);
	if (goUp) tickUp(chaser);
	if (goDown) tickDown(chaser);
}
function upScore(x) {
	initScore = score;
	score += x;
	$('#score').html(score + "");
	if (Math.floor(score/10000) > Math.floor(initScore/10000)) {
		level++;
		$('#level').html(level + "");
	}
}
function checkCollision() {
	$(".minicircle").each(function(index) {
		distance_squared = distanceSquared('player', $(".minicircle:eq("+index+")").attr('id'));
		sum_radii = parseInt($(".minicircle:eq("+index+")").css("border-radius")) + parseInt($('#player').css("border-radius"));
		sum_radii_squared = sum_radii * sum_radii;
		if (distance_squared < sum_radii_squared) {
			if (beastMode) {
				$(".minicircle:eq("+index+")").remove();
				upScore(1000);
			}
			else endGame();
		}
	});
	$(".magiccircle").each(function(index) {
		distance_squared = distanceSquared('player', $(".magiccircle:eq("+index+")").attr('id'));
		sum_radii = parseInt($(".magiccircle:eq("+index+")").css("border-radius")) + parseInt($('#player').css("border-radius"));
		sum_radii_squared = sum_radii * sum_radii;
		if (distance_squared < sum_radii_squared) {
			$(".magiccircle:eq("+index+")").remove();
			goBeastMode();
		}
	});
}
function endGame() {
	window.location.href = "http://tclinken.github.io/gameover";
}
function generateRandom() {
	rand = Math.random();
	if (rand > .06) return
	else if (rand > .01) {
		while (true) {
			x = parseInt(Math.random()*1000);
			y = parseInt(Math.random()*500);
			shade = parseInt(Math.random()*255);
			numChasers++;
			var newMiniCircle = $('<div class="minicircle"></div>');
			newMiniCircle.css("left", x + "px");
			newMiniCircle.css("top", y + "px");
			newMiniCircle.attr('id', 'chaser'+numChasers);
			newMiniCircle.css("border", "20px solid rgb(" + shade + "," + shade + "," + shade + ")");
			$('body').append(newMiniCircle);
			if (distanceSquared('player', newMiniCircle.attr('id')) < 6400) {
				newMiniCircle.remove();
				continue;
			}
			else break;
		}
	}
	else {
		while (true) {
			x = parseInt(Math.random()*1000);
			y = parseInt(Math.random()*500);
			numMagic++;
			var newMagicCircle = $('<div class="magiccircle"></div>');
			newMagicCircle.css("left", x + "px");
			newMagicCircle.css("top", y + "px");
			newMagicCircle.attr('id', 'magic'+numMagic);
			$('body').append(newMagicCircle);
			if (distanceSquared('player', newMagicCircle.attr('id')) < 6400) {
				newMagicCircle.remove();
				continue;
			}
			else break;
		}
	}
}
function tickBlink(id) {
	if ($('#' + id).css("border") == "20px solid rgb(255, 255, 0)") {
		$('#' + id).css("border", "20px solid orange");
	}
	else $('#' + id).css("border", "20px solid yellow");
}
function goBeastMode() {
	if (beastMode) return;
	beastMode = 1;
	$('#gamecontainer').css("background", "red");
	timeoutID = window.setTimeout(function() { $('#gamecontainer').css("background", "blue"); beastMode = 0; }, 3000);
}
function distanceSquared(id1, id2) {
	x1 = parseInt($('#' + id1).css("left")) + parseInt($('#' + id1).css("border-radius"));
	y1 = parseInt($('#' + id1).css("top")) + parseInt($('#' + id1).css("border-radius"));
	x2 = parseInt($('#' + id2).css("left")) + parseInt($('#' + id2).css("border-radius"));
	y2 = parseInt($('#' + id2).css("top")) + parseInt($('#' + id2).css("border-radius"));
	result = (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2);
	console.log(result);
	return result;
}