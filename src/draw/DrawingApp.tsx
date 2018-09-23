import * as React from 'react';
import Toolbar from 'src/draw/components/Toolbar';

class DrawingApp extends React.Component {
  public render() {
    return (
      <div id="container">
        <Toolbar/>
        <div id="app-body" />
      </div>
    );
  }
}

export default DrawingApp;
