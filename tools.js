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

//TODO: Write common function?
$('#brush-opacity').on('input', function () {
	$('#brush-opacity-value').val($(this).val());
	currTool.opacity = ($(this).val() / 100);
});

$('#brush-opacity-value').on('input', function () {
	$('#brush-opacity').val($(this).val());
	currTool.opacity = ($(this).val() / 100);
});

$('#brush-size').on('input', function () {
	$('#brush-size-value').val($(this).val());
	currTool.size = $(this).val();
});

$('#brush-size-value').on('input', function () {
	$('#brush-size').val($(this).val());
	currTool.size = $(this).val();
});

$('#eraser-size').on('input', function () {
	$('#eraser-size-value').val($(this).val());
	currTool.size = $(this).val();
});

$('#eraser-size-value').on('input', function () {
	$('#eraser-size').val($(this).val());
	currTool.size = $(this).val();
});