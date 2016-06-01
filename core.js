var down = false;
var canvas = $('#layer0').get(0);
var can = new DrawingCanvas(canvas);

var layers = [can];
var currentLayer = 0;

var currTool = pencil;

var width = 750;
var height = 750;

function start(x, y) {
	if(currTool.name == "Pencil" || currTool.name == "Eraser") {
		layers[currentLayer].beginStroke(currTool, x, y, 'local');
		layers[currentLayer].doStrokes('local');
	} else {
        if(currTool.name == "Eyedropper") {
                var c = $('#mergedLayer').get(0).getContext('2d').getImageData(x, y, 1, 1).data;
                var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';
                pencil.color = nC;
                colorWheel.setColor(c[0], c[1], c[2]);
        } else {
		      layers[currentLayer].createText(prompt("Text:"), currTool, x, y);
        }
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
}).on('mousemove', function(e) {
	if(down) {
		window.getSelection().removeAllRanges()
		e.preventDefault();
    	move(e.offsetX, e.offsetY);
	}
	if(currTool.name == "Eyedropper") {
		$('#eyedropper-holder').css({left: e.pageX - 55, top: e.pageY - 55});
		var l = $('#layers').position();
		var c = $('#mergedLayer').get(0).getContext('2d').getImageData(e.pageX - l.left, e.pageY - l.top, 1, 1).data;
		var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';

		$('#eyedropper-bottom').css({'border-color': pencil.color});
		$('#eyedropper-top').css({'border-color': nC});
	}
}).on('mouseenter', function(e) {
	if(currTool.name == "Eyedropper") {
		$('.eyedropper-wheel').css({display:'block'});
	}
	if(down) {
		start(e.offsetX, e.offsetY);
	}
}).on('mouseleave', function() {
	if(currTool.name == "Eyedropper") {
		$('.eyedropper-wheel').css({display:'none'});
	}
	if(down) {
		end();
	}
});

$(document).on('mouseup touchend', function(e) {
	if(down) {
		end();
		down = false;
	}
})