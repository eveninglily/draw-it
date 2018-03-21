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

    $("#color1").on('click', () => {
        activeColor = 1;
        hexInput.update(color1);
    });

    $("#color2").on('click', () => {
        activeColor = 2;
        hexInput.update(color2);
    });
});