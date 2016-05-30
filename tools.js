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

$("#color1, #color2").on('click', function() {
	$('#color-settings').addClass('activeTool');
});

$('#undo').on('click', function(e) {
	undo();
});

$('#redo').on('click', function(e) {
	redo();
});

$("#save").on('click', function(e) {

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

var colorWheel = new ColorWheel('wheel', 300);

$('#wheel').insertBefore('#brush-settings');


//TODO: replace
$('#wheel').on('mousemove', function() {
	currTool.color = "#"+colorWheel.getHex();
    $("#color1").css({background: currTool.color});
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