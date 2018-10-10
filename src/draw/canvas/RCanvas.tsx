import * as React from 'react';
import 'src/css/canvas.css';
import ExBrush from 'src/draw/canvas/ExBrush';

import * as ReactDOM from 'react-dom';
import ExCanvas from 'src/draw/canvas/ExCanvas';
import ExTool from 'src/draw/canvas/ExTool';

interface RCanvasProps {
  layers: ExCanvas[]
}

interface RCanvasState {
  activeLayer: number;
  drawing: boolean;
  tool: ExTool;
  refs: any[];
}

class RCanvas extends React.Component<RCanvasProps, RCanvasState> {
  private container: any;

  constructor(props: RCanvasProps) {
    super(props);

    const tool: ExBrush = new ExBrush('brush', 10, 'source-over', '#ff0000')

    this.state = {
      activeLayer: 0,
      drawing: false,
      refs: [],
      tool,
    }

    this.container = React.createRef();
  }

  public componentDidMount() {
    const dom: Element = ReactDOM.findDOMNode(this) as Element;
    dom.appendChild(this.props.layers[0].canvas);    
  }

  public normalize(x: number, y: number) {
    const xR = 1920 / this.container.current.offsetWidth;
    const yR = 1080 / this.container.current.offsetHeight;

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
    const tool = this.state.tool;
    
    this.setState({
      drawing: false,
    }, () => {
      if(tool.name === "brush" || tool.name === "Eraser") {
      this.setState({
        drawing: true
      }, () => {
        this.props.layers[this.state.activeLayer].ctx.beginStroke(tool as ExBrush, x, y, .5, 'local');
        this.props.layers[this.state.activeLayer].activeStrokes.push('local');
        this.props.layers[this.state.activeLayer].stroke();
      });
      }
    });
  }

  public move(x: number, y: number, p: number) {
    this.props.layers[this.state.activeLayer].ctx.updateStroke(x, y, p, 'local');
    this.props.layers[this.state.activeLayer].stroke();
  }

  public end() {
    // const layer = this.props.layers[this.state.activeLayer];
    
    this.props.layers[this.state.activeLayer].ctx.completeStrokeById('local');
    // addChange(layers[currentLayer].canvas.strokes['local'], client.clientId);
    for(let i = 0; i < this.props.layers[this.state.activeLayer].activeStrokes.length; i++) {
        if(this.props.layers[this.state.activeLayer].activeStrokes[i] === 'local') {
          this.props.layers[this.state.activeLayer].activeStrokes.splice(i, 1);
            break;
        }
    }
    this.props.layers[this.state.activeLayer].stroke();
    this.forceUpdate();
    // layers[currentLayer].updatePreview();
  }

  public render() {
    return (
      <div onMouseDown={this.onMouseDown} onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} ref={this.container} id="layers" />
    );
  }

  private onMouseDown = (evt: any) => {
    if(evt.button === 0) {
      const n = this.normalize(evt.nativeEvent.offSetX, evt.nativeEvent.offsetY);
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
}

export default RCanvas;
