
//import { sha1 } from 'sha.js';
const btn = document.getElementsByClassName("btn-tools");
var gHeight, gWidth;

for (let i = 0; i < btn.length; i++) {
  btn[i].addEventListener("click", (ev) => {
    let cBtn = btn[i].classList;
    let type = ev.currentTarget.dataset.type;
    cBtn.toggle("active-btn-tools");
    if(cBtn.contains("pixel")){cBtn.toggle("pix-active-btn-tools")};
    if (cBtn.contains("active-btn-tools")) {
      process.filter(ev.currentTarget.dataset.type, true, process.lastImage());
    } else {
      process.filter(ev.currentTarget.dataset.type, false, "");
    }
  });
}

var process = {
  processedImage: [],
  canvas: document.getElementById("canvas"),
  ctx: canvas.getContext("2d"),
  img: new Image(),

  filter: function (type, state, data,format) {
    if (state) {
      //do the type
      format = format == undefined || format == "" ? "image/jpeg" : "image/png";
      this[type](data,format);
    }
    if (!state) {
      this.removeFilter({ type: type, data: data });
    }
  },

  checkList: function (item) {
    if (this.processedImage === undefined) {
      return false;
    }
    for (let i = 0; i < this.processedImage.length; i++) {
      let x = this.processedImage[i];
      if (x.type == item.type) {
        return true;
      }
    }
    return false;
  },

  showLoader: function () {
    document.getElementById("loader").classList.remove("dnone");
  },

  hideLoader: function () {
    setTimeout(() => {
      document.getElementById("loader").classList.add("dnone");
    }, 300);
  },

  removeFilter: function (item) {
    this.showLoader();
    if (this.checkList(item)) {
      for (let [index, x] of this.processedImage.entries()) {
        if (x.type === item.type) {
          //remove filter and set previous state to new filter
          //the stack is greater
          //index 3; length 5; so remove 3, take data from 2 and redo 5
          if (
            this.processedImage.length != index + 1 &&
            this.processedImage.length != 1
          ) {
            let old = index - 1;
            let last = this.processedImage.length - 1;
            if (this.processedImage[old]["type"] != "original") {
              let data = this.processedImage[old]["data"];
              this[this.processedImage[old]["type"]](data);
              //remove the filter
              this.processedImage.splice(old, 1);
            } else {
              let data = this.processedImage[last]["data"];
              this[this.processedImage[last]["type"]](data);
              //remove the filter
              this.processedImage.splice(last, 1);
            }
          }
          //remove the filter
          this.processedImage.splice(index, 1);
          this.setImage(this.lastImage());
          this.hideLoader();
        }
      }
    }
  },

  getImages: function () {
    return this.processedImage;
  },

  lastImage: function () {
    let last = this.getImages();
    if (last[last.length - 1] !== undefined) return last[last.length - 1].data;
    else return last[0].data;
  },

  lastFilter: function () {
    let last = this.getImages();
    if (last[last.length - 1] !== undefined) return last[last.length - 1].type;
    else return last[0].type;
  },

  resizeImage: function (imagePath, downloadName, newWidth, newHeight) {
    const originalImage = new Image();
    originalImage.src = imagePath;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    originalImage.addEventListener("load", function () {
      const originalWidth = originalImage.naturalWidth;
      const originalHeight = originalImage.naturalHeight;

      const aspectRatio = originalWidth / originalHeight;

      if (newHeight === undefined) {
        newHeight = newWidth / aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
      downloadImage(downloadName);
    });
  },

  cropImage: function (
    imagePath,
    downloadName,
    newX,
    newY,
    newWidth,
    newHeight
  ) {
    const originalImage = new Image();
    originalImage.src = imagePath;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    originalImage.addEventListener("load", function () {
      const originalWidth = originalImage.naturalWidth;
      const originalHeight = originalImage.naturalHeight;

      const aspectRatio = originalWidth / originalHeight;

      if (newHeight === undefined) {
        newHeight = newWidth / aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(
        originalImage,
        newX,
        newY,
        newWidth,
        newHeight,
        0,
        0,
        newWidth,
        newHeight
      );
      downloadImage(downloadName);
    });
  },

  batchDownload: function (downloadName = "processedImage",format = "image/png"){
    for (let i = 0; i < this.processedImage.length; i++){
        let tempLink = document.createElement("a");
        tempLink.download = downloadName+"_" + this.processedImage[i].type;
        this.img.src = this.processedImage[i].data;
        let image = this.img;
        this.ctx.drawImage(image,0,0);
        let file = this.canvas;
        tempLink.href = file.toDataURL(format,1.0);
        tempLink.click();
    }
  },

  downloadImage: function (downloadName = "processedImage") {
    let tempLink = document.createElement("a");
    tempLink.download =
      this.lastFilter().length != 0 ? this.lastFilter() : downloadName;
    tempLink.href = document
      .getElementById("canvas")
      .toDataURL(1.0);
    tempLink.click();
  },

  storeItem: function (item) {
    localStorage.setItem("result", JSON.stringify(item));
    return true;
  },

  setImage: function (data) {
    document.getElementById("stepres").src = data;
  },

  scale: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];
    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    scaleV = width / height;

    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleV, scaleV); // Set scale to flip the image
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(flipImg, 5, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "scale", data: data });
    this.hideLoader();
  },

  addImage: function (item) {
    this.processedImage.push(item);
    //console.log(this.processedImage);
  },

  getAverageRGB: function (image, format){
    let blockSize = 5, // only visit every 5 pixels
      defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
      canvas = document.createElement("canvas"),
      context = canvas.getContext && canvas.getContext("2d"),
      data,
      width,
      height,
      i = -4,
      length,
      rgb = { r: 0, g: 0, b: 0 },
      rgbi = { r: 0, g: 0, b: 0 },
      count = 0;

    let flipImg = this.img;
    flipImg.src = image;

    if (!context) {
      return defaultRGB;
    }

    let dimesion = this.getDimensions();
    width = dimesion[0];
    height = dimesion[1];

    context.drawImage(flipImg, 0, 0, width, height);

    data = context.getImageData(0, 0, width, height);

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
      ++count;
      rgb.r += data.data[i];
      rgb.g += data.data[i + 1];
      rgb.b += data.data[i + 2];
    }

    // ~~ used to floor values
    rgbi.r = ~~(rgb.r / (count / i));
    rgbi.g = ~~(rgb.g / (count / i));
    rgbi.b = ~~(rgb.b / (count / i));

    // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return [this.rgb2hex(rgb.r, rgb.g, rgb.b), this.rgb2hex(rgbi.r, rgbi.g, rgbi.b), rgb];
  },

  rgb2hex: function (r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  noise: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    let width = dimesion[0];
    let height = dimesion[1];

    ctx.drawImage(flipImg, 0, 0, width, height);

    let sp= 2;
    for(let y=0;y<height;y+=sp){
        for (let x=0;x< width;x+=sp){
            var num = Math.floor(Math.random()*255)
            ctx.fillStyle = "rgb(" + num + "," + num + "," + num + ")";
            ctx.fillRect(x, y, 1, 1);
        }
    }

    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "noise", data: data });
    this.hideLoader();
  },

  getDimensions() {
    if(document.getElementById("stepres").width == 0){
        console.log([gWidth,gHeight],[
            document.getElementById("batchres").width,
            document.getElementById("batchres").height,
        ])
        return [
                document.getElementById("batchres").width,
                document.getElementById("batchres").height,
            ];
    }else{
        return [
        document.getElementById("stepres").clientWidth,
        document.getElementById("stepres").clientHeight,
        ];
    }
  },

  flipX: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    let posX = width * -1,
      posY = 0;

    ctx.scale(-1, 1); // Set scale to flip the image
    ctx.drawImage(flipImg, posX, posY, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "flipX", data: data });
    this.hideLoader();
  },

  flipY: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    let posX = 0,
      posY = height * -1;
    //console.log(image);
    ctx.scale(1, -1); // Set scale to flip the image
    ctx.drawImage(flipImg, posX, posY, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "flipY", data: data });
    this.hideLoader();
  },

  rotater: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];
    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.translate(width / 2, height / 2);
    ctx.rotate(15);
    ctx.translate(-width / 2, -height / 2);
    //ctx.rotate(-45 * Math.PI / 180);
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "rotater", data: data });
    this.hideLoader();
  },

  rotatel: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];
    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.translate(width / 2, height / 2);
    ctx.rotate(-15);
    ctx.translate(-width / 2, -height / 2);
    //ctx.rotate(-45 * Math.PI / 180);
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "rotatel", data: data });
    this.hideLoader();
  },

  blur: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];
    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "blur(4px)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "blur", data: data });
    this.hideLoader();
  },

  contrast: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "contrast(200%)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "contrast", data: data });
    this.hideLoader();
  },

  sharp: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    w = dimesion[0];
    h = dimesion[1];
    mix = 1;

    let offScreen = document.createElement("canvas");
    let offctx = offScreen.getContext("2d");
    offScreen.width = w;
    offScreen.height = h;

    offctx.drawImage(this.img, 0, 0, w, h);
    ctx.drawImage(offScreen, 0, 0);

    ///start process
    let x,
      sx,
      sy,
      r,
      g,
      b,
      a,
      dstOff,
      srcOff,
      wt,
      cx,
      cy,
      scy,
      scx,
      weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
      katet = Math.round(Math.sqrt(weights.length)),
      half = (katet * 0.5) | 0,
      dstData = ctx.createImageData(w, h),
      dstBuff = dstData.data,
      srcBuff = ctx.getImageData(0, 0, w, h).data,
      y = h;

    while (y--) {
      x = w;
      while (x--) {
        sy = y;
        sx = x;
        dstOff = (y * w + x) * 4;
        r = 0;
        g = 0;
        b = 0;
        a = 0;

        for (cy = 0; cy < katet; cy++) {
          for (cx = 0; cx < katet; cx++) {
            scy = sy + cy - half;
            scx = sx + cx - half;

            if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
              srcOff = (scy * w + scx) * 4;
              wt = weights[cy * katet + cx];

              r += srcBuff[srcOff] * wt;
              g += srcBuff[srcOff + 1] * wt;
              b += srcBuff[srcOff + 2] * wt;
              a += srcBuff[srcOff + 3] * wt;
            }
          }
        }

        dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
        dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
        dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
        dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
      }
    }

    ctx.putImageData(dstData, 0, 0);

    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "sharp", data: data });
    this.hideLoader();
  },

  bright: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "brightness(2)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "bright", data: data });
    this.hideLoader();
  },

  sepia: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];
    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "sepia(60%)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "sepia", data: data });
    this.hideLoader();
  },

  invert: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "invert(75%)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "invert", data: data });
    this.hideLoader();
  },

  hue: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "hue-rotate(90deg)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "hue", data: data });
    this.hideLoader();
  },

  saturation: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "saturate(2)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "saturation", data: data });
    this.hideLoader();
  },

  duotone: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];
    let hex = this.getAverageRGB(image);
    let tone1 = hex[0],
      tone2 = hex[1];

    let duo = this.Filters.duotone(image,tone1,tone2);

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.putImageData(duo,0,0,0,0,width,height);

    //ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "duotone", data: image });
    this.hideLoader();
  },

  gamma: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    let width = dimesion[0];
    let height = dimesion[1];

    ctx.filter = "contrast(130%) brightness(3)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "gamma", data: data });
    this.hideLoader();

  },

  red: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    let width = dimesion[0];
    let height = dimesion[1];

    ctx.drawImage(flipImg, 0, 0, width, height);

    let imageData = ctx.getImageData(0, 0, width, height);

    for(let y=0;y<width;y++){
        for (let x=0;x< height;x++){

            // index: red, green, blue, alpha, red, green, blue, alpha..etc.
            let index=(y*4)*imageData.width+(x*4);
            let red=imageData.data[index];
            let alpha=imageData.data[index+3];

            // set the red to the same
            imageData.data[index]=red;

            // set the rest to black
            imageData.data[index+1]=0;
            imageData.data[index+2]=0;
            imageData.data[index+3]=alpha;

        }
    }

    ctx.putImageData(imageData,0,0,0,0, imageData.width, imageData.height);
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "red", data: data });
    this.hideLoader();
  },

  green: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    let width = dimesion[0];
    let height = dimesion[1];

    ctx.drawImage(flipImg, 0, 0, width, height);

    let imageData = ctx.getImageData(0, 0, width, height);

    for(let y=0;y<width;y++){
        for (let x=0;x< height;x++){

            // index: red, green, blue, alpha, red, green, blue, alpha..etc.
            let index=(y*4)*imageData.width+(x*4);
            let green=imageData.data[index];
            let alpha=imageData.data[index+3];

            // set the green
            imageData.data[index]=0;
            imageData.data[index+1]=green;
            imageData.data[index+2]=0;
            imageData.data[index+3]=alpha;

        }
    }

    ctx.putImageData(imageData,0,0,0,0, imageData.width, imageData.height);
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "green", data: data });
    this.hideLoader();
  },

  blue: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    let width = dimesion[0];
    let height = dimesion[1];

    ctx.drawImage(flipImg, 0, 0, width, height);

    let imageData = ctx.getImageData(0, 0, width, height);

    for(let y=0;y<width;y++){
        for (let x=0;x< height;x++){

            // index: red, green, blue, alpha, red, green, blue, alpha..etc.
            let index=(y*4)*imageData.width+(x*4);
            let blue=imageData.data[index];
            let alpha=imageData.data[index+3];

            // set the red to the same
            imageData.data[index]=0;

            // set the rest to black
            imageData.data[index+1]=0;
            imageData.data[index+2]=blue;
            imageData.data[index+3]=alpha;

        }
    }

    ctx.putImageData(imageData,0,0,0,0, imageData.width, imageData.height);
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "blue", data: data });
    this.hideLoader();
  },

  pixelate: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    let width = dimesion[0];
    let height = dimesion[1];

    ctx.drawImage(flipImg, 0, 0, width, height);

    let pixlr = ctx.getImageData(0, 0, width, height).data;
    let pix , sp= 3;
    for(let y=0;y<height;y += sp){
        for (let x=0;x< width;x += sp){
            pix = (x + (y*width)) * 4;
            ctx.fillStyle = "rgba(" + pixlr[pix] + "," + pixlr[pix + 1] + "," + pixlr[pix + 2] + "," + pixlr[pix + 3] + ")";
            ctx.fillRect(x, y, sp, sp);
        }
    }

    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "pixelate", data: data });
    this.hideLoader();

  },

  grayscale: function (image, format){
    this.showLoader();
    const outputImage = this.canvas;
    let dimesion = this.getDimensions();
    outputImage.width = dimesion[0];
    outputImage.height = dimesion[1];

    let flipImg = this.img;
    flipImg.src = image;
    const ctx = this.ctx;
    flipImg.width = dimesion[0];
    flipImg.height = dimesion[1];

    // Flip the image by scaling negatively to the left
    width = dimesion[0];
    height = dimesion[1];

    ctx.filter = "grayscale(100%)";
    ctx.drawImage(flipImg, 0, 0, width, height); // draw the image
    let data = this.canvas.toDataURL(format);
    this.setImage(data);
    this.addImage({ type: "grayscale", data: data });
    this.hideLoader();
  },

  Filters: {
    getPixels: function (img) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let dimesion = process.getDimensions();
        canvas.width = dimesion[0];
        canvas.height = dimesion[1];
        let image = new Image();
        image.src = img;

      ctx.drawImage(image, 0, 0, dimesion[0],dimesion[1]);
      return ctx.getImageData(0, 0, dimesion[0], dimesion[1]);
    },

    grayscale: function (pixels) {
      let d = pixels.data;
      let max = 0;
      let min = 255;
      for (let i = 0; i < d.length; i += 4) {
        // Fetch maximum and minimum pixel values
        if (d[i] > max) {
          max = d[i];
        }
        if (d[i] < min) {
          min = d[i];
        }
        // Grayscale by averaging RGB values
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];
        let v = 0.3333 * r + 0.3333 * g + 0.3333 * b;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      for (let i = 0; i < d.length; i += 4) {
        // Normalize each pixel to scale 0-255
        let v = ((d[i] - min) * 255) / (max - min);
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      return pixels;
    },

    hexToRgb: function (hex) {
       return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                   ,(m, r, g, b) => '#' + r + r + g + g + b + b)
          .substring(1).match(/.{2}/g)
          .map(x => parseInt(x, 16));
    },

    gradientMap: function (tone1, tone2) {
      let rgb1 = this.hexToRgb(tone1);
      let rgb2 = this.hexToRgb(tone2);
      let gradient = [];
      for (let i = 0; i < 256 * 4; i += 4) {
        gradient[i] = ((256 - i / 4) * rgb1[0] + (i / 4) * rgb2[0]) / 256;
        gradient[i + 1] = ((256 - i / 4) * rgb1[1] + (i / 4) * rgb2[1]) / 256;
        gradient[i + 2] = ((256 - i / 4) * rgb1[2] + (i / 4) * rgb2[2]) / 256;
        gradient[i + 3] = 255;
      }
      return gradient;
    },

    duotone: function (img, tone1, tone2) {
      let pixels = this.getPixels(img);
      pixels = this.grayscale(pixels);
      let gradient = this.gradientMap(tone1, tone2);
      let d = pixels.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = gradient[d[i] * 4];
        d[i + 1] = gradient[d[i + 1] * 4 + 1];
        d[i + 2] = gradient[d[i + 2] * 4 + 2];
      }
      return pixels;
    },
  },
};

