import Stats from 'stats-js';
import { shuffle } from 'lodash';
import FaceDetector, { setup } from '../../lib/wasm-opencv-face-detector.js';

/**
 * A few global vars to keep things simple
 */
const stats = new Stats();

let width  = 0;
let height = 0;

const video  = document.createElement('video');
const input  = document.createElement('canvas');
const output = document.createElement('canvas');

const inputCtx  = input.getContext('2d');
const outputCtx = output.getContext('2d');

let faceDetector = null;
let faces = [];

/**
 * Randomly ordered array of emojis that we'll use to overlay on faces
 */
const emoji = shuffle([
  String.fromCodePoint(0x1F601),
  String.fromCodePoint(0x1F602),
  String.fromCodePoint(0x1F604),
  String.fromCodePoint(0x1F60D),
  String.fromCodePoint(0x1F618),
  String.fromCodePoint(0x1F621),
  String.fromCodePoint(0x1F631),
  String.fromCodePoint(0x1F633),
  String.fromCodePoint(0x1F638),
  String.fromCodePoint(0x1F648),
  String.fromCodePoint(0x1F4A9)
]);

function handleError(err) { console.log(err); }

/**
 * Open the video stream
 */
async function main() {
  try {
    await setup();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setupVideo(stream);
  } catch(err) {
    handleError(err);
  }
}

/**
 * Set up the video object and bind event listeners
 * @param stream 
 */
function setupVideo(stream) {
  video.addEventListener('canplay', setupDetector, false);
  video.addEventListener('canplay', processFrame, false);
  video.srcObject = stream;
  video.play();
}

/**
 * Adds the output canvas to the DOM
 * Sets the dimensions of DOM elements
 * Instantiatates the FaceDetector
 * Removes itself, run only once
 * @param {event} e 
 */
function setupDetector(e) {
  document.body.appendChild(output);

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  width  = output.width  = input.width  = video.videoWidth;
  height = output.height = input.height = video.videoHeight;
  video.setAttribute('width', width);
  video.setAttribute('height', height);
  faceDetector = new FaceDetector(width, height);
  e.target.removeEventListener(e.type, this);
}

/**
 * Writes the video frame into input canvas
 * Passes the image data into the face detector
 * Smoothes the result, avoid flickers and jumps
 * Draws the video frame into the output canvas
 * Draws faces on top
 * Adds itself to the queue for next animation frame 
 */
function processFrame() {
  stats.begin();
  inputCtx.drawImage(video, 0, 0, width, height);
  
  const img = inputCtx.getImageData(0, 0, width, height);
  const faces = faceDetector.detectInImage(img.data);

  outputCtx.drawImage(video, 0, 0, width, height);
  faces.forEach(drawFace);

  stats.end();
  window.requestAnimationFrame(processFrame);
}

/**
 * Draws an emoji onto the canvas
 * @param {object} face 
 */
function drawFace(face, index) {
  outputCtx.font = `${face.height}px sans-serif`;
  outputCtx.fillText(emoji[index], face.x, face.y + face.height);
}

window.addEventListener('load', main);