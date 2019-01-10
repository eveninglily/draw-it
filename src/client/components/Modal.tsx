import 'client/css/Modal.css'
import * as React from 'react';

interface ModalProps {
  isVisible: boolean;
  onBackgroundClick: any;
}

class Modal extends React.Component<ModalProps, {}> {
  public render() {
    if(!this.props.isVisible) {
      return null;
    }
    return (
      <div className='modalBackground' onClick={this.props.onBackgroundClick}>
        <div className='modal'>{this.props.children}</div>;
      </div>
    );
  }
}

export default Modal;
