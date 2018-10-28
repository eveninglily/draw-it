import Room from 'server/Room';
import * as socketIo from 'socket.io';
import { EndPayload, MovePayload, RoomJoinPayload, StartPayload } from 'types';

export default class CanvasServer {
    public io: socketIo.Server;
    public rooms: {
        [key: string]: Room
    };

    constructor(io: socketIo.Server) {
        this.io = io;
        this.rooms = {};

        this.io.on('connection', socket => {
            let room: Room;

            socket.on('join', (data: RoomJoinPayload) => {
                const id: string = data.id;
                if(!(id in this.rooms)) {
                    this.rooms[id] = new Room(id, this.io);
                }

                room = this.rooms[id];
                room.addClient(socket, data.username);
            }).on('disconnect', () => {
                if(!room) { return; }
                room.removeClient(socket);
            }).on('s', (data: StartPayload) => {
                room.startStroke(socket, data);
            }).on('u', (data: MovePayload) => {
                room.updateStroke(socket, data)
            }).on('e', (data: EndPayload) => {
                room.endStroke(socket, data)
            });
        });
    }
}

/*function GetRoom = (data: any, socket: any) => {
    if(rooms.hasOwnProperty(data.id)) {
        log("evt", "Retrived room [" + data.id + "]");
        return rooms[data.id];
    }

    const id = data.id === '' ? getUUID().split('-')[4] : data.id;
    const name = data.name !== '' ? data.name : id

    rooms[id] = new Room(id, {'name': name});
    rooms[id].admin = socket.id;

    return rooms[id];
}*/