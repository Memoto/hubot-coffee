var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');

var state = {"brewing": false, "last_brew_completed": null};
var hubotDomain = "http://35fed9ba.ngrok.com";


io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('brew_update', JSON.stringify(state));
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/brewing', function(req, res){
  res.json({"brewing": state});
});

app.post('/brew_hook', function(req, res) {
  if((request.body.data == "false")) {
    state.brewing = false;
    state.last_brew_completed = new Date();
    request(hubotDomain + '/coffee'); // Ping hubot webhook that the coffee is ready
  } else {
    state.brewing = true;
  }
  io.emit('brew_update', JSON.stringify(state));

  res.sendStatus(200);
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + (process.env.PORT || 5000));
});
