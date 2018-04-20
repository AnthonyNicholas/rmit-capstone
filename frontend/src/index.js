import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import registerServiceWorker from './registerServiceWorker';

mport App from './components/App';
import d3LineGraph from './components/d3LineGraph.js'

ReactDOM.render(
        [<App />, 
        <d3LineGraph />],
        document.getElementById('root'));

registerServiceWorker();
