var randomColor = require('randomcolor');

//referencing: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
//used for educational purposes only
function shadeBlend(p,c0,c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
        var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
        return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
        var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
        return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
}


function getExpenseCategories(transactionData){
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

function feedToDoughnut(categoryName,amount){
    var highlight = randomColor(.99, .5);

    if(categoryName === "Restaurants")
        highlight = '#003f5c';
    else if (categoryName === "Home Improvement")
        highlight = '#2f4b7c';
    else if (categoryName === "Home Improvement")
        highlight = '#2f4b7c';
    else if (categoryName === "Entertainment/Recreation")
        highlight = '#665191';
    else if (categoryName === "Electronics/General Merchandise")
        highlight = '#a05195';
    else if (categoryName === "Personal/Family")
        highlight = '#d45087';
    else if (categoryName === "Cable/Satellite/Telecom")
        highlight = '#f95d6a';
    else if (categoryName === "Automotive/Fuel")
        highlight = '#ff7c43';
    else if (categoryName === "Service Charges/Fees")
        highlight = '#ffa600';

    var color = shadeBlend(0,highlight);

    var data =
        {
            value: amount,
            color: color,
            highlight: highlight,
            label: categoryName
        }

    return data;
}

export function showDoughnutChart(transactions){
	var mapToGraph = [];
	var expenseCategories;
	var dataFeed = [];

	expenseCategories = getExpenseCategories(transactions);

	expenseCategories.map((cat) => {

	dataFeed = feedToDoughnut(cat.name, cat.amount);
	mapToGraph = mapToGraph.slice();
	mapToGraph.push(dataFeed);

	})

	return mapToGraph;

}

