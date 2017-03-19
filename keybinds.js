"use strict"

var bindings;

class KeyBinding {
    constructor(name, key, shift, alt, ctrl, onPress) {
        this.name = name;
        this.onPress = onPress;

        if (localStorage.getItem(name) == null) {
            this.key = key;
            this.shift = shift;
            this.alt = alt;
            this.ctrl = ctrl;
            localStorage.setItem(name, JSON.stringify(this));
        } else {
            var obj = JSON.parse(localStorage.getItem(name));
            this.key = obj.key;
            this.shift = obj.shift;
            this.alt = obj.alt;
            this.ctrl = obj.ctrl;
        }
    }

    call(evt) {
        this.onPress(evt);
    }
}

function getDefaultBindings() {
    return [
        new KeyBinding('undo', 90, false, false, true, function () {
            undo(client.clientId);
            if(client.connected) {
                client.sendUndo();
            }
        }),
        new KeyBinding('redo', 89, false, false, true, function () {
            redo(client.clientId);
            if(client.connected) {
                client.sendRedo();
            }
        }),
        new KeyBinding('input', 13, false, false, false, function () {
            $('input').trigger('blur');
        }),
        new KeyBinding('brush', 90, false, false, false, function () {
            $('#brush').click();
        }),
        new KeyBinding('eraser', 88, false, false, false, function () {
            $('#eraser').click();
        }),
        new KeyBinding('eyedropper', 66, false, false, false, function () {
            $('#eyedropper').click();
        }),
        new KeyBinding('text', 84, false, false, false, function () {
            $('#text').click();
        }),
        new KeyBinding('fullscreen', 27, false, false, false, function () {
            fullscreen();
        })
    ];
}

$(document).keydown(evt => {
    if (down) return;

    for (var i = 0; i < bindings.length; i++) {
        var keybind = bindings[i];
        if ((evt.which == keybind.key)
         && (evt.shiftKey == keybind.shift)
         && (evt.ctrlKey == keybind.ctrl)
         && (evt.altKey == keybind.alt)) {
            keybind.call(evt);
        }
    }
});

function loadBindingsFile(json) {
    for(var key in json) {
        for (var i = 0; i < bindings.length; i++) {
            if (key == bindings[i].name) {
                bindings[i].key = json[key].key
                bindings[i].ctrl = json[key].ctrl;
                bindings[i].shift = json[key].shift;
                bindings[i].alt = json[key].alt;
            }
        }
    }
}

function resetBindings() {
    bindings = getDefaultBindings();
    settings["keybinds"] = {};
}

$(document).ready(() => {
    bindings = getDefaultBindings();
    $('#setting-keybinds').on('change', () => {
        loadJSONFile($('#setting-keybinds').get(0).files[0], loadBindingsFile);
    });

    if(localStorage.getItem('settings')) {
        var s = JSON.parse(localStorage.getItem('settings'));
        if(s["keybinds"] != {}) {
            loadBindingsFile(s["keybinds"]);
        }
    }
});