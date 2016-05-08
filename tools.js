$("#pencil").on('click', function() {
	currTool = pencil;
	$('.active').removeClass('active');
	$(this).addClass('active');

	$('.activeTool').removeClass('activeTool');

	$('#brush-settings').addClass('activeTool');
	$('#wheel').insertAfter('#brush-settings h1');
});

$("#eraser").on('click', function() {
	currTool = eraser;
	$('.active').removeClass('active');
	$(this).addClass('active');

	$('.activeTool').removeClass('activeTool');

	$('#eraser-settings').addClass('activeTool');
});

$("#text").on('click', function() {
	currTool = text;
	$('.active').removeClass('active');
	$(this).addClass('active');

	$('.activeTool').removeClass('activeTool');

	$('#text-settings').addClass('activeTool');
	$('#wheel').insertAfter('#text-settings h1');
});

$('#undo').on('click', function(e) {
	undo();
});
$('#redo').on('click', function(e) {
	redo();
});

var colorWheel = new ColorWheel('wheel', 300);

$('#wheel').insertAfter('#brush-settings h1');

$('#wheel').on('mouseup', function() {
	currTool.color = "#"+colorWheel.getHex();
});

//TODO: combine these 2 functions?
function initSize(id) {
    var id2 = id + "-value"
    $(id).on('input', function () {
	   $(id2).val($(this).val());
	   currTool.size = $(this).val();
    });

    $(id2).on('input', function () {
	   $(id).val($(this).val());
	   currTool.size = $(this).val();
    });
}

function initOpacity(id) {
    var id2 = id + "-value"
    $(id).on('input', function () {
	   $(id2).val($(this).val());
	   currTool.opacity = ($(this).val() / 100);
    });

    $(id2).on('input', function () {
	   $(id).val($(this).val());
	   currTool.opacity = ($(this).val() / 100);
    });
}

initSize('#brush-size');
initSize('#eraser-size');
initOpacity('#brush-opacity');
initOpacity('#eraser-opacity');