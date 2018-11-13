import ExCanvas from 'client/draw/canvas/ExCanvas';
import RCanvas from 'client/draw/canvas/RCanvas';
import Client from 'client/draw/Client';
import ColorPicker from 'client/draw/components/ColorPicker';
import Toolbar from 'client/draw/ui/Toolbar';
import * as React from 'react';

interface DrawingAppState {
  layers: any[];
  selectedTool: string;
  client: Client;
}

class DrawingApp extends React.Component<{}, DrawingAppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      client: new Client('localhost:3001'),
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

  public render() {
    return (
      <div id="container">
        <Toolbar selectedTool={this.state.selectedTool} updateTool={this.selectTool}/>
        <div id='colorwheel'>
          <ColorPicker/>
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
