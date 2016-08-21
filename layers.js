var nLayer = 0;

/**
 * Wrapper for DrawingCanvas that also holds metadata
 * TODO: Document more
 */
class Layer {
    constructor(id) {
        this.isLocked = false; //Unused for now
        this.isVisible = true;

        this.opacity = 1.0;
        this.name = "";

        this.id = id;
        this.ids = [this.id]; //For multiple ID's from merging

        this.activeStrokes = [];

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

        var nRow = $('<tr>')
                            .append($('<td>').attr({'class':'layer-actions'}))
                            .append($('<td>').attr({'class':'layer-preview'}).append($('<img>')))
                            .append($('<td>').attr({'class':'layer-info'}));

        nRow.attr({
            'id': this.id + '-control',
        });

        nRow.children('.layer-actions').append(
            $('<img>').attr({'src':'img/icons/layervisible.png'}).on('click', function() {
                var can = layers[currentLayer].canvas.canvas;
                _this.isVisible = !_this.isVisible;
                $(can).toggle();
                if (_this.isVisible) {
                    $(this).attr('src', 'img/icons/layervisible.png');
                } else {
                    $(this).attr('src', 'img/icons/layerhidden.png');
                };
            }));

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
        });

        $('#layer-list').prepend(nRow);
        detectLongClick('#' + this.id + '-control');
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
        data.data = this.canvas.canvas.toDataURL();

        return data;
    }

    static fromJSON(json) {
        addLayer(json.id);
        var layer = layers[layers.length - 1];
        layer.canvas.loadDataURL(json.data);
    }
}

/**
 * Creates a new layer with the given ID
 */
function addLayer(id) {
    var n = new Layer(id);
    layers.push(n);
    nLayer++;
    console.log(n);
}

/**
 * Removes the nth layer in the layers array
 */
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

$(document).ready(function(){
    allowReorder('#layer-list', '.selected', function(){
        layers.splice(currentLayer + 1, 0, layers.splice(currentLayer, 1)[0]);
        $('#' + layers[currentLayer].id).css('z-index', currentLayer);
        currentLayer++;
        $('#' + layers[currentLayer].id).css('z-index', currentLayer);
    }, function(){
        layers.splice(currentLayer - 1, 0, layers.splice(currentLayer, 1)[0]);
        $('#' + layers[currentLayer].id).css('z-index', currentLayer);
        currentLayer--;
        $('#' + layers[currentLayer].id).css('z-index', currentLayer);
    });

    $('#layer-add').on('click', function() {
        if(client.inRoom) {
            client.sendAddLayer('layer' + nLayer);
        }
        addLayer('layer' + nLayer);
        setTimeout(function(){
            var n = layers[layers.length - 1];
            $('#' + n.id + '-control').trigger('mousedown'); //TODO: this is hacky. Fix?
            $('#' + n.id + '-control').trigger('mouseup');
        }, 0);
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
});