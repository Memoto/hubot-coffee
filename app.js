var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var data = {};

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send(data);
});

app.post('/brew_hook', function(request, response) {
  console.log(request.body);
  data = request.body.event + " " + request.body.data;
  response.sendStatus(200);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
