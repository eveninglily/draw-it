var nLayer = 0;

/**
 * Wrapper for DrawingCanvas that also holds metadata
 * TODO: Document more
 */
class Layer {
    constructor(id) {
        /** TODO: Unused */
        this.isLocked = false;
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

        this.canvas = new OICanvas(newCan.get(0), id);

        $('#layers').prepend(newCan);

        var nRow = $('<tr>')
                            .append($('<td>').attr({'class':'layer-actions'}))
                            .append($('<td>').attr({'class':'layer-preview'}).append($('<img>')))
                            .append($('<td>').attr({'class':'layer-info'}));

        nRow.attr({
            'id': this.id + '-control',
        });

        nRow.children('.layer-actions').append(
            $('<span>').addClass('icon-visible-layer').on('click', function() {
                var can = layers[currentLayer].canvas.canvas;
                _this.isVisible = !_this.isVisible;
                $(can).toggle();
                //$(this).toggle();
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
        }).on('contextmenu', evt => {
            $("<div>").addClass('contextmenu').css({
                left: evt.pageX,
                top: evt.pageY
            }).append(
                $('<div>').addClass('context-item').html('Merge Up').on('click', () => {
                    console.log(layers.length - nRow.index() - 1)
                    mergeUp(layers.length - nRow.index() - 1);
                    $('.contextmenu').remove();
                })
            ).append(
                $('<div>').addClass('context-item').html('Merge Down').on('click', () => {
                    console.log(layers.length - nRow.index() - 1)
                    mergeDown(layers.length - nRow.index() - 1);
                    $('.contextmenu').remove();
                })
            ).append(
                $('<div>').addClass('context-item').html('Duplicate').on('click', () => {
                    duplicate(layers.length - nRow.index() - 1);
                    $('.contextmenu').remove();
                })
            ).appendTo('body');
            return false;
        });

        $('#layer-list').prepend(nRow);
        //TODO: Deprecated; Remove if no issues arise
        //detectLongClick('#' + this.id + '-control');
        this.updatePreview();
    }

    updatePreview() {
        $('#' + this.id + '-control' + ' .layer-preview').html(this.canvas.toImage());
    }

    select() {
        clearDraggable('.layer-list', '.selected');
        $('.selected').removeClass('selected');

        $('#' + this.id + '-control').addClass('selected');
        initDrag();

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

    stroke() {
        if(!this.isLocked) {
            this.canvas.doStrokes(this.activeStrokes);
        }
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
        }
    }
    layers.splice(pos, 1);
}

function mergeUp(pos) {
    if(!(pos == layers.length - 1)) {
        layers[pos + 1].canvas.ctx.save();
        layers[pos + 1].canvas.ctx.globalAlpha = layers[pos].opacity;
        layers[pos + 1].canvas.drawCanvas(layers[pos].canvas.canvas);
        layers[pos + 1].canvas.drawCanvasOntoBuffer(layers[pos].canvas.canvas);
        for(var i = 0; i < layers[pos].ids.length; i++) {
            layers[pos + 1].ids.push(layers[pos].ids[i]);
        }
        layers[pos + 1].canvas.ctx.restore();
        removeLayer(pos);
        layers[pos].select();
        layers[pos].updatePreview();
    }
}

function mergeDown(pos) {
    if((pos != 0)) {
        layers[pos - 1].canvas.ctx.save();
        layers[pos - 1].canvas.ctx.globalAlpha = layers[pos].opacity;
        layers[pos - 1].canvas.drawCanvas(layers[pos].canvas.canvas);
        layers[pos - 1].canvas.drawCanvasOntoBuffer(layers[pos].canvas.canvas);
        for(var i = 0; i < layers[pos].ids.length; i++) {
            layers[pos - 1].ids.push(layers[pos].ids[i]);
        }
        layers[pos - 1].canvas.ctx.restore();
        removeLayer(pos);
        pos--;
        currentLayer--;
        if(pos < 0) {
            pos = 0;
        }
        layers[pos].select();
        layers[pos].updatePreview();
    }
}

/** TODO: Unimplemented */
function duplicate(pos) {
    //layers.splice(pos, 0, layers[pos].)
}

function initDrag() {
    setDraggable('#layer-list', '.selected', function(){
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
}

$(document).ready(function(){
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
        initDrag();
    });

    $('#layer-remove').on('click', function() {
        if(confirm('Delete current layer?')) {
            if(layers.length > 1) {
                removeLayer(currentLayer);
                if(currentLayer >= layers.length) {
                    currentLayer--;
                }
                layers[currentLayer].select();
            }
        }
    });

    $('#layer-clear').on('click', function() {
        if(confirm('Clear current layer?')) {
            layers[currentLayer].canvas.clear();
            layers[currentLayer].canvas.clearBuffer();
            layers[currentLayer].updatePreview();
            addClear(client.clientId);
        }
    });

    $('#layer-save').on('click', function() {
        layers[currentLayer].canvas.toFile();
    });

    $('#layer-opacity').on('input', function () {
        $('#layer-opacity-value').html($(this).val() + "%");
        $('.selected .layer-opacity').html($(this).val() + "%");
        layers[currentLayer].opacity = $(this).val() / 100;
        $('#' + layers[currentLayer].id).css('opacity', $(this).val() / 100);

        //TODO: This is kinda hacky
        if(currTool.name == "Eyedropper") {
            var merged = getMergedVisibleCanvas(true).attr({'class':'layer','id':'mergedLayer'}).css({'opacity': 0});
            $('#mergedLayer').remove();
            $('#layers').append(merged);
        }
    });
});