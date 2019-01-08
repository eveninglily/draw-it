import 'client/draw/modes/components/css/PlayerList.css';
import { GuessingGamePlayer } from 'client/draw/modes/GuessingGame';
import * as React from 'react';

interface PlayerListProps {
    players: GuessingGamePlayer[];
    self: GuessingGamePlayer;
}

class PlayerList extends React.Component<PlayerListProps, {}> {
  public render() {
    const listItems = this.sortPlayers().map((player) => <li key=''>{player.name} - {player.score}</li>);

    return <div className='playerList'>
        <ul>
            {listItems}
        </ul>
    </div>
  }

  private sortPlayers(): GuessingGamePlayer[] {
    return this.props.players.sort((a, b) => a.score > b.score ? -1 : ((b.score > a.score) ? 1 : 0));
  }
}

export default PlayerList;
