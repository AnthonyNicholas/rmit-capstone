

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

function getLabelsForDoughutChart(data){
	var labels =[];
	var categories;

	categories = getExpenseCategories(data);

	categories.map((cat) => {
		labels.push(cat.name);
	})

	return labels;
}


function getValuesForDoughutChart(data){
	var values =[];
	var categories;

	categories = getExpenseCategories(data);

	categories.map((cat) => {
		values.push(cat.amount);
	})

	return values;
}

export function produceDataForDoughnutChart(data){
	var labels = getLabelsForDoughutChart(data);
	var values = getValuesForDoughutChart(data);

    var data = {
	    labels: labels,
	    datasets:[
	      {
	        label:'Population',
	        data: values,
	        backgroundColor:[
	          'rgba(255, 99, 132, 0.6)',
	          'rgba(54, 162, 235, 0.6)',
	          'rgba(255, 206, 86, 0.6)',
	          'rgba(75, 192, 192, 0.6)',
	          'rgba(153, 102, 255, 0.6)',
	          'rgba(255, 159, 64, 0.6)',
	          'rgba(255, 99, 132, 0.6)',
	          'rgba(255, 99, 132, 0.6)',
	          'rgba(54, 162, 235, 0.6)',
	          'rgba(255, 206, 86, 0.6)'
	        ]
	      }
	    ]
    }

    return data;
}

