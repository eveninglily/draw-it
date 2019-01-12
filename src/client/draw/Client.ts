import ExStroke from 'client/draw/canvas/ExStroke';
import ExTool from 'client/draw/canvas/ExTool';
import { EventEmitter } from 'events';
import { Guid } from 'guid-typescript';
import * as io from 'socket.io-client';
import { ChatPayload, EndPayload, MovePayload, RoomData, RoomJoinPayload, StartPayload, User, UserJoinPayload } from 'types';

interface ClientMeta {
  url: string;
  username: string;
  connected: boolean;
  down: boolean;
}

class Client extends EventEmitter {
  public meta: ClientMeta;

  public currentUUID: Guid;
  public clientId: string;
  public currTool: ExTool;
  public users: User[];

  private socket: SocketIOClient.Socket;
  private recieving: {[uuid: string]: {layer: number; len: number}};
  private sending: {[uuid: string]: Array<{x: number; y: number; p: number;}>};
  private currentStrokeLen: number;

  constructor(url: string) {
    super();

    this.recieving = {};
    this.socket = io(url);
    this.currentStrokeLen = 0;
    this.meta = {
      connected: false,
      down: false,
      url,
      username: 'Anon',
    }
    this.sending = {};
    this.users = [];
    console.log('Client init');
  }

  public getRoomInfo(roomId: string) {
    this.socket.emit('info', {id: roomId}).on('server-info', (data: RoomData) => {
      this.emit('server-info', data);
    });
  }

    public connect(roomId: string) {
      this.meta.connected = true;
      const payload: RoomJoinPayload = {
        clientId: '',
        id: roomId,
        username: this.meta.username
      }

      this.socket.emit('join', payload);

        this.socket
          .on('join', (data: any) => this.onJoin(data))
          .on('s', (data: StartPayload) => this.recieveStart(data))
          .on('u', (data: MovePayload) => this.recieveMove(data))
          .on('e', (data: EndPayload) => this.recieveEnd(data))
          .on('nl', (data: any) => this.recieveAddLayer(data.id))
          .on('uj', (data: any) => this.recieveUserJoin(data))
          .on('ul', (data: any) => this.recieveUserLeave(data))
          .on('undo', (data: any) => this.recieveUndo(data.cId))
          .on('redo', (data: any) => this.recieveRedo(data.cId))
          .on('board_data', (data: any) => this.loadBoard(data))
          .on('chat', (data: any) => this.recieveChat(data));

        /** Send updates every 40ms */
        setInterval(() => {
          for(const key in this.sending) {
            if(this.sending.hasOwnProperty(key)) {
              if(!(this.sending[key].length === 0)) {
                const updatePayload: MovePayload = {
                  positions: this.sending[key],
                  uuid: key,
                }
                this.socket.emit('u', updatePayload);
                this.sending[key] = [];
              }
            }
          }
        }, 40);
    }

    public disconnect() {
        this.socket.emit('disconnect');
    }

    public sendStart = (x: number, y: number, p: number, tool: ExTool): void => {
        if(!this.meta.connected) { return; }
        this.currentUUID = Guid.create();
        const payload: StartPayload = {
            layer: 0,
            p,
            tool,
            uuid: this.currentUUID.toString(),
            x,
            y,
        }
        this.socket.emit('s', payload);
        this.meta.down = true;
        this.currentStrokeLen = 1;
        this.sending[this.currentUUID.toString()] = [];
    }

    public sendMove(x: number, y: number, p: number) {
      if(!this.meta.connected) { return; }

      if(this.meta.down) {
        this.currentStrokeLen += 1;
        this.sending[this.currentUUID.toString()].push({x, y, p});
      }
    }

    public sendEnd() {
      if(!this.meta.connected) { return; }

      const uuid = this.currentUUID;
      const len = this.currentStrokeLen;
      if(this.meta.down) {
          setTimeout(() => {
              const payload :EndPayload = {
                clientId: this.clientId,
                len,
                uuid: uuid.toString(),
              };
              this.socket.emit('e', payload);
          }, 45);
          this.meta.down = false;
      }
    }

    public sendUndo() {
      if(!this.meta.connected) { return; }
      this.socket.emit('undo', {
        cId: this.clientId
      });
    }

    public sendRedo() {
      if(!this.meta.connected) { return; }
      this.socket.emit('redo', {
          cId: this.clientId
      });
  }

  public sendAddLayer(id: string) {
    if(!this.meta.connected) { return; }
      this.socket.emit('nl', {
          'id': id
      });
  }

  public sendUpdateName() {
    if(!this.meta.connected) { return; }
      this.socket.emit('update-name', {
          name: this.meta.username
      });
  }

  public sendChat(message: string, user: User) {
    this.socket.emit('chat', {
      message,
      user,
    });
  }

  private loadBoard(data: any) {
    /** Draw all the strokes */
    for(const key in data.strokes) {
      if(data.strokes.hasOwnProperty(key)) {
        const stroke = new ExStroke(data.strokes[key].tool);
        stroke.addPoints(data.strokes[key].path);
        this.emit('load-stroke', stroke)
      }
    }

    console.log('Recieved board info');
  }

  private recieveStart(data: StartPayload) {
    console.log('START')
    this.recieving[data.uuid] = {'layer': data.layer, 'len': 1};
    this.emit('start', data);
  }

  private recieveMove(data: MovePayload) {
    if(this.recieving[data.uuid] != null) {
      this.recieving[data.uuid].len += data.positions.length;
      this.emit('move', data);
    }
  }

  private recieveEnd(data: EndPayload) {
    const interval = setInterval(() => {
      if(this.recieving[data.uuid].len !== data.len) {
        return;
      }
      this.emit('end', data);
      clearInterval(interval);
      delete this.recieving[data.uuid];
    }, 50);
  }

  private recieveUndo(cId: string) {
    console.log('TODO: Unimplemented');
    console.log(cId);
  }

  private recieveRedo(cId: string) {
    console.log('TODO: Unimplemented');
    console.log(cId);
  }

  private recieveUserJoin(data: UserJoinPayload) {
    const user = {
      name: data.username,
    }

    this.users.push(user);
    this.emit('user-join', user);
    console.log('sadasdasdsadsadsadsa')
  }

  private recieveUserLeave(data: any) {
    // TODO: remove user, send to parent
  }

  private recieveAddLayer(id: string) {
    // TODO: Update name
  }

  private onJoin(data: any) {
    window.location.href = "#" + data.id
    // this.id = data.id;
    this.clientId = data.cId;
    this.socket.emit('init_data');
  }

  private recieveChat(data: ChatPayload) {
    this.emit('chat', data);
  }
}

export default Client;