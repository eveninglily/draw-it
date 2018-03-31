/** Client-side networking code */
'use strict';
var client;

$(document).ready(function() {
    $('#server-status').hide();
    client = new Client('https://amidraw.com');
    client.connect();
    var l = window.location.href.split('#');
    if(l.length == 2) {
        client.joinRoom(l[1]);
    }
});

class Client {
    constructor(server) {
        this.server = server;

        this.connected = false;
        this.inRoom = false;

        this.down = false;
        this.id = '';

        this.currentUUID;
        this.clientId = 'local';
        this.clientName = 'Anon';

        this.recieving = {};
        this.sending = {};
    }

    /**
     * Connects to the server
     */
    connect() {
        this.socket = io(this.server);

        this.socket.on('connect', () => {
            this.connected = true;
            log('net', 'Client connected')
        }).on('disconnect', () => {
            this.connected = false;
            log('net', 'Client disconnected')
        });

        $(document).on('unload', () => {
            this.socket.emit('disconnect');
        });
    }

    joinRoom(id) {
        log('net', 'Connecting to room ' + id)

        this.socket.emit('join', {
            'id': id,
            'name': $('#room-name').val(),
            'username': this.clientName
        });

        this.socket.on('join', data => this._join(data))
                   .on('s', data => this._recieveStart(data))
                   .on('u', data => this._recieveUpdate(data))
                   .on('e', data => this._recieveEnd(data))
                   .on('nl', data => addLayer(data.id))
                   .on('uj', data => this._recieveUserJoin(data))
                   .on('ul', data => this._recieveUserLeave(data))
                   .on('update-name', data => this._recieveUpdateName(data))
                   .on('undo', data => { console.log("ID:  " + data.cId); undo(data.cId); })
                   .on('redo', data => { console.log(data.cId); redo(data.cId); })
                   .on('board_data', data => this._loadBoard(data));

        /** Send updates every 40ms */
        setInterval(() => {
            for(var key in this.sending) {
                if(!this.sending.hasOwnProperty(key)) {
                    continue;
                }
                if(!this.sending[key].length == 0) {
                    this.socket.emit('u', {
                        cId: key,
                        positions: this.sending[key]
                    });
                    this.sending[key] = [];
                }
            }
        }, 40);
        this._initMouseEvents();
        this._initTouchEvents();
    }

    sendStart(x, y, p) {
        this.currentUUID = getUUID();
        var c = this.currentUUID;
        this.len = 1;
        this.socket.emit('s', {
            cId: c,
            x: x,
            y: y,
            p: p,
            layer: currentLayer,
            tool: currTool
        });
        this.down = true;
        this.sending[c] = [];
    }

    sendMove(x, y, p) {
        if(this.down) {
            this.len += 1;
            this.sending[this.currentUUID].push({'x': x, 'y': y, p: p});
        }
    }

    sendEnd(x, y, p) {
        var uuid = this.currentUUID;
        var len = this.len;
        if(this.down) {
            setTimeout(() => {
                this.socket.emit('e', {
                    cId: uuid,
                    clId: this.clientId,
                    x: x,
                    y: y,
                    p: p,
                    l: len
                });
            }, 45);
            this.down = false;
        }
    }

    sendUndo() {
        this.socket.emit('undo', {
            cId: this.clientId
        });
    }

    sendRedo() {
        this.socket.emit('redo', {
            cId: this.clientId
        });
    }

    sendAddLayer(id) {
        this.socket.emit('nl', {
            'id': id
        });
    }

    sendUpdateName() {
        this.socket.emit('update-name', {
            name: this.clientName
        });
    }

    sendUpdateSettings() {

    }

    _join(data) {
        log('net', 'Connected to server! Room ID: ' + data.id);
        window.location.href = "#" + data.id
        this.id = data.id;
        this.clientId = data.cId;
        log('net', 'Client ID is ' + data.cId);
        $('#server-status').show();
        $('#server-name').text(data.name);
        this.inRoom = true;
        this.socket.emit('init_data');
    }

    _loadBoard(data) {
        /** Create all the layers */
        for(var layer in data.layers) {
            addLayer(layer);
        }

        /** Draw all the strokes */
        for(var key in data.strokes) {
            if(data.strokes.hasOwnProperty(key)) {
                var layer = data.strokes[key].layer;
                var stroke = new OIStroke(data.strokes[key].tool, layers[layer].canvas.partitions);
                stroke.addPoints(data.strokes[key].path);
                layers[layer].canvas.completeStroke(stroke);
            }
        }

        /** Update layer previews */
        for(var i = 0; i < layers.length; i++) {
            layers[i].updatePreview();
        }
    }

