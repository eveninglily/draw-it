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

$("#eyedropper").on('click', function(e) {
    currTool = eyedropper;
    $('.active').removeClass('active');
	$(this).addClass('active');

	$('.activeTool').removeClass('activeTool');
});

$("#color1").on('click', function() {
	$('.active').removeClass('active');
	$(this).addClass('active');

	$('.activeTool').removeClass('activeTool');

	$('#color-settings').addClass('activeTool');
	$('#wheel').insertAfter('#color-settings h1');
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

$('#wheel').insertAfter('#brush-settings h1');

$('#wheel').on('mouseup', function() {
	currTool.color = "#"+colorWheel.getHex();
    $("#color1").css({background: currTool.color});
});

$('#savePalette').on('click', savePalette);

function savePalette() {
    var data = {};
    $('.color').each(function(i, obj) {
        //Turns out, the ctx treats color as hex, so setting the style to the rgb() we get converts it
        var rgb = $(obj).css('background-color');
        layers[currentLayer].ctx.strokeStyle = rgb;
        data[i] = layers[currentLayer].ctx.strokeStyle;
    });

    var blob = new Blob([JSON.stringify(data)], {type:"application/json"});

    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download = "palette.json";
    a.href = url;
    a.click();
}

$('#loadPalette').on('change', loadPalette);

function loadPalette() {
    if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('Sorry, your browser can\'t read this file');
        return;
    }

    var file = $('#loadPalette').get(0).files[0];
    var reader = new FileReader();
    reader.onload = function() {
        var json = JSON.parse(reader.result);
        console.log(json);
        for(var key in json) {
            addPaletteItem(json[key]);
        }
    }
    reader.readAsText(file);
}

function addPaletteItem(color) {
    $('<div>')
        .addClass('color')
        .css({background: color})
        .appendTo('#color-palette')
        .on('click', function(e) {
            var rgb = color;
            currTool.color = rgb;
        });
}

$('#addToPalette').on('click', function(e) {
    addPaletteItem(currTool.color);
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