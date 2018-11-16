import 'client/draw/components/css/colorpicker.css';
import * as Color from 'color';
import * as React from 'react';

interface ColorPickerState {
    color: Color,
    hue: number,
    satuartion: number,
    lightness: number,
}

export default class ColorPicker extends React.Component<{}, ColorPickerState>{
  constructor(props: any) {
    super(props);

    this.setState({
      color: new Color('#ff0000', 'hex'),
      hue: 0,
      lightness: 1,
      satuartion: 1,
    })
  }

  public render() {
    const colorStyle = {
      background: `hsl(0,100%, 50%)`,
    }

    return (
    <div className='color-container'>
      <div style={colorStyle}>
        <div className='gradient-white'>
          <div className='gradient-black'>
            <div className='color-spacer'/>
          </div>
        </div>
      </div>
      <div className='hue'>
        <div className='hue-vertical'>
          <div className='hue-horizontal'>
            <div className='hue-spacer' />
          </div>
        </div>
      </div>
    </div>);
  }
}