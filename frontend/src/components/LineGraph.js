import React,{Component } from 'react';
import { Button,Grid,Row, Col,ButtonToolbar } from 'react-bootstrap';
import MyDoughnutChart from './MyDoughnutChart.js';
import {showLineChart, lineChartOptions} from './ProcessLineChart.js'
var LineChart = require("react-chartjs").Line;
var axios = require('axios');

var hostname = 'http://terra.bbqsuitcase.com:3001';

class LineGraph extends Component{

	constructor(props) {
		super(props);
	    this.state = {
	        accounts: [],
	        transactions: [],
	        doughnutExpenseFeed: [],
	        lineDataset: []
	    };
	 }

	componentDidMount(){
		this.loadData();
	}

	loadData(){
		var accountsArr = this.state.accounts;
		let uniqueAccounts;
		axios.get(hostname + '/yodlee_printTransactions')
	        .then((response) => {
	            return response.data;
	        })
	        //appending data into array 
	        .then(trans => {
		        //populating transactions data
	        	this.setState({transactions: trans});
	        });
	} 

	showChart(transactions){
		console.log(transactions);
		var feed = showLineChart(transactions);
		console.log(feed);
		this.setState({lineDataset: feed})
	}

	render(){
		return(
			<div>
				<Button 
		      		bsStyle="primary" 
		      		bsSize="large" 
		      		onClick={() => this.showChart(this.state.transactions)}
				>
				      		 show line chart
				</Button>
				<LineChart data={this.state.lineDataset}
					options={lineChartOptions} width="600" height="250" redraw/>
			</div>
			
		);
	}
}

export default LineGraph;





