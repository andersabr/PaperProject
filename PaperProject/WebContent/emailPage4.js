
var templMessage;  // Global used for current value of Email message
var configInDB;    // Global for lastet read config from DB


$(function(){
	/*
	 * var fullUrl =  location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
	 */
	var mailerUrl = 'http://'+localStorage.dbipaddress+':5000';
	//console.log("mailerUrl: "+mailerUrl);

	/*-----------------------------------------------------------*/
	$("#send").click(function(){
		// This function sends the E-mail to local server
		//  that in its turn sends it on to the SMTP server
		///
		var formData = $("#emailForm").serialize();
		$("#msg").text("Email sending Please wait..");

		var request = $.ajax({
			url: mailerUrl+'/send',
			type: 'POST',
			data: formData,
			dataType: 'html',
			success: function(result) {
				$("#msg").empty().text(result);
				//console.log("ok: "+result);
			},
			error: function(e) {
				$("#msg").empty().text("Error when sending email, Error code:"+e.status +", Error message:"+e.statusText);
				//console.log("not ok: "+e);
			},
			timeout: 60000
		}); // ajax
	});  // send
 

	/*-----------------------------------------------------------*/
	$("#saveTempl").click(function(){
		/* 
		 * this function saves the current E-mail template in the DB
		 */

		//var saveDataRef = new Firebase("https://popping-fire-3239.firebaseio.com/foreningsrullen2/ibksundsvall2/mall/mall1");
		var saveObj = {};

		// E-mail config	
		saveObj["bcc_receiver"] = document.getElementById("bcc").value;
		saveObj["subject"] = document.getElementById("subject").value;
		saveObj["message"] = document.getElementById("contents").value;

        //console.log("--click--");
        //console.log(saveObj["bcc_receiver"]);
        //console.log(saveObj["subject"]);
        //console.log(saveObj["message"]);
        
		if(validate.isString(saveObj["bcc_receiver"])=== true) {	
			if(validate.isString(saveObj["subject"])=== true) {
				if(validate.isString(saveObj["message"])=== true) {
					 updateEmailTemplateInDB(saveObj); 
				}
				else {
					alert("Innehåll måste vara en sträng.");
					return;
				}
			}
			else {
				alert("Rubrik måste vara en sträng");
				return;
			}
			
		} else {
			alert("Dold mottagare måste vara en sträng");
			return;	
		}
	});


	/*-----------------------------------------------------------*/
	$("#resetTempl").click(function(){
	    /* 
	     * this function resets the template to default values
		*/
		
	   //console.log("---resetTempl----");
	   document.getElementById("email").value = "";
	   document.getElementById("bcc").value = configInDB["bcc_receiver"];   

       templMessage = "Nu är det dags för ny leverans av toalett och hushållspapper!\nOnsdag 3:e februari kl. 18-21 levererar vi, så lägg datumet på minnet.\n\
För att underlätta vår leverans är vi tacksamma om Du kan lämna alternativ leveransplats om Du inte är hemma, \
t.ex.\"lämna på bron\" eller \"ställ vid förrådet vid entrén\".\n\n\
För att ändra Din beställning eller om Du bytt adress, telefon eller mejl svara på detta mail (foreningsrullen@ibksundsvall.se). Vi noterar allt Du återkopplar i mejlet, \
även om Du inte får bekräftelse omedelbart.\n\n\
Senast torsdag 28:e januari vill vi ha ev. beställningsändringar mm.\nFörskottsbetala oss på Bankgiro 353-3775 \
eller via Swish 123 544 04 90 och ange Ditt kund nr. <%= KUNDNR %> som referens (viktigt!!).\n\n\
Priserna och din beställning för papperet är enligt följande:\n\n\
Produkt					Pris					Din beställning\n\n\
Serla Toa					160:-kr/säck			<%= SERLATOA %> st\n\
Serla HH					150:-kr/säck			<%= SERLAHH %> st\n\
Lambi Toa					180:-kr/säck			<%= LAMBITOA %> st\n\
Lambi HH					160:-kr/säck			<%= LAMBIHH %> st\n\
											Summa <%= SUMMA %> kr\n\n\
Under 2015 bytte vi namn på föreningen till det ursprungliga IBK Sundsvall. Barn och ungdomsverksamheten fortsätter i namnet Sundsvall City IBC. Vi samarbetar fortsättningsvis med Föreningsrullen då detta är ett bra sätt att stödja både seniorer och ungdomar i deras innebandyspelande.\n\n\
Vi tackar för Ditt stöd för vår verksamhet!\n\n\
IBK Sundsvall och Sundsvall City IBC";

		  document.getElementById("contents").value = templMessage;
		  document.getElementById("subject").value = "Bäste kund,";
    });

	/*-----------------------------------------------------------*/
	$("table").tablesorter({
	    /* 
	     * this is the table in the top of the page, 
	     * contaning the customers that are receiving E-mail 
		 */
		theme: 'blue',
		widgets: ['zebra', 'columnSelector', 'stickyHeaders'],
		widgetOptions : {
			// target the column selector markup
			columnSelector_container : $('#columnSelector'),
			// column status, true = display, false = hide
			// disable = do not display on list
			columnSelector_columns : {
				0: 'disable' /* set to disabled no allowed to unselect it */
			},
			// remember selected columns
			columnSelector_saveColumns: true,

			// container layout
			columnSelector_layout : '<label><input type="checkbox">{name}</label>',
			// data attribute containing column name to use in the selector container
			columnSelector_name  : 'data-selector-name',

			// Responsive Media Query settings
			// enable/disable mediaquery breakpoints
			columnSelector_mediaquery: true,
			// toggle checkbox name
			columnSelector_mediaqueryName: 'Auto: ',
			// breakpoints checkbox initial setting
			columnSelector_mediaqueryState: true,
			// responsive table hides columns with priority 1-6 at these breakpoints
			// see http://view.jquerymobile.com/1.3.2/dist/demos/widgets/table-column-toggle/#Applyingapresetbreakpoint
			// *** set to false to disable ***
			columnSelector_breakpoints : [ '20em', '30em', '40em', '50em', '60em', '70em' ],
			// data attribute containing column priority
			// duplicates how jQuery mobile uses priorities:
			// http://view.jquerymobile.com/1.3.2/dist/demos/widgets/table-column-toggle/
			columnSelector_priority : 'data-priority'
		}
	}); // tablesorter
	
	
	$("#bulkSend").click(function(){			
       /*
       * Function sending a bulk of E-mails 
       */

		readConfigurationFromDb(fillBulkEmailPageWithData);
		//     --reads the config
		//     -- then calls
		//     fillBulkEmailPageWithData(config) 
		//        -- sets the config (constant values here excludes the messege) in a global
		//        --  then calls
		//        readCustomerDataFromDB(tableFillInToo);
		//             -- bulk read of the customers
		//             -- then calls
		//             retrieveDocsFromDBresult(resultCustFromPouch,tableFillInToo);
		//                -- prepares the bulk docs of data for page
		//                -- then calls
		//                tableFillInToo(docsForWidget);  
		//                    -- prepares the customer dependent email data (selects the customers accepting E-mail)
		//                    -- then calls
		//                    readOrdersDataFromDbAndAddThem(custArr,tableFillInBulkEmails);
		//                        -- bulk read the the orders
		//                        -- then calls
		//                        tableFillInBulkEmails 
		//                           -- fixes the data for bulk emails  
		//
		//console.log("--- end bulkSend----");
	});
	
});  // function



