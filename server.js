"use strict";

var fs = require('fs');

class Room {
    constructor(id) {
        this.id = id;
        this.clients = [];
    }
}

var io = require('socket.io')().listen(3000);
var rooms = [];

io.on('connection', function(socket) {
    socket.on('join-room', function(data) {
        var id;
        console.log(data);
        if(data['id'] == '') {
            id = getUUID();
            console.log(id);
            var room = new Room(id);
            room.clients.push(socket);
            rooms.push(room);
            socket.join(id);
        } else {
            id = data.id;
            socket.join(id);
        }

        socket.emit('handshake', {
            'id': id
        });
    });

    socket.on('start', function(data) {
        socket.broadcast.to(data.id).emit('start', {
            x: data.x,
            y: data.y,
            layer: data.layer,
            cId: socket.id,
            tool: data.tool
        });
    });

    socket.on('update', function(data) {
        socket.broadcast.to(data.id).emit('update', {
            x: data.x,
            y: data.y,
            id: this.id,
            layer: data.layer,
            cId: socket.id
        });
    });

    socket.on('end', function(data) {
        socket.broadcast.to(data.id).emit('end', {
            x: data.x,
            y: data.y,
            id: this.id,
            layer: data.layer,
            cId: socket.id
        });
    });

    socket.on('save', function(data, fn) {
        var image = data.b64.replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(image, 'base64');
        var uuid = getUUID().split('-')[0];
        fs.writeFile("gallery/"+uuid+".png", buffer);
        console.log('saving at https://nodedraw.com/amidraw/gallery/' + uuid + '.png');
        fn({'url':'https://nodedraw.com/amidraw/gallery/' + uuid + '.png'});
    });
});

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