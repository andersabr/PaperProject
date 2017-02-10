var couchdbURL = 'http://'+localStorage.dbipaddress+':5984/';
var remoteDb = new PouchDB(couchdbURL+'remcust');


function check(form)/*function to check userid & password*/
{
	/*
	 * the following code checkes whether the entered userid and password are matching
	 */
	console.log('login to couch');
    var page = getQueryString('page');
    var customerid = getQueryString('customerid');
	remoteDb.login(form.userid.value, form.pswrd.value)
	.then(function(response) {
		console.log(response);

		if(page == 'custEdit6.html') {
			location.assign(page+'?customerid='+customerid);
		}
		else if (page == 'ordersEdit3.html') {
			location.assign(page+'?customerid='+customerid+'&orderskey=internal:'+customerid);
		} else {
	        location.assign(page); 		
		}
	})
	.catch(function (err) {
		console.log(err);
		$("#message").empty().text(err.message);
	})
}



