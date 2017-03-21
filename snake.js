window.addEventListener("load", init, false);

// Variables du jeu
var nb_cases;
var CASE_WIDTH = 13;
var CASE_HEIGHT = 13;
var direction;

var pos_X;
var pos_Y;

var canvas;
var context;
var timer_refresh;
var interval;

var LEFT = -1;
var RIGHT = 1;
var UP = -2;
var DOWN = 2;

var food;
var direction_changed;
var start;
var score;

function init()
{
	canvas = document.getElementsByTagName("canvas")[0];	
	if(!canvas || !canvas.getContext)
		return;
	
	context = canvas.getContext("2d");	
	if(!context)
		return;

	// On continue	
	document.getElementsByClassName("jouer")[0].addEventListener("click", demarrer, false);
	food = {
			x:0,
			y:0
		};
	direction_changed = false;
	window.addEventListener("keydown", deplacer, false);
}

function demarrer()
{
	document.getElementsByClassName("jouer")[0].style.visibility = "hidden";
	direction = RIGHT;
	nb_cases = 3;
	
	pos_X = new Array();
	pos_Y = new Array();
	
	pos_X = [150, 135, 120];
	pos_Y = [300, 300, 300];
	
	new_food();
	interval = 130;
	score = 0;
	start = true;
	
	timerRefresh = setTimeout(refresh, interval);
}

function refresh()
{	
	var old_case = {
			x:pos_X[pos_X.length-1],
			y:pos_Y[pos_Y.length-1]
		};
		
	// On passe la dernière case du tableau en premier
	pos_X.splice(0, 0, pos_X[pos_X.length-1]);
	pos_Y.splice(0, 0, pos_X[pos_Y.length-1]);
	pos_X.pop();
	pos_Y.pop();
	
	// Calcul des nouveaux coordonnées de la nouvelle première case en fonction de la direction et de la deuxième
	switch(direction)
	{
		case LEFT :
			pos_X[0] = pos_X[1]-CASE_WIDTH-2;
			pos_Y[0] = pos_Y[1];
			break;
		case RIGHT :
			pos_X[0] = pos_X[1]+CASE_WIDTH+2;
			pos_Y[0] = pos_Y[1];
			break;
		case UP :
			pos_Y[0] = pos_Y[1]-CASE_WIDTH-2;
			pos_X[0] = pos_X[1];
			break;
		case DOWN :
			pos_Y[0] = pos_Y[1]+CASE_WIDTH+2;
			pos_X[0] = pos_X[1];
			break;
	}
	
	// Test perdu
	if(pos_X[0]+CASE_WIDTH+2 > canvas.width || pos_X[0] < 0 || pos_Y[0]+CASE_HEIGHT+2 > canvas.height || pos_Y[0] < 0 || choc_serpent())
	{
		perdu();
		return;
	}
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "#000000";
	
	// Score
	context.font = '12px Harabara';
	context.fillText("Score : "+score, 15, 20);
	
	// Food
	context.fillRect(food.x, food.y, CASE_WIDTH, CASE_HEIGHT);

	for(var i = 0 ; i < nb_cases ; i++) // Le serpent
		context.fillRect(pos_X[i], pos_Y[i], CASE_WIDTH, CASE_HEIGHT);
		
	// Test food hit
	if(food_hit())
	{
		// Nouvelle case + nouvelle nourriture
		pos_X.push(old_case.x);
		pos_Y.push(old_case.y);
		nb_cases++;
		if(interval > 2)
			interval -= 2;
		score += 1;
		new_food();
	}
	
	direction_changed = false;
	timerRefresh = setTimeout(refresh, interval);
}

function deplacer(e)
{
	/*
	 * Gauche : 37
	 * Haut : 38
	 * Droite : 39
	 * Bas : 40
	 * Espace : 32
	 */
	
	var touche = e.keyCode;
	if(touche >= 37 && touche <= 40 || touche == 32)
		e.preventDefault();
	
	if(direction_changed && start) return;
	
	direction_changed = true;
	if(touche == 37 && direction != -LEFT)
		direction = LEFT;
	else if(touche == 38 && direction != -UP)
		direction = UP;
	else if(touche == 39 && direction != -RIGHT)
		direction = RIGHT;
	else if(touche == 40 && direction != -DOWN)
		direction = DOWN;
	
	// Espace
	if(touche == 32 && document.getElementsByClassName("jouer")[0].style.visibility == "visible") // Espace
		demarrer();	
}

function new_food()
{
	var cols = Math.floor(canvas.width/(CASE_WIDTH+2));
	var alea = Math.floor(Math.random()*(cols-1)); // Génère un nombre entre 0 et cols
	food.x = alea*(CASE_WIDTH+2);
	var rows = Math.floor(canvas.height/(CASE_HEIGHT+2));
	alea = Math.floor(Math.random()*rows-1); // Génère un nombre entre 0 et rows
	food.y = alea*(CASE_HEIGHT+2);
	if(food_hit() || food.x < 0 || food.y < 0) // La position générée est sur le serpent
		new_food();
}

function food_hit()
{
	var length = pos_X.length;	
	for(var i = 0 ; i < length ; i++)
	{
		if(pos_X[i] == food.x && pos_Y[i] == food.y)
			return true;
	}	
	return false;
}

function choc_serpent()
{
	var tab = new Array();
	var index;
	for(var i = 0 ; i < pos_X.length ; i++)
	{
		index = tab.indexOf(pos_X[i]);
		if(index != -1 && pos_Y[i] == pos_Y[index]) // Valeur déjà présente
			return true;
		else
			tab.push(pos_X[i]);
	}
	
	return false;
}

function perdu()
{
	clearTimeout(timerRefresh);
	var play = document.getElementsByClassName("jouer")[0];
	play.innerHTML = "Rejouer";
	play.style.width = "105px";
	play.style.visibility = "visible";
	start = false;
	
	// Ajax
	// insert_high_score();
}

function insert_high_score()
{
	var e;
	if(window.XMLHttpRequest)
		e = new XMLHttpRequest;
	else
		e = new ActiveXObject("Microsoft.XMLHTTP");

	e.open("POST","http://www.thomas-hiron.com/inc/scripts/high_score_snake.php", true);
	e.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	e.send("s="+score);
}
