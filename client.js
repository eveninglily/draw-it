var client;

$(document).ready(function() {
    client = new Client('https://nodedraw.com');
});

class Client {
    constructor(server) {
        this.server = server;
        this.connected = false;
        this.down = false;
        this.id = 'test';
        this.clientId = '';
        this.connections = {};
        this.updateQueue = [];
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
        this.joinRoom('test');
    }

    joinRoom(id) {
        this.socket.emit('join-room', {
            'id': id
        });
        var _this = this;
        this.socket.on('handshake', function(data) {
            console.log('Connected to server! Room ID: ' + data.id);
            window.location.href = "#" + data.id
            _this.id = data.id;
            _this.clientId = data.cId;
            console.log(data.cId);
            $('.right').prepend($('<div>').attr('id','server-status').text('Connected to #' + data.id));
        });

        this.socket.on('s', function(data) {
            _this.connections[data.cId] = data.layer;
            var layer = _this.connections[data.cId];
            layers[layer].canvas.beginStroke(data.tool, data.x, data.y, data.cId);
            activeStrokes.push(data.cId);
            layers[layer].canvas.doStrokes(activeStrokes);
        }).on('u', function(data) {
            var layer = _this.connections[data.cId];
            data.positions.forEach(function(pos) {
                layers[layer].canvas.strokes[data.cId].addPoint(pos.x, pos.y);
                layers[layer].canvas.doStrokes(activeStrokes);
            }, this);
        }).on('e', function(data) {
            var layer = _this.connections[data.cId];

            layers[layer].canvas.completeStroke(layers[layer].canvas.strokes[data.cId]);
            addChange(layers[layer].canvas.strokes[data.cId]);
            for(var i = 0; i < activeStrokes.length; i++) {
                if(activeStrokes[i].id == data.cId) {
                    activeStrokes.splice(i, 1);
                    break;
                }
            }
            layers[layer].updatePreview();
        });

        $('#layers').on('mousedown', function(e) {
            _this.sendStart(e.offsetX, e.offsetY);
        }).on('mousemove', function(e) {
            if(down) {
                _this.sendMove(e.offsetX, e.offsetY);
            }
        }).on('touchstart', function (evt) {
            c.sendStart(evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left, evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top);
        }).on('touchmove', function (evt) {
            c.sendMove(
                evt.originalEvent.touches[0].pageX - $('#layers').offset().left,
                evt.originalEvent.touches[0].pageY - $('#layers').offset().top
            );
        });

        $(document).on('mouseup', function(e) {
            _this.sendEnd(e.offsetX, e.offsetY);
        }).on('touchend touchcancel', function(evt){
            _this.sendEnd(
                evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left,
                evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top
            );
        });

        setInterval(function() {
            if(_this.updateQueue.length != 0) {
                _this.socket.emit('u', {
                    cId: _this.clientId,
                    positions: _this.updateQueue
                });
                _this.updateQueue = [];
            }
        }, 40);
    }

    sendStart(x, y) {
        var c = this.clientId;
        console.log(c);
        this.socket.emit('s', {
            cId: c,
            x: x,
            y: y,
            layer: currentLayer,
            tool: currTool
        });
        this.down = true;
    }

    sendMove(x, y) {
        if(this.down) {
            this.updateQueue.push({'x': x, 'y': y});
        }
    }

    sendEnd(x, y) {
        if(this.down) {
            var _this = this;
            setTimeout(function(){
                _this.socket.emit('e', {
                    cId: _this.clientId,
                    x: x,
                    y: y
                });
            }, 45);
            this.down = false;
        }
    }

    save() {
        this.socket.emit('save', {'b64': getMergedVisibleCanvas().get(0).toDataURL()}, function(data) {
            console.log("Saved to gallery at " + data.url);
            $('#gallery-url-holder').show();
            $('#gallery-url').text(data.url).attr('href', data.url);
            $('#modal-bg').show();
        });
    }
}
