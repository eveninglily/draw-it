import 'css/global.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import DrawingApp from 'src/draw/DrawingApp';
import registerServiceWorker from 'src/registerServiceWorker';

ReactDOM.render(
  <DrawingApp />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
