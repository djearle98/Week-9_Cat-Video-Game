class Layer {
  constructor (name, zIndex, width, height, color) {
    //TO-DO validate inputs

    //create an HTML canvas element for this layer.
    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", name);
    canvas.style.zIndex = zIndex;
    canvas.width = width;
    canvas.height = height;
    canvas.style.backgroundColor = color;
    //add to the html document and store in this object
    this.canvas = document.body.appendChild(canvas);

    //store the context to draw on
    this.ctx = canvas.getContext("2d");
  }
}

let fg = new Layer("foreground", 0, 1000, 1000, "green");
