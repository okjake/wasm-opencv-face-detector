import FaceDetector from '../../lib/wasm-opencv-face-detector.js';

let width  = 0;
let height = 0;

const video  = document.createElement('video');
const input  = document.createElement('canvas');
const output = document.createElement('canvas');

const inputCtx  = input.getContext('2d');
const outputCtx = output.getContext('2d');

let faceDetector = null;

function handleError(err) { console.log(err); }

function main() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(setupVideo)
    .catch(handleError);
}

function setupVideo(stream) {
  video.addEventListener('canplay', setupDetector, false);
  video.addEventListener('canplay', processFrame, false);
  video.srcObject = stream;
  video.play();
}

function setupDetector(e) {
  document.body.appendChild(output);
  width  = output.width  = input.width  = video.videoWidth;
  height = output.height = input.height = video.videoHeight;
  video.setAttribute('width', width);
  video.setAttribute('height', height);
  faceDetector = new FaceDetector(width, height);
  e.target.removeEventListener(e.type, this);
}

function processFrame() {
  inputCtx.drawImage(video, 0, 0, width, height);
  outputCtx.drawImage(video, 0, 0, width, height);
  const img = inputCtx.getImageData(0, 0, width, height);
  console.log('faces:', faceDetector.detectFaces(img.data));
  window.requestAnimationFrame(processFrame);
}

window.addEventListener('load', main);