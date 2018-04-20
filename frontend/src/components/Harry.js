import React,{Component } from 'react';
import { Button,Grid,Row, Col,ButtonToolbar } from 'react-bootstrap';
// import './index.css';
var axios = require('axios');
var randomColor = require('randomcolor');
// var d3 = require('d3');
var hostname = 'http://terra.bbqsuitcase.com:3001';
var oneDay = 24*60*60*1000; // hours*minu
var DoughnutChart = require("react-chartjs").Doughnut;
var LineChart = require("react-chartjs").Line;

let monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
	




class Harry extends Component {
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

	processIncomeDataToLineChart(transaction){
	    var transactionDate;
	    var filteredIncome = [];
	    var temp = [];
	    var refinedData =[];
	    

	    transaction.map((trans) => {
	    	if(trans.categoryType == "INCOME"){
				var object = {};

				var dateArr = trans.date.split("-");
				var transactionDate = new Date(dateArr[0], dateArr[1], dateArr[2]);
				var month = monthNames[transactionDate.getMonth()];
				console.log(month);
				object["month"] = month;
				object["amount"] = trans.amount;
				temp.push(object);
			    filteredIncome.push(month);
	    	}
	    })

	    //get all the months from transactions
	    filteredIncome = Array.from(new Set(filteredIncome));
	    console.log(filteredIncome);
	    

	    filteredIncome.map((trans) => {
	    	var obj = {};
	    	obj["month"] = trans;
	    	obj["amount"] = 0;
	    	refinedData.push(obj);
	    })

	    temp.map((trans) => {
	    	refinedData.map((chartValue) => {
	    		if(trans.month == chartValue.month){
	    			chartValue.amount += trans.amount;
	    		}
	    	})
	    })
	   
	    return refinedData;
	}

	processExpenseDataToLineChart(transaction){
	    var filteredExpense = [];
	    var temp = [];
	    var refinedData =[];
	    
	    transaction.map((trans) => {
	    	if(trans.categoryType == "EXPENSE"){
				var object = {};

				var dateArr = trans.date.split("-");
				var transactionDate = new Date(dateArr[0], dateArr[1], dateArr[2]);
				var month = monthNames[transactionDate.getMonth()];
				object["month"] = month;
				object["amount"] = trans.amount;
				temp.push(object);
			    filteredExpense.push(month);
	    	}
	    })

	    //get all the months from transactions
	    filteredExpense = Array.from(new Set(filteredExpense));
	    

	    filteredExpense.map((trans) => {
	    	var obj = {};
	    	obj["month"] = trans;
	    	obj["amount"] = 0;
	    	refinedData.push(obj);
	    })

	    temp.map((trans) => {
	    	refinedData.map((chartValue) => {
	    		if(trans.month == chartValue.month){
	    			chartValue.amount += trans.amount;
	    		}
	    	})
	    })
	   
	    return refinedData;
	}

showLineChart(accId){
	var incomeDataFeed = [] ;
	var expenseDataFeed = [];
	var ifFound = false;
	var monthNotFound = 0;

	var transactionData = this.state.transactions.filter(
  			transaction => transaction.account.accountId == accId);

	var expenseDataset = this.processExpenseDataToLineChart(transactionData);
	console.log(expenseDataset);
	var incomeDataset = this.processIncomeDataToLineChart(transactionData);
	console.log(incomeDataset);

	monthNames.map((month)=>{
		expenseDataset.map((expense)=>{
			if(month == expense.month){
				expenseDataFeed.push(expense.amount);
				console.log(expense.month);
				console.log(expense.amount);
				ifFound = true;
			}
		})

		if(!ifFound){
			expenseDataFeed.push(monthNotFound);
		}

		ifFound = false;
	})
	console.log(expenseDataFeed);


	monthNames.map((month)=>{
		incomeDataset.map((income)=>{
			if(month == income.month){
				incomeDataFeed.push(income.amount);
				ifFound = true;
			}
		})

		if(!ifFound){
			incomeDataFeed.push(monthNotFound);
		}

		ifFound = false;
	})

	console.log(incomeDataFeed);


	var lineData = {
		labels: monthNames,
		datasets: [
			{
				label: "My Expense",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: expenseDataFeed
			},
			{
				label: "My Income",
				fillColor: "#ff0000",
				strokeColor: "#ff0000",
				pointColor: "#ff0000",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: incomeDataFeed //Income transaction data based Months
			}
		]
	}
		console.log(lineData);
		this.setState({ lineDataset: lineData});


}

