import * as React from 'react';
import 'src/css/canvas.css';
import RCanvas from 'src/draw/canvas/RCanvas';
import Toolbar from 'src/draw/components/Toolbar';

class DrawingApp extends React.Component {
  public render() {
    return (
      <div id="container">
        <Toolbar/>
        <div id='colorwheel' />
        <div id='tool-meta' />
        <div id='layers' />
        <div id='canvas'>
          <RCanvas layers={[]} />
        </div>
      </div>
    );
  }
}

export default DrawingApp;
