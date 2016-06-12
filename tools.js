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

$('#undo').on('click', function() {	undo(); });

$('#redo').on('click', function() { redo(); });

$('#fileName').on('input', function() {
	var name = $('#fileName').val();
	if(name.length == 0) {
		name = "amidraw";
	}
	$('#dl-link').attr('download', name + '.' + $('#fileType').val());
});

$('#modal-bg').on('click', function(e) {
	if(e.target.id == 'modal-bg') {
		$('#modal-bg').hide();
	}
}).hide();

$("#save").on('click', function(e) {
	$('#modal-bg').show().css('display','flex');
    $('#dl-link').attr('href', saveToPNG()).on('click', function() {
		if($('#upload').is(':checked')) {
			sFile();
		}
		$('#modal-bg').hide();
	});
});

$('#fileType').on('change', function() {
	var name = $('#fileName').val();
	if(name.length == 0) {
		name = "amidraw";
	}
	$('#dl-link').attr('download', name + '.' + $('#fileType').val());
	if($('fileType').val() == 'png') {
		$('#dl-link').attr('href', saveToPNG());
	} else {
		$('#dl-link').attr('href', saveToJSON());
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
function saveToJSON() {
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
 * @param {Object} data - The JSON data to load
 */
function loadFromJSON(data) {}

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

/**
 * Returns a jQuery object of a canvas that contains all layers merged together
 */
function getMergedCanvas() {
	var merged = $('<canvas>').attr({'width': width, 'height': height});
	for(var i = 0; i < layers.length; i++) {
		merged.get(0).getContext('2d').drawImage(layers[i].canvas.canvas, 0, 0);
	}
	return merged;
}

/**
 * Returns a jQuery object of a canvas that contains all layers merged together
 */
function getMergedVisibleCanvas() {
	var merged = $('<canvas>').attr({'width': width, 'height': height});
	for(var i = 0; i < layers.length; i++) {
		if(layers[i].isVisible)
			merged.get(0).getContext('2d').drawImage(layers[i].canvas.canvas, 0, 0);
	}
	return merged;
}

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
	connect();
})

initSliders('brush');
initSliders('eraser');
