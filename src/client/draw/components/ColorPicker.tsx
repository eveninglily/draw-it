import 'client/draw/components/css/colorpicker.css';
import * as Color from 'color';
import * as React from 'react';

interface SaturationComponentState {
  active: boolean,
  saturation: number,
  brightness: number,
  x: number,
  y: number,
}

interface SliderComponentState {
  active: boolean,
  value: number,
  x: number,
  y: number,
}

interface ColorPickerState {
  color: Color,
  hue: SliderComponentState,
  satuartion: SaturationComponentState,
  alpha: SliderComponentState,
}

interface ColorPickerProps {
  onColorChange: (color: Color) => void;
}

export default class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>{
  private saturationDiv: any;

  constructor(props: any) {
    super(props);

    const hue: SliderComponentState = {
      active: false,
      value: 0,
      x: 0,
      y: 0,
    }

    const satuartion: SaturationComponentState = {
      active: false,
      brightness: 1,
      saturation: 1,
      x: 0,
      y: 0,
    }

    const alpha: SliderComponentState = {
      active: false,
      value: 1,
      x: 0,
      y: 0,
    }

    this.state = {
      alpha,
      color: new Color('#ff0000', 'hex'),
      hue,
      satuartion,
    };

    this.saturationDiv = React.createRef();

    document.addEventListener('mousemove', this.onSaturationMouseMove)
    document.addEventListener('mouseup', this.onSaturationMouseUp)

    document.addEventListener('mousemove', this.onAlphaMouseMove)
    document.addEventListener('mouseup', this.onAlphaMouseUp)

    document.addEventListener('mousemove', this.onHueMouseMove)
    document.addEventListener('mouseup', this.onHueMouseUp)
  }

  public render() {
    const colorStyle = {
      background: `hsl(${this.getColor().hue()},100%, 50%)`,
    }

    const alphaColorStyle = {
      background: `linear-gradient(to right, rgba(255, 255, 255, 0) 0%, hsl(0,100%, 50%) 100%)`,
    }

    const satuartionPickerStyle = {
      left: this.state.satuartion.x,
      top: this.state.satuartion.y,
    }

    const hueSelectorStyle = {
      left: this.state.hue.x,
    };
    const alphaSelectorStyle = {
      left: this.state.alpha.x,
    };

    return (
    <div className='colorpicker-container'>
      <div className='saturation' style={colorStyle} onMouseDown={this.onSaturationMouseDown} ref={this.saturationDiv}>
        <div className='gradient-white'>
          <div className='gradient-black'>
            <div className='saturation-spacer'>
              <div className='saturation-selector' style={satuartionPickerStyle}/>
            </div>
          </div>
        </div>
      </div>
      <div className='hue' onMouseDown={this.onHueMouseDown}>
        <div className='hue-vertical'>
          <div className='hue-horizontal'>
            <div className='hue-spacer'>
             <div className='hue-selector' style={hueSelectorStyle} />
            </div>
          </div>
        </div>
      </div>
      <div className='alpha' onMouseDown={this.onAlphaMouseDown}>
        <div style={alphaColorStyle}>
          <div className='hue-spacer'>
            <div className='alpha-selector' style={alphaSelectorStyle} />
          </div>
        </div>
      </div>
    </div>);
  }

  private onSaturationMouseDown = () => {
    this.setState({
      satuartion: {...this.state.satuartion, active: true}
    });
  }

  private onSaturationMouseMove = (evt: MouseEvent) => {
    if(this.state.satuartion.active) {
      // Makes sure it doesn't go past the confines
      const offset = 4;
      const x = Math.min(Math.max(evt.pageX - this.saturationDiv.current.offsetLeft - offset, -offset), this.saturationDiv.current.offsetWidth - offset);
      const y = Math.min(Math.max(evt.pageY - this.saturationDiv.current.offsetTop - offset, -offset), this.saturationDiv.current.offsetHeight - offset);

      const saturation = 100 * (x + offset) / this.saturationDiv.current.offsetWidth;
      const brightness = -(((y + offset) * 100) / this.saturationDiv.current.offsetHeight) + 100;
console.log(brightness);
      this.setState({
        satuartion: {...this.state.satuartion, x, y, saturation, brightness}
      }, () => {
        this.setState({color: this.getColor()}, () => {this.props.onColorChange(this.state.color)})
      });
    }
  }

  private onSaturationMouseUp = () => {
    this.setState({
      satuartion: {...this.state.satuartion, active: false}
    });
  }

  private onAlphaMouseDown = () => {
    this.setState({
      alpha: {...this.state.alpha, active: true}
    });
  };

  private onAlphaMouseMove = (evt: MouseEvent) => {
    if(this.state.alpha.active) {
      const offset = 3;
      const x = Math.min(Math.max(evt.pageX - this.saturationDiv.current.offsetLeft - offset, -offset), this.saturationDiv.current.offsetWidth - offset);
      const value = (x + offset) / this.saturationDiv.current.offsetWidth;
      this.setState({
        alpha: {...this.state.alpha, x, value}
      }, () => {
        this.setState({color: this.getColor()}, () => {this.props.onColorChange(this.state.color)})
      });
    }
  };

  private onAlphaMouseUp = () => {
    this.setState({
      alpha: {...this.state.alpha, active: false}
    });
  };

  private onHueMouseDown = () => {
    this.setState({
      hue: {...this.state.hue, active: true}
    });
  };

  private onHueMouseMove = (evt: MouseEvent) => {
    if(this.state.hue.active) {
      const offset = 3;
      const x = Math.min(Math.max(evt.pageX - this.saturationDiv.current.offsetLeft - offset, -offset), this.saturationDiv.current.offsetWidth - offset);
      const value = 360 * (x + offset) / this.saturationDiv.current.offsetWidth;
      this.setState({
        hue: {...this.state.hue, x, value}
      }, () => {
        this.setState({color: this.getColor()}, () => {this.props.onColorChange(this.state.color)})
      });
    }
  };

  private onHueMouseUp = () => {
    this.setState({
      hue: {...this.state.hue, active: false}
    });
  };

  private getColor = (): Color => {
    // console.log('h: ' + this.state.hue.value);
    // console.log('s: ' + this.state.satuartion.saturation);
    // console.log('b:' + this.state.satuartion.brightness);
    const l = .5 * (this.state.satuartion.brightness / 100) * (2 - (this.state.satuartion.saturation / 100));
    const s = (this.state.satuartion.brightness * this.state.satuartion.saturation) / (1 - Math.abs(2 * l - 1))
    const c = new Color({h: this.state.hue.value, s, l}, 'hsl');
    console.log(c.hex());
    return new Color({h: this.state.hue.value, s: s * 100, l: l * 100}, 'hsl');
  }
}