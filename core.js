var width = 1250;
var height = 800;

var down = false;

var currentLayer = 0;
var layers = [];
var activeStrokes = [];
var currTool = pencil;

$(document).ready(function() {
    addLayer('layer0');
});

function start(x, y) {
    if(currTool.name == "Pencil" || currTool.name == "Eraser") {
        down = true;
        layers[currentLayer].canvas.beginStroke(currTool, x, y, 'local');
        activeStrokes.push('local');
        layers[currentLayer].canvas.doStrokes(activeStrokes);
    } else {
        if(currTool.name == "Eyedropper") {
            var c = $('#mergedLayer').get(0).getContext('2d').getImageData(x, y, 1, 1).data;
            var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';
            pencil.color = nC;
            colorWheel.setColor(c[0], c[1], c[2]);
        } else {
            var text = prompt("Text:");
            if(text != null) {
                layers[currentLayer].canvas.createText(text, currTool, x, y);
            }
        }
        down = false;
    }
}

function move(x, y) {
    layers[currentLayer].canvas.strokes['local'].addPoint(x, y);
    layers[currentLayer].canvas.doStrokes(activeStrokes);
}

function end() {
    layers[currentLayer].canvas.completeStroke(layers[currentLayer].canvas.strokes['local']);
    addChange(layers[currentLayer].canvas.strokes['local']);
    for(var i = 0; i < activeStrokes.length; i++) {
        if(activeStrokes[i] == 'local') {
            activeStrokes.splice(i, 1);
            break;
        }
    }
    layers[currentLayer].canvas.doStrokes(activeStrokes);
    layers[currentLayer].updatePreview();
}

$('#layers').on('touchstart', function (evt) {
    start(evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left, evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top);
}).on('touchmove', function (evt) {
    evt.preventDefault();
    if(down){
        move(
            evt.originalEvent.touches[0].pageX - $('#layers').offset().left,
            evt.originalEvent.touches[0].pageY - $('#layers').offset().top
        );
    }
}).on('mousedown', function(e) {
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

$(document).on('mouseup touchend touchcancel', function(e) {
    if(down) {
        end();
        down = false;
    }
});

$(window).on('beforeunload', function() {
    //TODO: add setting to disable this message
    //return 'Are you sure you want to leave? Your drawing will be lost.';
});

/**
 * Returns a jQuery object of a canvas that contains all layers merged together
 */
function getMergedCanvas() {
    var merged = $('<canvas>').attr({'width': width, 'height': height});
    for(var i = 0; i < layers.length; i++) {
        merged.get(0).getContext('2d').drawImage(layers[i].canvas.canvas, 0, 0);
    }
    return merged;
}

/**
 * Returns a jQuery object of a canvas that contains all layers merged together
 */
function getMergedVisibleCanvas() {
    var merged = $('<canvas>').attr({'width': width, 'height': height});
    for(var i = 0; i < layers.length; i++) {
        if(layers[i].isVisible)
            merged.get(0).getContext('2d').drawImage(layers[i].canvas.canvas, 0, 0);
    }
    return merged;
}