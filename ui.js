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

//TODO: Extend extend functionality to move left and right
function allowReorder(container, selector, upCallback, downCallback) {
    $(container).on('mousemove', function(evt) {
        if($(selector).data('dragging')) {
            var r = $(selector);
            evt.preventDefault();
            document.getSelection().removeAllRanges();
            var y = evt.pageY;
            if(!(r.index() == 0)) {
                var prev = r.prev();
                if(y < (prev.offset().top + (prev.height() / 2))) {
                    r.insertBefore(prev);
                    upCallback();
                }
            }

            if(!(r.index() == layers.length - 1)) {
                var next = r.next();
                if(y > (next.offset().top + (next.height() / 2))) {
                    r.insertAfter(next);
                    downCallback();
                }
            }
        }
    });
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
            if(settings[key] == true) {
                $('#setting-' + key).prop('checked', true);
            }
        }
    }

    $('#settings').on('click', function() {
        $('#dialog-settings').show().css('display','flex');
        $('#modal-bg').show().css('display','flex');
    });

    $('.settings-item').on('change', function() {
        var data = $(this).attr('data-val');
        settings[data] = $(this).is(':checked');
        localStorage.setItem('settings', JSON.stringify(settings));
    });

    $('#invite').on('click', function() {
        $('#dialog-invite').show().css('display','flex');
        $('#modal-bg').show().css('display','flex');
        if(client.inRoom) {
            $('#room-create').hide();
            $('#room-manage').show();
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