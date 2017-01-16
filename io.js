function saveJSONFile(name, data) {
    var blob = new Blob([JSON.stringify(data)], {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = name;
    a.href = url;
    a.click();
}

/**
 * Returns a data url containing the PNG data
 */
function saveToPNG() {
    return getMergedVisibleCanvas(settings.whiteBg).get(0).toDataURL('image/png').replace('image/png', 'image/octet-stream');
}

/**
 * Returns a data url containing the layer data in JSON
 */
function saveLayersToJSON() {
    var data = {};
    for(var i = 0; i < layers.length; i++) {
        data[i] = layers[i].toJSON();
    }
    var blob = new Blob([JSON.stringify(data)], {type:"application/json"});

    var url = URL.createObjectURL(blob);
    return url;
}

/**
 * Loads JSON data into the layers
 */
function loadLayersFromJSON(json) {
    layers.splice(0, layers.length);
    currentLayer = 0;
    $('#layer-list').empty()
    $('#layers').empty()
    nLayer = 0;
    for(var key in json) {
        Layer.fromJSON(json[key]);
    }
}

/**
 * Loads JSON from a file
 */
function loadJSONFile(file, callback) {
    if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('Sorry, your browser can\'t read this file');
        return;
    }
    //console.log(file);
    var reader = new FileReader();
    reader.onload = function() {
        var json = JSON.parse(reader.result);
        callback(json);
    }
    reader.readAsText(file);
}

$(document).ready(function() {
    $('#loadFile').on('change', function() {
        loadJSONFile($('#loadFile').get(0).files[0], loadLayersFromJSON);
    });
})