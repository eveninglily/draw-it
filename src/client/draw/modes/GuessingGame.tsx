import ExBrush from 'client/draw/canvas/ExBrush';
import Client from 'client/draw/Client';
import Chat from 'client/draw/modes/components/Chat';
import PlayerList from 'client/draw/modes/components/PlayerList';
import 'client/draw/modes/css/GuessingGame.css'
import * as React from 'react';
import { User } from 'types';
import ExTool from '../canvas/ExTool';
import RCanvas from '../canvas/RCanvas';
import BasicTools from './components/BasicTools';

export interface GuessingGamePlayer extends User {
  score: number;
}

interface GuessingGameProps {
  serverName: string;
  totalRounds: number;
  client: Client;
}

interface GuessingGameState {
  players: GuessingGamePlayer[];
  self: GuessingGamePlayer;
  currentRound: number;
  currentTool: ExTool;
}

class GuessingGame extends React.Component<GuessingGameProps, GuessingGameState> {
  constructor(props: any) {
    super(props);

    const tool: ExBrush = new ExBrush('brush', 10, 'source-over', '#ff0000')

    this.state = {
      currentRound: 1,
      currentTool: tool,
      players: [
        {name: 'Andy', score: 200},
        {name: 'Zarin', score: 0},
        {name: 'Evan', score: 400}
      ],
      self: {name: 'Evan', score: 400},

    };
  }

  public render() {
    return (
      <div id="game-container">
        <div id='left' className='col'>
          <div id='gamemodeGraphic'>
            GAMEMODE GRAPHIC
          </div>
          <div id="server-info">{this.props.serverName} | INVITE | SETTINGS</div>
          <PlayerList players={this.state.players} self={this.state.self} />
        </div>
        <div id='middle' className='col'>
          <div id='word'> F _ C _</div>
          <div id='time'> 52 </div>
          <div id="canvas">
            <RCanvas tool={this.state.currentTool} client={this.props.client} />
          </div>
          <div id="tools">
            <BasicTools currentTool={this.state.currentTool} onToolUpdate={this.onToolUpdate} />
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