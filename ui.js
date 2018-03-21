/** General UI Code */

var drag = false;

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

        var r = $(child);
        var y = evt.pageY;
        if(!(r.index() == 0)) {
            var prev = r.prev();
            if(y < (prev.offset().top + (prev.height() / 2))) {
                r.insertBefore(prev);
                onDragUp();
            }
        }

        if(!(r.index() == $(parent).children().length - 1)) {
            var next = r.next();
            if(y > (next.offset().top + (next.height() / 2))) {
                r.insertAfter(next);
                onDragDown();
            }
        }
    });
}

/**
 * Clears dragging event handlers
 * @param {*} parent - Container
 * @param {*} child - Element that is dragged
 */
function clearDraggable(parent, child) {
    $(child).attr('draggable', 'false');
    $(child).off('dragstart');
    $(parent).off('dragover');
    $(parent).off('dragenter');
    $(parent).off('drop');
}

function hideModals() {
    $('#modal-bg').hide();
    $('.modal').hide();
}

$(document).ready(function() {
    new Vue({
        el: '#room-manage',
        methods: {
            onInput: function(val) {
                //console.log(val)
            },
            onEnter: function(val) {
                console.log('enter');
                $('#create-room').click();
            },
            togglePrivate: function() {

            }
        },
        data() {
            return {
                'inRoom': false,
                /** TODO: actual do some sort of check here */
                'connected': true
            }
        }
    });

    new Vue({
        'el': '#dialog-save',
        'methods': {
            onInput: function(inp) {
                this.name = inp.length > 0 ? inp : this.name;
            },
            save: function() {
                if(this.type == 'json') {
                    saveBlob(this.name + '.' + this.type, layersJsonToBlob());
                } else {
                    layersToBlob(this.name + '.' + this.type);
                }
            }
        },
        'data' : {
            'name': 'amidraw',
            'type': 'png'
        }
    });

    new Vue({
        'el': '#dialog-settings',
        'methods': {
            onInput: function(inp) {}
        }
    });

    /** Modals */
    /** TODO: Replace with Vial */
    $('#modal-bg').on('click', function(evt) {
        if(evt.target.id == 'modal-bg') {
            hideModals()
        }
    }).hide();
    $('.cancel').on('click', hideModals);

    /** Settings */
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


    /** Saving */
    $("#save").on('click', () => {
        $('#dialog-save').show().css('display','flex');;
        $('#modal-bg').show().css('display','flex');
    });

    /** Online */
    $('#invite').on('click', function() {
        $('#dialog-invite').show().css('display','flex');
        $('#modal-bg').show().css('display','flex');
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

    /** Misc */
    $(document).on('mousedown', evt => {
        if(!(evt.target.className == "context-item")) {
            $('.contextmenu').remove();
        }
    });

    $('.layer-list tr').attr('draggable', "true");
});