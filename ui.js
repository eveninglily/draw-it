class SliderVar {
    constructor(id) {
        this.id = id;
        this.value = $('#' + id).val();
        var _t = this;

        $('#' + id).on('input', function () {
            $('#' + id + '-value').val($(this).val());
            _t.value = $(this).val();
        });

        $('#' + id + '-value').on('input', function () {
            $('#' + id).val($(this).val());
            _t.value = $(this).val();
        });
    }
}

function detectLongClick(selector) {
    var element = $(selector);
    element.on('mousedown', function(){
        element.data("longClick", setTimeout(function(){
            element.data('dragging', true);
        },200));
    });

    $(document).on('mouseup', function() {
        clearTimeout(element.data("longClick"));
        element.data('dragging', false);
    });
}

var drag = false;

$('.layer-list tr').attr('draggable', "true");

//TODO: Extend functionality to left and right
function setDraggable(parent, child, onDragUp, onDragDown) {
    function dragCancel(evt) {
        if (evt.preventDefault) {
            evt.preventDefault();
        }
        return false;
    }

    $(child).attr('draggable', 'true');
    $(child).on('dragstart', evt => {
        evt.originalEvent.dataTransfer.effectAllowed = 'move';
        evt.originalEvent.dataTransfer.setData('text/plain', evt.target.id);
        drag = true;
        $(child).css('opacity', .4)
    });

    $(parent).on('dragover', dragCancel);
    $(parent).on('dragenter', dragCancel);

    $(parent).on('drop', evt => {
        evt.preventDefault();
        if(!drag) { return; }
        $(child).css('opacity', 1)
        var data = evt.originalEvent.dataTransfer.getData("text");
        // Clear the drag data cache (for all formats/types)
        //evt.originalEvent.dataTransfer.clearData();

        var r = $(child);
        var y = evt.pageY;
        if(!(r.index() == 0)) {
            var prev = r.prev();
            if(y < (prev.offset().top + (prev.height() / 2))) {
                r.insertBefore(prev);
                    onDragUp();
                }
            }

        if(!(r.index() == layers.length - 1)) {
            var next = r.next();
            if(y > (next.offset().top + (next.height() / 2))) {
                r.insertAfter(next);
                onDragDown();
            }
        }
    });
}

function clearDraggable(parent, child) {
    $(child).attr('draggable', 'false');
    $(child).off('dragstart');
    $(parent).off('dragover');
    $(parent).off('dragenter');
    $(parent).off('drop');
}

//TODO: All jQuery events in this file should be here
$(document).ready(function() {

    /* Modals
    **********/
    $('#modal-bg').on('click', function(evt) {
        if(evt.target.id == 'modal-bg') {
            hideModals()
        }
    }).hide();
    $('.cancel').on('click', hideModals);

    /* Settings
    ************/
    if(localStorage.getItem('settings')) {
        settings = JSON.parse(localStorage.getItem('settings'));
        for(var key in settings) {
            if(!settings.hasOwnProperty(key)) {
                continue;
            }
            if($('#setting-' + key).is(':checkbox')) {
                if(settings[key] == true) {
                    $('#setting-' + key).prop('checked', true);
                }
            } else if ($('#setting-' + key).is(':file')) {
            } else if($('#setting-' + key).is('[type="text"]')) {
                $('#setting-' + key).val(settings[key]);
                client.clientName = settings[key];
            }
        }
    }

    $('#settings').on('click', function() {
        $('#dialog-settings').show().css('display','flex');
        $('#modal-bg').show().css('display','flex');
    });

    $('.settings-item').on('change', function() {
        var data = $(this).attr('data-val');
        if($(this).is(':checkbox')) {
            settings[data] = $(this).is(':checked');
        } else if($(this).is(':file')) {
            loadJSONFile($('#setting-keybinds').get(0).files[0], json => {
                settings[data] = json;
            });
        } else if($(this).is('[type="text"]')) {
            settings[data] = $(this).val();
            client.clientName = $(this).val();
            client.sendUpdateName();
        }
        localStorage.setItem('settings', JSON.stringify(settings));
    });

    $('#invite').on('click', function() {
        $('#dialog-invite').show().css('display','flex');
        $('#modal-bg').show().css('display','flex');
        if(client.inRoom) {
            $('#room-create').hide();
            $('#room-manage').show();localStorage
        } else {
            $('#room-manage').hide();
        }
    });

    $('#create-room').on('click', function() {
        if(!client.connected) {
            client.connect();
        }
        client.joinRoom('');
        $('#modal-bg').hide();
        $('#dialog-invite').hide();

        $('#edit-room-name').val($('#new-room-name').val());
    });

    $('#new-room-name').on('keydown', evt => {
        if(evt.which == 13) {
            $('#create-room').click();
        }
    });

    $('#fileName').on('input', () => {
        var name = $('#fileName').val();

        if(name.length == 0) {
            name = "amidraw";
        }
        $('#dl-link').attr('download', name + '.' + $('#fileType').val());
    });

    $(document).on('mousedown', evt => {
        if(!(evt.target.className == "context-item")) {
            $('.contextmenu').remove();
        }
    });

    $('#dl-link').on('click', function() {
        if($('#upload').is(':checked')) {
            client.save();
        } else {
            hideModals();
        }
    });
});

function hideModals() {
    $('#modal-bg').hide();
    $('.modal').hide();
    clearInterval($('#gallery-error').data('interval'));
    clearInterval($('.connection-status').data('interval'));
}

$("#save").on('click', function(e) {
    $('#dialog-save').show().css('display','flex');;
    $('#modal-bg').show().css('display','flex');
    $('#dl-link').attr('href', saveToPNG())

    $('#gallery-error').data('interval', setInterval(checkGalleryConnection, 500));
});

/**
 * Checks the connection to the server, shows an error if not connected
 */
function checkGalleryConnection() {
    if(client.connected) {
        $('#gallery-error').hide();
        $('#upload').prop('disabled', false);
    } else {
        $('#gallery-error').show();
        $('#upload').prop('disabled', true);
        $('#upload').prop('checked', false);
    }
}

$('#fileType').on('change', function() {
    var name = $('#fileName').val();
    if(name.length == 0) {
        name = "amidraw";
    }
    $('#dl-link').attr('download', name + '.' + $('#fileType').val());
    if($('fileType').val() == 'png') {
        $('#dl-link').attr('href', saveToPNG());
    } else {
        $('#dl-link').attr('href', saveLayersToJSON());
    }
});