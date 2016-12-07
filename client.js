/**
 * Client-side networking code.
 */
"use strict";
var client;

$(document).ready(function() {
    client = new Client('https://nodedraw.com');
    var l = window.location.href.split('#');
    if(l.length == 2) {
        client.connect();
        client.joinRoom(l[1]);
    }
});

class Client {
    constructor(server) {
        this.server = server;

        this.connected = false;
        this.inRoom = false;

        this.down = false;
        this.id = 'test';

        this.currentUUID;
        this.clientId = '';

        this.recieving = {};
        this.sending = {};
    }

    connect() {
        this.socket = io(this.server);
        var _t = this;
        this.socket.on('connect', function() {
            _t.connected = true;
            console.log('connected!')
        }).on('disconnect', function() {
            _t.connected = false;
        });
    }

    joinRoom(id) {
        this.socket.emit('join-room', {
            'id': id,
            'name': $('#new-room-name').val()
        });

        var _this = this;
        this.socket.on('handshake', data => this._handshake(data))
                   .on('s', data => this._recieveStart(data))
                   .on('u', data => this._recieveUpdate(data))
                   .on('e', data => this._recieveEnd(data))
                   .on('nl', data => addLayer(data.id))
                   .on('board_data', data => {
                        for(var key in data.strokes) {
                            console.log(data.strokes[key]);
                            if(data.strokes.hasOwnProperty(key)) {
                                var layer = data.strokes[key].layer;
                                var stroke = new Stroke(data.strokes[key].tool);
                                stroke.addPoints(data.strokes[key].path);
                                layers[layer].canvas.completeStroke(stroke);
                            }
                        }
                   });
        _this._initListeners();
    }

    sendStart(x, y) {
        this.currentUUID = getUUID();
        var c = this.currentUUID;
        this.socket.emit('s', {
            cId: c,
            x: x,
            y: y,
            p: .5,
            layer: currentLayer,
            tool: currTool
        });
        this.down = true;
        this.sending[c] = [];
    }

    sendMove(x, y) {
        if(this.down) {
            this.sending[this.currentUUID].push({'x': x, 'y': y, p: .5});
        }
    }

    sendEnd(x, y) {
        if(this.down) {
            setTimeout(() => {
                this.socket.emit('e', {
                    cId: this.currentUUID,
                    x: x,
                    y: y,
                    p: .5
                });
            }, 45);
            this.down = false;
        }
    }

    sendAddLayer(id) {
        this.socket.emit('nl', {
            'id': id
        });
    }

    save() {
        this.socket.emit('save', {'b64': getMergedVisibleCanvas().get(0).toDataURL()}, function(data) {
            console.log("Saved to gallery at " + data.url);
            $('#gallery-url-holder').show();
            $('#gallery-url').text(data.url).attr('href', data.url);
            $('#modal-bg').show();
        });
    }

    _handshake(data) {
        console.log('Connected to server! Room ID: ' + data.id);
        window.location.href = "#" + data.id
        this.id = data.id;
        this.clientId = data.cId;
        console.log(data.cId);
        $('#server-status').show();
        $('#server-name').text(data.name);
        this.inRoom = true;
    }

    _recieveStart(data) {
        this.recieving[data.cId] = data.layer;
        var layer = data.layer;
        layers[layer].canvas.beginStroke(data.tool, data.x, data.y, data.p, data.cId);
        layers[layer].activeStrokes.push(data.cId);
        layers[layer].canvas.doStrokes(layers[layer].activeStrokes);
    }

    _recieveUpdate(data) {
        var layer = this.recieving[data.cId];
        layers[layer].canvas.strokes[data.cId].addPoints(data.positions);
        setTimeout(function(){
            layers[layer].canvas.doStrokes(layers[layer].activeStrokes);
        }, 0);
    }

    _recieveEnd(data) {
        setTimeout(() => {
            var layer = this.recieving[data.cId];

            layers[layer].canvas.completeStroke(layers[layer].canvas.strokes[data.cId]);
            addChange(layers[layer].canvas.strokes[data.cId]);
            for(var i = 0; i < layers[layer].activeStrokes.length; i++) {
                if(layers[layer].activeStrokes[i].id == data.cId) {
                    layers[layer].activeStrokes.splice(i, 1);
                    break;
                }
            }
            delete this.recieving[data.cId];
            layers[layer].updatePreview();
        }, 0);
    }

    _initListeners() {
        var _this = this;
        $('#layers').on('mousedown', e => {
            var n = normalize(e.offsetX, e.offsetY);
            this.sendStart(n.x, n.y);
        })
        .on('mousemove', e => {
            if(down) {
                var n = normalize(e.offsetX, e.offsetY);
                this.sendMove(n.x, n.y);
            }
        }).on('touchstart', function (evt) {
            var n = normalize(
                (evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left),
                (evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top)
            );
            _this.sendStart(n.x, n.y);
        }).on('touchmove', function (evt) {
            var n = normalize(
                (evt.originalEvent.touches[0].pageX - $('#layers').offset().left),
                (evt.originalEvent.touches[0].pageY - $('#layers').offset().top)
            );
            _this.sendMove(
                n.x, n.y
            );
        });

        $(document).on('mouseup', evt => {
                        var n = normalize(evt.offsetX, evt.offsetY);
                        this.sendEnd(n.x, n.y);
                    })
                   .on('touchend touchcancel', evt =>
                        this.sendEnd(
                            evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left,
                            evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top
                        )
                    );

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
    }

    requestData() {
        this.socket.emit('init_data');
    }
}

/**
 * UUID generator from https://jsfiddle.net/xg7tek9j/7/, a RFC4122-compliant solution
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