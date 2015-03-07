var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var brewing = false;

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('brew_update', brewing);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/brew_hook', function(request, response) {
  if((request.body.data == "false")) {
    brewing = false;
  } else {
    brewing = true;
  }
  io.emit('brew_update', brewing);

  response.sendStatus(200);
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + (process.env.PORT || 5000));
});
