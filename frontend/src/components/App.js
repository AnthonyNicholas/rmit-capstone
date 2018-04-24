import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import d3LineGraph from './d3LineGraph'
import LineGraph from './LineGraph.js'
import {showLineChart, lineChartOptions} from './ProcessLineChart.js'
import DoughnutGraph from './DoughnutGraph.js'
import {produceDataForDoughnutChart} from './ProcessDoughnutChart.js'
import {showDoughnutChart} from './ProcessDoughnutChart.js';

var axios = require('axios');
var hostname = 'http://terra.bbqsuitcase.com:3001';

class App extends Component {
   
  constructor(props) {
    super(props);
      this.state = {
          doughnutDataset: [],
          lineDataset: []
      };
   }

  componentDidMount(){
    this.loadData();
  }

  loadData(){
    axios.get(hostname + '/yodlee_printTransactions')
          .then((response) => {
              return response.data;
          })
          //appending data into array 
          .then((trans) => {
            console.log(trans);

            var doughnutDataset = produceDataForDoughnutChart(trans);
            var lineDataset = showLineChart(trans);
             
            //populating transactions data
            this.setState({lineDataset: lineDataset});
            this.setState({doughnutDataset: doughnutDataset});
          });
  }

  render() {
    return (
      <div className="App">
      <div> Expenses Line Chart </div>
        <LineGraph lineDataset={this.state.lineDataset} legendPosition="bottom" redraw/>
        <DoughnutGraph doughnutDataset={ this.state.doughnutDataset } legendPosition="bottom" redraw />
        <d3LineGraph/>  
      </div>
    );
  }
}

export default App;
