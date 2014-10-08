var leftKey = 0; // is the left key down
var rightKey = 0; // is the right key down
var upKey = 0; // is the up key down
var downKey = 0; // is the down key down
var score = 0; // score
var numChasers = 2; // tracks the number of chasers that have been created (for indexing purposes)
var numMagic = 0; // tracks the number of magic circles that have been created (for indexing purposes)
var beastMode = 0; // is the game in beast mode
var level = 1; // level
var pause = 0; // is the game currently paused
var backgrounds; // array of background images for each level

// called immediately after body is set up
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
	initializeBackgrounds();
	startGame();
});

// starts intervals
function startIntervals() {
	playerMove = setInterval( function() { tickMove("player") }, 5);
	collisionCheck = setInterval( function() { (checkCollision()) }, 60);
	miniCircleChase = setInterval( function() { $(".minicircle").each(function(index) { tickChase($(".minicircle:eq("+index+")").attr('id'), "player"); })}, 50 - 5*level);
	magicCircleBlink = setInterval( function() { $(".magiccircle").each(function(index) { tickBlink($(".magiccircle:eq("+index+")").attr('id')) })}, 100);
	randomGen = setInterval( function() { generateRandom(); }, 200);
}

// pauses intervals
function pauseIntervals() {
	clearInterval(collisionCheck);
	clearInterval(playerMove);
	clearInterval(miniCircleChase);
	clearInterval(magicCircleBlink);
	clearInterval(randomGen);
}


// initializes the backgrounds array
function initializeBackgrounds() {
	backgrounds = Array(3);
	backgrounds[0] = "level1.jpg";
	backgrounds[1] = "level2.png";
	backgrounds[2] = "level3.jpg";
}

// sets the background, depending on the current level
function setBackground() {
	if (level < backgrounds.length) $('#gamecontainer').css('background-image', 'url(' + backgrounds[level - 1] + ')');
	else $('#gamecontainer').css('background-image', 'url(' + backgrounds[backgrounds.length - 1] + ') no-repeat');
}

// pauses or unpauses the game, depending on current state
function togglePause() {
	if (pause) startIntervals();
	else pauseIntervals();
	pause = !pause;
}

// move the object with the given id one tick to the left
function tickLeft(id) {
	if (parseInt($('#' + id).css("left")) > 0) $('#' + id).css({"left": "-=1"});
}

// move the object with the given id one tick to the right
function tickRight(id) {
	if (parseInt($('#' + id).css("left")) < 1000) $('#' + id).css({"left": "+=1"});
}

// move the object with the given id one tick up
function tickUp(id) {
	if (parseInt($('#' + id).css("top")) > 0) $('#' + id).css({"top": "-=1"});
}

// move the object with the given id one tick down
function tickDown(id) {
	if (parseInt($('#' + id).css("top")) < 500) $('#' + id).css({"top": "+=1"});
}

// move the object with the given id (alway "player" for now)
function tickMove(id) {
	if (leftKey) tickLeft(id);
	if (rightKey) tickRight(id);
	if (upKey) tickUp(id);
	if (downKey) tickDown(id);
	upScore(1);
}

// chaser moves in the direction of runner
function tickChase(chaser, runner) {
	// center coordinates of chaser
	chaser_x = parseInt($('#' + chaser).css("left")) + parseInt($('#' + chaser).css("border-radius"));
	chaser_y = parseInt($('#' + chaser).css("top")) + parseInt($('#' + chaser).css("border-radius"));
	// center coordinates of runner
	runner_x = parseInt($('#' + runner).css("left")) + parseInt($('#' + runner).css("border-radius"));
	runner_y = parseInt($('#' + runner).css("top")) + parseInt($('#' + runner).css("border-radius"));
	var goLeft, goRight, goUp, goDown; // in which directions should the chaser move
	if (beastMode) { // if beastMode is on, the chaser actuall runs away from runner
		goLeft = (chaser_x < runner_x);
		goRight = (chaser_x > runner_x);
		goUp = (chaser_y < runner_y);
		goDown = (chaser_y > runner_y);
	}
	else {
		goLeft = (chaser_x > runner_x);
		goRight = (chaser_x < runner_x);
		goUp = (chaser_y > runner_y);
		goDown = (chaser_y < runner_y);
	}
	if (goLeft) tickLeft(chaser);
	if (goRight) tickRight(chaser);
	if (goUp) tickUp(chaser);
	if (goDown) tickDown(chaser);
}

