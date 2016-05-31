var color1 = '#000000';
var color2 = '#ffffff';
var activeColor = 1;

$('.tool').on('click', function() {
	$('.active').removeClass('active');
	$(this).addClass('active');
	$('.activeTool').removeClass('activeTool');
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

$("#eyedropper").on('click', function(e) {
    currTool = eyedropper;
});

$('#undo').on('click', function() {	undo(); });

$('#redo').on('click', function() { redo(); });

//TODO: REPLACE MAGIC NUMBERS
$("#save").on('click', function(e) {
	var merged = $('<canvas>').attr({'width': 750, 'height': 750});
	for(var i = 0; i < layers.length; i++) {
		merged.get(0).getContext('2d').drawImage(layers[i].canvas, 0, 0);
	}

	var a = document.createElement('a');
    a.download = "amidraw.png";
    a.href = merged.get(0).toDataURL('image/png').replace('image/png', 'image/octet-stream');
    a.click();
});

$("#clear").on('click', function(e) {
    if(confirm("Clear all layers?")) {
        for(var i = 0; i < layers.length; i++) {
            layers[i].clear();
            layers[i].clearBuffer();
            $('#layer-list tr').children(':nth-child(1)').html(layers[i].toImage());
        }
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
	   $('#' + toolName + '-size-value').val($(this).val());
	   currTool.opacity = ($(this).val() / 100);
    });

	$('#' + toolName + '-opacity-value').on('input', function () {
	   $('#' + toolName + '-size').val($(this).val());
	   currTool.opacity = ($(this).val() / 100);
    });
}

initSliders('brush');
initSliders('eraser');
