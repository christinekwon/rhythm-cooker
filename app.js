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

// import { Keyboard } from './keyboard.js';


// Initialize core ThreeJS components

const camera = new PerspectiveCamera(70, 20, 1, 50);
// const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(0, 0, -50);
camera.lookAt(new Vector3(0, 0, 0));
// console.log(camera.position);

const scene = new SeedScene(camera);

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
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

document.getElementById("start").addEventListener("click", start);
document.getElementById("info").addEventListener("mouseover", showInfo);
document.getElementById("info").addEventListener("mouseout", hideInfo);

function start() {
  console.log("HERE");
  var T = require("./timbre.js");
  require("./keyboard.js");
  require("./ndict.js");
  require("./midicps.js");
  var synth, keydict, midicps;
  // synth = T("OscGen", {wave:"sin", mul:0.05}).play();
  var table = [0.8, [0, 1500]];

  // var osc = T("pulse");
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
}

document.getElementById("mapping").src = MAPPING;

function showInfo() {
  document.getElementById("mapping").style.visibility = "visible";
}

function hideInfo() {
  document.getElementById("mapping").style.visibility = "hidden";
}


windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
function handleKeyDown(event) {
    // if (event.key != undefined)
      scene.key = event.key;
    // if (scene.key == 'a') {
    //     var sine1 = T("sin", {freq:440, mul:0.5});
    //     var sine2 = T("sin", {freq:660, mul:0.5});

    //     T("perc", {r:500}, sine1, sine2).on("ended", function() {
    //     this.pause();
    //     }).bang().play();
    // } 

  }
  
  // once key is lifted, set SeedScene key to default value
  function handleKeyUp(event) {
    scene.key = undefined;
  }


  // async function start() {
  //   await new Promise(r => setTimeout(r, 1200));
  //   synth = T("OscGen", {wave:"sin", mul:0.05}).play();

  //     keydict = T("ndict.key");
  //     midicps = T("midicps");
  // }
