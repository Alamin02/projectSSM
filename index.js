//require node modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var exphbs = require('express-handlebars');
var csvdata = require('csvdata');

var fs = require('fs');

//path variable
var home = require('./routes/home');
var monitor = require('./routes/monitor');
var stat = require('./routes/stat');

// Init App
var app = express();
//init IO
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
var client;

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//set routes
app.use('/', home);
app.use('/monitor', monitor);
app.use('/stat', stat);

// Set Port
app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), function(){
  console.log('Server started on port '+app.get('port'));
});

app.get('/dkh', function(){
	var time = getCurrentTime();
	var newData = time + ',1';
	fs.appendFile('public/data/data.csv', newData, function(err){
		if (err) throw err;
		console.log('check kor hoise kina');
	});
});


app.post('/request', function(req,res){
	console.log('request recieved...');
	console.log(req.body.msg);
	var level = (req.body.msg);
	var time = getCurrentTime();
	var newData = time + ',' + level;
	fs.appendFile('public/data/data.csv', newData, function(err){
		if (err) throw err;
		console.log('check kor hoise kina');
	});

	if(req.body.msg[0] != '-')
	   io.sockets.emit('sent new', {msg: req.body.msg});
});


//connect socket
io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Conneted: %s sockets connected', connections.length);


	//disconnect
	socket.on('disconnect', function(data){
    	connections.splice(connections.indexOf(socket), 1);
    	console.log('Disconnected: %s sockets connected', connections.length);
	});

	client = socket;
});

function getCurrentTime(){
	var date = new Date();
	var hours = date.getHours();
	  var minutes = date.getMinutes();
	  var seconds = date.getSeconds();
	  minutes = minutes < 10 ? '0'+minutes : minutes;
	  seconds = seconds < 10 ? '0'+seconds : seconds;
	  var strTime = hours + ':' + minutes + ':' + seconds;
	  return strTime;
}