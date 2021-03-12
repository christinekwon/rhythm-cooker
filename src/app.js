/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
import MAPPING from "./mapping.png";
import WAVES from "./waves.png";


// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
// renderer.gammaInput = true;
// renderer.gammaOutput = true;
// Set up camera
camera.position.set(0, 2, -15);
camera.lookAt(new Vector3(0, 0, 0));

// scene.background = "rgb(0,0,0)";

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
// document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);


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
// const DOTTED_HALF = 1.33;
const DOTTED_QUARTER = 8 / 3;
// const DOTTED_QUARTER = 2.67;

const THIRD = 3;
const TWO_THIRDS = 3 / 2;
const SIXTH = 6;

// const LENGTHS_4 = [HALF, QUARTER, EIGHTH, SIXTEENTH, DOTTED_QUARTER];
// const LENGTHS_8 = [THIRD, TWO_THIRDS, SIXTEENTH];

const LENGTHS_4 = [HALF, DOTTED_HALF, DOTTED_QUARTER, QUARTER, EIGHTH, SIXTEENTH, QUARTER, EIGHTH, SIXTEENTH, QUARTER, EIGHTH, SIXTEENTH, QUARTER, EIGHTH, SIXTEENTH];
// const LENGTHS_8 = [HALF, THIRD, SIXTH, SIXTEENTH];
// const LENGTHS_8 = [HALF, THIRD, SIXTH, TWO_THIRDS, SIXTEENTH];
const LENGTHS_8 = [SIXTEENTH];

const NOTE_COUNT = 7;
// const LENGTH_COUNT = LENGTHS.length;

const NUM_SOUNDS = 4;

var play = false;
var showMap = false;

var T;
var gen;
var music;
var keyboard;
var sound = "mallet";
var lengthList;

document.getElementById("start").addEventListener("click", rhythm);

document.getElementById("start").addEventListener("mouseover", function() {
	document.getElementById("start").style.background = "rgba(255, 255, 255, 1)";
});

document.getElementById("start").addEventListener("mouseout", function() {
	if (!play) {
		document.getElementById("start").style.background = "rgba(255, 255, 255, 0.8)";
	}
});

document.getElementById("chord").addEventListener("click", chord);
document.getElementById("chord").addEventListener("mouseover", function() {
	document.getElementById("chord").style.background = "rgba(255, 255, 255, 1)";
});

