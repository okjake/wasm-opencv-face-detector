const cv = require('opencv.js');
cv.FS_createPreloadedFile('/', 'haarcascade_frontalface_default.xml', './haarcascade_frontalface_default.xml', true, false);

/**
 * Face detection class
 * @param {number} width of image to be analysed
 * @param {number} height of image to be analysed
 */
export default class FaceDetector {

 /**
  * Create a FaceDetector
  * @param {number} width of image to be analysed
  * @param {number} height of image to be analysed
  */
  constructor(width, height) {
    this.inputMat = new cv.Mat(height, width, cv.CV_8UC4);
    this.grayMat = new cv.Mat(height, width, cv.CV_8UC1);
    this.classifier = new cv.CascadeClassifier();
    this.classifier.load('haarcascade_frontalface_default.xml');
  }

 /**
  * Run the face detection algorithm
  * @param   {} imgData
  * @returns {array} faces found
  */
  detectFaces(imgData) {
    let faceVec = new cv.RectVector();
    let faceMat = new cv.Mat();
    const faces = [];
  
    this.inputMat.data.set(imgData);
    cv.cvtColor(this.inputMat, this.grayMat, cv.COLOR_RGBA2GRAY);
  
    cv.pyrDown(this.grayMat, faceMat);
    cv.pyrDown(faceMat, faceMat);
    this.classifier.detectMultiScale(faceMat, faceVec);
  
    for (let i = 0; i < faceVec.size(); i++) {
      const face = faceVec.get(i);
      faces.push({
        x: face.x,
        y: face.y,
        height: face.height,
        width: face.width
      });
    }
  
    return faces;
  }
}

export const __useDefault = true;