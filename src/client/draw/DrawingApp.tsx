import ExCanvas from 'client/draw/canvas/ExCanvas';
import RCanvas from 'client/draw/canvas/RCanvas';
import * as React from 'react';
import Toolbar from './ui/Toolbar';

interface DrawingAppState {
  layers: any[];
  selectedTool: string;
}

class DrawingApp extends React.Component<{}, DrawingAppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      layers: [new ExCanvas()],
      selectedTool: 'brush',
    }
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
        <div id='colorwheel' />
        <div id='tool-meta' />
        <div id='layer-options' />
        <div id='canvas'>
          <RCanvas layers={this.state.layers} />
        </div>
      </div>
    );
  }
}

export default DrawingApp;
