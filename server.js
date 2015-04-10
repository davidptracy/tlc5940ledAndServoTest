//===========================================================
//======================== EXPRESS ==========================
//===========================================================

var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app).listen(4000, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Listening at http://%s:%s', host, port);
});
var io = require('socket.io').listen(server);

//setup static file routing
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.render('index.html');
})

// var server = app.listen(4000, function () {

//   var host = server.address().address
//   var port = server.address().port

//   console.log('Example app listening at http://%s:%s', host, port)

// }) 

// include node mjpg-proxy
var MjpegProxy = require('mjpeg-proxy').MjpegProxy;

// setup a route to the proxy stream and generate the proxy
app.get('/stream.jpg', new MjpegProxy('http://128.122.6.53:8080/?action=stream').proxyRequest);


//========================================================
//=============== SOCKET.IO PORTION ======================
//========================================================

var gyroVals = [0,0,0];

var connectedSockets = [];

io.sockets.on('connection', function (socket){

	console.log("We have a new client: " + socket.id);

	//add it to the array of connected sockets
	connectedSockets.push(socket);

	// receives a random photo from a client
	socket.on('clientGyro', function(data){

		alpha = Math.floor(data[0]);
		beta = Math.floor(data[1]);
		gamma = Math.floor(data[2]);

		gyroVals[0] = map_range(alpha, 0, 360, 5, 175);
        gyroVals[1] = map_range(beta, -180, 180, 42, 175);
        gyroVals[2] = map_range(gamma, -180, 180, 5, 175);

		console.log("Received gyroVals from client: " + gyroVals);
		
		socket.broadcast.emit('inputVals', gyroVals);
		
	});

	socket.on('disconnect', function(){
		console.log("Client has disconnected!");
	})

});

//===========================================================
//===================== GLOBAL METHODS ======================
//===========================================================

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}