var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var Parse = require('parse/node').Parse;


var hubotDomain = process.env.HUBOT_DOMAIN;
var appId = process.env.APP_ID;
var jsKey = process.env.JS_KEY;
Parse.initialize(appId, jsKey);


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
  res.render('index', { title: 'The index page!' });
});

var cache;
var cacheExpires = new Date().getTime();

app.get('/stats', function(req, res){

  var now = new Date().getTime();

  if (cacheExpires <= now) { // Minimal cache solution
    var CoffeeObject = Parse.Object.extend("Coffee");
    var queryObject = new Parse.Query(CoffeeObject);
    queryObject.limit(10000);
    queryObject.find({
      success: function (results) {
        var overDays = {};
        var overWeekdays = {};
        var totCups = 0;
        console.log(results.length);
        for (var i = 0; i < results.length; i++) {
          var cups = results[i].get('cups');
          var d = new Date(results[i].createdAt);
          var dateStr = d.getFullYear() + '-' + ('0' + d.getMonth()).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);

          if (overDays[dateStr] === undefined) {
            overDays[dateStr] = 0;
          }
          if (overWeekdays[d.getDay()] === undefined) {
            overWeekdays[d.getDay()] = 0;
          }

          totCups += cups;
          overDays[dateStr] += cups;
          overWeekdays[d.getDay()] += cups;
          var coffeeArr = [];
        }
        cache =  {overDays: overDays, overWeekdays: overWeekdays, totCups: totCups};

        cacheExpires = new Date().getTime() + 1000 * 60 * 60; // Cache the parse data for 60 minutes
        res.render('stats', {data: cache });
      },
      error: function (error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  } else {
    res.render('stats', {data: cache });
  }

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
      request(hubotDomain + '/waterdraining');
      setTimeout(function() {
        stateCount = 0;
        brewing = false;

        var CoffeeObject = Parse.Object.extend("Coffee");
        var coffeeObject = new CoffeeObject();
        coffeeObject.save({cups: 7});

        io.emit('brew_update', JSON.stringify({ "brewing": brewing }));
        request(hubotDomain + '/donecoffee'); // Ping hubot webhook that the coffee is ready
      }, 240000);
    }, 10000);
  }

  res.sendStatus(200);
});

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on ' + (process.env.PORT || 5000));
});
