import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
var axios = require('axios');
var d3 = require('d3');


var hostname = 'http://terra.bbqsuitcase.com:3001';
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
var baselineDate = new Date(2013, 10, 1);

var transactionRange = [0, 1000]




function daysSinceBaseline(date){
    return Math.round(Math.abs((date.getTime() - baselineDate.getTime())/(oneDay)));
}

function getDateFromTransaction(transaction){
    var transactionDate;

    if (!transaction.date){
        transactionDate = new Date(2010,1,1);
    }else{
        var dateArr = transaction.date.split("-");
        transactionDate = new Date(dateArr[0], dateArr[1], dateArr[2]);
    }
    //console.log(transactionDate);

    return transactionDate;

}


class AccountTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        accounts: [],
    };
  }

  componentDidMount(){
    axios.get(hostname + '/yodlee_printAccounts')
            .then((response) => {
                //console.log(response.data[0].data);
                return response.data[0].data.account;
            })
            .then(accounts => {
                let accountList = accounts.map((account) => {
                    return(
                        <div>
                            <div> {account.accountName} </div>  
                            <div> {account.balance.amount} </div>
                            <div> {account.accountType} </div>
                            <div> {account.accountNumber} </div>
                            <div> {account.accountStatus} </div>
                            <div> {account.CONTAINER} </div>
                            <div> {account.providerName} </div> 
                            <br/>
                        </div>
                    )
                })  

                this.setState({accounts: accountList});
                //console.log("state", this.state.accounts);
            })
  }

  render() {
    return (

        <div>
            <div>
                <svg height="100" width="100">
                    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
                    Sorry, your browser does not support inline SVG.  
                </svg>
            </div>

            <div className="accountTable">
                {this.state.accounts}
            </div>
        </div>
    );
  }
}


/*
 *Gets transactions from /yodlee_printTransactions api call.
 *
 */

class TransactionTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        transactions: [],
    };
  }

    
  // Function which gets data from /yodlee_printTransactions and loads it into state.transactions

  componentDidMount(){
    axios.get(hostname + '/yodlee_printTransactions')
            .then((response) => {
                //console.log(response.data[0].data);
                return response.data[0].data;
            })
            .then(transactions => {
                let transactionList = transactions.map((transaction) => {
                    var transactionDate;

                    if (!transaction.date){
                        transactionDate = new Date(2010,1,1);
                    }else{
                        var dateArr = transaction.date.split("-");
                        transactionDate = new Date(dateArr[0], dateArr[1], dateArr[2]);
                    }
                  
                    var days = daysSinceBaseline(transactionDate);

                    //console.log(days);
                    return(
                             
                        <circle cx={days * 12} cy="100" r={Math.log(transaction.amount.amount)*3} stroke="black" stroke-width="3" fill="red" />
                        
                        /*</div>*/
                    )
                })  

                this.setState({transactions: transactionList});
                //console.log("state", this.state.transactions);
            })
            
  }

  render() {
    return (
            <div className="transactionTable">
                <svg height="400" width="1000">
                    {this.state.transactions}
                </svg>
            </div>
    );
  }
}

/*
 * Responsive line chart based on https://bl.ocks.org/kdubbels/c445744cd3ffa18a5bb17ac8ad70017e
 */


function getChartSize(el) {
    let width = .9*parseInt(el.style('width'), 10);
    let height = .7*parseInt(width*7/9, 10);
    return  [width,height];
}

/* The x axis shows the date of each transaction
*/

class AxisX extends React.Component{
    render() {
        var data = this.props.data;
        var margin = this.props.margin;
        var height = this.props.height - margin.top - margin.bottom;
        var width = this.props.width  - margin.left - margin.right;

        var x = d3.scaleTime()
            .domain([new Date(2013, 9, 1, 0), new Date(2014, 6, 1, 2)]) 
            .range([0, width]);

        var xAxis = d3.axisBottom(x);

        //x.domain(d3.extent(data, function(d) { return d.date; }));

        d3.select(".x").attr("transform", "translate(0," + height + ")").call(xAxis);

        return(
            <g className="x axis"></g>
        );
    }
}

/* The y axis shows the size in dollars of each transaction
*/

class AxisY extends React.Component{
    render() {
        var data = this.props.data;
        var margin = this.props.margin;
        var height = this.props.height - margin.top - margin.bottom;
        var width = this.props.width  - margin.left - margin.right;

        var y = d3.scaleLinear()
            .domain(transactionRange) 
            .range([height, 0]); //min and max are inverted due to browser axis starting from zero at top left rather than bottom left

        var yAxis = d3.axisLeft(y);

        d3.select(".y").call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Size of Transaction ($)");

            return(
                <g className="y axis"></g>
            );
        }
}

