import * as React from 'react';

interface PlayerListProps {
    players: string[];
    self: string;
}

class PlayerList extends React.Component<PlayerListProps, {}> {
  public render() {
    const listItems = this.props.players.map((player) => <li key=''>{player}</li>);

    return <div className='playerList'>
        <h1> Players </h1>
        <ul>
            {listItems}
        </ul>
    </div>
  }
}

export default PlayerList;
