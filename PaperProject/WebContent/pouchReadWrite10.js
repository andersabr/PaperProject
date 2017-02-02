
var couchdbURL = 'http://admin:admin@'+localStorage.dbipaddress+':5984/';
var db = new PouchDB('customers');
var dbConfig = new PouchDB('config');
var dbOrd = new PouchDB('orders');

var HttpClient = function() {
	this.get = function(aUrl, aCallback) {
		var anHttpRequest = new XMLHttpRequest();
		anHttpRequest.onreadystatechange = function() { 
			if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
				aCallback(anHttpRequest.responseText);
		}		
		anHttpRequest.open( "GET", aUrl, true );  
		anHttpRequest.send( null );
	}
}


function addCustomerToPouchAndCustEdit(custobj,orderobj) {

	var custid = custobj["_id"];
	//var remoteDbCust =  new PouchDB('http://admin:admin@localhost:5984/remcust');
	var remoteDbCust =  PouchDB(couchdbURL +'remcust');
	//var remoteDbOrders =  new PouchDB('http://admin:admin@localhost:5984/remorders');
	var remoteDbOrders = new PouchDB(couchdbURL+'remorders');
	//var dbCust = new PouchDB('customers');
	//var dbOrders = new PouchDB('orders');

	db.put(custobj)
	.then(function(responsecust) {
		// customer successfully added
		console.log(responsecust);
		// add order
		dbOrd.put(orderobj)
		.then(function(responseorder) {
			// order added....possible to use return here
			console.log(responseorder);
		})	
		.catch(function (errorder) {
			// possible to throw here
			console.log(errorder);
		})
	})
	.then(function(){
		// here we do the replication....
		replicateToCouchAndShowPageToo(db, remoteDbCust, dbOrd, remoteDbOrders, "./custEdit6.html?customerid="+custid+"&newcustomer=true");		 
	})
	.catch(function (err) {
		console.log(err);
	});
}


function emailCustomers(obj) {
	config.log(obj);
}


/* remove patten
db.get('mydoc').then(function (doc) {
	  return db.remove(doc._id, doc._rev);
	});
 */


function fillBulkEmailPageWithData(config) {
	/*
	 * this is the callback filling the E-mail form from configuration
	 * 
	 */	
	configInDB = config;
	console.log("--fillBulkEmailPageWithData--");
	
	console.log(config);
	document.getElementById("subject").value = config["subject"];

	templMessage= config["message"];      // a global in "emailPage.js"

	// fill in the form used for editing the template
	//
	document.getElementById("email").value = "";
	document.getElementById("bcc").value = config["bcc_receiver"];
	document.getElementById("contents").value = templMessage;
	readCustomerDataFromDB(tableFillInToo);

}


function fillEmailPageWithData(config) {
	/*
	 * this is the callback filling the E-mail form from configuration
	 * 
	 */	
	configInDB = config;
	console.log("--fillEmailPageWithData--");
	
	console.log(config);
	document.getElementById("subject").value = config["subject"];

	templMessage= config["message"];      // a global in "emailPage.js"

	// fill in the form used for editing the template
	//
	document.getElementById("email").value = "";
	document.getElementById("bcc").value = config["bcc_receiver"];
	document.getElementById("contents").value = templMessage;
	readCustomerDataFromDB(tableFillIn);

}


