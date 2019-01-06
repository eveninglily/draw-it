import ExCanvas from 'client/draw/canvas/ExCanvas';
import Client from 'client/draw/Client';
import * as Color from 'color';
import * as React from 'react';
import UserIcon from '../components/UserIcon';
import GuessingGame from './modes/GuessingGame';

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
      client: new Client('localhost:3001'),
      color,
      layers: [new ExCanvas(1000, 800)],
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
    return (
      <div id="drawing-app">
        <nav><span>BACK TO LOBBY</span><span>HELP | SETTINGS | <UserIcon/> Evan </span></nav>
          <GuessingGame serverName='The Fun House' />
      </div>

    );
  }
}

export default DrawingApp;