  	loadData(){
  	var newArray = this.state.accounts;
  	let uniqueAccounts;
    axios.get(hostname + '/yodlee_printTransactions')
            .then((response) => {
                //console.log(response.data[0].data);
                return response.data;
            })
            //appending data into array 
            .then(value => {

            	value.map((x)=>{

            		newArray = newArray.slice()
	            	newArray.push(x.account.accountId);
            	})

            	//Remove duplicates
            	uniqueAccounts = Array.from(new Set(newArray));

            	//populating accounts
            	this.setState({accounts: uniqueAccounts});

            	//populating transactions data
            	this.setState({transactions: value});
            }) 
  	}

  	showExpenseGraph(accId){
  		var mapToGraph = [];
  		var expenseCategories;
  		var dataFeed = [];

  		//collect all transactions data with specified accountaccId
  		var transactionData = this.state.transactions.filter(
  			transaction => transaction.account.accountId == accId);

  		expenseCategories = this.getExpenseCategories(transactionData);
  		

  		expenseCategories.map((cat) => {

			dataFeed = this.feedToDoughnut(cat.name, cat.amount);
			mapToGraph = mapToGraph.slice();
			mapToGraph.push(dataFeed);

  		})

  		this.setState({doughnutExpenseFeed: mapToGraph});

  	}

  	getExpenseCategories(transactionData){
  		var categoryData = [];
  		var categoryList = [];

  		//get individual expense category name
  		transactionData.map((transaction) => {
  			if(transaction.categoryType == "EXPENSE"){
  				categoryData.push(transaction.category);;
  			}

  		})

  		categoryData = Array.from(new Set(categoryData));

  		// create an array of category object with name and amount fields
  		categoryData.map((data) => {
  			var obj = {};
  			obj["name"] = data;
  			obj["amount"] = 0;
  			categoryList.push(obj);
  		})

  		//store and aggregate total amount for each category
  		transactionData.map((trans) => { //1.home exp
  			categoryList.map((item) => {
  				if(item.name == trans.category){
  					item.amount += trans.amount;
  				}
  			})
  		})

  		//removing duplicates.
  		return categoryList;
  	}

  	feedToDoughnut(categoryName,amount){
  		var color = randomColor();
  		var highlight = randomColor();

  		var data =
			{
				value: amount,
				color: color,
				highlight: highlight,
				label: categoryName
			}

		return data;
  	}



  render(){
  	const transactions = this.state.transactions;
  	const accounts = this.state.accounts;
  

  	return(
  		<Grid>
	  		<Row className="show-grid">
	  			<ButtonToolbar>
	  		{
	  			accounts.map((account) => 
	  			{ 
	  				return(
	  				<Col xs={3} md={2}>
				      	<Button 
				      		bsStyle="primary" 
				      		bsSize="large" 
				      		onClick={() => this.showExpenseGraph(account)}
				      	>
				      		{account}
				      	</Button>
				      	<Button 
				      		bsStyle="primary" 
				      		bsSize="large" 
				      		onClick={() => this.showLineChart(account)}
				      	>
				      		{account}
				      	</Button>
				      	
				    </Col>
				    
	        		)
	    		})

			}
		  		</ButtonToolbar>	
				
		  	</Row>
		  	<div>
		  		<DoughnutChart  data={this.state.doughnutExpenseFeed} options={doughnutChartOptions} />
		  		<LineChart  data={this.state.lineDataset} options={lineChartOptions} width="600" height="250" redraw/>
		  	</div>
		  	
  		</Grid>
  		
  	);
  }
}

export default Harry;

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

let lineChartOptions = {

	///Boolean - Whether grid lines are shown across the chart
	scaleShowGridLines : true,

	//String - Colour of the grid lines
	scaleGridLineColor : "rgba(0,0,0,.05)",

	//Number - Width of the grid lines
	scaleGridLineWidth : 1,

	//Boolean - Whether to show horizontal lines (except X axis)
	scaleShowHorizontalLines: true,

	//Boolean - Whether to show vertical lines (except Y axis)
	scaleShowVerticalLines: true,

	//Boolean - Whether the line is curved between points
	bezierCurve : true,

	//Number - Tension of the bezier curve between points
	bezierCurveTension : 0.4,

	//Boolean - Whether to show a dot for each point
	pointDot : true,

	//Number - Radius of each point dot in pixels
	pointDotRadius : 4,

	//Number - Pixel width of point dot stroke
	pointDotStrokeWidth : 1,

	//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
	pointHitDetectionRadius : 20,

	//Boolean - Whether to show a stroke for datasets
	datasetStroke : true,

	//Number - Pixel width of dataset stroke
	datasetStrokeWidth : 2,

	//Boolean - Whether to fill the dataset with a colour
	datasetFill : true,
	
	//String - A legend template
	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>",

	//Boolean - Whether to horizontally center the label and point dot inside the grid
	offsetGridLines : false
}