document.getElementById("chord").addEventListener("mouseout", function() {
	if (!play) {
		document.getElementById("chord").style.background = "rgba(255, 255, 255, 0.8)";
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

document.getElementById("info").addEventListener("change", showInfo);

function getTempo() {
	let tempo = parseInt(document.getElementById("tempo").value);
	let beat = parseInt(document.getElementById("time").value.charAt(2));
	if (beat == 4) {
		return tempo;
	}
	else if (beat == 8) {
		return tempo * (2 / 3);
	}
}

function rhythm() {
	var tempo = getTempo();
	// var bpm = document.getElementById("time").value[0]; // beats per measure
	// var beat = document.getElementById("time").value[1];

    T = require("./timbre.js");
	
	if (!play) {
		document.getElementById("start").value = "stop";
		document.getElementById("start").style.background = "rgba(255, 255, 255, 1)";
	
		let mml = initialMML(4, tempo);
		mml += getMML();
	
		initializeGen();

		music = T("mml", {mml:mml}, gen).on("ended", stop).start();
		play = true;
		// scene.changeColors(tempo, lengthList);
	}
	else {
		document.getElementById("start").style.background = "rgba(255, 255, 255, 0.8)";
		document.getElementById("start").value = "rhythm";
		document.getElementById("mml").innerHTML = "";

		stop();
		play = false;
		// scene.stopColors();
	}
	
	function stop() {
		gen.pause();
		music.stop();
	}
}

function getMML() {
	let key = document.getElementById("key").value;
	let bars = parseInt(document.getElementById("repeat").value);
	let octave = parseFloat(document.getElementById("octave").value);
	let remainingTime;
	let noteList;
	let segment = "";
	let mml = "";
	if (octave == "3.0") {
		segment += "<";
	}
	for (let i = 0; i < bars; i++) {
		lengthList = [];
		noteList = [];


		remainingTime = 1;
	
		while (remainingTime > 0) {
			lengthList, remainingTime = getNoteLength(lengthList, remainingTime);
		}
	
		noteList = getNotes(lengthList, key);
	
		segment += format(lengthList, noteList);
	}
	if (octave == "3.0") {
		segment += ">";
	}
	for (let i = 0; i < 300; i++) {
		mml += segment;
	}
	console.log(segment);
	// document.getElementById("mml").innerHTML = segment;
	return mml;
}

function chord() {
	if (!play) {
		var tempo = getTempo();
		document.getElementById("chord").value = "stop";
		document.getElementById("start").style.background = "rgba(255, 255, 255, 1)";
	
		var key = document.getElementById("key").value;

		T = require("./timbre.js");
	
		// var mml = "l1 g0<c0e> g0<c0e>";
		var mml = "l2 t" + tempo + " ";
		
		var chords = getChord(key) + getChord(key) + getChord(key) + getChord(key);
	
		for (let i = 0; i < 300; i++) {
			mml += chords;
		}
		console.log(chords);
	
		initializeGen();
		
		music = T("mml", {mml:mml}, gen).on("ended", stop).start();
		play = true;
		// document.getElementById("mml").innerHTML = chords;
	}
	else {
		document.getElementById("chord").style.background = "rgba(255, 255, 255, 0.8)";
		document.getElementById("chord").value = "chord";
		stop();
		play = false;
		document.getElementById("mml").innerHTML = "";
	}

	function stop() {
		gen.pause();
		music.stop();
	}
}

function getChord(key) {
	let numNotes = 2;
	// var numNotes = Math.floor(Math.random() * (4 - 2)) + 2;
	if (numNotes == 2) {
		let note1 = Math.floor(Math.random() * (NOTE_COUNT));
		let note2 = Math.floor(Math.random() * (NOTE_COUNT));
		while (note1 == note2 || Math.abs(note1 - note2) == 1) {
			note2 = Math.floor(Math.random() * (NOTE_COUNT));
		}
		return keys[key][note1] + "0" + keys[key][note2] + " ";
	}
	else if (numNotes == 3) {
		return keys[key][Math.floor(Math.random() * (NOTE_COUNT))] + "0"
		+ keys[key][Math.floor(Math.random() * (NOTE_COUNT))] + "0"
		+ keys[key][Math.floor(Math.random() * (NOTE_COUNT))] + " ";
	}
}

function initializeGen() {
	sound = document.getElementById("sound").value;
	if (sound == "mallet") {
		gen = T("OscGen", {wave:"sin", env:{type:"perc"}, mul:0.25}).play();
	}
	else if (sound == "synth") {
		// synth, change r for reverb
		var osc = T("pulse");
		var env = T("perc", {a:0, r:800});
		gen = T("OscGen", {osc:osc, env:env, mul:0.05}).play();
	}
	else if (sound == "guitar") {
		var env = T("perc", {a:50, r:2500});
		gen = T("PluckGen", {env:env, mul:0.5}).play();
	}
	else if (sound == "kick") {
		// drum, add changes things
		var osc = T("pulse");
		var env = T("perc", {a:0, r:800});
		gen = T("OscGen", {wave:"sin", env:env, osc:osc, freq:2, add:3200, mul:0.3, kr:1000}).play();
	}
	else if (sound == "organ") {
		gen = T("osc", {wave:"wavc(0200080f)", mul:0.5}).play();
		// gen = T("osc", {mul:0.15}).play();

	}
}

function getNoteLength(lengthList, remainingTime) {
	let time = document.getElementById("time").value;
	let beat = parseInt(time.charAt(2));
	var lengths;
	var length_count;

	if (beat == 4) {
		lengths = LENGTHS_4;
		length_count = LENGTHS_4.length;
	}
	else if (beat == 8) {
		lengths = LENGTHS_8;
		length_count = LENGTHS_8.length;
	}

    let randLength = lengths[Math.floor(Math.random() * (length_count))];
    let len = lengthList.length;
    // if (len >=2 && lengthList[len - 1] == 16 && lengthList[len - 2 != 16]) {

	// }
	// don't want 2 half notes in a rhythm
	if (beat == 4) {
		if (lengthList.includes(HALF)) {
			while (randLength <= HALF) {
				randLength = lengths[Math.floor(Math.random() * (length_count))];
			}
		}
	}

	// last note
    if ((1 / randLength) > remainingTime) {
		// let prev = lengthList[lengthList.length - 1];
		// lengthList.push(1 / remainingTime);
		
		let prev = 1 / lengthList[len - 1];
		prev += remainingTime;
		// lengthList[len - 1] = truncateDecimals(1 / prev, 1);
		lengthList[len - 1] = truncateDecimals(1 / prev, 2);
        // lengthList[lengthList.length - 1] += getBarLength(remainingTime);
        remainingTime = 0;
    }
    else {
        lengthList.push(randLength);
        remainingTime -= (1 / randLength);
    }
    
    return lengthList, remainingTime;
}

function truncateDecimals(number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

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
	let octave = parseFloat(document.getElementById("octave").value);
	let octaves;
	if (octave == 2.5) {
		octaves = [];
		for (let i = 0; i < lengthList.length; i++) {
			// 2 or 3;
			octaves.push(Math.floor(Math.random() * (4 - 2)) + 2);
		}
	}
    let output = "";
    for (let i = 0; i< lengthList.length; i++) {
		if (octave == 2.5) {
			if (octaves[i] == 2) {
				output += noteList[i] + lengthList[i];
			}
			else {
				output += "<" + noteList[i] + lengthList[i] + ">";
			}
		}
		else {
			output += noteList[i] + lengthList[i] + " ";
		}
    }
    return output;
}


document.getElementById("mapping").src = MAPPING;
// set background image
document.getElementById("waves").src = WAVES; 

function showInfo() {
	var isChecked = document.getElementById("info").checked;
	if (isChecked) {
		$(document.getElementById("mobile-keyboard")).trigger("focus");

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