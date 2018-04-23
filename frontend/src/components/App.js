import React, {Component} from 'react';
import logo from '../logo.svg';
import '../App.css';
import LineGraph from './LineGraph.js'
import {showLineChart, lineChartOptions} from './ProcessLineChart.js'
import DoughnutGraph from './DoughnutGraph.js'
import {showDoughnutChart} from './ProcessDoughnutChart.js';
import {withRouter} from 'react-router-dom';
import {Button, Grid, Row, Col, ButtonToolbar, ButtonGroup} from 'react-bootstrap';
// import Harry from './Harry.js'

var axios = require('axios');
var hostname = 'http://terra.bbqsuitcase.com:3001';

class App extends Component {

    constructor(props) {
        super(props);
        this.handleDoughnutClick = this.handleDoughnutClick.bind(this);
        this.handleLineClick = this.handleLineClick.bind(this);
        this.state = {
            doughnutDataset: [],
            lineDataset: [],
            isOpen: false
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        axios.get(hostname + '/yodlee_printTransactions')
            .then((response) => {
                return response.data;
            })
            //appending data into array
            .then((trans) => {
                console.log(trans);

                var doughnutDataset = showDoughnutChart(trans);
                var lineDataset = showLineChart(trans);

                //populating transactions data
                this.setState({lineDataset: lineDataset});
                this.setState({doughnutDataset: doughnutDataset});
            });
    }

    nextPath(path) {
        this.props.history.push(path);
    }

    handleDoughnutClick() {
        this.setState(prevState => ({
            isOpen: "doughnut"
        }));
    }

    handleLineClick() {
        this.setState(prevState => ({
            isOpen: "line"
        }));
    }

    render() {
        return (
            <div className="App">

                <div class="rootHeader">
                    <h2>Analytics</h2>

                    <div id='root' class="rootWrapper">
                        <div class="sideButtonNav">
                            <div class="accountButtons">
                                <Button onClick={() => this.handleDoughnutClick()}>Expenditure</Button>
                                <Button onClick={() => this.handleLineClick()}>Income</Button>
                            </div>
                        </div>


                    <div class="buttonDoughnutWrapper">
                        {(this.state.isOpen === "line") ? (

                                <div class="doughnutWrapper" data-reactid=".5">
                                    <LineGraph lineDataset={this.state.lineDataset}/>
                                </div>
                            )
                            : this.state.isOpen === "doughnut" ? (
                                    <div class="doughnutWrapper" data-reactid=".5">
                                        <DoughnutGraph class="doughnutChart"
                                                       doughnutDataset={this.state.doughnutDataset}/>
                                    </div>
                                )
                                : null
                        }
                    </div>

                    </div>
                </div>
            </div>

        );
    }
}

export default App;
