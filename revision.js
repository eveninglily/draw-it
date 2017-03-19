"use strict";

/**
 * Simple holder class that holds a stroke and the layer it happened on
 * TODO: Add more types of changes
 */
class Change {
    constructor(type, layer, data, owner) {
        this.type = type;
        this.layer = layer;
        this.data = data;
        this.active = true;
        this.owner = owner;
    }
}

var changes = [];

changes.push(new Change("clear", "layer0", null, 'local'));

/**
 * Adds a change to the list of changes; splices changes if the current state is behind
 */
function addChange(stroke, id) {
    for(var i = changes.length - 1; i >= 0; i--) {
        if(changes[i].owner == 'local' && !(changes[i].active)) {
            changes.splice(i, 1);
        }
    }

    changes.push(new Change("stroke", layers[currentLayer].id, stroke, id));
}

/**
 * Adds a layer clear to the history
 */
function addClear(id) {
    changes.push(new Change("clear", layers[currentLayer].id, null, id));
}

function undo(id) {
    for(var i = changes.length - 1; i >= 0; i--) {
        if(changes[i].owner == id && changes[i].active) {
            changes[i].active = false;
            redrawLayer(changes[i].layer);
            return;
        }
    }
}

/**
 * Finds the most recent inactive change and makes it active
 */
function redo(id) {
    for(var i = 0; i < changes.length; i++) {
        if(changes[i].owner == id && !(changes[i].active)) {
            changes[i].active = true;
            redrawLayer(changes[i].layer);
            return;
        }
    }
}

function redrawLayer(id) {
    var layerMap = {};
    for(var i = 0; i < layers.length; i++) {
        for(var j = 0; j < layers[i].ids.length; j++) {
            layerMap[layers[i].ids[j]] = i;
        }
    }
    var layer = layerMap[id];

    layers[layer].canvas.clear();
    layers[layer].canvas.clearBuffer();
    for(var i = 0; i < changes.length; i++) {
        if(changes[i].active) {
            if(changes[i].type == "stroke") {
                layers[layer].canvas.completeStroke(changes[i].data);
            } else if(changes[i].type == "clear") {
                layers[layer].canvas.clear();
                layers[layer].canvas.clearBuffer();
            }
        }
    }
    layers[layer].updatePreview();
}