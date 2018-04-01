/** Sets up the canvas and binds all the core events */

var width = 1920;
var height = 1080;

if($(window).width() < 480 ) {
    console.log('mobile');
    width = 1080;
    height = 1920;
};

var down = false;

var currentLayer = 0;
var layers = [];
var currTool = pen;

/** TODO: relate to vue obj */
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

    if(settings.pointerEvents) {
        initPointerEvents();
    } else {
        initMouseEvents();
        initTouchEvents();
    }

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

/**
 * Initializes mouse events to interact with the canvas
 */
function initMouseEvents() {
    $("#layers").on('mousedown', evt => {
        if(evt.which == 1) {
            normalizeEvt(evt);
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
    }).on('mouseenter', evt => {
        if(down) {
            var n = normalize(evt.offsetX, evt.offsetY);
            start(n.x, n.y, .5);
        }
    }).on('mouseleave', () => {
        if(down) {
            end();
        }
    }).on('contextmenu', evt => {
        evt.preventDefault();
        return false;
    });
}

/**
 * Initializes touch events to work with the canvas
 * TODO: Two finger scroll? Zoom?
 */
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

/**
 * Initializes Pointer Events
 * Not fully supported by most browsers! Use with care!
 */
function initPointerEvents() {
    log('evt', 'Enabled Pointer Events');
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

/**
 * Starts a stroke
 * @param {Number} x Normalized x-coord
 * @param {Number} y Normalized y-coord
 * @param {Number} p Pressure
 */
function start(x, y, p) {
    down = false;
    if(currTool.name == "Pen" || currTool.name == "Eraser") {
        down = true;
        layers[currentLayer].canvas.beginStroke(currTool, x, y, .5, 'local');
        layers[currentLayer].activeStrokes.push('local');
        layers[currentLayer].stroke();
    }
}

/**
 * Updates a stroke
 * @param {Number} x Normalized x-coord
 * @param {Number} y Normalized y-coord
 * @param {Number} p Pressure
 */
function move(x, y, p) {
    layers[currentLayer].canvas.updateStroke(x, y, p, 'local');
    layers[currentLayer].stroke();
}

/**
 * Ends a stroke
 */
function end() {
    layers[currentLayer].canvas.completeStrokeById('local');

    addChange(layers[currentLayer].canvas.strokes['local'], client.clientId);
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
 * Each point is adjusted by the ideal width divided by the actual width
 * @param {Number} x Raw x-coord
 * @param {Number} y Raw y-coord
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
 * Normalizes the coordinates for an event
 * @param {Event} evt The event
 */
function normalizeEvt(evt) {
    if(evt.type == "mousedown" || evt.type == "mousemove") {
        return normalize(evt.offsetX, evt.offsetY);
    } else {
        log('err', 'Unsupported event type in normalize');
    }
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

/**
 * Basic logging function
 * @param {String} type The type of the message
 * @param {String} msg The message to log
 */
function log(type, msg) {
    var time = Date.now();
    console.log("[" + type + "]::" + time + " - " + msg);
}