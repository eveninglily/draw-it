$('.tool').on('click', function() {
    var s = $('.active').attr('src');
    $('.active').attr('src', s.replace('/active', ''));
    $('.active').removeClass('active');
    $('.activeTool').removeClass('activeTool');

    //TODO: Once SVGs are used, this can be deleted
    $(this).addClass('active');
    var sr = $(this).attr('src').split('/');
    sr.splice(2,0, 'active');
    var src = sr.join('/');
    $(this).attr('src', src);
    $('#mergedLayer').remove();
});

$("#pencil").on('click', function() {
    currTool = pencil;
    $('#brush-settings').addClass('activeTool');
});

$("#eraser").on('click', function() {
    currTool = eraser;
    $('#eraser-settings').addClass('activeTool');
});

$("#text").on('click', function() {
    currTool = text;
    $('#text-settings').addClass('activeTool');
});

//TODO: There might be some complications with multi-user stuff here
$("#eyedropper").on('click', function(e) {
    currTool = eyedropper;
    var merged = getMergedVisibleCanvas().attr({'class':'layer','id':'mergedLayer'}).css({'z-index': 999});
    $('#layers').append(merged);
});

$('#undo').on('click', function() { undo(); });

$('#redo').on('click', function() { redo(); });

/**
 * Returns a data url containing the PNG data
 */
function saveToPNG() {
    return getMergedVisibleCanvas().get(0).toDataURL('image/png').replace('image/png', 'image/octet-stream');
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
 * TODO: Move this?
 */
function loadJSONFile(file, callback) {
    if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('Sorry, your browser can\'t read this file');
        return;
    }
    console.log(file);
    var reader = new FileReader();
    reader.onload = function() {
        var json = JSON.parse(reader.result);
        callback(json);
    }
    reader.readAsText(file);
}

$('#loadFile').on('change', function() {
    loadJSONFile($('#loadFile').get(0).files[0], loadLayersFromJSON);
});

$("#clear").on('click', function(e) {
    if(confirm("Clear all layers? This can not be undone. All history will be lost.")) {
        for(var i = 0; i < layers.length; i++) {
            layers[i].canvas.clear();
            layers[i].canvas.clearBuffer();
            layers[i].updatePreview();
        }
        changes = [];
        currentChange = 0;
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