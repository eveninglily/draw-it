var settings = {
    showLeaveMessage: false,
    whiteBg: false,
    cache: false,
    pointerEvents: false,
    keybinds: {},
    username: "Anon"
};

$(document).ready(function() {
    $(window).on('beforeunload', () => {
        if(settings.showLeaveMessage) {
            return 'Are you sure you want to leave? Your drawing will be lost.';
        }
    });
});

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