function findCustomerInPouchAndShowPage(custid, remove) {
	/*
	 * find doc having  "_id" = "custid"
	 * optionally remove it
	 */   
	console.log("---findCustomerInPouchAndShowPage---");
	// var db = new PouchDB('customers');

	if (remove == false) {
		// fetching customer and show page 
		db.get(custid)
		.then(function (doc) {
			// console.log(doc);
			oneDocFromDBresultAndCustEdit(doc,custid);
			return doc;
		})
		.catch(function (err) {
			console.log(err);
			return null;
		});
	} // end if
	else {
		// removing customer
		console.log("removing customer having custid that was just added");
		//var dbOrd = new PouchDB('orders');
		//var remoteDbCust =  new PouchDB('http://admin:admin@localhost:5984/remcust');
		var remoteDbCust =  PouchDB(couchdbURL+'remcust');
		//var remoteDbOrders =  new PouchDB('http://admin:admin@localhost:5984/remorders');
		var remoteDbOrders =  PouchDB(couchdbURL+'remorders');

		db.get(custid)
		.then(function (doc) {
			db.remove(doc._id, doc._rev);
		})
		.then(function () {
			//------------------ removing order ------
			console.log("removing order");
			var ordid = "internal:"+custid;
			dbOrd.get(ordid)
			.then(function (doc) {
				console.log("---get order OK");
				dbOrd.remove(doc._id, doc._rev);
				return doc;
			})
			.then(function (doc) {
				console.log("---customer and order removed--");
				console.log(doc);
				// both deleted, sync with Couch and show page	
				replicateToCouchAndShowPageToo(db, remoteDbCust, dbOrd, remoteDbOrders, "./custSearch10.html");
				return doc;
			})
			.catch(function (err) {
				console.log(err);
				return null;
			})
		})
		.catch(function (err) {
			console.log(err);
			return null;
		})
	}
}


function findOrderInPouchAndShowPage(orderskey, showHistory, callback) {
	// find doc having  "_id = custid"  
	console.log("---findOrderInPouch---");
	console.log(orderskey);
	var dbOrd = new PouchDB('orders');


	// fetch order having key
	dbOrd.get(orderskey).then(function (doc) {
		console.log(doc);
		//callback(doc,tableRef, showHistory, orderskey);
		callback(doc, showHistory, orderskey);
		return doc;
	}).catch(function (err) {
		console.log(err);
		return null;
	});

	/*
	console.log("removing order");
	dbOrd.get(orderskey).then(function (doc) {
		return db.remove(doc._id, doc._rev).then(function (doc) {
			// sync with Couch 
			replicateToCouch('customers','http://localhost:5984/remcust');
			return doc;
		}).then(function (doc) {
			console.log(doc);
			return doc;
		}).catch(function (err) {
			console.log(err);
			return null;
		});
	});
	 */
}


function initConfiguration(callback) {
	/*
	 * Reads the config from DB using BULK read
	 * if configuration DB is empty then a default configuration 
	 * is created and stored in the DB
	 * else the currrent config is read 
	 * 
	 */
	var obj2;
	var info = PouchDB.replicate(couchdbURL+'remconfig','config', {
		// live: true,
		retry: true
	}).on('complete', function (info) {
		// replication complete
		console.log(info);
		var dbConfig = new PouchDB("config");

		dbConfig.allDocs({
			include_docs: true
		}
		).then(function (resultConfigFromPouch,obj2) {
			console.log("----initConfiguration ----");
			console.log(resultConfigFromPouch);
			var obj = resultConfigFromPouch;
			if(obj['rows'].length == 0) {
				obj2 = setInitConfigInDB();
			}
			else {
				obj2 = obj['rows'][0]["doc"];
				console.log(obj2);
			}
			console.log(obj2);
			callback(obj2);
			return obj2;
		})
		.catch(function (err) {
			// allDocs probl.
			console.log(err);
			return err;
		});
	}).on('error', function (err) {
		// replication error
		console.log("replication error");
		return err 
	})
}


function oneDocFromDBresultAndCustEdit(DBdoc,custid) {

	var docForWidget = {};
	docForWidget[custid] = DBdoc;
	//console.log("---oneDocFromDBresultAndCustEdit-----");
	//console.log(docForWidget);

	createCustomerEditTable(docForWidget,custid);
	return docForWidget;
}


/*
function readCouchTimestamp() {


    var responseText = httpGet("http://127.0.0.1:5984/mydb/_design/showtimestamp/_show/timestamp");

	// http://127.0.0.1:5984/mydb/_design/showtimestamp/_show/timestamp

    console.log(responseText);

    sleep(1000);
    responseText = httpGet("http://127.0.0.1:5984/mydb/_design/showtimestamp/_show/timestamp");

    console.log(responseText);
}
 */


