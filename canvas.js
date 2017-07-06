//"use strict";

/**
 * A wrapper class for canvases that make user drawing much easier
 * Uses a stroke system and a hidden canvas to allow for opacity and smooth drawing
 */
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
        this.bCtx = this.backCanvas.getContext('2d');

        this.strokeCanvas = document.createElement('canvas');
        this.strokeCanvas.width = canvas.width;
        this.strokeCanvas.height = canvas.height;
        this.sCtx = this.strokeCanvas.getContext('2d');

        this._isRedrawing = false;
    }

    /**
     * Clears the visible drawing canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Clears the back canvas
     */
    clearBuffer() {
        this.bCtx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Saves canvas to disk
     */
    saveToDisk() {
        var data = this.toImage().src.replace('image/png','image/octet-stream');
        window.location.href = data;
    }

    /**
     * Saves canvas to localStorage
     */
    toLocalStorage() {
        localStorage.setItem('canvas-' + this.name, this.canvas.toDataURL());
    }

    /**
     * Returns an image element containing the canvas contents
     */
    toImage() {
        var image = new Image();
        image.src = this.canvas.toDataURL();
        return image;
    }

    /**
     * Loads a DataURL into the canvas at 0,0
     * @param {string} data - The DataUrl
     */
    loadDataURL(data) {
        var image = new Image();
        image.onload = (() => {
            this.ctx.drawImage(image, 0, 0);
            this.bCtx.drawImage(image, 0, 0);
        });
        image.src = data;
    }

    drawBuffer() {
        this.ctx.drawImage(this.backCanvas, 0, 0);
    }

    /**
     * Draws a canvas onto the visible canvas
     * @param {object} otherCanvas - The other canvas to draw
     */
    drawCanvas(otherCanvas) {
        this.ctx.drawImage(otherCanvas, 0, 0);
    }

    /**
     * Draws a canvas onto the buffer canvas
     * @param {object} other - The canvas to draw
     */
    drawCanvasOntoBuffer(otherCanvas) {
        this.bCtx.drawImage(otherCanvas, 0, 0);
    }

    /**
     * Draws a blob onto the canvas
     * @param {object} blob - The blob to draw
     * @param {number} x - X coordinate to draw at
     * @param {number} y - Y coordinate to draw at
     */
    drawBlob(blob, x, y) {
        var reader = new FileReader();
        reader.onload = (() => {
            var img = new Image();
            img.src = reader.result;
            img.onload = (() => {
                this.ctx.drawImage(img, x, y);
                this.bCtx.drawImage(img, x, y);
            });
        });
        reader.readAsDataURL(blob);
    }

    /**
     * Ensures that all the ctx values are what they should be
     * Checks before setting as to not affect performance too much
     * @param {object} tool - The tool to match to values to
     */
    setContextValues(tool, ctx) {
        //if (ctx.globalAlpha != tool.opacity) { ctx.globalAlpha = tool.opacity; }
        if (ctx.lineJoin != 'round') { ctx.lineJoin = 'round'; }
        if (ctx.lineCap != 'round') { ctx.lineCap = 'round'; }
        if (ctx.lineWidth != (tool.size * 2)) { ctx.lineWidth = tool.size * 2; }
        if (ctx.strokeStyle != tool.color) { ctx.strokeStyle = tool.color };
        if (ctx.fillStyle != tool.color) { ctx.fillStyle = tool.color; }
        if (ctx.globalCompositeOperation != tool.globalCompositeOperation) {
            ctx.globalCompositeOperation = tool.meta;
        }
        return ctx;
    }

    /**
     * Creates text at the given point on the given context
     * @param {object} ctx - Context to draw onto
     * @param {object} tool - The tool to draw it with
     * @param {string} text - The text to draw
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     */
    drawText(ctx, tool, text, x, y) {
        ctx.fillStyle = tool.color;
        ctx.font = fontSize.value + "px serif";
        ctx.fillText(text, x, y);
    }

    /**
     * Creates text at the given point by drawing it onto the main canvas
     */
    createText(text, tool, x, y) {
        this.drawText(this.ctx, tool, text, x, y);
    }

    /**
     * Finalizes text at the given point by drawing it onto the back canvas
     */
    finalizeText(text, tool, x, y) {
        this.drawText(this.bCtx, tool, text, x, y);
    }

    /**
     * Starts a new stroke
     * @param {Object} tool - The tool to use
     * @param {number} x - The x coordinate
     * @param {number} x - The y coordinate
     * @param {string} id - The id of the stroke
     */
    beginStroke(tool, x, y, p, id) {
        var s = new Stroke(JSON.parse(JSON.stringify(tool)));
        s.addPoint(x, y, p);
        this.strokes[id] = s;
    }

    /**
     * Finalizes the stroke by drawing it onto the buffer canvas
     * @param {Object} stroke - The stroke to finalize
     */
    completeStroke(stroke) {
        this.clear();
        this.drawCanvas(this.backCanvas);
        this.drawStroke(stroke);

        this.bCtx.clearRect(0, 0, this.width, this.height);
        this.bCtx.drawImage(this.canvas, 0, 0);
    }

    clearArea(stroke) {
        if(stroke.length < 3) {
            this.clear();
            this.drawCanvas(this.backCanvas);
            return;
        }
    }

    /**
     * Updates strokes by their ids
     * @param {string[]} - The stroke IDs to draw
     */
    doStrokes(ids) {
        if(this._isRedrawing) return;
        this._isRedrawing = true;
        this.clear();
        this.drawCanvas(this.backCanvas);
        for(var i = 0; i < ids.length; i++)
        {
            this.drawStroke(this.strokes[ids[i]]);
        }
        this._isRedrawing = false;
    }

    /**
     * Draws a stroke onto the canvas
     * TODO: document the inside of this function
     * TODO: Commented out stuff in here makes pen pressure work
     * @param {Object} stroke - The Stroke to draw
     */
    drawStroke(stroke) {
        this.sCtx.save();
        this.sCtx.clearRect(0, 0, this.width, this.height);
        this.sCtx = this.setContextValues(stroke.tool, this.sCtx); //Ensures that all the context values are correct
        this.sCtx.mozImageSmoothingEnabled = false;
        this.sCtx.webkitImageSmoothingEnabled = false;
        this.sCtx.msImageSmoothingEnabled = false;
        this.sCtx.imageSmoothingEnabled = false;
        this.sCtx.beginPath();
        if(stroke.path.length > 3) {
            var len = stroke.path.length;
            var controls = stroke.controlPoints.concat(
                stroke.getControlPoints(stroke.path[len-3].x,
                                        stroke.path[len-3].y,
                                        stroke.path[len-2].x,
                                        stroke.path[len-2].y,
                                        stroke.path[len-1].x,
                                        stroke.path[len-1].y,
                                        .3));
            var cLen = controls.length;

            this.sCtx.beginPath();
            this.sCtx.lineWidth = stroke.tool.size  * ( 2 * stroke.path[0].p);
            this.sCtx.moveTo(stroke.path[0].x,stroke.path[0].y);
            this.sCtx.quadraticCurveTo(controls[0],controls[1],stroke.path[1].x,stroke.path[1].y);
            this.sCtx.stroke();
            this.sCtx.closePath();

            for(var i = 0; i < len - 1; i += 1) {
                this.sCtx.beginPath();
                this.sCtx.moveTo(stroke.path[i].x, stroke.path[i].y);
                this.sCtx.lineWidth = (stroke.tool.size) * (stroke.path[i].p * 2);
                //controls.length is x.length * 4
                this.sCtx.bezierCurveTo(controls[4*i-2],controls[4*i-1],controls[4*i],controls[4*i+1],stroke.path[i + 1].x,stroke.path[i + 1].y);
                this.sCtx.stroke();
                this.sCtx.closePath();
            }
            this.sCtx.beginPath();
            this.sCtx.lineWidth = stroke.tool.size * stroke.path[len - 2].p * 2;
            this.sCtx.moveTo(stroke.path[len-2].x,stroke.path[len-2].y);
            this.sCtx.quadraticCurveTo(controls[cLen - 2],controls[cLen-1],stroke.path[len-1].x,stroke.path[len-1].y);
            this.sCtx.stroke();
            this.sCtx.closePath();
        } else {
            //There are too few points to do a bezier curve, so we just draw the point
            this.sCtx.lineWidth = 1;
            this.sCtx.arc(stroke.path[0].x, stroke.path[0].y, stroke.tool.size * (stroke.path[0].p), 0, 2 * Math.PI, false);
            this.sCtx.fill();
        }
        this.sCtx.stroke();

        this.sCtx.globalCompositeOperation = "destination-out";
        this.sCtx.globalAlpha = 1 - stroke.tool.opacity;
        this.sCtx.fillStyle = "#ffffff";

        this.sCtx.fillRect(0, 0, this.width, this.height);
        this.sCtx.restore();

        if(stroke.tool.name == "Eraser") {
            this.ctx.save();
            this.ctx.globalCompositeOperation = "destination-out";
            this.ctx.globalAlpha = 1;
        }

        this.drawCanvas(this.strokeCanvas);
        this.ctx.restore();
    }

    /**
     * Loads a canvas from localstorage
     * @param {string} name - Name of the canvas
     */
    static loadFromLocalStorage(name) {
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

/**
 * Holds all the points in a stroke
 */
class Stroke {
    constructor(tool) {
        this.tool = tool;
        this.path = [];
        this.controlPoints = [];

        /* Used to create redraw bounds */
        this.min = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
        this.max = { x: Number.MIN_VALUE, y: Number.MIN_VALUE };
    }

    /**
     * Adds a (x,y) pair to the stroke, calculates control points if need be
     */
    addPoint(x, y, p) {
        this.path.push({
            'x': x,
            'y': y,
            'p': p
        });

        if(x > this.max.x) {
            this.max.x = x;
        } else if(x < this.min.x) {
            this.min.x = x;
        }

        if(y > this.max.y) {
            this.max.y = y;
        } else if(y < this.min.y) {
            this.min.y = y;
        }

        if(this.path.length > 3) {
            var pLen = this.path.length - 1;
            this.controlPoints = this.controlPoints.concat(
                this.getControlPoints(this.path[pLen - 3].x, this.path[pLen - 3].y,
                                      this.path[pLen - 2].x, this.path[pLen - 2].y,
                                      this.path[pLen - 1].x, this.path[pLen - 1].y, .3)
                );
        }
    }

    /**
     * Adds an array of (x,y) points
     */
    addPoints(points) {
        for(var i = 0; i < points.length; i++) {
            this.addPoint(points[i].x, points[i].y, points[i].p);
        }
    }

    /**
     * Calculate control points
     * TODO: Comment this function
     */
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