import Client from 'client/draw/Client';
import 'client/draw/modes/components/css/Chat.css'
import * as React from 'react';
import { User } from 'types';

interface ChatProps {
  client: Client;
  user: User;
}

interface ChatState {
  messages: string[];
  textValue: string;
}

class Chat extends React.Component<ChatProps, ChatState> {
  constructor(props: any) {
    super(props);

    this.state = {
      messages: [],
      textValue: '',
    };

    this.props.client.on('chat', data => {
      const message: string = data.user.name + ': ' + data.message;
      this.setState({
        messages: this.state.messages.concat([message])
      })
    });
  }

  public render() {
    const messages = this.state.messages.map((message) => <li key=''>{message}</li>);

    return <div className='chat'>
        <ul className='messages'>{messages}</ul>
        <div>
          <input type='text' value={this.state.textValue} placeholder='Type your Guess' onChange={this.updateInputValue} onKeyPress={this.handleKeyPress}/>
        </div>
    </div>
  }

  private updateInputValue = (evt: any) => {
    this.setState({
      textValue: evt.target.value
    });
  }

  private handleKeyPress = (evt: any) => {
    if (evt.key === 'Enter') {
      if(this.state.textValue !== '') {
        this.props.client.sendChat(this.state.textValue, this.props.user);
        this.setState({
          textValue: ''
        });
      }
    }
  }
}

export default Chat;
