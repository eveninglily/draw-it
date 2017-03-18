/**
 * Sets up the canvas and binds all the core events
 */

var width = 1920;
var height = 1080;

var down = false;

var currentLayer = 0;
var layers = [];
var currTool = pencil;

var settings = {
    showLeaveMessage: false,
    whiteBg: false,
    cache: false,
    pointerEvents: false,
    keybinds: {},
    username: "Anon"
};

$(document).ready(function() {
    addLayer('layer0');
    setTimeout(function(){
        var n = layers[layers.length - 1];
        $('#' + n.id + '-control').trigger('mousedown'); //TODO: this is hacky. Fix?
        $('#' + n.id + '-control').trigger('mouseup');
    }, 0);

    initMouseEvents();
    initTouchEvents();

    $(document).on('mouseup touchend touchcancel pointercancel pointerup', () => {
        if(down) {
            end();
            down = false;
        }
    });

    $(window).on('beforeunload', () => {
        if(settings.showLeaveMessage) {
            return 'Are you sure you want to leave? Your drawing will be lost.';
        }
    });
});

function initMouseEvents() {
    $("#layers").on('mousedown', evt => {
        if(evt.which == 1) {
            var n = normalize(evt.offsetX, evt.offsetY);
            start(n.x, n.y, .5);
        }
    }).on('mousemove', evt => {
        var n = normalize(evt.offsetX, evt.offsetY);
        if(down) {
            window.getSelection().removeAllRanges()
            evt.preventDefault();
            move(n.x, n.y,.5);
        }
        //TODO: Move this; rewrite tools
        if(currTool.name == "Eyedropper") {
            $('#eyedropper-holder').css({left: evt.pageX - 55, top: evt.pageY - 55});
            var l = $('#layers').position();
            var c = $('#mergedLayer').get(0).getContext('2d').getImageData(n.x, n.y, 1, 1).data;
            var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';

            $('#eyedropper-bottom').css({'border-color': pencil.color});
            $('#eyedropper-top').css({'border-color': nC});
        }
    }).on('mouseenter', evt => {
        //TODO: Move this; rewrite tools
        if(currTool.name == "Eyedropper") {
            $('.eyedropper-wheel').css({display:'block'});
        }
        if(down) {
            var n = normalize(evt.offsetX, evt.offsetY);
            start(n.x, n.y, .5);
        }
    }).on('mouseleave', () => {
        //TODO: Move this, rewrite tools
        if(currTool.name == "Eyedropper") {
            $('.eyedropper-wheel').css({display:'none'});
        }
        if(down) {
            end();
        }
    }).on('contextmenu', evt => {
        evt.preventDefault();
        return false;
    });
}

function initTouchEvents() {
    $('#layers').on('touchstart', evt => {
        var n = normalize(
            (evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left),
            (evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top)
        );
        start(n.x, n.y, .5);
    }).on('touchmove', evt => {
        evt.preventDefault();
        if(down){
            var n = normalize(
                (evt.originalEvent.touches[0].pageX - $('#layers').offset().left),
                (evt.originalEvent.touches[0].pageY - $('#layers').offset().top)
            );
            move(n.x, n.y, .5);
        }
    });
}

function initPointerEvents() {
    $('#layers').on('pointerdown', function(evt) {
        var n = normalize(evt.offsetX, evt.offsetY);
        start(n.x, n.y, evt.originalEvent.pressure);
    }).on('pointermove', function(evt) {
        if(down) {
            window.getSelection().removeAllRanges()
            evt.preventDefault();
            var n = normalize(evt.offsetX, evt.offsetY);
            move(n.x, n.y, evt.originalEvent.pressure);
        }
    }).off('mousedown mousemove');
    client._initPointers();
}

//TODO: Rewrite inside of this along with tools
function start(x, y, p) {
    if($('#hidden-input').val() != "") {
        layers[currentLayer].canvas.finalizeText($('#hidden-input').val(), currTool, $('#hidden-input').data('tx'), $('#hidden-input').data('ty'));
        layers[currentLayer].canvas.clear();
        layers[currentLayer].canvas.drawBuffer();
        $('#hidden-input').remove();
    }

    if(currTool.name == "Pencil" || currTool.name == "Eraser") {
        down = true;
        layers[currentLayer].canvas.beginStroke(currTool, x, y, .5, 'local');
        layers[currentLayer].activeStrokes.push('local');
        layers[currentLayer].stroke();
    } else {
        if(currTool.name == "Eyedropper") {
            var c = $('#mergedLayer').get(0).getContext('2d').getImageData(x, y, 1, 1).data;
            var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';
            pencil.color = nC;
            colorWheel.setColor(c[0], c[1], c[2]);
            updateColorDisplays('#' + colorWheel.getHex());
        } else if (currTool.name == "Text") {
            $('#hidden-input').remove();
            $('<input>').attr('id', 'hidden-input').data('tx', x).data('ty', y).on('input',function(){
                layers[currentLayer].canvas.clear();
                layers[currentLayer].canvas.drawBuffer();
                layers[currentLayer].canvas.createText($(this).val(), currTool, x, y);
            }).appendTo('body');
            setTimeout(function(){$('#hidden-input').focus();}, 100);
        }
        down = false;
    }
}

function move(x, y, p) {
    layers[currentLayer].canvas.strokes['local'].addPoint(x, y, p);
    layers[currentLayer].stroke();
}

function end() {
    layers[currentLayer].canvas.completeStroke(layers[currentLayer].canvas.strokes['local']);
    addChange(layers[currentLayer].canvas.strokes['local']);
    for(var i = 0; i < layers[currentLayer].activeStrokes.length; i++) {
        if(layers[currentLayer].activeStrokes[i] == 'local') {
            layers[currentLayer].activeStrokes.splice(i, 1);
            break;
        }
    }
    layers[currentLayer].stroke();
    layers[currentLayer].updatePreview();
}

/**
 * Normalizes a point to adapt to all display sizes
 */
function normalize(x, y) {
    var xR = width / $('#layers').width();
    var yR = height / $('#layers').height();

    return {
        x: x * xR,
        y: y * yR
    };
}

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
 * Returns a jQuery object of a canvas that contains all visible layers merged together
 */
function getMergedVisibleCanvas(whiteBg) {
    var merged = $('<canvas>').attr({'width': width, 'height': height});
    var ctx = merged.get(0).getContext('2d');
    if(whiteBg) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.fillRect(0, 0, width, height);
    }
    for(var i = 0; i < layers.length; i++) {
        if(layers[i].isVisible) {
            ctx.globalAlpha = layers[i].opacity;
            ctx.drawImage(layers[i].canvas.canvas, 0, 0);
        }
    }
    return merged;
}