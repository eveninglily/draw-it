import * as React from 'react';
import ExCanvas from './ExCanvas';

interface RCanvasProps {
  layers: ExCanvas[]
}

class RCanvas extends React.Component<RCanvasProps, {}> {
  public mergeLayers() {
    return "";
  }

  public render() {
    const x = this.calcSize();
    return (
      <canvas width={x[0]} height={x[1]}/>
    );
  }

  private calcSize() : [number, number] {
    return [1920, 1080];
  }
}

export default RCanvas;
