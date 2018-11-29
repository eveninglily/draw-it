import ExCanvas from 'client/draw/canvas/ExCanvas';
import RCanvas from 'client/draw/canvas/RCanvas';
import Client from 'client/draw/Client';
import ColorPicker from 'client/draw/components/ColorPicker';
import Toolbar from 'client/draw/ui/Toolbar';
import * as Color from 'color';
import * as React from 'react';

interface DrawingAppState {
  layers: any[];
  selectedTool: string;
  client: Client;
  color: Color;
}

class DrawingApp extends React.Component<{}, DrawingAppState> {
  constructor(props: any) {
    super(props);

    const color = new Color({r: 255, b: 0, g: 0});

    this.state = {
      client: new Client('draw-it.io:3001'),
      color,
      layers: [new ExCanvas()],
      selectedTool: 'brush',
    }
  }

  public componentDidMount(): void {
    this.state.client.connect('testRoom')
  }

  public selectTool = (tool: string): void => {
    this.setState({
      selectedTool: tool,
    });
  }

  public onColorChange = (color: Color) => {
    this.setState({color});
  }

  public render() {
    const st = {
      background: this.state.color.hex(),
    }
    return (
      <div id="container" style={st}>
        <Toolbar selectedTool={this.state.selectedTool} updateTool={this.selectTool}/>
        <div id='colorwheel'>
          <ColorPicker onColorChange={this.onColorChange}/>
        </div>
        <div id='tool-meta' />
        <div id='layer-options' />
        <div id='canvas'>
          <RCanvas layers={this.state.layers} client={this.state.client}/>
        </div>
      </div>
    );
  }
}

export default DrawingApp;
