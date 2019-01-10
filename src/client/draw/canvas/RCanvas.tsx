import 'client/css/canvas.css';
import ExBrush from 'client/draw/canvas/ExBrush';
import ExCanvas from 'client/draw/canvas/ExCanvas';
import ExTool from 'client/draw/canvas/ExTool';
import Client from 'client/draw/Client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { EndPayload, MovePayload, StartPayload } from 'types';

interface RCanvasProps {
  tool: ExTool;
  client?: Client;
}

interface RCanvasState {
  activeLayer: number;
  drawing: boolean;
  layers: ExCanvas[];
  refs: any[];
}

class RCanvas extends React.Component<RCanvasProps, RCanvasState> {
  private container: any;

  constructor(props: RCanvasProps) {
    super(props);

    this.state = {
      activeLayer: 0,
      drawing: false,
      layers: [new ExCanvas(800, 600)],
      refs: [],
    }

    this.container = React.createRef();
    if(this.props.client) {
      this.props.client.on('start', (data: StartPayload) => {
        this.startDraw(data.x, data.y, data.p, data.tool as ExBrush, data.uuid);
      }).on('move', (data: MovePayload) => {
        this.moveMany(data.positions, data.uuid);
      }).on('end', (data: EndPayload) => {
        this.endDraw(data.uuid);
      });
    }

    if(this.props.client) {
      this.props.client.on('load-stroke', (stroke) => {
        this.state.layers[0].ctx.completeStroke(stroke);
      });
    }

    document.addEventListener('mouseup', this.onMouseUp);
  }

  public componentDidMount() {
    const dom: Element = ReactDOM.findDOMNode(this) as Element;
    dom.appendChild(this.state.layers[0].canvas);
  }

  public normalize(x: number, y: number) {
    const xR = this.state.layers[0].width / this.container.current.offsetWidth;
    const yR = this.state.layers[0].height / this.container.current.offsetHeight;

    return {
      x: x * xR,
      y: y * yR
    };
  }

 public normalizeEvt(evt: any) {
  if(evt.type === "mousedown" || evt.type === "mousemove") {
      return this.normalize(evt.offsetX, evt.offsetY);
  } else {
    throw new Error('Unsupported Event');
    }
  }

  public start = (x: number, y: number, p: number): void => {
    const tool = this.props.tool;

    this.setState({
      drawing: false,
    }, () => {
      if(tool.name === "brush" || tool.name === "Eraser") {
      this.setState({
        drawing: true
      }, () => {
        this.startDraw(x, y, p, tool as ExBrush, 'local');
        if (this.props.client) { console.log('safsafgas'); this.props.client.sendStart(x, y, p, this.props.tool); }
      });
      }
    });
  }

  public startDraw(x: number, y: number, p: number, tool: ExBrush, id: string) {
    this.state.layers[this.state.activeLayer].ctx.beginStroke(tool, x, y, p, id);
    this.state.layers[this.state.activeLayer].activeStrokes.push(id);
    this.state.layers[this.state.activeLayer].stroke();
  }

  public move(x: number, y: number, p: number, id?: string) {
    this.state.layers[this.state.activeLayer].ctx.updateStroke(x, y, p, id || 'local');
    this.state.layers[this.state.activeLayer].stroke();
    if (this.props.client) { this.props.client.sendMove(x, y, .5); }
  }

  public moveMany(positions: Array<{x: number, y: number, p: number}>, id?: string) {
    for(const pos of positions) {
      this.state.layers[this.state.activeLayer].ctx.updateStroke(pos.x,pos. y, pos.p, id || 'local');
    }
    this.state.layers[this.state.activeLayer].stroke();
  }

  public end = () => {
    this.endDraw('local');
    this.forceUpdate();
    if (this.props.client) { this.props.client.sendEnd(); }
  }

  public endDraw(id: string) {
    // const layer = this.props.layers[this.state.activeLayer];
    this.state.layers[this.state.activeLayer].ctx.completeStrokeById(id);
    // addChange(layers[currentLayer].canvas.strokes['local'], client.clientId);
    for(let i = 0; i < this.state.layers[this.state.activeLayer].activeStrokes.length; i++) {
        if(this.state.layers[this.state.activeLayer].activeStrokes[i] === (id)) {
          this.state.layers[this.state.activeLayer].activeStrokes.splice(i, 1);
            break;
        }
    }
    this.state.layers[this.state.activeLayer].stroke();
  }

  public render() {
    return (
      <div
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.end}
        onMouseOver={this.onMouseEnter}
        onContextMenu={this.onContextMenu}
        ref={this.container}
        id="layers" />
    );
  }

  private onMouseDown = (evt: any) => {
    if(evt.button === 0) {
      const n = this.normalize(evt.nativeEvent.offsetX, evt.nativeEvent.offsetY);
      this.start(n.x, n.y, .5);
    }
  }

  private onMouseMove = (evt: any) => {
    if(this.state.drawing) {
      const n = this.normalize(evt.nativeEvent.offsetX, evt.nativeEvent.offsetY);
        window.getSelection().removeAllRanges()
        evt.preventDefault();
        this.move(n.x, n.y,.5);
    }
  }

  private onMouseUp = () => {
    if(this.state.drawing) {
      this.setState({
        drawing: false,
      }, this.end)
    }
  }

  private onMouseEnter = (evt: any) => {
    if(this.state.drawing) {
      const n = this.normalize(evt.nativeEvent.offsetX, evt.nativeEvent.offsetY);
      this.start(n.x, n.y, .5);
    }
  }

  private onContextMenu = (evt: any) => {
    evt.preventDefault();
    return false;
  }
}

export default RCanvas;
