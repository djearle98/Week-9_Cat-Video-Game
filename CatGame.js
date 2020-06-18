class CatGame {
  constructor (width, height) {
    //set the size of the game in the window
    this.width = width;
    this.height = height;

    //create all game layers
    this.fg = new Layer("foreground", 999, this.width, this.height);
    this.bg = new Layer("background", 0, this.width, this.height);

    //create a space to store sprites used in the game
    this.sprites = new Map();
    this.animations = new Map();

    let gamePath = "https://raw.githubusercontent.com/pensivepixel/\
Cat-Video-Game/master/";
    let imagesPath = gamePath+"Cat-Game-Assets/Images/";
    //load the images, render images offscreen, start game loop
    fetch(imagesPath + "ImageMaps.JSON") //get ImageMap data
    .then(response => { //convert to JSON
      console.log(typeof(response));
      return response.json();
    })
    .then(imageMaps => { //download all images
      this.imageMaps = imageMaps;
      let promises = [];
      for (let i=0; i<imageMaps.length; i++){
        let filename = imageMaps[i].filename;
        promises[i] = new Promise((resolve) => {
          let img = new Image();
          img.onload = () => resolve(img);
          img.src = imagesPath+filename;
        });
      }
      return Promise.all(promises);
    }).then(images => {
      this.processSpriteSheets(images); //draw images offscreen for reuse

      this.allSpriteAnimation();

      //this.main(); //begin the main loop
    });
  }

  processSpriteSheets(spriteSheets) {
    //iterate over all spriteSheets in imageMaps
    for (let i=0; i<this.imageMaps.length; i++){
      switch (this.imageMaps[i].layout) {
        case "misc":
          this.processSpriteSheetAsMisc(spriteSheets[i], this.imageMaps[i]);
          break;
        case "animation":
          this.processSpriteSheetAsAnimation(spriteSheets[i], this.imageMaps[i]);
          break;
        case "grid":
          this.processSpriteSheetAsGrid(spriteSheets[i], this.imageMaps[i]);
          break;
        default:
          console.log("Error processing spriteSheet: invalid layout type: "
          + this.imageMaps[i]);
      }
    }
  }

  processSpriteSheetAsMisc(sprite, map){
    //iterate over all sprites in sheet
    let result = new Map();
    for (let i=0; i<map.images.length; i++) {
      let currentSprite = map.images[i];
      let osc = new OffscreenCanvas(currentSprite.width, currentSprite.height);
      let ctx = osc.getContext("2d");
      let sx = currentSprite.x;
      let sy = currentSprite.y;
      let dWidth, sWidth = dWidth = currentSprite.width;
      let dHeight, sHeight = dHeight = currentSprite.height;
      let dy, dx = dy = 0;

      ctx.drawImage(sprite, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      result.set(currentSprite.name, osc);
      this.sprites.set(currentSprite.name, osc);
    }
    return result;
  }
  processSpriteSheetAsGrid(sprite, map){
    //convert encoded grid map to misc map
    let unitWidth = map.unitWidth;
    let unitHeight = map.unitHeight;
    for (let i=0; i<map.images.length; i++) {
      map.images[i].x *= unitWidth;
      map.images[i].y *= unitHeight;
      map.images[i].width = unitWidth;
      map.images[i].height = unitHeight;
    }
    //process as misc
    return this.processSpriteSheetAsMisc(sprite, map);
  }
  processSpriteSheetAsAnimation(sprite, map){
    //convert animation to misc map
    //create animation array of sprites and save to animations map
    map.images = [];
    let animations = new Map();
    let unitWidth = map.unitWidth;
    let unitHeight = map.unitHeight;
    for (let i=0; i<map.animations.length; i++) {
      let animation = [];
      for (let j=0; j<map.animations[i].n; j++) {
        //create and push an image object for this frame
        let spriteName = map.animations[i].name+""+j;
        animation.push(spriteName);
        map.images.push({
          "name": spriteName,
          "width": unitWidth,
          "height": unitHeight,
          "x": unitWidth*j,
          "y": unitHeight*i
        });
      }
      animations.set(map.animations[i].name, animation);
    }
    this.animations = animations;
    return this.processSpriteSheetAsMisc(sprite, map);
  }
  allSpriteAnimation(){
    let allSprites = this.sprites.values();
    let count = this.sprites.size-1;
    let interval = setInterval(()=>{
      this.fg.ctx.clearRect(0,0,this.fg.canvas.width, this.fg.canvas.height);
      this.fg.ctx.drawImage(allSprites.next().value, 0, 0);
      count--;
      if(count < 0) {
        count = this.sprites.size-1;
        allSprites = this.sprites.values();
      }
    }, 250);
  }
/*
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
*/
    // TODO: create osc's for all of the images



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