// increase score by x points
function upScore(x) {
	initScore = score;
	score += x;
	$('#score').html(score + "");
	// increase level if necessary
	if (Math.floor(score/10000) > Math.floor(initScore/10000)) {
		level++;
		checkLevel();
	}
}

// update display based on state of level
function checkLevel() {
	$('#level').html(level + "");
	// intervals are restarted, and now chasers are faster
	pauseIntervals();
	startIntervals();
	setBackground(); // background should change for each level
}

// check to see if the player overlaps any other circles, and act accordingly
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

// game is over
function endGame() {
	$('#gameover').css('visibility', 'visible');
	pauseIntervals();
}

// create a random new circle, which could either be magic or a chaser
function generateRandom() {
	rand = Math.random();
	if (rand > .06) return
	else if (rand > .01) {
		while (true) {
			x = parseInt(Math.random()*1000);
			y = parseInt(Math.random()*500);
			newMiniCircle = createMinicircle(x, y);
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
			newMagicCircle = createMagiccircle(x, y);
			if (distanceSquared('player', newMagicCircle.attr('id')) < 6400) {
				newMagicCircle.remove();
				continue;
			}
			else break;
		}
	}
}

// a magic circle changes color
function tickBlink(id) {
	if ($('#' + id).css("border") == "20px solid rgb(255, 255, 0)") {
		$('#' + id).css("border", "20px solid orange");
	}
	else $('#' + id).css("border", "20px solid yellow");
}

// beast mode is turned on
function goBeastMode() {
	if (beastMode) return;
	beastMode = 1;
	$('#gamecontainer').css("background-image", 'url(beastmode.jpg)');
	timeoutID = window.setTimeout(function() { setBackground(); beastMode = 0; }, 3000);
}

// find the squared distance between the centers of circles id1 and id2
function distanceSquared(id1, id2) {
	x1 = parseInt($('#' + id1).css("left")) + parseInt($('#' + id1).css("border-radius"));
	y1 = parseInt($('#' + id1).css("top")) + parseInt($('#' + id1).css("border-radius"));
	x2 = parseInt($('#' + id2).css("left")) + parseInt($('#' + id2).css("border-radius"));
	y2 = parseInt($('#' + id2).css("top")) + parseInt($('#' + id2).css("border-radius"));
	result = (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2);
	return result;
}

// clear the screen (get rid of all (non-player) circles and the gameover screen)
function clearScreen() {
	$('.minicircle').remove()
	$('.magiccircle').remove()
	$('#gameover').css('visibility', 'hidden')
}

// creates a new minicircle at coordinates (x, y)
// returns the new minicircle created
function createMinicircle(x, y) {
	shade = parseInt(Math.random()*255);
	numChasers++;
	var newMiniCircle = $('<div class="minicircle"></div>');
	newMiniCircle.css("left", x + "px");
	newMiniCircle.css("top", y + "px");
	newMiniCircle.attr('id', 'chaser'+numChasers);
	newMiniCircle.css("border", "20px solid rgb(" + shade + "," + shade + "," + shade + ")");
	$('body').append(newMiniCircle);
	return newMiniCircle;
}

// creates a new magiccircle at coordinates (x, y)
// returns the new magiccircle created
function createMagiccircle(x, y) {
	numMagic++;
	var newMagicCircle = $('<div class="magiccircle"></div>');
	newMagicCircle.css("left", x + "px");
	newMagicCircle.css("top", y + "px");
	newMagicCircle.attr('id', 'magic'+numMagic);
	$('body').append(newMagicCircle);
	return newMagicCircle;
}

// starts the game
function startGame() {
	$('#player').css('left', '300px');
	$('#player').css('top', '300px');
	createMinicircle(100,100);
	createMinicircle(900,400);
	startIntervals();
	score = 0;
	level = 1;
	checkLevel();
}




