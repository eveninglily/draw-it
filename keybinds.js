"use strict"

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

var bindings = [
    new KeyBinding('undo', 90, false, false, true, function () {
        undo();
    }),
    new KeyBinding('redo', 89, false, false, true, function () {
        redo();
    })
];

$(document).keydown(function (evt) {
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

/*
var bindings = [
    new KeyBinding('switchColor', 88, false, false, false, function () {
        var temp = color1;
        color1 = color2;
        color2 = temp;
        color = color1;
        $('#color1').css({ 'background': color });
        $('#color2').css({ 'background': color2 });
    }),
    new KeyBinding('finishLayerRename', 13, false, false, false, function () {
        $('#newName').trigger('blur');
    }),
    new KeyBinding('sizeUp', 187, false, false, false, function () {
        currTool.radius++;
    }),
    new KeyBinding('sizeDown', 189, false, false, false, function () {
        if (currTool.radius > 1) {
            currTool.radius--;
        }
    }),
    new KeyBinding('opacityUp', 187, true, false, false, function () {
        if (currTool.opacity < 1.0) {
            currTool.opacity += 0.01;
        }
        $(mouseLayer).css('opacity', currTool.opacity);
        var o = Math.round(currTool.opacity * 100);
        $('#brush-opacity-value').html(o);
        $('#brush-opacity').val(o);
    }),
    new KeyBinding('opacityDown', 189, true, false, false, function () {
        if (currTool.opacity > 0) {
            currTool.opacity -= 0.01;
        }
        $(mouseLayer).css('opacity', currTool.opacity);
        var o = Math.round(currTool.opacity * 100);
        $('#brush-opacity-value').html(o);
        $('#brush-opacity').val(o);

    }),
    new KeyBinding('save', 83, false, false, true, function (evt) {
        evt.preventDefault();
        saveCanvasToImage(merge($('#background').get(0), layers));
        clearCanvas($('#background').get(0));
    })
];

$('#Keybinds input').on('keyup', function (evt) {
    if (!(evt.which == 16 || evt.which == 17 || evt.which == 18)) {
        var name = this.id.replace('keybind-', '');
        for (var i = 0; i < bindings.length; i++) {
            if (name == bindings[i].name) {
                bindings[i].key = evt.which;
                bindings[i].ctrl = evt.ctrlKey;
                bindings[i].shift = evt.shiftKey;
                bindings[i].alt = evt.altKey;
            }
        }
    }
});*/