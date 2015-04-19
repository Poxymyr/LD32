var express = require('express');
var fs = require('fs');
var app = express();

var index = fs.readFileSync("index.html");

app.use('/', express.static(__dirname, '/public'));

app.get('/', function (req, res) {
  res.end(index);
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});