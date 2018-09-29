import * as React from 'react';
import ExCanvas from 'src/draw/canvas/ExCanvas';
import RCanvas from 'src/draw/canvas/RCanvas';
import Toolbar from 'src/draw/components/Toolbar';

interface DrawingAppState {
  layers: any[];
}

class DrawingApp extends React.Component<{}, DrawingAppState> {
  constructor(props: any) {
    super(props);
    
    this.state = {
      layers: [new ExCanvas()],
    }
  }

  public render() {
    return (
      <div id="container">
        <Toolbar/>
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
