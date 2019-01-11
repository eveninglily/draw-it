import Icon from 'client/components/Icon';
import 'client/css/toolbar.css'
import ExBrush from 'client/draw/canvas/ExBrush';
import ExTool from 'client/draw/canvas/ExTool';
import 'client/draw/modes/components/css/Toolbar.css'
import * as React from 'react';
import { TwitterPicker } from 'react-color';

interface ToolbarProps {
  basicMode: boolean;
  currentTool: ExTool;
  tools: {[key: string] : ExTool};
  onToolUpdate: (tool: ExTool) => void;
}

class Toolbar extends React.Component<ToolbarProps, {}> {

  constructor(props: any) {
    super(props);
  }

  public render() {
    if(this.props.basicMode) {
      return this.renderBasic();
    }

    return <div/>
    /*return (
      <div id="toolbar">
        <Icon icon='back' id='back' isAction={true} clickHandler={this.handleEvt}/>
        <Icon icon='brush' id='brush' isAction={false} dataOptions='brush-options' clickHandler={this.handleEvt} isSelected={this.props.selectedTool === 'brush'}/>
        <Icon icon='eraser' id='eraser' isAction={false} dataOptions='eraser-options' clickHandler={this.handleEvt} isSelected={this.props.selectedTool === 'eraser'}/>
        <Icon icon='eyedropper' id='eyedropper' isAction={false} dataOptions='eyedropper-options' clickHandler={this.handleEvt} isSelected={this.props.selectedTool === 'eyedropper'}/>
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
    );*/
  }

  private renderBasic() {
    return (
      <div className='basicTools'>
        <TwitterPicker triangle='hide' onChange={this.colorUpdate}/>
        SIZE |
        <Icon icon='brush' id='brush' isAction={false} dataOptions='brush-options' clickHandler={this.handleEvt} isSelected={this.props.currentTool.name === 'brush'}/>
        <Icon icon='eraser' id='eraser' isAction={false} dataOptions='eraser-options' clickHandler={this.handleEvt} isSelected={this.props.currentTool.name=== 'eraser'}/>
        <Icon icon='clear' id='clear' isAction={true} />
      </div>
    )
  }

  private handleEvt = (evt: React.MouseEvent<any>, elem: Icon) => {
    if(!elem.props.isAction) {
      this.props.onToolUpdate(this.props.tools[elem.props.id]);
    }
  }


  private colorUpdate = (evt: any) => {
    if(this.props.currentTool instanceof ExBrush) {
      this.props.currentTool.color = evt.hex;
      this.onToolUpdate();
    }
  }

  private onToolUpdate = () => {
    this.props.onToolUpdate(this.props.currentTool);
  }
}

export default Toolbar;
