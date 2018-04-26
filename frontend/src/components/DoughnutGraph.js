import React, {Component} from 'react';
import {Doughnut} from 'react-chartjs-2';
import { Button,Grid,Row, Col,ButtonToolbar } from 'react-bootstrap';
import './Chart.css'
import {withRouter} from 'react-router-dom';

class DoughnutGraph extends Component {

  static defaultProps = {
    displayTitle:true,
    displayLegend: true,
    legendPosition:'right',
  }

  render(){
  const doughnutDataset = this.props.doughnutDataset;
    return(
      <div className="chart">
        <Doughnut
            data={this.props.doughnutDataset}
            options={{
              title:{
                display:this.props.displayTitle,
                text:'Total Expense',
                fontSize:25
              },
              legend:{
                display:this.props.displayLegend,
                position:this.props.legendPosition
              },
                cutoutPercentage:25,
                responsive: true,
            }}
          />
      </div>
    );
  }
}

export default DoughnutGraph;
