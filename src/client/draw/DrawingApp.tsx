import Icon from 'client/components/Icon';
import Modal from 'client/components/Modal';
import UserIcon from 'client/components/UserIcon';
import Client from 'client/draw/Client';
import GuessingGame from 'client/draw/modes/GuessingGame';
import * as Color from 'color';
import * as React from 'react';

interface DrawingAppState {
  selectedTool: string;
  client: Client;
  color: Color;
  settingsModal: boolean;
}

class DrawingApp extends React.Component<{}, DrawingAppState> {
  constructor(props: any) {
    super(props);

    const color = new Color({r: 255, b: 0, g: 0});

    this.state = {
      client: new Client('localhost:3001'),
      color,
      selectedTool: 'brush',
      settingsModal: false,
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
    const user = {
      name: 'Evan'
    }

    return (
      <div id="drawing-app">
        <nav>
          <span><Icon id='back' icon='back' isAction={true} /> BACK TO LOBBY</span>
          <span>HELP | <Icon id='settings' icon='settings' isAction={true} clickHandler={this.onSettings}/> <UserIcon user={user}/> Evan </span></nav>
          <GuessingGame client={this.state.client} serverName='The Fun House' totalRounds={5} />
          <Modal isVisible={this.state.settingsModal} onBackgroundClick={this.onSettingsClose}>Test</Modal>
      </div>

    );
  }

  private onSettings = () => {
    this.setState({settingsModal: true});
  }

  private onSettingsClose = () => {
    this.setState({settingsModal: false});
  }
}

export default DrawingApp;
