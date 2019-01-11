import Room from 'server/Room';
import * as socketIo from 'socket.io';
import { ChatPayload, EndPayload, MovePayload, RoomData, RoomJoinPayload, RoomType, StartPayload } from 'types';

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

            socket.on('info', (data) => {
                const id: string = data.id;
                const error = (id in this.rooms) ? undefined : "Room not found";
                const name = error ? '' : this.rooms[id].name;

                const roomInfo: RoomData = {
                    error,
                    id: data.id,
                    name,
                }

                socket.emit('server-info', roomInfo);
            }).on('join', (data: RoomJoinPayload) => {
                const id: string = data.id;
                if(!(id in this.rooms)) {
                    this.rooms[id] = new Room(id, this.io, RoomType.GuessingGame);
                }

                room = this.rooms[id];
                room.addClient(socket, data.username);
            }).on('disconnect', () => {
                if(!room) { return; }
                room.removeClient(socket);
                console.log('Client disconnected');
            }).on('s', (data: StartPayload) => {
                room.startStroke(socket, data);
            }).on('u', (data: MovePayload) => {
                room.updateStroke(socket, data);
            }).on('e', (data: EndPayload) => {
                room.endStroke(socket, data);
            }).on('chat', (data: ChatPayload) => {
                room.emit(socket, 'chat', data);
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