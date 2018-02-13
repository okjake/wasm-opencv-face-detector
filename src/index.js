const cv = require('../../opencv-wasm/lib/opencv-wasm');
const defaultCascade = require('./haarcascade_frontalface_default.xml');

console.log('cv', cv);
console.log('type', typeof cv.wasmBinary);

let _classifier = null;

export function setup() {
  const importObj = Object.assign({}, {
    env: cv.asmLibraryArg,
    global: { NaN, Infinity },
    'global.Math': Math,
    preRun: [
      cv.FS_createPreloadedFile(
        '/',
        'default-cascade',
        'data:application/xml,' + defaultCascade,
        true,
        false
      )
    ]
  });

  return WebAssembly.instantiate(cv.wasmBinary, importObj)
  .then(() => {
    _classifier = new cv.CascadeClassifier();
    _classifier.load('default-cascade');
  }); 
}

/**
 * Object detection class
 * @param {number} width of image to be analysed
 * @param {number} height of image to be analysed
 */
export default class Detector {
 /**
  * Create a Detector
  * Exposes the provided or default cascade to OpenCV
  * Sets up matrices and classifer
  * @param {number} width of image to be analysed
  * @param {number} height of image to be analysed
  */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.inputMat = new cv.Mat(height, width, cv.CV_8UC4);
    this.grayMat = new cv.Mat(height, width, cv.CV_8UC1);
  }

 /**
  * Run the detection algorithm
  * @param {Uint8ClampedArray} imgData - array of RGBA values 0 - 255
  * @returns {array} objects found
  */
  detectInImage(imgData) {
    let objVec = new cv.RectVector();
    let objMat = new cv.Mat();
    const objects = [];
  
    this.inputMat.data.set(imgData);
    cv.cvtColor(this.inputMat, this.grayMat, cv.COLOR_RGBA2GRAY);
  
    cv.pyrDown(this.grayMat, objMat);
    cv.pyrDown(objMat, objMat);

    const size = objMat.size();
    const ratio = { 
      x: this.width / size.width,
      y: this.height / size.height
    };

    _classifier && _classifier.detectMultiScale(objMat, objVec);
  
    for (let i = 0; i < objVec.size(); i++) {
      const obj = objVec.get(i);
      objects.push({
        x: obj.x * ratio.x,
        y: obj.y * ratio.y,
        height: obj.height * ratio.x,
        width: obj.width * ratio.y
      });
    }
  
    return objects;
  }
}

export const __useDefault = true;