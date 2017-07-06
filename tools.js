/**
 * Holds all tools and deals with their frontends
 */

"use strict";

/**
 * Simple object to hold data about tools in a standard way
 * TODO: Consider rewrite, implications of rewrite
 */
class Tool {
    constructor(name, size, meta, color) {
        this.name = name;
        this.size = size;
        this.opacity = 1;
        this.color = color;
        this.meta = meta
    }
}

var pencil = new Tool("Pencil", 5, "source-over", color1);
var eraser = new Tool("Eraser", 3, "source-over", color2);
var text = new Tool("Text", "32px serif", "", "#e73955");
var eyedropper = new Tool("Eyedropper");

$('.tool').on('click', function() {
    $('#mergedLayer').remove();
    if($(this).is('#clear') || $(this).is('#back')) {
        return;
    }

    $('.active').removeClass('active');
    $('.activeTool').removeClass('activeTool');
    $(this).addClass('active');
    $('#' + $(this).attr('data-options')).addClass('activeTool');
});

$("#brush").on('click', () => currTool = pencil);
$("#eraser").on('click', () => currTool = eraser);
$("#text").on('click', () => currTool = text);

//TODO: What should happen if another user draws something that changes the result gotten here?
$("#eyedropper").on('click', function(e) {
    currTool = eyedropper;
    var merged = getMergedVisibleCanvas(true).attr({'class':'layer','id':'mergedLayer'}).css({'opacity': 0});
    $('#layers').append(merged);
});

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

$("#clear").on('click', function(e) {
    if(confirm("Clear all layers? This can not be undone. All history will be lost.")) {
        for(var i = 0; i < layers.length; i++) {
            layers[i].canvas.clear();
            layers[i].canvas.clearBuffer();
            layers[i].updatePreview();
        }
        changes = [];
    }
});

//TODO: Replace this with SliderVar instances
function initSliders(toolName) {
    $('#' + toolName + '-size').on('input', function () {
       $('#' + toolName + '-size-value').val($(this).val());
       currTool.size = $(this).val();
    });

    $('#' + toolName + '-size-value').on('input', function () {
       $('#' + toolName + '-size').val($(this).val());
       currTool.size = $(this).val();
    });

    $('#' + toolName + '-opacity').on('input', function () {
       $('#' + toolName + '-opacity-value').val($(this).val());
       currTool.opacity = ($(this).val() / 100);
    });

    $('#' + toolName + '-opacity-value').on('input', function () {
       $('#' + toolName + '-opacity').val($(this).val());
       currTool.opacity = ($(this).val() / 100);
    });
}

initSliders('brush');
initSliders('eraser');
var fontSize = new SliderVar('font-size');