function download() {
  let last = process.lastImage();
  process.downloadImage(last.data);
}

function processForm() {
  document.getElementById("loader").classList.remove("dnone");
  let type = document.querySelector("input[name='inputType']:checked");
  let file = document.getElementById("imageData");
  if (type == null) {
    document.getElementById("loader").classList.add("dnone");
    return alert(
      "Kindly select either Augment or Single Task before submitting"
    );
  } else {
    document.getElementById(type.value).classList.remove("dnone");
    document.getElementById("start").classList.add("dnone");
    document.getElementById("loader").classList.add("dnone");
  }
  
  if(type.value == 'steps')
    previewFile(file.files[0]);
  else if(type.value == 'batch')
    batch(file.files[0]);

  document.getElementById("loader").classList.add("dnone");
}

function previewFile(val) {
  const file = val;
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    function (e) {
      // convert image file to base64 string
      document.getElementById("stepres").src = reader.result;

      let img = document.createElement("img");
      img.src = e.target.result;
      img.onload = function () {
        let height = this.height;
        let width = this.width;
        if (height < 480) {
          document.getElementById("stepres").style.height = height;
        }
        if (height == width) {
          document.getElementById("stepres").style.height = 480;
          document.getElementById("stepres").style.width = 480;
        }
        if (width < 780) {
          document.getElementById("stepres").style.width = width;
        }
      };

      for (let i = 0; i < btn.length; i++) {
        btn[i].classList.remove("active-btn-tools");
        btn[i].classList.remove("pix-active-btn-tools");
      }

      process.processedImage = [{ type: "original", data: reader.result }];
      process.storeItem(process.processedImage);
    },
    false
  );

  if (file) {
    reader.readAsDataURL(file);
  }
}

