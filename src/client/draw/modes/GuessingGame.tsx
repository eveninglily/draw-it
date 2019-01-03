import 'client/draw/modes/css/GuessingGame.css'
import * as React from 'react';


class GuessingGame extends React.Component<{}, {}> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <div>
        <div id="server-info">The fun house | INVITE | LEAVE</div>
        <div id="game-container">
          <div id="players">PLAYERS</div>
          <div id="middle">
            <div id="round-info"><span>Time</span> <span>Round n</span></div>
            CANVAS
            <div id="tools">
              TOOLS
            </div>
          </div>
          <div id="chat">CHAT</div>
        </div>
      </div>
    );
  }
}

export default GuessingGame;
