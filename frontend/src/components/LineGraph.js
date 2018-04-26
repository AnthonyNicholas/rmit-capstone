import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';
import {lineChartOptions } from './ProcessLineChart.js'


class LineGraph extends Component {

  static defaultProps = {
    displayTitle:true,
    displayLegend: true,
    legendPosition:'right',
  }

  render(){
  const lineDataset = this.props.lineDataset;
    return(
      <div className="chart">
        <Line
            data={this.props.lineDataset}
            options={lineChartOptions}
          />
      </div>
    );
  }
}

export default LineGraph;