function batch(val){
    process.showLoader();
    const file = val;
    const reader = new FileReader();

    let imageFile;

    reader.addEventListener(
        "load",
        function (e) {
            document.getElementById("batchres").src = reader.result;

            imageFile = reader.result;
            process.processedImage = [{ type: "original", data: reader.result }];

            let img = document.createElement("img");
            img.src = e.target.result;
            img.onload = function () {
                console.log(this.height)
                gHeight = this.height;
                gWidth = this.width;
                let height = this.height;
                let width = this.width;
                if (height < 480) {
                    img.height = height;
                }
                if (height == width) {
                    img.height = 480;
                    img.width = 480;
                }
                if (width < 780) {
                    img.width = width;
                }
                for (let i = 0; i < btn.length; i++) {
                    let cBtn = btn[i].dataset.type;
                    //if(cBtn == 'scale')
                    //    continue;
                    //setTimeout(()=>{
                        process.filter(cBtn,true,imageFile);
                    //},500);
                }
    
                console.log(process.processedImage.length)
                for (let x = 0; x < process.processedImage.length; x++){
                    
    
                    let div = document.createElement('div');
                    let img = new Image();
                    img.src = process.processedImage[x].data;
                    img.width = 150; img.height = 150;
                    div.append(img);
                    let span = document.createElement('p');
                    span.innerText = process.processedImage[x].type;
                    div.append(span);
                    document.getElementById('batchpreview').append(div);
                }

                process.hideLoader();
            };
                

            

            

            
            process.storeItem(process.processedImage);
        },
        false
    );

    if (file) {
        reader.readAsDataURL(file);
    }
}

function downloadJPG(){
    process.batchDownload("","image/jpeg");
}

function downloadPNG(){
    process.batchDownload("","image/png");
}

function back(n) {
  document.getElementById(n).classList.add("dnone");
  document.getElementById("start").classList.remove("dnone");
}
