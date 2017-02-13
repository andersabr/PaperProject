var couchdbURL = 'http://'+localStorage.dbipaddress+':5984/';

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
	// make demo search buttons work
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



function createOrdersTable(ordersData) {

	$(document).ready(function() {

		console.log("----createCustomerOrdersTable------");
		console.log(ordersData);
		// the table
		var tableRef = document.getElementById('nisse').getElementsByTagName('tbody')[0];

		var par = ordersData;

		for(var key in par) {
			var newRow  = tableRef.insertRow(tableRef.rows.length);

			// look for  Tn with highest "n" 
			var n = findHighestNinOrder(par[key]);
			// here n = 0 must be handled separately....n=0  means Tx
			// fix this!! use T0 instaed of Tx
			var prop = "";
			if(n==0) {
				prop = "Tx";
			} else {
				prop = 'T'+n;
			}
			//console.log(prop);
			newRow.insertCell(0).innerHTML = key+":"+prop;
			newRow.insertCell(1).innerHTML = par[key][prop]["customername"];
			newRow.insertCell(2).innerHTML = par[key][prop]["lambihh"];
			newRow.insertCell(3).innerHTML = par[key][prop]["lambitoa"];
			newRow.insertCell(4).innerHTML = par[key][prop]["serlahh"];
			newRow.insertCell(5).innerHTML = par[key][prop]["serlatoa"];
			newRow.insertCell(6).innerHTML = par[key][prop]["totalcost"];
			newRow.insertCell(7).innerHTML = par[key][prop]["transactiondate"];
			// add an event listener to the rows so we can edit the order
			//newRow.addEventListener("click", function(){ clickOnRow((this).cells[0].innerHTML, (this).cells[7].innerHTML )});
			newRow.addEventListener("click", function(){ clickOnRow((this).cells[0].innerHTML)});
		} // end for
		$('table').trigger('update');
	});  // end document ready
}


/*
 * Here the page starts,
 * read DB and call createCustomerOrdersTable...
 *
 */
var res = readOrdersDataFromDB(createOrdersTable);


function clickOnRow(a) {
	/* 
	 * brings up a popoup page for updating order
	 */
	console.log(a);
	var res = a.split(":");
	console.log(res);
	var customerid = res[1];
	console.log(customerid);

	// location.assign("./ordersEdit.html?customerid="+customerid+"&orderskey="+a);
	window.open ("./ordersEdit3.html?customerid="+customerid+"&orderskey="+res[0]+":"+res[1],"UpdateWindow","resizable=1,width=900,height=800");
}



/*
	This is the old handling that was dependent on if customer was connetected to transaction or not in the DB 
	(DB was firebase)
	In new handling allcutomers have a connection to a transaction (now named "order") that is having an orderskey.
 
myDataRef = new Firebase("https://popping-fire-3239.firebaseio.com/foreningsrullen2/ibksundsvall2");

myDataRef.orderByKey().equalTo('customers').on("child_added", function (snapshot) {
	var clubobj= snapshot.val();

	// orderskey is in "b" but we have it from DB as well
	orderskey = clubobj[a]["orderskey"];
	customername = clubobj[a]["customername"];

	//alert(customername);
	//alert(orderskey);

	if(customername != "_" && orderskey == "_")
	{
		// alert("Gå till \"Transaktioner\" för att koppla transaktion till denna kund.");
		// connect internal transaction automatically
		var obj1 = {};
		obj1["orderskey"] = "internal:"+a;
		//console.log(obj1["orderskey"]);
		var customerRef = myDataRef.child("customers").child(a);

		customerRef.update(obj1, function(error) {
			if (error) {
				console.log("Error updating data:", error);
				location.reload();
				return;
			}
			else {
				//console.log("update ok");
				location.reload();
				return;
			}
		});
	}
	else if(customername != "_" && orderskey != "_") {
		// 4: customer that have orders, go to ordres page
		//location.assign("./ordersedit3.html?customerid="+a+"&orderskey="+b,"UpdateWindow");
		window.open ("./ordersedit3.html?customerid="+a+"&orderskey="+b,"UpdateWindow","resizable=1,width=900,height=800");
	}
	else if(customername == "_" && orderskey == "_") {
		// 1: free unused customer record, just reload current page
		location.reload();
	}
	else
	{
		// transactions exists but no customer
		alert("Ledigt Kund Nr. som har transaktion kopplad.\nLägg in kundnamn, leveransadress etc.\neller koppla transaktionen till annan kund.");
		//location.reload();
		return;
	}

});
*/


/*
 *  Button functions 
 *
 */

function listAllId() {
 location.assign("./custSearch10.html");
}

/*
function listOrdersId() {
 location.assign("./custOrdersSearch.html");
}
*/

function logout() {
	// just logout from DB	
	var remoteDb = new PouchDB(couchdbURL+'remcust');
	remoteDb.logout()
	.then(function (response){
		console.log(response);
		return response;
	}).catch(function (error) {
		console.log(error);
	});
}


