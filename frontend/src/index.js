import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import registerServiceWorker from './registerServiceWorker';

import App from './components/App';
import D3LineGraph from './components/D3LineGraph.js'

ReactDOM.render(
        <App />, 
        document.getElementById('root'));

registerServiceWorker();
