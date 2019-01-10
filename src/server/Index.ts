import CanvasServer from "server/CanvasServer";
import * as socketIo from 'socket.io';

const io = socketIo.listen(3001);
// tslint:disable-next-line:no-unused-expression
new CanvasServer(io);
console.log("Server running on port 3001");