function readConfigurationFromDb(callback) {
	/*
	 * reads the config from DB using GET
	 */
	var obj2;
	var info = PouchDB.replicate(couchdbURL+'remconfig','config', {
		// live: true,
		retry: true
	}).on('complete', function (info) {
		// replication complete
		console.log(info);
		var dbConfig = new PouchDB("config");

		// fetch dox from local db
		dbConfig.get("CONF0001")
		.then(function (doc) {
			// get current rev
			console.log("---get of doc is OK----");
			console.log(doc);

			//
			callback(doc);
			return doc;
		})
		.catch(function (err) {
			// get failed
			console.log(err);
			return err;
		});
	}).on('error', function (err) {
		// replication error
		console.log("replication error");
		return err 
	})
}


function readCustomerDataFromDB(callback) {

	console.log("---readCustomerDataFromDB 1---");
	
	var info = PouchDB.replicate(couchdbURL+'remcust','customers', {
		// live: true,
		retry: true
	}).on('complete', function (info) {
		console.log(info);
		// replicate Orders from Couch
		readOrdersDataFromDB(null);
		var database = new PouchDB('customers');
		database.allDocs({
			include_docs: true
		})
		.then(function (resultCustFromPouch) {
			console.log("readCustomerDataFromDB 2");
			console.log(resultCustFromPouch);
			// here DB format is converted to Widget format
			retrieveDocsFromDBresult(resultCustFromPouch,callback);
		})
		.catch(function (err) {
			console.log(err);
		});
	}).on('error', function (err) {
		// at replication we get autentication error
		console.log(err);
	});
}


function readCustomerDataFromFile(callback) {

	//*******************************************************
	// read data from file 
	$.ajax({
		url: 'customers3.json',
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function(data) {   // ajax callback function
			//if (typeof callback === "function") {
			// handle the data read
			var res = storeBulkInPouchAndRead(data,callback); 
			console.log(data);
			//}
		}
	});  //ajax

}


function readOrdersDataFromDB(callback) {
	//console.log("readOrdersDataFromDB 1");
	var info = PouchDB.replicate(couchdbURL+'remorders','orders', {
		// live: true,
		retry: true
	}).on('complete', function (info) {
		console.log(info);
		//var database = new PouchDB('orders');
		if(callback != null) {   // check if function instead!!!
			var dbOrd = new PouchDB("orders");
			dbOrd.allDocs({
				include_docs: true
			}).then(function (resultOrdersFromPouch) {
				//console.log("readOrdersDataFromDB 2");
				//console.log(resultPouch);
				// here DB format is converted to Widget format
				retrieveDocsFromDBresult(resultOrdersFromPouch,callback);
			}).catch(function (err) {
				console.log(err);
			});
		}
	}).on('error', function (err) {
		console.log("handle error");
	});
}


function readOrdersDataFromDbAndAddThem(custArr,callback) {
	//console.log("readOrdersDataFromDB 1");
	var info = PouchDB.replicate(couchdbURL+'remorders','orders', {
		// live: true,
		retry: true
	}).on('complete', function (info) {
		console.log(info);
		//var database = new PouchDB('orders');
		if(callback != null) {   // check if function instead!!!
			var dbOrd = new PouchDB("orders");
			dbOrd.allDocs({
				include_docs: true
			}).then(function (resultOrdersFromPouch) {
				//console.log("readOrdersDataFromDB 2");
				//console.log(resultPouch);
				// here DB format is converted to Widget format
				//retrieveDocsFromDBresult(resultOrdersFromPouch,callback);
				callback(custArr,resultOrdersFromPouch);
			}).catch(function (err) {
				console.log(err);
			});
		}
	}).on('error', function (err) {
		console.log("handle error");
	});
}


function readOrdersDataFromFile(callback) {

	//*******************************************************
	// perhaps test here if DB has data or not insted of using result

	// read data from file
	console.log("readOrdersDataFromFile");

	$.ajax({
		url: 'orders2.json',
		dataType: 'json',
		type: 'get',
		cache: false,
		success: function(data) {   // ajax callback function
			//if (typeof callback === "function") {
			// handle the data read
			console.log("readOrdersDataFromFile - success");
			console.log(data);
			var res = storeBulkInPouchAndReadOrders(data,callback); 
		},
		error: function (error) {
			console.log("error");
			console.log(error);
		}
	});  //ajax
}


