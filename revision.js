"use strict";

/**
 * Simple holder class that holds a stroke and the layer it happened on
 */
class Change {
    constructor(stroke, layer) {
        this.stroke = stroke;
        this.layer = layer;
    }
}

var changes = [];
var currentChange = 0;
//TODO: Document functions
function addChange(stroke) {
    if (currentChange != changes.length) {
        changes.splice(currentChange, changes.length - currentChange);
    }
    currentChange++;
    changes.push(new Change(stroke, layers[currentLayer].id));
}

function undo() {
    if(currentChange > 0) {
        currentChange--;
        updateCanvas();
    } else {
        for(var i = 0; i < layers.length; i++) {
            layers[i].canvas.clear();
            layers[i].canvas.clearBuffer();
        }
    }
}

function redo() {
    if(currentChange <= changes.length - 1) {
        currentChange++;
        updateCanvas();
    }
}

function updateCanvas() {
    var needsRedraw = [];
    var layerMap = {};

    for(var i = 0; i < layers.length; i++) {
        for(var j = 0; j < layers[i].ids.length; j++) {
            layerMap[layers[i].ids[j]] = i;
        }
    }

    for(var i = currentChange; i < changes.length; i++) {
        var l = layerMap[changes[i].layer];
        layers[l].canvas.clear();
        layers[l].canvas.clearBuffer();
        needsRedraw.push(l);
    }

    if(currentChange == changes.length) {
        needsRedraw.push(layerMap[changes[currentChange - 1].layer]);
    }

    if(currentChange != 0) {
        needsRedraw.push(layerMap[changes[currentChange - 1].layer]);
    }

    for(var i = 0; i < currentChange; i++) {
        var l = layerMap[changes[i].layer];
        if(needsRedraw.indexOf(l) != -1) {
            layers[l].canvas.completeStroke(changes[i].stroke);
        }
    }
    //TODO: find a way to implement this without it slowing everything down
    /*for(var i = 0; i < needsRedraw.length; i++) {
        layers[needsRedraw[i]].updatePreview();
    }*/
}