import { EndPayload, MovePayload, RoomJoinPayload, StartPayload, UserJoinPayload } from 'types';

interface RoomSettings {
    isPrivate: boolean;
}

export default class Room {
    public id: string;
    public settings: RoomSettings;

    private io: SocketIO.Server;

    private clients: {[key: string]: string};
    private strokes: any;
    // private layers: any;

    constructor(id: string, io: SocketIO.Server) {
        this.id = id;
        this.settings = {
            isPrivate: true,
        }

        this.clients = {};
        this.strokes = {};
        // this.layers = [];

        this.io = io;
    }

    public addClient(socket: SocketIO.Socket, username: string): void {
        this.clients[socket.id] = username;
        socket.join(this.id);

        const payload: RoomJoinPayload = {
            clientId: socket.id,
            id: this.id,
            username,
        }
        socket.emit('join', payload);

        // Send user info to all other clients
        const userJoinPayload: UserJoinPayload = {
            id: socket.id,
            username,
        }
        this.io.sockets.in(this.id).emit('uj', userJoinPayload);

        // Send other clients info to new user
        for(const client of this.clients.keys) {
            const newPayload: UserJoinPayload = {
                id: client,
                username: this.clients[client]
            }
            socket.emit('uj', newPayload);
        }
    }

    public removeClient(socket: SocketIO.Socket): void {
        this.io.sockets.in(this.id).emit('ul', {
            'id': socket.id,
            'username': this.clients[socket.id]
        });
        delete this.clients[socket.id];
    }

    public startStroke(socket: SocketIO.Socket, data: StartPayload) {
        socket.broadcast.to(this.id).emit('s', data);
        this.strokes[data.uuid] = {};
        this.strokes[data.uuid].layer = data.layer;
        this.strokes[data.uuid].tool = data.tool;
        this.strokes[data.uuid].path = [];
        this.strokes[data.uuid].path.push({ x: data.x, y: data.y, p: data.p });
    }

    public updateStroke(socket: SocketIO.Socket, data: MovePayload) {
        socket.broadcast.to(this.id).emit('u', data);
        for(const point of data.positions) {
            this.strokes[data.uuid].path.push({ x: point.x, y: point.y, p: point.p });
        }
    }

    public endStroke(socket: SocketIO.Socket, data: EndPayload) {
        socket.broadcast.to(this.id).emit('e', data);
        this.strokes[data.uuid].path.push({ x: data.x, y: data.y, p: data.p });
    }

    public broadcast(socket: SocketIO.Socket, type: string, data: any): void {
        socket.broadcast.to(this.id).emit(type, data);
    }
}