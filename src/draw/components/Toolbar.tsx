import 'css/toolbar.css'
import * as React from 'react';
import Icon from 'src/draw/components/Icon';

interface ToolbarState{
  selectedTool: string;
}

class Toolbar extends React.Component<{}, ToolbarState> {
  constructor(props: any) {
    super(props);

    this.state = {
      selectedTool: 'brush',
    }
  }
  
  public render() {
    return (
      <div id="toolbar">
        <Icon icon='back' id='back' isAction={true} clickHandler={this.handleEvt}/>
        <Icon icon='brush' id='brush' isAction={false} dataOptions='brush-options' clickHandler={this.handleEvt} isSelected={this.state.selectedTool === 'brush'}/>
        <Icon icon='eraser' id='eraser' isAction={false} dataOptions='eraser-options' clickHandler={this.handleEvt} isSelected={this.state.selectedTool === 'eraser'}/>
        <Icon icon='eyedropper' id='eyedropper' isAction={false} dataOptions='eyedropper-options' clickHandler={this.handleEvt} isSelected={this.state.selectedTool === 'eyedropper'}/>
        <Icon icon='clear' id='clear' isAction={true} clickHandler={this.handleEvt}/>
        <div id='toolbar-actions'>
          <Icon icon='undo' id='undo' isAction={true} clickHandler={this.handleEvt}/>
          <Icon icon='redo' id='redo' isAction={true} clickHandler={this.handleEvt}/>
          <Icon icon='invite' id='invite' isAction={true} clickHandler={this.handleEvt}/>
          <Icon icon='save' id='save' isAction={true} clickHandler={this.handleEvt}/>
          <label>
            <Icon icon='load' id='load' isAction={true} clickHandler={this.handleEvt}/>
            <input id="load-file" type='file' accept='.json' />
          </label>
          <Icon icon='settings' id='settings' isAction={true} clickHandler={this.handleEvt}/>
        </div>
      </div>
    );
  }
  
  private handleEvt = (evt: React.MouseEvent<any>, elem: Icon) => {
    if(!elem.props.isAction) {
      this.setState({
        selectedTool: elem.props.id
      });
    }
  }

}

export default Toolbar;