function replicateToCouch(localDb,remoteDb) {

	var info = PouchDB.replicate(localDb,remoteDb, {
		// live: true,
		retry: true
	}).on('complete', function (info) {
		console.log("complete!");
		console.log(info);
		//location.assign(pageURL);
	}).on('error', function (err) {
		console.log("handle error");
	})
}


function replicateToCouchAndShowPage(localDb,remoteDb,pageURL) {

	var info = PouchDB.replicate(localDb,remoteDb, {
		// live: true,
		retry: true
	}).on('complete', function (info) {
		console.log(info);
		location.assign(pageURL);
	}).on('error', function (err) {
		console.log("handle error");
	})

}


function replicateToCouchAndShowPageToo(localCustDb, remoteCustDb, localOrdersDb, remoteOrdersDb, pageURL) {


	// replicate customer
	var info = PouchDB.replicate(localCustDb,remoteCustDb, {
		retry: true
	}).on('complete', function (infoCust) {
		console.log(infoCust);
		//replicate order
		var info = PouchDB.replicate(localOrdersDb,remoteOrdersDb, {
			retry: true
		}).on('complete', function (infoOrders) {
			console.log(infoOrders);
			// everyting replicated, show page
			location.assign(pageURL);
		}).on('error', function (errOrders) {
			console.log(errOrders);
		})
	}).on('error', function (errCust) {
		console.log(errCust);
	})
}


function retrieveDocsFromDBresult(DbAllDocsResult,callback) {
	// prepares DbAllDocsResult for JQuery widget and calls the widget
	var obj = DbAllDocsResult;
	var docs = obj["rows"];
	var docsForWidget = new Object();

	// call widget, "callback" is function containg the JQurery widget used when creating the page 
	if (typeof callback === "function") {
		if (callback === "createCustomersTable" ) {
			for(var i=0; i < docs.length; i++) {
				docsForWidget[docs[i]["doc"]["_id"]]= docs[i]["doc"];
			}	 
		}
		else {
			// here's the ordersTable...no changes yet :-)
			for(var i=0; i < docs.length; i++) {
				docsForWidget[docs[i]["doc"]["_id"]]= docs[i]["doc"];
			}	 
		}
		callback(docsForWidget); 
	}
	return docsForWidget;
}


function setInitConfigInDB() {
	// sets a default configuration in the DB
	var obj = {};
	var dbConfig = new PouchDB('config');


	obj["_id"] = "CONF0001";
    // product data
	obj["serlatoa_price"] = "160";
	obj["serlahh_price"] = "150";
	obj["lambitoa_price"] = "180";
	obj["lambihh_price"] = "160";

	// E-mail config
	obj["bcc_receiver"] = "slasktrattkonto@gmail.com";
	obj["subject"] = "Bäste kund,";
	obj["message"] = "";
	// store in DB
	dbConfig.put(obj)
	.then(function(responseConf) {
		// config successfully added
		console.log(responseConf);
	})
	.then(function(){
		// here we do the replication....
		var info = PouchDB.replicate('config',couchdbURL+'remconfig', {
			retry: true
		}).on('complete', function (infoConfig) {
			console.log(infoConfig);
			return infoConfig;
		}).on('error', function (errConfig) {
			// rplication failed
			console.log(errConfig);
			return errConfig;
		})	 
	})
	.catch(function (err) {
		// add failed
		console.log(err);
		return err;
	});
	return obj;
}


function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}


