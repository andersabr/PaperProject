
var couchdbURL = 'http://'+localStorage.dbipaddress+':5984/';
var config;


function utilsPage() {
	  location.assign("./fileSelector.html");
}

function resetCustomers() {
	/*
	 * ONLY INTEDED FOR DESIGN PURPOSES 
	 * clears Pouche, clears Couch and the table,
	 * Therafter reads the data from file and stores in all the DBs
	 * Finally loads the start table
	 */
	var remoteDb = new PouchDB(couchdbURL+'remcust');
    remoteDb.getSession()
	.then(function(response) {
		if (!response.userCtx.name) {
			// not logged in
			console.log(response);
			location.assign('loginPage.html?page=configPage3.html');	
		} else if (response.userCtx.name) {
			console.log(response['userCtx']);
			var db = new PouchDB('customers');
			var remoteDb = new PouchDB(couchdbURL+'remcust');
			var x;
			
			if (confirm("ÄR DU 100% SÄKER? DATABASEN MED ALLA KUNDER KOMMER ATT RADERAS !!") == true) {
				db.destroy().then(function (response) {
					console.log("PouchDB cleared");
					remoteDb.destroy().then(function (response) { 
						console.log("CouchDB cleared");
						// clears the table 
						$('#nisse tbody > tr').remove();
						// read data from file, store in Pouch and reload page
						readCustomerDataFromFile(null);
					});
				}).catch(function (err) {
					console.log(err);
				});
			} else {
				x = "You pressed Cancel!";
			}
		}
	}) 
}

function resetOrders() {
	/*
	 * ONLY INTEDED FOR DESIGN PURPOSES
	 * clears Pouche, clears Couch and the table,
	 * Therafter reads the data from file and stores in all the DBs
	 * Finally loads the start table
	 */

	var remoteDb = new PouchDB(couchdbURL+'remorders');
	remoteDb.getSession()
	.then(function(response) {
		if (!response.userCtx.name) {
			// not logged in
			location.assign('loginPage.html?page=configPage3.html');	
		} else if (response.userCtx.name) {
			console.log(response['userCtx']);
			var db = new PouchDB('orders');
			var remoteDb = new PouchDB(couchdbURL+'remorders');
			var x;

			if (confirm("ÄR DU 100% SÄKER? DATABASEN MED ALLA BESTÄLLNINGAR KOMMER ATT RADERAS !!") == true) {

				db.destroy()
				.then(function (response) {
					console.log("PouchDB cleared");
					remoteDb.destroy().then(function (response) { 
						console.log("CouchDB cleared");
						// clears the table 
						$('#nisse tbody > tr').remove();
						// read data from file, store in Pouch and reload page
						readOrdersDataFromFile(null);
					});
				})
				.catch(function (err) {
					console.log(err);
				});
			} else {
				x = "Du valde att avbryta.";
			}
		}
	})
}


// This is the check script
function submitToDb()
{
	// In textstring I gather the data that are finally written to the textarea.
	console.log("----ckeckit----");
	var remoteDb = new PouchDB(couchdbURL+'remcust');
	remoteDb.getSession()
	.then(function (response){
		if (!response.userCtx.name) {
			// not logged in
			location.assign('loginPage.html?page=configPage3.html');
		} else if (response.userCtx.name) {
			console.log(response['userCtx']);
		}
	})
	.then(function () {

		// First of all, have all the text boxes been filled in?

		for (i=0;i<4;i++) {
			var box = document.forms['example'].elements[i];
			if (!box.value) {
				alert('You haven\'t filled in ' + box.name + '!');
				box.focus()
				return;
			}
		}

		// read the element values 
		var lambihh = document.forms['example'].elements[3].value;
		var lambitoa = document.forms['example'].elements[2].value;
		var serlahh = document.forms['example'].elements[1].value;
		var serlatoa = document.forms['example'].elements[0].value;

		// update the object
		var obj = {};
		obj["_id"] = "CONF0001";
		obj["serlatoa_price"] = serlatoa;
		obj["serlahh_price"] = serlahh;
		obj["lambitoa_price"] = lambitoa;
		obj["lambihh_price"] = lambihh;

		console.log(lambihh + " " + lambitoa + " " + serlatoa + " " +serlahh);
		updateConfigInPouchAndConfigPage(obj);
	});
}


function createConfigPage() {
	
	createDbIpAddressForm();
	initConfiguration(createConfigForm);
	
}


function createDbIpAddressForm() {

	var cPAGE = document.getElementById("dbIpDIV");
	
	var cFORM = document.createElement('form');
	cFORM.setAttribute("name", "dbipform"); 
	cFORM.setAttribute("action", "#"); 
	//cFORM.setAttribute("onsubmit", "saveDbIp(); return false");

	var cINPUT = document.createElement('input');
	cINPUT.setAttribute("type", "text");
	cINPUT.setAttribute("name", "dbip_address");

	var dbipaddress;
	// get value from local store
	
	console.log(localStorage.dbipaddress);
	
	if (localStorage.dbipaddress != undefined ) {
		dbipaddress = localStorage.dbipaddress;
	} else {
		// set to local host first time
		localStorage.dbipaddress = "127.0.0.1";
		dbipaddress = "127.0.0.1";
	}

	cINPUT.setAttribute("value", dbipaddress);	 

	cFORM.appendChild(cINPUT);
	cFORM.appendChild(document.createElement('br'));

	// this shall be a button 
	cINPUT = document.createElement('input');
	cINPUT.setAttribute("type","button");
	cINPUT.setAttribute("value","Spara IP-adress");
	cINPUT.setAttribute("onclick", "saveDbIp()");
	cINPUT.setAttribute("class", "submitbutton");
	
	cFORM.appendChild(document.createElement('br'));
	cFORM.appendChild(cINPUT);

	// form into page
	cPAGE.appendChild(cFORM); 

	
	
}

