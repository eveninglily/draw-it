var down = false;
var canvas = $('#layer0').get(0);
var can = new DrawingCanvas(canvas);

var layers = [can];
var currentLayer = 0;

var currTool = pencil;

function start(x, y) {
	if(currTool.type == "pencil" || currTool.type == "eraser") {
		layers[currentLayer].beginStroke(currTool, x, y);
		layers[currentLayer].doStrokes();
	} else {
		layers[currentLayer].createText(prompt("Text:"), currTool, x, y);
		down = false;
	}
}

function move(x, y) {
	layers[currentLayer].strokes[0].addPoint(x, y);
    layers[currentLayer].doStrokes();
}

function end() {
	layers[currentLayer].completeStroke(layers[currentLayer].strokes[0]);
    addChange(layers[currentLayer].strokes.pop());
    $('.selected').children(':nth-child(1)').html(layers[currentLayer].toImage());
}

$('#layers').on('touchstart', function (evt) {
	start(evt.originalEvent.changedTouches[0].pageX, evt.originalEvent.changedTouches[0].pageY);
    down = true;
}).on('touchmove', function (evt) {
	if(down){
    	move(
        	evt.originalEvent.touches[0].pageX,
            evt.originalEvent.touches[0].pageY
		);
    }
}).on('mousedown', function(e) {
	down = true;
    start(e.offsetX, e.offsetY);
}).on('mouseup touchend', function(e) {
	end();
    down = false;
}).on('mousemove', function(e) {
	if(down) {
    	move(e.offsetX, e.offsetY);
	}
});