function storeBulkInPouchAndRead(jsonData,callback) {
	// if jsonData != null, creates DB with jsonData
	// else reads the DB
	var db = new PouchDB('customers');
	//var remoteDb = new PouchDB('http://admin:admin@localhost:5984/remcust');
	var remoteDb =  PouchDB(couchdbURL+'remcust');

	if(jsonData != null) {
		console.log("callback is null");
		console.log(jsonData);
		// load data read from file into DB
		db.destroy().then(function () {
			return new PouchDB('customers');
		}).then(function (db) {
			// storing all docs in Pouch
			db.bulkDocs(jsonData).then(function () {
				return db.allDocs({include_docs: true});
			}).then(function (resultPouch) {
				// store in Couch and display startpage
				// the page reads Pouch again....
				replicateToCouchAndShowPage('customers',couchdbURL+'remcust',"./custSearch10.html");
			}).catch(function (err) {
				console.log(err);
			});  // end catch
		}) // end then
	}
	else {
		// just read all docs from DB
		//----	db = new PouchDB('customers');
		db.allDocs({
			include_docs: true
		}).then(function (resultPouch) {
			retrieveDocsFromDBresult(resultPouch,callback);
		}).catch(function (err) {
			console.log(err);
		});
	}
} 


function storeBulkInPouchAndReadOrders(jsonData,callback) {
	// if jsonData != null, creates DB with jsonData
	// else reads the DB
	console.log("storeBulkInPouchAndReadOrders");

	var dbOrd = new PouchDB('orders');
	//var remoteDb = new PouchDB('http://admin:admin@localhost:5984/remorders');
	var remoteDb =  PouchDB(couchdbURL+'remorders');

	if(jsonData != null) {
		// load data read from file into DB
		console.log("jsonData !null");
		dbOrd.destroy().then(function () {
			return new PouchDB('orders');
		}).then(function (dbOrd) {
			// storing all docs in Pouch
			dbOrd.bulkDocs(jsonData).then(function () {
				return dbOrd.allDocs({
					include_docs: true
				});
			}).then(function (resultPouch) {
				// store in Couch and display startpage
				console.log("replicating to remorders");
				replicateToCouchAndShowPage('orders',couchdbURL+'remorders',"./ordersOverview.html");
			}).catch(function (err) {
				console.log(err);
			});  // end catch
		}) // end then
	}
	else {
		// just read all docs from DB
		//----	db = new PouchDB('customers');
		dbOrd.allDocs({
			include_docs: true
		}).then(function (resultPouch) {
			retrieveDocsFromDBresult(resultPouch,callback);
		}).catch(function (err) {
			console.log(err);
		});
	}
} 


function tableFillIn(customers) {

	console.log(customers);

	var j = 0;
	var custArr = [];
	var transactArr = [];
	var Obj1 = {};
	var par = customers; 

	console.log(par);

	for(var key in par) {
		if(par[key]["sendemail"]=="Ja") {
			Obj1 = {};
			Obj1["key"] = key;
			Obj1["email"] = par[key]["emailaddress"];
			Obj1["orderskey"] = par[key]["orderskey"];
			custArr.push(Obj1);
		} // if
	} // for

	// get all orders and add them too
	readOrdersDataFromDbAndAddThem(custArr,tableFillInMailCustomersAndTheirOrders);

}


function tableFillInBulkEmails(custArr,orders) {
	console.log("---tableFillInBulkEmails----");
	console.log(custArr);
	console.log(orders);
	console.log("----config---");
	console.log(configInDB);
	
	// make orders fit emailsObj
	var obj = orders;
	var docs = obj["rows"];
	var docsForWidget = new Object();
	for(var i=0; i < docs.length; i++) {
		docsForWidget[docs[i]["doc"]["_id"]]= docs[i]["doc"];
	}	 
    var par = docsForWidget;
	  
	for(k=0; k < custArr.length; k++) {		
		// length is the number of E-mails to send
		
		var emailsObj = {};
		// set E-mail data
		emailsObj["email"] = custArr[k].email; 
	    emailsObj["bcc"] = configInDB["bcc_receiver"];	   
		emailsObj["subject"] = configInDB["subject"];
		
		var descriptTempl =  configInDB["message"];
		// set variables for compilation of description
		var keyToo = "internal:"+custArr[k].key; 
		// look for  Tn with highest "n" 
		var n = findHighestNinOrder(par[keyToo]);
		// here n = 0 must be handled separately....n=0  means Tx
		var prop = "";
		if(n==0) {
			prop = "Tx";
		} else {
			prop = 'T'+n;
		}
        var custid = custArr[k].key;
		var _KUNDNR = custArr[k].key; 
		var _LAMBIHH = par[keyToo][prop]["lambihh"];
		var _LAMBITOA = par[keyToo][prop]["lambitoa"];
		var _SERLAHH = par[keyToo][prop]["serlahh"];
		var _SERLATOA = par[keyToo][prop]["serlatoa"];
		var _TOTALCOST= par[keyToo][prop]["totalcost"];

		// compile description here...
		var compiled = _.template(descriptTempl);

		emailsObj["description"] = 
			compiled({KUNDNR: _KUNDNR, SERLATOA: _SERLATOA, SERLAHH: _SERLAHH, LAMBITOA: _LAMBITOA, LAMBIHH: _LAMBIHH, SUMMA: _TOTALCOST});
		
		console.log(emailsObj);
		// only one thread here...sleep may be needed
		// perhaps also store in DB and send later on other page?
		sendEmail(emailsObj,custid);
	}
}


