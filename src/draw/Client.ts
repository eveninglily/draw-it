import { Guid } from 'guid-typescript';
import * as socketIo from 'socket.io';
import ExTool from 'src/draw/canvas/ExTool';
import { EndPayload, MovePayload, RoomJoinPayload, StartPayload } from 'src/types';

interface ClientMeta {
    username: string;
    connected: boolean;
    down: boolean;
}

class Client {
    public url: string;
    public meta: ClientMeta;
    public currentUUID: Guid;
    public clientId: string;
    public currTool: ExTool;
    public connected: boolean;

    private socket: socketIo.Server;
    private recieving: {[uuid: string]: {layer: number; len: number}};
    private sending: {[uuid: string]: Array<{x: number; y: number; p: number;}>};
    private currentStrokeLen: number;

    constructor(url: string) {
        this.url = url;
        this.recieving = {};
        this.socket = socketIo(url);
        this.currentStrokeLen = 0;
    }

    public connect(roomId: string) {
        this.connected = true;
        const payload: RoomJoinPayload = {
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
          .on('board_data', (data: any) => this.loadBoard(data));

        /** Send updates every 40ms */
        setInterval(() => {
          for(const key in this.sending) {
            if(!this.sending.hasOwnProperty(key)) {
              continue;
            }
            if(!(this.sending[key].length === 0)) {
              this.socket.emit('u', {
                cId: key,
                positions: this.sending[key]
              });
              this.sending[key] = [];
            }
          }
        }, 40);
    }

    public disconnect() {
        this.socket.emit('disconnect');
    }

    public sendStart = (x: number, y: number, p: number): void => {
        this.currentUUID = Guid.create();
        const payload: StartPayload = {
            layer: 0,
            p,
            tool: this.currTool,
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
      if(this.meta.down) {
        this.currentStrokeLen += 1;
        this.sending[this.currentUUID.toString()].push({x, y, p});
      }
    }

    public sendEnd(x: number, y: number, p: number) {
      const uuid = this.currentUUID;
      const len = this.currentStrokeLen;
      if(this.meta.down) {
          setTimeout(() => {
              this.socket.emit('e', {
                  cId: uuid,
                  clId: this.clientId,
                  l: len, p, x, y
              });
          }, 45);
          this.meta.down = false;
      }
    }

    public sendUndo() {
      this.socket.emit('undo', {
        cId: this.clientId
      });
    }

    public sendRedo() {
      this.socket.emit('redo', {
          cId: this.clientId
      });
  }

  public sendAddLayer(id: string) {
      this.socket.emit('nl', {
          'id': id
      });
  }

  public sendUpdateName() {
      this.socket.emit('update-name', {
          name: this.meta.username
      });
  }

  private loadBoard(data: any) {
      /** Create all the layers */
      // for(const layer of data.layers) {
      //    addLayer(layer);
// }

      /** Draw all the strokes */
      /*for(var key in data.strokes) {
          if(data.strokes.hasOwnProperty(key)) {
              var layer = data.strokes[key].layer;
              var stroke = new OIStroke(data.strokes[key].tool, layers[layer].canvas.partitions);
              stroke.addPoints(data.strokes[key].path);
              layers[layer].canvas.completeStroke(stroke);
          }
      }*/

      /** Update layer previews */
      /*for(var i = 0; i < layers.length; i++) {
          layers[i].updatePreview();
      }*/
      console.log('Recieved board info');
    }

  private recieveStart(data: StartPayload) {
      this.recieving[data.uuid] = {'layer': data.layer, 'len': 1};

      // TOOD: dispatch this info elsewhere
      // const layer: number = data.layer;
      // layers[layer].canvas.beginStroke(data.tool, data.x, data.y, data.p, data.cId);
      // layers[layer].activeStrokes.push(data.cId);
      // layers[layer].stroke();
  }

  private recieveMove(data: MovePayload) {
      if(this.recieving[data.uuid] != null) {
          this.recieving[data.uuid].len += data.positions.length;

          // TOOD: dispatch this info elsewhere
          // const layer: number = this.recieving[data.uuid].layer;
          // layers[layer].canvas.strokes[data.cId].addPoints(data.positions);
          // layers[layer].stroke();
      }
  }

  private recieveEnd(data: EndPayload) {
    const interval = setInterval(() => {
          if(this.recieving[data.uuid].len !== data.len) {
              return;
          }

          // TOOD: dispatch this info elsewhere
          // var layer = layers[this.recieving[data.cId].layer];
          // layer.canvas.completeStroke(layer.canvas.strokes[data.cId]);
          // addChange(layer.canvas.strokes[data.cId], data.clId);
          // for(var i = 0; i < layer.activeStrokes.length; i++) {
              // if(layer.activeStrokes[i] == data.cId) {
                 //  layer.activeStrokes.splice(i, 1);
                 //  break;
              // }
          // }
          // delete this.recieving[data.cId];
          // layer.updatePreview();
          clearInterval(interval);
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

  private recieveUserJoin(data: any) {
      // TODO: add user, send to parent
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
}

export default Client;