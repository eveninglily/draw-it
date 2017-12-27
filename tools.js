/**
 * Holds all tools and deals with their frontends
 */

"use strict";

var pen = new OIBrush("Pen", 10, "source-over", color1);
var eraser = new OIBrush("Eraser", 10, "source-over", "#ffffff");

//TODO: Look into fast text tool, openink api for text
//var text = new Tool("Text", "32px serif", "", "#e73955");

var eyedropper = new OITool("Eyedropper");

$(document).ready(() => {
    //TODO: What should happen if another user draws something that changes the result gotten here?
    $("#eyedropper").on('click', evt => {
        currTool = eyedropper;
        eyedropper.active = true;
        var merged = getMergedVisibleCanvas(true).attr({'class':'layer','id':'mergedLayer'}).css({'opacity': 0});
        $('#layers').append(merged);
    });

});

/** TODO: move into document.ready() */
eyedropper.addCallback('layers', 'mousemove', evt => {
    var n = normalizeEvt(evt);
    $('#eyedropper-holder').css({left: evt.pageX - 55, top: evt.pageY - 55});
    var l = $('#layers').position();
    var c = $('#mergedLayer').get(0).getContext('2d').getImageData(n.x, n.y, 1, 1).data;
    var nC = 'rgb(' + c[0] +', ' + c[1] + ', ' + c[2] + ')';

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
    updateColorDisplays('#' + colorWheel.getHex());
});

//eyedropper.addCallback('layers', 'mouseleave', evt => {});

$('.tool').on('click', function() {
    $('#mergedLayer').remove();
    eyedropper.active = false;
    if($(this).is('#clear') || $(this).is('#back')) {
        return;
    }

    $('.active').removeClass('active');
    $('.activeTool').removeClass('activeTool');
    $(this).addClass('active');
    $('#' + $(this).attr('data-options')).addClass('activeTool');
});

/** TODO: Text Tool Code */
/*
if($('#hidden-input').val() != "") {
        layers[currentLayer].canvas.finalizeText($('#hidden-input').val(), currTool, $('#hidden-input').data('tx'), $('#hidden-input').data('ty'));
        layers[currentLayer].canvas.clear();
        layers[currentLayer].canvas.drawBuffer();
        $('#hidden-input').remove();
    }

if (currTool.name == "Text") {
            $('#hidden-input').remove();
            $('<input>').attr('id', 'hidden-input').data('tx', x).data('ty', y).on('input',function(){
                layers[currentLayer].canvas.clear();
                layers[currentLayer].canvas.drawBuffer();
                layers[currentLayer].canvas.createText($(this).val(), currTool, x, y);
            }).appendTo('body');
            setTimeout(function(){$('#hidden-input').focus();}, 100);
        }
$("#text").on('click', () => currTool = text);
*/
/** END TODO */


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