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
    var roomId = '';
    socket.on('join-room', function(data) {
        var id;
        console.log(data);
        if(data['id'] == '') {
            id = getUUID();
            console.log(id);
            var room = new Room(id);
            room.clients.push(socket);
            rooms.push(room);
        } else {
            id = data.id;
        }
        socket.join(id);
        socket.emit('handshake', {
            'id': id,
            'cId': socket.id
        });
        roomId = id;
    });

    socket.on('s', function(data) {
        socket.broadcast.to(roomId).emit('s', data);
    });

    socket.on('u', function(data) {
        socket.broadcast.to(roomId).emit('u', data);
    });

    socket.on('e', function(data) {
        socket.broadcast.to(roomId).emit('e', data);
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