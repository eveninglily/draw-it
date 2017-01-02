"use strict";

var fs = require('fs');
var request = require('request');

//TODO: Replace if open sourced
var API_KEY = "7fd895d5-b1a8-441f-b4f1-1cc7995a8218";

var url = 'https://nodedraw.com/draw/';
var io = require('socket.io')().listen(3000);
var rooms = {};

class Room {
    constructor(id, name, socket) {
        this.id = id;
        this.name = name;
        this.socket = socket;
        this.clients = [];
        this.strokes = {};
    }

    static onConnect(data, socket) {
        var id = data.id;
        var name = data.name;

        if(!(data.id in rooms)) {
            if(data['id'] == '') {
                id = getUUID();
                id = id.split('-')[4];
            }

            if(data.name == '') {
                name = id;
            }

            rooms[id] = new Room(id, name, socket);
            rooms[id].admin = socket.id;

            console.log("Room["+ id +"] created, name: " + name);
        }

        rooms[id].clients.push(socket);
        socket.join(id);
        socket.emit('join', {
            'id': id,
            'name': rooms[id].name,
            'cId': socket.id
        });

        console.log("Client[" + socket.id + "] joined Room[" + id + "]");
        return rooms[id];
    }

    save() {

    }
}

io.on('connection', function(socket) {
    var room;
    var roomId = '';

    socket.on('join-room', data => {
        room = Room.onConnect(data, socket);
        roomId = room.id;
    }).on('disconnect', function() {
        console.log('Client ' + this.id + ' disconnected from #' + roomId);
    }).on('s', data => {
        socket.broadcast.to(roomId).emit('s', data);
        room.strokes[data.cId] = {};
        room.strokes[data.cId].layer = data.layer;
        room.strokes[data.cId].tool = data.tool;
        room.strokes[data.cId].path = [];
        room.strokes[data.cId].path.push({ x: data.x, y: data.y, p: data.p });
    }).on('u', data => {
        socket.broadcast.to(roomId).emit('u', data);
        for(var i = 0; i < data.positions.length; i++) {
            var point = data.positions[i];
            room.strokes[data.cId].path.push({ x: point.x, y: point.y, p: point.p });
        }
    }).on('e', data => {
        socket.broadcast.to(roomId).emit('e', data);
        room.strokes[data.cId].path.push({ x: data.x, y: data.y, p: data.p });
    }).on('nl', data => { socket.broadcast.to(roomId).emit('nl', data);
    }).on('save', function(data, fn) {
        var image = data.b64.replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(image, 'base64');
        var uuid = getUUID().split('-')[0];

        fs.writeFile('/var/www/amidraw/amidraw-webservices/public/gallery/img/' + uuid + '.png', buffer);
        console.log('saving at gallery/img/' + uuid + '.png');

        request.post('https://amidraw.com/gallery/api/post', {
            'json': {
                "apikey": API_KEY,
                "title": "Upload",
                "description": "",
                "path": "https://amidraw.com/gallery/img/" + uuid + ".png",
                "user": 1
            }
        }, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                console.log('API Call Accepted');
            } else {
                console.log("Error :(")
            }
        });

        fn({'url': 'https://amidraw.com/gallery/img/' + uuid + '.png'});
    }).on('init_data', () => {
        socket.emit('board_data', {'strokes': room.strokes});
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