import 'client/draw/modes/components/css/BasicTools.css'
import * as React from 'react';
import { TwitterPicker } from 'react-color';

class BasicTools extends React.Component {
  public render() {
    return <div className='basicTools'>
        <TwitterPicker triangle='hide' />
    </div>
  }
}

export default BasicTools;
