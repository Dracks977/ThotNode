module.exports = function(socket, db,hasher){

 var users = db.collection('users');
 var rooms = db.collection('rooms');

 socket.on("login", function(data){
  var rep = new Object();
  rep.status = false;
  users.findOne({"mail":data.mail, "pass":data.pass}, function(err, res){
   if (res){
     rep.token = res._id;
     rep.id = hasher(rep.token.toString(),2147483645);
     console.log("id : " + rep.id);
     rep.status = true;
     rep.user = res;
     rep.img = res.img;
     socket._mid = res._id;
     socket.join(res.mail.toString());
   }
   console.dir(rep);
   socket.emit("login", rep);
 })
});

/**
* data = id de la room 
*/
socket.on("InfRoom", function(data){
 rooms.findOne({_id:ObjectId(data)}, function(err, res){
  var rep = new Object();
  rep.status = false;
  if (res){
    rep.status = true;
    rep.name = res.name
    rep.token = data;
    rep.last = "";
    rep.img = "https://back-thomascook.orchestra-platform.com/admin/TS/fckUserFiles/Content_Image/TC/TO_TC/MARKETING/HELIADES/voyage_partenaires_heliades_300_1.jpg";
    if(res.history){
      if(res.history[res.history.length-1]){
        rep.last = res.history[res.history.length-1].msg;
        console.log("=====>" + rep.last);
      }
      for (var i in res.history){
        if (res.history[i].type == "picture"){
          rep.img = res.history[i].msg;
        }
      }
    }
  }
  socket.emit("InfRoom", rep);
})
})

socket.on("GetUser", function(data){
  console.log("=============getuser===============");
  var rep = new Object();
  rep.status = false;
  users.findOne({_id:ObjectId(data)}, function(err, res){
   if (res){
    rep.token = res._id;
    rep.id = hasher(rep.token.toString(),2147483645);
    rep.status = true;
    rep.user = res;
    rep.img = res.img
    socket._mid = res._id;
    socket.join(res.mail.toString());
  }
  console.dir(rep);
  socket.emit("GetUser", rep);
})
});

socket.on("GetRooms", function(data){
  var rep = new Object();
  rep.status = false;
  console.log(data);
  users.findOne({_id:ObjectId(data)}, function(err, res){
   if (res){
    rep.status = true;
    rep.rooms = res.rooms;
    for(var i= 0; i < res.rooms.length; i++){
     console.log(data + " (join room) --> " + res.rooms[i])
     socket.join(res.rooms[i]);
   }
 }
 console.dir(res);
 socket.emit("GetRooms", rep);
})
});

socket.on("UpUser", function(data){
  users.update({_id:data.token},{ $set: { "name" : data.name, "img": data.img, "surname": data.surname } }, function(err, ress){
    socket.emit("UpUser", ress);
  })
})

socket.on("register", function(data){
  users.findOne({"mail":data.mail}, function(err, ress){
   var rep = new Object();
   rep.status = false;
   if (ress == null){
    users.insert({"img":"http://welovewords.com/system/documents/covers/000/087/182/square/point_interro_.jpg?1460063940",
      "name":data.name, "surname":data.surname, "mail":data.mail, "pass":data.pass, "rooms":[], "friends":[] , "date": new Date()}, function(err, res){
     rep.token = res.insertedIds[0];
     rep.id = hasher(rep.token.toString(),2147483645);
     rep.status = true;
     socket.emit("register", rep);
     socket.join(data.mail.toString());
     console.dir(res.insertedIds); 
   });
  } else {
    console.log("already register mail");
    socket.emit("register", rep);
  }
});




});
}