import CanvasServer from "server/CanvasServer";
import * as socketIo from 'socket.io';

const io = socketIo.listen(3001);
const server = new CanvasServer(io);
console.log(server.io);
