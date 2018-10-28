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