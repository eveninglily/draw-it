import ExCanvas from 'client/draw/canvas/ExCanvas';
import Client from 'client/draw/Client';
import Chat from 'client/draw/modes/components/Chat';
import PlayerList from 'client/draw/modes/components/PlayerList';
import 'client/draw/modes/css/GuessingGame.css'
import * as React from 'react';
import { User } from 'types';
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
}

class GuessingGame extends React.Component<GuessingGameProps, GuessingGameState> {
  constructor(props: any) {
    super(props);

    this.state = {
      currentRound: 1,
      players: [
        {name: 'Andy', score: 200},
        {name: 'Zarin', score: 0},
        {name: 'Evan', score: 400}
      ],
      self: {name: 'Evan', score: 400}
    };
  }

  public render() {
    const currentPlayer = 'Evan';

    return (
      <div id="game-container">
        <div id='left' className='col'>
          <div id='gamemodeGraphic'>
            GAMEMODE GRAPHIC
          </div>
          <div id="server-info">{this.props.serverName} | INVITE | SETTINGS</div>
          <PlayerList players={this.state.players} self={currentPlayer} />
        </div>
        <div id='middle' className='col'>
          <div id='word'> F _ C _</div>
          <div id='time'> 52 </div>
          <div id="canvas"><RCanvas layers={[new ExCanvas(800, 600)]}/></div>
            <div id="tools">
              <BasicTools />
            </div>
        </div>
        <div id='right' className='col'>
          <div id='round-info'>Round {this.state.currentRound} of {this.props.totalRounds}</div>
          <Chat user={this.state.self} client={this.props.client} />
        </div>
      </div>
    );
  }
}

export default GuessingGame;