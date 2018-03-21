/** Main server; shares strokes through rooms using websockets */
"use strict";

var io = require('socket.io')().listen(3000);
var rooms = {};

console.log("Started server");

class Room {
    /**
     * Creates a room
     * @param {String} id The id of the room
     * @param {Object} settings JSON containing the settings
     */
    constructor(id, settings) {
        this.id = id;
        this.clients = {};
        this.strokes = {};
        this.layers = [];

        this.settings = {
            'name': settings.name
        }
    }

    /**
     * Adds a socket as a user in the room
     * @param {*} socket
     * @param {String} username
     */
    addClient(socket, username) {
        this.clients[socket.id] = username;
        socket.join(this.id);
        socket.emit('join', {
            'id': this.id,
            'name': this.settings.name,
            'cId': socket.id
        });

        io.sockets.in(this.id).emit('uj', {
            'id': socket.id,
            'username': username
        });

        log("evt", "Client[" + socket.id + "] joined Room[" + this.id + "]");
        return this;
    }

    /**
     * Updates the room settings if the user is the admin
     * @param {*} socket
     * @param {Object} settings
     */
    updateSettings(socket, settings) {
        if(socket.id != this.admin) { return false; }

        this.settings = settings;
        return true;
    }

    /**
     * Helper function that broadcasts to the room
     * @param {*} socket
     * @param {String} type
     * @param {Object} data
     */
    broadcast(socket, type, data) {
        socket.broadcast.to(this.id).emit(type, data);
    }

    /**
     * Gets a room or creates a new one if the room is not found
     * @param {*} data
     * @param {*} socket
     */
    static GetRoom(data, socket) {
        if(rooms.hasOwnProperty(data.id)) {
            log("evt", "Retrived room [" + data.id + "]");
            return rooms[data.id];
        }

        var id = data.id == '' ? getUUID().split('-')[4] : data.id;
        var name = data.name != '' ? data.name : id

        rooms[id] = new Room(id, {'name': name});
        rooms[id].admin = socket.id;

        log("evt", "Room[" + id + "] created, name: " + name);
        return rooms[id];
    }
}

io.on('connection', function(socket) {
    var room = {};

    socket.on('join', data => {
        room = Room.GetRoom(data, socket);
        room.addClient(socket, data.username);
        socket.emit('connected', {'id': room.id});

        /** Notify new client of all other clients */
        for(var key in room.clients) {
            if(room.clients.hasOwnProperty(key)) {
                if(key != socket.id && room.clients[key] != "") {
                    socket.emit('uj', {'id': key, 'username': room.clients[key]});
                }
            }
        }
    }).on('disconnect', () => { safeEvt(room, {}, () => {
            log("evt", 'Client ' + socket.id + ' disconnected from #' + room.id);
            io.sockets.in(room.id).emit('ul', {
                'id': socket.id,
                'username': room.clients[socket.id]
            });
        room.clients[socket.id] = "";
    })}).on('s', data => { safeEvt(room, data, data => {
        socket.broadcast.to(room.id).emit('s', data);
        room.strokes[data.cId] = {};
        room.strokes[data.cId].layer = data.layer;
        room.strokes[data.cId].tool = data.tool;
        room.strokes[data.cId].path = [];
        room.strokes[data.cId].path.push({ x: data.x, y: data.y, p: data.p });
    })}).on('u', data => { safeEvt(room, data, data => {
        socket.broadcast.to(room.id).emit('u', data);
        for(var i = 0; i < data.positions.length; i++) {
            var point = data.positions[i];
            room.strokes[data.cId].path.push({ x: point.x, y: point.y, p: point.p });
        }
    })}).on('e', data => { safeEvt(room, data, data => {
        socket.broadcast.to(room.id).emit('e', data);
        room.strokes[data.cId].path.push({ x: data.x, y: data.y, p: data.p });
    })}).on('nl', data => {
        socket.broadcast.to(room.id).emit('nl', data);
        room.layers.push(data.id);
    }).on('init_data', () => { safeEvt(room, {}, () => {
        socket.emit('board_data', {'strokes': room.strokes, 'layers': room.layers });
    })}).on('update-name', data => { safeEvt(room, data, data => {
        io.sockets.in(room.id).emit('update-name', {id: socket.id, name: data.name});
        room.clients[socket.id] = data.name;
    })}).on('undo', data => { safeEvt(room, data, data => {
        socket.broadcast.to(room.id).emit('undo', data);
    })}).on('redo', (data) => {
        socket.broadcast.to(room.id).emit('redo', data);
    }).on('update-settings', data => { safeEvt(room, data, data => {
        var status = room.updateSettings(socket, data);
        if(status) {
            socket.broadcast.to(room.id).emit('update-settings', data);
        } else {
            socket.emit('error', {'message': 'Only admins can update room settings'});
        }
     })});
});

/**
 * Makes sure the room exists before doing any callbacks
 * @param {Room} room
 * @param {Object} data
 * @param {Function} callback
 */
function safeEvt(room, data, callback) {
    if(room == {} || !rooms.hasOwnProperty(room.id)) {
        log("warn", "Caught null room");
        return;
    }
    callback(data);
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

/**
 * Basic logging function
 * @param {String} type The type of the message
 * @param {String} msg The message to log
 */
function log(type, msg) {
    var time = Date.now();
    console.log("[" + type + "]::" + time + " - " + msg);
}