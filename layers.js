var nLayer = 1;
var longClick = false;

function addLayer(id, width, height) {
	$('.selected').removeClass('selected');
	var newCan = $('<canvas>').attr({
		'class' : 'layer',
		'id'    : 'layer' + id,
		'width' : width,
		'height': height,
	}).css(
		'z-index', layers.length
	);

	$('#layers').prepend(newCan);

	var newLayer = new DrawingCanvas(newCan.get(0))

	var row = $('#layer-list tbody').children(':nth-child(1)').clone();

	row.attr({
		'id': 'layer' + id + '-control',
		'class': 'selected'
	});
	row.children(':nth-child(2)')
			.html("Layer " + layers.length)
			.on('dblclick', function() {
				if ($('#newName').length != 0) {
					return;
				}
				var input = $('<input/>').attr({
					type: 'text',
					id: 'newName',
					value: $(this).html()
				}).on('blur', function () {
					if ($('#newName').val() != '') {
						$(this).parent().html($('#newName').val());
					}
				}).on('keypress', function (e) {
					if(e.which == 13) {
						if ($('#newName').val() != '') {
							$(this).parent().html($('#newName').val());
						}
					}
				});
				$(this).html(input);
				input.focus();
			});

	row.children(':nth-child(1)').html(newLayer.toImage());

	row.on('mousedown', function() {
		$('.selected').removeClass('selected');
		currentLayer = layers.length - 1 - $(this).index();
		selectLayer();

		document.getSelection().removeAllRanges();

		row.data("longClick", setTimeout(function(){
			longClick = true;
		},200));
	})

	$(document).on('mouseup', function() {
		clearTimeout(row.data("longClick"));
		longClick = false;
	});

	if(row.hasClass('hidden')) {
		row.removeClass('hidden');
	}
	$('#layer-list tbody').prepend(row);

	layers.push(newLayer);

	row.trigger('mousedown');
	row.trigger('mouseup');
}

function removeLayer(pos) {
	var id = $('.selected').attr('id').replace('layer','').replace('-control','');//TODO: Rewrite. This sucks
	$('#layer' + id).remove();
	$('#layer' + id + '-control').remove();
	layers.splice(pos, 1);
}

function selectLayer() {
	$('#layer-list tbody')
		.children(':nth-child('+ (layers.length - currentLayer)+')')
		.addClass('selected');
	if ($(layers[currentLayer].canvas).is(':visible')) {
		$('#layer-visible').html('<img src="img/icons/layervisible.png" />');
    } else {
    	$('#layer-visible').html('<img src="img/icons/layerhidden.png" />');
    };

	var opacity = Math.round($(layers[currentLayer].canvas).css('opacity') * 100);
    $('.selected .layer-opacity').html(opacity + "%");
    $('#layer-opacity-value').html(opacity + "%");
	$('#layer-opacity').val(opacity);
}

$('#layer-list').on('mousemove', function(e) {
	if(longClick) {
		var r = $('.selected');
		e.preventDefault();
		document.getSelection().removeAllRanges();
		var y = e.pageY - $('#layer-list').offset().top;
		if(!(r.index() == 0)) {
			var prev = r.prev();
			if(y < (prev.position().top - (prev.height()))) {
				r.insertBefore(prev);
				layers.splice(currentLayer + 1, 0, layers.splice(currentLayer, 1)[0]);
				$(layers[currentLayer].canvas).css('z-index', currentLayer);
				currentLayer++;
			}
		}

		if(!(r.index() == layers.length - 1)) {
			var next = r.next();
			if(y > (next.position().top - (next.height()))) {
				r.insertAfter(next);
				layers.splice(currentLayer - 1, 0, layers.splice(currentLayer, 1)[0]);
				$(layers[currentLayer].canvas).css('z-index', currentLayer);
				currentLayer--;
			}
		}
		$(layers[currentLayer].canvas).css('z-index', currentLayer);
	}
});

$('#layer-add').on('click', function() {
	addLayer(nLayer, 750, 750);
	nLayer++;
	selectLayer();
});

$('#layer-remove').on('click', function() {
	if(layers.length > 1) {
		removeLayer(currentLayer);
		if(currentLayer >= layers.length) {
			currentLayer--;
		}
		selectLayer();
	}
});

$('#layer-clear').on('click', function() {
	if(confirm('Clear current layer?'))
		layers[currentLayer].clear();
		layers[currentLayer].backCanvas.getContext('2d').clearRect(0, 0, 750, 750);
		$('.selected').children(':nth-child(1)').html(layers[currentLayer].toImage());
});

$('#layer-save').on('click', function() {
	layers[currentLayer].toFile();
});

$('#layer-visible').on('click', function() {
	var can = layers[currentLayer].canvas;
	$(can).toggle();
	$('.selected').toggleClass('hidden');

    if ($(can).is(':visible')) {
		$(this).html('<img src="img/icons/layervisible.png" />');
    } else {
    	$(this).html('<img src="img/icons/layerhidden.png" />');
    };
});

$('#layer-mergeup').on('click', function() {
	if(!(currentLayer == layers.length - 1)) {
		layers[currentLayer + 1].drawCanvas(layers[currentLayer].canvas);
		layers[currentLayer + 1].backCanvas.getContext('2d').drawImage(layers[currentLayer].canvas, 0, 0);
		removeLayer(currentLayer);
		selectLayer();
	}
});

$('#layer-mergedown').on('click', function() {
	if((currentLayer != 0)) {
		layers[currentLayer - 1].drawCanvas(layers[currentLayer].canvas);
		layers[currentLayer - 1].backCanvas.getContext('2d').drawImage(layers[currentLayer].canvas, 0, 0);
		removeLayer(currentLayer);
		currentLayer--;
		selectLayer();
	}
});

$('#layer-opacity').on('input', function () {
        $('#layer-opacity-value').html($(this).val() + "%");
		$('.selected .layer-opacity').html($(this).val() + "%");
        $(layers[currentLayer].canvas).css('opacity', $(this).val() / 100);
		//$(layers[currentLayer].backCanvas).css('opacity', $(this).val() / 100);
});

$(document).ready(function() {
	$('#layer0-control').on('mousedown', function() {
		$('.selected').removeClass('selected');
		currentLayer = layers.length - 1 - $(this).index();
		selectLayer();

		$(this).data("longClick", setTimeout(function(){
			longClick = true;
		},200));
	});

	$('#layer0-control').children(':nth-child(2)').on('dblclick', function() {
		if ($('#newName').length != 0) {
			return;
		}
		var input = $('<input/>').attr({
			type: 'text',
			id: 'newName',
			value: $(this).html()
		}).on('blur', function () {
			if ($('#newName').val() != '') {
				$(this).parent().html($('#newName').val());
			}
		}).on('keypress', function (e) {
			if(e.which == 13) {
				if ($('#newName').val() != '') {
					$(this).parent().html($('#newName').val());
				}
			}
		});
		$(this).html(input);
		input.focus();
	});

	$('#layer0-control').children(':nth-child(1)').html(layers[0].toImage());
})