import React,{ Component } from 'react';
import { Button,Grid,Row, Col,ButtonToolbar } from 'react-bootstrap';
import {showLineChart, lineChartOptions} from './ProcessLineChart.js'

var LineChart = require("react-chartjs").Line;


class LineGraph extends Component{

	render(){
		const lineDataset = this.props.lineDataset;
		return(
			<div>
				<LineChart data={lineDataset}
					options={lineChartOptions} width="600" height="250" redraw/>
			</div>
			
		);
	}
}

export default LineGraph;





