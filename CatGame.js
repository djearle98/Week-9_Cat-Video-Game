class CatGame {
  constructor (width, height) {
    let this.gameWindow = new GameWindow(width, height);

    this.masterPath = "https://raw.githubusercontent.com/pensivepixel/\
Cat-Video-Game/master/";

    let cat = new AnimateSpritePackage(this.masterPath+"assets/sprites/animate/cat/");
    cat = cat.getAnimations()[0];
    let blue =  new AnimateSpritePackage(this.masterPath+"assets/sprites/animate/blueberry/");
    blue = blue.getAnimations()[0];
    let backdrop = new InanimateSpritePackage(this.masterPath+"assets/sprites/inanimate/sunnyBackdrop/");
    backdrop = backdrop.getSprites()[0];
    this.assetPack = new AssetPack(cat, blue, backdrop);

    main();
  }

  main(){
    let level1 = new Level(this.assetPack);
    level1.load(this.masterPath+"levels/1/")
    .then(level1.build(this.gameWindow))
    .then(level1.begin())
    .then(console.log("Game Over."););
  }
}
class GameWindow {
  constructor (width, height) {
    //create all game layers
    this.animateLayer = new Layer("animateLayer", 999, this.width, this.height);
    this.inanimateLayer = new Layer("inanimateLayer", 0, this.width, this.height);
  }
}
class Layer {
  constructor (name, zIndex, width, height) {
    //create an HTML canvas element for this layer.
    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", name);
    canvas.setAttribute("class", "layer");
    canvas.style.zIndex = zIndex;
    canvas.style.position = "absolute";
    canvas.width = width;
    canvas.height = height;

    //add to the html document and store in this object
    this._canvas = document.body.appendChild(canvas);

    //store the context to draw on
    this._ctx = canvas.getContext("2d");
  }
  draw(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this._ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
}
class AssetPack {
  constructor(character, target, backdrop){
    this.character = character;
    this.target = target;
    this.backdrop = backdrop;
  }
}
class Level {
  constructor (assetPack) {
    this.assetPack = assetPack;
  }
  load(levelPath) {
    //load and save all the assets
    this.levelPath = levelPath;

    this.info = fetchJSON(levelPath+"info.JSON");
    this.interferenceMap = fetchJSON(levelPath+"interferenceMap.JSON");
    this.scene = fetchImage(levelPath+"scene.png");

    return Promise.all([this.info, this.interferenceMap, this.scene]);
  }
  build(gameWindow){
    this.gameWindow = gameWindow;
    let iL = this.gameWindow.inanimateLayer;
    let aL = this.gameWindow.animateLayer;

    //draw graphics to gameWindow
    iL.draw(this.assetPack.backdrop, 0, 0);
  }
  begin(gameWindow) {
    //display level to the gameWindow
    //requestAnimationFrame
    console.log("Game began.");
  }
}
class Sprite {
  constructor(spritesheet, sx, sy, sWidth, sHeight){
    this._c = new OffscreenCanvas();
    this._ctx = this._c.getContext("2d");
    this.setSprite(spritesheet, sx, sy, sWidth, sHeight);
  }
  getSprite() {
    return this._c;
  }
  setSprite(spritesheet, sx, sy, sWidth, sHeight) {
    //clear canvas
    this._ctx.clearRect(this._c.width, this._c.height);

    //set the canvas size to fit sprite
    this._c.width = sWidth;
    this._c.height = sHeight;

    //draw sprite on canvas
    this._ctx.drawImage(spritesheet, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
  }
}
class InterferenceArea {
  constructor(x,y,width,height){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
  }
}
class Animation {
  constructor(name, frames, interferenceArea){
    this.name = name;
    this.frames = frames;
    this.interferenceArea = interferenceArea;
  }
}
class AnimateSpritePackage {
  constructor(path) {
    this.path = path;
  }
  get path(){
    return this._path;
  }
  set path(path){
    this._path = path;
    //fetch neccessary files
    let interferenceMap = fetchJSON(this._path+"interferenceMap.JSON");
    let spritesheetMap = fetchJSON(this._path+"spritesheetMap.JSON");
    let spritesheet = fetchImage(this._path+"spritesheet.png");

    Promise.all([interferenceMap, spritesheetMap, spritesheet])
    .then(() => {
      //build animations

      let animations = [];
      for (let name in spritesheetMap) {
        //build interferenceArea object
        let interferenceArea = new InterferenceArea(
          interferenceMap.interferenceArea.name.x,
          interferenceMap.interferenceArea.name.y,
          interferenceMap.interferenceArea.name.width,
          interferenceMap.interferenceArea.name.height
        );

        reel = spritesheetMap.name;
        let y = reel.y*unitHeight;
        let frames = [];
        for (let i = 0; i < reel.n; i++) {
          let x = unitWidth*i;
          frames.push(new Sprite(spritesheet, x, y, unitWidth, unitHeight));
        }
        animations.push(new Animation(name, frames, interferenceArea));
      }
      this._animations.concat(animations);
    });
  }
  getAnimations(){
    return this._animations;
  }
}
class InanimateSpritePackage {
  constructor(path){
    this.path = path;
  }
  get path(){
    return this._path;
  }
  set path(path){
    this._path=path;
    let spritesheet = fetchImage(path+"spritesheet.png");
    let spritesheetMap = fetchJSON(path+"spritesheetMap.JSON");
    Promise.all([spritesheet, spritesheetMap])
    .then(() => {
      let sprites = [];
      for (var name in spritesheetMap) {
        let s = spritesheetMap.name;
        sprites.push(new Sprite(spritesheet, s.x, s.y, s.width, s.height));
      }
      this._sprites.concat(sprites);
    });
  }
  getSprites(){
    return this._sprites;
  }
}

let catGame = new CatGame(1024, 1858);

function fetchJSON (path) {
  return new Promise ((resolve, reject) => {
    fetch(path)
    .then(response => response.json())
    .then(json => resolve(json));
  };
}
function fetchImage (path) {
  return new Promise ((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.src = this.imagesPath+filename;
  });
}

{
  /*
  { //download all images
    this.imageMaps = imageMaps;
    let promises = [];
    for (let i=0; i<imageMaps.length; i++){
      let filename = imageMaps[i].filename;
      promises[i] = new Promise((resolve) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.src = this.imagesPath+filename;
      });
    }
    return Promise.all(promises);
  }
  */

  // processSpritesheets(spritesheets) {
  //   //iterate over all spritesheets in imageMaps
  //   for (let i=0; i<this.imageMaps.length; i++){
  //     switch (this.imageMaps[i].layout) {
  //       case "misc":
  //         this.processSpritesheetAsMisc(spritesheets[i], this.imageMaps[i]);
  //         break;
  //       case "animation":
  //         this.processSpritesheetAsAnimation(spritesheets[i], this.imageMaps[i]);
  //         break;
  //       case "grid":
  //         this.processSpritesheetAsGrid(spritesheets[i], this.imageMaps[i]);
  //         break;
  //       default:
  //         console.log("Error processing spritesheet: invalid layout type: "
  //         + this.imageMaps[i]);
  //     }
  //   }
  // }
  //
  // processSpritesheetAsMisc(sprite, map){
  //   //iterate over all sprites in sheet
  //   let result = new Map();
  //   for (let i=0; i<map.images.length; i++) {
  //     let currentSprite = map.images[i];
  //     let osc = new OffscreenCanvas(currentSprite.width, currentSprite.height);
  //     let ctx = osc.getContext("2d");
  //     let sx = currentSprite.x;
  //     let sy = currentSprite.y;
  //     let dWidth, sWidth = dWidth = currentSprite.width;
  //     let dHeight, sHeight = dHeight = currentSprite.height;
  //     let dy, dx = dy = 0;
  //
  //     ctx.drawImage(sprite, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  //     result.set(currentSprite.name, osc);
  //     this.sprites.set(currentSprite.name, osc);
  //   }
  //   return result;
  // }
  //
  // processSpritesheetAsAnimation(sprite, map){
  //   //convert animation to misc map
  //   //create animation array of sprites and save to animations map
  //   map.images = [];
  //   let animations = new Map();
  //   let unitWidth = map.unitWidth;
  //   let unitHeight = map.unitHeight;
  //   for (let i=0; i<map.animations.length; i++) {
  //     let animation = [];
  //     for (let j=0; j<map.animations[i].n; j++) {
  //       //create and push an image object for this frame
  //       let spriteName = map.animations[i].name+""+j;
  //       animation.push(spriteName);
  //       map.images.push({
  //         "name": spriteName,
  //         "width": unitWidth,
  //         "height": unitHeight,
  //         "x": unitWidth*j,
  //         "y": unitHeight*i
  //       });
  //     }
  //     animations.set(map.animations[i].name, animation);
  //   }
  //   this.animations = animations;
  //   return this.processSpritesheetAsMisc(sprite, map);
  // }
  // allSpriteAnimation(){
    //   let allSprites = this.sprites.values();
    //   let count = this.sprites.size-1;
    //   let interval = setInterval(()=>{
      //     this.dynamicLayer.ctx.clearRect(0,0,this.dynamicLayer.canvas.width, this.dynamicLayer.canvas.height);
      //     this.dynamicLayer.ctx.drawImage(allSprites.next().value, 0, 0);
      //     count--;
      //     if(count < 0) {
        //       count = this.sprites.size-1;
        //       allSprites = this.sprites.values();
        //     }
        //   }, 100);
        // }

  // drawSpritesToCanvas(spriteMap, ctx){
  //   let spriteMap = spriteMap.staticSprites;
  //   for (let i=0; i<spriteMap.length; i++) {
  //     let sprite = this.sprites.get(spriteMap[i].name);
  //     let instances = spriteMap[i].instances;
  //     for (let j=0; j<instances.length; j++) {
  //       let x = instances[j].x;
  //       let y = instances[j].y;
  //       ctx.drawImage(sprite, x, y);
  //     }
  //   }
  // }

  // infiniteMoveBackground() {
  //   this.backgroundOffsetX += 0.5;
  //   if (this.backgroundOffsetX > 1000) {
  //     this.backgroundOffsetX -= 1000;
  //   }
  //   this.drawBackground(this.backgroundOffsetX, this.backgroundOffsetY);
  //   requestAnimationFrame(() => this.infiniteMoveBackground());
  // }
  //
  // drawBackground(offsetX, offsetY) {
  //   let background = this.offscreenCanvases["Background"],
  //       sx = offsetX,
  //       sy = offsetY,
  //       sWidth = 1000,
  //       sHeight = 625,
  //       dx = 0,
  //       dy = 0,
  //       dWidth = 1000,
  //       dHeight = 625;
  //   this.staticLayer.ctx.drawImage(background, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  // }
}
