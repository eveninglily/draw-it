import 'client/css/global.css';
import DrawingApp from 'client/draw/DrawingApp';
import registerServiceWorker from 'client/registerServiceWorker';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

ReactDOM.render(
  <DrawingApp />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
