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
app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/brew_hook', function(request, response) {
  console.log(request.body);
  io.emit('brew_update', request.body);

  data = request.body.event + " " + request.body.data;
  response.sendStatus(200);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
