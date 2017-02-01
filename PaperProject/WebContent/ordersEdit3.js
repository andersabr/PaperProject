


/* list hglobal variables
*/
function listGlobals() {
  var names = "";
  for(var name in this) { names += name + "\n";
  }
  return names;
}



/*  update of orders in DB
*/
function commitToDb() {
	
	/* get data that was submitted (has been validated in form), 
	 * this data is in last row in table 
	 */
	var tableRef = document.getElementById('nisse').getElementsByTagName('tbody')[0];
	rowRef = tableRef.rows[(tableRef.rows.length-1)];
	//alert(rowRef.cells[0].innerHTML+" "+rowRef.cells[1].innerHTML+" "+rowRef.cells[2].innerHTML);
	//alert(rowRef.cells[3].innerHTML+" "+rowRef.cells[4].innerHTML+" "+rowRef.cells[5].innerHTML);
	//alert(rowRef.cells[6].innerHTML+" "+rowRef.cells[7].innerHTML);

	/* create object for DB */
	var obj5 = {};
	obj5["customername"] = customer;
	obj5["lambihh"] = rowRef.cells[2].innerHTML;
	obj5["lambitoa"] = rowRef.cells[3].innerHTML;
	obj5["serlahh"] = rowRef.cells[4].innerHTML;
	obj5["serlatoa"] = rowRef.cells[5].innerHTML;
	obj5["totalcost"] = rowRef.cells[6].innerHTML;   
	obj5["transactiondate"]= "";    // filled in at commit
	
	updateOrderInPouchAndOrdersEdit(customerid, obj5);
	
	/* firebase stuff..
	if((orderskey.substring(0,6)) != "intern") {
		myDataRef = new Firebase("https://popping-fire-3239.firebaseio.com/transactions");
	}
	else {
		myDataRef = new Firebase("https://popping-fire-3239.firebaseio.com/foreningsrullen2/ibksundsvall2/transactions");
	}
	var transactionRef = myDataRef.child(orderskey);
	transactionRef.update(obj6,onComplete3);
	location.reload();
	*/
	
};



/* cancel button action
*/
function cancelUpdate() {
 // remove old data and reload page
 if(oldpara !=null) {
       document.getElementById("myDIV").removeChild(oldpara);
    }
  location.reload();
};



function validation(){
	/*  
	 *validates form input
     * check that all fields are numbers 
     */
    var lambihh = document.getElementById("id_lambihh").value;
    var lambitoa = document.getElementById("id_lambitoa").value;
    var serlahh = document.getElementById("id_serlahh").value;
    var serlatoa = document.getElementById("id_serlatoa").value;
    var numberReg = /^[0-9]*$/;
    if( lambihh ===''|| lambitoa ==='' || serlahh ==='' || serlatoa === '' ) {
        alert("Alla fält måste fyllas i.");
        return false;
    }
    else if(!(numberReg.test(lambihh) && numberReg.test(lambitoa) && numberReg.test(serlahh) && numberReg.test(serlatoa) )) {
       alert("Endast heltalssiffror i fälten.");
       return false;
    }
    else {
      return true;
    }
}


/* global for storing old/default div "myDiv" (page without DB update section)
*/
var oldpara;


