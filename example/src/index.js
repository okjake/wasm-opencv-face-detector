import FaceDetector from '../../lib/wasm-opencv-face-detector.js';

let width  = 0;
let height = 0;

const video  = document.createElement('video');
const input  = document.createElement('canvas');
const output = document.createElement('canvas');

const inputCtx  = input.getContext('2d');
const outputCtx = output.getContext('2d');

let faceDetector = null;
let faces = [];

const emoji = [
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
];

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
  const detectedFaces = faceDetector.detectFaces(img.data);

  faces = smoothTowards(detectedFaces);
  faces.forEach(drawFace);

  window.requestAnimationFrame(processFrame);
}

function smoothTowards(detectedFaces) {
  return detectedFaces.map((face, i) => {
    if (detectedFaces[i] && !faces[i]) {
      detectedFaces[i].emoji = emoji[Math.floor(Math.random() * emoji.length)];
      return detectedFaces[i];
    }

    return {
      x: getSmoothedValue(faces[i].x, detectedFaces[i].x),
      y: getSmoothedValue(faces[i].y, detectedFaces[i].y),
      width: getSmoothedValue(faces[i].width, detectedFaces[i].width),
      height: getSmoothedValue(faces[i].height, detectedFaces[i].height),
      emoji: faces[i].emoji
    };
  });
}

function getSmoothedValue(current, target) {
  const MIN_DIFF_PX = 5;
  const MAX_DIFF_PX = 10;
  
  const diff = target - current;

  if (diff > MAX_DIFF_PX) {
    return current + MAX_DIFF_PX;
  }

  if (diff < (-1 * MAX_DIFF_PX)) {
    return current - MAX_DIFF_PX;
  }

  if (Math.abs(diff) < MIN_DIFF_PX) {
    return current;
  }

  return target;
}

function drawFace(face) {
  outputCtx.font = `${face.height}px sans-serif`;
  outputCtx.fillText(face.emoji, face.x, face.y + face.height);
}

window.addEventListener('load', main);