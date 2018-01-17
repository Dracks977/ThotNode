module.exports = function(socket, db,io,hasher, request){
   var rooms = db.collection('rooms');
   var users = db.collection('users');
   var Bot = require('./Bot.js');

   socket.on('NewRoom', function(data) {
      var rep = new Object();
      rep.status = false;
      rooms.insert({"imgs": [], "name": "Souvenir Perdu","date":"","ou":"","history":[], "tags":[],"date": new Date()}, function(err, res){
         if(!err){
            console.dir(res)
            rep.status = true;
            rep.id = res.insertedIds[0].toString();
            socket.join(res.insertedIds[0].toString());
            users.update({_id:ObjectId(data)},{ $push: { rooms: res.insertedIds[0].toString() } });
            users.findOne({_id:ObjectId(data)},function(err, ressss){
                rooms.update({_id:ObjectId(res.insertedIds[0].toString())},{ $push: { imgs: ressss.img}});
            })
         }
         socket.emit('NewRoom', rep);
         Bot.JoinConv(request, function(err, b){
            socket.body = b;
            socket.bn = 1;
            console.log("rom id : " + rep.id.toString());
            if(!err){
               Bot.SendMsg(request, b, {"room":rep.id.toString(), "msg":"hey"}, function(bod){
                  console.log("rom id : " + rep.id.toString());
                  if(bod){
                     test(1, request, b, rep.id.toString(), function(res){ 
                        io.sockets.in(rep.id.toString()).emit("NewMsg",res);
                     });
                  } else {console.log("SendMsg faill !!")}
               })
            } else {console.log("JoinConv faill!!!");console.log(err);}
         });
      })
   });

   /**
   * data = id de la room
   */
   socket.on("RoomInfo", function(data){
      rooms.findOne({_id:ObjectId(data)}, function(err, res){
         console.dir(res);
         var rep = new Object();
         rep.name = res.name;
         rep.ou = res.ou;
         rep.date = res.date;
         rep.img = [];
         
         rep.uimg = [];
         rep.tags = "";
         if(res.tags){
            rep.tags = res.tags.join(',');
         }
         if(res.imgs){
            rep.uimg = res.imgs;
         }
         if(res.history){
            for (var i in res.history){
               if (res.history[i].type == "picture"){
                  rep.img.push(res.history[i].msg);
               }
            }
         }
         rep.img.push("http://reasonsforjesus.com/wp-content/uploads/2015/10/thoth-2.jpg");
         socket.emit("RoomInfo", rep);
      })
   })

    // data.mail du mec a ajouter + data.room de la room
    socket.on("AddUserToRoom", function(data){
     users.update({mail:data.mail},{ $push: { rooms: data.room } },function(err, res){
       users.findOne({_id:ObjectId(data.mail)}, function(err,res){
         rooms.update({_id:ObjectId(data.room)},{ $push: { imgs: res.img}});
       })
       console.log(res);
       if(res){
          socket.emit('JoinRoom', data.room);
       }
    });
    
     
     socket.broadcast.to(data.mail).emit('JoinRoom', data);
  });

    socket.on("JoinRoom", function(data){
     socket.join(data.room);
     console.log("joinroom")
     console.dir(data)

  });

   /**
   * data = id de la room
   */
   socket.on("GetHistory", function(data){
      rooms.findOne({_id:ObjectId(data)}, function(err, res){
         if (res.history){
            socket.emit("GetHistory", res.history.slice(Math.max(res.history.length - 10, 1)));
         } else {
            socket.emit("GetHistory", null);
         }
      })
   })

	// data.room = room dans laquelle poste le msg data.msg le message
   // new Date().getTime()
   socket.on('SendMsg', function (data) {
      rep = new Object()
      users.findOne({_id:ObjectId(data.token)}, function(err, res){
         if (res){
            rep.pseudo = res.name[0] + ". " + res.surname;
            rep.id = hasher(data.token.toString(),2147483645);
            console.log(rep.id);
            rep.msg = data.msg;
            rep.type = data.type
            rep.img = res.img;
            rep.room = data.room
            console.log(rep.pseudo + " say : " + data.msg + " to : " + data.room);
            socket.broadcast.to(data.room).emit("NewMsg",rep);
            rooms.update({_id:ObjectId(data.room)},{ $push: { history: {img:rep.img, type:rep.type,id:rep.id,from:rep.pseudo,msg:rep.msg,time:new Date().getTime()} } });
            if(socket.body){
               socket.bn +=1;
               Bot.SendMsg(request, socket.body, {"room":rep.room, "msg":rep.msg}, function(bod){
                  console.log("rom id : " + rep.id.toString());
                  if(bod){
                     test(socket.bn, request, socket.body, rep.room, function(res){ 
                        io.sockets.in(rep.room).emit("NewMsg",res);
                        var rePattern = new RegExp(/ok, parfait,/g);
                        var str = res.msg
                        var arrMatches = str.match(rePattern);
                        if(arrMatches){
                           getLast(request,socket.body, function(reponse){
                              socket.body = null;
                              console.dir(reponse);
                              rooms.update({_id:ObjectId(rep.room)},{$set : {"name": reponse.name, "date": reponse.date, "ou": reponse.ou}});
                           })
                           

                        }
                     });
                  } else {console.log("SendMsg faill !!")}
               })
            }

            
         }
      })
   });

   function test(l, request, b, room, callback){
      setTimeout(function(){
         Bot.Getconv(request, b, function(err,res,oldbody){
            var longueur = 0;
            for( var key in res.activities ) {
               if( res.activities.hasOwnProperty(key) ) {
                  longueur += 1;
               }
            }
            console.log(l + " " + longueur)
            console.dir(res)
            if(longueur == l){
               test(l, request, b,callback);
            } else {
             rep = new Object()
             rep.pseudo = "G.Thoth"
             rep.id = hasher("ThothDieux",2147483645);
             console.dir(res.activities[longueur-1])
             rep.msg = res.activities[longueur-1].text
             rep.type = "text"
             rep.img = "http://46.105.92.233:993/1.jpg"
             rep.room = room
             rep.oldbody = oldbody;
             callback(rep);
          }
       })
      }, 1100);
   }

   function getLast(request, b, callback){
      Bot.Getconv(request, b, function(err,res,oldbody){
         var save = 0;
         var rep = new Object()
         for( var key in res.activities ) {
            if( res.activities.hasOwnProperty(key) ) {
               console.log(res.activities[key].from.id);
               if(res.activities[key].from.id != "EThoteo"){
                  if (save == 1) 
                   rep.name = res.activities[key].text;
                else if (save == 2)        
                   rep.date = res.activities[key].text
                else if (save == 3)
                   rep.ou = res.activities[key].text
                save++;
             }
          }
       }
       callback(rep);
    })
   }



}

