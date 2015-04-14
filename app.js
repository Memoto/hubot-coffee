var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var Parse = require('parse').Parse;

var state = {"brewing": false, "last_brew_completed": null};
var hubotDomain = "http://35fed9ba.ngrok.com";
Parse.initialize("0JTH1cWqPQZwm5qmJTGmXrxnakZELLy9gV5D8p56", "FddmGxeXELQgFLOne76Ys58QAGo7o3Q5lbdys2q8");

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

var stateCount = 0;
var timer;
var resetTimer;
var brewing = false;

app.post('/brew_hook', function(req, res) {

  stateCount++;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(function() {
    stateCount = 0;
    brewing = false;
  }, 60000);

  if (stateCount > 1) {
    if (brewing === false) {
      brewing = true;
      request(hubotDomain + '/brewingcoffee'); // Ping hubot webhook that the coffee is ready
    }

    clearTimeout(timer);
    timer = setTimeout(function() {
      stateCount = 0;
      brewing = false;

      var CoffeeObject = Parse.Object.extend("Coffee");
      var coffeeObject = new CoffeeObject();
      coffeeObject.save({cups: 7});

      request(hubotDomain + '/donecoffee'); // Ping hubot webhook that the coffee is ready
    }, 240000);
  }

  io.emit('brew_update', JSON.stringify(state));
  res.sendStatus(200);
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + (process.env.PORT || 5000));
});
