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
	changes.push(new Change(stroke, richLayers[currentLayer].id));
}

function undo() {
	if(currentChange > 0) {
		currentChange--;
		updateCanvas();
	} else {
		for(var i = 0; i < layers.length; i++) {
			richLayers[i].canvas.clear();
			richLayers[i].canvas.clearBuffer();
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

	for(var i = 0; i < richLayers.length; i++) {
		for(var j = 0; j < richLayers[i].ids.length; j++) {
			layerMap[richLayers[i].ids[j]] = i;
		}
	}

	for(var i = currentChange; i < changes.length; i++) {
		var l = layerMap[changes[i].layer];
		richLayers[l].canvas.clear();
		richLayers[l].canvas.clearBuffer();
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
			richLayers[l].canvas.completeStroke(changes[i].stroke);
		}
	}
	//TODO: find a way to implement this without it slowing everything down
	/*for(var i = 0; i < needsRedraw.length; i++) {
		richLayers[needsRedraw[i]].updatePreview();
	}*/
}