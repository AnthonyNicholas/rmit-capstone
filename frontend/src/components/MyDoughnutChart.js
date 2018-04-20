import React,{Component } from 'react';
import { Button,Grid,Row, Col,ButtonToolbar } from 'react-bootstrap';
var hostname = 'http://terra.bbqsuitcase.com:3001';
var DoughnutChart = require("react-chartjs").Doughnut;

class MyLineChart extends Component {

	render(){
		const transactions = this.props.transactions;
		return(
			<div>
				<DoughnutChart 
					data={transactions}
					chartOptions={doughnutChartOptions}
				/>
			</div>
			
		);
	}
}

export default MyLineChart;

let doughnutChartOptions = {
	//Boolean - Whether we should show a stroke on each segment
	segmentShowStroke : true,

	//String - The colour of each segment stroke
	segmentStrokeColor : "black",

	//Number - The width of each segment stroke
	segmentStrokeWidth : 1,

	//Number - The percentage of the chart that we cut out of the middle
	percentageInnerCutout : 40, // This is 0 for Pie charts

	//Number - Amount of animation steps
	animationSteps : 100,

	//String - Animation easing effect
	animationEasing : "easeOutBounce",

	//Boolean - Whether we animate the rotation of the Doughnut
	animateRotate : true,

	//Boolean - Whether we animate scaling the Doughnut from the centre
	animateScale : true,

	maintainAspectRatio: true,

	responsive: false,
	
	//String - A legend template
	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"><%if(segments[i].label){%><%=segments[i].label%><%}%></span></li><%}%></ul>"
	
}