    _recieveStart(data) {
        var layer = data.layer;
        layers[layer].canvas.beginStroke(data.tool, data.x, data.y, data.p, data.cId);
        layers[layer].activeStrokes.push(data.cId);
        layers[layer].stroke();
        this.recieving[data.cId] = {'layer': data.layer, 'len': 1};
    }

    _recieveUpdate(data) {
        if(this.recieving[data.cId] != null) {
            var layer = this.recieving[data.cId].layer;
            this.recieving[data.cId].len += data.positions.length;
            layers[layer].canvas.strokes[data.cId].addPoints(data.positions);
            setTimeout(() => {
                layers[layer].stroke();
            }, 0);
        }
    }

    _recieveEnd(data) {
        var interval = setInterval(() => {
            if(this.recieving[data.cId].len != data.l) {
                return;
            }

            var layer = layers[this.recieving[data.cId].layer];

            layer.canvas.completeStroke(layer.canvas.strokes[data.cId]);

            addChange(layer.canvas.strokes[data.cId], data.clId);
            for(var i = 0; i < layer.activeStrokes.length; i++) {
                if(layer.activeStrokes[i] == data.cId) {
                    layer.activeStrokes.splice(i, 1);
                    break;
                }
            }
            delete this.recieving[data.cId];
            layer.updatePreview();
            clearInterval(interval);
        }, 50);
    }

    _recieveUserJoin(data) {
        var el = $('<span>')
            .html(data.username.charAt(0))
            .attr('id', data.id)
            .appendTo('#user-list').hide();

        var expanded = $('<div>').html(data.username).attr('class', 'user-expanded').appendTo(el);
        el.animate({
            height: "toggle",
            opacity: "toggle"
        }, {
            duration: "slow"
        });
    }

    _recieveUserLeave(data) {
        $('#' + data.id).animate({
            height: "toggle",
            opacity: "toggle"
        }, {
            duration: "slow"
        }, () => {$('#' + data.id).remove();});
    }

    _recieveUpdateName(data) {
        $('#' + data.id).html(data.name);
    }

    _recieveUpdateSettings() {
        $('#server-name').text(data.name);
    }

    _initMouseEvents() {
        $('#layers').on('mousedown', evt => {
            var n = normalize(evt.offsetX, evt.offsetY);
            this.sendStart(n.x, n.y, .5);
        }).on('mousemove', evt => {
            if(down) {
                var n = normalize(evt.offsetX, evt.offsetY);
                this.sendMove(n.x, n.y, .5);
            }
        }).on('mouseenter', evt => {
            if(down) {
                var n = normalize(evt.offsetX, evt.offsetY);
                this.sendStart(n.x, n.y, .5);
            }
        }).on('mouseleave', evt => {
            var n = normalize(evt.offsetX, evt.offsetY);
            this.sendEnd(n.x, n.y, .5);
        });

        $(document).on('mouseup', evt => {
            var n = normalize(evt.offsetX, evt.offsetY);
            this.sendEnd(n.x, n.y, .5);
        });
    }

    _initTouchEvents() {
        $('#layers').on('touchstart', evt => {
            var n = normalize(
                (evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left),
                (evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top)
            );
            this.sendStart(n.x, n.y, .5);
        }).on('touchmove', evt => {
            var n = normalize(
                (evt.originalEvent.touches[0].pageX - $('#layers').offset().left),
                (evt.originalEvent.touches[0].pageY - $('#layers').offset().top)
            );
            this.sendMove(n.x, n.y, .5);
        });

        $(document).on('touchend touchcancel', evt => {
            var n = normalize(
                evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left,
                evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top
            );
            this.sendEnd(n.x, n.y, .5);
        });
    }

    _initPointers() {
        $('#layers').on('pointerdown', evt => {
            var n = normalize(evt.offsetX, evt.offsetY);
            this.sendStart(n.x, n.y, evt.originalEvent.pressure);
        }).on('pointermove', evt => {
            if(down) {
                var n = normalize(evt.offsetX, evt.offsetY);
                this.sendMove(n.x, n.y, evt.originalEvent.pressure);
            }
        }).on('pointerenter', evt => {
            if(down) {
                var n = normalize(evt.offsetX, evt.offsetY);
                this.sendStart(n.x, n.y, .5);
            }
        }).on('pointerleave', evt => {
            var n = normalize(evt.offsetX, evt.offsetY);
            this.sendEnd(n.x, n.y, .5);
        });;

        $(document).on('pointerend', evt => {
            var n = normalize(evt.offsetX, evt.offsetY);
            this.sendEnd(n.x, n.y, evt.originalEvent.pressure);
        });
    }
}

/**
 * UUID generator from https://jsfiddle.net/xg7tek9j/7/
 */
function getUUID() {
    var t = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var n = (t + Math.random() * 16) % 16 | 0;
        t = Math.floor(t/16);
        return (c == 'x' ? n : (n&0x3|0x8)).toString(16);
    });
    return uuid;
}