var randomColor = require('randomcolor');

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

