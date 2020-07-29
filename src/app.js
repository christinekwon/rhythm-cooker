/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
// import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { SeedScene } from 'scenes';
import MAPPING from "./mapping.png";

// initialize constants

const keys = {
	"C": ["c", "d", "e", "f", "g", "a", "b"],
	"G": ["c", "d", "e", "f+", "g", "a", "b"],
	"D": ["c+", "d", "e", "f+", "g", "a", "b"],
	"A": ["c+", "d", "e", "f+", "g+", "a", "b"],
	"E": ["c+", "d+", "e", "f+", "g+", "a", "b"],
	"B": ["c+", "d+", "e", "f+", "g+", "a+", "b"],
	"F+": ["c+", "d+", "e+", "f+", "g+", "a+", "b"],
	"C+": ["c+", "d+", "e+", "f+", "g+", "a+", "b+"],
	"F": ["c", "d", "e", "f", "g", "a", "b-"],
	"B-": ["c", "d", "e-", "f", "g", "a", "b-"],
	"E-": ["c", "d", "e-", "f", "g", "a-", "b-"],
	"A-": ["c", "d-", "e-", "f", "g", "a-", "b-"],
	"D-": ["c", "d-", "e-", "f", "g-", "a-", "b-"],
	"G-": ["c-", "d-", "e-", "f", "g-", "a-", "b-"],
	"C-": ["c-", "d-", "e-", "f-", "g-", "a-", "b-"],
};

const WHOLE = 1;
const HALF = 2;
const QUARTER = 4;
const EIGHTH = 8;
const SIXTEENTH = 16;
const DOTTED_HALF = 4 / 3;
const DOTTED_QUARTER = 8 / 3;

const THIRD = 3;
const TWO_THIRDS = 3 / 2;
const SIXTH = 6;

// const LENGTHS_4 = [HALF, QUARTER, EIGHTH, SIXTEENTH, DOTTED_QUARTER];
// const LENGTHS_8 = [THIRD, TWO_THIRDS, SIXTEENTH];

const LENGTHS = [HALF, QUARTER, EIGHTH, SIXTEENTH, DOTTED_QUARTER];


const NOTE_COUNT = 7;
const LENGTH_COUNT = LENGTHS.length;
const BARS = 4;

const NUM_SOUNDS = 4;

var play = false;
var showMap = false;

var T;
var gen;
var music;
var keyboard;
var sound = "mallet";

document.getElementById("start").addEventListener("click", start);

document.getElementById("start").addEventListener("mouseover", function() {
	document.getElementById("start").style.background = "rgb(96, 135, 172)";
});

document.getElementById("start").addEventListener("mouseout", function() {
	if (!play) {
		document.getElementById("start").style.background = "rgb(129, 166, 201)";
	}
});

function toggle(e){
	var checkbox;
	let id;
	for (let i = 0 ; i < NUM_SOUNDS; i++) {
		id ="sound" + i;
		checkbox = document.getElementById(id);
		if (id == e.target.id){
			sound = e.target.name;
		}
		else {
			checkbox.checked = false;
		}
	}
}

var sounds = document.getElementsByClassName("sound");
for (var i = 0; i < sounds.length; i++) {
	sounds[i].addEventListener("click", toggle);
}


document.getElementById("chord").addEventListener("click", chord);

document.getElementById("info").addEventListener("change", showInfo);
// document.getElementById("info").addEventListener("mouseout", hideInfo);
document.getElementById("tempo").addEventListener("onchange", updateTextInput);

function updateTextInput() {
	let val = document.getElementById("tempo").value;
	console.log("H");
	document.getElementById('tempo-text').value=val; 
}

function start() {
	// document.getElementById("stop").addEventListener("click", stop);

    var key = document.getElementById("key").value;
	var tempo = parseInt(document.getElementById("tempo").value);
	// var bpm = document.getElementById("time").value[0]; // beats per measure
	// var beat = document.getElementById("time").value[1];

    T = require("./timbre.js");
    
  // c4c+d == c c# d 2-1-1
  // + is a sharp
  // - is a flat
  // l# is length of note
  // number after a note indicates its length
  // if l8 and c4, then c is half of reg note length. if c2, c is 1/4 of note length
  // greater note length = faster
  // length = 4 =  quarter note
  // length = 2 = half note, etc
  // <c> ups an octave

    // var mml = "l8 t120 c4c+d d+4ef f+4gg+ a4a+b <c>bb-aa-gg-fee-dd-c2.";

	// var mml = "l2 g0<c0e>";
	
	if (!play) {
		document.getElementById("start").value = "stop";
		document.getElementById("start").style.background = "rgb(96, 135, 172)";

		var lengthList = [];

		var remainingTime = 1;
	
		while (remainingTime > 0) {
			lengthList, remainingTime = getNoteLength(lengthList, remainingTime);
		}
	
		var noteList = getNotes(lengthList, key);
	
		let bar1 = format(lengthList, noteList);
	
		lengthList = [];
	
		remainingTime = 1;
	
		while (remainingTime > 0) {
			lengthList, remainingTime = getNoteLength(lengthList, remainingTime);
		}
	
		var noteList = getNotes(lengthList, key);
	
		let bar2 = format(lengthList, noteList);
	
		var mml = initialMML(4, tempo);
		// mml += bar1;
		// mml += " ";
		for (let i = 0; i < 300; i++) {
			mml += bar1;
			// mml += bar2;
		}
		// mml += bar2;
		// mml += " ";
		// mml += bar1 + bar2;
		// mml += format(lengthList, noteList);
	
		// console.log(mml);
		// console.log(tempo);

		initializeGen();

		music = T("mml", {mml:mml}, gen).on("ended", stop).start();
		play = true;
	}
	else {
		document.getElementById("start").style.background = "rgb(129, 166, 201)";
		document.getElementById("start").value = "play";
		stop();
		play = false;
	}
	
	function stop() {
		gen.pause();
		music.stop();
	}
}




