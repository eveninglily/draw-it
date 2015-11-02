"use strict";

class DrawingCanvas {
	constructor(canvas) {
		this.name = "";
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.width = canvas.width;
		this.height = canvas.height;
		this.strokes = [];
		this.backCanvas = document.createElement('canvas');
		this.backCanvas.width = canvas.width;
		this.backCanvas.height = canvas.height;
	}
	
	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
	
	clearBuffer() {
		this.backCanvas.getContext('2d').clearRect(0, 0, this.width, this.height);
	}
	
	toFile() {
		//TODO: Find a clean way to implement this
		//var filename = prompt('File name:');
    	//if(!(filename == '') && !(filename == null)) {
        	//$('<a href="' + canvas.toDataURL() + '" download="' + filename + '"></a>')[0].click();
    	//}
		alert('Saving to a file is being rewritten');
	}
	
	toLocalStorage() {
		localStorage.setItem('canvas-' + this.name, this.canvas.toDataURL());
	}
	
	toImage() {
		var image = new Image();
		image.src = this.canvas.toDataURL();
		return image;
	}
	
	drawCanvas(otherCanvas) {
		this.ctx.drawImage(otherCanvas, 0, 0);
	}

	drawBlob(blob, x, y) {
		var reader = new FileReader();
		reader.onload = function () {
			var img = new Image();
			img.src = reader.result;
			img.onload = function () {
				this.ctx.drawImage(img, x, y);
			}
		}
		reader.readAsDataURL(blob);
	}
	
	setContextValues(tool) {
		if (this.ctx.globalAlpha != tool.opacity) { this.ctx.globalAlpha = tool.opacity; }
		if (this.ctx.lineJoin != 'round') { this.ctx.lineJoin = 'round'; }
		if (this.ctx.lineCap != 'round') { this.ctx.lineCap = 'round'; }
		if (this.ctx.lineWidth != (tool.size * 2)) { this.ctx.lineWidth = tool.size * 2; }
		if (this.ctx.strokeStyle != tool.color) { this.ctx.strokeStyle = tool.color };
		if (this.ctx.fillStyle != tool.color) { this.ctx.fillStyle = tool.color; }
		if (this.ctx.globalCompositeOperation != tool.globalCompositeOperation) {
			this.ctx.globalCompositeOperation = tool.globalCompositeOperation;
		}
	}
		
	beginStroke(x, y) {
		var s = new Stroke(pencil);
		s.addPoint(x, y);
		this.strokes.push(s);
	}
	
	completeStroke(stroke) {
		this.clear();
		//this.ctx.globalAlpha = 1;
		this.drawCanvas(this.backCanvas);
		this.drawStroke(stroke);
		this.backCanvas.getContext('2d').clearRect(0, 0, this.width, this.height);
		this.backCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
	}
	
	doStrokes() {
		this.clear();
		this.drawCanvas(this.backCanvas);
		this.drawStroke(this.strokes[0]);
	}
	
	drawStroke(stroke) {
		this.ctx.save();
		this.setContextValues(stroke.tool);
        if (stroke.tool.name == 'Eraser') { //TODO: Fix this hacky bs
    	    if (this.strokeContext.globalCompositeOperation != 'xor') {
        	    this.strokeContext.globalCompositeOperation = 'xor';
        	}
    	}
		
		
		this.ctx.beginPath();
		if(stroke.path.length > 2) {
			
				var i;
				//Draw bezier curve to the midpoint of stroke[i] and stroke[i + 1], using stroke[i] as a control point
				//This is what keeps the lines smooth
				for (i = 0; i < stroke.path.length - 2; i++) {
					var C = (stroke.path[i].x + stroke.path[i + 1].x) / 2;
					var D = (stroke.path[i].y + stroke.path[i + 1].y) / 2;
		
					this.ctx.quadraticCurveTo(stroke.path[i].x, stroke.path[i].y, C, D);
				}
		
				this.ctx.quadraticCurveTo(
					stroke.path[i].x,
					stroke.path[i].y,
					stroke.path[i + 1].x,
					stroke.path[i + 1].y
				);

		} else {
			//There are too few points to do a bezier curve, so we just draw the point
			this.ctx.lineWidth = 1;
			this.ctx.arc(stroke.path[0].x, stroke.path[0].y, stroke.tool.size, 0, 2 * Math.PI, false);
			this.ctx.fill();
    	}
		this.ctx.stroke();
		this.ctx.restore();
	}

	
	static load(name) {
		if (localStorage.getItem('canvas-' + name)) {
            var img = new Image;
            img.src = localStorage.getItem('canvas');
			
			var canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			
			return new DrawingCanvas(canvas); 
        }
		return null;
	}
	
}

class Stroke {
	constructor(tool) {
		this.tool = tool;
    	this.path = [];
	}
	
	addPoint(x, y) {
		this.path.push({
			'x':x,
			'y':y
		});
	}
}

class Tool {
	constructor(name, size, meta, color) {
		this.name = name;
		this.size = size;
		this.opacity = .5;
		this.color = color;
		this.meta = meta
	}
}

var pencil = new Tool("Pencil", 5, "source-over", "#FF0000");
var eraser = new Tool("Eraser", 3, "destination-out", "rgba(255,255,255,1)");
var text = new Tool("Text", "32px serif", "", "#FFFFFF");
var eyedropper = new Tool("Eyedropper");