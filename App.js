var http = require('http').Server();
var io = require('socket.io')(http);
// a changer en recupe ce qu'il y a en base ^^
var MongoClient = require('mongodb').MongoClient
, assert = require('assert');
var url = 'mongodb://localhost:27017/thoteo';
ObjectId = require('mongodb').ObjectID;
var hasher = require('hash-index')
var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
app.use(fileUpload());
var request = require('request');




MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to db");

	io.on('connection', function(socket){

		require('./src/Chat.js')(socket, db,io,hasher, request);
		require('./src/Account.js')(socket, db,hasher);
		require('./src/Friends.js')(socket, db,hasher);

	});

	require('./src/Upload.js')(app, db, request);
});
app.use(express.static('public'));




http.listen(143, function(){
	console.log('listening on 143');
});
app.listen(993, function () {
	console.log('uploader run on 993!');
});