/* nodemailer script for foreningsappen */
var debug = require('debug')('http');
var http = require('http');
var express = require('express');
var nodemailer = require("nodemailer");
var bodyParser = require('body-parser');
var app = express();
var port = Number(process.env.PORT || 5000);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));


// Home page
app.get('/mail.html',function(req,res){
    res.sendfile('mail.html');
});

// sending mail function
app.post('/send', function(req, res){
   console.log("callback at req: "+req);
if(req.body.email == "" || req.body.subject == "") {
  //console.log(res);
  //res.contentType('html');
  //res.set("Content-Type","text/html");
  res.status(200);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //res.set("Access-Control-Allow-Origin");
  //res.set("Access-Control-Allow-Methods");
  //res.set("Access-Control-Allow-Headers");
  res.send("Error: Email & Subject should not be blank");
  return true;
}
// Sending Email Without SMTP
console.log(req.body.bcc);
/*
nodemailer.mail({
    from: "Node Emailer  <no-reply@aol.com>", // sender address
    to: req.body.email, 							// list of receivers
    bcc: req.body.bcc,
    subject: req.body.subject+" ", 					// Subject line
    //text: "Hello world ", 						// plaintext body
    html: "<b>"+req.body.description+"</b>" 		// html body
});
res.send("Email has been sent successfully");
*/
    // Sending Emails with SMTP, Configuring SMTP settings

       var smtpTransport = nodemailer.createTransport("SMTP",{
             host: "smtp.gmail.com", // hostname
             secureConnection: true, // use SSL
             port: 465, // port for secure SMTP
             auth: {
                 user: 'konradkonsult@gmail.com',
                 pass: 'Fanab5197'
            }
        });
        var mailOptions = {
            from: "Föreningsrullen  <no-reply@gmail.com>", // sender address
            to: req.body.email, // list of receivers
            bcc: req.body.bcc,
            subject: req.body.subject+" ", // Subject line
            text: req.body.description
            //text: "Hello world ", // plaintext body
            //html: "<b>"+req.body.description+"</b>" // html body
        }

        smtpTransport.sendMail(mailOptions, function(error, response){
	    //console.log("sendMail callback");
	    res.status(200);
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		  //res.set("Access-Control-Allow-Origin");
		  //res.set("Access-Control-Allow-Methods");
		  //res.set("Access-Control-Allow-Headers");
        if(error){
			 console.log("send error");
             res.send("Email could not sent due to error: "+error);
        }else{
			 console.log("sent ok");
             res.send("Email has been sent successfully");
        }
    });
});

// Starting server
var server = http.createServer(app).listen(port, function() {
console.log("Listening on " + port);
});
