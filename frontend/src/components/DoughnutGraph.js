import React,{Component } from 'react';
import { Button,Grid,Row, Col,ButtonToolbar } from 'react-bootstrap';
import './Chart.css'
import {withRouter} from 'react-router-dom';
var DoughnutChart = require("react-chartjs").Doughnut;


class DoughnutGraph extends Component {

	render(){
		const doughnutDataset = this.props.doughnutDataset;
		return(
				<DoughnutChart
					data={doughnutDataset}
					options={doughnutChartOptions}
				/>
			
		);
	}
}

export default DoughnutGraph;

let doughnutChartOptions = {
    //Boolean - Whether we should show a stroke on each segment
    segmentShowStroke : true,

    //String - The colour of each segment stroke
    segmentStrokeColor : "#fff",

    //Number - The width of each segment stroke
    segmentStrokeWidth : 0.5,

    //Number - The percentage of the chart that we cut out of the middle
    percentageInnerCutout : 30, // This is 0 for Pie charts

    //Number - Amount of animation steps
    animationSteps : 75,

    //Boolean - Whether we animate the rotation of the Doughnut
    animateRotate : true,

    //Boolean - Whether we animate scaling the Doughnut from the centre
    animateScale : false,

	maintainAspectRatio: true,

	responsive: true,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"><%if(segments[i].label){%><%=segments[i].label%><%}%></span></li><%}%></ul>"
}