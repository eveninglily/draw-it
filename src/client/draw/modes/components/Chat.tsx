import 'client/draw/modes/components/css/Chat.css'
import * as React from 'react';

class Chat extends React.Component {
  public render() {
    return <div className='chat'>
        <h1> Chat </h1>
        <ul className='messages' />
        <div>
        <input type='text'/>
        </div>
    </div>
  }
}

export default Chat;