function buildCommitOrder(config) {
	console.log("--buildCommitOrder----");
	console.log(config);
	
	var lambihh = document.getElementById("id_lambihh").value;
	var lambitoa = document.getElementById("id_lambitoa").value;
	var serlahh = document.getElementById("id_serlahh").value;
	var serlatoa = document.getElementById("id_serlatoa").value;

	if(!validation()){
		return;
	}

    /* display in list of changes in div on window
     */
    var para = document.createElement("P");
    para.className = "dbupdate";

    var commitB = document.createElement("input");
	commitB.type = "button";
	commitB.value = "Bekräfta";
	commitB.onclick =  commitToDb;  // the function called when pressing commit button
    commitB.className = "updatebutton1";

    var cancelB = document.createElement("input");
    cancelB.type = "button";
	cancelB.value = "Annulera";
	cancelB.onclick = cancelUpdate;
    cancelB.className = "updatebutton2";

	para.appendChild(commitB);
    para.appendChild(cancelB);
    para.appendChild(document.createElement("br"));
	para.appendChild(document.createElement("br"));
	para.appendChild(document.createTextNode("Uppdatering av databas för "+customer +" ("+customerid+")"));
    para.appendChild(document.createElement("br"));
    //alert("lambihh= "+lambihh + " lambitoa= "+lambitoa + " serlahh= "+serlahh+ " serlatoa= "+serlatoa);
    para.appendChild(document.createElement("br"));
    para.appendChild(document.createTextNode("Beställnings Nr: "+"internal:"+customerid+":T"+ (orderlength)));
    para.appendChild(document.createElement("br"));
    para.appendChild(document.createTextNode("Lambi Hushåll: "+lambihh));
    para.appendChild(document.createElement("br"));
    para.appendChild(document.createTextNode("Lambi Toalett: "+lambitoa));
    para.appendChild(document.createElement("br"));
    para.appendChild(document.createTextNode("Serla Hushåll:"+serlahh));
	para.appendChild(document.createElement("br"));
    para.appendChild(document.createTextNode("Serla Toalett:"+serlatoa));
	para.appendChild(document.createElement("br"));

	// calculate totalcost from products info ----------------------------------------------------
	// make a config DB where we have this and much more...

	//var totalcost = 1*lambihh*lambihh_price + 1*lambitoa*lambitoa_price + 1*serlahh*serlahh_price + 1*serlatoa*serlatoa_price;
	
   var totalcost = 1 * lambihh*config.lambihh_price + 1 * lambitoa*config.lambitoa_price + 1 * serlahh*config.serlahh_price + 1 * serlatoa*config.serlatoa_price;
	
	para.appendChild(document.createTextNode("Totalkostnad:"+totalcost));
	para.appendChild(document.createElement("br"));


	var tableRef = document.getElementById('nisse').getElementsByTagName('tbody')[0];
	//  put data in table dummy record (orderlength) aswell, timestamp is calculated at commit

	/* update the row in table, index in table starts with 0 */
	var newRow  = tableRef.insertRow((tableRef.rows.length-1));
	tableRef.deleteRow((tableRef.rows.length)-1);
	newRow.insertCell(0).innerHTML = "internal:"+customerid+":T"+orderlength;
	newRow.insertCell(1).innerHTML = customer;
	newRow.insertCell(2).innerHTML = lambihh;
	newRow.insertCell(3).innerHTML = lambitoa;
	newRow.insertCell(4).innerHTML = serlahh;
	newRow.insertCell(5).innerHTML = serlatoa;
	newRow.insertCell(6).innerHTML = totalcost;
	newRow.insertCell(7).innerHTML = "Tidsstämpel sätts vid \"Bekräfta\"";   // date will be set at commit

	// clear old data
	if(oldpara !=null) {
		document.getElementById("myDIV").removeChild(oldpara);
	}

   // insert new
   document.getElementById("myDIV").appendChild(para);
   oldpara = para;
	
	
}


function submit_by_name() {
	/* 
	 * submitting the input form containing the order data
	 * 
	 * First reads the config in DB and then builds the page in callabck buildCommitOrder();
	 */	 
	
	readConfigurationFromDb(buildCommitOrder);

}




$(function() {
	$("#nisse")
	.tablesorter({
		theme : 'blue',

		widgets: ['editable'],
		widgetOptions: {
			// define editable columns
			editable_columns       : [],
			// or "0-2" (v2.14.2); point to the columns to make editable (zero-based index)
			editable_enterToAccept : true,          // press enter to accept content, or click outside if false
			editable_autoAccept    : false,          // accepts any changes made to the table cell automatically (v2.17.6)
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
	}) // end tablesorter
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

		valueHasChanged(cellIndex,newContent);

		/*  howto post things to a site using php
			$.post("mysite.php", {
				"row"     : rowIndex,
				"cell"    : cellIndex,
				"content" : newContent
			});
		 */
	}); // end children
});  // end function


/*
 * Globals
 */
var orderskey = getQueryString('orderskey');
var customerid = getQueryString('customerid');
var myDataRef = "";
var firstOrder = false;
var orderlength = "";
var customer;
var showHistory;