function tableFillInMailCustomersAndTheirOrders(custArr,orders) {

	console.log("--tableFillInMailCustomersAndTheirOrders--");
	console.log(orders);

	// make orders fit Obj2
	var obj = orders;
	var docs = obj["rows"];
	var docsForWidget = new Object();
	for(var i=0; i < docs.length; i++) {
		docsForWidget[docs[i]["doc"]["_id"]]= docs[i]["doc"];
	}	 

	var par = docsForWidget;
	console.log(par);

	var tableRef = "";
	tableRef = document.getElementById('nisse').getElementsByTagName('tbody')[0];

	for(k=0; k < custArr.length; k++) {

		var newRow  = tableRef.insertRow(tableRef.rows.length);
		newRow.insertCell(0).innerHTML = custArr[k].key;  // was l before
		newRow.insertCell(1).innerHTML = custArr[k].email;  //was l before


		var keyToo = "internal:"+custArr[k].key; 
		// look for  Tn with highest "n" 
		var n = findHighestNinOrder(par[keyToo]);
		// here n = 0 must be handled separately....n=0  means Tx
		// fix this!! use T0 instaed of Tx
		var prop = "";
		if(n==0) {
			prop = "Tx";
		} else {
			prop = 'T'+n;
		}

		newRow.insertCell(2).innerHTML = par[keyToo][prop]["lambihh"];
		newRow.insertCell(3).innerHTML = par[keyToo][prop]["lambitoa"];
		newRow.insertCell(4).innerHTML = par[keyToo][prop]["serlahh"];
		newRow.insertCell(5).innerHTML = par[keyToo][prop]["serlatoa"];
		newRow.insertCell(6).innerHTML = par[keyToo][prop]["totalcost"];

		newRow.addEventListener("click", function() {clickOnRow(
				(this).cells[0].innerHTML,
				(this).cells[1].innerHTML,
				(this).cells[2].innerHTML,
				(this).cells[3].innerHTML,
				(this).cells[4].innerHTML,
				(this).cells[5].innerHTML,
				(this).cells[6].innerHTML
		)
		})
		$('table').trigger('update');
	} // end for 
}


function tableFillInToo(customers) {
    console.log("---- tabelFillInToo---");
	console.log(customers);

	var j = 0;
	var custArr = [];
	var transactArr = [];
	var Obj1 = {};
	var par = customers; 

	console.log(par);

	for(var key in par) {
		if(par[key]["sendemail"]=="Ja") {
			Obj1 = {};
			Obj1["key"] = key;
			Obj1["email"] = par[key]["emailaddress"];
			Obj1["orderskey"] = par[key]["orderskey"];
			custArr.push(Obj1);
		} // if
	} // for

	// get all orders and add them too, but create other page...tableFillInBulkEmails
	readOrdersDataFromDbAndAddThem(custArr,tableFillInBulkEmails);
}


