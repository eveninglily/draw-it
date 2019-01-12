import 'client/draw/modes/css/GuessingGameLobby.css'
import * as React from 'react';
import { RoomData, User } from 'types';
import Client from '../Client';

interface GameLobbyProps {
  client: Client;
  startGame: any;
  roomInfo: RoomData;
  users: User[];
}

interface GameLobbyState {
  connected: boolean;
  usernameInput: string;
}

class GameLobby extends React.Component<GameLobbyProps, GameLobbyState> {
  constructor(props: any) {
    super(props);

    this.state = {
      connected: false,
      usernameInput: '',
    }
  }

  public render() {
    if(!this.state.connected) {
      return <div>Joining {this.props.roomInfo.name} Give a username:
      <input type='text' value={this.state.usernameInput} onChange={this.updateUsername}/>
      <input type='button' value='Join' onClick={this.join}/></div>;
    }

    const players = this.props.users.map(user => <li key=''>{user.name}</li>);

    return <div id="lobby">
      <h1>LOBBY</h1>
      <div>
        <h2>Players</h2>
        <ul>
          {players}
        </ul>
      </div>
      <input type='button' id='start-game' value='Start Game' onClick={this.props.startGame}/>
    </div>
  }

  private join = () => {
    this.props.client.meta.username = this.state.usernameInput;
    this.props.client.connect(this.props.roomInfo.id);
    this.setState({
      connected: true,
    });
  }

  private updateUsername = (evt: any) => {
    this.setState({
      usernameInput: evt.target.value
    })
  }
}

export default GameLobby;
