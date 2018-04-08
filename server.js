var http = require('http');
var querystring = require('querystring');
var PythonShell = require('python-shell');
var firebase = require('firebase');

// Local requirement for auth
var login_info = require('./LoginInfo');

var server = http.createServer().listen(3000);

// Initialize the app
const firebaseConfig = {
  apiKey: "AIzaSyAJXp7SBUPGRTPo-5qYM-T78mP8DEuBsog",
  authDomain: "commune-265d9.firebaseapp.com",
  databaseURL: "https://commune-265d9.firebaseio.com",
  projectId: "commune-265d9",
  storageBucket: "commune-265d9.appspot.com",
  messagingSenderId: "697540841037"
};
firebase.initializeApp(firebaseConfig);

// Authenticate super user
firebase.auth().signInWithEmailAndPassword(login_info.username, login_info.password).catch(function(error) {
   console.log(error); 
});

server.on('request', function (req, res) {
    console.log("hit");
    if (req.method == 'POST') {
        var body = '';
    }
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function() {
        var post = querystring.parse(body);
	    var options = {
		    args: body,
		    pythonPath: '/usr/bin/python3',
		    scriptPath: '../machineLearning' 
	    };
	    PythonShell.run('runModel.py', options, function (err, results){
        	if (err) throw err;
            if (results){
                // Take the first 28 characters from the post request
                var userID = body.substring(0,28);
                firebase.database().ref('/users/' + userID).update({
                   traits: results[0] 
                });
            }
        	console.log('finished');
	    });

        /*PythonShell.on('message', function(message) {
            console.log(message);
        });*/
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    });
});

console.log('Listening on port 3000');
