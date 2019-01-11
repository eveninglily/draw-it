import Icon from 'client/components/Icon';
import Modal from 'client/components/Modal';
import UserIcon from 'client/components/UserIcon';
import Client from 'client/draw/Client';
import GuessingGame from 'client/draw/modes/GuessingGame';
import * as React from 'react';
import { RoomData } from 'types';
import GameLobby from './modes/GameLobby';

enum AppState {
  CONNECTING,
  JOINING,
  LOBBY,
  GAME,
  OFFLINE
}

interface DrawingAppState {
  selectedTool: string;
  client: Client;
  settingsModal: boolean;
  state: AppState;
  roomInfo: RoomData|null;
}

class DrawingApp extends React.Component<{}, DrawingAppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      client: new Client('localhost:3001'),
      roomInfo: null,
      selectedTool: 'brush',
      settingsModal: false,
      state: AppState.CONNECTING,
    }
  }

  public componentDidMount(): void {
    this.state.client.on('server-info', data => {
      this.setState({
        roomInfo: data,
        state: AppState.JOINING
      });
    });

    this.state.client.getRoomInfo('testRoom')
  }

  public render() {
    const user = {
      name: 'Evan'
    }

    return (
      <div id="drawing-app">
        <nav>
          <span><Icon id='back' icon='back' isAction={true} /> BACK TO LOBBY</span>
          <span>HELP | <Icon id='settings' icon='settings' isAction={true} clickHandler={this.toggleSettings}/> <UserIcon user={user}/> Evan </span></nav>
          {this.renderInner()}
          <Modal isVisible={this.state.settingsModal} onBackgroundClick={this.toggleSettings}>Test</Modal>
      </div>

    );
  }

  private renderInner() {
    switch(this.state.state) {
      case AppState.CONNECTING: {
        return <div><h1>Connecting...</h1></div>;
      }

      case AppState.JOINING:
      case AppState.LOBBY: {
        if(this.state.roomInfo) {
          return <GameLobby roomInfo={this.state.roomInfo} client={this.state.client} startGame={this.startGame}/>;
        } else {
          return <div>Error</div>;
        }

      }

      case AppState.GAME: {
        return <GuessingGame client={this.state.client} serverName='The Fun House' totalRounds={5} />;
      }

      case AppState.OFFLINE: {
        return <div />;
      }

    }
  }

  private startGame = () => {
    // TOOD: Replace this with client call
    this.setState({
      state: AppState.GAME
    })
  }

  private toggleSettings = () => {
    this.setState({settingsModal: !this.state.settingsModal});
  }
}

export default DrawingApp;