function updateConfigInPouchAndConfigPage(updatedDoc) {

	var configid = updatedDoc["_id"];
	//var remoteDb =  new PouchDB('http://localhost:5984/remcust');

	// fetch dox from local db
	dbConfig.get(configid)
	.then(function (doc) {
		// get current rev
		console.log("---get of doc is OK----"); 
		// set rev and the rest not chanhed
		updatedDoc["_rev"] = doc["_rev"];
		updatedDoc["bcc_receiver"] = doc["bcc_receiver"];
		updatedDoc["subject"] = doc["subject"];
		updatedDoc["message"] = doc["message"]
		
		return dbConfig.put(updatedDoc);
	})
	.then(function (result) {
		// upadting worked ok
		console.log(result);		
		//replicateToCouchAndShowPage('customers','http://localhost:5984/remcust',"./custSearch10.html");
		replicateToCouchAndShowPage('config',couchdbURL+'remconfig',"./configPage3.html");
		return result;
	}).catch(function (err) {
		console.log(err);
		return null;
	});
}


function updateCustomerInPouchAndCustEdit(updatedDoc) {

	//----db = new PouchDB('customers');
	// update the doc having "_id = customerid" in Pouch                 		
	// here we need to use the latest rev by first 
	// - getting the doc from Pouch, 
	// - extract the rev from the doc that was rerturned
	// - add the rev to the updated doc and
	// - then store it

	var custid = updatedDoc["_id"];
	//var remoteDb =  new PouchDB('http://localhost:5984/remcust');

	// fetch dox from local db
	db.get(custid)
	.then(function (doc) {
		// get current rev
		console.log("---get of doc is OK----");
		var rev = doc["_rev"];
		// update rev and store it
		updatedDoc["_rev"] = rev;
		return db.put(updatedDoc);
	})
	.then(function (result) {
		// upadting worked ok
		console.log(result);		
		//replicateToCouchAndShowPage('customers','http://localhost:5984/remcust',"./custSearch10.html");
		replicateToCouchAndShowPage('customers',couchdbURL+'remcust',"./custEdit6.html?customerid="+custid);
		return result;
	}).catch(function (err) {
		console.log(err);
		return null;
	});
}


function updateCustomerInPouchAndOrderToo(updatedDoc) {
	// updates customer and order...
	//
	// that is also fetch the order for this customer and update the customer name (last record)
	// update the local orders db
	// sync alll DBs
	//
	// first update the customer  having "_id = customerid" in Pouch
	// Here we need to use the latest rev by first 
	// - getting the doc from Pouch, 
	// - extract the rev from the doc that was rerturned
	// - add the rev to the updated doc and
	// - then store it

	var custid = updatedDoc["_id"];

	var remoteDbCust =  PouchDB(couchdbURL+'remcust');
	var remoteDbOrders =  PouchDB(couchdbURL+'remorders');

	// fetch doc from local db
	db.get(custid)
	.then(function (doc) {
		// get current rev
		//console.log("---get of doc is OK----");
		var rev = doc["_rev"];
		// update rev and store it
		updatedDoc["_rev"] = rev;
		return db.put(updatedDoc);
	})
	.then(function (result) {
		// updating customer worked ok
		// fetch again	
		return db.get(custid)
	})
	.then(function (doc) {
		console.log(doc);
		/*
		 * -----   update customername in order---- 
		 */
		var ordid = "internal:"+custid;
		dbOrd.get(ordid)
		.then(function (doc) {
			// update customername in orderdoc
			//console.log("--- fetching order OK-----");
			var orderRev = doc["_rev"];
			var custname = updatedDoc.customername;
			// find order Tx
			var n = findHighestNinOrder(doc);
			doc["_rev"] = orderRev;
			if(n !=0) {
				console.log("---update customer name in Tn !!!!--n="+n);
				doc["T"+n].customername = custname;
			}
			else {
				doc["Tx"].customername = custname;
			}
			return dbOrd.put(doc);
		})
		.then(function (result){
			return dbOrd.get(ordid)
		})
		.then(function (doc) {
			//console.log("------ both docs updated ---");
			//replicateToCouchAndShowPageToo(db, remoteDbCust, dbOrd, remoteDbOrders, "./custSearch10.html");
			console.log("--- replicate ---")
			replicateToCouchAndShowPageToo(db, remoteDbCust, dbOrd, remoteDbOrders, "./custEdit6.html?customerid="+custid);
		}).catch(function (err) {
			console.log(err);
			return doc;
		});
	}).catch(function (err) {
		console.log(err);
		return null;
	});
}


