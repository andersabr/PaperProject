var couchdbURL = 'http://'+localStorage.dbipaddress+':5984/';
var remoteDb = new PouchDB(couchdbURL+'remcust');


function check(form)/*function to check userid & password*/
{
	/*
	 * the following code checkes whether the entered userid and password are matching
	 */
	console.log('login to couch');

	remoteDb.login(form.userid.value, form.pswrd.value)
	.then(function(response) {
		console.log(response);
		location.assign('configPage3.html');
	})
	.catch(function (err) {
		console.log(err);
		$("#message").empty().text(err.message);
	})
}

	



