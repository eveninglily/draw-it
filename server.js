/** Main server; shares strokes through rooms using websockets */
"use strict";

var io = require('socket.io')().listen(3000);
var rooms = {};

io.on('connection', function(socket) {
    var room = {};

    socket.on('join', data => {
    }).on('disconnect', () => { safeEvt(room, {}, () => {
    })}).on('s', data => { safeEvt(room, data, data => {
    })}).on('u', data => { safeEvt(room, data, data => {
    })}).on('e', data => { safeEvt(room, data, data => {
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
