import ExTool from 'client/draw/canvas/ExTool';
import 'client/draw/modes/components/css/BasicTools.css'
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import ExBrush from '../../canvas/ExBrush';

interface BasicToolProps {
  onToolUpdate: any;
  currentTool: ExTool;
}

class BasicTools extends React.Component<BasicToolProps, {}> {
  constructor (props: BasicToolProps) {
    super(props);
  }

  public render() {
    return <div className='basicTools'>
        <TwitterPicker triangle='hide' onChange={this.colorUpdate}/>
        SIZE | PENCIL | ERASER | BUCKET | CLEAR
    </div>
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

export default BasicTools;
