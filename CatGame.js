class CatGame {
  constructor (width, height) {
    //set the size of the game in the window
    this.width = width;
    this.height = height;

    //create all game layers
    this.fg = new Layer("characters", 999, this.width, this.height);
    this.bg = new Layer("background", 0, this.width, this.height);

    //define images to use in the game
    const IMAGES = [
      "Background.png",
      "Blueberry-Highlight.png",
      "Blueberry.png",
      "Bubble-Buttons.png",
      "Bubble-Icons.png",
      "Cat-Sprite-Sheet.png",
      "Objects.png",
      "Tiles.png"
    ];

    //load the images
    loadImages("./Cat-Game-Assets/Images/", IMAGES, imagesLoaded);
  }
  imagesLoaded(images) {
    this.images = images;
    displayMenu();
  }
  /**
    * Loads images into the HTML document
    * @returns An array of image objects, passed to the callback
    * src: https://codeincomplete.com/articles/javascript-game-foundations-loading-assets/
    * @param {string} path - directory that holds the images in the names array
    * @param {array} names - array containing strings of image names and file suffixes (ex: "myimage.png")
    * @callback callback - function to call once all images are loaded. Passes an array of image objects.
    */
  loadImages(path, names, callback) {
    var result = {},
        count  = names.length,
        onload = function() {
          if (--count == 0){
            callback(result);
          }
        };

    for(let n = 0 ; n < names.length ; n++) {
      let name = names[n];
      result[name] = document.createElement('img');
      result[name].addEventListener('load', onload);
      result[name].src = path + name;
    }
  }
  displayMenu(){
    
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
