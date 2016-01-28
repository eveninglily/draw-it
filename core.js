var down = false;
var canvas = $('#layer0').get(0);
var can = new DrawingCanvas(canvas);

var layers = [can];
var currentLayer = 0;

var currTool = pencil;

$('#layers').on('mouseleave', function() {
	if(down) {
		end();
		down = false;
	}
});

function start(x, y) {
	if(currTool.name == "Pencil" || currTool.name == "Eraser") {
		layers[currentLayer].beginStroke(currTool, x, y, 'local');
		layers[currentLayer].doStrokes('local');
	} else {
		layers[currentLayer].createText(prompt("Text:"), currTool, x, y);
		down = false;
	}
}

function move(x, y) {
	layers[currentLayer].strokes['local'].addPoint(x, y);
    layers[currentLayer].doStrokes('local');
}

function end() {
	layers[currentLayer].completeStroke(layers[currentLayer].strokes['local']);
    addChange(layers[currentLayer].strokes['local']);
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
		window.getSelection().removeAllRanges()
		e.preventDefault();
    	move(e.offsetX, e.offsetY);
	}
});
$(document).on('mousemove', function() {
	window.getSelection().removeAllRanges();
})
