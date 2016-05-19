"use strict";

class Change {
	constructor(stroke, layer) {
		this.stroke = stroke;
		this.layer = layer;
	}
}

var changes = [];
var currentChange = 0;

function addChange(stroke) {
	if (currentChange != changes.length) {
        changes.splice(currentChange, changes.length - currentChange);
    }
	currentChange++;
	changes.push(new Change(stroke, currentLayer));
}

function undo() {
	if(currentChange > 0) {
		currentChange--;
		updateCanvas();
	} else {
		for(var i = 0; i < layers.length; i++) {
			layers[i].clear();
			layers[i].clearBuffer();
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
	for(var i = 0; i < layers.length; i++) {
		layers[changes[i].layer].clear();
    	layers[changes[i].layer].clearBuffer();
	}
    for(var i = 0; i < currentChange; i++) {
		layers[changes[i].layer].completeStroke(changes[i].stroke);
	}
}