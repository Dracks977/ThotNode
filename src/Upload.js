module.exports = function(app, db, request){


	var Jimp = require("jimp");

	var subscriptionKey= "d0e9baebcfcc44e7825e77bbb424180c"

	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories, Description&language=en";

	var rooms = db.collection('rooms');

	app.post('/upload', function(req, res) {
		if (!req.files)
			return res.status(400).send('No files were uploaded.');
	  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
	  let file = req.files.img;
	  var datee = new Date().getTime();

	  // Use the mv() method to place the file somewhere on your server 
	  file.mv('public/' + datee + req.files.img.name, function(err) {
	  	if (err)
	  		return res.status(500).send(err);

	  	Jimp.read('public/' + datee + req.files.img.name, function (err, lenna) {
	  		if (err) throw err;
    lenna.resize(Jimp.AUTO, 600)            // resize 
         .quality(40)                 // set JPEG quality 
         .write('public/' + datee + req.files.img.name, function(){
         	console.log(datee + req.files.img.name)
         	res.send('/' + datee + req.files.img.name);
         	var urlconcat = "http://46.105.92.233:993/" + datee + req.files.img.name;
         	const body = {"url":urlconcat};
         	request({
         		url: uriBase,
         		headers: {
         			'Ocp-Apim-Subscription-Key': subscriptionKey
         		},
         		method: "POST",
         		json: true,   
         		body: body
         	}, function (error, response, body){
         		for(var i = 0; i != body.description.tags.length && i != 3; i++){
         			console.log(body.description.tags[i]);
         			rooms.update({_id:ObjectId(req.body.room)},{ $addToSet: { tags: body.description.tags[i] } });
         		}
         		
         	});
         }); // save 


     });
	  })
	});

	app.post('/user', function(req, res) {
		if (!req.files)
			return res.status(400).send('No files were uploaded.');
	  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
	  let file = req.files.img;
	  var datee = new Date().getTime();

	  // Use the mv() method to place the file somewhere on your server 
	  file.mv('public/' + datee + req.files.img.name, function(err) {
	  	if (err)
	  		return res.status(500).send(err);

	  	Jimp.read('public/' + datee + req.files.img.name, function (err, lenna) {
	  		if (err) throw err;
    lenna.resize(Jimp.AUTO, 600)            // resize 
         .quality(40)                 // set JPEG quality 
         .write('public/' + datee + req.files.img.name, function(){
         	console.log(datee + req.files.img.name)
         	res.send('/' + datee + req.files.img.name);
         }); // save 
     });
	  })
	});

}