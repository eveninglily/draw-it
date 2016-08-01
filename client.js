var client;

$(document).ready(function() {
    client = new Client('https://dev2.nodedraw.com');
});

class Client {
    constructor(server) {
        this.server = server;
        this.connected = false;
        this.down = false;
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
        this.socket.on('handshake', function(data) {
            console.log('Connected to server! Room ID: ' + data.id);
            window.location.href = "#" + data.id
            this.id = data.id;
        });
        this.id = "test";
        this.socket.on('start', function(data) {
            layers[data.layer].canvas.beginStroke(data.tool, data.x, data.y, data.cId);
            activeStrokes.push(data.cId);
            layers[data.layer].canvas.doStrokes(activeStrokes);
        }).on('update', function(data) {
            layers[data.layer].canvas.strokes[data.cId].addPoint(data.x, data.y);
            layers[data.layer].canvas.doStrokes(activeStrokes);
        }).on('end', function(data) {
            layers[data.layer].canvas.completeStroke(layers[data.layer].canvas.strokes[data.cId]);
            addChange(layers[data.layer].canvas.strokes[data.cId]);
            for(var i = 0; i < activeStrokes.length; i++) {
                if(activeStrokes[i].id == data.cId) {
                    activeStrokes.splice(i, 1);
                    break;
                }
            }
            layers[data.layer].updatePreview();
        });
        var c = this;
        $('#layers').on('mousedown', function(e) {
            c.sendStart(e.offsetX, e.offsetY);
        }).on('mousemove', function(e) {
            if(down) {
                c.sendMove(e.offsetX, e.offsetY);
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
            c.sendEnd(e.offsetX, e.offsetY);
        }).on('touchend touchcancel', function(evt){
            c.sendEnd(
                evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left,
                evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top
            );
        });
    }

    sendStart(x, y) {
        this.socket.emit('start', {
            x: x,
            y: y,
            id: this.id,
            layer: currentLayer,
            tool: currTool
        });
        this.down = true;
    }

    sendMove(x, y) {
        if(this.down) {
            this.socket.emit('update', {
                x: x,
                y: y,
                id: this.id,
                layer: currentLayer
            });
        }
    }

    sendEnd(x, y) {
        if(this.down) {
            this.socket.emit('end', {
                x: x,
                y: y,
                id: this.id,
                layer: currentLayer
            });
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
