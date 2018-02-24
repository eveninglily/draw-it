/** Color Input/Handling
 * TODO: https://i.imgur.com/QVgYbiZ.gif
*/

var color1 = '#000000';
var color2 = '#ffffff';
var activeColor = 1;
var colorWheel;
var hexInput;

$(document).ready(() => {
    /** Colorwheel init */
    colorWheel = new ColorWheel('wheel', 250, function() {
        currTool.color = "#" + colorWheel.getHex();
        hexInput.update(colorWheel.getHex());
    });
    colorWheel.adjustSize();
    $(window).resize(() => {
        colorWheel.adjustSize();
        if(activeColor == 1) {
            colorWheel.setColorHex(color1);
        } else {
            colorWheel.setColorHex(color2);
        }
    });

    colorWheel.setColorHex(color1);
    $('#wheel').prependTo('#wheel-holder');

    /** Other UI Init */
    $('#color1').css({ background: color1 });
    $('#color2').css({ background: color2 });

    hexInput = new Vue({
        'el': '#hex-val-container',
        'data': {
            color: '#' + colorWheel.getHex()
        },
        'methods': {
            validate: function(inp) {
                //#([a-f]|[0-9]){6}$
                var match = inp.toString().match("#([a-f]|[0-9]){6}$");

                // TODO: Error highlight
                if(match == null) {
                    return;
                }

                // TODO: Error highlight
                if(match[0] != inp) {
                    return;
                }

                this.update(inp);
            },
            update: function(val) {
                val = val.replace('#', '');
                this.color = '#' + val;

                colorWheel.setColorHex(this.color);
                currTool.color = this.color;
                if(activeColor == 1) {
                    $("#color1").css({background: currTool.color});
                    color1 = currTool.color;
                } else {
                    $("#color2").css({background: currTool.color});
                    color2 = currTool.color;
                }
            },
            val: function() {
                return this.color.replace('#', '');
            }
        }
    });

    hexInput.update(colorWheel.getHex());

    $("#color1").on('click', function() {
        activeColor = 1;
        hexInput.update(color1);
    });

    $("#color2").on('click', function() {
        activeColor = 2;
        hexInput.update(color2);
    });
});


/** ALL CODE BELOW IS DEPRECATED */
$('#savePalette').on('click', savePalette);

function savePalette() {
    var data = {};
    $('.color').each(function(i, obj) {
        //Turns out, the ctx treats color as hex, so setting the style to the rgb() we get converts it
        var rgb = $(obj).css('background-color');
        layers[currentLayer].canvas.ctx.strokeStyle = rgb;
        data[i] = layers[currentLayer].canvas.ctx.strokeStyle;
    });
    saveJSONFile('palette.json', data);
}

$('#loadPalette').on('change', function() {
    loadJSONFile($('#loadPalette').get(0).files[0], loadPalette);
});

function loadPalette(json) {
    for(var key in json) {
        addPaletteItem(json[key]);
    }
}

function addPaletteItem(color) {
    var paletteItem = $('<div>')
        .addClass('color')
        .css({background: color})
        .on('click', () => {
            currTool.color = color;
            hexInput.update(color);
        }).on('mousedown', () => {
            $('.currColor').removeClass('currColor');
            $(this).addClass('currColor');
        }).on('contextmenu', () => {
            $("<div>").on('click', function() {
                paletteItem.remove();
                $(this).remove();
            }).html("Delete")
            .addClass('context-item contextmenu').css({
                left: e.pageX,
                top: e.pageY
            }).appendTo('body');
            return false;
        });

        paletteItem.appendTo('#color-palette');
        detectLongClick(paletteItem);
}

$('#palette-holder').on('mousemove', function(e) {
    if($('.currColor').data('dragging')) {
        var r = $('.currColor');

        e.preventDefault();
        document.getSelection().removeAllRanges();
        var x = e.pageX - $('#color-palette').offset().left;
        if(!(r.index() == 0)) {
            var prev = r.prev();
            if(r.position().top == prev.position().top) {
                if(x < (prev.position().left - (prev.width()))) {
                    r.insertBefore(prev);
                }
            }
        }

        if(!(r.index() == $('.color').length - 1)) {
            var next = r.next();
            if(r.position().top == next.position().top) {
                if(x > (next.position().left - (next.width()))) {
                    r.insertAfter(next);
                }
            }
        }

        var y = e.pageY;
        if(!(r.index == ($('.color').length - 1))) {
            if(y > r.position().top + (r.height()) * 1.5) {
                var next = r.next();
                while(next.position().left != r.position().left ) {
                    if(next.index() == ($('.color').length - 1)) {
                        r.insertAfter(next);
                        return;
                    }
                    next = next.next();
                }
                r.insertAfter(next);
            }
        }

        if(!(r.index == 0)) {
            if(y < r.position().top - (r.height())) {
                var prev = r.prev();
                while(prev.position().left != r.position().left ) {
                    if(prev.index() == 0) {
                        r.insertBefore(prev);
                        return;
                    }
                    prev = prev.prev();
                }
                r.insertBefore(prev);
            }
        }
    }
});

$('#addToPalette').on('click', function() {
    addPaletteItem(currTool.color);
});

$('#colorwheel-toggle').on('click', function() {
    $('#wheel').toggle();
});

$('#hsv-toggle').on('click', function() {
    $('#hsv-settings').toggle();
});

$('#gradient-toggle').on('click', function() {

});

$('#palette-toggle').on('click', function() {
    $('#palette-holder').toggle();
});