$(document).ready(function() {
	/*
	 * loads the the table with order data (fillEmailPageWithData)
	 * fills in data in the E-mail template with config data and makes it possible to edit
	 */
	//console.log("calling fillEmailPageWithData");
	readConfigurationFromDb(fillEmailPageWithData);
	
});  // end ready



function clickOnRow(custid,email,lambihh,lambitoa,serlahh,serlatoa,totalcost) {
	/* 
	 * this function uses the table row to populate
	 * the template of the E-mail that is going to be sent 
	 * 
	 */	

	// fill in the template with data from row
	// location.assign("./customeredit2.html?customerid="+a,"UpdateWindow");
	// console.log(custid + " " + email);

	var _EMAIL = email;
	var _KUNDNR = custid;
	var _LAMBIHH = lambihh;
	var _LAMBITOA = lambitoa;

	var _SERLAHH = serlahh;
	var _SERLATOA = serlatoa;
	var _TOTALCOST= totalcost;

	// insert the form
	document.getElementById("email").value = _EMAIL;
	document.getElementById("subject").value = configInDB["subject"];

	var compiled = _.template(templMessage);

	document.getElementById("contents").value = 
		compiled({KUNDNR: _KUNDNR, SERLATOA: _SERLATOA, SERLAHH: _SERLAHH, LAMBITOA: _LAMBITOA, LAMBIHH: _LAMBIHH, SUMMA: _TOTALCOST});
}



function sendEmail(Obj,custid) {
	/* This function sends an E-mail to a mailer 
	 *  that in its turn sends the E-mail on to the SMTP server.
	 *  Input data is a Json object instead of a form.
	 */
	var mailerUrl = 'http://127.0.0.1:5000';
	//console.log("mailerUrl: "+mailerUrl);

	var formData = $.param(Obj);
	//console.log(formData);
	
	//$("#msg").append("Email sending Please wait.."+" ");

	var request = $.ajax({
		url: mailerUrl+'/send',
		type: 'POST',
		data: formData,
		dataType: 'html',
		success: function(result) {
			// $("#msg").empty().text(result);
			$("#msg").append(custid+": "+result+ " to "+Obj["email"]+"<br>");
			console.log("ok: "+result+"<br>");
		},
		error: function(e) {
			//$("#msg").empty().text("Error when sending email, Error code:"+e.status +", Error message:"+e.statusText);
			$("#msg").append(custid+": Error when sending email, Error code:"+e.status +", Error message:"+e.statusText+"<br>");
			console.log("not ok: "+e);
		},
		timeout: 60000
	}); // ajax

}

