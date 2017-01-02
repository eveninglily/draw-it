"use strict";

/**
 * Simple holder class that holds a stroke and the layer it happened on
 * TODO: Add more types of changes
 */
class Change {
    constructor(type, layer, data) {
        this.type = type;
        this.layer = layer;
        this.data = data;
    }
}

var changes = [];
var currentChange = 0;

changes.push(new Change("clear", "layer0", null));

/**
 * Adds a change to the list of changes; splices changes if the current state is behind
 */
function addChange(stroke) {
    console.log(currentChange);
    if ((currentChange + 1) != changes.length && currentChange != 0) {
        changes.splice(currentChange + 1, changes.length - currentChange);
    }
    currentChange++;
    changes.push(new Change("stroke", layers[currentLayer].id, stroke));
}

/**
 * Adds a layer clear to the history
 */
function addClear() {
    if ((currentChange + 1) != changes.length  && currentChange != 0) {
        changes.splice(currentChange + 1, changes.length - currentChange);
    }
    currentChange++;
    changes.push(new Change("clear", layers[currentLayer].id, null));
}

/**
 * Undoes a change. If the current change is 0, clears the canvas
 */
function undo() {
    if(currentChange > 0) {
        currentChange--;
        updateCanvas();
    } else {
        updateCanvas();
    }
}

/**
 * Redoes a change
 */
function redo() {
    if(currentChange < changes.length - 1) {
        currentChange++;
        updateCanvas();
    }
}

/**
 * Redraws any layers that need to get redrawn based on currentChange
 */
function updateCanvas() {
    var needsRedraw = [];
    var layerMap = {};

    for(var i = 0; i < layers.length; i++) {
        for(var j = 0; j < layers[i].ids.length; j++) {
            layerMap[layers[i].ids[j]] = i;
        }
    }

    if(changes[currentChange].type == "clear") {
        var layer = layerMap[changes[currentChange].layer];
        layers[layer].canvas.clear();
        layers[layer].canvas.clearBuffer();
        layers[layer].updatePreview();
        return;
    }

    for(var i = currentChange; i < changes.length; i++) {
        var l = layerMap[changes[i].layer];
        layers[l].canvas.clear();
        layers[l].canvas.clearBuffer();
        needsRedraw.push(l);
    }

    if((currentChange == changes.length) || (currentChange != 0)) {
        needsRedraw.push(layerMap[changes[currentChange - 1].layer]);
    }

    for(var i = 0; i <= currentChange; i++) {
        var l = layerMap[changes[i].layer];
        if(needsRedraw.indexOf(l) != -1) {
            if(changes[i].type == "stroke") {
                layers[l].canvas.completeStroke(changes[i].data);
            }
        }
    }
    //TODO: find a way to implement this without it slowing everything down
    /*for(var i = 0; i < needsRedraw.length; i++) {
        layers[needsRedraw[i]].updatePreview();
    }*/
}