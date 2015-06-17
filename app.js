var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var Parse = require('parse').Parse;

var hubotDomain = "http://linkoping.nrtv.io:8889";
Parse.initialize("0JTH1cWqPQZwm5qmJTGmXrxnakZELLy9gV5D8p56", "FddmGxeXELQgFLOne76Ys58QAGo7o3Q5lbdys2q8");

var stateCount = 0;
var timer;
var resetTimer;
var brewing = false;

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('brew_update', JSON.stringify({ "brewing": brewing }));
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('index', { title: 'The index page!' })
});


app.get('/stats', function(req, res){

  var CoffeeObject = Parse.Object.extend("Coffee");
  var queryObject = new Parse.Query(CoffeeObject);
  queryObject.find({
    success: function (results) {
      var coffee = {};
      for (var i = 0; i < results.length; i++) {
        var cups = results[i].get('cups');
        var d = new Date(results[i].createdAt);
        var dateStr = d.getFullYear() + '-' + ('0' + d.getMonth()).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);

        if (coffee[dateStr] === undefined) {
          coffee[dateStr] = 0;
        }

        coffee[dateStr] = coffee[dateStr] + cups;
        var coffeeArr = [];
      }
      res.render('stats', { coffee: coffee });
    },
    error: function (error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });


  });

  app.get('/brewing', function(req, res){
    res.json(JSON.stringify({"brewing": brewing}));
  });

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
        io.emit('brew_update', JSON.stringify({ "brewing": brewing }));
        request(hubotDomain + '/brewingcoffee'); // Ping hubot webhook that the coffee is ready
      }

      clearTimeout(timer);
      timer = setTimeout(function() {
        stateCount = 0;
        brewing = false;

        var CoffeeObject = Parse.Object.extend("Coffee");
        var coffeeObject = new CoffeeObject();
        coffeeObject.save({cups: 7});

        io.emit('brew_update', JSON.stringify({ "brewing": brewing }));
        request(hubotDomain + '/donecoffee'); // Ping hubot webhook that the coffee is ready
      }, 240000);
    }

    res.sendStatus(200);
  });

  http.listen((process.env.PORT || 5000), function(){
    console.log('listening on ' + (process.env.PORT || 5000));
  });