function updateEmailTemplateInDB(updateObj) {

	var configid = "CONF0001";

	// fetch dox from local db
	dbConfig.get(configid)
	.then(function (doc) {
		// get current rev
		console.log("---get of doc is OK----");
		
		// set values that have not changed
		updateObj["_id"] = doc["_id"];
		updateObj["_rev"] = doc["_rev"];
		updateObj["serlatoa_price"] = doc["serlatoa_price"];
		updateObj["serlahh_price"] = doc["serlahh_price"];
		updateObj["lambitoa_price"] = doc["lambitoa_price"]
		updateObj["lambihh_price"] = doc["lambihh_price"];

        console.log(updateObj);
		return dbConfig.put(updateObj);
	})
	.then(function (result) {
		// upadting worked ok
		console.log(result);		
		//replicateToCouchAndShowPage('customers','http://localhost:5984/remcust',"./custSearch10.html");
		replicateToCouchAndShowPage('config',couchdbURL+'remconfig',"./emailPage4.html");
		return result;
	}).catch(function (err) {
		console.log(err);
		return null;
	});
}


function updateOrderInPouchAndOrdersEdit(custid, TnObj) {

	// update the doc in Pouch with latest Tn             		
	// here we need to use the latest rev by first 
	// - getting the doc from Pouch, 
	//  -extract the rev from the doc that was rerturned
	//  - add the rev to the updated doc and
	// - then store it

	//var remoteDbCust =  new PouchDB('http://admin:admin@localhost:5984/remcust');
	var remoteDbCust =  PouchDB(couchdbURL+'remcust');
	//var remoteDbOrders =  new PouchDB('http://admin:admin@localhost:5984/remorders');
	var remoteDbOrders =  PouchDB(couchdbURL+'remorders');
	console.log(TnObj);
	var ordid = "internal:"+custid;
	var myDate = "";

	dbOrd.get(ordid)
	.then(function (doc) {
		// here we need the timestamp from Couch to update TnObj 	
		var client = new HttpClient();
		// include something unique in URL to avoid browser cache issues
		var unique = new Date().getTime();

		//client.get('http://admin:admin@127.0.0.1:5984/mydb/_design/showtimestamp/_show/timestamp?uid='+unique, function(response) {
		client.get(couchdbURL+'mydb/_design/showtimestamp/_show/timestamp?uid='+unique, function(response) {
			console.log(response);
			myDate = new Date(parseFloat(response));
			console.log(myDate);
			TnObj["transactiondate"] = myDate.toISOString();
			var n = findHighestNinOrder(doc);
			// n = 0 corresponds to Tx which means that add T1
			// THis means we add an order having T(n+1)
			var m = parseFloat(n) + parseFloat(1);
			key = "T"+m;
			// add the order to the doc
			doc[key]=TnObj;
			console.log(doc);
			// put doc back in db
			return dbOrd.put(doc);
		});
	})
	.then(function (result){
		// final get
		return dbOrd.get(ordid)
	})
	.then(function (doc) {
		//console.log("------ doc updated ---");
		//replicateToCouchAndShowPageToo(db, remoteDbCust, dbOrd, remoteDbOrders, "./custSearch10.html");

		replicateToCouchAndShowPageToo(db, remoteDbCust, dbOrd, remoteDbOrders, "./ordersEdit3.html?customerid="+custid+"&orderskey=internal:"+custid);
		return doc;
	}).catch(function (err) {
		console.log(err);
		return null;
	});
}


/*
function readCustomerData(result, callback) {
	 //*******************************************************
	 // perhaps test here if DB has data or not insted of using result

	 if(result) {
	 // read data from file 
	 $.ajax({
        url: 'customers3.json',
        dataType: 'json',
        type: 'get',
        cache: false,
        success: function(data) {   // ajax callback function
           if (typeof callback === "function") {
        	  // handle the data read
        	  var res = callback(result, data); 
           }
        }
	 });  //ajax
	}
	 else {
	  // assume DB already has data

	  var res = callback(result,null)
	 }
}
 */


