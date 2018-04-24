import React, {Component} from 'react';
import {Doughnut} from 'react-chartjs-2';

class DoughnutGraph2 extends Component {

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
              }
            }}
          />
      </div>
    );
  }
}

export default DoughnutGraph2;