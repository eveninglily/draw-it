/** Tracks stroke history; allows undo/redo */
'use strict';

/**
 * Simple holder class that holds a stroke and the layer it happened on
 */
class Change {

    /**
     * Creates a new change
     * @param {String} type The type ( stroke | clear )
     * @param {String} layer The id of the layer
     * @param {Object} data The data associated with the change
     * @param {String} owner The base64 id associated with the owner (or local)
     */
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
 * Adds a stroke to the list of changes; splices changes if the current state is behind
 * @param {OIStroke} stroke The stroke object to commit to history
 * @param {String} owner The owner of the stroke
 */
function addChange(stroke, owner) {
    for(var i = changes.length - 1; i >= 0; i--) {
        if(changes[i].owner == 'local' && !(changes[i].active)) {
            changes.splice(i, 1);
        }
    }

    changes.push(new Change("stroke", layers[currentLayer].id, stroke, owner));
}

/**
 * Adds a layer clear to the history
 * @param {String} owner The user who cleared
 */
function addClear(owner) {
    changes.push(new Change("clear", layers[currentLayer].id, null, id));
}

/**
 * Move back in a user's change history
 * @param {String} owner The owner of the change to undo
 */
function undo(owner) {
    for(var i = changes.length - 1; i >= 0; i--) {
        if(changes[i].owner == owner && changes[i].active) {
            changes[i].active = false;
            redrawLayer(changes[i].layer);
            return;
        }
    }
}

/**
 * Moves forward in a user's change history
 * @param {String} owner The owner of the change to redo
 */
function redo(owner) {
    for(var i = 0; i < changes.length; i++) {
        if(changes[i].owner == owner && !(changes[i].active)) {
            changes[i].active = true;
            redrawLayer(changes[i].layer);
            return;
        }
    }
}

/**
 * Draws a layer at the current point in history
 * @param {*} id
 */
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