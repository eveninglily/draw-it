$('.tool').on('click', function() {
    $('.active').removeClass('active');
    $(this).addClass('active');
    $('.activeTool').removeClass('activeTool');
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

$('#fileName').on('input', function() {
    var name = $('#fileName').val();
    if(name.length == 0) {
        name = "amidraw";
    }
    $('#dl-link').attr('download', name + '.' + $('#fileType').val());
});

$('#modal-bg').on('click', function(evt) {
    if(evt.target.id == 'modal-bg') {
        hideSave();
    }
}).hide();

function hideSave(){
    $('#modal-bg').hide();
    clearInterval($('#gallery-error').data('interval'));
}

$('#cancel-save').on('click', hideSave);
$("#save").on('click', function(e) {
    $('#modal-bg').show().css('display','flex');
    $('#dl-link').attr('href', saveToPNG()).on('click', function() {
        if($('#upload').is(':checked')) {
            client.save();
        }
        hideSave();
    });

    $('#gallery-error').data('interval', setInterval(checkGalleryConnection, 500));
});

/**
 * Checks the connection to the server, shows an error if not connected
 */
function checkGalleryConnection() {
    if(client.connected) {
        $('#gallery-error').hide();
        $('#upload').prop('disabled', false);
    } else {
        $('#gallery-error').show();
        $('#upload').prop('disabled', true);
        $('#upload').prop('checked', false);
    }
}

$('#fileType').on('change', function() {
    var name = $('#fileName').val();
    if(name.length == 0) {
        name = "amidraw";
    }
    $('#dl-link').attr('download', name + '.' + $('#fileType').val());
    if($('fileType').val() == 'png') {
        $('#dl-link').attr('href', saveToPNG());
    } else {
        $('#dl-link').attr('href', saveLayersToJSON());
    }
});

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
 * TODO: Move logic to Layer.fromJSON(), finish
 */
function loadLayersFromJSON(json) {
    layers.splice(0, layers.length);
    currentLayer = 0;
    $('#layer-list').empty()
    $('#layers').empty()
    nLayer = 0;
    for(var key in json) {
        addLayer(json[key].id);
        var layer = layers[layers.length - 1];
        layer.canvas.loadDataURL(json[key].data);
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

$('#invite').on('click', function() {
    client.connect();
})

initSliders('brush');
initSliders('eraser');
