var nLayer = 0;
var longClick = false;

//Wrapper for DrawingCanvas that also holds metadata
class Layer {
	constructor() {
		this.isLocked = false; //Unused for now
		this.isVisible = true;

		this.opacity = 1.0;
		this.name = "";

		this.id = 'layer' + nLayer;
		this.ids = [this.id]; //For multiple ID's from merging

		var _this = this;

		var newCan = $('<canvas>').attr({
			'class' : 'layer',
			'id'    : this.id,
			'width' : width,
			'height': height,
		}).css(
			'z-index', nLayer
		);

		this.canvas = new DrawingCanvas(newCan.get(0));

		$('#layers').prepend(newCan);

		var nRow = $('<tr>').append($('<td>').attr({'class':'layer-preview'}).append($('<img>'))).append($('<td>').attr({'class':'layer-info'}))

		nRow.attr({
			'id': this.id + '-control',
			'class': 'selected'
		});

		nRow.children('.layer-info').append($('<div>').attr({'class':'layer-name'}))
									.append($('<div>').attr({'class':'layer-opacity'}).html('100%'))

		nRow.children('.layer-info').children('.layer-name')
				.html("Layer " + nLayer)
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

		nRow.on('mousedown', function() {
			currentLayer = layers.length - 1 - $(this).index();
			_this.select();

			document.getSelection().removeAllRanges();

			nRow.data("longClick", setTimeout(function(){
				longClick = true;
			},200));
		})

		$(document).on('mouseup', function() {
			clearTimeout(nRow.data("longClick"));
			longClick = false;
		});

		$('#layer-list').prepend(nRow);

		this.updatePreview();
	}

	updatePreview() {
		$('#' + this.id + '-control' + ' .layer-preview').html(this.canvas.toImage());
	}

	select() {
		$('.selected').removeClass('selected');
		$('#' + this.id + '-control').addClass('selected');
		if (this.isVisible) {
			$('#layer-visible').html('<img src="img/icons/layervisible.png" />');
		} else {
			$('#layer-visible').html('<img src="img/icons/layerhidden.png" />');
		};

		var opacity = Math.round($('#' + this.id).css('opacity') * 100);
		$('.selected .layer-opacity').html(opacity + "%");
		$('#layer-opacity-value').html(opacity + "%");
		$('#layer-opacity').val(opacity);
	}

	toJSON() {
		var data = {};
		data.id = this.id;
		data.ids = this.ids;
		data.isVisible = this.isVisible;
		data.isLocked = this.isLocked;
		data.opacity = this.opacity;
		data.strokes = this.canvas.strokes;
		data.imageData = this.canvas.canvas.toDataURL();

		return data;
	}

	static fromJSON() {

	}
}

function removeLayer(pos) {
	var nId = layers[pos].id;

	$('#' + nId).remove();
	$('#' + nId + '-control').remove();
	var r = 0;
	for(var i = changes.length - 1; i > 0; i--) {
		if(changes[i].layer == nId) {
			changes.splice(i, 1);
			if(changes.length - 1 - i < currentChange)
				r++;
		}
	}
	currentChange -= r;
	layers.splice(pos, 1);
}

$('#layer-list').on('mousemove', function(e) {
	if(longClick) {
		var r = $('.selected');
		e.preventDefault();
		document.getSelection().removeAllRanges();
		var y = e.pageY;
		if(!(r.index() == 0)) {
			var prev = r.prev();
			if(y < (prev.position().top + (prev.height() / 2))) {
				r.insertBefore(prev);
				layers.splice(currentLayer + 1, 0, layers.splice(currentLayer, 1)[0]);
				$(layers[currentLayer].id).css('z-index', currentLayer);
				currentLayer++;
			}
		}

		if(!(r.index() == layers.length - 1)) {
			var next = r.next();
			if(y > (next.position().top + (next.height() / 2))) {
				r.insertAfter(next);
				layers.splice(currentLayer - 1, 0, layers.splice(currentLayer, 1)[0]);
				$('#' + layers[currentLayer].id).css('z-index', currentLayer);
				currentLayer--;
			}
		}
		$('#' + layers[currentLayer].id).css('z-index', currentLayer);
	}
});

$('#layer-add').on('click', function() {
	nLayer++;
	var n = new Layer();
	layers.push(n);

	$('#' + n.id + '-control').trigger('mousedown');
	$('#' + n.id + '-control').trigger('mouseup');
});

$('#layer-remove').on('click', function() {
	if(layers.length > 1) {
		removeLayer(currentLayer);
		if(currentLayer >= layers.length) {
			currentLayer--;
		}
		layers[currentLayer].select();
	}
});

$('#layer-clear').on('click', function() {
	if(confirm('Clear current layer?'))
		layers[currentLayer].canvas.clear();
		layers[currentLayer].canvas.clearBuffer();
		layers[currentLayer].updatePreview();
});

$('#layer-save').on('click', function() {
	layers[currentLayer].canvas.toFile();
});

$('#layer-visible').on('click', function() {
	var can = layers[currentLayer].canvas.canvas;
	layers[currentLayer].isVisible = !layers[currentLayer].isVisible; //Todo: Improve this line
	$(can).toggle();
	$('.selected').toggleClass('hidden');

    if (layers[currentLayer].isVisible) {
		$(this).html('<img src="img/icons/layervisible.png" />');
    } else {
    	$(this).html('<img src="img/icons/layerhidden.png" />');
    };
});

$('#layer-mergeup').on('click', function() {
	if(!(currentLayer == layers.length - 1)) {
		layers[currentLayer + 1].canvas.drawCanvas(layers[currentLayer].canvas.canvas);
		layers[currentLayer + 1].canvas.drawCanvasOntoBuffer(layers[currentLayer].canvas.canvas);
		for(var i = 0; i < layers[currentLayer].ids.length; i++) {
			layers[currentLayer + 1].ids.push(layers[currentLayer].ids[i]);
		}
		removeLayer(currentLayer);
		layers[currentLayer].select();
		layers[currentLayer].updatePreview();
	}
});

$('#layer-mergedown').on('click', function() {
	if((currentLayer != 0)) {
		layers[currentLayer - 1].canvas.drawCanvas(layers[currentLayer].canvas.canvas);
		layers[currentLayer + 1].canvas.drawCanvasOntoBuffer(layers[currentLayer].canvas.canvas);
		for(var i = 0; i < layers[currentLayer].ids.length; i++) {
			layers[currentLayer - 1].ids.push(layers[currentLayer].ids[i]);
		}
		removeLayer(currentLayer);
		currentLayer--;
		layers[currentLayer].select();
		layers[currentLayer].updatePreview();
	}
});

$('#layer-opacity').on('input', function () {
        $('#layer-opacity-value').html($(this).val() + "%");
		$('.selected .layer-opacity').html($(this).val() + "%");
		layers[currentLayer].opacity = $(this).val() / 100;
        $('#' + layers[currentLayer].id).css('opacity', $(this).val() / 100);
});
