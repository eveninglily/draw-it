import Icon from 'client/components/Icon';
import ExBrush from 'client/draw/canvas/ExBrush';
import ExTool from 'client/draw/canvas/ExTool';
import RCanvas from 'client/draw/canvas/RCanvas';
import Client from 'client/draw/Client';
import Chat from 'client/draw/modes/components/Chat';
import PlayerList from 'client/draw/modes/components/PlayerList';
import Toolbar from 'client/draw/modes/components/Toolbar';
import 'client/draw/modes/css/GuessingGame.css'
import * as React from 'react';
import { User } from 'types';

export interface GuessingGamePlayer extends User {
  score: number;
}

export interface GuessingGameRoundInfo {
  wordLength: number;
}

interface GuessingGameProps {
  serverName: string;
  totalRounds: number;
  client: Client;
  users: User[];
}

interface GuessingGameState {
  score: {[key: string]: number};
  self: GuessingGamePlayer;
  currentRound: number;
  currentTool: ExTool;
}

class GuessingGame extends React.Component<GuessingGameProps, GuessingGameState> {
  private tools: {[key: string]: ExTool};

  constructor(props: any) {
    super(props);

    this.tools = {
      'brush': new ExBrush('brush', 10, 'source-over', '#ff0000'),
      'eraser': new ExBrush('Eraser', 10, 'source-over', '#000000'),
    }

    this.state = {
      currentRound: 1,
      currentTool: this.tools.brush,
      score: {},
      self: {name: 'Evan', score: 400},

    };
  }

  public render() {
    const players = this.props.users.map((user: User) => ({name: user.name, score: this.state.score[user.name]}));

    return (
      <div id="game-container">
        <div id='left' className='col'>
          <div id='gamemodeGraphic'>
            GAMEMODE GRAPHIC
          </div>
          <div id="server-info">
            {this.props.serverName}
            <Icon id="server-link" icon="invite" isAction={true}/>
            <Icon id="server-settings" icon="settings" isAction={true}/>
          </div>
          <PlayerList players={players} self={this.state.self} />
        </div>
        <div id='middle' className='col'>
          <div id='word'> F _ C _</div>
          <div id='time'> 52 </div>
          <div id="canvas">
            <RCanvas tool={this.state.currentTool} client={this.props.client} />
          </div>
          <div id="tools">
            <Toolbar tools={this.tools} basicMode={true} currentTool={this.state.currentTool} onToolUpdate={this.onToolUpdate} />
          </div>
        </div>
        <div id='right' className='col'>
          <div id='round-info'>Round {this.state.currentRound} of {this.props.totalRounds}</div>
          <Chat user={this.state.self} client={this.props.client} />
        </div>
      </div>
    );
  }

  private onToolUpdate = (tool: ExTool) => {
    this.setState({
      currentTool: tool,
    });
  }
}

export default GuessingGame;