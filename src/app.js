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

// graphics start here

// Initialize core ThreeJS components
// const scene = new SeedScene();
// const camera = new PerspectiveCamera();
// const renderer = new WebGLRenderer({ antialias: true });

// // Set up camera
// camera.position.set(6, 3, -10);
// camera.lookAt(new Vector3(0, 0, 0));

// // Set up renderer, canvas, and minor CSS adjustments
// renderer.setPixelRatio(window.devicePixelRatio);
// const canvas = renderer.domElement;
// canvas.style.display = 'block'; // Removes padding below canvas
// document.body.style.margin = 0; // Removes margin around page
// document.body.style.overflow = 'hidden'; // Fix scrolling
// document.body.appendChild(canvas);

// // Set up controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enablePan = false;
// controls.minDistance = 4;
// controls.maxDistance = 16;
// controls.update();

// // Render loop
// const onAnimationFrameHandler = (timeStamp) => {
//     controls.update();
//     renderer.render(scene, camera);
//     scene.update && scene.update(timeStamp);
//     window.requestAnimationFrame(onAnimationFrameHandler);
// };
// window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
// const windowResizeHandler = () => {
//     const { innerHeight, innerWidth } = window;
//     renderer.setSize(innerWidth, innerHeight);
//     camera.aspect = innerWidth / innerHeight;
//     camera.updateProjectionMatrix();
// };
// windowResizeHandler();
// window.addEventListener('resize', windowResizeHandler, false);

// graphics end here

document.getElementById("start").addEventListener("click", start);

document.getElementById("info").addEventListener("mouseover", showInfo);
document.getElementById("info").addEventListener("mouseout", hideInfo);
document.getElementById("tempo").addEventListener("onchange", updateTextInput);

function updateTextInput() {
	let val = document.getElementById("tempo").value;
	console.log("H");
	document.getElementById('tempo-text').value=val; 
}

function start() {
	document.getElementById("stop").addEventListener("click", stop);

    var key = document.getElementById("key").value;
	var tempo = parseInt(document.getElementById("tempo").value);
	// var bpm = document.getElementById("time").value[0]; // beats per measure
	// var beat = document.getElementById("time").value[1];

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

	T("keyboard").on("keydown", function(e) {
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

    var T = require("./timbre.js");
    
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

    var gen = T("OscGen", {wave:"sin", env:{type:"perc"}, mul:0.25}).play();
    
    var music = T("mml", {mml:mml}, gen).on("ended", stop).start();
	
	function stop() {
		gen.pause();
		music.stop();
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
  document.getElementById("mapping").style.visibility = "visible";
}

function hideInfo() {
  document.getElementById("mapping").style.visibility = "hidden";
}

// add back for graphics (2 lines)
// windowResizeHandler();
// window.addEventListener('resize', windowResizeHandler, false);



// window.addEventListener("keydown", handleKeyDown);
// // window.addEventListener("keyup", handleKeyUp);
// function handleKeyDown(event) {
//       scene.key = event.key;

//   }