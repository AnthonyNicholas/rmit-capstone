import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import LineGraph from './LineGraph'
import Harry from './Harry.js'

class App extends Component {
	 
  render() {
    return (
      <div className="App">
      <div> Expenses Line Chart </div>
        <LineGraph/>
        <Harry/>
      </div>
    );
  }
}

export default App;
