class CatGame {
  constructor (width, height) {
    this.gameWindow = new GameWindow(width, height);
    //PUBLIC MASTERPATH:
    //this.masterPath = "https://raw.githubusercontent.com/pensivepixel/Cat-Video-Game/master/";
    //LOCAL MASTERPATH
    this.masterPath = "http://127.0.0.1:8887/"
    //prepare assets
    let animateSpritePackage = new AnimateSpritePackage(this.masterPath+"assets/sprites/animate/");
    let inanimateSpritePackage = new InanimateSpritePackage(this.masterPath+"assets/sprites/inanimate/");
    Promise.all([animateSprites.promise, inanimateSprites.promise])
    .then(() => {
      let animateSprites = animateSpritePackage.animateSprites;
      let cat = animateSprites["cat"]
      let inanimateSprites = inanimateSpritePackage.inanimateSprites;
      let backdrop = inanimateSprites["sunnyBackdrop"].canvas;
      this.assetPack = new AssetPack(cat, blue, backdrop);

      this.main();
    })
  }

  main(){
    let level1 = new Level(this.assetPack);
    level1.launch(this.masterPath+"levels/1/", this.gameWindow);
  }
}
class GameWindow {
  constructor (width, height) {
    //create all game layers
    this.width = width;
    this.height = height;
    this.animateLayer = new Layer("animateLayer", 999, width, height);
    this.inanimateLayer = new Layer("inanimateLayer", 0, width, height);
  }
  setLayerSize(width, height){
    this.animateLayer.width = width;
    this.animateLayer.height = height;
    this.inanimateLayer.width = width;
    this.inanimateLayer.height = height;
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
    this._c = document.body.appendChild(canvas);

    //store the context to draw on
    this._ctx = this._c.getContext("2d");
  }
  draw(image, dx, dy) {

    this._ctx.drawImage(image,
      0, 0, image.width, image.height,
      dx, dy, image.width, image.height
    );
  }
  clear(){
    this._ctx.clearRect(0, 0, this._c.width, this._c.height);
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
    this.iCanvas = new OffscreenCanvas(0,0); //the inanimate canvas
    this.iCtx = this.iCanvas.getContext("2d"); //the inamimate context
    this.aCanvas = new OffscreenCanvas(0,0); //the animate canvas
    this.aCtx = this.aCanvas.getContext("2d"); //the animate context

    this.setAssetPack(assetPack);
  }
  setAssetPack(assetPack){
    this.assetPack = assetPack;
    this.character = assetPack.character;
    this.velocities = this.character.velocities;
    this.target = assetPack.target;
    this.targets = [];
    this.backdrop = assetPack.backdrop.getSprite();
  }
  launch(levelPath, gameWindow) {
    this.gameWindow = gameWindow;
    this.gWIL = gameWindow.inanimateLayer;
    this.gWAL = gameWindow.animateLayer;
    //load and save all the assets
    this.levelPath = levelPath;

    this.runLeft = false;
    this.runRight = false;
    this.jump = false;
    this.slide = false;

    this.info = fetchJSON(levelPath+"info.JSON")
    this.interferenceMap = fetchJSON(levelPath+"interferenceMap.JSON")
    this.scene = fetchImage(levelPath+"scene.png")
    Promise.all([this.info, this.interferenceMap, this.scene])
    .then((values) => {
      //save the loaded data
      this.info = values[0];
      this.interferenceMap = values[1];
      this.scene = values[2];

      //move some info to more convenient locations
      this.character.location = {
        x: this.info.characterCheckpointLocations[0].x,
        y: this.info.characterCheckpointLocations[0].y - 128
      }
      this.character.activeSprite = "idle";
      this.velocities.gravity = this.info.gravity;
      this.targets = this.info.targetLocations;
      //set up offscreenCanvases to this level's dimensions
      this.iCanvas.width = this.info.levelDimensions.width;
      this.iCanvas.height = this.info.levelDimensions.height;
      this.aCanvas.width = this.info.levelDimensions.width;
      this.aCanvas.height = this.info.levelDimensions.height;

      //prepare the inanimate OSC for reuse
      //backdrop
      this.iCtx.drawImage(this.backdrop, 0, 0);
      //scene
      this.iCtx.drawImage(this.scene, 0, 0);
      //BEGIN THE LEVEL
      this.begin();
    });
  }
  begin() {
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    console.log("Game Begin!");
    this.frame();
  }
  end(){
    document.removeEventListener('keydown', this.keyPress);
    console.log("Game Over!")
  }
  keyDown(e){
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
      this.jump=true;
      break;
      case "KeyS":
      case "ArrowDown":
      this.slide=true;
      break;
      case "KeyD":
      case "ArrowRight":
      this.runRight=true;
      break;
      case "KeyA":
      case "ArrowLeft":
      this.runLeft=true;
      break;
      default:


    }
  }
  keyUp(e){
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
      this.jump=false;
      break;
      case "KeyS":
      case "ArrowDown":
      this.slide=false;
      break;
      case "KeyD":
      case "ArrowRight":
      this.runRight=false;
      break;
      case "KeyA":
      case "ArrowLeft":
      this.runLeft=false;
      break;
      default:

    }
  }
  frame(){
    if(this.calculate()){
      this.draw();
      this.render();
      requestAnimationFrame(this.frame.bind(this));
    } else {
      end();
    }
  }
  calculate() {
    if(this.slide){

    } else {
      this.character.vx = 0;
    }
    this.character.vy += this.velocities.gravity;

    if(this.runRight){
      this.character.vx += this.velocities.run;
    }
    if(this.runLeft){
      this.character.vx -= this.velocities.run;
    }
    if(this.jump){
      let touchingGround = true;
      if (touchingGround) {
        this.character.vy += this.velocities.jump;
      }
    }
    this.character.lastLocation = this.character.location;
    this.character.location.x += this.character.vx;
    this.character.location.y += this.character.vy;

    if(this.character.vy == 0) {
      //character is not jumping or falling
      if(this.character.vx == 0) {
        //character is not moving
        this.character.activeSprite = "idle";
      } else {
        this.character.flipped = (this.character.vx < 0);
        if (this.slide) {
          //character is sliding
          this.character.activeSprite = "slide";
        } else {
          //character is not sliding, assuming that means running
          this.character.activeSprite = "run";
        }
      }
    }


    //determine if character is interfering with standable
    let standable = this.interferenceMap.standable;
    for (let i = 0; i < standable.length; i++) {
      if(character.activeSprite.intersects(standable[i])){
        character.location.y = standable[i].y - character.activeSprite.getHeight();
      }
    }
      //update the character's location to legal value
      return true;
    //determine if character is interfering with sinkable
      //end the game
      return false;
  }
  draw(){
    //draw animate to aCtx at their current positions
    this.aCtx.clearRect(0,0,this.aCanvas.width, this.aCanvas.height);
    this.aCtx.drawImage(
      this.character.animations["fall"].getFrame(),
      this.character.location.x,
      this.character.location.y
    );
    this.aCtx.drawImage(
      this.target.animations["default"].getFrame(),
      this.target[0].location.x,
      this.target[0].location.y
    );
  }
  render(){
    this.gWAL.clear();
    this.gWIL.clear();
    this.gWIL.draw(this.iCanvas,-100,-700);
    this.gWAL.draw(this.aCanvas,-100,-700);
  }
}
class InanimateSprite {
  constructor(spritesheet, sx, sy, sWidth, sHeight){
    this._canvas = new OffscreenCanvas(0, 0);
    this._ctx = this._canvas.getContext("2d");
    this.set(spritesheet, sx, sy, sWidth, sHeight);
  }
  set(spritesheet, sx, sy, sWidth, sHeight) {
    //set the canvas size to fit sprite
    this._canvas.width = this._width = sWidth;
    this._canvas.height = this._height = sHeight;

    //clear canvas
    this._ctx.clearRect(0, 0, this._width, this._height);

    //draw sprite onto canvas
    this._ctx.drawImage(spritesheet, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
  }
  get canvas(){
    return this._canvas;
  }
  set canvas(){
    console.log("Can't set canvas of InanimateSprite. Use InanimateSprite.set() instead.");
  }
  get ctx(){
    return this._ctx;
  }
  set ctx(){
    console.log("Can't set ctx of InanimateSprite. Use InanimateSprite.set() instead.");
  }
  set width(v) {
    console.log("Can't set width of InamimateSprite. Use InanimateSprite.set() instead.");
  }
  get width(){
    return this._width;
  }
  set height() {
    console.log("Can't set height of InamimateSprite. Use InanimateSprite.set() instead.");
  }
  get height() {
    return this._height;
  }
}
class Animation {
  constructor(frames, rate, interferenceArea){
    this.frames = frames;
    this.rate = rate;
    this.interferenceArea = interferenceArea;
    this.i = 0;
    this.n = this.frames.length;
    this.lastAdvance = 0;
  }
  getFrame(){
    if (Date.now() - this.lastAdvance > this.rate) {
      this._advanceFrame();
    }
    return this.frames[this.i].getSprite();
  }
  _advanceFrame(){
    this.lastAdvance = Date.now();
    this.i++;
    this.i %= this.n;
  }
}
class AnimateSprite {
  constructor(){
    this.animations = {};
    this.velocities = {};
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
    let info = fetchJSON(this._path+"info.JSON")
    let spritesheet = fetchImage(this._path+"spritesheet.png")

    this.promise = Promise.all([info, spritesheet])
    .then((values) => {
      info = values[0];
      spritesheet = values[1];

      for(let spriteName in info){
        for (let animationName in info[name].animations) {
          let frames = [];
          // for (let i = 0; i < reel.n; i++) {
          //   let x = unitWidth*i;
          //   frames.push(new InanimateSprite(spritesheet, x, y, unitWidth, unitHeight));
          // }
          // this.animations[name] = new Animation(frames, loopStart, rate, interferenceArea);
        }
      }
    });
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
    this._sprites = [];
    let spritesheet = fetchImage(path+"spritesheet.png")
    .then(result => spritesheet = result);
    let spritesheetMap = fetchJSON(path+"spritesheetMap.JSON")
    .then(result => spritesheetMap = result);
    this.promise = Promise.all([spritesheet, spritesheetMap])
    .then(() => {
      for (var name in spritesheetMap) {
        let s = spritesheetMap[name];
        this._sprites.push(new InanimateSprite(spritesheet, s.x, s.y, s.width, s.height));
      }
    });
  }
  getSprites(){
    return this._sprites;
  }
}

let catGame = new CatGame(800, 500);

function fetchJSON (path) {
  return new Promise ((resolve, reject) => {
    fetch(path)
    .then(response => response.json())
    .then(json => resolve(json));
  });
}
function fetchImage (path) {
  return new Promise ((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.src = path;
  });
}
