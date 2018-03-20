/**
 * Holds all tools and deals with their frontends
 * TODO: Implement Text Tool, changes in OITool?
 * TODO: Create Vial Sliders, and then update brush-settings and eraser-settings
 */

"use strict";

var pen = new OIBrush("Pen", 10, "source-over", color1);
var eraser = new OIBrush("Eraser", 10, "source-over", "#ffffff");
var eyedropper = new OITool("Eyedropper");

var penOpts;
var eraserOpts;

$(document).ready(() => {
    /** Init Eyedropper */
    //TODO: What should happen if another user draws something that changes the result gotten here?
    $("#eyedropper").on('click', evt => {
        currTool = eyedropper;
        eyedropper.active = true;
        var merged = getMergedVisibleCanvas(true).attr({'class':'layer','id':'mergedLayer'}).css({'opacity': 0});
        $('#layers').append(merged);
    });

    eyedropper.addCallback('layers', 'mousemove', evt => {
        var n = normalizeEvt(evt);
        $('#eyedropper-holder').css({left: evt.pageX - 55, top: evt.pageY - 55});

        /** Get Color data from clicked spot */
        var l = $('#layers').position();
        var c = $('#mergedLayer').get(0).getContext('2d').getImageData(n.x, n.y, 1, 1).data;
        var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';

        /** Update Eyedropper values */
        $('#eyedropper-bottom').css({'border-color': pen.color});
        $('#eyedropper-top').css({'border-color': nC});
    });

    eyedropper.addCallback('layers', 'mouseleave', evt => {
        $('.eyedropper-wheel').css({display:'none'});
    });

    eyedropper.addCallback('layers', 'mouseenter', evt => {
        $('.eyedropper-wheel').css({display:'block'});
    });

    eyedropper.addCallback('layers', 'mousedown', evt => {
        var n = normalizeEvt(evt);
        var c = $('#mergedLayer').get(0).getContext('2d').getImageData(n.x, n.y, 1, 1).data;
        var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';
        pen.color = nC;
        colorWheel.setColor(c[0], c[1], c[2]);
        hexInput.update('#' + colorWheel.getHex());
    });

    $('.tool').on('click', function() {
        $('#mergedLayer').remove();
        eyedropper.active = false;

        $('.active').removeClass('active');
        $('.activeTool').removeClass('activeTool');
        $(this).addClass('active');
        $('#' + $(this).attr('data-options')).addClass('activeTool');
    });

    $("#brush").on('click', () => currTool = pen);
    $("#eraser").on('click', () => currTool = eraser);

    $('#undo').on('click', () => {
        undo(client.clientId);
        if(client.connected) {
            client.sendUndo();
        }
    });

    $('#redo').on('click', () => {
        redo(client.clientId);
        if(client.connected) {
            client.sendRedo();
        }
    });

    $("#clear").on('click', evt => {
        if(confirm("Clear all layers? This can not be undone. All history will be lost.")) {
            for(var i = 0; i < layers.length; i++) {
                layers[i].canvas.clear();
                layers[i].canvas.clearBuffer();
                layers[i].updatePreview();
            }
            changes = [];
        }
    });

    $('#load-file').on('change', function() {
        loadJSONFile($('#load-file').get(0).files[0], importJSON);
    });

    /** TODO: Write a generic vue component, or wait until Vial-Slider */

    penOpts = new Vue({
        'el': '#brush-settings',
        'data': {
            size: 5,
            opacity: 100
        },
        'methods': {
            updateSize: function(val) {
                this.size = val;
                pen.size = val;
            },
            updateSizeSlider: function(evt) {
                this.updateSize(evt.target.value);
            },
            updateOpacity: function(val) {
                this.opacity = val;
                pen.opacity = (1.0 * val) / 100;
            },
            updateOpacitySlider: function(evt) {
                this.updateOpacity(evt.target.value);
            }
        }
    });

    eraserOpts = new Vue({
        'el': '#eraser-settings',
        'data': {
            size: 5,
            opacity: 100
        },
        'methods': {
            updateSize: function(val) {
                this.size = val;
                eraser.size = val;
            },
            updateSizeSlider: function(evt) {
                this.updateSize(evt.target.value);
            },
            updateOpacity: function(val) {
                this.opacity = val;
                eraser.opacity = (1.0 * val) / 100;
            },
            updateOpacitySlider: function(evt) {
                this.updateOpacity(evt.target.value);
            }
        }
    });
});