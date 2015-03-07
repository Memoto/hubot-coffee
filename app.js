var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var data = {};

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/brew_hook', function(request, response) {
  console.log(request.body);
  io.emit('brew_update', JSON.stringify(request.body));

  data = request.body.event + " " + request.body.data;
  response.sendStatus(200);
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + (process.env.PORT || 5000));
});
