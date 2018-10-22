/*import { Guid } from 'guid-typescript';
import * as socketIo from 'socket.io';

const io = socketIo.listen(3000);
const rooms = {};

class Room {

    public static GetRoom(data: any, socket: any) {
        if(data.id in rooms) {
            return rooms[data.id];
        }

        const id = data.id === '' ? Guid.create().toString().split('-')[4] : data.id;
        const name = data.name !== '' ? data.name : id

        rooms[id] = new Room(id, {'name': name});
        rooms[id].admin = socket.id;

        return rooms[id];
    }
}

class Room2 {


    public id: string;
    public clients: any;
    public strokes: any;
    public settings: any;
    public layers: any;

    constructor(id: string, settings: any) {
        this.id = id;
        this.clients = {};
        this.strokes = {};
        this.layers = [];

        this.settings = {
            'name': settings.name
        }
    }

    public addClient(socket: any, username: string) {
        this.clients[socket.id] = username;
        socket.join(this.id);
        socket.emit('join', {
            'cId': socket.id,
            'id': this.id,
            'name': this.settings.name,

        });

        io.sockets.in(this.id).emit('uj', {
            'id': socket.id,
            'username': username
        });

        return this;
    }

    /**
     * Updates the room settings if the user is the admin
     * @param {*} socket
     * @param {Object} settings
     */
    /*public updateSettings(socket, settings) {
        if(socket.id !== this.admin) { return false; }

        this.settings = settings;
        return true;
    }

    /**
     * Helper function that broadcasts to the room
     * @param {*} socket
     * @param {String} type
     * @param {Object} data
     */
    /*public broadcast(socket, type, data) {
        socket.broadcast.to(this.id).emit(type, data);
    }
}

io.on('connection', function(socket) {
    let room = {};

    socket.on('join', data => {
        room = Room.GetRoom(data, socket);
        room.addClient(socket, data.username);
        socket.emit('connected', {'id': room.id});

        /** Notify new client of all other clients */
      /*  for(const key in room.clients) {
            if(room.clients.hasOwnProperty(key)) {
                if(key !== socket.id && room.clients[key] !== "") {
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
        for(let i = 0; i < data.positions.length; i++) {
            const point = data.positions[i];
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
        const status = room.updateSettings(socket, data);
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
/*function safeEvt(room, data, callback) {
    if(room === {} || !rooms.hasOwnProperty(room.id)) {
        log("warn", "Caught null room");
        return;
    }
    callback(data);
}*/