function chord() {

    var key = document.getElementById("key").value;

	T = require("./timbre.js");

	// var mml = "l2 g0<c0e>";
	var mml = "l1" + keys[key][Math.floor(Math.random() * (NOTE_COUNT))] + "0"
	+ keys[key][Math.floor(Math.random() * (NOTE_COUNT))];

	initializeGen();
	
    var music = T("mml", {mml:mml}, gen).on("ended", stop).start();
	
	function stop() {
		gen.pause();
		music.stop();
	}
}

function initializeGen() {
	if (sound == "mallet") {
		gen = T("OscGen", {wave:"sin", env:{type:"perc"}, mul:0.25}).play();
	}
	else if (sound == "synth") {
		// synth, change r for reverb
		var osc = T("pulse");
		var env = T("perc", {a:50, r:2500});
		gen = T("OscGen", {osc:osc, env:env, mul:0.1}).play();
	}
	else if (sound == "guitar") {
		var env = T("perc", {a:50, r:2500});
		gen = T("PluckGen", {env:env, mul:0.5}).play();
	}
	else if (sound == "kick") {
		// drum, add changes things
		gen = T("OscGen", {wave:"sin", freq:2, add:3200, mul:0.3, kr:10}).play();
	}
}

function getNoteLength(lengthList, remainingTime) {
	// if (beat == "4") {

	// }
    let randLength = LENGTHS[Math.floor(Math.random() * (LENGTH_COUNT))];
    let len = lengthList.length;
    // if (len >=2 && lengthList[len - 1] == 16 && lengthList[len - 2 != 16]) {

	// }
	// don't want 2 half notes in a rhythm
	if (lengthList.includes(HALF)) {
		while (randLength <= HALF) {
			randLength = LENGTHS[Math.floor(Math.random() * (LENGTH_COUNT))];
		}
		// console.log("EHRE");
	}
	// console.log(lengthList);


    if ((1 / randLength) > remainingTime) {
		// let prev = lengthList[lengthList.length - 1];
		// console.log(randLength + " " + remainingTime);
        lengthList.push(1 / remainingTime);

        // lengthList[lengthList.length - 1] += getBarLength(remainingTime);
        // console.log(remainingTime);
        remainingTime = 0;
    }
    else {
        lengthList.push(randLength);
        remainingTime -= (1 / randLength);
    }
    
    return lengthList, remainingTime;
}

function getBarLength(remainingTime) {
    let count = 0;
    while (remainingTime > 0.1875) {
        count++;
    }
    console.log(count);

    return 16 / count;
    // let sum = 0.0;
    // for (let i = 0; i < lengthList.length; i++) {
    //     sum += (1 / lengthList[i]);
    // }
    // return 1.0 - sum;
}

function getNotes(lengthList, key) {
    let noteList = [];
    for (let i = 0; i < lengthList.length; i++) {
        noteList.push(keys[key][Math.floor(Math.random() * (NOTE_COUNT))]);
    }
    return noteList;
}

function initialMML(length, tempo) {
    let output = "";
    output += "l" + length + " ";
    output += "t" + tempo + " ";
    return output;
}

function format(lengthList, noteList) {
        // var mml = "l2 g0<c0e>";
    let output = "";
    for (let i = 0; i< lengthList.length; i++) {
        output += noteList[i] + lengthList[i];
    }
    return output;
}



document.getElementById("mapping").src = MAPPING;

function showInfo() {
	// trigger("focus");

	var isChecked = document.getElementById("info").checked;
	if (isChecked) {
		// $(document.getElementById("info")).focus();
		$(document.getElementById("info")).trigger("focus");

		document.getElementById("mapping").style.visibility = "visible";
		document.getElementById("info").innerHTML = "turn keyboard off";
		showMap = true;

		var T = require("./timbre.js");
		require("./keyboard.js");
		require("./ndict.js");
		require("./midicps.js");
		var synth, keydict, midicps;
		var table = [0.8, [0, 1500]];
	
		var env = T("perc", {r:700});
		synth = T("OscGen", {wave:"sin", env:env, mul:0.2}).play();
		keydict = T("ndict.key");
		midicps = T("midicps");
	
		keyboard = T("keyboard").on("keydown", function(e) {
			var midi = keydict.at(e.keyCode);
			if (midi) {
			var freq = midicps.at(midi);
			synth.noteOnWithFreq(freq, 100);
			}
		}).on("keyup", function(e) {
			var midi = keydict.at(e.keyCode);
			if (midi) {
			synth.noteOff(midi, 100);
			}
		}).start();

	}
	else {
		document.getElementById("mapping").style.visibility = "hidden";
		document.getElementById("info").innerHTML = "turn keyboard on";
		keyboard.stop();
		showMap = false;
	}
}

function hideInfo() {
  document.getElementById("mapping").style.visibility = "hidden";
}