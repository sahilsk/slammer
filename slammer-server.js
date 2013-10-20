var express = require("express");

var app = express()
  , http = require('http').createServer(app)
  , io = require('socket.io').listen(http);

var port = process.env.PORT || 5000;
//http.listen(port);

http.listen(port, function(){
	console.log("Listening on " +port);
});

app.use( "/js", express.static(__dirname + '/public/js'));
app.use( "/images", express.static(__dirname + '/public/images'));


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

var connectedUsers = new Array();


io.sockets.on('connection', function (client) {
	client.emit("status", {message:"You are connected to the server.", onlineUsers: connectedUsers});
	
	client.on("join", function(name){
		client.set("nick", name);
		console.log( "Client connected: " + name);
		connectedUsers.push( {name:name, id: client.id});
		client.broadcast.emit("new member", {nick:name, id:client.id, onlineUsers: connectedUsers});

	});
	
	client.on("message", function(message){
		client.get('nick', function(err, name){
			client.broadcast.emit("new message", {nick:name, message:message} );
			console.log( name + ": " + message);
		});
	});
	
	client.on("disconnect", function(data){
		var tmpArray = new Array();
		for( var k in connectedUsers){
			if( connectedUsers[k].id != client.id){
				tmpArray.push( connectedUsers[k]);
			}				
		}
		connectedUsers = tmpArray;	
		
		client.get('nick', function(err, name){
			
			client.broadcast.emit('leave', {nick:name, id:client.id, onlineUsers:connectedUsers });
			console.log( name + ": " + " disconnected.");
		});
	});
	
	
	
	
});