import ExCanvas from 'client/draw/canvas/ExCanvas';
import Chat from 'client/draw/modes/components/Chat';
import PlayerList from 'client/draw/modes/components/PlayerList';
import 'client/draw/modes/css/GuessingGame.css'
import * as React from 'react';
import RCanvas from '../canvas/RCanvas';
import BasicTools from './components/BasicTools';

interface GuessingGameProps {
  serverName: string;
}

class GuessingGame extends React.Component<GuessingGameProps, {}> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    const players = ['Evan', 'Andy', 'Zarin'];
    const currentPlayer = 'Evan';

    return (
      <div id="game-container">
        <div id='left' className='col'>
          <div id='gamemodeGraphic'>
            GAMEMODE GRAPHIC
          </div>
          <div id="server-info">{this.props.serverName} | INVITE | SETTINGS</div>
          <PlayerList players={players} self={currentPlayer} />
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
          <div> ROUND 2 OF 5</div>
          <Chat />
        </div>
      </div>
    );
  }
}

export default GuessingGame;