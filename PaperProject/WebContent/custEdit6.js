
var couchdbURL = 'http://'+localStorage.dbipaddress+':5984/';
/* this arrey represents the cells in a row in the table */
var cellValues = ["","","","","", "","","","","", "","","","","", "","","","","", "","",""];
var oldpara;
var customerid = getQueryString('customerid');
var newcustomer = getQueryString('newcustomer');
var initObj = {};
var customerDataObj;


var valueHasChanged = function (cellIndex, newContent) {
	/*
	 * updpdates the list in the  paragraph showing what is to be submitted to the DB
	 */

	// empty string not allowed because its used as marker for "no change"
	if( newContent == "") {
		newContent = "_";
	}

	cellValues[cellIndex]= newContent;

	// display in list of changes in div on window
	var para = document.createElement("P");
	para.className = "dbupdate";
	console.log("----valueHasChanged---");

	var commitB = document.createElement("input");
	commitB.type = "button";
	commitB.value = "Spara";
	commitB.onclick =  commitToDb;
	commitB.className = "updatebutton1";

	var cancelB = document.createElement("input");
	cancelB.type = "button";
	cancelB.value = "Ångra";
	cancelB.onclick = cancelUpdate;
	cancelB.className = "updatebutton2";


	para.appendChild(commitB);
	para.appendChild(cancelB);
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createElement("br"));

	para.appendChild(document.createTextNode("Uppdateringar av "+customerid+":"));
	para.appendChild(document.createElement("br"));
	// para.appendChild(document.createTextNode("Nr: (N/A)"));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Lag: "+cellValues[1]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Kontakt: "+cellValues[2]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Kundnamn:"+cellValues[3]));
	para.appendChild(document.createElement("br"));

	para.appendChild(document.createTextNode("Leveransadress: "+cellValues[4]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Dist.lista: "+cellValues[5]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Post.nr: "+cellValues[6]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Ort: "+cellValues[7]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Mobiltelefon: "+cellValues[8]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Telefon 2: "+cellValues[9]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Skicka e-post: "+cellValues[10]));
	para.appendChild(document.createElement("br"));

	para.appendChild(document.createTextNode("E-post: "+cellValues[11]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Säljare: "+cellValues[12]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Uppsagt datum: "+cellValues[13]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Kommentar: "));
	para.appendChild(document.createTextNode(cellValues[14]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Bet.sätt: "+cellValues[15]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Leverans: "+cellValues[16]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Lev.kommentar: "+cellValues[17]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Fakt.adress: "+cellValues[18]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Alt.leveransnamn: "+cellValues[19]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Alt.leverransadresst: "+cellValues[20]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Alt.distlista: "+cellValues[21]));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Beställningar: "+cellValues[22]));

	// clear old data
	if(oldpara !=null) {
		document.getElementById("myDIV").removeChild(oldpara);
	}

	// insert new
	document.getElementById("myDIV").appendChild(para);
	oldpara = para;
};


function commitToDb() {

	console.log("-- commitToDB---");

	var remoteDb = new PouchDB(couchdbURL+'remcust');
    remoteDb.getSession()
	.then(function (response){
		if (!response.userCtx.name) {
			// not logged in
			location.assign('loginPage.html?page=custEdit6.html&customerid='+customerid);
		} else if (response.userCtx.name) {
			console.log(response['userCtx']);
		}
	})
	.then(function () {
		var obj1 = {};
		var key = "";
		// create the object "obj1" 
		// "obj1" contains the values that have been updated
		// map goes from 1 to 22, first cell value (customerid is in cellValue[0]) 
		// is not inside the customers object
		for (j=1; j<23; j++) {
			var xyz = cellValues[j];
			if(cellValues[j] !=  "") {
				// value has been updated
				key = mapget(j);
				obj1[key] = xyz;
			}
		}
		var cuname_changed = false;
		// check if customername has changed by user, if so then the ordering data needs update (the last record)
		if("customername" in obj1) {
			cuname_changed = true;
		}

		// add the propeties that have not changed to obj1...now obj1 has differnt meaning :-)
		for (j=1; j<23; j++) {
			if(!(mapget(j) in obj1)) {
				obj1[mapget(j)] = initObj[mapget(j)];
			}
		}

		// set "_id" for Pouch

		obj1["_id"] = customerid;               		
		console.log("--commitToDb--");

		if(cuname_changed) {
			console.log("customer name changed, update order also");
			updateCustomerInPouchAndOrderToo(obj1);
			// updates customer and order...
			//
			// fetch the order for this customer   
			// update the customer name....
			// update the local orders db
			// sync alll DBs
		}
		else {
			console.log("--update customer only--");
			updateCustomerInPouchAndCustEdit(obj1);
		}
	});
};   

     
// if customer name has changed, update the orders for the customer with the new name 
//
// var transRef;
// if(cuname_changed) {
//    var transKey = initObj[mapget(22)];
//    if(transKey != "_") {   
// transaktion exists
// update name in Tx at the end having the new name
//  if(transKey.substring(0,6) != "intern") {
//            transRef = myDataRef.parent().parent().child("transactions/"+transKey+"/Tx");
//       }
//       else {
//          transkey is external, ei githup, google and such
//          transRef = myDataRef.child("transactions/"+transKey+"/Tx");
//     }
// }
// var cunameObj = {};
// cunameObj["customername"] = obj1["customername"];
//if(transRef != null) {

//  }
//}

//delete div content and reload page
//if(oldpara !=null) {
//      document.getElementById("myDIV").removeChild(oldpara);
//}

// if comming from new customer, continue with this path
// if(getQueryString('newcustomer')) {
//	 console.log(newcustomer);
//location.assign("./custEdit5.html?customerid="+customerid+"&newcustomer=true");
// }
// else
// {
//	 console.log("else");
//	 console.log(newcustomer);
// location.assign
// }



function cancelUpdate() {
	// remove old data and reload page
	if(oldpara !=null) {
		document.getElementById("myDIV").removeChild(oldpara);
	}
	location.reload();
};



$(function() {
	$("#nisse")
	.tablesorter({
		theme : 'blue',

		widgets: ['editable'],
		widgetOptions: {
			// define editable columns, the orderskey in 22 shall not be editable
			editable_columns       : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
			// or "0-2" (v2.14.2); point to the columns to make editable (zero-based index)
			editable_enterToAccept : true,          // press enter to accept content, or click outside if false
			editable_autoAccept    : true,          // accepts any changes made to the table cell automatically (v2.17.6)
			editable_autoResort    : false,         // auto resort after the content has changed.
			editable_validate      : null,          // return a valid string: function(text, original, columnIndex){ return text; }
			editable_focused       : function(txt, columnIndex, $element) {
				// $element is the div, not the td
				// to get the td, use $element.closest('td')
				$element.addClass('focused');
			},
			editable_blur          : function(txt, columnIndex, $element) {
				// $element is the div, not the td
				// to get the td, use $element.closest('td')
				$element.removeClass('focused');
			},
			editable_selectAll     : function(txt, columnIndex, $element){
				// note $element is the div inside of the table cell, so use $element.closest('td') to get the cell
				// only select everthing within the element when the content starts with the letter "B"
				return /^b/i.test(txt) && columnIndex === 0;
			},
			editable_wrapContent   : '<div>',       // wrap all editable cell content... makes this widget work in IE, and with autocomplete
			editable_trimContent   : true,          // trim content ( removes outer tabs & carriage returns )
			editable_noEdit        : 'no-edit',     // class name of cell that is not editable
			editable_editComplete  : 'editComplete' // event fired after the table content has been edited
		}
	})
	// config event variable new in v2.17.6
	.children('tbody').on('editComplete', 'td', function(event, config){
		var $this = $(this),
		newContent = $this.text(),
		cellIndex = this.cellIndex, // there shouldnt be any colspans in the tbody
		rowIndex = $this.closest('tr').attr('id'); // data-row-index stored in row id

		// Do whatever you want here to indicate
		// that the content was updated
		$this.addClass( 'editable_updated' ); // green background + white text
		setTimeout(function(){
			$this.removeClass( 'editable_updated' );
		}, 500);

		console.log("calling valueHasChanged");
		//alert("new content="+newContent);
		valueHasChanged(cellIndex,newContent);

		/*  howto post things to a site using php
			$.post("mysite.php", {
				"row"     : rowIndex,
				"cell"    : cellIndex,
				"content" : newContent
			});
		 */
	});

});

/*
var customerid = getQueryString('customerid');
var newcustomer = getQueryString('newcustomer');
var initObj = {};
var customerDataObj;
*/

function createCustomerEditTable(customerData,custid) {
	/* Here the table is created when the page is loaded/reloaded 
	 * 
	 */
	// console.log("----- createCustomerEditTable --");
	// console.log(customerData);
	// console.log(custid);
	customerDataObj = customerData;


	$(document).ready(function() {

		if (newcustomer) {
			// newcustomer is a parameter in the URL of this page
			// show/not show the button using its id (=conditional)
			$('#conditional').css('visibility', 'visible');
			$('#conditional2').css('visibility', 'visible');
		}
		else {
			// dont show "ångra ny kund" 
			$('#conditional').css('visibility', 'hidden');
			$('#conditional2').css('visibility', 'visible');
		}


		
		//get object in table to append to
		var tableRef = document.getElementById('nisse').getElementsByTagName('tbody')[0];

		var key = custid;
		var par = customerData;    
		var newRow  = tableRef.insertRow(tableRef.rows.length);
		newRow.insertCell(0).innerHTML = key;

		// can this be a loop instead using the map of customer object keys?
		newRow.insertCell(1).innerHTML = par[key].team
		initObj["team"] = par[key].team;
		newRow.insertCell(2).innerHTML = par[key].contactperson;
		initObj["contactperson"] = par[key].contactperson;
		newRow.insertCell(3).innerHTML = par[key].customername;
		initObj["customername"] = par[key].customername;
		newRow.insertCell(4).innerHTML = par[key].deliveryaddress;
		initObj["deliveryaddress"] = par[key].deliveryaddress;
		newRow.insertCell(5).innerHTML = par[key].distlist;
		initObj["distlist"] = par[key].distlist;
		newRow.insertCell(6).innerHTML = par[key].postalcode;
		initObj["postalcode"] = par[key].postalcode;
		newRow.insertCell(7).innerHTML = par[key].city;
		initObj["city"] = par[key].city;
		newRow.insertCell(8).innerHTML = par[key].mobile;
		initObj["mobile"] = par[key].mobile;
		newRow.insertCell(9).innerHTML = par[key].phone;
		initObj["phone"] = par[key].phone;
		newRow.insertCell(10).innerHTML = par[key].sendemail;
		initObj["sendemail"] = par[key].sendemail;
		newRow.insertCell(11).innerHTML = par[key].emailaddress;
		initObj["emailaddress"] = par[key].emailaddress;
		newRow.insertCell(12).innerHTML = par[key].salesperson;
		initObj["salesperson"] = par[key].salesperson;
		newRow.insertCell(13).innerHTML = par[key].cancelationday;
		initObj["cancelationday"] = par[key].cancelationday;
		newRow.insertCell(14).innerHTML = par[key].comments;
		initObj["comments"] = par[key].comments;
		newRow.insertCell(15).innerHTML = par[key].paymentmethod;
		initObj["paymentmethod"] = par[key].paymentmethod;

		newRow.insertCell(16).innerHTML = par[key].delivery;
		initObj["delivery"] = par[key].delivery;
		newRow.insertCell(17).innerHTML = par[key].deliverycomment;
		initObj["deliverycomment"] = par[key].deliverycomment;
		newRow.insertCell(18).innerHTML = par[key].billingaddress;
		initObj["billingaddress"] = par[key].billingaddress;
		newRow.insertCell(19).innerHTML = par[key].altdeliveryreceiver;
		initObj["altdeliveryreceiver"] = par[key].altdeliveryreceiver;
		newRow.insertCell(20).innerHTML = par[key].altdeliveryaddress;
		initObj["altdeliveryaddress"] = par[key].altdeliveryaddress;
		newRow.insertCell(21).innerHTML = par[key].altdistlist;
		initObj["altdistlist"] = par[key].altdistlist;
		newRow.insertCell(22).innerHTML = par[key].orderskey;
		initObj["orderskey"] = par[key].orderskey;
		$('table').trigger('update');
		//  });
	});// end ready
}


findCustomerInPouchAndShowPage(customerid, false);   // calls createCustomerEditTable indirectly


function listAllId() {
     // change page
     location.assign("./custSearch10.html");
};



function removeCustomerId() {
       // removes the customer just created and goes back to "kundregistret" 
       // this function is only called for newcustomer

       console.log("removeCustomerId called for "+customerid);
       
    	if(!getQueryString('newcustomer')) {
    		  alert("Endast \"Lägga till ny kund\" går att ångra");
              location.assign("./custEdit6.html?customerid="+customerid);
        } 
    	   
	   // fetch customer just created from Pouch and delete, also delete the order!
	   var docToRemove = findCustomerInPouchAndShowPage(customerid, true);
	      
	   //var par = snapshot.val();
	   //var key = snapshot.key();

	   //if(par.customername != "_") {
	   //      alert("Du måste ta bort kundnamnet innan du Ångrar!!");
	   //      when comming from new customer, continue with this path
	   //      if(getQueryString('newcustomer')) {
	   //          location.assign("./customeredit2.html?customerid="+customerid+"&newcustomer=true");
	   //       }
	   //       else
	   //      {
	   //        location.assign("./customeredit2.html?customerid="+customerid);
	   //      }
	   //  }
	   // OK to remove customer record
	   // });

	   // var numofcust = 0;
	   //var customerid = "";

	   // remnove customername before removing customer

	   // var myCancelRef = new Firebase("https://popping-fire-3239.firebaseio.com/foreningsrullen2/ibksundsvall2");

	   //var keyfound;

	   //var cb1 = myCancelRef.orderByKey().equalTo('customers').on("child_added", function olle(snapshot) {
	   //      var custobj= snapshot.val();
	   //    a = snapshot.numChildren();

	   //console.log(a);
	   //    var found = false;

	   // a starts with 0
	   //    for(i=a; a > 0; a--)  {
	   //        if(!found) {
	   // alert(Object.keys(custobj).length);
	   // list last key
	   //             var lastkey = Object.keys(custobj)[a-1];
	   // get last value

	   //            var lastvalue = custobj[Object.keys(custobj)[a-1]];

	   // console.log(lastvalue);
	   // list all keys in last value as a list
	   // var keys = Object.keys(lastvalue);
	   // console.log(keys);

	   // test if value of customername for lastvalue is "_"
	   //           Object.getOwnPropertyNames(lastvalue).forEach(function(key, array) {
	   //              if(key == "customername") {
	   //                 if(lastvalue[key] == "_") {
	   //                    found=true;
	   //                    keyfound =lastkey;
	   //                    myCancelRef.off("child_added",cb1);
	   //                }
	   //else {
	   //  console.log("false");
	   //}
	   //            }
	   //        });
	   //    } // end if(!found)
	   // } // end for
	   // remove keyfound here

	   // ---------------------------------------------
	   //var obj2 = {};
	   //var key2 = "customername";
	   //obj2[key2] = "hehe";
	   //var obj1 = {};


	   //obj1[key1] = obj2;

	   // go to the customers and remove it
	   //   var keyFoundRef = myCancelRef.child("customers/"+keyfound);
	   //  keyFoundRef.remove();
	   // reload the kundregister page
	   //   location.assign("./customersearch.html");
	   //location.reload()
	   //alert(keyfound);
	   // }); // end on
};


function editOrder() {

	   console.log("editOrder called for "+customerid);
 
	   
	   
		var par = customerDataObj;
		var key = customerid;

		if(par[key].customername=="_") {
			alert("Lägg in ett kundnamn innan du skapar en order. ");
		}
		else {
			//alert("kundnamn OK");
			// stay on page and create a pop-up
			window.open ("./ordersEdit3.html?customerid="+customerid+"&orderskey=internal:"+key,"UpdateWindow","resizable=1,width=900,height=800");
		}
	
};