/* The line maps the transaction data on the graph
*/



class Line extends React.Component{
    render() {
        var data = this.props.data;
        var margin = this.props.margin;
        var height = this.props.height - margin.top - margin.bottom;
        var width = this.props.width  - margin.left - margin.right;

        

        var x = d3.scaleTime()
            .domain([new Date(2013, 9, 1, 0), new Date(2014, 6, 1, 2)]) 
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain(transactionRange) 
            .range([height, 0]);

        var line = d3.line()
            .x(function(d) { return x(getDateFromTransaction(d)); })
            .y(function(d) { return y(d.amount); });

        /*
        data.forEach(function(d) {
            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain(d3.extent(data, function(d) { return d.amount.amount; }));
        });
        */

        var newline = line(data);
        //console.log(newline);

        return(
            <path className="line" d={newline}></path>
        );
    }
}


/* The chart object contains the graph showing the transaction data
*/

class Chart extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            graph: "",
            categorySet: new Set(),
            container: "",
            chartWidth: 0,
            chartHeight: 0,
            x: NaN,
            y: NaN,
            data: [],
            displayData: [],
            margin: {}
        };

       this.didSelectCategory = this.didSelectCategory.bind(this);  

    }
   
    /*
    * This function is called by radio buttons which allow user to select a particular category of expenses.
    * It filters state property data so that only data of the selected category is displayed.
    */
 
    didSelectCategory(e){

//        console.log(e.currentTarget.value);
        let categoryName = e.currentTarget.value;
 
        let newData = this.state.data.filter((d) => {
                    return d.category == categoryName               
            });

//        console.log(newData);
//        console.log(this.state.categorySet);

        this.setState({
            displayData: newData
        });

    }
 
    componentDidMount() {
    
        let resize = (e) => {
                const container = this.state.container;
                let chartWidth = getChartSize(container)[0];
                let chartHeight = getChartSize(container)[1];

                this.setState({
                    chartWidth: chartWidth,
                    chartHeight: chartHeight,
                });
        } 

        window.addEventListener('resize', resize);

        const graph = d3.select("#chart");
        const container = d3.select("#root"); 

        const margin = {top: 20, right: 20, bottom: 30, left: 50};

        var containerBB = container.node().getBoundingClientRect();
        var graphBB = graph.node().getBoundingClientRect();
        let chartWidth = getChartSize(container)[0];
        let chartHeight = getChartSize(container)[1];

        axios.get(hostname + '/yodlee_printTransactions')
            .then((response) => {
                
                let transactionArr = response.data;
                let categorySet = new Set();
               
                console.log(response.data);
 
                transactionArr.forEach((t)=>{
                    categorySet.add(t.category);
                });


                console.log(categorySet);

                this.setState({
                    graph: graph,
                    categorySet: categorySet,
                    container: container,
                    chartWidth: chartWidth,
                    chartHeight: chartHeight,
                    data: transactionArr, //array of transactions
                    displayData: transactionArr, //array of transactions
                    margin: margin
                });
            })
    }

    render() {
        var width = this.state.chartWidth;
        var height = this.state.chartHeight;
        var margin = this.state.margin;
      
        var categoryInputs = <input type="radio" name="categorySelection" value="hello" onChange={this.didSelectCategory}> Hello <br/>
            
        {/* if (this.state.categorySet.length > 0){
            categoryInputs = <input type="radio" name = "categorySelection" value="hello" onChange={this.didSelectCategory}>
        }*/}
 
        return(
              <div id="chart">
                <div>
                    <svg height={height} width={width} >
                        <g transform="translate(50,20)">
                        <AxisX width={width} height={height} margin={margin} data={this.state.displayData}/>
                        <AxisY width={width} height={height} margin={margin} data={this.state.displayData}/>
                        <Line width={width} height={height} margin={margin} data={this.state.displayData}/>
                        </g>
                    </svg>
                </div>
                <form>
                    {categoryInputs}   
                </form>
            </div>
        )
    }
}// End class

{/*
 <input type="radio" name = "categorySelection" value="INCOME" onChange={this.didSelectCategory}/> Income <br />
                        <input type="radio" name = "categorySelection" value="TRANSFER" onChange={this.didSelectCategory}/> Transfer <br />
*/              


/*
 //          categoryInputs = this.state.categorySet.map(category => {
 //                           return <input type="radio" name = "categorySelection" value={category} onChange={this.didSelectCategory}/> Hi <br/>;
 //                       })
*/}
 


// ========================================

ReactDOM.render(
//<Game />,
//<AccountTable />,
//<TransactionTable />,
    <Chart />,
    document.getElementById('root')
);