function saveDbIp() {
	// saves the IP address in local storage
	
	// read value from form and write in local store
	var dbipaddress = document.forms['dbipform'].elements[0].value;
	// set local store
	console.log(dbipaddress);
	if (dbipaddress) {
	    localStorage.dbipaddress = dbipaddress
	} else {
	    localStorage.dbipaddress = "127.0.0.1";
	}
	// reload page
	location.assign('configPage3.html');
}



function createConfigForm(config) {   
	// this is the callback function, creating the form
	// using current config stored in the DB

	console.log(config);
		
	//config["_id"] = "CONF0001";
	//config["serlatoa_price"] = "160";
	//config["serlahh_price"] = "150";
	//config["lambitoa_price"] = "180";
	//config["lambihh_price"] = "160";
   	
	var cPAGE = document.getElementById("configDIV");

//	<form name="example" action="#" onsubmit="checkit(); return false">
	
	var cFORM = document.createElement('form');
	cFORM.setAttribute("name", "example"); 
	cFORM.setAttribute("action", "#"); 
	//cFORM.setAttribute("onsubmit", "checkit(); return false"); 

//	<table class="form">
	var cTABLE = document.createElement('table');
	cTABLE.setAttribute("class","form");

//<tr>
//<td>Serla Toalett, kr</td>
//<td><input type="text" name="serlatoa" value="160" /></td>
//</tr>

	var cTR = document.createElement('tr');
	var cTD = document.createElement('td');
	var cTEXT = document.createTextNode("Serla Toalett, kr:");
	cTD.appendChild(cTEXT);
	cTR.appendChild(cTD);
	
    // one more TD on same row
	cTD = document.createElement('td')
	var cINPUT = document.createElement('input');
	cINPUT.setAttribute("type", "text");
	cINPUT.setAttribute("name", "serlatoa");
	cINPUT.setAttribute("value", config["serlatoa_price"]);	 
	cTD.appendChild(cINPUT)
	cTR.appendChild(cTD); 
	
	cTABLE.appendChild(cTR);

 //<tr>
 //<td>Serla Hushåll, kr:</td>
 //<td><input type="text" name="serlahh" value="150"/></td>
 //</tr>
	
	cTR = document.createElement('tr');
	cTD = document.createElement('td');
	cTEXT = document.createTextNode("Serla Hushåll, kr:");
	cTD.appendChild(cTEXT);
	cTR.appendChild(cTD);

	cTD = document.createElement('td')
	cINPUT = document.createElement('input');
	cINPUT.setAttribute("type", "text");
	cINPUT.setAttribute("name", "serlahh");
	cINPUT.setAttribute("value", config["serlahh_price"]);	 
	cTD.appendChild(cINPUT);
	cTR.appendChild(cTD); 
	
	cTABLE.appendChild(cTR);

 //<tr>
 //<td>Lambi Toalett, kr:</td>
 //<td><input type="text" name="lambitoa" value="180"/></td>
 //</tr>
	
	cTR = document.createElement('tr');
	cTD = document.createElement('td');
	cTEXT = document.createTextNode("Lambi Toalett, kr:");
	cTD.appendChild(cTEXT);
	cTR.appendChild(cTD);

	cTD = document.createElement('td')
	cINPUT = document.createElement('input');
	cINPUT.setAttribute("type", "text");
	cINPUT.setAttribute("name", "lambitoa");
	cINPUT.setAttribute("value", config["lambitoa_price"]);	 
	cTD.appendChild(cINPUT);
	cTR.appendChild(cTD); 
	
	cTABLE.appendChild(cTR);

// <tr>
// <td>Lambi Hushåll, kr:</td>
// <td><input type="text" name="lambihh" value="160"/></td>
// </tr>

	cTR = document.createElement('tr');
	cTD = document.createElement('td');
	cTEXT = document.createTextNode("Lambi Hushåll, kr:");
	cTD.appendChild(cTEXT);
	cTR.appendChild(cTD);

	cTD = document.createElement('td')
	cINPUT = document.createElement('input');
	cINPUT.setAttribute("type", "text");
	cINPUT.setAttribute("name", "lambitoa");
	cINPUT.setAttribute("value", config["lambihh_price"]);	 
	cTD.appendChild(cINPUT);
	cTR.appendChild(cTD); 
	
	cTABLE.appendChild(cTR);

 //<tr>
 //<td colspan="2"><input type="submit" value="Submit form"/><br/>
 //<input type="reset" /></td></tr>
	
	cTR = document.createElement('tr');
	cTD = document.createElement('td');
	cTD.setAttribute("colspan","2");
	
	cINPUT = document.createElement('input');
	cINPUT.setAttribute("type","button");
	cINPUT.setAttribute("value","Spara Konfiguration");
	cINPUT.setAttribute("onclick", "submitToDb()");
	cINPUT.setAttribute("class", "submitbutton");
	cTD.appendChild(document.createElement('br'));
	cTD.appendChild(cINPUT);
	cTR.appendChild(cTD); 
	
	cTABLE.appendChild(cTR);


// <tr><td colspan="2"><textarea cols="30" rows="7" name="output">When you hit 'Submit' the user input will be written to this textarea</textarea>
// </td></tr>

	cTR = document.createElement('tr');
	cTD = document.createElement('td');
	cTD.setAttribute("colspan","2");	
	cTR.appendChild(cTD); 
	
	cTABLE.appendChild(cTR);
	
	cFORM.appendChild(cTABLE);
	cPAGE.appendChild(cFORM);
	
}


 

function listAllId() {
    // change page
    location.assign("./custSearch10.html");
}


function orderSearch() {
	  location.assign("./ordersOverview.html");
}

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