//function createOrdersEdit(doc, tableRef, showHistory, orderskey) {
function createOrdersEdit(doc, showHistory, orderskey) {

	console.log("---createOrdersEdit1 ---");
	console.log("showHistory: "+showHistory);	
	console.log("orderskey: "+orderskey);
	console.log("doc: "+doc);

	var n = findHighestNinOrder(doc);
	Object.keys(doc).forEach(function(key) {
		/*
    		 console.log(key);
    		 console.log(doc[key]);
		 */
		var newRow  = tableRef.insertRow(tableRef.rows.length);
		var objTo = doc[key];
		if(n == 0) {
			var searchKey = "Tx";
		}
		else {
			var searchKey = "T"+n;
		}
		if(!showHistory) {
			if(key == searchKey) {
				newRow.insertCell(0).innerHTML = orderskey+":"+key;
				newRow.insertCell(1).innerHTML = objTo.customername;
				newRow.insertCell(2).innerHTML = objTo.lambihh;
				newRow.insertCell(3).innerHTML = objTo.lambitoa;;
				newRow.insertCell(4).innerHTML = objTo.serlahh;
				newRow.insertCell(5).innerHTML = objTo.serlatoa;
				newRow.insertCell(6).innerHTML = objTo.totalcost;
				newRow.insertCell(7).innerHTML = objTo.transactiondate;
				customer = objTo.customername;
			}
		}
		else {
			if( !    ((key === "_id") || (key === "_rev"))    ) {
				newRow.insertCell(0).innerHTML = orderskey+":"+key;
				newRow.insertCell(1).innerHTML = objTo.customername;
				newRow.insertCell(2).innerHTML = objTo.lambihh;
				newRow.insertCell(3).innerHTML = objTo.lambitoa;;
				newRow.insertCell(4).innerHTML = objTo.serlahh;
				newRow.insertCell(5).innerHTML = objTo.serlatoa;
				newRow.insertCell(6).innerHTML = objTo.totalcost;
				newRow.insertCell(7).innerHTML = objTo.transactiondate;
				customer = objTo.customername;
			}
		}

		if(objTo.transactiondate == "xxxx-xx-xx" && tableRef.rows.length==1) {
			// first time order is entered
			firstOrder = true;
		}
	});

	
	orderlength = tableRef.rows.length - 2;   // exclude "_id" and "_rev"
	
	console.log("---createOrdersEdit3---");
	console.log("showHistory: "+showHistory);	
	console.log("orderskey: "+orderskey);
	console.log("orderlength: "+orderlength);

    // ======================  Creating paragraph containing input for order (orderDIV)
	
	var cPAGE =  document.getElementById("orderDIV");
    var cP = document.createElement("P");   // change this to table???
    cP.className = "orderFormInput";
	    
	cP.appendChild(document.createTextNode("Uppdatering av orderinfo för "+customer+" ("+customerid+")"));
    cP.appendChild(document.createElement("br"));
	cP.appendChild(document.createElement("br"));

    // Creating a form for the input 
    var cFORM = document.createElement('form');
    cFORM.setAttribute("action", "#"); 
    cFORM.setAttribute("method", "post");   // why not "onsubmit" ???
    cFORM.setAttribute("name", "form_name");
    cFORM.setAttribute("id", "from_id");
    cFORM.setAttribute("class", "form_class");
        
    var cTABLE = document.createElement('table');

    // LAMBI HUSHÅLL
    
 	var cTR = document.createElement('tr');
 	var cTD = document.createElement('td');
    var cLABEL = document.createElement('label');
    cLABEL.innerHTML = "Lambi Hushåll : "; 
    cTD.appendChild(cLABEL);
    cTR.appendChild(cTD);
    
	cTD = document.createElement('td');
    var cINPUT = document.createElement('input');
    cINPUT.setAttribute("type", "text");
    cINPUT.setAttribute("name", "name_lambihh");
    cINPUT.setAttribute("id", "id_lambihh");
    cTD.appendChild(cINPUT);
    cTR.appendChild(cTD);
   
    cTABLE.appendChild(cTR);
   
    
    // LAMBI TOA
    
    cTR = document.createElement('tr');
 	cTD = document.createElement('td');
    cLABEL = document.createElement('label');
    cLABEL.innerHTML = "Lambi Toalett : ";
    cTD.appendChild(cLABEL);
    cTR.appendChild(cTD);
    
    cTD = document.createElement('td');
    cINPUT = document.createElement('input');
    cINPUT.setAttribute("type", "text");
    cINPUT.setAttribute("name", "name_lambitoa");
    cINPUT.setAttribute("id", "id_lambitoa");
    cTD.appendChild(cINPUT);
    cTR.appendChild(cTD);
    
    cTABLE.appendChild(cTR);
    
    // SERLA HUSHÅLL
    cTR = document.createElement('tr');
 	cTD = document.createElement('td');
    cLABEL = document.createElement('label');
    cLABEL.innerHTML = "Serla Hushåll : ";
    cTD.appendChild(cLABEL);
    cTR.appendChild(cTD);
    
    cTD = document.createElement('td');
    cINPUT = document.createElement('input');
    cINPUT.setAttribute("type", "text");
    cINPUT.setAttribute("name", "name_serlahh");
    cINPUT.setAttribute("id", "id_serlahh");
    cTD.appendChild(cINPUT);
    cTR.appendChild(cTD);
    
    cTABLE.appendChild(cTR);
    
    // SERLA TOA
    
    cTR = document.createElement('tr');
 	cTD = document.createElement('td');
    cLABEL = document.createElement('label');
    cLABEL.innerHTML = "Serla Toalett : ";
    cTD.appendChild(cLABEL);
    cTR.appendChild(cTD);
    
    cTD = document.createElement('td');
    cINPUT = document.createElement('input');
    cINPUT.setAttribute("type", "text");
    cINPUT.setAttribute("name", "name_serlatoa");
    cINPUT.setAttribute("id", "id_serlatoa");
    cTD.appendChild(cINPUT);
    cTR.appendChild(cTD);
    
    cTABLE.appendChild(cTR);  
    
    cTR = document.createElement('tr');
 	cTD = document.createElement('td');
	cINPUT = document.createElement('input');
    cINPUT.setAttribute("type", "button");
    cINPUT.setAttribute("name", "submit_name");
    cINPUT.setAttribute("id", "button_name");
    cINPUT.setAttribute("value", "Spara Beställning");
    cINPUT.setAttribute("onclick", "submit_by_name()");
    cINPUT.setAttribute("class", "submitbutton");

    /*
     same in config page....
	cINPUT = document.createElement('input');
	cINPUT.setAttribute("type","submit");
	cINPUT.setAttribute("value","Spara konfiguration");	
	cTD.appendChild(document.createElement('br'));
	cTD.appendChild(cINPUT);
    */
    
    cTD.appendChild(document.createElement("br"));
    cTD.appendChild(cINPUT);
    cTR.appendChild(cTD);
    cTABLE.appendChild(cTR);
    cFORM.appendChild(cTABLE);
    
    cP.appendChild(cFORM);
    cPAGE.appendChild(cP);

}
      
      /******** POC
      
      // just reading one doc from DB
      myDataRef.orderByKey().equalTo(orderskey).on("child_added", function(snapshot) {
    	  
          var transObj = snapshot.val();
          var transKey = snapshot.key();
          var numOfChildren = snapshot.numChildren();

          // 4 children -> show only  T3
          // 1 child -> show only Tx


	      Object.keys(transObj).forEach(function(key) {
	           var newRow  = tableRef.insertRow(tableRef.rows.length);
               var objTo = transObj[key];
               if(numOfChildren == 1) {
			       var searchKey = "Tx";
			   }
			   else {
			      var searchKey = "T"+(numOfChildren-1);
               }
               if(!showHistory) {
                  if(key == searchKey) {
                     newRow.insertCell(0).innerHTML = key;
		             newRow.insertCell(1).innerHTML = objTo.customername;
		             newRow.insertCell(2).innerHTML = objTo.lambihh;
		             newRow.insertCell(3).innerHTML = objTo.lambitoa;;
		             newRow.insertCell(4).innerHTML = objTo.serlahh;
		             newRow.insertCell(5).innerHTML = objTo.serlatoa;
		             newRow.insertCell(6).innerHTML = objTo.totalcost;
		             newRow.insertCell(7).innerHTML = objTo.transactiondate;
		          }
		        }
                else {
		            newRow.insertCell(0).innerHTML = key;
				    newRow.insertCell(1).innerHTML = objTo.customername;
				    newRow.insertCell(2).innerHTML = objTo.lambihh;
				    newRow.insertCell(3).innerHTML = objTo.lambitoa;;
				    newRow.insertCell(4).innerHTML = objTo.serlahh;
				    newRow.insertCell(5).innerHTML = objTo.serlatoa;
				    newRow.insertCell(6).innerHTML = objTo.totalcost;
		            newRow.insertCell(7).innerHTML = objTo.transactiondate;
                }

		        if(objTo.transactiondate == "xxxx-xx-xx" && tableRef.rows.length==1) {
		          // first time order is entered
                  firstOrder = true;
		        }
		        customer = objTo.customername;
		        //alert("document ready: "+customer);
	      }); // for each
          //alert(showHistory);
	      orderlength = tableRef.rows.length;
          $('table').trigger('update');


		            // ====================== POC create paragraph containing input for order 
		            var para2 = document.createElement("P");
		            para2.className = "orderFormInput";

		  		  // para2.appendChild(document.createElement("br"));
		  		  // para2.appendChild(document.createElement("br"));
		            para2.appendChild(document.createTextNode("Uppdatering av orderinfo för "+customer+" ("+customerid+")"));
		            para2.appendChild(document.createElement("br"));

		            // POC creating a form for the input 
		            var createform = document.createElement('form'); // Create New Element Form
		            createform.setAttribute("action", "#"); // Setting Action Attribute on Form
		            createform.setAttribute("method", "post"); // Setting Method Attribute on Form
		            createform.setAttribute("name", "form_name");
		            createform.setAttribute("id", "from_id");
		            createform.setAttribute("class", "form_class");

		            // POC here the form is added to the paragraph 
		            para2.appendChild(createform);

		            var linebreak = document.createElement('br');
		            createform.appendChild(linebreak);

		            var lambihhlabel = document.createElement('label'); // Create Label for Name Field
		            lambihhlabel.innerHTML = "Lambi Hushåll : "; // Set Field Labels
		            createform.appendChild(lambihhlabel);

		            var lambihhelement = document.createElement('input');
		            lambihhelement.setAttribute("type", "text");
		            lambihhelement.setAttribute("name", "name_lambihh");
		            lambihhelement.setAttribute("id", "id_lambihh");

		            createform.appendChild(lambihhelement);

		            var linebreak = document.createElement('br');
		            createform.appendChild(linebreak);

		            var lambitoalabel = document.createElement('label');
		            lambitoalabel.innerHTML = "Lambi Toalett : ";
		            createform.appendChild(lambitoalabel);

		            var lambitoaelement = document.createElement('input');
		            lambitoaelement.setAttribute("type", "text");
		            lambitoaelement.setAttribute("name", "name_lambitoa");
		            lambitoaelement.setAttribute("id", "id_lambitoa");
		            createform.appendChild(lambitoaelement);

		            var linebreak = document.createElement('br');
		            createform.appendChild(linebreak);

		            var serlahhlabel = document.createElement('label');
		            serlahhlabel.innerHTML = "Serla Hushåll : ";
		            createform.appendChild(serlahhlabel);

		            var serlahhelement = document.createElement('input');
		            serlahhelement.setAttribute("type", "text");
		            serlahhelement.setAttribute("name", "name_serlahh");
		            serlahhelement.setAttribute("id", "id_serlahh");
		            createform.appendChild(serlahhelement);

		            var linebreak = document.createElement('br');
		            createform.appendChild(linebreak);

		            var serlatoalabel = document.createElement('label');
		            serlatoalabel.innerHTML = "Serla Toalett : ";
		            createform.appendChild(serlatoalabel);

		            var serlatoaelement = document.createElement('input');
		            serlatoaelement.setAttribute("type", "text");
		            serlatoaelement.setAttribute("name", "name_serlatoa");
		            serlatoaelement.setAttribute("id", "id_serlatoa");
		            createform.appendChild(serlatoaelement);

		            var linebreak = document.createElement('br');
		            createform.appendChild(linebreak);
		            var linebreak = document.createElement('br');
		            createform.appendChild(linebreak);

		            var submitelement = document.createElement('input'); // Append Submit Button
		            submitelement.setAttribute("type", "button");
		            submitelement.setAttribute("name", "submit_name");
		            submitelement.setAttribute("id", "button_name");
		            submitelement.setAttribute("value", "Submit");
		            submitelement.setAttribute("onclick", "submit_by_name()");
		            submitelement.setAttribute("class", "submitbutton");
		            createform.appendChild(submitelement);

		            // POC here the paragraph is inserted into the div 
		            document.getElementById("orderDIV").appendChild(para2);
      }, function(error) {
		           console.log("Permission Denied Nisse");
	   }); // end on 
	 *** POC */


