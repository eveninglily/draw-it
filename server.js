"use strict";

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
			id = genBadID();
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
});

function genBadID() {
    return ("000000" + (Math.random()*Math.pow(36,6) << 0).toString(36)).slice(-6).toString(16);
}
