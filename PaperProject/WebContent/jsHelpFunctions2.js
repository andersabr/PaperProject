
var mapImport = {
		"1":"_id",
		"2":"altdeliveryreceiver",
		"3":"altdeliveryaddress",
		"4":"altdistlist",
		"5":"billingaddress",
		"6":"cancelationday",
		"7":"city",
		"8":"comments",
		"9":"contactperson",
		"10":"customername",
		"11":"delivery",
		"12":"deliveryaddress",
		"13":"deliverycomment",
		"14":"distlist",
		"15":"emailaddress",
		"16":"mobile",
		"17":"orderskey",
		"18":"paymentmethod",
		"19":"phone",
		"20":"postalcode",
		"21":"salesperson",
		"22":"sendemail",
		"23":"team"
};

var mapImportget = function (k) {
	return mapImport[k];
};



var map = {
		"1":"team",
		"2":"contactperson",
		"3":"customername",
		"4":"deliveryaddress",
		"5":"distlist",
		"6":"postalcode",
		"7":"city",
		"8":"mobile",
		"9":"phone",
		"10":"sendemail",
		"11":"emailaddress",
		"12":"salesperson",
		"13":"cancelationday",
		"14":"comments",
		"15":"paymentmethod",
		"16":"delivery",
		"17":"deliverycomment",
		"18":"billingaddress",
		"19":"altdeliveryreceiver",
		"20":"altdeliveryaddress",
		"21":"altdistlist",
		"22":"orderskey"
};

var mapget = function (k) {
	return map[k];
};

	

	
function findFirstCustidNotUsed(customerData) {
	console.log("------findFirst ------- ");
	var customerid = "";

	var custobj = customerData;
	var i = 0;
	// look for first FPnnnn not used
	var found = false;
	out:
		if(!found) {
		  /*
			for(i=1;i<10;i++) {
				found = false;
				customerid = "FP000" + i;

				if(customerid in custobj) {
					found = true;
				}
				else {
					break out;
				}
			}

			for(i=10;i<100;i++) {
				found = false;
				customerid = "FP00" + i;

				if(customerid in custobj) {
					found = true;
				}
				else {
					break out;
				}
			}
			
			Do not pick anything below 500
			*/
			for(i=500;i<999;i++) {
				found = false;
				customerid = "FP0" + i;

				if(customerid in custobj) {
					found = true;
				}
				else {
					break out;
				}
			}
			for(i=1000;i<9999;i++) {
				found = false;
				customerid = "FP" + i;

				if(customerid in custobj) {
					found = true;
				}
				else {
					break out;
				}
			}
		} // end if !found
	return(customerid);
}



function findHighestNinOrder(obj) {
	var highestN = 0;
	/*
	 * console.log("findHighestNinOrder"); console.log(key);
	 * console.log(par[key]);
	 */
	for ( var name in obj) {
		if (name.charAt(0) == 'T') {
			// srip of first char and chaech for largets number
			var currentChar = name.substring(1);
			if (!isNaN(currentChar)) {
				if (currentChar > highestN) {
					highestN = currentChar;
				}
			}
		}
	}
	//console.log(highestN);
	return highestN;
}


/* read URL parameters
*/
var getQueryString = function ( field, url ) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
}