function load(){
	/*
	 * Checking if History checkbox is checked or not 
	 */
    var checked = JSON.parse(localStorage.getItem('isHistorySelected'));
    document.getElementById("isHistorySelected").checked = checked;
}

function save(){
    var checkbox = document.getElementById('isHistorySelected');
    localStorage.setItem('isHistorySelected', checkbox.checked);
}


function updateOrder(showHistory) {
    console.log(orderskey.substring(0,6));

    if(showHistory == undefined) {
       showHistory = false;
    }
    console.log("output showHistory : "+showHistory);

    /****** old firebase
    if(orderskey.substring(0,6) != "intern")  {
       myDataRef = new Firebase("https://popping-fire-3239.firebaseio.com/transactions");
    }
    else {
       myDataRef = new Firebase("https://popping-fire-3239.firebaseio.com/foreningsrullen2/ibksundsvall2/transactions");
    }      
    *********/
    
    // get the object that is to be updated
    tableRef = document.getElementById('nisse').getElementsByTagName('tbody')[0];
    
    var doc = findOrderInPouchAndShowPage(orderskey, showHistory, createOrdersEdit);
}




/*
 * page starts here !!!
 *
 */
$(document).ready(function() {
	      // get checkbox value
          load();
          var x = document.getElementById("isHistorySelected").checked;

          updateOrder(x);
}); 
