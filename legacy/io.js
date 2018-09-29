/** Utility functions for file I/O */
"use strict";

/**
 * Loads JSON from a file, and processes it in a callback
 * @param {Blob} file The file to be loaded
 * @param {Function} callback The callback that the JSON data will be passed to
 */
function loadJSONFile(file, callback) {
    if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('Sorry, your browser can\'t read this file');
        return;
    }

    var reader = new FileReader();
    reader.onload = function() {
        var json = JSON.parse(reader.result);
        callback(json);
    }
    reader.readAsText(file);
}

/**
 * Saves a blob to a user's computer
 * @param {String} name The name of the file to be saved
 * @param {Blob} file The blob data
 */
function saveBlob(name, file) {
    var url = URL.createObjectURL(file);

    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = "display: none";
    a.download = name;
    a.href = url;
    a.click();
}

/**
 * Returns a blob containing the JSON data
 * @param {Object} data The JSON data to put in the blob
 */
function jsonToBlob(data) {
    return new Blob([JSON.stringify(data)], {type:"application/json"});
}

/**
 * Specific Utility functions
 * TODO: Should these be moved?
 */

 /**
  * Returns a blob containing all the layers merged
  */
function layersToBlob(name) {
    return getMergedVisibleCanvas(settings.whiteBg).get(0).toBlob(blob => {
        saveBlob(name, blob);
    }, 'image/png');
}

/**
 * Returns a blob containing layer JSON data
 */
function layersJsonToBlob() {
    var data = {};
    for(var i = 0; i < layers.length; i++) {
        data[i] = layers[i].toJSON();
    }
    return jsonToBlob(data);
}

/**
 * Loads JSON data into layers
 * Callback for loadJSONData
 * @param {Object} data
 */
function importJSON(data) {
    layers.splice(0, layers.length);
    currentLayer = 0;
    $('#layer-list').empty()
    $('#layers').empty()
    nLayer = 0;
    for(var key in json) {
        Layer.fromJSON(json[key]);
    }
}