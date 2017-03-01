var couchdbURL = 'http://'+localStorage.dbipaddress+':5984/';

/**/
function execFileSelectorCustomers() {
	var fileInput = document.getElementById("your-files-customers");
	fileInput.addEventListener("change", function(e) {

		var file = fileInput.files[0];
		console.log(file);
		
		var textType = /text.*/;
		var reader = new FileReader();
		
		reader.readAsText(file,'utf-8');	
		reader.onload = function(e) {
			
			var obj = JSON.parse(reader.result);
			//console.log(obj);
			
			writeCustomerDataFile(obj);
			
		}
	});
}

/**/
function execFileSelectorOrders() {
	var fileInput = document.getElementById("your-files-orders");
	fileInput.addEventListener("change", function(e) {

		var file = fileInput.files[0];
		console.log(file);
		
		var textType = /text.*/;
		var reader = new FileReader();
		
		reader.readAsText(file,'utf-8');	
		reader.onload = function(e) {
			
			var obj = JSON.parse(reader.result);
			//console.log(obj);
			
			writeOrderDataFile(obj);
		}
	});
}

/**/
function execLoadCustomers() {
	var fileInput = document.getElementById("load-customers");
	fileInput.addEventListener("change", function(e) {

		var file = fileInput.files[0];
		console.log(file);
		
		var textType = /text.*/;
		var reader = new FileReader();
		
		reader.readAsText(file,'utf-8');	
		reader.onload = function(e) {
			
			var obj = JSON.parse(reader.result);
			console.log(obj);
			
			resetCustomersFromLocalFS(obj)
			
		}
	});
}

/**/
function resetCustomersFromLocalFS(obj) {
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
			location.assign('loginPage.html?page=fileSelector.html');	
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
						storeBulkInPouchAndRead(obj,null,"./custSearch10.html"); 
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



function execLoadOrders() {
	var fileInput = document.getElementById("load-orders");
	fileInput.addEventListener("change", function(e) {

		var file = fileInput.files[0];
		console.log(file);
		
		var textType = /text.*/;
		var reader = new FileReader();
		
		reader.readAsText(file,'utf-8');	
		reader.onload = function(e) {
			
			var obj = JSON.parse(reader.result);
			console.log(obj);
			
			resetOrdersFromLocalFS(obj);			
		}
	});
}

function resetOrdersFromLocalFS(obj) {
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
			location.assign('loginPage.html?page=fileSelector.html');	
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
						
						storeBulkInPouchAndReadOrders(obj,null);
						//readOrdersDataFromFile(null);
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




/* */
function writeCustomerDataFile(data) {
	console.log(data);

	var outObj = [];   // array of objects to write on file
	var key;
	var initObj = {};
		
	for (key in data) {
		//clearing oject
		initObj = {};
		
		if (data.hasOwnProperty(key)) {
            // copy the data that shall be copied
			for (j=1; j<24; j++) {
				if(mapImportget(j) in data[key]) {
					initObj[mapImportget(j)] = data[key][mapImportget(j)];
				}
			}
			//console.log("key="+key);
			// add the object to output arrayS
			// check that no "_id" has a value containing "_"
			if(!(initObj["_id"] == "_")) {
			  outObj[key] = initObj; 
			}
			else {
			  console.log(initObj);
              alert("A RECORD IS HAVING AN UNDEFINED CUSTOMER ID, PLEASE CHANGE CUSTOMER ID OR REMOVE RECORD CONTAING NAME: "+ initObj["customername"]);
              break;
			}
		}
	}
	console.log(outObj);
	console.log("writing customersfile");
	saveTextAsFile(outObj,"customers");
}
	

function writeOrderDataFile(data) {
	console.log(data);

	var outObj = [];   // array of objects to write on file
	var key;
	var initObj = {};
	var obj2 = {};
	var obj3 = {};
	var timestamp = new Date();
		
	for (key in data) {
		//clearing oject
		initObj = {};
		obj2 = {};
		obj3 = {};
		
		if (data.hasOwnProperty(key)) {
            // copy the data that shall be copied
			//if("_id" in data[key]) {
			//}
			initObj["_id"] = "internal:"+data[key]["_id"];
			obj2["customername"] = data[key]["customername"];
            obj2["lambihh"] = "0";
            obj2["lambitoa"] = "0";
            obj2["serlahh"] ="0";
            obj2["serlatoa"] = "0";
            obj2["totalcost"] = "0";
            obj2["transactiondate"] = "xxxx-xx-xx";	
            
			obj3["customername"] = data[key]["customername"];
            obj3["lambihh"] = data[key]["lambihh"];
            obj3["lambitoa"] = data[key]["lambitoa"];
            obj3["serlahh"] = data[key]["serlahh"];
            obj3["serlatoa"] = data[key]["serlatoa"];
            obj3["totalcost"] = data[key]["total"];        
            obj3["transactiondate"] = timestamp.toISOString();
			
			initObj["Tx"] = obj2;
			initObj["T1"] = obj3;
			//console.log(initObj);
			// add the object to output array
			
			// check that no "_id" has a value containing "_"
			if(!(initObj["_id"] == "_")) {
			  outObj[key] = initObj;
			}
			else {
			  console.log(initObj);
              alert("A RECORD IS HAVING AN UNDEFINED CUSTOMER ID, PLEASE CHANGE CUSTOMER ID OR REMOVE RECORD CONTAING NAME: "+ initObj["customername"]);
              break;
			}
		}
	}
	console.log(outObj);
	console.log("writing ordersfile");
	saveTextAsFile(outObj,"orders");
}

	
function saveTextAsFile(data,filename)
{
    //var textToSave = document.getElementById("inputTextToSave").value;
    var textToSaveAsBlob = new Blob([JSON.stringify(data, null, '\t')], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    //var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;
 
    var downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    //downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

/*

function resetCustomers() {

*	
	db.doSomething(args).then(function (response){
		  return db.doSomethingElse(args);
		}).then(function response) {
		  // handle response
		}).catch(function (error) {
		  // handle error
		});
	
	*
	
	remoteDb.getSession()
	.then(function(response) {
		if (!response.userCtx.name) {
			location.assign('loginPage.html');	
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
						readCustomerProdDataFromFile(null);
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

	var db = new PouchDB('orders');
	//var remoteDb = new PouchDB('http://admin:admin@localhost:5984/remorders');
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
				readOrdersProdDataFromFile(null);
			});
		})
		.then(function() {
			console.log("--create the default configuration...--");
	
		})
		.catch(function (err) {
			console.log(err);
		});
	} 
	else {
		x = "Du valde att avbryta.";
	}
}

*/

/*
function readCustomerDataFromFile(callback) {

	//*******************************************************
	// read data from file 
	$.ajax({
		url: 'convertjson2.json',
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function(data) {   // ajax callback function
			if (typeof callback === "function") {
			// handle the data read
			//var res = storeBulkInPouchAndRead(data,callback); 
			callback(data);
			console.log(data);
		}
		}
	});  //ajax

}

*/






