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
	var merged = getMergedLayer().attr({'class':'layer','id':'mergedLayer'}).css({'z-index': 999});
	$('#layers').append(merged);
});

$('#undo').on('click', function() {	undo(); });

$('#redo').on('click', function() { redo(); });

$('#fileName').on('input', function() {
	var name = $('#fileName').val();
	if(name.length == 0) {
		name = "amidraw.png";
	}
	$('#dl-link').attr('download', $('#fileName').val() + '.png');
});

$('#modal-bg').on('click', function(e) {
	if(e.target.id != "modal")
		if(e.target.id != "fileName")
			if(e.target.id != "dl-link")
				$('#modal-bg').hide();
}).hide();

$("#save").on('click', function(e) {
	$('#modal-bg').show().css('display','flex');
    $('#dl-link').attr('href', getMergedLayer().get(0).toDataURL('image/png').replace('image/png', 'image/octet-stream'));
});

//TODO: Find a better name
function getMergedLayer() {
	var merged = $('<canvas>').attr({'width': width, 'height': height});
	for(var i = 0; i < layers.length; i++) {
		merged.get(0).getContext('2d').drawImage(layers[i].canvas.canvas, 0, 0);
	}
	return merged;
}

function saveToJSON() {
	var data = {};
	for(var i = 0; i < layers.length; i++) {
		data[i] = layers[i].toJSON();
	}
	var blob = new Blob([JSON.stringify(data)], {type:"application/json"});

    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download = "amidraw.json";
    a.href = url;
    a.click();
}

$("#clear").on('click', function(e) {
    if(confirm("Clear all layers? This can not be undone. All history will be lost.")) {
        for(var i = 0; i < layers.length; i++) {
            layers[i].canvas.clear();
            layers[i].canvas.clearBuffer();
            $('#layer-list tr').children(':nth-child(1)').html(layers[i].canvas.toImage());
        }
		changes = [];
		currentChange = 0;
    }
});

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
