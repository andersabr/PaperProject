
var couchdbURL = 'http://'+localStorage.dbipaddress+':5984/';
var globalCustomerData;
var tableRef;


$(function() {
	var $table = $('table').tablesorter({
		theme: 'blue',
		widgets: ["zebra", "filter"],
		widgetOptions : {
			// filter_anyMatch replaced! Instead use the filter_external option
			// Set to use a jQuery selector (or jQuery object) pointing to the
			// external filter (column specific or any match)
			filter_external : '.search',
			// add a default type search to the first name column
			filter_defaultFilter: { 1 : '~{query}' },
			// include column filters
			filter_columnFilters: true,
			filter_placeholder: { search : 'Sök...' },
			filter_saveFilters : true,
			filter_reset: '.reset'
		}
	});

	// make search buttons work
	$('button[data-column]').on('click', function(){
		var $this = $(this),
		totalColumns = $table[0].config.columns,
		col = $this.data('column'), // zero-based index or "all"
		filter = [];

		// text to add to filter
		filter[ col === 'all' ? totalColumns : col ] = $this.text();
		$table.trigger('search', [ filter ]);
		return false;
	});
});



function createCustomerTable(customerData) {
	globalCustomerData = customerData;
	$(document).ready(function() {
		console.log("---createCustomerTable ------ logging customerData");
		console.log(customerData);

		// the table
		tableRef = document.getElementById('nisse').getElementsByTagName('tbody')[0];
		var par = customerData;

		for(var key in par) {
			var newRow  = tableRef.insertRow(tableRef.rows.length);

			newRow.insertCell(0).innerHTML = key;
			newRow.insertCell(1).innerHTML = par[key]["team"];
			newRow.insertCell(2).innerHTML = par[key]["contactperson"];
			newRow.insertCell(3).innerHTML = par[key]["customername"];
			newRow.insertCell(4).innerHTML = par[key]["deliveryaddress"];
			newRow.insertCell(5).innerHTML = par[key]["distlist"];
			newRow.insertCell(6).innerHTML = par[key]["postalcode"];
			newRow.insertCell(7).innerHTML = par[key]["city"];
			newRow.insertCell(8).innerHTML = par[key]["mobile"];
			newRow.insertCell(9).innerHTML = par[key]["phone"];
			newRow.insertCell(10).innerHTML = par[key]["sendemail"];
			newRow.insertCell(11).innerHTML = par[key]["emailaddress"];
			newRow.insertCell(12).innerHTML = par[key]["salesperson"];
			newRow.insertCell(13).innerHTML = par[key]["cancelationday"];
			newRow.insertCell(14).innerHTML = par[key]["comments"];
			newRow.insertCell(15).innerHTML = par[key]["paymentmethod"];
			newRow.insertCell(16).innerHTML = par[key]["delivery"];
			newRow.insertCell(17).innerHTML = par[key]["deliverycomment"];
			newRow.insertCell(18).innerHTML = par[key]["billingaddress"];
			newRow.insertCell(19).innerHTML = par[key]["altdeliveryreceiver"];
			newRow.insertCell(20).innerHTML = par[key]["altdeliveryaddress"];
			newRow.insertCell(21).innerHTML = par[key]["altdistlist"];

			// add an event listener to the rows so we can update the row being clicked
			newRow.addEventListener("click", function(){ clickOnRow((this).cells[0].innerHTML, (this).cells[7].innerHTML )});
		} // end for
		$('table').trigger('update');
	});  // end document ready
}


//read customer data from Pouch and then call "createCustomerTable"
var res = readCustomerDataFromDB(createCustomerTable);


function clickOnRow(a) {
	/* Called at mouse click on a table row
	 * goes to new page where edit is possible
	 * NOT new customer, updating old customer only.
	 */
	location.assign("./custEdit6.html?customerid="+a,"UpdateWindow");
}


function addCustomerId() {
	/* adding new customer (set newcustomer = true) and then call "custEdit" page 
	 */

	//console.log("---- custSearch... ------ addCustomerId");
	var custind = findFirstCustidNotUsed(globalCustomerData);

	var Cobj2 = {};
	var Ckey2 = "";
	var Cobj1 = {};
	var Ckey1 = custind;

	// set all propreties = "_"
	for (j=1; j<23; j++) {
		Ckey2 = mapget(j);
		Cobj2[Ckey2] = "_";
	}
	// connect to a transaction
	Cobj2["orderskey"] = "internal:"+custind;
	Cobj2["_id"] = custind;

	// Cobj1 not needed now but perhaps later
	// Cobj1[Ckey1] = Cobj2;
	//console.log("-------addCustomerId --Cobj2: ");
	//console.log(Cobj2);

	// create defualt Orders object 

	var customername = "_";
	var existstoo = false;

	var Tobj2 = {};

	var Tkey2 = "lambihh";
	Tobj2[Tkey2] = 0;
	Tkey2 = "lambitoa";
	Tobj2[Tkey2] = 0;
	Tkey2 = "serlahh";
	Tobj2[Tkey2] = 0;
	Tkey2 = "serlatoa";
	Tobj2[Tkey2] = 0;
	Tkey2 = "totalcost";
	Tobj2[Tkey2] = 0;
	Tkey2 = "transactiondate";
	Tobj2[Tkey2] = "xxxx-xx-xx";
	// insert customer name here
	Tkey2 = "customername";
	Tobj2[Tkey2] = customername;

	// inser object into another object
	var Tobj1 = {};
	var Tkey1 = "Tx";
	Tobj1[Tkey1] = Tobj2;
	Tobj1["_id"]= "internal:"+custind;
	// adds customer and order objects to db
	addCustomerToPouchAndCustEdit(Cobj2,Tobj1);

} 


 

function configPage() {
      // change page
      location.assign("./configPage3.html");
};


function orderSearch() {
  location.assign("./ordersOverview.html");
}

function emailCustomer() {
  location.assign("./emailPage4.html");
}

function logout() {
  location.assign("./logout2.html");
}

