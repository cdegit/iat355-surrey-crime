var express = require('express');
var app = express();
var http = require('http').Server(app);

app.get('/', function(req, res){
  	res.sendFile(__dirname + '/index.html');
});

app.get('/iris.csv', function(req, res){
  	res.sendFile(__dirname + '/iris.csv');
});

app.get('/d3.js', function(req, res){
  	res.sendFile(__dirname + '/d3.js');
});

app.get('/main.js', function(req, res){
  	res.sendFile(__dirname + '/main.js');
});

app.get('/styles.css', function(req, res){
  	res.sendFile(__dirname + '/styles.css');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});