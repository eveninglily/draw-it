import * as React from 'react';

interface ModalState {
  isVisible: boolean;
}

class Modal extends React.Component<{}, ModalState> {
  public dismiss(): void {
    this.setState({
      isVisible: false,
    })
  }

  public render() {
    return (
      <div className='modalBackground' onClick={this.dismiss}>
        <div className='modal'>{this.props.children}</div>;
      </div>
    );
  }
}

export default Modal;
