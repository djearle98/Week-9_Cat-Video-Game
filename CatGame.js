class CatGame {
  constructor (width, height) {
    //set the size of the game in the window
    this.width = width;
    this.height = height;

    //create all game layers
    this.fg = new Layer("foreground", 999, this.width, this.height);
    this.bg = new Layer("background", 0, this.width, this.height);

    let gamePath = "https://raw.githubusercontent.com/pensivepixel/\
Cat-Video-Game/master/";
    let imagesPath = gamePath+"Cat-Game-Assets/Images/";

    //load the images, render images offscreen, start game loop
    this.loadImages(imagesPath, "Image-Mappings.JSON").then(function(images){
      return this.createOffscreenCanvases(images);
    }.bind(this)).then(function(){
      return this.main();
    }.bind(this));

  }
  /**
    * Loads images into the HTML document
    * @returns An array of image objects, passed to the callback
    * Adapted From: https://codeincomplete.com/articles/javascript-game-foundations-loading-assets/
    * @param {string} path - directory that holds the images in the names array
    * @param {array} names - array containing strings of image names and file suffixes (ex: "myimage.png")
    * @callback callback - function to call once all images are loaded. Passes an array of image objects.
    */
  loadImages(imageDirectory, imageMapName) {
    let imageMap = fetch(imageDirectory+imageMapName).then(function(results){
      let result = results.json();
      console.log(result);
    });


    return new Promise(function(resolve, reject){
      var result = {},
          count  = names.length,
          onload = function() {
            if (--count == 0){
              resolve(result);
            }
          };

      for(let n = 0 ; n < names.length ; n++) {
        let filename = names[n];
        let name = filename.substring(0, filename.indexOf("."));
        result[name] = new Image();
        result[name].onload = onload.bind(this);
        result[name].src = path + filename;
      }
    });
  }

  createOffscreenCanvases(images) {
    this.images = images;
    this.offscreenCanvases = [];

    //--BACKGROUND--
    //shortcut reference to current image
    let img = this.images["Background"];
    //create a new offScreenCanvas and 2d context
    let osc = new OffscreenCanvas(img.width*2, img.height);
    let ctx = osc.getContext("2d");
    //draw rect in context
    ctx.rect(0, 0, img.width*2, img.height);
    //fill with horizontally repeating background
    ctx.fillStyle = this.bg.ctx.createPattern(img, "repeat-x");
    ctx.fill();
    //save context in Game object
    this.offscreenCanvases["Background"] = osc;

    // TODO: create osc's for all of the images

  }

  main(){
    // TODO: relocate
    this.backgroundOffsetX = 0;
    this.backgroundOffsetY = 158;

    requestAnimationFrame(this.infiniteMoveBackground.bind(this));
  }

  infiniteMoveBackground() {
    this.backgroundOffsetX += 0.5;
    if (this.backgroundOffsetX > 1000) {
      this.backgroundOffsetX -= 1000;
    }
    this.drawBackground(this.backgroundOffsetX, this.backgroundOffsetY);
    requestAnimationFrame(this.infiniteMoveBackground.bind(this));
  }

  drawBackground(offsetX, offsetY) {
    let background = this.offscreenCanvases["Background"],
        sx = offsetX,
        sy = offsetY,
        sWidth = 1000,
        sHeight = 625,
        dx = 0,
        dy = 0,
        dWidth = 1000,
        dHeight = 625;
    this.bg.ctx.drawImage(background, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
}

class Layer {
  constructor (name, zIndex, width, height) {
    //TO-DO validate inputs

    //create an HTML canvas element for this layer.
    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", name);
    canvas.setAttribute("class", "layer");
    canvas.style.zIndex = zIndex;
    canvas.style.position = "absolute";
    canvas.width = width;
    canvas.height = height;
    //add to the html document and store in this object
    this.canvas = document.body.appendChild(canvas);

    //store the context to draw on
    this.ctx = canvas.getContext("2d");
  }
}

let catGame = new CatGame(1000, 625);
