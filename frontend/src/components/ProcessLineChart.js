
let monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const lineChartOptions = {

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
	offsetGridLines : false,
	
	title:{
	    display:true,
	    text:'Total Expense by Months',
    	fontSize:25
    },
    legend:{
    	display:true,
    	position:"right"
  	}
}

export function processDatasetTolineChart(transaction,categoryType){
	var filteredExpense = [];
    var temp = [];
    var refinedData =[];
    var dataFeed=[];
    var ifFound = false;
    var monthNotFound = 0;
    
    transaction.map((trans) => {
    	if(trans.categoryType == categoryType){
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

    monthNames.map((month)=>{
		refinedData.map((income)=>{
			if(month == income.month){
				dataFeed.push(income.amount);
				ifFound = true;
			}
		})

		if(!ifFound){
			dataFeed.push(monthNotFound);
		}

		ifFound = false;
	})
   
	return dataFeed;
}

export function showLineChart(transactionData){

	var ifFound = false;
	var monthNotFound = 0;

		var expenseDataset = processDatasetTolineChart(transactionData,"EXPENSE");
		var incomeDataset = processDatasetTolineChart(transactionData,"INCOME");

	var lineData = {
		labels: monthNames,
		datasets: [
			{
				label: "My Expense",
				data: expenseDataset,
				backgroundColor:[
			      'rgba(153, 102, 255, 0.6)',
		          'rgba(255, 159, 64, 0.6)',
		        ]
				
			},
			{
				label: "My Income",
				data: incomeDataset, //Income transaction data based Months
					backgroundColor:[
		          'rgba(255, 99, 132, 0.6)',
		          'rgba(54, 162, 235, 0.6)',
		        ]
				
			}
		]
	}

	return lineData;

}

