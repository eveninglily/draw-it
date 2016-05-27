"use strict";

class DrawingCanvas {
	constructor(canvas) {
		this.name = "";
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.width = canvas.width;
		this.height = canvas.height;
		this.strokes = {};
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

	saveToDisk() {
		var data = this.toImage().src.replace('image/png','image/octet-stream');
		window.location.href = data;
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
		var _t = this;
		reader.onload = function () {
			var img = new Image();
			img.src = reader.result;
			img.onload = function () {
				_t.ctx.drawImage(img, x, y);
				_t.backCanvas.getContext('2d').drawImage(img, x, y);
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
			this.ctx.globalCompositeOperation = tool.meta;
		}
	}

	createText(text, tool, x, y) { //TODO: Look at again
		this.ctx.fillStyle = tool.color;
		this.ctx.font = tool.size;
		this.ctx.fillText(text, x, y);

		this.backCanvas.getContext('2d').fillStyle = tool.color;
		this.backCanvas.getContext('2d').font = tool.size;
		this.backCanvas.getContext('2d').fillText(text, x, y);
	}

	beginStroke(tool, x, y, id) {
		var s = new Stroke(JSON.parse(JSON.stringify(tool)));
		s.addPoint(x, y);
		this.strokes[id] = s;
	}

	completeStroke(stroke) {
		this.clear();
		//this.ctx.globalAlpha = 1;
		this.drawCanvas(this.backCanvas);
        this.drawStroke(stroke);

		this.backCanvas.getContext('2d').clearRect(0, 0, this.width, this.height);
		this.backCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
	}

	doStrokes(id) {
        this.clear();
        this.drawCanvas(this.backCanvas);
        this.drawStroke(this.strokes[id]);
	}

	drawStroke(stroke) {
		this.ctx.save();
		this.setContextValues(stroke.tool);
        this.ctx.beginPath();
		if(stroke.path.length > 3) {
            var len = stroke.path.length;
            var controls = [];

            //TODO: Move this into stroke and calc control points on addition of a new point
            for(var i = 0; i < len - 2; i++){
                controls = controls.concat(stroke.getControlPoints(stroke.path[i].x, stroke.path[i].y, stroke.path[i+1].x, stroke.path[i+1].y, stroke.path[i+2].x, stroke.path[i+2].y, .3));
            }

            var cLen = controls.length;

            this.ctx.beginPath();
            this.ctx.moveTo(stroke.path[0].x,stroke.path[0].y);
            this.ctx.quadraticCurveTo(controls[0],controls[1],stroke.path[1].x,stroke.path[1].y);

            for(var i = 0; i < len - 1; i += 1) {
                this.ctx.moveTo(stroke.path[i].x,stroke.path[i].y);
                this.ctx.bezierCurveTo(controls[4*i-2],controls[4*i-1],controls[4*i],controls[4*i+1],stroke.path[i + 1].x,stroke.path[i + 1].y); //controls.length == x.length * 4
            }

            this.ctx.moveTo(stroke.path[len-2].x,stroke.path[len-2].y);
            this.ctx.quadraticCurveTo(controls[cLen - 2],controls[cLen-1],stroke.path[len-1].x,stroke.path[len-1].y);
            this.ctx.stroke();
            this.ctx.closePath();
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
        this.controlPoints = [];
	}

	addPoint(x, y) {
		this.path.push({
			'x':x,
			'y':y
		});
	}

    getControlPoints(x1, y1, x2, y2, x3, y3, scale) {
        var dist1 = Math.sqrt(Math.pow( x2 - x1, 2 ) + Math.pow( y2 - y1 , 2 ));
        var dist2 = Math.sqrt(Math.pow( x3 - x2, 2 ) + Math.pow( y3 - y2 , 2 ));

        var scale1 = (scale * dist1) / (dist1 + dist2);
        var scale2 = scale - scale1;

        var dx1 = x2 + scale1 * (x1 - x3);
        var dy1 = y2 + scale1 * (y1 - y3);

        var dx2 = x2 - scale2 * (x1 - x3);
        var dy2 = y2 - scale2 * (y1 - y3);

        return [dx1, dy1, dx2, dy2];
    }
}

class Tool {
	constructor(name, size, meta, color) {
		this.name = name;
		this.size = size;
		this.opacity = 1;
		this.color = color;
		this.meta = meta
	}
}

var pencil = new Tool("Pencil", 5, "source-over", "#FF0000");
var eraser = new Tool("Eraser", 3, "destination-out", "rgba(255,255,255,1)");
var text = new Tool("Text", "32px serif", "", "#FF0000");
var eyedropper = new Tool("Eyedropper");
